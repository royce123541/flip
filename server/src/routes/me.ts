import { Router } from 'express'
import { getAuth } from 'firebase-admin/auth'
import { config } from '../config.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { Deck } from '../models/Deck.js'
import { QuizAttempt } from '../models/QuizAttempt.js'
import { ReviewLog } from '../models/ReviewLog.js'
import { User } from '../models/User.js'
import { BillingUnavailableError, getStripe } from '../services/stripe.js'

/** Deleting an account requires having signed in within this window. */
const RECENT_LOGIN_SECONDS = 5 * 60

export const meRouter = Router()

meRouter.get('/', requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findOne({ uid: req.user!.uid }).lean()
  if (!user) return res.status(404).json({ error: 'User not found' })

  const period = new Date().toISOString().slice(0, 7)
  const used = user.aiPeriod === period ? user.aiUsed : 0
  res.json({
    uid: user.uid,
    email: user.email,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
    hasBillingAccount: !!user.stripeCustomerId,
    ai: { used, limit: user.plan === 'pro' ? null : config.FREE_MONTHLY_AI_LIMIT },
  })
})

/**
 * Permanently deletes the account. Order matters:
 * 1. Stripe first. If that fails, stop, so nobody keeps paying for an account that no longer exists.
 * 2. App data (decks, attempts, review history, user record).
 * 3. The Firebase login last.
 */
meRouter.delete('/', requireAuth, async (req: AuthedRequest, res) => {
  const { uid, authTime } = req.user!
  if (Date.now() / 1000 - authTime > RECENT_LOGIN_SECONDS) {
    return res.status(403).json({ error: 'Please confirm it is you by signing in again.', code: 'reauth_required' })
  }

  const user = await User.findOne({ uid })

  if (user?.stripeCustomerId) {
    try {
      // Deleting the customer cancels all of its subscriptions immediately (no further charges).
      await getStripe().customers.del(user.stripeCustomerId)
    } catch (err) {
      const alreadyGone = (err as { code?: string }).code === 'resource_missing'
      if (!alreadyGone) {
        if (!(err instanceof BillingUnavailableError)) console.error('Stripe customer deletion failed')
        return res.status(502).json({
          error: 'Could not cancel your subscription, so nothing was deleted. Please try again.',
          code: 'billing_cancel_failed',
        })
      }
    }
  }

  await Promise.all([
    Deck.deleteMany({ ownerUid: uid }),
    QuizAttempt.deleteMany({ ownerUid: uid }),
    ReviewLog.deleteMany({ ownerUid: uid }),
  ])
  await User.deleteOne({ uid })

  try {
    await getAuth().deleteUser(uid)
  } catch (err) {
    if ((err as { code?: string }).code !== 'auth/user-not-found') {
      console.error('Firebase user deletion failed')
      return res.status(500).json({
        error: 'Your data was deleted, but your login could not be removed. Please try again.',
        code: 'auth_delete_failed',
      })
    }
  }

  res.status(204).end()
})
