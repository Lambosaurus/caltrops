import type { Dictionary, Rules, RollInfo } from '../rules'
import { rangePenalty } from './turn'
import type { MechAttachment, RangeBand } from './types'

export function activationRoll(rules: Rules, att: MechAttachment, target: RangeBand, scores: Dictionary<number>): RollInfo | null {
  if (!att.roll || !rules.mechs) return null
  const bands = rules.mechs.rangeAspects
  const aspect = att.roll.aspect ?? (att.range && att.range !== 'Melee' ? bands[att.range] : bands.Short)
  return {
    attribute: { name: aspect, score: scores[aspect] ?? 0 },
    skill: { name: att.roll.skill, score: scores[att.roll.skill] ?? 0 },
    bonus: (att.roll.bonus ?? 0) - rangePenalty(att, target),
  }
}
