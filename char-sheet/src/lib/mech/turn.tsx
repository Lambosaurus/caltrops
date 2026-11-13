import { cloneMech, applyWounds, markOut } from './damage'
import { deriveStats, mountDisabled, mountWorking, sectionDestroyed, slotsOf } from './derive'
import { findAttachment, findChassis, mountKey } from './loadout'
import type { Mech, MechAttachment, MechRules, MechResult, Mount, RangeBand, Roller } from './types'

const BANDS: RangeBand[] = ['Short', 'Mid', 'Long']
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const signed = (n: number) => (n >= 0 ? '+' : '') + n

export function rangePenalty(att: MechAttachment, target: RangeBand): number {
  if (!att.range || att.range === 'Melee') return 0
  const w = BANDS.indexOf(att.range), t = BANDS.indexOf(target)
  return t < w ? w - t : 0
}

export function outOfRange(att: MechAttachment, target: RangeBand): boolean {
  if (!att.range) return false
  if (att.range === 'Melee') return target !== 'Short'
  return BANDS.indexOf(target) > BANDS.indexOf(att.range)
}

function findMountByKey(mech: Mech, key: string): { sectionId: string, mount: Mount } | undefined {
  for (const [sectionId, s] of Object.entries(mech.sections)) {
    const mount = s.mounts.find(m => mountKey(sectionId, m.start) === key)
    if (mount) return { sectionId, mount }
  }
  return undefined
}

function ammoSource(rules: MechRules, mech: Mech, ammo: string): { sectionId: string, mount: Mount } | undefined {
  for (const [sectionId, s] of Object.entries(mech.sections)) {
    for (const m of s.mounts) {
      if (findAttachment(rules, m.name)?.bin === ammo && (m.ammo ?? 0) > 0 && mountWorking(rules, mech, sectionId, m)) return { sectionId, mount: m }
    }
  }
  return undefined
}

// With `target` undefined the range check is skipped.
export function activationBlocker(rules: MechRules, mech: Mech, key: string, target?: RangeBand): string | null {
  const t = mech.turn
  const found = findMountByKey(mech, key)
  const att = found && findAttachment(rules, found.mount.name)
  if (!found || !att) return 'Unknown attachment.'
  if (t.out) return 'Mech is out of action.'
  if (t.shutdown) return 'Shut down until New turn.'
  if (sectionDestroyed(mech, found.sectionId)) return 'Section destroyed.'
  if (mountDisabled(rules, mech, found.sectionId, found.mount)) return 'Disabled: every slot it occupies is wounded.'
  if ((t.used[key] ?? 0) >= (att.repeat ?? 1)) return att.repeat ? `Already activated ${att.repeat}× this turn.` : 'Already activated this turn.'
  const energy = att.energy ?? 0
  if (t.energy < energy) return `Not enough energy: needs ${energy}, have ${t.energy}.`
  if (att.charges && !((found.mount.charges ?? 0) > 0)) return 'No charges left.'
  if (att.ammo && !ammoSource(rules, mech, att.ammo)) return `No working ${att.ammo} ammo bin with rounds.`
  if (target && outOfRange(att, target)) return att.range === 'Melee' ? 'Melee only: target must be Short (engaged).' : `Target is beyond ${att.range} range.`
  return null
}

// Rolled only for an action taken while already overheated; dice = overage after the action.
// `mech` is a private clone that this mutates.
function heatAfterAction(
  rules: MechRules, mech: Mech, wasOver: boolean, actor: { sectionId: string, mount: Mount } | null,
  roller: Roller, events: string[], notices: string[],
): Mech {
  const heatMax = deriveStats(rules, mech).heatMax
  if (mech.turn.heat <= heatMax) return mech
  if (!wasOver) {
    events.push(`OVERHEATED: heat ${mech.turn.heat}/${heatMax}. Every further action rolls self-damage. Shut down & purge to cool.`)
    return mech
  }
  const dice = mech.turn.heat - heatMax
  const chassis = findChassis(rules, mech.chassis)
  const leg = actor ? undefined : chassis?.sections.find(s => s.provides?.speed && !sectionDestroyed(mech, s.id))
  const sectionId = actor?.sectionId ?? leg?.id ?? chassis?.sections.find(s => s.transfer === null)?.id ?? ''
  const partName = actor ? actor.mount.name : leg?.name ?? 'the legs'
  if (!mech.settings.autoHeatDamage) {
    events.push(`  Overheated action: roll ${dice}d4 self-damage on ${partName} and mark wounds by hand.`)
    notices.push(`Overheated: roll ${dice}d4 self-damage on ${partName} and mark wounds by hand.`)
    return mech
  }
  const rolled = roller(dice)
  const hits = rolled.filter(x => x === 4).length
  events.push(`  Overheated action: rolled ${dice}d4 [${rolled.join(' ')}] → ${plural(hits, 'wound')}.`)
  notices.push(`Overheated: rolled ${dice}d4 self-damage on ${partName} → ${plural(hits, 'wound')} applied.`)
  let left = hits
  if (actor) {
    const s = mech.sections[actor.sectionId]
    for (const i of slotsOf(rules, actor.mount)) {
      if (left > 0 && !s.wounds[i]) {
        s.wounds[i] = true
        left--
        events.push(`  heat damage → ${actor.mount.name}`)
      }
    }
    const def = chassis?.sections.find(x => x.id === sectionId)
    if (def && def.transfer === null && sectionDestroyed(mech, sectionId)) markOut(mech, notices)
  } else if (hits) {
    events.push(`  heat damage lands in the ${partName}.`)
  }
  if (left > 0 && sectionId) {
    const res = applyWounds(rules, mech, sectionId, left, { ignoreArmour: true, cookoff: mech.settings.autoCookoff, roller })
    events.push(...res.events)
    notices.push(...res.notices)
    return res.mech
  }
  return mech
}

