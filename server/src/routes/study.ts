import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Deck } from '../models/Deck.js'
import { ReviewLog } from '../models/ReviewLog.js'
import { schedule } from '../services/srs.js'

export const studyRouter = Router()
studyRouter.use(requireAuth)

const MAX_SESSION = 50

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
      .map((c) => ({ id: c._id.toString(), deckId: d.id as string, deckTitle: d.title, front: c.front, back: c.back, due: c.due })),
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

  card.set(schedule(card, grade))
  await deck.save()
  await ReviewLog.create({ ownerUid: req.user!.uid, deckId: deck._id, cardId: card._id, grade, source: 'study' })
  res.json({ due: card.due, interval: card.interval })
})
