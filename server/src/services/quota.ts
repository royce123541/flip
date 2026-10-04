import { config } from '../config.js'
import { User } from '../models/User.js'

/** Soft fair-use ceiling for Pro ("unlimited" in marketing copy, bounded to cap abuse/cost). */
export const PRO_MONTHLY_LIMIT = 300

export const currentPeriod = () => new Date().toISOString().slice(0, 7) // YYYY-MM, UTC

export type Reservation =
  | { ok: true; used: number; limit: number | null }
  | { ok: false; reason: 'quota_exceeded'; used: number; limit: number }

/**
 * Atomically reserves one AI generation for the user. Call refund() if the
 * generation fails so failures never consume quota.
 */
export async function reserveGeneration(uid: string, plan: 'free' | 'pro'): Promise<Reservation> {
  const period = currentPeriod()
  const limit = plan === 'pro' ? PRO_MONTHLY_LIMIT : config.FREE_MONTHLY_AI_LIMIT

  // New month: reset the counter (no-op if already current).
  await User.updateOne({ uid, aiPeriod: { $ne: period } }, { $set: { aiPeriod: period, aiUsed: 0 } })

  const updated = await User.findOneAndUpdate(
    { uid, aiPeriod: period, aiUsed: { $lt: limit } },
    { $inc: { aiUsed: 1 } },
    { new: true },
  )
  if (!updated) {
    const user = await User.findOne({ uid })
    return { ok: false, reason: 'quota_exceeded', used: user?.aiUsed ?? limit, limit }
  }
  return { ok: true, used: updated.aiUsed, limit: plan === 'pro' ? null : limit }
}

export async function refundGeneration(uid: string) {
  await User.updateOne({ uid, aiPeriod: currentPeriod(), aiUsed: { $gt: 0 } }, { $inc: { aiUsed: -1 } })
}
