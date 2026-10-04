import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Only ever navigate to Stripe-hosted pages, whatever the server returns.
const STRIPE_HOSTS = new Set(['checkout.stripe.com', 'billing.stripe.com'])

function goToStripe(url: string | null) {
  const parsed = url ? new URL(url) : null
  if (!parsed || parsed.protocol !== 'https:' || !STRIPE_HOSTS.has(parsed.hostname)) {
    throw new Error('Unexpected redirect from the billing service.')
  }
  window.location.assign(parsed.toString())
}

export const useCheckout = () =>
  useMutation({
    mutationFn: async () => goToStripe((await api<{ url: string | null }>('/billing/checkout', { method: 'POST' })).url),
  })

export const usePortal = () =>
  useMutation({
    mutationFn: async () => goToStripe((await api<{ url: string | null }>('/billing/portal', { method: 'POST' })).url),
  })
