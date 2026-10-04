import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useMe } from '@/hooks/useGenerate'

const PATIENCE_MS = 10_000

/**
 * Stripe redirects here as soon as payment succeeds, but the plan only flips
 * when the webhook arrives. Poll /me until it does, and be honest if it's slow.
 */
export default function BillingSuccess() {
  const { data: me, refetch } = useMe(true)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), PATIENCE_MS)
    return () => clearTimeout(t)
  }, [])

  if (me?.plan === 'pro') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
        <CheckCircle2 className="size-12 text-primary" aria-hidden />
        <h1 className="text-2xl font-bold">You're on Pro</h1>
        <p className="text-muted-foreground">Unlimited AI generations and PDF uploads are now unlocked.</p>
        <div className="flex gap-2">
          <Button render={<Link to="/generate" />} nativeButton={false}>Generate cards</Button>
          <Button variant="outline" render={<Link to="/dashboard" />} nativeButton={false}>Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center" role="status">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <h1 className="text-2xl font-bold">{slow ? 'Still processing your payment' : 'Activating Pro…'}</h1>
      <p className="text-muted-foreground">
        {slow
          ? 'Your payment went through, but confirmation is taking longer than usual. It can take a minute. You can safely leave this page.'
          : 'Confirming your payment with Stripe.'}
      </p>
      {slow && (
        <div className="flex gap-2">
          <Button onClick={() => refetch()}>Check again</Button>
          <Button variant="outline" render={<Link to="/account" />} nativeButton={false}>Go to account</Button>
        </div>
      )}
    </div>
  )
}
