import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type Grade = 'again' | 'hard' | 'good' | 'easy'

export interface StudyCard {
  id: string
  deckId: string
  deckTitle: string
  front: string
  back: string
}

export interface StudyQueue {
  total: number
  cards: StudyCard[]
}

export interface QuizQuestionData {
  cardId: string
  question: string
  options: string[]
  correctIndex: number
}

export interface QuizData {
  deckId: string
  title: string
  questions: QuizQuestionData[]
}

export interface AttemptData {
  id: string
  deckId: string
  score: number
  total: number
  answers: { chosen: string; correct: boolean; front: string; back: string }[]
}

/** Fetched once per session (no refetch) so the local queue isn't reshuffled mid-study. */
export const useStudyQueue = (deckId: string | undefined, all: boolean) =>
  useQuery({
    queryKey: ['study-queue', deckId ?? 'all-decks', all],
    queryFn: () => {
      const params = new URLSearchParams()
      if (deckId) params.set('deckId', deckId)
      if (all) params.set('all', '1')
      return api<StudyQueue>(`/study/queue?${params}`)
    },
    staleTime: Infinity,
    gcTime: 0,
  })

export function useReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { deckId: string; cardId: string; grade: Grade }) =>
      api<{ due: string; interval: number }>('/study/review', { method: 'POST', body: JSON.stringify(v) }),
    // due counts on the dashboard / deck list are now stale
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decks'] }),
  })
}

export const useQuiz = (deckId: string | undefined, count: string | null) =>
  useQuery({
    queryKey: ['quiz', deckId, count],
    queryFn: () => api<QuizData>(`/quiz/${deckId}?count=${count}`),
    enabled: !!deckId && !!count,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  })

export function useSubmitQuiz() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ deckId, answers }: { deckId: string; answers: { cardId: string; chosen: string }[] }) =>
      api<{ id: string }>(`/quiz/${deckId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decks'] }),
  })
}

export const useAttempt = (id: string | undefined) =>
  useQuery({ queryKey: ['attempt', id], queryFn: () => api<AttemptData>(`/quiz/attempts/${id}`), enabled: !!id })
