import { Trash2 } from '@/components/pixel/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CardEditorRowProps {
  index: number
  front: string
  back: string
  onChange: (patch: { front?: string; back?: string }) => void
  onRemove: () => void
}

export function CardEditorRow({ index, front, back, onChange, onRemove }: CardEditorRowProps) {
  return (
    <Card>
      <CardContent className="flex gap-3">
        <span className="mt-2 w-6 shrink-0 text-sm text-muted-foreground">{index}</span>
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`front-${index}`}>Front</Label>
            <Textarea id={`front-${index}`} value={front} onChange={(e) => onChange({ front: e.target.value })} placeholder="Question or term" />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`back-${index}`}>Back</Label>
            <Textarea id={`back-${index}`} value={back} onChange={(e) => onChange({ back: e.target.value })} placeholder="Answer or definition" />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove card ${index}`}>
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  )
}
