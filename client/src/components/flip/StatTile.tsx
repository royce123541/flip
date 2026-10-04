import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface StatTileProps {
  label: string
  value: ReactNode
  icon?: ReactNode
}

export function StatTile({ label, value, icon }: StatTileProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        {icon && <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
