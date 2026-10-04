import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface UsageMeterProps {
  used: number
  limit: number
  label?: string
}

export function UsageMeter({ used, limit, label = 'AI generations this month' }: UsageMeterProps) {
  const pct = Math.min(100, Math.round((used / limit) * 100))
  const warn = pct >= 80
  const blocked = used >= limit

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className={cn('font-medium', warn && 'text-destructive')}>
          {used} / {limit}
        </span>
      </div>
      <Progress value={pct} aria-label={label} className={cn(warn && '[&_[data-slot=progress-indicator]]:bg-destructive')} />
      {blocked && <p className="text-sm text-destructive">Limit reached. Upgrade to Pro for unlimited generations.</p>}
      {!blocked && warn && <p className="text-sm text-muted-foreground">You're almost out of free generations.</p>}
    </div>
  )
}
