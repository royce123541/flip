import type { CSSProperties } from 'react'

/**
 * Palette keys used in sprite grids. Outlines follow the theme (light in night mode);
 * the fills are fixed so sprites keep their identity on any background.
 */
const PALETTE: Record<string, string> = {
  o: 'var(--outline)',
  k: '#1B2A4A', // ink detail drawn on light fills
  c: '#FFCF4A', // coin
  s: '#A7C7E7', // sky
  w: '#D6E6F5', // cloud
  W: '#FFFFFF',
  l: '#4FAF5E', // leaf
  r: '#E14B57', // cherry
}

interface SpriteProps {
  /** One string per row; each character is a palette key, '.' is transparent. */
  grid: readonly string[]
  className?: string
  style?: CSSProperties
  /** Give a title only when the sprite carries meaning; otherwise it is decorative. */
  title?: string
  /** Override palette entries, e.g. { c: 'transparent' } for an empty star. */
  palette?: Record<string, string>
}

/** Renders a text-grid sprite as crisp SVG rects, merging horizontal runs to keep the DOM small. */
export function Sprite({ grid, className, style, title, palette }: SpriteProps) {
  const colours = palette ? { ...PALETTE, ...palette } : PALETTE
  const height = grid.length
  const width = Math.max(...grid.map((row) => row.length))

  const rects: { x: number; y: number; w: number; fill: string }[] = []
  grid.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const key = row[x]
      let end = x + 1
      while (end < row.length && row[end] === key) end++
      const fill = colours[key]
      if (key !== '.' && fill && fill !== 'transparent') rects.push({ x, y, w: end - x, fill })
      x = end
    }
  })

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  )
}
