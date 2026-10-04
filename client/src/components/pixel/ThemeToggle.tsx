import { useTheme } from 'next-themes'
import { Moon, Sun } from '@/components/pixel/icons'
import { Button } from '@/components/ui/button'

/** Switches between the day (sky) and night palettes. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const night = resolvedTheme === 'dark'

  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      aria-label={night ? 'Switch to day mode' : 'Switch to night mode'}
      onClick={() => setTheme(night ? 'light' : 'dark')}
    >
      {night ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
