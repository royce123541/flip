import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { formatDay } from './format'

export interface LinePoint {
  date: string // YYYY-MM-DD
  value: number // 0..1
  detail?: string
}

const W = 640
const H = 220
const M = { top: 20, right: 28, bottom: 28, left: 44 }
const TICKS = [0, 0.25, 0.5, 0.75, 1]
const pct = (v: number) => `${Math.round(v * 100)}%`

/** Single-series percentage line over time. Marks follow the dataviz spec: 2px line, 8px dots with a surface ring, hairline grid. */
export function LineChart({ points, label }: { points: LinePoint[]; label: string }) {
  const [active, setActive] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const times = points.map((p) => Date.parse(`${p.date}T00:00:00Z`))
  const t0 = Math.min(...times)
  const t1 = Math.max(...times)
  const innerW = W - M.left - M.right
  const innerH = H - M.top - M.bottom
  // Position by real date so gaps between quiz days read as gaps; a lone point is centered.
  const x = (i: number) => M.left + (t1 === t0 ? innerW / 2 : ((times[i] - t0) / (t1 - t0)) * innerW)
  const y = (v: number) => M.top + (1 - v) * innerH

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')

  const nearest = (e: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    points.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i
    })
    setActive(best)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const step = e.key === 'ArrowRight' ? 1 : -1
    setActive((a) => Math.min(points.length - 1, Math.max(0, (a ?? points.length - 1) + step)))
  }

  const last = points.length - 1
  const shown = active !== null ? points[active] : null

  return (
    <div
      className="relative"
      tabIndex={0}
      role="group"
      aria-label={`${label}. Use left and right arrow keys to read each point.`}
      onKeyDown={onKey}
      onFocus={() => setActive((a) => a ?? last)}
      onBlur={() => setActive(null)}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-hidden
        onPointerMove={nearest}
        onPointerLeave={() => setActive(null)}
      >
        {TICKS.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
            <text x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--muted-foreground)">
              {pct(t)}
            </text>
          </g>
        ))}

        <text x={x(0)} y={H - 8} textAnchor={points.length > 1 ? 'start' : 'middle'} fontSize={11} fill="var(--muted-foreground)">
          {formatDay(points[0].date)}
        </text>
        {points.length > 1 && (
          <text x={x(last)} y={H - 8} textAnchor="end" fontSize={11} fill="var(--muted-foreground)">
            {formatDay(points[last].date)}
          </text>
        )}

        {active !== null && <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + innerH} stroke="var(--muted-foreground)" strokeWidth={1} />}

        {points.length > 1 && <path d={path} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={x(i)}
            cy={y(p.value)}
            r={active === i ? 5 : 4}
            fill="var(--primary)"
            stroke="var(--card)"
            strokeWidth={2}
          />
        ))}

        {/* Label only the endpoint; the tooltip and table carry the rest. */}
        <text x={x(last)} y={y(points[last].value) - 12} textAnchor="middle" fontSize={12} fontWeight={600} fill="var(--foreground)">
          {pct(points[last].value)}
        </text>
      </svg>

      {shown && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-sm shadow-md"
          style={{ left: `${Math.min(88, Math.max(12, (x(active) / W) * 100))}%` }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-block h-0.5 w-3 rounded bg-primary" aria-hidden />
            <span className="font-semibold tabular-nums">{pct(shown.value)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDay(shown.date)}
            {shown.detail ? ` · ${shown.detail}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}
