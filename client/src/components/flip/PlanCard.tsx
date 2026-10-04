import { Check, Lock } from '@/components/pixel/icons'
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
    <Card className={highlighted ? 'shadow-lg' : undefined}>
      <CardHeader className={highlighted ? '-mt-(--card-spacing) border-b-3 border-outline bg-primary pt-(--card-spacing) pb-(--card-spacing) text-primary-foreground' : undefined}>
        <CardTitle className="flex items-center gap-2">
          {name} {highlighted && <Badge variant="secondary">Popular</Badge>}
        </CardTitle>
        <CardDescription className={highlighted ? 'text-primary-foreground' : undefined}>{description}</CardDescription>
        <p className="pt-2 text-3xl font-bold">{price}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f.text} className="flex items-center gap-2">
              {f.locked ? (
                <Lock className="size-5 text-muted-foreground" aria-label="Not included" />
              ) : (
                <Check className="size-5" aria-label="Included" />
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
