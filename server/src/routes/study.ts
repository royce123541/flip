import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Deck } from '../models/Deck.js'
import { ReviewLog } from '../models/ReviewLog.js'
import { schedule, type Grade } from '../services/srs.js'

export const studyRouter = Router()
studyRouter.use(requireAuth)

const MAX_SESSION = 50
const GRADES: Grade[] = ['again', 'hard', 'good', 'easy']

/**
 * Cards to study. ?deckId= limits to one deck; ?all=1 includes cards that are
 * not due yet (cram mode). Due cards come first, soonest-due first.
 */
studyRouter.get('/queue', async (req: AuthedRequest, res) => {
  const deckId = typeof req.query.deckId === 'string' ? req.query.deckId : undefined
  if (deckId && !mongoose.isValidObjectId(deckId)) return res.status(400).json({ error: 'Invalid deck id' })

  const decks = await Deck.find({ ownerUid: req.user!.uid, ...(deckId ? { _id: deckId } : {}) })
  const includeAll = req.query.all === '1'
  const now = Date.now()

  const cards = decks.flatMap((d) =>
    d.cards
      .filter((c) => includeAll || c.due.getTime() <= now)
      .map((c) => ({
        id: c._id.toString(),
        deckId: d.id as string,
        deckTitle: d.title,
        front: c.front,
        back: c.back,
        due: c.due,
        // How long until the card returns for each grade (ms), so the buttons can show it.
        nextIn: Object.fromEntries(GRADES.map((g) => [g, schedule(c, g, new Date(now)).due.getTime() - now])) as Record<Grade, number>,
      })),
  )
  cards.sort((a, b) => a.due.getTime() - b.due.getTime())

  res.json({ total: cards.length, cards: cards.slice(0, MAX_SESSION) })
})

const reviewInput = z.object({
  deckId: z.string(),
  cardId: z.string(),
  grade: z.enum(['again', 'hard', 'good', 'easy']),
})

studyRouter.post('/review', async (req: AuthedRequest, res) => {
  const parsed = reviewInput.safeParse(req.body)
  if (!parsed.success || !mongoose.isValidObjectId(parsed.data.deckId)) {
    return res.status(400).json({ error: 'Invalid review' })
  }
  const { deckId, cardId, grade } = parsed.data

  const deck = await Deck.findOne({ _id: deckId, ownerUid: req.user!.uid })
  const card = deck?.cards.find((c) => c._id.toString() === cardId)
  if (!deck || !card) return res.status(404).json({ error: 'Card not found' })

  const prev = { ease: card.ease, interval: card.interval, reps: card.reps, due: card.due }
  card.set(schedule(card, grade))
  await deck.save()
  const log = await ReviewLog.create({ ownerUid: req.user!.uid, deckId: deck._id, cardId: card._id, grade, source: 'study', prev })
  res.json({ due: card.due, interval: card.interval, reviewId: log.id as string })
})

const UNDO_WINDOW_MS = 60 * 60 * 1000

/**
 * Takes back a study answer: restores the card's previous schedule and removes the log entry.
 * Only the most recent answer for that card, within an hour, can be undone.
 */
studyRouter.post('/undo', async (req: AuthedRequest, res) => {
  const reviewId = typeof req.body?.reviewId === 'string' ? req.body.reviewId : ''
  if (!mongoose.isValidObjectId(reviewId)) return res.status(400).json({ error: 'Invalid review id' })
  const uid = req.user!.uid

  const log = await ReviewLog.findOne({ _id: reviewId, ownerUid: uid, source: 'study' })
  if (!log?.prev) return res.status(404).json({ error: 'Nothing to undo' })
  if (Date.now() - log.at.getTime() > UNDO_WINDOW_MS) {
    return res.status(409).json({ error: 'That answer is too old to undo.', code: 'undo_expired' })
  }
  const newer = await ReviewLog.exists({ ownerUid: uid, cardId: log.cardId, at: { $gt: log.at } })
  if (newer) return res.status(409).json({ error: 'This card was answered again since then.', code: 'undo_stale' })

  const deck = await Deck.findOne({ _id: log.deckId, ownerUid: uid })
  const card = deck?.cards.find((c) => c._id.equals(log.cardId))
  if (!deck || !card) return res.status(404).json({ error: 'Card not found' })

  card.set({ ease: log.prev.ease, interval: log.prev.interval, reps: log.prev.reps, due: log.prev.due })
  await deck.save()
  await log.deleteOne()
  res.status(204).end()
})
