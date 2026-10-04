import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DeckCardProps {
  title: string
  description?: string
  cardCount: number
  dueCount?: number
  onClick?: () => void
}

export function DeckCard({ title, description, cardCount, dueCount = 0, onClick }: DeckCardProps) {
  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
      className="cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" aria-hidden /> {title}
        </CardTitle>
        {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Badge variant="secondary">{cardCount} cards</Badge>
        {dueCount > 0 && <Badge>{dueCount} due</Badge>}
      </CardContent>
    </Card>
  )
}
