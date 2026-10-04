import Stripe from 'stripe'
import { config } from '../config.js'
import { User } from '../models/User.js'

export class BillingUnavailableError extends Error {}

let client: Stripe | undefined
export function getStripe(): Stripe {
  if (!config.STRIPE_SECRET_KEY) throw new BillingUnavailableError('Billing is not configured.')
  return (client ??= new Stripe(config.STRIPE_SECRET_KEY))
}

const LIVE = ['active', 'trialing', 'past_due'] as const
const ENDED = ['canceled', 'unpaid', 'incomplete_expired']

/**
 * Makes the user's plan reflect Stripe's current truth for a customer.
 *
 * Webhook events can arrive out of order or be retried, so instead of trusting
 * the event payload we always re-read the customer's subscriptions. This makes
 * every handler idempotent and order-independent.
 */
export async function syncCustomer(customerId: string) {
  // No user owns this customer (e.g. the account was deleted): nothing to sync, and
  // returning normally stops Stripe from retrying the webhook.
  if (!(await User.exists({ stripeCustomerId: customerId }))) return

  const subs = await getStripe().subscriptions.list({ customer: customerId, status: 'all', limit: 20 })

  const live = subs.data
    .filter((s) => (LIVE as readonly string[]).includes(s.status))
    // an active subscription wins over a past_due one
    .sort((a, b) => Number(a.status === 'past_due') - Number(b.status === 'past_due'))[0]

  if (live) {
    const periodEnd = live.items.data[0]?.current_period_end
    await User.updateOne(
      { stripeCustomerId: customerId },
      {
        plan: 'pro',
        // past_due keeps Pro while Stripe retries the payment; the UI shows a banner
        subscriptionStatus: live.status === 'past_due' ? 'past_due' : 'active',
        currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
        cancelAtPeriodEnd: live.cancel_at_period_end || live.cancel_at != null,
      },
    )
    return
  }

  // Only downgrade for subscriptions that actually ended. An `incomplete`
  // subscription (first payment still pending) must not change anything.
  if (subs.data.some((s) => ENDED.includes(s.status))) {
    await User.updateOne(
      { stripeCustomerId: customerId },
      { plan: 'free', subscriptionStatus: 'canceled', cancelAtPeriodEnd: false, $unset: { currentPeriodEnd: '' } },
    )
  }
}
