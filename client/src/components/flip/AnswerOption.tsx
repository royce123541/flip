import { Check, X } from 'lucide-react'
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
  idle: 'hover:bg-accent',
  selected: 'border-primary bg-primary/10',
  correct: 'border-green-600 bg-green-600/10',
  incorrect: 'border-destructive bg-destructive/10',
}

export function AnswerOption({ label, text, state = 'idle', disabled, onSelect }: AnswerOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default',
        styles[state],
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium">{label}</span>
      <span className="flex-1">{text}</span>
      {state === 'correct' && <Check className="size-5 text-green-600" aria-label="Correct" />}
      {state === 'incorrect' && <X className="size-5 text-destructive" aria-label="Incorrect" />}
    </button>
  )
}
