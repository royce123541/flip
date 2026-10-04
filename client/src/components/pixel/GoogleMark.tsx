/**
 * Google "G" redrawn on a 12×12 pixel grid in Google's four brand colours, on a white tile
 * with a theme-coloured outline so it stays legible in both day and night palettes.
 * Note: Google's sign-in branding guidelines ask for the unmodified G; swap in the official
 * mark before any public launch or OAuth brand verification.
 */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-2 -2 16 16" shapeRendering="crispEdges" className={className} aria-hidden focusable="false">
      <rect x="-2" y="-2" width="16" height="16" fill="var(--outline)" />
      <rect x="-1" y="-1" width="14" height="14" fill="#FFFFFF" />
      {/* red: top arc */}
      <path fill="#EA4335" d="M3 0h6v1H3zM1 1h9v1H1zM0 2h3v1H0zM0 3h2v1H0z" />
      {/* yellow: left side */}
      <path fill="#FBBC05" d="M0 4h2v4H0z" />
      {/* green: bottom arc */}
      <path fill="#34A853" d="M0 8h2v1H0zM0 9h3v1H0zM1 10h8v1H1zM3 11h6v1H3z" />
      {/* blue: crossbar and right side */}
      <path fill="#4285F4" d="M6 5h6v2H6zM10 7h2v2h-2zM9 9h2v2H9z" />
    </svg>
  )
}
