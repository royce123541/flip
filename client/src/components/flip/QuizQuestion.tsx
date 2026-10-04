import { AnswerOption, type AnswerState } from './AnswerOption'

interface QuizQuestionProps {
  index: number
  total: number
  question: string
  options: string[]
  selected?: number
  correctIndex?: number // supply to reveal result
  onSelect?: (i: number) => void
}

export function QuizQuestion({ index, total, question, options, selected, correctIndex, onSelect }: QuizQuestionProps) {
  const revealed = correctIndex !== undefined

  const stateFor = (i: number): AnswerState => {
    if (revealed) {
      if (i === correctIndex) return 'correct'
      if (i === selected) return 'incorrect'
      return 'idle'
    }
    return i === selected ? 'selected' : 'idle'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Question {index} of {total}
      </p>
      <h2 className="font-sans text-xl font-bold">{question}</h2>
      <div className="space-y-2" role="group" aria-label="Answer choices">
        {options.map((text, i) => (
          <AnswerOption
            key={i}
            label={String.fromCharCode(65 + i)}
            text={text}
            state={stateFor(i)}
            disabled={revealed}
            onSelect={() => onSelect?.(i)}
          />
        ))}
      </div>
    </div>
  )
}
