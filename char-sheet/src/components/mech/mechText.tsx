// Pure popover text for the mech sheet. Components render these; nothing here touches React.
import { findAttachment, findChassis } from '../../lib/mech/loadout'
import { aimCost, deriveStats, hitLabel, mountDisabled, sectionDestroyed, slotsOf } from '../../lib/mech/derive'
import { activationBlocker, attackModifier, outOfRange, rangePenalty } from '../../lib/mech/turn'
import type { ChassisSection, Mech, MechAttachment, MechRules, Mount, RangeBand } from '../../lib/mech/types'

export interface PopText { title: string, sub?: string, lines: string[] }

const signed = (n: number) => (n >= 0 ? '+' : '') + n

export const aimText = (section: ChassisSection): string => `(hit: ${hitLabel(section)}) · aim ${aimCost(section)}`

/** Chip text for a slot type: first four letters, upper case. */
export const slotTag = (name: string): string => (name || '').slice(0, 4).toUpperCase()

export function costText(att: MechAttachment): string {
  return `${att.energy ?? 0}E ${signed(att.heat ?? 0)}H`
}

/** Passive value shown in place of an action button, or null if the part has none. */
export function passiveText(att: MechAttachment): string | null {
  if (att.reactor) return `+${att.reactor.energy}E +${att.reactor.heat}H`
  if (att.cooling) return `−${att.cooling}H`
  if (att.capacitor) return `store ${att.capacitor}`
  if (att.heatSink) return `+${att.heatSink} max`
  if (att.stowage) return `+${att.stowage} stow`
  if (att.hand) return 'Hand'
  return null
}

export const binCapacity = (rules: MechRules, att: MechAttachment): number =>
  rules.ammo.find(a => a.name === att.bin)?.perBin ?? 0

export function rollText(att: MechAttachment, rules: MechRules, target?: RangeBand): string {
  if (!att.roll) return att.effect ?? ''
  const aspect = att.roll.aspect ?? (att.range ? rules.rangeAspects[att.range === 'Melee' ? 'Short' : att.range] : undefined)
  let t = `${att.effect ? att.effect + ': ' : ''}${aspect ? aspect + ' + ' : ''}${att.roll.skill}${att.roll.bonus ? ` +${att.roll.bonus}` : ''}`
  const pen = target ? rangePenalty(att, target) : 0
  if (pen > 0) t += ` −${pen} (target inside ${att.range} range)`
  return t
}

/** Stat lines for an attachment (catalogue style, no mount state). */
export function attachmentStats(rules: MechRules, att: MechAttachment, target?: RangeBand): string[] {
  const L: string[] = []
  const size = att.size ?? 1
  L.push(att.type === 'Armour' ? `Armour · ${att.armour ?? 0} points`
    : `Size ${size} · ${att.type === 'Generic' ? 'Generic: fits any slot' : `${att.type} slot${size > 1 ? 's' : ''}`}${size > 1 ? ' (consecutive)' : ''}`)
  if (att.reactor) L.push(`Passive: +${att.reactor.energy} energy every turn, +${att.reactor.heat} heat at end of turn.`)
  if (att.cooling) L.push(`Passive: −${att.cooling} heat at end of turn.`)
  if (att.capacitor) L.push(`Passive: keeps up to ${att.capacitor} unspent energy into next turn.`)
  if (att.hand) L.push('Passive: this arm provides Hand.')
  if (att.heatSink) L.push(`Passive: +${att.heatSink} Heat Max while working.`)
  if (att.stowage) L.push(`Passive: +${att.stowage} stowage slots for pilot-scale gear.`)
  if (att.bin) {
    const ammo = rules.ammo.find(a => a.name === att.bin)
    L.push(`Holds: ${ammo?.perBin ?? '?'} ${att.bin} rounds.`)
    if (ammo) L.push(`Cook-off: ${ammo.volatility}d4 per round left (${ammo.perBin * ammo.volatility}d4 when full).`)
  }
  if (att.energy !== undefined) {
    let c = `Activate: ${att.energy} energy, ${signed(att.heat ?? 0)} heat`
    if (att.ammo) c += `, 1 ${att.ammo} ammo`
    if (att.charges) c += `, 1 charge (of ${att.charges})`
    L.push(c + '.')
    L.push(att.repeat ? `Repeating ${att.repeat}: up to ${att.repeat}× per turn.` : 'Once per turn.')
  }
  if (att.range) L.push(`Range: ${att.range}${att.range === 'Melee' ? ' (target must be Short)' : " (can't fire beyond; −1 die per band closer)"}`)
  if (att.roll) L.push(`Roll: ${rollText(att, rules, target)}${att.range && att.range !== 'Melee' && target ? ` vs ${target} target` : ''}`)
  else if (att.effect) L.push(`Effect: ${att.effect}`)
  if (att.armour) L.push('Each point absorbs one wound to this section. Refilled only at a haven.')
  if (att.tags) L.push(`Tags: ${att.tags}`)
  if (att.description) L.push(att.description)
  return L
}

