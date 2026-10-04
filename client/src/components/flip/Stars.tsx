import { useEffect, useState } from 'react'
import { Sprite } from '@/components/pixel/Sprite'
import { star } from '@/components/pixel/sprites'
import { cn } from '@/lib/utils'

/** 3 stars at ≥ 90%, 2 at ≥ 70%, otherwise 1. Shared by study sessions and quiz results. */
export function starsFor(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3
  if (accuracy >= 0.7) return 2
  return 1
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Three pixel stars that fill one after another (instantly with reduced motion). */
export function Stars({ earned, className }: { earned: number; className?: string }) {
  const [shown, setShown] = useState(() => (reducedMotion() ? earned : 0))

  useEffect(() => {
    if (shown >= earned) return
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 200 : 150)
    return () => clearTimeout(t)
  }, [shown, earned])

  return (
    <div role="img" aria-label={`${earned} of 3 stars`} className={cn('flex items-end justify-center gap-2', className)}>
      {[0, 1, 2].map((i) => (
        <Sprite
          key={i}
          grid={star}
          palette={i < shown ? undefined : { c: 'transparent' }}
          className={cn(i === 1 ? 'size-14' : 'size-10', i < shown && 'animate-[px-star-in_150ms_steps(3,end)]')}
        />
      ))}
    </div>
  )
}
