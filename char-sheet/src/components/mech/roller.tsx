import type { Roller } from '../../lib/mech/types'

/** The shared dice roller: n d4 results, each 1 to 4. A success is a 4. */
export const roller: Roller = n => Array.from({ length: n }, () => Math.floor(Math.random() * 4) + 1)
