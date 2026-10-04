/*
 * Hand-drawn sprites as text grids (see Sprite.tsx for the palette).
 * o outline · k ink · c coin · s sky · w cloud · W white · l leaf · r cherry · . transparent
 */

/** Open, empty card box: no decks yet / empty deck / no data. */
export const emptyBox = [
  '................',
  '................',
  '...oooooooooo...',
  '..oskkkkkkkkso..',
  '.oskkkkkkkkkkso.',
  'oooooooooooooooo',
  'owwwwwwwwwwwwwwo',
  'owwwwwwwwwwwwwwo',
  'owwwwoooooowwwwo',
  'owwwwocccccowwwo',
  'owwwwoooooowwwwo',
  'owwwwwwwwwwwwwwo',
  'owwwwwwwwwwwwwwo',
  'oooooooooooooooo',
  '................',
  '................',
] as const

/** A card asleep with "z"s: nothing due right now. */
export const sleepingCard = [
  '...........oooo.',
  '.............o..',
  '............o...',
  '...........oooo.',
  '.ooooooooooo....',
  '.owwwwwwwwwo....',
  '.owwwwwwwwwo....',
  '.owkkkwkkkwo....',
  '.owwwwwwwwwo....',
  '.owwwwwwwwwo....',
  '.owwwkkkwwwo....',
  '.owwwwwwwwwo....',
  '.owwwwwwwwwo....',
  '.ooooooooooo....',
  '..oooooooooo....',
  '................',
] as const

/** A neat pile of cards with a gold star: session complete. */
export const finishedPile = [
  '.......o........',
  '......oco.......',
  '...oooocoooo....',
  '...occccccco....',
  '....occccco.....',
  '....ococoo......',
  '................',
  '..oooooooooooo..',
  '..owwwwwwwwwwo..',
  '.oooooooooooooo.',
  '.osssssssssssso.',
  'oooooooooooooooo',
  'occcccccccccccco',
  'ockkkkkkkkkkkkco',
  'occcccccccccccco',
  'oooooooooooooooo',
] as const

/** Magnifying glass: no search results. */
export const magnifier = [
  '................',
  '...ooooo........',
  '..owwwwwo.......',
  '.owWWwwwwo......',
  '.owWwwwwwo......',
  '.owwwwwwwo......',
  '.owwwwwwwo......',
  '..owwwwwo.......',
  '...oooooo.......',
  '........ooo.....',
  '.........ooo....',
  '..........ooo...',
  '...........ooo..',
  '............oo..',
  '................',
  '................',
] as const

/** A small gold coin with a highlight. */
export const coin = [
  '..oooo..',
  '.occcco.',
  'occWccco',
  'occWccco',
  'occWccco',
  'occcccco',
  '.occcco.',
  '..oooo..',
] as const

/** A star; pass palette { c: 'transparent' } to draw an empty one. */
export const star = [
  '.....o.....',
  '....oco....',
  '....oco....',
  'ooooocooooo',
  'occccccccco',
  '.occccccco.',
  '..occccco..',
  '..occocco..',
  '.occo.occo.',
  '.ooo...ooo.',
] as const
