import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Check, FileUp, Sparkles } from '@/components/pixel/icons'
import { Sprite } from '@/components/pixel/Sprite'
import { finishedPile } from '@/components/pixel/sprites'
import { Button } from '@/components/ui/button'
import { CoinCounter } from '@/components/flip/CoinCounter'
import { FlashCard } from '@/components/flip/FlashCard'
import { Stars } from '@/components/flip/Stars'
import { TodayPanel } from '@/components/flip/TodayPanel'
import { useAuth } from '@/hooks/useAuth'
import { useProPrice } from '@/hooks/useBilling'

const SAMPLE = {
  front: 'What does the mitochondrion produce for the cell?',
  back: 'ATP, the cell’s main energy currency',
}

const STEPS = [
  {
    title: 'Add your notes',
    body: 'Paste lecture notes or a textbook passage. On Pro, upload a whole PDF.',
    icon: <FileUp className="size-6" />,
  },
  {
    title: 'Review what the AI wrote',
    body: 'Flip drafts question-and-answer cards plus wrong answers for quizzes. Edit or drop any card before saving.',
    icon: <Sparkles className="size-6" />,
  },
  {
    title: 'Study a little each day',
    body: 'Rate each card from Again to Easy. Flip brings it back right before you would forget it.',
    icon: <Check className="size-6" />,
  },
]

// Static copy of the study screen's answer keys, with the intervals a brand-new card would get.
const GRADES = [
  ['Again', '10 min'],
  ['Hard', '1 day'],
  ['Good', '1 day'],
  ['Easy', '3 days'],
] as const

export default function Landing() {
  const { user, loading } = useAuth()
  const { data: price } = useProPrice()
  const [coins, setCoins] = useState(12)

  // Wait for the sign-in check so signed-in people never see a flash of the landing page.
  if (loading) return null
  // Signed-in people came to study, not to be sold to.
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="space-y-24 pb-8">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-4 md:grid-cols-[1fr_minmax(0,28rem)]">
        <div className="space-y-6">
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">Your notes, flipped into flashcards.</h1>
          <p className="max-w-prose text-lg">
            Paste lecture notes or upload a PDF. Flip writes the flashcards and quiz questions, then tells you exactly when to review
            each one, so your study time goes to what you are about to forget.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg" render={<Link to="/signup" />} nativeButton={false}>
              Start free
            </Button>
            <Button variant="link" render={<Link to="/pricing" />} nativeButton={false}>
              See pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Free plan: unlimited decks and 5 AI generations a month. No card needed.</p>
        </div>

        <div className="pt-6 pr-6">
          <div className="relative">
            {/* The one load moment: two cards land on the pile behind the demo card. */}
            <div aria-hidden className="absolute -top-6 -right-6 bottom-6 left-6 border-3 border-outline bg-chart-2 animate-[px-land_480ms_steps(4,end)_both]" />
            <div aria-hidden className="absolute -top-3 -right-3 bottom-3 left-3 border-3 border-outline bg-card animate-[px-land_480ms_steps(4,end)_120ms_both]" />
            <FlashCard front={SAMPLE.front} back={SAMPLE.back} className="relative" />
          </div>
          <p className="pt-4 text-center text-sm text-muted-foreground">Click the card to flip it.</p>
        </div>
      </section>

      {/* How it works: a real sequence, so it is numbered. */}
      <section aria-labelledby="how-title" className="space-y-8">
        <h2 id="how-title" className="text-3xl font-bold">How it works</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="space-y-3 border-3 border-outline bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center border-3 border-outline bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{s.icon}</span>
              </div>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What studying feels like, built from the real app components. */}
      <section aria-labelledby="study-title" className="space-y-8">
        <div className="max-w-prose space-y-3">
          <h2 id="study-title" className="text-3xl font-bold">Studying that keeps score</h2>
          <p className="text-lg text-muted-foreground">
            Every answer earns coins, streaks reward showing up daily, and each session ends with up to three stars.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-4 border-3 border-outline bg-card p-6 shadow-sm">
            <h3 className="text-xl font-bold">You decide when a card comes back</h3>
            <p className="text-muted-foreground">Each answer shows when you will see that card again.</p>
            <div inert className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Example answer buttons">
              {GRADES.map(([label, wait]) => (
                <div key={label} className="flex flex-col items-center gap-1 border-3 border-outline bg-background p-2.5 shadow-sm">
                  <span className="font-pixel text-sm font-semibold">{label}</span>
                  <span className="text-xs text-muted-foreground">{wait}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 border-3 border-outline bg-card p-6 text-center shadow-sm">
            <Sprite grid={finishedPile} className="size-20" />
            <h3 className="text-xl font-bold">Session complete</h3>
            <Stars earned={3} />
            <div className="flex items-center gap-3">
              <CoinCounter coins={coins} />
              <Button variant="outline" size="sm" onClick={() => setCoins((c) => c + 1)}>
                Earn a coin
              </Button>
            </div>
          </div>
        </div>

        <div inert aria-label="Example of the dashboard's today panel">
          <TodayPanel due={14} decks={3} cards={120} streak={6} />
        </div>
      </section>

      {/* Pricing teaser, using the live Stripe price. */}
      <section aria-labelledby="price-title" className="grid gap-6 border-3 border-outline bg-card p-8 shadow-md md:grid-cols-2 md:items-center">
        <div className="space-y-3">
          <h2 id="price-title" className="text-3xl font-bold">Free to start</h2>
          <p className="text-lg text-muted-foreground">
            The free plan covers unlimited decks, flashcards, quizzes and 5 AI generations a month.
            {price && ` Pro is ${price.label} for unlimited AI, PDF uploads and full analytics.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button size="lg" render={<Link to="/signup" />} nativeButton={false}>
            Create a free account
          </Button>
          <Button size="lg" variant="outline" render={<Link to="/pricing" />} nativeButton={false}>
            Compare plans
          </Button>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t-3 border-outline pt-6 text-sm">
        <span className="font-pixel text-base font-bold">Flip</span>
        <nav aria-label="Footer" className="flex gap-6">
          <Link className="underline-offset-4 hover:underline" to="/pricing">Pricing</Link>
          <Link className="underline-offset-4 hover:underline" to="/login">Log in</Link>
          <Link className="underline-offset-4 hover:underline" to="/signup">Sign up</Link>
        </nav>
      </footer>
    </div>
  )
}
