import { Router, type Request, type Response } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Deck } from '../models/Deck.js'

export const decksRouter = Router()
decksRouter.use(requireAuth)

const cardInput = z.object({
  id: z.string().optional(),
  front: z.string().trim().min(1).max(1000),
  back: z.string().trim().min(1).max(1000),
  distractors: z.array(z.string().trim().min(1).max(1000)).max(3).default([]),
})

const deckInput = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(''),
  cards: z.array(cardInput).max(500).default([]),
})

type DeckDoc = InstanceType<typeof Deck>

function serialize(deck: DeckDoc) {
  return {
    id: deck.id as string,
    title: deck.title,
    description: deck.description,
    createdAt: deck.get('createdAt'),
    updatedAt: deck.get('updatedAt'),
    cards: deck.cards.map((c) => ({
      id: c._id.toString(),
      front: c.front,
      back: c.back,
      distractors: c.distractors,
      due: c.due,
    })),
  }
}

function summary(deck: DeckDoc) {
  const now = Date.now()
  return {
    id: deck.id as string,
    title: deck.title,
    description: deck.description,
    cardCount: deck.cards.length,
    dueCount: deck.cards.filter((c) => c.due.getTime() <= now).length,
    updatedAt: deck.get('updatedAt'),
  }
}

/** Loads a deck owned by the caller, or sends 400/404 and returns null. */
async function findOwned(req: Request, res: Response) {
  const id = String(req.params.id)
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid deck id' })
    return null
  }
  const deck = await Deck.findOne({ _id: id, ownerUid: (req as AuthedRequest).user!.uid })
  if (!deck) res.status(404).json({ error: 'Deck not found' })
  return deck
}

function parse<T extends z.ZodType>(schema: T, body: unknown, res: Response): z.infer<T> | null {
  const result = schema.safeParse(body)
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', issues: result.error.issues })
    return null
  }
  return result.data
}

decksRouter.get('/', async (req: AuthedRequest, res) => {
  const decks = await Deck.find({ ownerUid: req.user!.uid }).sort({ updatedAt: -1 })
  res.json(decks.map(summary))
})

decksRouter.post('/', async (req: AuthedRequest, res) => {
  const data = parse(deckInput, req.body, res)
  if (!data) return
  const deck = await Deck.create({
    ownerUid: req.user!.uid,
    title: data.title,
    description: data.description,
    cards: data.cards.map(({ id: _id, ...c }) => c),
  })
  res.status(201).json(serialize(deck))
})

decksRouter.get('/:id', async (req, res) => {
  const deck = await findOwned(req, res)
  if (deck) res.json(serialize(deck))
})

decksRouter.put('/:id', async (req, res) => {
  const data = parse(deckInput, req.body, res)
  if (!data) return
  const deck = await findOwned(req, res)
  if (!deck) return

  // Keep scheduling state for cards that already existed; new cards start fresh.
  const existing = new Map(deck.cards.map((c) => [c._id.toString(), c]))
  deck.title = data.title
  deck.description = data.description
  deck.set(
    'cards',
    data.cards.map((c) => {
      const prev = c.id ? existing.get(c.id) : undefined
      const fields = { front: c.front, back: c.back, distractors: c.distractors }
      return prev ? { ...prev.toObject(), ...fields } : fields
    }),
  )
  await deck.save()
  res.json(serialize(deck))
})

decksRouter.delete('/:id', async (req, res) => {
  const deck = await findOwned(req, res)
  if (!deck) return
  await deck.deleteOne()
  res.status(204).end()
})

const cardTextInput = z.object({
  front: z.string().trim().min(1).max(1000),
  back: z.string().trim().min(1).max(1000),
})

/** Edits one card's text (e.g. fixing a typo mid-study). Its schedule and wrong answers are kept. */
decksRouter.patch('/:id/cards/:cardId', async (req, res) => {
  const data = parse(cardTextInput, req.body, res)
  if (!data) return
  const deck = await findOwned(req, res)
  if (!deck) return
  const card = deck.cards.find((c) => c._id.toString() === String(req.params.cardId))
  if (!card) return res.status(404).json({ error: 'Card not found' })

  card.front = data.front
  card.back = data.back
  // A wrong answer that now equals the correct answer would make the quiz unfair.
  card.distractors = card.distractors.filter((d) => d !== data.back)
  await deck.save()
  res.json({ id: card._id.toString(), front: card.front, back: card.back })
})

decksRouter.post('/:id/duplicate', async (req: AuthedRequest, res) => {
  const deck = await findOwned(req, res)
  if (!deck) return
  const copy = await Deck.create({
    ownerUid: req.user!.uid,
    title: `${deck.title} (copy)`.slice(0, 120),
    description: deck.description,
    cards: deck.cards.map((c) => ({ front: c.front, back: c.back, distractors: c.distractors })),
  })
  res.status(201).json(serialize(copy))
})
