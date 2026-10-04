import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEditCard } from '@/hooks/useStudy'

interface EditCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deckId: string
  cardId: string
  front: string
  back: string
  onSaved: (card: { front: string; back: string }) => void
}

/** Fix a card's question or answer without leaving the study session. Its schedule is kept. */
export function EditCardDialog({ open, onOpenChange, deckId, cardId, front, back, onSaved }: EditCardDialogProps) {
  const edit = useEditCard()
  const [draft, setDraft] = useState({ front, back })
  const valid = draft.front.trim() && draft.back.trim()

  const save = () =>
    edit.mutate(
      { deckId, cardId, front: draft.front.trim(), back: draft.back.trim() },
      {
        onSuccess: (card) => {
          onSaved({ front: card.front, back: card.back })
          onOpenChange(false)
          toast.success('Card saved')
        },
        onError: (e) => toast.error(e.message),
      },
    )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit card</DialogTitle>
          <DialogDescription>Changes are saved to the deck. When the card is due stays the same.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="edit-front">Question</Label>
            <Textarea id="edit-front" value={draft.front} maxLength={1000} onChange={(e) => setDraft((d) => ({ ...d, front: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-back">Answer</Label>
            <Textarea id="edit-back" value={draft.back} maxLength={1000} onChange={(e) => setDraft((d) => ({ ...d, back: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={!valid || edit.isPending}>{edit.isPending ? 'Saving…' : 'Save card'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
