import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface BasicFields {
  totalCards: number
  dueCards: number
  quizzesTaken: number
  accuracy: number | null
  streak: { current: number; longest: number }
}

export interface BasicAnalytics extends BasicFields {
  full: false
}

export interface FullAnalytics extends BasicFields {
  full: true
  accuracyTrend: { date: string; accuracy: number; questions: number }[]
  reviewsPerDay: { date: string; count: number }[]
  mastery: { deckId: string; title: string; total: number; mastered: number; learning: number; notLearned: number }[]
  masteredAfterDays: number
}

export type Analytics = BasicAnalytics | FullAnalytics

export const useAnalytics = () =>
  useQuery({
    queryKey: ['analytics'],
    // The server buckets days in the viewer's timezone so streaks match their calendar.
    queryFn: () => api<Analytics>(`/analytics?tz=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`),
    staleTime: 0,
  })
