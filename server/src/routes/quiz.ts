import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Deck } from '../models/Deck.js'
import { QuizAttempt } from '../models/QuizAttempt.js'
import { ReviewLog } from '../models/ReviewLog.js'
import { schedule } from '../services/srs.js'

export const quizRouter = Router()
quizRouter.use(requireAuth)

const OPTIONS_PER_QUESTION = 4

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Builds a quiz from a deck. Wrong answers come from the card's own
 * distractors first, then are topped up with other cards' backs.
 * Cards that still can't reach 4 options are skipped.
 */
quizRouter.get('/:deckId', async (req: AuthedRequest, res) => {
  const { deckId } = req.params
  if (!mongoose.isValidObjectId(deckId)) return res.status(400).json({ error: 'Invalid deck id' })

  const deck = await Deck.findOne({ _id: deckId, ownerUid: req.user!.uid })
  if (!deck) return res.status(404).json({ error: 'Deck not found' })

  const backs = [...new Set(deck.cards.map((c) => c.back))]
  const questions = deck.cards.flatMap((c) => {
    const wrong = new Set(c.distractors.filter((d) => d !== c.back))
    for (const b of shuffle(backs)) {
      if (wrong.size >= OPTIONS_PER_QUESTION - 1) break
      if (b !== c.back) wrong.add(b)
    }
    if (wrong.size < OPTIONS_PER_QUESTION - 1) return []
    const options = shuffle([c.back, ...[...wrong].slice(0, OPTIONS_PER_QUESTION - 1)])
    return [{ cardId: c._id.toString(), question: c.front, options, correctIndex: options.indexOf(c.back) }]
  })

  if (questions.length === 0) {
    return res.status(400).json({ error: 'A quiz needs at least 4 cards with different answers, or custom wrong answers.' })
  }

  const requested = req.query.count === 'all' ? questions.length : Math.max(1, Number(req.query.count) || 10)
  res.json({ deckId: deck.id, title: deck.title, questions: shuffle(questions).slice(0, requested) })
})

const submitInput = z.object({
  answers: z.array(z.object({ cardId: z.string(), chosen: z.string().max(1000) })).min(1).max(500),
})

/** Grades on the server (never trusts client correctness), saves the attempt, and feeds the scheduler. */
quizRouter.post('/:deckId/submit', async (req: AuthedRequest, res) => {
  const { deckId } = req.params
  const parsed = submitInput.safeParse(req.body)
  if (!parsed.success || !mongoose.isValidObjectId(deckId)) return res.status(400).json({ error: 'Invalid submission' })

  const deck = await Deck.findOne({ _id: deckId, ownerUid: req.user!.uid })
  if (!deck) return res.status(404).json({ error: 'Deck not found' })

  const answers = parsed.data.answers.flatMap(({ cardId, chosen }) => {
    const card = deck.cards.find((c) => c._id.toString() === cardId)
    if (!card) return [] // card deleted mid-quiz
    const correct = chosen === card.back
    card.set(schedule(card, correct ? 'good' : 'again'))
    return [{ cardId: card._id, chosen, correct, front: card.front, back: card.back }]
  })
  if (answers.length === 0) return res.status(400).json({ error: 'No valid answers' })

  await deck.save()
  await ReviewLog.insertMany(
    answers.map((a) => ({ ownerUid: req.user!.uid, deckId: deck._id, cardId: a.cardId, grade: a.correct ? 'good' : 'again', source: 'quiz' })),
  )
  const attempt = await QuizAttempt.create({
    ownerUid: req.user!.uid,
    deckId: deck._id,
    answers,
    score: answers.filter((a) => a.correct).length,
    total: answers.length,
  })
  res.status(201).json({ id: attempt.id })
})

quizRouter.get('/attempts/:id', async (req: AuthedRequest, res) => {
  const { id } = req.params
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid attempt id' })

  const attempt = await QuizAttempt.findOne({ _id: id, ownerUid: req.user!.uid })
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' })

  res.json({
    id: attempt.id,
    deckId: attempt.deckId.toString(),
    score: attempt.score,
    total: attempt.total,
    createdAt: attempt.get('createdAt'),
    answers: attempt.answers.map((a) => ({ chosen: a.chosen, correct: a.correct, front: a.front, back: a.back })),
  })
})
