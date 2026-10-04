import { useEffect, useState } from 'react'

const TEXT_STEPS = ['Reading your notes', 'Picking out key ideas', 'Writing questions', 'Adding wrong answers for quizzes']
const PDF_STEPS = ['Reading your PDF', ...TEXT_STEPS.slice(1)]
const STEP_MS = 2500
const CELLS = 10

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Shown while AI generation runs. The server reports no progress, so the bar is indeterminate
 * (a run of blocks marching across) rather than a made-up percentage. The status line advances
 * through the stages and stays on the last one until the request finishes.
 */
export function GenerateProgress({ source }: { source: 'text' | 'pdf' }) {
  const steps = source === 'pdf' ? PDF_STEPS : TEXT_STEPS
  const [step, setStep] = useState(0)
  const [still] = useState(reducedMotion)

  useEffect(() => {
    if (step >= steps.length - 1) return
    const t = setTimeout(() => setStep((s) => s + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [step, steps.length])

  return (
    <div className="space-y-3 border-3 border-outline bg-card p-4 shadow-sm">
      <div className="relative h-7 overflow-hidden border-2 border-outline bg-background p-[3px]" aria-hidden>
        <div className="flex h-full gap-[3px]">
          {Array.from({ length: CELLS }, (_, i) => (
            <span key={i} className={still && i < CELLS / 2 ? 'flex-1 bg-primary' : 'flex-1 bg-muted'} />
          ))}
        </div>
        {!still && (
          <div className="absolute inset-y-[3px] left-[3px] flex w-[30%] animate-[px-march_1.2s_steps(10,end)_infinite] gap-[3px]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex-1 border-2 border-outline bg-primary" />
            ))}
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" className="font-pixel text-base">
        {steps[step]}…
      </p>
    </div>
  )
}
