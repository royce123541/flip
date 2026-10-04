import { useState } from 'react'
import { formatDay, niceMax } from './format'

export interface Column {
  date: string // YYYY-MM-DD
  value: number
}

const W = 640
const H = 200
const M = { top: 16, right: 12, bottom: 28, left: 40 }
const MAX_BAR = 24
/** Single-series column chart: square pixel bars <= 24px with an ink outline, grown from one baseline. The hovered bar turns ink. */
export function ColumnChart({ columns, unit, label }: { columns: Column[]; unit: string; label: string }) {
  const [active, setActive] = useState<number | null>(null)

  const max = niceMax(Math.max(...columns.map((c) => c.value)))
  const innerW = W - M.left - M.right
  const innerH = H - M.top - M.bottom
  const band = innerW / columns.length
  const barW = Math.min(MAX_BAR, band - 6)
  const y = (v: number) => M.top + (1 - v / max) * innerH
  const ticks = [0, max / 2, max]

  return (
    <div className="relative" role="group" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onPointerLeave={() => setActive(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--outline)" strokeOpacity={0.35} strokeWidth={2} strokeDasharray="3 3" />
            <text x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={12} fontFamily="var(--font-sans)" fontWeight={700} fill="var(--muted-foreground)">
              {t.toLocaleString()}
            </text>
          </g>
        ))}

        {columns.map((c, i) => {
          const cx = M.left + band * i + band / 2
          const h = M.top + innerH - y(c.value)
          return (
            <g key={c.date}>
              {h > 0 && (
                <rect x={cx - barW / 2} y={y(c.value)} width={barW} height={h} fill={active === i ? 'var(--foreground)' : 'var(--primary)'} stroke="var(--outline)" strokeWidth={2} />
              )}
              {(columns.length - 1 - i) % 2 === 0 && (  // every other label, always ending on the latest day
                <text x={cx} y={H - 8} textAnchor="middle" fontSize={12} fontFamily="var(--font-sans)" fontWeight={700} fill="var(--muted-foreground)">
                  {formatDay(c.date)}
                </text>
              )}
              {/* Full-height hit area: far bigger than the bar itself, and keyboard-focusable. */}
              <rect
                x={M.left + band * i}
                y={M.top}
                width={band}
                height={innerH}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${formatDay(c.date)}: ${c.value} ${unit}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none focus-visible:stroke-ring"
                strokeWidth={2}
              />
            </g>
          )
        })}
        <line x1={M.left} x2={W - M.right} y1={y(0)} y2={y(0)} stroke="var(--outline)" strokeWidth={3} />
      </svg>

      {active !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap border-3 border-outline bg-popover px-3 py-2 text-sm shadow-sm"
          style={{ left: `${Math.min(90, Math.max(10, ((M.left + band * active + band / 2) / W) * 100))}%` }}
        >
          <p className="font-semibold tabular-nums">{columns[active].value} <span className="font-normal text-muted-foreground">{unit}</span></p>
          <p className="text-xs text-muted-foreground">{formatDay(columns[active].date)}</p>
        </div>
      )}
    </div>
  )
}
