import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { QuizQuestion } from '@/components/flip/QuizQuestion'
import { useQuiz, useSubmitQuiz, type QuizData } from '@/hooks/useStudy'

/** /quiz/:deckId shows setup; ?count=10|20|all starts the quiz. */
export default function Quiz() {
  const { deckId } = useParams()
  const [params, setParams] = useSearchParams()
  const count = params.get('count')
  const { data, isLoading, error } = useQuiz(deckId, count)

  if (!count) return <Setup onStart={(c) => setParams({ count: c })} />
  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-xl" />
  if (error || !data) {
    return (
      <div className="space-y-4" role="alert">
        <p className="text-destructive">{error?.message ?? 'Could not build quiz'}</p>
        <Button variant="outline" onClick={() => setParams({})}>Back</Button>
      </div>
    )
  }
  return <Runner quiz={data} />
}

function Setup({ onStart }: { onStart: (count: string) => void }) {
  const [count, setCount] = useState('10')
  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-2xl font-bold">Start a quiz</h1>
      <RadioGroup value={count} onValueChange={setCount} aria-label="Number of questions">
        {[['10', '10 questions'], ['20', '20 questions'], ['all', 'Every card']].map(([v, label]) => (
          <div key={v} className="flex items-center gap-2">
            <RadioGroupItem value={v} id={`count-${v}`} />
            <Label htmlFor={`count-${v}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={() => onStart(count)}>Start quiz</Button>
    </div>
  )
}

function Runner({ quiz }: { quiz: QuizData }) {
  const navigate = useNavigate()
  const submit = useSubmitQuiz()
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number[]>([])

  const q = quiz.questions[index]
  const picked = chosen[index]
  const answered = picked !== undefined
  const last = index === quiz.questions.length - 1

  const next = () => {
    if (!last) return setIndex((i) => i + 1)
    submit.mutate(
      {
        deckId: quiz.deckId,
        answers: quiz.questions.map((qq, i) => ({ cardId: qq.cardId, chosen: qq.options[chosen[i]] })),
      },
      {
        onSuccess: (r) => navigate(`/quiz/results/${r.id}`, { replace: true }),
        onError: (e) => toast.error(e.message),
      },
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{quiz.title}</p>
        <Progress value={(index / quiz.questions.length) * 100} aria-label="Quiz progress" />
      </div>

      <QuizQuestion
        key={q.cardId}
        index={index + 1}
        total={quiz.questions.length}
        question={q.question}
        options={q.options}
        selected={picked}
        correctIndex={answered ? q.correctIndex : undefined}
        onSelect={(i) => !answered && setChosen((c) => { const n = [...c]; n[index] = i; return n })}
      />

      {answered && (
        <Button onClick={next} disabled={submit.isPending}>
          {last ? (submit.isPending ? 'Saving…' : 'Finish') : 'Next'}
        </Button>
      )}
    </div>
  )
}
