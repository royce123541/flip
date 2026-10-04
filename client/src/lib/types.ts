export interface Card {
  id?: string
  front: string
  back: string
  distractors: string[]
}

export interface DeckSummary {
  id: string
  title: string
  description: string
  cardCount: number
  dueCount: number
  updatedAt: string
}

export interface Deck {
  id: string
  title: string
  description: string
  cards: (Card & { id: string; due: string })[]
}

export interface DeckInput {
  title: string
  description: string
  cards: Card[]
}
