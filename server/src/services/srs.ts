export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface SrsState {
  ease: number
  interval: number // days
  reps: number
  due: Date
}

const MIN_EASE = 1.3
const AGAIN_DELAY_MS = 10 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

// SM-2 quality scores per grade
const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 }

/** Simplified SM-2: returns the next scheduling state for a card after a review. */
export function schedule(card: SrsState, grade: Grade, now = new Date()): SrsState {
  const q = QUALITY[grade]
  const ease = Math.max(MIN_EASE, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))

  if (grade === 'again') {
    return { ease, interval: 0, reps: 0, due: new Date(now.getTime() + AGAIN_DELAY_MS) }
  }

  const reps = card.reps + 1
  let interval: number
  if (reps === 1) interval = { hard: 1, good: 1, easy: 3 }[grade]
  else if (reps === 2) interval = { hard: 3, good: 6, easy: 8 }[grade]
  else {
    const mult = { hard: 0.8, good: 1, easy: 1.3 }[grade]
    interval = Math.max(card.interval + 1, Math.round(card.interval * ease * mult))
  }

  return { ease, interval, reps, due: new Date(now.getTime() + interval * DAY_MS) }
}
