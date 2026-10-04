import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FlashCardProps {
  front: string
  back: string
  className?: string
  /** Controlled mode: pass both to let the parent own the flipped state. */
  flipped?: boolean
  onFlippedChange?: (flipped: boolean) => void
}

const FLIP_MS = 160
const SQUASH: Keyframe[] = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0.06)' }, { transform: 'scaleX(1)' }]
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The signature element: a chunky pixel card with stepped corners and a hard shadow.
 * Flipping plays a stepped "squash" and swaps the face at the midpoint, like an 8-bit sprite turning.
 */
export function FlashCard({ front, back, className, flipped: controlled, onFlippedChange }: FlashCardProps) {
  const [internal, setInternal] = useState(false)
  const flipped = controlled ?? internal
  const [shown, setShown] = useState(flipped)
  const cardRef = useRef<HTMLButtonElement>(null)
  // Last flipped value we animated for, so re-renders (and React's dev double-run) don't replay the turn.
  const lastFlipped = useRef(flipped)

  useEffect(() => {
    if (lastFlipped.current === flipped) return
    lastFlipped.current = flipped
    if (reducedMotion()) {
      setShown(flipped)
      return
    }
    // Played through the Web Animations API so every flip restarts the turn, however often it happens.
    cardRef.current?.animate(SQUASH, { duration: FLIP_MS, easing: 'steps(4, end)' })
    const swap = setTimeout(() => setShown(flipped), FLIP_MS / 2)
    return () => clearTimeout(swap)
  }, [flipped])

  const toggle = () => (onFlippedChange ? onFlippedChange(!flipped) : setInternal(!flipped))

  return (
    <div className={cn('px-drop w-full max-w-xl', className)}>
      <button
        ref={cardRef}
        type="button"
        onClick={toggle}
        aria-pressed={flipped}
        aria-label={flipped ? `Answer: ${back}. Press to show question.` : `Question: ${front}. Press to show answer.`}
        className="px-notch block h-64 w-full bg-outline p-[3px]"
      >
        <div
          className={cn(
            'px-notch flex h-full flex-col items-center justify-center gap-4 p-8 text-center',
            shown ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground',
          )}
        >
          <span className="font-pixel text-sm opacity-80">{shown ? 'Answer' : 'Question'}</span>
          <p className="font-sans text-xl leading-snug font-bold">{shown ? back : front}</p>
        </div>
      </button>
    </div>
  )
}
