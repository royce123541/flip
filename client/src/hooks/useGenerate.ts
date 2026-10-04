import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import type { Card } from '@/lib/types'

export interface Me {
  uid: string
  email: string
  plan: 'free' | 'pro'
  subscriptionStatus: 'none' | 'active' | 'past_due' | 'canceled'
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  hasBillingAccount: boolean
  ai: { used: number; limit: number | null }
}

export interface GenerateResult {
  cards: Card[]
  truncated: boolean
  ai: { used: number; limit: number | null }
}

/**
 * Current user's plan and AI usage. `poll` re-checks every 2s until the user is
 * Pro (used right after checkout while the Stripe webhook lands), up to ~1 minute.
 */
export function useMe(poll = false) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<Me>('/me'),
    enabled: !!user,
    refetchInterval: poll ? (q) => (q.state.data?.plan === 'pro' || q.state.dataUpdateCount > 30 ? false : 2000) : false,
  })
}

export function useGenerate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { text: string } | { file: File }) => {
      if ('file' in input) {
        const form = new FormData()
        form.append('file', input.file)
        return api<GenerateResult>('/generate/pdf', { method: 'POST', body: form })
      }
      return api<GenerateResult>('/generate/text', { method: 'POST', body: JSON.stringify(input) })
    },
    // Quota changed on success, and was possibly refunded on failure: refresh either way.
    onSettled: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
