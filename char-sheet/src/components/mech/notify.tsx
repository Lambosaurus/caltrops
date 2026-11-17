// Internal imports
import { alertInfo, alertWarning } from '../../lib/alerts'
import foundry from '../../lib/foundry'
import type { MechResult, MechRoll } from '../../lib/mech/types'

/** Toast each notice: info when it reports something already applied, a warning when the player must act. */
export function showNotices(notices: string[]): void {
  for (const n of notices) {
    if (n.includes('applied')) {
      alertInfo(n)
    } else {
      alertWarning(n)
    }
  }
}

/**
 * Sends a result's rolls to the VTT, labelled with the mech's name: a roll the player must make goes as a d4 pool for
 * Foundry to roll; one the sheet already rolled and applied goes as a chat line with its dice.
 */
export function sendRolls(rolls: MechRoll[], who?: string): void {
  if (!rolls.length || !foundry.isPresent()) {
    return
  }
  for (const r of rolls) {
    const text = who ? `${who}: ${r.label}` : r.label
    if (r.rolled) {
      foundry.submitChat(`${text}. Rolled ${r.dice}d4 [${r.rolled.join(' ')}].`)
    } else {
      foundry.submitDice(r.dice, text)
    }
  }
}

/** Toasts a result's notices and sends its rolls to the VTT. */
export function showResult(res: MechResult, who?: string): void {
  showNotices(res.notices)
  sendRolls(res.rolls ?? [], who)
}
