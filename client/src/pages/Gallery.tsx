import { useState } from 'react'
import { Flame, Layers, Moon, Sun, Target } from '@/components/pixel/icons'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { DeckCard } from '@/components/flip/DeckCard'
import { EmptyState } from '@/components/flip/EmptyState'
import { FileDropzone } from '@/components/flip/FileDropzone'
import { FlashCard } from '@/components/flip/FlashCard'
import { PlanCard } from '@/components/flip/PlanCard'
import { QuizQuestion } from '@/components/flip/QuizQuestion'
import { StatTile } from '@/components/flip/StatTile'
import { ChartCard } from '@/components/flip/charts/ChartCard'
import { ColumnChart } from '@/components/flip/charts/ColumnChart'
import { LineChart } from '@/components/flip/charts/LineChart'
import { MasteryBars } from '@/components/flip/charts/MasteryBars'
import { UsageMeter } from '@/components/flip/UsageMeter'

const sampleTrend = [
  ['2026-03-02', 0.55, 10], ['2026-03-03', 0.6, 10], ['2026-03-05', 0.58, 20], ['2026-03-06', 0.7, 10],
  ['2026-03-09', 0.74, 10], ['2026-03-10', 0.82, 20], ['2026-03-13', 0.8, 10], ['2026-03-14', 0.9, 10],
] as const
const sampleReviews = [4, 0, 12, 18, 9, 0, 7, 22, 15, 3, 0, 11, 26, 14].map((count, i) => ({
  date: `2026-03-${String(i + 1).padStart(2, '0')}`,
  count,
}))
const sampleMastery = [
  { deckId: '1', title: 'Biology 101', total: 42, mastered: 18, learning: 16, notLearned: 8 },
  { deckId: '2', title: 'Organic Chemistry — Reaction Mechanisms and Named Reactions', total: 30, mastered: 3, learning: 9, notLearned: 18 },
  { deckId: '3', title: 'Empty deck', total: 0, mastered: 0, learning: 0, notLearned: 0 },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
      <Separator />
    </section>
  )
}

export default function Gallery() {
  const { resolvedTheme, setTheme } = useTheme()
  const [picked, setPicked] = useState<number>()
  const [revealed, setRevealed] = useState(false)

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Flip · Component Gallery</h1>
        <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </header>

      <Section title="Buttons & badges">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Badge>Pro</Badge>
          <Badge variant="secondary">Free</Badge>
          <Button variant="outline" onClick={() => toast.success('Deck saved')}>Toast</Button>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Deck title</Label>
            <Input id="title" placeholder="Biology — Chapter 3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Paste notes</Label>
            <Textarea id="notes" placeholder="Paste lecture notes…" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="shuffle" defaultChecked />
            <Label htmlFor="shuffle">Shuffle questions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="dark" />
            <Label htmlFor="dark">Show answers immediately</Label>
          </div>
          <RadioGroup defaultValue="10" className="flex gap-4">
            {['10', '20', 'all'].map((v) => (
              <div key={v} className="flex items-center gap-2">
                <RadioGroupItem value={v} id={`q-${v}`} />
                <Label htmlFor={`q-${v}`}>{v}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Section>

      <Section title="Flashcard (click or Space)">
        <FlashCard front="What organelle produces ATP?" back="The mitochondrion" />
      </Section>

      <Section title="Quiz question">
        <QuizQuestion
          index={3}
          total={10}
          question="Which organelle produces most of the cell's ATP?"
          options={['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome']}
          selected={picked}
          correctIndex={revealed ? 1 : undefined}
          onSelect={setPicked}
        />
        <Button variant="outline" disabled={picked === undefined} onClick={() => setRevealed((r) => !r)}>
          {revealed ? 'Reset' : 'Check answer'}
        </Button>
      </Section>

      <Section title="Dashboard widgets">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Cards due" value={14} icon={<Layers className="size-5" />} />
          <StatTile label="Accuracy" value="82%" icon={<Target className="size-5" />} />
          <StatTile label="Day streak" value={6} icon={<Flame className="size-5" />} />
        </div>
        <div className="grid max-w-md gap-6">
          <UsageMeter used={2} limit={5} />
          <UsageMeter used={4} limit={5} />
          <UsageMeter used={5} limit={5} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DeckCard title="Biology 101" description="Cell structure and metabolism" cardCount={42} dueCount={8} onClick={() => toast('Open deck')} />
          <Skeleton className="h-32" />
        </div>
      </Section>

      <Section title="Charts">
        <div className="space-y-4">
          <ChartCard
            title="Quiz accuracy"
            description="Share of questions answered correctly, by day"
            table={{ columns: ['Date', 'Accuracy', 'Questions'], rows: sampleTrend.map(([d, a, q]) => [d, `${Math.round(a * 100)}%`, q]) }}
          >
            <LineChart label="Quiz accuracy" points={sampleTrend.map(([date, value, q]) => ({ date, value, detail: `${q} questions` }))} />
          </ChartCard>
          <ChartCard title="Cards reviewed" description="Per day, last 14 days" table={{ columns: ['Date', 'Cards'], rows: sampleReviews.map((r) => [r.date, r.count]) }}>
            <ColumnChart label="Cards reviewed per day" unit="cards" columns={sampleReviews.map((r) => ({ date: r.date, value: r.count }))} />
          </ChartCard>
          <ChartCard title="Deck progress" description="Cards by how well you know them" table={{ columns: ['Deck', 'Mastered'], rows: sampleMastery.map((m) => [m.title, m.mastered]) }}>
            <MasteryBars rows={sampleMastery} />
          </ChartCard>
        </div>
      </Section>

      <Section title="Upload & empty state">
        <FileDropzone onFile={(f) => toast.success(f.name)} onError={(m) => toast.error(m)} />
        <EmptyState icon={<Layers className="size-8" />} title="No decks yet" description="Create your first deck manually or let AI build one from your notes." action={<Button>Create deck</Button>} />
      </Section>

      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <PlanCard
            name="Free"
            price="₱0"
            description="For trying Flip out"
            cta="Current plan"
            features={[{ text: '5 AI generations / month' }, { text: 'Paste-text input' }, { text: 'PDF upload', locked: true }, { text: 'Full analytics', locked: true }]}
          />
          <PlanCard
            name="Pro"
            price="₱149/mo"
            description="For serious studying"
            highlighted
            cta="Upgrade"
            features={[{ text: 'Unlimited AI generations' }, { text: 'Paste-text input' }, { text: 'PDF upload' }, { text: 'Full analytics' }]}
          />
        </div>
      </Section>
    </main>
  )
}
