import { Check, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface PlanCardProps {
  name: string
  price: string
  description: string
  features: { text: string; locked?: boolean }[]
  highlighted?: boolean
  cta: string
  onSelect?: () => void
  disabled?: boolean
}

export function PlanCard({ name, price, description, features, highlighted, cta, onSelect, disabled }: PlanCardProps) {
  return (
    <Card className={highlighted ? 'border-primary shadow-md' : undefined}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {name} {highlighted && <Badge>Popular</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <p className="pt-2 text-3xl font-bold">{price}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f.text} className="flex items-center gap-2">
              {f.locked ? (
                <Lock className="size-4 text-muted-foreground" aria-label="Not included" />
              ) : (
                <Check className="size-4 text-primary" aria-label="Included" />
              )}
              <span className={f.locked ? 'text-muted-foreground' : undefined}>{f.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={highlighted ? 'default' : 'outline'} onClick={onSelect} disabled={disabled}>
          {cta}
        </Button>
      </CardFooter>
    </Card>
  )
}
