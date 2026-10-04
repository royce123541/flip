import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/flip/EmptyState'
import { FlashCard } from '@/components/flip/FlashCard'
import { useReview, useStudyQueue, type Grade, type StudyCard } from '@/hooks/useStudy'

const GRADES: { grade: Grade; label: string; key: string; variant: 'outline' | 'default' }[] = [
  { grade: 'again', label: 'Again', key: '1', variant: 'outline' },
  { grade: 'hard', label: 'Hard', key: '2', variant: 'outline' },
  { grade: 'good', label: 'Good', key: '3', variant: 'default' },
  { grade: 'easy', label: 'Easy', key: '4', variant: 'outline' },
]

/** Study session. /study/:deckId studies one deck, /review studies due cards across all decks. */
export default function Study() {
  const { deckId } = useParams()
  const [params] = useSearchParams()
  const cram = params.get('all') === '1'
  const { data, isLoading, error } = useStudyQueue(deckId, cram)

  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-xl" />
  if (error || !data) return <p role="alert" className="text-destructive">{error?.message ?? 'Could not load cards'}</p>

  if (data.cards.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="size-8" />}
        title="Nothing due right now"
        description="You're all caught up. You can still go through every card in this deck."
        action={
          deckId ? (
            <Button render={<Link to={`/study/${deckId}?all=1`} />} nativeButton={false}>Study all cards anyway</Button>
          ) : (
            <Button render={<Link to="/dashboard" />} nativeButton={false}>Back to dashboard</Button>
          )
        }
      />
    )
  }

  return <Session initial={data.cards} total={data.total} backTo={deckId ? `/decks/${deckId}` : '/dashboard'} />
}

function Session({ initial, total, backTo }: { initial: StudyCard[]; total: number; backTo: string }) {
  const [queue, setQueue] = useState(initial)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(0)
  const [lapsed, setLapsed] = useState<Set<string>>(new Set())
  const review = useReview()

  const card = queue[0]
  const sessionSize = initial.length

  const answer = (grade: Grade) => {
    if (!card || review.isPending) return
    review.mutate(
      { deckId: card.deckId, cardId: card.id, grade },
      {
        onSuccess: () => {
          setFlipped(false)
          // "Again" cards come back once more at the end of this session.
          const requeue = grade === 'again' && !lapsed.has(card.id)
          if (requeue) setLapsed((s) => new Set(s).add(card.id))
          setQueue((q) => (requeue ? [...q.slice(1), card] : q.slice(1)))
          if (!requeue) setDone((d) => d + 1)
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (!flipped) return
      const g = GRADES.find((x) => x.key === e.key)
      if (g) answer(g.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!card) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="size-8 text-primary" />}
        title="Session complete"
        description={`You reviewed ${sessionSize} card${sessionSize === 1 ? '' : 's'}.${total > sessionSize ? ` ${total - sessionSize} more are waiting.` : ''}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" render={<Link to={backTo} />} nativeButton={false}>Done</Button>
            {total > sessionSize && <Button onClick={() => window.location.reload()}>Keep going</Button>}
          </div>
        }
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{card.deckTitle}</span>
          <span>{done} / {sessionSize}</span>
        </div>
        <Progress value={(done / sessionSize) * 100} aria-label="Session progress" />
      </div>

      <FlashCard key={card.id} front={card.front} back={card.back} flipped={flipped} onFlippedChange={setFlipped} />

      {flipped ? (
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you know it?">
          {GRADES.map((g) => (
            <Button key={g.grade} variant={g.variant} disabled={review.isPending} onClick={() => answer(g.grade)}>
              {g.label} <kbd className="ml-1 text-xs opacity-60">{g.key}</kbd>
            </Button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Click the card (or focus it and press Space) to reveal the answer.</p>
      )}
    </div>
  )
}
