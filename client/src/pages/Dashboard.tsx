import { GraduationCap, Layers, Plus, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { DeckCard } from '@/components/flip/DeckCard'
import { EmptyState } from '@/components/flip/EmptyState'
import { StatTile } from '@/components/flip/StatTile'
import { useDecks } from '@/hooks/useDecks'

export default function Dashboard() {
  const { data: decks, isLoading, error } = useDecks()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const filtered = useMemo(() => (decks ?? []).filter((d) => d.title.toLowerCase().includes(q.toLowerCase())), [decks, q])
  const totalDue = (decks ?? []).reduce((n, d) => n + d.dueCount, 0)
  const totalCards = (decks ?? []).reduce((n, d) => n + d.cardCount, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your decks</h1>
        <div className="flex gap-2">
          {totalDue > 0 && (
            <Button variant="secondary" render={<Link to="/review" />} nativeButton={false}>
              <GraduationCap /> Review {totalDue} due
            </Button>
          )}
          <Button variant="outline" render={<Link to="/generate" />} nativeButton={false}>
            <Sparkles /> Generate with AI
          </Button>
          <Button render={<Link to="/decks/new" />} nativeButton={false}>
            <Plus /> New deck
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Decks" value={decks?.length ?? '–'} icon={<Layers className="size-5" />} />
        <StatTile label="Total cards" value={decks ? totalCards : '–'} icon={<Layers className="size-5" />} />
        <StatTile label="Cards due" value={decks ? totalDue : '–'} icon={<Layers className="size-5" />} />
      </div>

      {error && <p role="alert" className="text-destructive">Could not load decks: {error.message}</p>}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      )}

      {decks && decks.length === 0 && (
        <EmptyState
          icon={<Layers className="size-8" />}
          title="No decks yet"
          description="Create a deck by hand, or let AI build one from your notes."
          action={
            <div className="flex gap-2">
              <Button render={<Link to="/generate" />} nativeButton={false}><Sparkles /> Generate with AI</Button>
              <Button variant="outline" render={<Link to="/decks/new" />} nativeButton={false}>Create manually</Button>
            </div>
          }
        />
      )}

      {decks && decks.length > 0 && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search decks" aria-label="Search decks" className="pl-9" />
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No decks match "{q}".</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((d) => (
                <DeckCard key={d.id} title={d.title} description={d.description} cardCount={d.cardCount} dueCount={d.dueCount} onClick={() => navigate(`/decks/${d.id}`)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
