import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface MasteryRow {
  deckId: string
  title: string
  total: number
  mastered: number
  learning: number
  notLearned: number
}

// Further along = stronger fill. Each segment is outlined in ink, so states never rely on colour alone. Order = stack order.
const SEGMENTS = [
  { key: 'mastered', label: 'Mastered', swatch: 'bg-primary' },
  { key: 'learning', label: 'Learning', swatch: 'bg-chart-2' },
  { key: 'notLearned', label: 'Not learned yet', swatch: 'bg-background' },
] as const

/** Stacked horizontal bars of card progress per deck, as outlined pixel segments with a 3px gap. */
export function MasteryBars({ rows }: { rows: MasteryRow[] }) {
  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Legend">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className={`inline-block size-4 border-2 border-outline ${s.swatch}`} aria-hidden />
            <span className="text-muted-foreground">{s.label}</span>
          </li>
        ))}
      </ul>

      <ul className="space-y-4">
        {rows.map((row) => {
          const masteredPct = row.total ? Math.round((row.mastered / row.total) * 100) : 0
          return (
            <li key={row.deckId} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="truncate font-medium">{row.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {masteredPct}% mastered · {row.total} cards
                </span>
              </div>
              {row.total === 0 ? (
                <p className="text-sm text-muted-foreground">No cards yet.</p>
              ) : (
                <div className="flex h-5 gap-[3px]">
                  {SEGMENTS.filter((s) => row[s.key] > 0).map((s) => (
                    <Tooltip key={s.key}>
                      <TooltipTrigger
                        render={
                          <div
                            tabIndex={0}
                            role="img"
                            aria-label={`${row.title}: ${row[s.key]} ${s.label.toLowerCase()}`}
                            className={`border-2 border-outline ${s.swatch}`}
                            style={{ flexGrow: row[s.key], flexBasis: 0 }}
                          />
                        }
                      />
                      <TooltipContent>
                        <span className="font-semibold tabular-nums">{row[s.key]}</span> {s.label.toLowerCase()}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
