import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartCardProps {
  title: string
  description?: string
  /** Every value the chart shows, so nothing depends on hover. */
  table: { columns: string[]; rows: (string | number)[][] }
  children: ReactNode
}

/** Card chrome shared by all charts, with a chart/table switch (the accessible fallback for every value). */
export function ChartCard({ title, description, table, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardAction>
          <Button variant="ghost" size="sm" aria-pressed={showTable} onClick={() => setShowTable((v) => !v)}>
            {showTable ? 'View chart' : 'View table'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {showTable ? (
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  {table.columns.map((c) => (
                    <th key={c} scope="col" className="py-2 pr-4 font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 pr-4 tabular-nums">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
