import { mountWorking } from './derive'
import { findAttachment, findChassis } from './loadout'
import type { Mech, MechRules } from './types'

/** A tag as fitted: its armour caveat dropped ('Armoured vs Kinetic (while it has points)' → 'Armoured vs Kinetic'). */
export const tagClean = (tag: string): string => tag.trim().replace(/ \(while it has points\)$/, '')

/** A tag's rule name: 'Deflection (2)' → 'Deflection', 'Armoured vs Kinetic' → 'Armoured'. */
export const tagBase = (tag: string): string => tagClean(tag).replace(/ \(.*\)$/, '').replace(/ vs \w+$/, '')

/** A tag's one-line rule: the ruleset's short form with X (its number) and Y (its damage type) filled in, else the full rule. */
export function tagSummary(rules: MechRules, tag: string): string {
  const clean = tagClean(tag)
  const base = tagBase(clean)
  const x = /\((\d+)/.exec(clean)?.[1] ?? 'X'
  const y = / vs (\w+)/.exec(clean)?.[1] ?? 'Y'
  const text = rules.tagsShort?.[base] ?? rules.tags?.[base] ?? ''
  return text.replace(/\bX\b/g, x).replace(/\bY\b/g, y)
}

/** One standing effect a fitted part gives the whole mech. */
export interface MechEffect {
  tag: string /* as fitted, e.g. 'Deflection (1)' */,
  base: string /* the rule name, e.g. 'Deflection' */,
  text: string /* the one-line rule */,
  part: string, section: string,
  working: boolean /* false while the part is disabled, its section destroyed, or (armour) out of points */,
  notes: string[] /* the part's qualifying tags, e.g. 'Frontal' */,
}

const splitTags = (tags: string | undefined): string[] => (tags ?? '').split(',').map(tagClean).filter(Boolean)

/**
 * The standing effects of a mech's fitted parts and armour: every tag the ruleset names in `effectTags`, in that
 * order, then in section order. Parts that are not working stay listed, marked as such, so the player sees what
 * they lost.
 */
export function mechEffects(rules: MechRules, mech: Mech): MechEffect[] {
  const wanted = rules.effectTags ?? []
  const qualifiers = new Set(rules.effectNotes ?? [])
  const chassis = findChassis(rules, mech.chassis)
  if (!wanted.length || !chassis) return []
  const out: MechEffect[] = []
  const add = (tags: string | undefined, part: string, section: string, working: boolean) => {
    const all = splitTags(tags)
    const notes = all.filter(t => qualifiers.has(tagBase(t)))
    for (const tag of all) {
      if (wanted.includes(tagBase(tag))) {
        out.push({ tag, base: tagBase(tag), text: tagSummary(rules, tag), part, section, working, notes })
      }
    }
  }
  for (const section of chassis.sections) {
    const state = mech.sections[section.id]
    if (!state) continue
    if (state.armour) {
      add(findAttachment(rules, state.armour.name)?.tags, state.armour.name, section.name, state.armour.points > 0)
    }
    for (const mount of state.mounts) {
      add(findAttachment(rules, mount.name)?.tags, mount.name, section.name, mountWorking(rules, mech, section.id, mount))
    }
  }
  const order = (e: MechEffect) => wanted.indexOf(e.base)
  return out.map((e, i) => ({ e, i })).sort((a, b) => order(a.e) - order(b.e) || a.i - b.i).map(x => x.e)
}
