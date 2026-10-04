import { Trash2 } from '@/components/pixel/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Card as CardData } from '@/lib/types'

interface GeneratedCardPreviewProps {
  index: number
  card: CardData
  included: boolean
  onToggle: (included: boolean) => void
  onChange: (patch: Partial<CardData>) => void
  onRemove: () => void
}

export function GeneratedCardPreview({ index, card, included, onToggle, onChange, onRemove }: GeneratedCardPreviewProps) {
  return (
    <Card className={cn(!included && 'opacity-50')}>
      <CardContent className="flex gap-3">
        <Checkbox
          checked={included}
          onCheckedChange={(v) => onToggle(v === true)}
          aria-label={`Include card ${index}`}
          className="mt-2"
        />
        <div className="flex-1 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`gfront-${index}`}>Question</Label>
              <Textarea id={`gfront-${index}`} value={card.front} onChange={(e) => onChange({ front: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`gback-${index}`}>Answer</Label>
              <Textarea id={`gback-${index}`} value={card.back} onChange={(e) => onChange({ back: e.target.value })} />
            </div>
          </div>
          {card.distractors.length > 0 && (
            <fieldset className="space-y-1">
              <legend className="text-sm font-medium">Wrong answers (for quizzes)</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {card.distractors.map((d, i) => (
                  <Input
                    key={i}
                    value={d}
                    aria-label={`Wrong answer ${i + 1} for card ${index}`}
                    onChange={(e) => onChange({ distractors: card.distractors.map((x, j) => (j === i ? e.target.value : x)) })}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Discard card ${index}`}>
          <Trash2 />
        </Button>
      </CardContent>
    </Card>
  )
}
