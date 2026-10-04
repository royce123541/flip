import { useEffect, useRef, useState } from 'react'
import { Sprite } from '@/components/pixel/Sprite'
import { coin } from '@/components/pixel/sprites'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Coin total for the current session. Each gain floats a "+N" up in four frames (skipped with reduced motion). */
export function CoinCounter({ coins }: { coins: number }) {
  const previous = useRef(coins)
  const [pops, setPops] = useState<{ id: number; amount: number }[]>([])

  useEffect(() => {
    const gain = coins - previous.current
    previous.current = coins
    if (gain <= 0 || reducedMotion()) return
    const id = Date.now() + Math.random()
    setPops((p) => [...p, { id, amount: gain }])
    const t = setTimeout(() => setPops((p) => p.filter((x) => x.id !== id)), 450)
    return () => clearTimeout(t)
  }, [coins])

  return (
    <span className="relative inline-flex items-center gap-1.5 font-pixel text-base font-bold" aria-label={`${coins} coins`}>
      <Sprite grid={coin} className="size-5" />
      <span aria-hidden className="tabular-nums">{coins}</span>
      {pops.map((p) => (
        <span
          key={p.id}
          aria-hidden
          className="pointer-events-none absolute -top-1 left-6 animate-[px-coin-pop_400ms_steps(4,end)_forwards] font-pixel text-sm font-bold"
        >
          +{p.amount}
        </span>
      ))}
    </span>
  )
}
