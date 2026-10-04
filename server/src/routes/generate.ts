import { Router, type Response } from 'express'
import multer from 'multer'
import { PDFParse } from 'pdf-parse'
import { z } from 'zod'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { GenerationError, generateCards, MAX_CARDS, MAX_INPUT_CHARS, MIN_INPUT_CHARS } from '../services/gemini.js'
import { refundGeneration, reserveGeneration } from '../services/quota.js'

export const generateRouter = Router()
generateRouter.use(requireAuth)

const MAX_PDF_BYTES = 10 * 1024 * 1024
const MAX_PDF_PAGES = 50
const MIN_PDF_TEXT_CHARS = 200

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
})

/** Reserves quota, runs generation, refunds on any failure, and sends the response. */
async function runGeneration(req: AuthedRequest, res: Response, text: string, extra: { truncated?: boolean } = {}) {
  const uid = req.user!.uid
  const user = await User.findOne({ uid })
  const plan = user?.plan ?? 'free'

  const reservation = await reserveGeneration(uid, plan)
  if (!reservation.ok) {
    return res.status(402).json({
      error: 'You have used all your AI generations for this month.',
      code: 'quota_exceeded',
      ai: { used: reservation.used, limit: reservation.limit },
    })
  }

  try {
    const cards = await generateCards(text, MAX_CARDS)
    res.json({ cards, truncated: !!extra.truncated, ai: { used: reservation.used, limit: reservation.limit } })
  } catch (err) {
    await refundGeneration(uid)
    if (err instanceof GenerationError) return res.status(err.status).json({ error: err.message, code: err.code })
    console.error('Unexpected generation error')
    res.status(500).json({ error: 'Something went wrong while generating cards.', code: 'ai_failed' })
  }
}

const textInput = z.object({ text: z.string().trim() })

generateRouter.post('/text', async (req: AuthedRequest, res) => {
  const parsed = textInput.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request' })

  const { text } = parsed.data
  if (text.length < MIN_INPUT_CHARS) {
    return res.status(400).json({ error: `Paste at least ${MIN_INPUT_CHARS} characters of notes.`, code: 'too_short' })
  }
  if (text.length > MAX_INPUT_CHARS) {
    return res.status(400).json({
      error: `That is too long (${text.length.toLocaleString()} characters). Limit is ${MAX_INPUT_CHARS.toLocaleString()}; split it into parts.`,
      code: 'too_long',
    })
  }
  await runGeneration(req, res, text)
})

generateRouter.post(
  '/pdf',
  // Pro gate runs before the upload is buffered
  async (req: AuthedRequest, res, next) => {
    const user = await User.findOne({ uid: req.user!.uid })
    if (user?.plan !== 'pro') {
      return res.status(403).json({ error: 'PDF upload is a Pro feature.', code: 'pro_required' })
    }
    next()
  },
  (req, res, next) =>
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'That PDF is larger than 10 MB.' : 'Upload failed.'
        return res.status(400).json({ error: message, code: 'bad_upload' })
      }
      if (err) return next(err)
      next()
    }),
  async (req: AuthedRequest, res) => {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'Attach a PDF file.', code: 'bad_upload' })

    let extracted: { text: string; total: number }
    const parser = new PDFParse({ data: new Uint8Array(file.buffer) })
    try {
      const result = await parser.getText({ first: MAX_PDF_PAGES })
      extracted = { text: result.text.trim(), total: result.total }
    } catch {
      return res.status(400).json({ error: 'Could not read that PDF. It may be corrupted or password-protected.', code: 'pdf_unreadable' })
    } finally {
      await parser.destroy().catch(() => undefined)
    }

    if (extracted.text.length < MIN_PDF_TEXT_CHARS) {
      return res.status(400).json({ error: 'This looks like a scanned PDF. Only text-based PDFs are supported.', code: 'pdf_scanned' })
    }

    const truncated = extracted.total > MAX_PDF_PAGES || extracted.text.length > MAX_INPUT_CHARS
    await runGeneration(req, res, extracted.text.slice(0, MAX_INPUT_CHARS), { truncated })
  },
)
