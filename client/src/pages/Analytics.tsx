import { BarChart3, Flame, Layers, Lock, Target, Trophy } from '@/components/pixel/icons'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sprite } from '@/components/pixel/Sprite'
import { emptyBox } from '@/components/pixel/sprites'
import { EmptyState } from '@/components/flip/EmptyState'
import { StatTile } from '@/components/flip/StatTile'
import { ChartCard } from '@/components/flip/charts/ChartCard'
import { ColumnChart } from '@/components/flip/charts/ColumnChart'
import { formatDay } from '@/components/flip/charts/format'
import { LineChart } from '@/components/flip/charts/LineChart'
import { MasteryBars } from '@/components/flip/charts/MasteryBars'
import { useAnalytics, type FullAnalytics } from '@/hooks/useAnalytics'

const pct = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}%`)

export default function Analytics() {
  const { data, isLoading, error } = useAnalytics()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
      </div>
    )
  }
  if (error || !data) return <p role="alert" className="text-destructive">{error?.message ?? 'Could not load analytics'}</p>

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Cards due" value={data.dueCards} icon={<Layers className="size-5" />} />
        <StatTile label="Total cards" value={data.totalCards} icon={<Layers className="size-5" />} />
        <StatTile label="Quizzes taken" value={data.quizzesTaken} icon={<BarChart3 className="size-5" />} />
        <StatTile label="Quiz accuracy" value={pct(data.accuracy)} icon={<Target className="size-5" />} />
        <StatTile label="Current streak" value={`${data.streak.current} day${data.streak.current === 1 ? '' : 's'}`} icon={<Flame className="size-5" />} />
        <StatTile label="Longest streak" value={`${data.streak.longest} day${data.streak.longest === 1 ? '' : 's'}`} icon={<Trophy className="size-5" />} />
      </div>

      {data.full ? <FullCharts data={data} /> : <Locked />}
    </div>
  )
}

function Locked() {
  return (
    <div className="space-y-3 border-3 border-dashed border-outline bg-card p-10 text-center">
      <Lock className="mx-auto size-8 text-muted-foreground" aria-hidden />
      <h2 className="text-lg font-semibold">Full analytics is a Pro feature</h2>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">
        See your accuracy trend, daily study activity, and how well you know each deck.
      </p>
      <Button render={<Link to="/pricing" />} nativeButton={false}>See Pro</Button>
    </div>
  )
}

function FullCharts({ data }: { data: FullAnalytics }) {
  const totalReviews = data.reviewsPerDay.reduce((n, d) => n + d.count, 0)

  return (
    <div className="space-y-6">
      <ChartCard
        title="Quiz accuracy"
        description="Share of questions answered correctly, by day, over the last 30 days"
        table={{
          columns: ['Date', 'Accuracy', 'Questions'],
          rows: data.accuracyTrend.map((p) => [formatDay(p.date), pct(p.accuracy), p.questions]),
        }}
      >
        {data.accuracyTrend.length === 0 ? (
          <EmptyState icon={<Sprite grid={emptyBox} className="size-16" />} title="No quizzes yet" description="Take a quiz and your accuracy trend will show up here." />
        ) : (
          <LineChart
            label="Quiz accuracy over the last 30 days"
            points={data.accuracyTrend.map((p) => ({ date: p.date, value: p.accuracy, detail: `${p.questions} question${p.questions === 1 ? '' : 's'}` }))}
          />
        )}
      </ChartCard>

      <ChartCard
        title="Cards reviewed"
        description="Flashcard ratings and quiz answers per day, last 14 days"
        table={{ columns: ['Date', 'Cards reviewed'], rows: data.reviewsPerDay.map((d) => [formatDay(d.date), d.count]) }}
      >
        {totalReviews === 0 ? (
          <EmptyState icon={<Sprite grid={emptyBox} className="size-16" />} title="No reviews in the last 14 days" description="Study a deck or take a quiz to start your streak." />
        ) : (
          <ColumnChart label="Cards reviewed per day, last 14 days" unit="cards" columns={data.reviewsPerDay.map((d) => ({ date: d.date, value: d.count }))} />
        )}
      </ChartCard>

      <ChartCard
        title="Deck progress"
        description={`A card counts as mastered once it is scheduled ${data.masteredAfterDays}+ days out`}
        table={{
          columns: ['Deck', 'Mastered', 'Learning', 'Not learned yet', 'Total'],
          rows: data.mastery.map((m) => [m.title, m.mastered, m.learning, m.notLearned, m.total]),
        }}
      >
        {data.mastery.length === 0 ? (
          <EmptyState icon={<Sprite grid={emptyBox} className="size-16" />} title="No decks yet" description="Create a deck to track your progress." />
        ) : (
          <MasteryBars rows={data.mastery} />
        )}
      </ChartCard>
    </div>
  )
}
