import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Pencil } from '@/components/pixel/icons'
import { Button } from '@/components/ui/button'
import { Progress as ProgressBar } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Sprite } from '@/components/pixel/Sprite'
import { finishedPile, sleepingCard } from '@/components/pixel/sprites'
import { CoinCounter } from '@/components/flip/CoinCounter'
import { EditCardDialog } from '@/components/flip/EditCardDialog'
import { EmptyState } from '@/components/flip/EmptyState'
import { FlashCard } from '@/components/flip/FlashCard'
import { Stars, starsFor } from '@/components/flip/Stars'
import { useReview, useStudyQueue, useUndoReview, type Grade, type StudyCard } from '@/hooks/useStudy'

// All four grades look equal on purpose: a highlighted "Good" read as already selected
// and nudged people away from the honest answer.
const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: 'again', label: 'Again', key: '1' },
  { grade: 'hard', label: 'Hard', key: '2' },
  { grade: 'good', label: 'Good', key: '3' },
  { grade: 'easy', label: 'Easy', key: '4' },
]

/** "10 min", "3 hours", "1 day", "6 days", "2 months" */
function formatWait(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`
  const months = Math.round(days / 30)
  return `${months} month${months === 1 ? '' : 's'}`
}

/** Coins per grade: knowing a card earns coins, struggling with it never costs any. */
const COINS: Record<Grade, number> = { again: 0, hard: 0, good: 1, easy: 2 }
const COMBO_SHOWN_FROM = 3

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
        icon={<Sprite grid={sleepingCard} className="size-20" />}
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

/** Everything one answer changes, kept together so undo can restore it in one step. */
interface SessionState {
  queue: StudyCard[]
  done: number
  lapsed: string[]
  coins: number
  combo: number
  bestCombo: number
  // First-try accuracy drives the stars; a card returning after "Again" is not counted twice.
  known: number
  seen: number
}

const Key = ({ k }: { k: string }) => (
  <kbd className="hidden border-2 border-current px-1 font-sans text-xs font-bold leading-tight sm:inline">{k}</kbd>
)

function Session({ initial, total, backTo }: { initial: StudyCard[]; total: number; backTo: string }) {
  const [state, setState] = useState<SessionState>({ queue: initial, done: 0, lapsed: [], coins: 0, combo: 0, bestCombo: 0, known: 0, seen: 0 })
  const [flipped, setFlipped] = useState(false)
  const [editing, setEditing] = useState(false)
  // One level of undo: the state before the last answer, plus the server-side review to reverse.
  const [last, setLast] = useState<{ before: SessionState; reviewId: string } | null>(null)
  const review = useReview()
  const undoReview = useUndoReview()

  const card = state.queue[0]
  const sessionSize = initial.length
  const busy = review.isPending || undoReview.isPending

  const answer = (grade: Grade) => {
    if (!card || busy) return
    const before = state
    review.mutate(
      { deckId: card.deckId, cardId: card.id, grade },
      {
        onSuccess: ({ reviewId }) => {
          setFlipped(false)
          setLast({ before, reviewId })
          const knew = grade === 'good' || grade === 'easy'
          const repeat = before.lapsed.includes(card.id)
          // "Again" cards come back once more at the end of this session.
          const requeue = grade === 'again' && !repeat
          const combo = knew ? before.combo + 1 : 0
          setState({
            queue: requeue ? [...before.queue.slice(1), card] : before.queue.slice(1),
            done: requeue ? before.done : before.done + 1,
            lapsed: requeue ? [...before.lapsed, card.id] : before.lapsed,
            coins: before.coins + COINS[grade],
            combo,
            bestCombo: Math.max(before.bestCombo, combo),
            known: repeat ? before.known : before.known + (knew ? 1 : 0),
            seen: repeat ? before.seen : before.seen + 1,
          })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  const undo = () => {
    if (!last || busy) return
    undoReview.mutate(last.reviewId, {
      onSuccess: () => {
        setState(last.before)
        setLast(null)
        // Back to the answer side, so a different grade can be picked straight away.
        setFlipped(true)
        toast('Last answer undone')
      },
      onError: (e) => toast.error(e.message),
    })
  }

  const applyEdit = (edited: { front: string; back: string }) => {
    if (!card) return
    const update = (q: StudyCard[]) => q.map((c) => (c.id === card.id ? { ...c, ...edited } : c))
    setState((cur) => ({ ...cur, queue: update(cur.queue) }))
    setLast((l) => (l ? { ...l, before: { ...l.before, queue: update(l.before.queue) } } : l))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'z' || e.key === 'Z') return undo()
      if (!card) return
      if (!flipped) {
        // Space or Enter shows the answer from anywhere. A focused button already handles
        // these keys itself, so skip it to avoid flipping twice.
        const onButton = e.target instanceof HTMLElement && e.target.closest('button, a')
        if ((e.key === ' ' || e.key === 'Enter') && !onButton) {
          e.preventDefault()
          setFlipped(true)
        }
        return
      }
      const g = GRADES.find((x) => x.key === e.key)
      if (g) answer(g.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const undoButton = last ? (
    <Button variant="ghost" size="sm" onClick={undo} disabled={busy}>
      Undo last answer <Key k="Z" />
    </Button>
  ) : null

  if (!card) {
    const earned = starsFor(state.seen ? state.known / state.seen : 0)
    const remaining = total - sessionSize
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 border-3 border-outline bg-card p-8 text-center shadow-md">
        <Sprite grid={finishedPile} className="size-24" />
        <h1 className="text-2xl font-bold">Session complete</h1>
        <Stars earned={earned} />
        <dl className="grid w-full grid-cols-3 gap-2 text-center">
          {[
            ['Cards', sessionSize],
            ['Coins', state.coins],
            ['Best combo', state.bestCombo],
          ].map(([label, value]) => (
            <div key={label} className="border-2 border-outline bg-background p-2">
              <dt className="font-pixel text-xs">{label}</dt>
              <dd className="text-xl font-bold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {remaining > 0 && <p className="text-sm text-muted-foreground">{remaining} more card{remaining === 1 ? ' is' : 's are'} waiting.</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" render={<Link to={backTo} />} nativeButton={false}>Done</Button>
          {remaining > 0 && <Button onClick={() => window.location.reload()}>Keep going</Button>}
        </div>
        {undoButton}
      </div>
    )
  }

  const repeat = state.lapsed.includes(card.id)

  return (
    // Extra bottom padding on phones keeps the card clear of the pinned answer bar.
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 pb-44 sm:pb-0">
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="truncate text-muted-foreground">{card.deckTitle}</span>
          <div className="flex shrink-0 items-center gap-3">
            {state.combo >= COMBO_SHOWN_FROM && (
              <span className="border-2 border-outline bg-primary px-1.5 font-pixel text-xs font-bold text-primary-foreground">Combo ×{state.combo}</span>
            )}
            <CoinCounter coins={state.coins} />
            <span className="text-muted-foreground tabular-nums">{state.done} / {sessionSize}</span>
          </div>
        </div>
        <ProgressBar value={(state.done / sessionSize) * 100} aria-label="Session progress" />
      </div>

      <div className="relative w-full max-w-xl">
        <FlashCard key={card.id} front={card.front} back={card.back} flipped={flipped} onFlippedChange={setFlipped} />
        <Button variant="outline" size="icon-sm" className="absolute top-4 right-4" aria-label="Edit this card" onClick={() => setEditing(true)}>
          <Pencil />
        </Button>
      </div>

      {/* Answer bar: pinned to the bottom on phones (thumb reach), inline on larger screens. */}
      <div className="fixed inset-x-0 bottom-0 z-30 space-y-2 border-t-3 border-outline bg-card p-3 sm:static sm:w-full sm:border-0 sm:bg-transparent sm:p-0">
        {flipped ? (
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="How well did you know it?">
            {GRADES.map((g) => (
              <Button key={g.grade} variant="outline" disabled={busy} onClick={() => answer(g.grade)} className="h-auto min-h-12 flex-col gap-1 py-2.5">
                <span className="flex items-center gap-1.5">
                  {g.label} <Key k={g.key} />
                </span>
                {/* A card repeating after "Again" has a new schedule, so its preview would be stale. */}
                {!repeat && <span className="font-sans text-xs font-normal text-muted-foreground">{formatWait(card.nextIn[g.grade])}</span>}
              </Button>
            ))}
          </div>
        ) : (
          <>
            <Button className="h-12 w-full sm:hidden" onClick={() => setFlipped(true)}>Show answer</Button>
            <p className="hidden text-center text-sm text-muted-foreground sm:block">Press Space or click the card to show the answer.</p>
          </>
        )}
        {undoButton && <div className="flex justify-center">{undoButton}</div>}
      </div>

      {editing && (
        <EditCardDialog
          open={editing}
          onOpenChange={setEditing}
          deckId={card.deckId}
          cardId={card.id}
          front={card.front}
          back={card.back}
          onSaved={applyEdit}
        />
      )}
    </div>
  )
}
