/** "2026-03-05" -> "Mar 5". Built from parts so the browser's timezone can't shift the day. */
export function formatDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Rounds a max up to a tight, clean value whose half is also clean (1, 2, 3, 4, 6, 8, 10 × 10ⁿ). */
export function niceMax(max: number): number {
  if (max <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(max))
  const n = max / pow
  return ([1, 2, 3, 4, 6, 8, 10].find((s) => n <= s) ?? 10) * pow
}
