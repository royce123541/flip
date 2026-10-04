import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FlashCardProps {
  front: string
  back: string
  className?: string
  /** Controlled mode: pass both to let the parent own the flipped state. */
  flipped?: boolean
  onFlippedChange?: (flipped: boolean) => void
}

export function FlashCard({ front, back, className, flipped: controlled, onFlippedChange }: FlashCardProps) {
  const [internal, setInternal] = useState(false)
  const flipped = controlled ?? internal
  const toggle = () => (onFlippedChange ? onFlippedChange(!flipped) : setInternal(!flipped))

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={flipped}
      aria-label={flipped ? `Answer: ${back}. Press to show question.` : `Question: ${front}. Press to show answer.`}
      className={cn('group h-64 w-full max-w-xl [perspective:1000px] focus-visible:outline-none', className)}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] group-focus-visible:ring-3 group-focus-visible:ring-ring/50',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <Face label="Question" text={front} />
        <Face label="Answer" text={back} back />
      </div>
    </button>
  )
}

function Face({ label, text, back }: { label: string; text: string; back?: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border p-8 text-center shadow-sm [backface-visibility:hidden]',
        back ? 'bg-primary text-primary-foreground [transform:rotateY(180deg)]' : 'bg-card text-card-foreground',
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wider opacity-60">{label}</span>
      <p className="text-xl font-semibold leading-snug">{text}</p>
    </div>
  )
}
