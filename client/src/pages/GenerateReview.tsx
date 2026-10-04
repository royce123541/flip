import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GeneratedCardPreview } from '@/components/flip/GeneratedCardPreview'
import { useDeckMutations } from '@/hooks/useDecks'
import { clearDraft, loadDraft } from '@/lib/generated'
import type { Card } from '@/lib/types'

interface Item {
  card: Card
  included: boolean
}

export default function GenerateReview() {
  // Read once; the draft lives in sessionStorage so a refresh doesn't waste a generation.
  const [draft] = useState(loadDraft)
  if (!draft || draft.cards.length === 0) return <Navigate to="/generate" replace />
  return <Review cards={draft.cards} truncated={draft.truncated} />
}

function Review({ cards, truncated }: { cards: Card[]; truncated: boolean }) {
  const navigate = useNavigate()
  const { create } = useDeckMutations()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<Item[]>(cards.map((card) => ({ card, included: true })))

  const selected = items.filter((i) => i.included && i.card.front.trim() && i.card.back.trim())

  const update = (index: number, patch: Partial<Item>) =>
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)))

  const save = () => {
    if (!title.trim()) return toast.error('Give your deck a title')
    if (selected.length === 0) return toast.error('Select at least one card')
    create.mutate(
      {
        title,
        description: '',
        cards: selected.map(({ card }) => ({
          front: card.front,
          back: card.back,
          distractors: card.distractors.map((d) => d.trim()).filter(Boolean),
        })),
      },
      {
        onSuccess: (deck) => {
          clearDraft()
          toast.success(`Saved ${selected.length} cards`)
          navigate(`/decks/${deck.id}`, { replace: true })
        },
        onError: (e) => toast.error(e.message),
      },
    )
  }

  const discard = () => {
    clearDraft()
    navigate('/generate', { replace: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Review generated cards</h1>
        <p className="mt-1 text-muted-foreground">Edit, remove, or untick anything you don't want. Nothing is saved until you confirm.</p>
      </div>

      {truncated && (
        <p role="status" className="rounded-lg border bg-muted p-3 text-sm">
          Your document was longer than the limit, so only the first part was used.
        </p>
      )}

      <div className="max-w-md space-y-2">
        <Label htmlFor="deck-title">Deck title</Label>
        <Input id="deck-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Biology — Chapter 3" />
      </div>

      <div className="space-y-3">
        {items.map((it, i) => (
          <GeneratedCardPreview
            key={i}
            index={i + 1}
            card={it.card}
            included={it.included}
            onToggle={(included) => update(i, { included })}
            onChange={(patch) => update(i, { card: { ...it.card, ...patch } })}
            onRemove={() => setItems((list) => list.filter((_, j) => j !== i))}
          />
        ))}
      </div>

      <div className="sticky bottom-0 flex items-center gap-2 border-t bg-background/90 py-3 backdrop-blur">
        <Button onClick={save} disabled={create.isPending}>
          {create.isPending ? 'Saving…' : `Save ${selected.length} card${selected.length === 1 ? '' : 's'}`}
        </Button>
        <Button variant="ghost" onClick={discard}>Discard all</Button>
      </div>
    </div>
  )
}
