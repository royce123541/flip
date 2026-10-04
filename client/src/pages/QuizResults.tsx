import { Check, X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAttempt } from '@/hooks/useStudy'

export default function QuizResults() {
  const { attemptId } = useParams()
  const { data, isLoading, error } = useAttempt(attemptId)

  if (isLoading) return <Skeleton className="h-64" />
  if (error || !data) return <p role="alert" className="text-destructive">{error?.message ?? 'Results not found'}</p>

  const pct = Math.round((data.score / data.total) * 100)
  const missed = data.answers.filter((a) => !a.correct)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1 text-center">
        <p className="text-5xl font-bold text-primary">{pct}%</p>
        <p className="text-muted-foreground">{data.score} of {data.total} correct</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button render={<Link to={`/quiz/${data.deckId}`} />} nativeButton={false}>Try again</Button>
        <Button variant="outline" render={<Link to={`/study/${data.deckId}?all=1`} />} nativeButton={false}>
          Study this deck
        </Button>
        <Button variant="ghost" render={<Link to={`/decks/${data.deckId}`} />} nativeButton={false}>Back to deck</Button>
      </div>

      {missed.length > 0 && <p className="text-sm text-muted-foreground">{missed.length} missed. Those cards are scheduled for review again.</p>}

      <ul className="space-y-3">
        {data.answers.map((a, i) => (
          <li key={i}>
            <Card>
              <CardContent className="flex gap-3">
                {a.correct ? <Check className="mt-1 size-5 shrink-0 text-green-600" aria-label="Correct" /> : <X className="mt-1 size-5 shrink-0 text-destructive" aria-label="Incorrect" />}
                <div className="space-y-1">
                  <p className="font-medium">{a.front}</p>
                  {a.correct ? (
                    <p className="text-sm text-muted-foreground">{a.back}</p>
                  ) : (
                    <>
                      <p className="text-sm text-destructive">Your answer: {a.chosen}</p>
                      <p className="text-sm text-muted-foreground">Correct: {a.back}</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
