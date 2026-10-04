import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { CardEditorRow } from '@/components/flip/CardEditorRow'
import { useDeck, useDeckMutations } from '@/hooks/useDecks'
import type { Card, Deck } from '@/lib/types'

const blank = (): Card => ({ front: '', back: '', distractors: [] })

export default function DeckEditor() {
  const { id } = useParams()
  const { data: deck, isLoading } = useDeck(id)
  if (id && isLoading) return <Skeleton className="h-64" />
  // key resets the form state when switching between decks
  return <EditorForm key={id ?? 'new'} deck={deck} />
}

function EditorForm({ deck }: { deck?: Deck }) {
  const navigate = useNavigate()
  const { create, update } = useDeckMutations()
  const [title, setTitle] = useState(deck?.title ?? '')
  const [description, setDescription] = useState(deck?.description ?? '')
  const [cards, setCards] = useState<Card[]>(deck?.cards.length ? deck.cards : [blank()])
  const pending = create.isPending || update.isPending

  const patch = (i: number, p: Partial<Card>) => setCards((cs) => cs.map((c, j) => (j === i ? { ...c, ...p } : c)))

  const save = () => {
    const filled = cards.filter((c) => c.front.trim() && c.back.trim())
    if (!title.trim()) return toast.error('Give your deck a title')
    const data = { title, description, cards: filled }
    const opts = {
      onSuccess: (d: Deck) => {
        toast.success('Deck saved')
        navigate(`/decks/${d.id}`)
      },
      onError: (e: Error) => toast.error(e.message),
    }
    if (deck) update.mutate({ id: deck.id, data }, opts)
    else create.mutate(data, opts)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{deck ? 'Edit deck' : 'New deck'}</h1>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Biology — Chapter 3" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {cards.map((c, i) => (
          <CardEditorRow
            key={c.id ?? i}
            index={i + 1}
            front={c.front}
            back={c.back}
            onChange={(p) => patch(i, p)}
            onRemove={() => setCards((cs) => cs.filter((_, j) => j !== i))}
          />
        ))}
        <Button variant="outline" onClick={() => setCards((cs) => [...cs, blank()])}>
          <Plus /> Add card
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save deck'}</Button>
        <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </div>
  )
}
