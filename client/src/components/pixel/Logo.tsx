/** Flip's mark: two stacked pixel cards (sky behind, coin in front). Same artwork as public/favicon.svg; outlines follow the theme so they show on night panels. */
export function PixelLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={className} aria-hidden focusable="false">
      <path fill="var(--outline)" d="M5 1h9v1h1v8h-1v1H5v-1H4V2h1z" />
      <path fill="#A7C7E7" d="M5 2h9v8H5z" />
      <path fill="var(--outline)" d="M2 5h9v1h1v8h-1v1H2v-1H1V6h1z" />
      <path fill="#FFCF4A" d="M2 6h9v8H2z" />
      <path fill="#1B2A4A" d="M4 8h5v1H4zM4 10h5v1H4zM4 12h3v1H4z" />
    </svg>
  )
}
