import { cloneMech, applyWounds } from './damage'
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

export function activationBlocker(rules: MechRules, mech: Mech, key: string): string | null {
  const t = mech.turn
  const found = findMountByKey(mech, key)
  const att = found && findAttachment(rules, found.mount.name)
  if (!found || !att) return 'Unknown attachment.'
  if (t.out) return 'Mech is out of action.'
  if (t.phase === 'ended' && t.shutdown) return 'Shut down until your next turn.'
  if (t.phase !== 'active') return 'Turn ended: press Start turn.'
  if (sectionDestroyed(mech, found.sectionId)) return 'Section destroyed.'
  if (mountDisabled(rules, mech, found.sectionId, found.mount)) return 'Disabled: every slot it occupies is wounded.'
  if ((t.used[key] ?? 0) >= (att.repeat ?? 1)) return att.repeat ? `Already activated ${att.repeat}× this turn.` : 'Already activated this turn.'
  const energy = att.energy ?? 0
  if (t.energy < energy) return `Not enough energy: needs ${energy}, have ${t.energy}.`
  if (att.charges && !((found.mount.charges ?? 0) > 0)) return 'No charges left.'
  if (att.ammo && !ammoSource(rules, mech, att.ammo)) return `No working ${att.ammo} ammo bin with rounds.`
  if (outOfRange(att, t.target)) return att.range === 'Melee' ? 'Melee only: set target range to Short (engaged).' : `Target is beyond ${att.range} range.`
  return null
}

export function attackModifier(rules: MechRules, mech: Mech): { total: number, parts: { value: number, label: string }[] } {
  const parts: { value: number, label: string }[] = []
  const t = mech.turn
  if (t.posture === 'still') parts.push({ value: rules.sittingDuck, label: 'sitting duck' })
  if (t.posture === 'sprint') {
    const evasion = deriveStats(rules, mech).evasion
    if (evasion) parts.push({ value: -evasion, label: 'evasion (sprinting)' })
  }
  if (t.shutdown) parts.push({ value: rules.stunned, label: 'shut down / stunned' })
  return { total: parts.reduce((a, p) => a + p.value, 0), parts }
}

// Rolled only for an action taken while already overheated; dice = overage after the action.
// `mech` is a private clone that this mutates.
function heatAfterAction(
  rules: MechRules, mech: Mech, wasOver: boolean, actor: { sectionId: string, mount: Mount } | null,
  roller: Roller, events: string[],
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
    return mech
  }
  const rolled = roller(dice)
  const hits = rolled.filter(x => x === 4).length
  events.push(`  Overheated action: rolled ${dice}d4 [${rolled.join(' ')}] → ${plural(hits, 'wound')}.`)
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
    if (def && def.transfer === null && sectionDestroyed(mech, sectionId)) mech.turn.out = true
  } else if (hits) {
    events.push(`  heat damage lands in the ${partName}.`)
  }
  if (left > 0 && sectionId) {
    const res = applyWounds(rules, mech, sectionId, left, { ignoreArmour: true, cookoff: mech.settings.autoCookoff, roller })
    events.push(...res.events)
    return res.mech
  }
  return mech
}

export function activate(rules: MechRules, mech: Mech, key: string, roller: Roller): MechResult {
  if (activationBlocker(rules, mech, key) !== null) return { mech, events: [] }
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
  return { mech: heatAfterAction(rules, next, wasOver, found, roller, events), events }
}

function canMove(rules: MechRules, mech: Mech): boolean {
  return mech.turn.phase === 'active' && !mech.turn.out && deriveStats(rules, mech).speed > 0
}

export function move(rules: MechRules, mech: Mech): MechResult {
  if (!canMove(rules, mech) || mech.turn.posture !== 'still') return { mech, events: [] }
  const speed = deriveStats(rules, mech).speed
  return {
    mech: { ...mech, turn: { ...mech.turn, posture: 'moved' } },
    events: [`Move: up to ${speed}. No longer a sitting duck.`],
  }
}

export function sprint(rules: MechRules, mech: Mech, roller: Roller): MechResult {
  const { energy, heat } = rules.sprint
  if (!canMove(rules, mech) || mech.turn.posture === 'sprint' || mech.turn.energy < energy) return { mech, events: [] }
  const next = cloneMech(mech)
  const t = next.turn
  const wasOver = t.heat > deriveStats(rules, next).heatMax
  t.energy -= energy
  t.heat += heat
  t.posture = 'sprint'
  const d = deriveStats(rules, next)
  const events = [`Sprint: −${energy}E +${heat}H, move up to ${d.speed * 2} in total. Evasion ${d.evasion}: attacks against you −${d.evasion} dice.`]
  return { mech: heatAfterAction(rules, next, wasOver, null, roller, events), events }
}

function enemyPhaseEvent(rules: MechRules, mech: Mech): string {
  const m = attackModifier(rules, mech)
  return `Enemy phase: attacks against this mech ${signed(m.total)} dice${m.parts.length ? ` (${m.parts.map(p => p.label).join(', ')})` : ''}.`
}

export function endTurn(rules: MechRules, mech: Mech): MechResult {
  if (mech.turn.phase !== 'active' || mech.turn.out) return { mech, events: [] }
  const d = deriveStats(rules, mech)
  const before = mech.turn.heat
  const heat = Math.max(0, before + d.reactorHeat - d.cooling)
  const next: Mech = { ...mech, turn: { ...mech.turn, heat, stored: Math.min(d.capacitor, mech.turn.energy), phase: 'ended' } }
  return {
    mech: next,
    events: [
      `End of turn: heat ${before} +${d.reactorHeat} reactor −${d.cooling} cooling = ${heat}.${heat > d.heatMax ? ' Still overheated.' : ''}`,
      enemyPhaseEvent(rules, next),
    ],
  }
}

export function shutdownPurge(rules: MechRules, mech: Mech): MechResult {
  if (mech.turn.phase !== 'active' || mech.turn.out) return { mech, events: [] }
  const d = deriveStats(rules, mech)
  const before = mech.turn.heat
  const heat = Math.max(0, before - d.cooling)
  const next: Mech = { ...mech, turn: { ...mech.turn, heat, shutdown: true, stored: 0, phase: 'ended' } }
  return {
    mech: next,
    events: [
      `SHUT DOWN & PURGE: turn ends. No reactor heat, cooling −${d.cooling}: heat ${before} → ${heat}. Stunned until your next turn.`,
      enemyPhaseEvent(rules, next),
    ],
  }
}

export function startTurn(rules: MechRules, mech: Mech): MechResult {
  if (mech.turn.phase !== 'ended' || mech.turn.out) return { mech, events: [] }
  const d = deriveStats(rules, mech)
  const stored = mech.turn.stored
  const energy = d.energyOut + stored
  const events: string[] = []
  if (mech.turn.shutdown) events.push('Rebooting after shutdown.')
  events.push(`Power up: energy ${energy}${stored ? ` (incl. ${stored} stored)` : ''}.`)
  const next: Mech = { ...mech, turn: { ...mech.turn, phase: 'active', used: {}, posture: 'still', shutdown: false, energy, stored: 0 } }
  if (next.turn.heat > d.heatMax) events.push(`Starting overheated (${next.turn.heat}/${d.heatMax}): every action rolls self-damage.`)
  return { mech: next, events }
}
