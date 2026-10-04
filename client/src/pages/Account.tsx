import { AlertTriangle } from '@/components/pixel/icons'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteAccountDialog } from '@/components/flip/DeleteAccountDialog'
import { UsageMeter } from '@/components/flip/UsageMeter'
import { usePortal } from '@/hooks/useBilling'
import { useMe } from '@/hooks/useGenerate'

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : null

export default function Account() {
  const { data: me, isLoading, error } = useMe()
  const portal = usePortal()

  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-xl" />
  if (error || !me) return <p role="alert" className="text-destructive">{error?.message ?? 'Could not load your account'}</p>

  const isPro = me.plan === 'pro'
  const periodEnd = formatDate(me.currentPeriodEnd)
  const manage = () => portal.mutate(undefined, { onError: (e) => toast.error(e.message) })

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Account</h1>

      {me.subscriptionStatus === 'past_due' && (
        <div role="alert" className="flex gap-3 border-3 border-outline bg-[#F4A3AA] p-4 text-[#1B2A4A] shadow-sm">
          <AlertTriangle className="mt-0.5 size-6 shrink-0" aria-hidden />
          <div className="space-y-2">
            <p className="font-medium">Your last payment failed</p>
            <p className="text-sm">Update your payment method to keep Pro. Stripe will retry automatically.</p>
            <Button size="sm" onClick={manage} disabled={portal.isPending}>Update payment method</Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPro ? 'Pro' : 'Free'} plan <Badge variant={isPro ? 'default' : 'secondary'}>{isPro ? 'Pro' : 'Free'}</Badge>
          </CardTitle>
          <CardDescription>{me.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPro && periodEnd && (
            <p className="text-sm">
              {me.cancelAtPeriodEnd ? <>Pro ends on <strong>{periodEnd}</strong>. You will not be charged again.</> : <>Renews on <strong>{periodEnd}</strong>.</>}
            </p>
          )}
          {!isPro && me.subscriptionStatus === 'canceled' && (
            <p className="text-sm text-muted-foreground">Your Pro subscription has ended. Your decks and cards are all still here.</p>
          )}

          {me.ai.limit !== null ? (
            <UsageMeter used={me.ai.used} limit={me.ai.limit} />
          ) : (
            <p className="text-sm text-muted-foreground">Unlimited AI generations ({me.ai.used} used this month).</p>
          )}

          <div className="flex flex-wrap gap-2">
            {!isPro && <Button render={<Link to="/pricing" />} nativeButton={false}>Upgrade to Pro</Button>}
            {me.hasBillingAccount && (
              <Button variant="outline" onClick={manage} disabled={portal.isPending}>
                {portal.isPending ? 'Opening…' : 'Manage billing'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>Permanently remove your account and everything in it.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog email={me.email} isPro={isPro} />
        </CardContent>
      </Card>
    </div>
  )
}
