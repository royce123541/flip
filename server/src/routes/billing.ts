import { Router, type Request, type Response } from 'express'
import type Stripe from 'stripe'
import { config } from '../config.js'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { BillingUnavailableError, getStripe, syncCustomer } from '../services/stripe.js'

export const billingRouter = Router()
billingRouter.use(requireAuth)

function unavailable(res: Response) {
  return res.status(503).json({ error: 'Billing is not available right now.', code: 'billing_unavailable' })
}

/** Returns the user's Stripe customer id, creating one (race-safely) on first use. */
async function ensureCustomer(uid: string, email: string): Promise<string> {
  const stripe = getStripe()
  const existing = await User.findOne({ uid })
  if (existing?.stripeCustomerId) return existing.stripeCustomerId

  const customer = await stripe.customers.create({ email: email || undefined, metadata: { uid } })
  const claimed = await User.findOneAndUpdate(
    { uid, $or: [{ stripeCustomerId: null }, { stripeCustomerId: { $exists: false } }] },
    { $set: { stripeCustomerId: customer.id } },
    { new: true },
  )
  if (claimed) return customer.id

  // A concurrent request claimed first: use theirs and drop ours.
  await stripe.customers.del(customer.id).catch(() => undefined)
  const winner = await User.findOne({ uid })
  return winner!.stripeCustomerId!
}

billingRouter.post('/checkout', async (req: AuthedRequest, res) => {
  try {
    const { uid, email } = req.user!
    if (!config.STRIPE_PRO_PRICE_ID) return unavailable(res)

    const user = await User.findOne({ uid })
    if (user?.plan === 'pro') {
      return res.status(409).json({ error: 'You already have an active Pro subscription.', code: 'already_subscribed' })
    }

    const customer = await ensureCustomer(uid, email)
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      customer,
      client_reference_id: uid,
      line_items: [{ price: config.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      subscription_data: { metadata: { uid } },
      allow_promotion_codes: true,
      success_url: `${config.CLIENT_ORIGIN}/billing/success`,
      cancel_url: `${config.CLIENT_ORIGIN}/billing/cancel`,
    })
    res.json({ url: session.url })
  } catch (err) {
    if (err instanceof BillingUnavailableError) return unavailable(res)
    console.error('Checkout error')
    res.status(502).json({ error: 'Could not start checkout. Please try again.', code: 'checkout_failed' })
  }
})

billingRouter.post('/portal', async (req: AuthedRequest, res) => {
  try {
    const user = await User.findOne({ uid: req.user!.uid })
    if (!user?.stripeCustomerId) return res.status(400).json({ error: 'No billing account yet.', code: 'no_customer' })

    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${config.CLIENT_ORIGIN}/account`,
    })
    res.json({ url: session.url })
  } catch (err) {
    if (err instanceof BillingUnavailableError) return unavailable(res)
    console.error('Portal error')
    res.status(502).json({ error: 'Could not open the billing portal. Please try again.', code: 'portal_failed' })
  }
})

const PRICE_CACHE_MS = 10 * 60 * 1000
let priceCache: { at: number; body: { amount: number; currency: string; interval: string; label: string } } | null = null

/**
 * Public: the Pro price as configured in Stripe, so the pricing page always shows what people
 * are actually charged. Cached for 10 minutes to avoid a Stripe call on every page view.
 */
export async function proPrice(_req: Request, res: Response) {
  if (priceCache && Date.now() - priceCache.at < PRICE_CACHE_MS) return res.json(priceCache.body)
  try {
    if (!config.STRIPE_PRO_PRICE_ID) return unavailable(res)
    const price = await getStripe().prices.retrieve(config.STRIPE_PRO_PRICE_ID)
    const amount = price.unit_amount ?? 0
    const major = amount / 100
    const money = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: price.currency.toUpperCase(),
      minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
    }).format(major)
    const interval = price.recurring?.interval ?? 'month'
    const count = price.recurring?.interval_count ?? 1
    const per = count === 1 ? interval : `${count} ${interval}s`
    const body = { amount, currency: price.currency, interval: per, label: `${money}/${per}` }
    priceCache = { at: Date.now(), body }
    res.json(body)
  } catch (err) {
    if (err instanceof BillingUnavailableError) return unavailable(res)
    console.error('Price lookup failed')
    res.status(502).json({ error: 'Could not load the price.', code: 'price_failed' })
  }
}

const customerOf = (obj: { customer?: string | { id: string } | null }) =>
  typeof obj.customer === 'string' ? obj.customer : obj.customer?.id

/**
 * Stripe webhook. Must be mounted with express.raw() BEFORE express.json(),
 * because signature verification needs the exact bytes Stripe sent.
 */
export async function stripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature']
  if (!config.STRIPE_WEBHOOK_SECRET || typeof signature !== 'string') return res.status(400).end()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(req.body, signature, config.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).send('Invalid signature')
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customer = customerOf(session)
        // Safety net: make sure the customer is linked to the Firebase user.
        if (customer && session.client_reference_id) {
          await User.updateOne(
            { uid: session.client_reference_id, stripeCustomerId: { $in: [null, customer] } },
            { $set: { stripeCustomerId: customer } },
          )
        }
        if (customer) await syncCustomer(customer)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const customer = customerOf(event.data.object)
        if (customer) await syncCustomer(customer)
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const customer = customerOf(event.data.object)
        if (customer) await syncCustomer(customer)
        break
      }
    }
    res.json({ received: true })
  } catch {
    // 5xx makes Stripe retry later
    console.error('Webhook handler failed for', event.type)
    res.status(500).end()
  }
}
