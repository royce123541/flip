import { Copy, GraduationCap, ListChecks, Pencil, Trash2 } from '@/components/pixel/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Sprite } from '@/components/pixel/Sprite'
import { emptyBox } from '@/components/pixel/sprites'
import { EmptyState } from '@/components/flip/EmptyState'
import { useDeck, useDeckMutations } from '@/hooks/useDecks'

export default function DeckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: deck, isLoading, error } = useDeck(id)
  const { remove, duplicate } = useDeckMutations()

  if (isLoading) return <Skeleton className="h-64" />
  if (error || !deck) return <p role="alert" className="text-destructive">{error?.message ?? 'Deck not found'}</p>

  const onDelete = () =>
    remove.mutate(deck.id, {
      onSuccess: () => {
        toast.success('Deck deleted')
        navigate('/dashboard')
      },
      onError: (e) => toast.error(e.message),
    })

  const onDuplicate = () =>
    duplicate.mutate(deck.id, {
      onSuccess: (copy) => {
        toast.success('Deck duplicated')
        navigate(`/decks/${copy.id}`)
      },
      onError: (e) => toast.error(e.message),
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          {deck.description && <p className="mt-1 text-muted-foreground">{deck.description}</p>}
          <p className="mt-2 text-sm text-muted-foreground">{deck.cards.length} cards</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {deck.cards.length > 0 && (
            <>
              <Button render={<Link to={`/study/${deck.id}`} />} nativeButton={false}>
                <GraduationCap /> Study
              </Button>
              <Button variant="secondary" render={<Link to={`/quiz/${deck.id}`} />} nativeButton={false}>
                <ListChecks /> Quiz
              </Button>
            </>
          )}
          <Button variant="outline" render={<Link to={`/decks/${deck.id}/edit`} />} nativeButton={false}>
            <Pencil /> Edit
          </Button>
          <Button variant="outline" onClick={onDuplicate} disabled={duplicate.isPending}>
            <Copy /> Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              <Trash2 /> Delete
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{deck.title}"?</AlertDialogTitle>
                <AlertDialogDescription>This permanently removes the deck and all its cards.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {deck.cards.length === 0 ? (
        <EmptyState icon={<Sprite grid={emptyBox} className="size-16" />} title="This deck is empty" description="Add some cards to start studying." action={<Button render={<Link to={`/decks/${deck.id}/edit`} />} nativeButton={false}>Add cards</Button>} />
      ) : (
        <ul className="space-y-3">
          {deck.cards.map((c, i) => (
            <li key={c.id}>
              <Card>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Front · {i + 1}</p>
                    <p>{c.front}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Back</p>
                    <p>{c.back}</p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
