import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PlanCard } from '@/components/flip/PlanCard'
import { useAuth } from '@/hooks/useAuth'
import { useCheckout } from '@/hooks/useBilling'
import { useMe } from '@/hooks/useGenerate'
import { ApiError } from '@/lib/api'

const PRO_PRICE = import.meta.env.VITE_PRO_PRICE_LABEL ?? '₱149/month'

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const checkout = useCheckout()
  const isPro = me?.plan === 'pro'

  const upgrade = () => {
    if (!user) return navigate('/signup', { state: { from: '/pricing' } })
    checkout.mutate(undefined, {
      onError: (e) => {
        // Already subscribed in another tab: show the real state instead of an error.
        if (e instanceof ApiError && e.code === 'already_subscribed') return navigate('/account')
        toast.error(e.message)
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Simple, student-friendly pricing</h1>
        <p className="text-muted-foreground">Start free. Upgrade when you want unlimited AI and PDF uploads.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PlanCard
          name="Free"
          price="₱0"
          description="For trying Flip out"
          cta={!user ? 'Get started' : isPro ? 'Included' : 'Current plan'}
          disabled={!!user}
          onSelect={() => navigate('/signup')}
          features={[
            { text: 'Unlimited manual decks and cards' },
            { text: 'Flashcard and quiz modes' },
            { text: '5 AI generations per month (paste text)' },
            { text: 'PDF upload', locked: true },
            { text: 'Full analytics', locked: true },
          ]}
        />
        <PlanCard
          name="Pro"
          price={PRO_PRICE}
          description="For serious studying"
          highlighted
          cta={isPro ? 'Current plan' : checkout.isPending ? 'Redirecting…' : 'Upgrade to Pro'}
          disabled={isPro || checkout.isPending}
          onSelect={upgrade}
          features={[
            { text: 'Everything in Free' },
            { text: 'Unlimited AI generations' },
            { text: 'Upload PDFs and notes' },
            { text: 'Full analytics' },
          ]}
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Payments are handled securely by Stripe. Cancel any time from your{' '}
        <Link className="underline" to="/account">account</Link>.
      </p>
    </div>
  )
}
