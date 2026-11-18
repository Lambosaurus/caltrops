import type { Dictionary, Rules, RollInfo } from '../rules'
import caltrops from '../caltrops'
import { rangePenalty } from './turn'
import { deriveStats } from './derive'
import type { Mech, MechAttachment, MechRules, TargetBand } from './types'

/** A part's roll. `extra` is any further dice the caller adds (e.g. statDice for the roll's `add` stats). */
export function activationRoll(rules: Rules, att: MechAttachment, target: TargetBand, scores: Dictionary<number>, extra = 0): RollInfo | null {
  if (!att.roll || !rules.mechs) return null
  const bands = rules.mechs.rangeAspects
  const aspect = att.roll.aspect ?? (att.range && att.range !== 'Melee' ? bands[att.range] : bands.Short)
  return {
    attribute: { name: aspect, score: scores[aspect] ?? 0 },
    skill: { name: att.roll.skill, score: scores[att.roll.skill] ?? 0 },
    bonus: (att.roll.bonus ?? 0) - rangePenalty(att, target) + extra,
  }
}

/** Sheet view path of the skill scores mech rolls use: the set the mech rules name, else the ruleset's first set. */
export function mechSkillPath(rules: Rules | undefined): string {
  if (!rules) return 'sheet/skills'
  return caltrops.skillSetPath(rules, rules.mechs?.skillSet ?? caltrops.skillSets(rules)[0]?.id ?? 'skills')
}

/** The dice a roll's `add` list contributes: each named mech stat's current value. */
export function statDice(rules: MechRules, mech: Mech, names: string[] | undefined): { name: string, value: number }[] {
  if (!names?.length) return []
  const stats = deriveStats(rules, mech) as unknown as Dictionary<number>
  return names.map(name => ({ name, value: Number(stats[name] ?? 0) }))
}

/** The roll the ruleset makes after a Sprint (mechs.sprintRoll), or null if it has none. */
export function sprintRoll(rules: Rules, mech: Mech, scores: Dictionary<number>): RollInfo | null {
  const spec = rules.mechs?.sprintRoll
  if (!spec || !rules.mechs) return null
  const aspect = spec.aspect ?? rules.mechs.rangeAspects.Short
  return {
    attribute: { name: aspect, score: scores[aspect] ?? 0 },
    skill: { name: spec.skill, score: scores[spec.skill] ?? 0 },
    bonus: (spec.bonus ?? 0) + statDice(rules.mechs, mech, spec.add).reduce((n, d) => n + d.value, 0),
  }
}
