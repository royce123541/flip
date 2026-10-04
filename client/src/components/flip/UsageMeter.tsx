import { cn } from '@/lib/utils'

interface UsageMeterProps {
  used: number
  limit: number
  label?: string
}

/** One block per generation, like a game's health bar. Blocks turn cherry once 80% is used. */
export function UsageMeter({ used, limit, label = 'AI generations this month' }: UsageMeterProps) {
  const clamped = Math.min(used, limit)
  const warn = clamped / limit >= 0.8
  const blocked = used >= limit
  // Large limits (Pro's fair-use ceiling) would make too many blocks; fall back to 20 segments.
  const cells = limit <= 20 ? limit : 20
  const filled = Math.round((clamped / limit) * cells)

  return (
    <div className="space-y-2">
      <div className="flex justify-between font-pixel text-sm">
        <span>{label}</span>
        <span className={cn('font-sans font-bold tabular-nums', warn && 'text-destructive')}>
          {used} / {limit}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={clamped}
        className="flex h-5 gap-[3px] border-2 border-outline bg-card p-[3px]"
      >
        {Array.from({ length: cells }, (_, i) => (
          <span key={i} className={cn('flex-1', i < filled ? (warn ? 'bg-cherry' : 'bg-primary') : 'bg-muted')} />
        ))}
      </div>
      {blocked && <p className="text-sm text-destructive">Limit reached. Upgrade to Pro for unlimited generations.</p>}
      {!blocked && warn && <p className="text-sm text-muted-foreground">You're almost out of free generations.</p>}
    </div>
  )
}