export function attachmentPop(rules: MechRules, att: MechAttachment): PopText {
  return { title: att.name, lines: attachmentStats(rules, att) }
}

export function unknownPartPop(name: string): PopText {
  return { title: `Unknown part: ${name}`, lines: ['This ruleset has no attachment with that name. It does nothing until replaced.'] }
}

/** A mounted attachment: stats plus wound status and whether it can be activated now. */
export function mountPop(rules: MechRules, mech: Mech, sectionId: string, mount: Mount, key: string, editable: boolean): PopText {
  const att = findAttachment(rules, mount.name)
  if (!att) return unknownPartPop(mount.name)
  const wounds = mech.sections[sectionId]?.wounds ?? []
  const slots = slotsOf(rules, mount)
  const hurt = slots.filter(i => wounds[i]).length
  let status = `Status: ${hurt}/${slots.length} slots wounded`
  if (mountDisabled(rules, mech, sectionId, mount)) status += ' · DISABLED'
  if (att.bin) status += ` · ${mount.ammo ?? 0}/${binCapacity(rules, att)} rounds`
  if (att.charges) status += ` · ${mount.charges ?? 0} charges`
  const lines = [...attachmentStats(rules, att, mech.turn.target)]
  if (att.energy !== undefined) {
    status += ` · used ${mech.turn.used[key] ?? 0}/${att.repeat ?? 1}`
  }
  lines.push(status)
  if (att.energy !== undefined) {
    const why = activationBlocker(rules, mech, key)
    if (why) lines.push(`Can't activate: ${why}`)
    else if (!editable) lines.push('Read only.')
    else {
      lines.push('Click the button to activate.')
      const heatMax = deriveStats(rules, mech).heatMax
      if (mech.turn.heat > heatMax) {
        lines.push(`Overheated: activating rolls ${Math.max(0, mech.turn.heat + (att.heat ?? 0) - heatMax)}d4 self-damage to this part.`)
      }
    }
    if (att.range && outOfRange(att, mech.turn.target)) {
      lines.push(att.range === 'Melee' ? 'Out of range: melee needs a Short target.' : `Out of range: target is ${mech.turn.target}, beyond ${att.range}.`)
    }
  }
  return { title: att.name, lines }
}

export function sectionPop(rules: MechRules, mech: Mech, section: ChassisSection): PopText {
  const chassis = findChassis(rules, mech.chassis)
  const n = section.range[1] - section.range[0] + 1
  const state = mech.sections[section.id]
  const hurt = (state?.wounds ?? []).filter(Boolean).length
  const lines = [
    `Location: d12 ${hitLabel(section)} (${n}/12, ${Math.round(n / 12 * 100)}% of hits).`,
    `Aimed shot: attacker removes ${aimCost(section)} dice (5 − ${n}, min 1) to pick this section.`,
  ]
  const armour = state?.armour ? findAttachment(rules, state.armour.name) : undefined
  lines.push(`Wounds: ${hurt}/${state?.wounds.length ?? 0} slots${state?.armour ? `, armour ${state.armour.points}/${armour?.armour ?? '?'}` : ''}.`)
  const prov = [section.provides?.speed ? `Speed ${section.provides.speed}` : '', section.provides?.evasion ? `Evasion ${section.provides.evasion} (when sprinting)` : ''].filter(Boolean)
  if (prov.length) lines.push(`Provides: ${prov.join(', ')} while not destroyed.`)
  const transferTo = section.transfer && section.transfer !== 'pilot' ? chassis?.sections.find(s => s.id === section.transfer)?.name ?? section.transfer : ''
  lines.push(section.transfer === 'pilot' ? "When destroyed: further hits go to the pilot's Body track."
    : section.transfer ? `When destroyed: overflow hits pass to the ${transferTo}.`
    : 'When destroyed: the mech is out of action.')
  if (sectionDestroyed(mech, section.id)) lines.push('DESTROYED')
  return { title: section.name, sub: aimText(section), lines }
}

export function armourPop(rules: MechRules, name: string, points: number): PopText {
  const att = findAttachment(rules, name)
  if (!att) return unknownPartPop(name)
  return { title: att.name, lines: [...attachmentStats(rules, att), `${points}/${att.armour ?? 0} points left. Click a pip to set by hand.`] }
}

