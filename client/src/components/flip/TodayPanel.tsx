import { Link } from 'react-router-dom'
import { Flame } from '@/components/pixel/icons'
import { Sprite } from '@/components/pixel/Sprite'
import { sleepingCard } from '@/components/pixel/sprites'
import { Button } from '@/components/ui/button'

interface TodayPanelProps {
  due: number
  decks: number
  cards: number
  /** Undefined while analytics is still loading. */
  streak?: number
}

const MAX_STACK = 5

/** Today's due cards drawn as a pile, one card per due card up to five. */
function CardStack({ count }: { count: number }) {
  const layers = Math.min(count, MAX_STACK)
  const offset = 6
  return (
    <div aria-hidden className="relative h-28 w-24 shrink-0" style={{ marginRight: (layers - 1) * offset, marginBottom: (layers - 1) * offset }}>
      {Array.from({ length: layers }, (_, i) => (
        <div
          key={i}
          className="absolute h-28 w-24 border-3 border-outline bg-card"
          style={{ left: i * offset, top: i * offset, boxShadow: i === layers - 1 ? '4px 4px 0 var(--shadow)' : undefined }}
        >
          {i === layers - 1 && (
            <div className="space-y-1.5 p-2.5">
              <div className="h-1.5 w-12 bg-outline" />
              <div className="h-1.5 w-16 bg-muted-foreground/60" />
              <div className="h-1.5 w-10 bg-muted-foreground/60" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function TodayPanel({ due, decks, cards, streak }: TodayPanelProps) {
  const caughtUp = due === 0

  return (
    <section aria-labelledby="today-title" className="flex flex-col gap-6 border-3 border-outline bg-card p-6 shadow-md sm:flex-row sm:items-center">
      {caughtUp ? <Sprite grid={sleepingCard} className="size-28 shrink-0" /> : <CardStack count={due} />}

      <div className="flex-1 space-y-2">
        <h2 id="today-title" className="text-2xl font-bold">
          {caughtUp ? 'All caught up for today' : (
            <>
              <span className="tabular-nums">{due}</span> card{due === 1 ? '' : 's'} due today
            </>
          )}
        </h2>
        {streak !== undefined && (
          <p className="flex items-center gap-2 font-pixel text-base">
            <Flame className="size-5" />
            {streak > 0 ? `${streak}-day streak` : 'Study today to start a streak'}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {decks} deck{decks === 1 ? '' : 's'}, {cards} card{cards === 1 ? '' : 's'} in total
        </p>
      </div>

      {caughtUp ? (
        <Button variant="outline" size="lg" className="w-full sm:w-auto" render={<Link to="/decks/new" />} nativeButton={false}>
          Add more cards
        </Button>
      ) : (
        <Button size="lg" className="h-14 w-full px-8 text-lg sm:w-auto" render={<Link to="/review" />} nativeButton={false}>
          Start review
        </Button>
      )}
    </section>
  )
}
