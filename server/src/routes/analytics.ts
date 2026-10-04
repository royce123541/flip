import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Deck } from '../models/Deck.js'
import { QuizAttempt } from '../models/QuizAttempt.js'
import { ReviewLog } from '../models/ReviewLog.js'
import { User } from '../models/User.js'

export const analyticsRouter = Router()
analyticsRouter.use(requireAuth)

const DAY_MS = 24 * 60 * 60 * 1000
const MASTERED_INTERVAL_DAYS = 21
const TREND_DAYS = 30
const ACTIVITY_DAYS = 14
const STREAK_LOOKBACK_DAYS = 400

/** Falls back to UTC for anything that is not a valid IANA zone. */
function safeTimeZone(input: unknown): string {
  if (typeof input !== 'string') return 'UTC'
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: input })
    return input
  } catch {
    return 'UTC'
  }
}

const dayKey = (date: Date, timeZone: string) => date.toLocaleDateString('en-CA', { timeZone }) // YYYY-MM-DD
const shiftDay = (key: string, days: number) => new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)

/** Current streak (counting today, or yesterday if you have not studied yet today) and longest streak. */
export function computeStreaks(activeDays: Set<string>, today: string) {
  let current = 0
  let cursor = activeDays.has(today) ? today : shiftDay(today, -1)
  while (activeDays.has(cursor)) {
    current++
    cursor = shiftDay(cursor, -1)
  }

  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const day of [...activeDays].sort()) {
    run = prev && shiftDay(prev, 1) === day ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = day
  }
  return { current, longest }
}

analyticsRouter.get('/', async (req: AuthedRequest, res) => {
  const uid = req.user!.uid
  const timeZone = safeTimeZone(req.query.tz)
  const now = new Date()

  const [user, decks, overall] = await Promise.all([
    User.findOne({ uid }),
    Deck.find({ ownerUid: uid }),
    QuizAttempt.aggregate<{ score: number; total: number; count: number }>([
      { $match: { ownerUid: uid } },
      { $group: { _id: null, score: { $sum: '$score' }, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
  ])

  const cards = decks.flatMap((d) => d.cards)
  const basic = {
    totalCards: cards.length,
    dueCards: cards.filter((c) => c.due.getTime() <= now.getTime()).length,
    quizzesTaken: overall[0]?.count ?? 0,
    accuracy: overall[0]?.total ? overall[0].score / overall[0].total : null,
  }

  // The paywall is enforced here, not just in the UI: free users never receive Pro data.
  if (user?.plan !== 'pro') return res.json({ full: false, ...basic })

  const dayOf = (field: string) => ({ $dateToString: { format: '%Y-%m-%d', date: field, timezone: timeZone } })

  const [trendRows, activityRows] = await Promise.all([
    QuizAttempt.aggregate<{ _id: string; score: number; total: number }>([
      { $match: { ownerUid: uid, createdAt: { $gte: new Date(now.getTime() - TREND_DAYS * DAY_MS) } } },
      { $group: { _id: dayOf('$createdAt'), score: { $sum: '$score' }, total: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
    ReviewLog.aggregate<{ _id: string; count: number }>([
      { $match: { ownerUid: uid, at: { $gte: new Date(now.getTime() - STREAK_LOOKBACK_DAYS * DAY_MS) } } },
      { $group: { _id: dayOf('$at'), count: { $sum: 1 } } },
    ]),
  ])

  const today = dayKey(now, timeZone)
  const perDay = new Map(activityRows.map((r) => [r._id, r.count]))

  const mastery = decks.map((d) => {
    const mastered = d.cards.filter((c) => c.interval >= MASTERED_INTERVAL_DAYS).length
    const notLearned = d.cards.filter((c) => c.reps === 0).length
    return {
      deckId: d.id as string,
      title: d.title,
      total: d.cards.length,
      mastered,
      learning: d.cards.length - mastered - notLearned,
      notLearned,
    }
  })

  res.json({
    full: true,
    ...basic,
    streak: computeStreaks(new Set(perDay.keys()), today),
    accuracyTrend: trendRows.map((r) => ({ date: r._id, accuracy: r.total ? r.score / r.total : 0, questions: r.total })),
    reviewsPerDay: Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
      const date = shiftDay(today, i - (ACTIVITY_DAYS - 1))
      return { date, count: perDay.get(date) ?? 0 }
    }),
    mastery,
    masteredAfterDays: MASTERED_INTERVAL_DAYS,
  })
})
