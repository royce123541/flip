import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Deck, DeckInput, DeckSummary } from '@/lib/types'

export const useDecks = () => useQuery({ queryKey: ['decks'], queryFn: () => api<DeckSummary[]>('/decks') })

export const useDeck = (id: string | undefined) =>
  useQuery({ queryKey: ['deck', id], queryFn: () => api<Deck>(`/decks/${id}`), enabled: !!id })

export function useDeckMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['decks'] })

  const create = useMutation({
    mutationFn: (data: DeckInput) => api<Deck>('/decks', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeckInput }) =>
      api<Deck>(`/decks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (deck) => {
      qc.setQueryData(['deck', deck.id], deck)
      return invalidate()
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`/decks/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
  const duplicate = useMutation({
    mutationFn: (id: string) => api<Deck>(`/decks/${id}/duplicate`, { method: 'POST' }),
    onSuccess: invalidate,
  })

  return { create, update, remove, duplicate }
}
