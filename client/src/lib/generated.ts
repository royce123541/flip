import type { Card } from './types'

const KEY = 'flip.generated'

export interface GeneratedDraft {
  cards: Card[]
  truncated: boolean
}

/**
 * Generated cards cost a quota unit, so keep them across a page refresh
 * until the user saves or discards them. sessionStorage can be unavailable
 * (private mode, blocked storage); the draft is then simply not persisted.
 */
export function saveDraft(draft: GeneratedDraft) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    /* ignore */
  }
}

export function loadDraft(): GeneratedDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GeneratedDraft) : null
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