export function activate(rules: MechRules, mech: Mech, key: string, roller: Roller, target: RangeBand): MechResult {
  if (activationBlocker(rules, mech, key, target) !== null) return { mech, events: [], notices: [] }
  const next = cloneMech(mech)
  const events: string[] = []
  const found = findMountByKey(next, key)!
  const att = findAttachment(rules, found.mount.name)!
  const t = next.turn
  const wasOver = t.heat > deriveStats(rules, next).heatMax
  const energy = att.energy ?? 0, heat = att.heat ?? 0
  t.energy -= energy
  t.heat = Math.max(0, t.heat + heat)
  t.used = { ...t.used, [key]: (t.used[key] ?? 0) + 1 }
  t.lastFired = key
  let extra = ''
  if (att.ammo) {
    if (next.settings.autoAmmo) {
      const src = ammoSource(rules, next, att.ammo)
      if (src) src.mount.ammo = (src.mount.ammo ?? 0) - 1
      extra = `, 1 ${att.ammo} ammo`
    } else extra = `, spend 1 ${att.ammo} ammo by hand`
  }
  if (att.charges) {
    found.mount.charges = (found.mount.charges ?? 0) - 1
    extra = `, ${found.mount.charges} charges left`
  }
  events.push(`${att.name}: −${energy}E ${signed(heat)}H${extra}.`)
  const notices: string[] = []
  return { mech: heatAfterAction(rules, next, wasOver, found, roller, events, notices), events, notices }
}

export function sprintBlocker(rules: MechRules, mech: Mech): string | null {
  const t = mech.turn
  if (t.out) return 'Mech is out of action.'
  if (t.shutdown) return 'Shut down until New turn.'
  if (deriveStats(rules, mech).speed <= 0) return 'Cannot move: no working legs.'
  if (t.used.sprint) return 'Already sprinted this turn.'
  if (t.energy < rules.sprint.energy) return `Not enough energy: needs ${rules.sprint.energy}, have ${t.energy}.`
  return null
}

export function sprint(rules: MechRules, mech: Mech, roller: Roller): MechResult {
  if (sprintBlocker(rules, mech) !== null) return { mech, events: [], notices: [] }
  const { energy, heat } = rules.sprint
  const next = cloneMech(mech)
  const t = next.turn
  const wasOver = t.heat > deriveStats(rules, next).heatMax
  t.energy -= energy
  t.heat += heat
  t.used = { ...t.used, sprint: 1 }
  const d = deriveStats(rules, next)
  const events = [`Sprint: −${energy}E +${heat}H, move up to ${d.speed * 2} in total. Evasion ${d.evasion}.`]
  const notices: string[] = []
  return { mech: heatAfterAction(rules, next, wasOver, null, roller, events, notices), events, notices }
}

// Ends the turn at once: the purge applies now (no reactor heat), actions stay blocked until New turn.
export function shutdownPurge(rules: MechRules, mech: Mech): MechResult {
  if (mech.turn.out || mech.turn.shutdown) return { mech, events: [], notices: [] }
  const d = deriveStats(rules, mech)
  const before = mech.turn.heat
  const heat = Math.max(0, before - d.cooling)
  const next: Mech = { ...mech, turn: { ...mech.turn, heat, shutdown: true, stored: 0 } }
  return {
    mech: next,
    events: [`SHUT DOWN & PURGE: no reactor heat, cooling −${d.cooling}: heat ${before} → ${heat}. Shut down until New turn.`],
    notices: [],
  }
}

export function newTurn(rules: MechRules, mech: Mech): MechResult {
  if (mech.turn.out) return { mech, events: [], notices: [] }
  const d = deriveStats(rules, mech)
  if (mech.turn.shutdown) {
    return {
      mech: { ...mech, turn: { ...mech.turn, shutdown: false, used: {}, stored: 0, energy: d.energyOut } },
      events: [`Rebooted after shutdown: energy ${d.energyOut}.`],
      notices: [],
    }
  }
  const before = mech.turn.heat
  const heat = Math.max(0, before + d.reactorHeat - d.cooling)
  const stored = Math.min(d.capacitor, mech.turn.energy)
  const energy = d.energyOut + stored
  const events = [
    `New turn: heat ${before} +${d.reactorHeat} reactor −${d.cooling} cooling = ${heat}.${heat > d.heatMax ? ' Still overheated.' : ''}`,
    `Power up: energy ${energy}${stored ? ` (incl. ${stored} stored)` : ''}.`,
  ]
  return { mech: { ...mech, turn: { ...mech.turn, heat, stored: 0, energy, used: {} } }, events, notices: [] }
}