export function slotTypePop(rules: MechRules, typeName: string): PopText {
  const t = rules.slotTypes.find(s => s.name === typeName)
  return { title: `${t?.label ?? (typeName || 'Untyped')} slot`, lines: t ? [t.description] : [] }
}

export function emptySlotPop(rules: MechRules, typeName: string, editable: boolean): PopText {
  const t = slotTypePop(rules, typeName)
  return {
    title: `Empty ${(typeName || 'untyped').toLowerCase()} slot`,
    lines: [...t.lines, 'Still takes a wound when hit, so it acts as padding.', ...(editable ? ['Drag a matching part here.'] : [])],
  }
}

export function woundPop(section: ChassisSection, index: number, wounded: boolean): PopText {
  return {
    title: `${section.name} slot ${index + 1}`,
    lines: [
      wounded ? 'Wounded. Click to repair (field repair: 1 Scrap + check per wound).' : 'Unwounded. Click to mark a wound.',
      'Wounds land top to bottom by default; an attachment is disabled once all its slots are wounded.',
    ],
  }
}

export type StatKind = 'energy' | 'heat' | 'speed' | 'evasion' | 'target' | 'hand' | 'posture' | 'stowage'

export function statPop(rules: MechRules, mech: Mech, kind: StatKind): PopText {
  const d = deriveStats(rules, mech), t = mech.turn
  const chassis = findChassis(rules, mech.chassis)
  switch (kind) {
    case 'energy':
      return { title: `Energy ${t.energy}/${d.energyOut}`, lines: [
        'Refilled to reactor output at the start of each turn. Spend it on activations and sprinting.',
        `Unspent energy is lost${d.capacitor ? `, except up to ${d.capacitor} kept by capacitors` : ''}.`] }
    case 'heat': {
      const proj = Math.max(0, t.heat + (t.shutdown ? 0 : d.reactorHeat) - d.cooling)
      const sinks = d.heatMax - d.baseHeatMax
      const lines = [
        `Heat Max ${d.baseHeatMax} chassis${sinks ? ` ${signed(sinks)} heat sinks` : ''}.`,
        `Activations add heat now. At end of turn: ${t.heat}${t.shutdown ? '' : ` + ${d.reactorHeat} reactor`} − ${d.cooling} cooling = ${proj}.`]
      if (proj > d.heatMax) lines.push(`That is over Heat Max by ${proj - d.heatMax}: you will start next turn overheated.`)
      lines.push('Above Heat Max you are Overheated: every further action rolls d4s equal to the overage after it; each 4 wounds that part.')
      return { title: `Heat ${t.heat}/${d.heatMax}`, lines }
    }
    case 'speed':
      return { title: `Speed ${d.speed}`, lines: [
        ...(chassis?.sections ?? []).filter(s => s.provides?.speed).map(s => `${s.name}: ${sectionDestroyed(mech, s.id) ? 'destroyed' : s.provides?.speed}`),
        `Sum of surviving legs/treads. Moving is free; sprint for ${rules.sprint.energy} energy, +${rules.sprint.heat} heat.`] }
    case 'evasion':
      return { title: `Evasion ${d.evasion}`, lines: ['Sum of surviving legs/treads. While sprinting, attacks against you lose this many dice.'] }
    case 'target':
      return { title: `Target range: ${t.target}`, lines: [
        'Short weapons roll Reflex; Mid and Long roll Precision.',
        "Beyond a weapon's range: can't fire. Inside it: −1 die per band closer.",
        'Melee (punch, hammer, saw) needs Short.'] }
    case 'hand':
      return { title: `Hand ${d.hand ? '✓' : '✗'}`, lines: ['Needs a working Manipulator on a surviving arm. Lets the mech grab, carry and use handheld gear.'] }
    case 'stowage':
      return { title: `Stowage ${(mech.equipment.Stowage ?? []).length}/${d.stowage}`, lines: [
        'Pilot-scale inventory carried by the mech: scrap, supplies, salvage, spare gear.',
        'If a rack is destroyed, the items it held are lost or unreachable until it is repaired.'] }
    case 'posture': {
      const m = attackModifier(rules, mech)
      return { title: 'Mobility', lines: [
        `Stationary: Sitting Duck, attacks against you ${signed(rules.sittingDuck)} dice.`,
        'Moved: no modifier.',
        `Sprinted: attacks against you −evasion (sum of surviving legs: ${d.evasion}).`,
        'Lasts until your next turn starts.',
        `Right now: attackers ${signed(m.total)} dice${m.parts.length ? ` (${m.parts.map(p => p.label).join(', ')})` : ''}.`] }
    }
  }
}
