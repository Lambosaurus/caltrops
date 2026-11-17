import type { Dictionary, Rules, RollInfo } from '../rules'
import { rangePenalty } from './turn'
import type { MechAttachment, TargetBand } from './types'

/** `evasion` is the mech's Evasion, added only for a dodge roll (Evasive parts). */
export function activationRoll(rules: Rules, att: MechAttachment, target: TargetBand, scores: Dictionary<number>, evasion = 0): RollInfo | null {
  if (!att.roll || !rules.mechs) return null
  const bands = rules.mechs.rangeAspects
  const aspect = att.roll.aspect ?? (att.range && att.range !== 'Melee' ? bands[att.range] : bands.Short)
  return {
    attribute: { name: aspect, score: scores[aspect] ?? 0 },
    skill: { name: att.roll.skill, score: scores[att.roll.skill] ?? 0 },
    bonus: (att.roll.bonus ?? 0) - rangePenalty(att, target) + (att.roll.evasion ? evasion : 0),
  }
}
