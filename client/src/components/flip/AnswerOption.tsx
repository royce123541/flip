import { Check, X } from '@/components/pixel/icons'
import { cn } from '@/lib/utils'

export type AnswerState = 'idle' | 'selected' | 'correct' | 'incorrect'

interface AnswerOptionProps {
  label: string
  text: string
  state?: AnswerState
  disabled?: boolean
  onSelect?: () => void
}

const styles: Record<AnswerState, string> = {
  idle: 'bg-card hover:bg-accent',
  selected: 'bg-primary text-primary-foreground',
  // Pale fills keep ink text above 7:1; the check and cross icons carry the meaning too.
  correct: 'bg-[#9FD8A7] text-[#1B2A4A]',
  incorrect: 'bg-[#F4A3AA] text-[#1B2A4A]',
}

export function AnswerOption({ label, text, state = 'idle', disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 border-3 border-outline p-3 text-left shadow-sm transition-colors',
        !disabled && 'px-press',
        disabled && 'cursor-default',
        styles[state],
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center border-2 border-current bg-background font-pixel text-sm font-bold text-foreground">
        {label}
      </span>
      <span className="flex-1 font-sans text-base">{text}</span>
      {state === 'correct' && <Check className="size-6" aria-label="Correct" />}
      {state === 'incorrect' && <X className="size-6" aria-label="Incorrect" />}
    </button>
  )
}
