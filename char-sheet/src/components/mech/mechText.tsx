// Pure popover content for the mech sheet. Components render these; nothing here touches React.
import { findAttachment, findChassis } from '../../lib/mech/loadout'
import { aimCost, deriveStats, hitLabel, mountDisabled, sectionDestroyed, slotsOf, turnEnergy } from '../../lib/mech/derive'
import { activationBlocker, isWeapon, shotKindOf, sprintCost, SHOT_LABEL } from '../../lib/mech/turn'
import type { ChassisSection, Mech, MechAttachment, MechRules, Mount } from '../../lib/mech/types'

/** A headline number: `value` big and bold, `label` small beside it. */
export interface PopStat { value: string, label?: string, tone?: Tone }
export type Tone = 'good' | 'warn' | 'bad'
export interface PopLine { text: string, tone?: Tone }
export interface PopTag { name: string, text: string }

/**
 * Popover content, laid out top to bottom: title, a dim sub line, the headline numbers, live status (coloured),
 * one line per tag, short rule lines, and a dim note.
 */
export interface PopText {
  title: string, sub?: string, stats?: PopStat[], status?: PopLine[], tags?: PopTag[], lines: string[], note?: string,
}

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
  if (att.cooling) return `−${att.cooling}H${att.upkeep ? ` −${att.upkeep}E` : ''}`
  if (att.capacitor) return `store ${att.capacitor}`
  if (att.heatSink) return `+${att.heatSink} max`
  if (att.stowage) return `+${att.stowage} stow`
  if (att.hand) return 'Hand'
  // Other passive parts (rangefinders, meshes): their first real tag.
  if (att.energy === undefined && att.tags) return att.tags.split(',').map(x => x.trim()).find(x => x !== 'Passive') ?? null
  return null
}

export const binCapacity = (rules: MechRules, att: MechAttachment): number =>
  rules.ammo.find(a => a.name === att.bin)?.perBin ?? 0

export function rollText(att: MechAttachment, rules: MechRules): string {
  if (!att.roll) return att.effect ?? ''
  if (isWeapon(att)) return `adds ${signed(att.roll.bonus ?? 0)} dice${att.repeat ? ' per activation' : ''} to the ${SHOT_LABEL[shotKindOf(att)]}`
  const aspect = att.roll.aspect ?? (att.range ? rules.rangeAspects[att.range === 'Melee' ? 'Short' : att.range] : undefined)
  return `${att.effect ? att.effect + ': ' : ''}${aspect ? aspect + ' + ' : ''}${att.roll.skill}${att.roll.bonus ? ` ${signed(att.roll.bonus)}` : ''}`
}

// Tags whose meaning the headline numbers already show.
const SHOWN_AS_STATS = /^(Repeating|Charges|Recharging|Hungry|Heavy|Volatile|Passive|Hand|Stowage)\b/

/**
 * A part's tags with a one-line rule each: the ruleset's short form with X and Y filled in, else the full rule.
 * Tags the headline numbers already cover are left out.
 */
export function tagList(rules: MechRules, tags: string | undefined): PopTag[] {
  if (!tags) return []
  const out: PopTag[] = []
  for (const raw of tags.split(',')) {
    const tag = raw.trim().replace(/ \(while it has points\)$/, '')
    if (!tag || SHOWN_AS_STATS.test(tag) || out.some(t => t.name === tag)) continue
    const base = tag.replace(/ \(.*\)$/, '').replace(/ vs \w+$/, '')
    const x = /\((\d+)/.exec(tag)?.[1] ?? 'X'
    const y = / vs (\w+)/.exec(tag)?.[1] ?? 'Y'
    const text = rules.tagsShort?.[base] ?? rules.tags?.[base] ?? ''
    out.push({ name: tag, text: text.replace(/\bX\b/g, x).replace(/\bY\b/g, y) })
  }
  return out
}

/** The numbers that matter for a part, as headline chips. */
export function keyStats(rules: MechRules, att: MechAttachment): PopStat[] {
  const S: PopStat[] = []
  if (att.type === 'Armour') S.push({ value: `${att.armour ?? 0}`, label: 'points' })
  if (att.reactor) S.push({ value: `+${att.reactor.energy}`, label: 'energy/turn' }, { value: `+${att.reactor.heat}`, label: 'heat/turn' })
  if (att.cooling) S.push({ value: `−${att.cooling}`, label: 'heat/turn' })
  if (att.upkeep) S.push({ value: `−${att.upkeep}`, label: 'energy/turn' })
  if (att.capacitor) S.push({ value: `${att.capacitor}`, label: 'energy stored' })
  if (att.capacitorHeat) S.push({ value: `+${att.capacitorHeat}`, label: 'heat when drawn' })
  if (att.heatSink) S.push({ value: `+${att.heatSink}`, label: 'Heat Max' })
  if (att.stowage) S.push({ value: `${att.stowage}`, label: 'stowage' })
  if (att.bin) {
    const ammo = rules.ammo.find(a => a.name === att.bin)
    S.push({ value: `${ammo?.perBin ?? '?'}`, label: `${att.bin} rounds` })
    if (ammo?.volatility) S.push({ value: `${ammo.volatility}d4`, label: 'per round on cook-off', tone: 'warn' })
  }
  if (att.roll && isWeapon(att)) S.push({ value: `${signed(att.roll.bonus ?? 0)}`, label: 'dice' })
  if (att.range) S.push({ value: att.range })
  if (att.energy !== undefined) S.push({ value: costText(att), label: att.repeat ? 'each' : undefined })
  if (att.repeat) S.push({ value: `×${att.repeat}`, label: 'a turn' })
  if (att.ammo) S.push({ value: `${att.ammoPer ?? 1}`, label: `${att.ammo} ammo` })
  if (att.charges) S.push({ value: `${att.charges}`, label: att.recharge === 'scene' ? 'charges/scene' : 'charges' })
  if (att.roll && !isWeapon(att)) S.push({ value: rollText(att, rules), label: 'roll' })
  else if (!att.roll && att.effect) S.push({ value: att.effect })
  if (att.hand) S.push({ value: 'Hand' })
  if (att.heavy) S.push({ value: `−${att.heavy}`, label: 'Speed', tone: 'warn' })
  if (att.volatile) S.push({ value: `${att.volatile}d4`, label: 'if disabled', tone: 'warn' })
  if (att.selfRepair) S.push({ value: '+1', label: 'point/turn' })
  return S
}

const sizeText = (att: MechAttachment): string => att.type === 'Armour' ? 'Armour'
  : `Size ${att.size ?? 1} ${att.type === 'Generic' ? 'Generic (any slot)' : att.type}`

/** Catalogue popover: shopping details, numbers, tags and the part's flavour. */
export function attachmentPop(rules: MechRules, att: MechAttachment): PopText {
  const sub = [att.kind, att.tier, att.price ? `${att.price.toLocaleString()} Solari` : '', sizeText(att)].filter(Boolean).join(' · ')
  return { title: att.name, sub, stats: keyStats(rules, att), tags: tagList(rules, att.tags), lines: [], note: att.description }
}

export function unknownPartPop(name: string): PopText {
  return { title: `Unknown part: ${name}`, lines: ['Not in this ruleset. It does nothing until replaced.'] }
}

/** A mounted part in play: what it does, and what state it is in right now. */
export function mountPop(rules: MechRules, mech: Mech, sectionId: string, mount: Mount, key: string, editable: boolean): PopText {
  const att = findAttachment(rules, mount.name)
  if (!att) return unknownPartPop(mount.name)
  const wounds = mech.sections[sectionId]?.wounds ?? []
  const slots = slotsOf(rules, mount)
  const hurt = slots.filter(i => wounds[i]).length
  const status: PopLine[] = []
  if (mountDisabled(rules, mech, sectionId, mount)) status.push({ text: 'DISABLED: every slot wounded', tone: 'bad' })
  else if (hurt) status.push({ text: `${hurt}/${slots.length} slots wounded`, tone: 'warn' })
  if (att.bin) status.push({ text: `${mount.ammo ?? 0}/${binCapacity(rules, att)} rounds left`, tone: mount.ammo ? undefined : 'warn' })
  if (att.charges) status.push({ text: `${mount.charges ?? 0}/${att.charges} charges left`, tone: mount.charges ? undefined : 'warn' })
  if (att.energy !== undefined) {
    const used = mech.turn.used[key] ?? 0
    if (used) status.push({ text: `Used ${used}/${att.repeat ?? 1} this turn` })
    const why = activationBlocker(rules, mech, key)
    if (why && editable && !mountDisabled(rules, mech, sectionId, mount)) status.push({ text: why, tone: 'warn' })
    else if (!why && editable) {
      const over = mech.turn.heat + (att.heat ?? 0) - deriveStats(rules, mech).heatMax
      if (mech.turn.heat > deriveStats(rules, mech).heatMax) status.push({ text: `Overheated: using it rolls ${Math.max(0, over)}d4 self-damage`, tone: 'bad' })
    }
  }
  return { title: att.name, sub: [att.kind, sizeText(att)].filter(Boolean).join(' · '), stats: keyStats(rules, att), status, tags: tagList(rules, att.tags), lines: [] }
}

export function sectionPop(rules: MechRules, mech: Mech, section: ChassisSection): PopText {
  const chassis = findChassis(rules, mech.chassis)
  const state = mech.sections[section.id]
  const hurt = (state?.wounds ?? []).filter(Boolean).length
  const total = state?.wounds.length ?? 0
  const armour = state?.armour ? findAttachment(rules, state.armour.name) : undefined
  const stats: PopStat[] = []
  if (state?.armour) stats.push({ value: `${state.armour.points}/${armour?.armour ?? '?'}`, label: 'armour', tone: state.armour.points ? undefined : 'warn' })
  stats.push({ value: `${hurt}/${total}`, label: 'wounds', tone: hurt ? (hurt >= total ? 'bad' : 'warn') : undefined })
  if (section.provides?.speed) stats.push({ value: `${section.provides.speed}`, label: 'Speed' })
  if (section.provides?.evasion) stats.push({ value: `${section.provides.evasion}`, label: 'Evasion' })
  const transferTo = section.transfer && section.transfer !== 'pilot' ? chassis?.sections.find(s => s.id === section.transfer)?.name ?? section.transfer : ''
  const status: PopLine[] = sectionDestroyed(mech, section.id) ? [{ text: 'DESTROYED', tone: 'bad' }] : []
  return {
    title: section.name,
    sub: `d12 ${hitLabel(section)} · aimed shot −${aimCost(section)} dice`,
    stats, status, lines: [
      section.transfer === 'pilot' ? 'Destroyed: further hits go to the pilot.'
        : section.transfer ? `Destroyed: further hits go to the ${transferTo}.`
        : 'Destroyed: the mech is out of action.',
    ],
  }
}

export function armourPop(rules: MechRules, name: string, points: number): PopText {
  const att = findAttachment(rules, name)
  if (!att) return unknownPartPop(name)
  const max = att.armour ?? 0
  return {
    title: att.name,
    stats: [{ value: `${points}/${max}`, label: 'points', tone: points ? undefined : 'warn' }, ...keyStats(rules, att).slice(1)],
    tags: tagList(rules, att.tags),
    lines: ['Each point soaks one wound to this section. Click a pip to set.'],
  }
}

export function slotTypePop(rules: MechRules, typeName: string): PopText {
  const t = rules.slotTypes.find(s => s.name === typeName)
  return { title: `${t?.label ?? (typeName || 'Untyped')} slot`, lines: t ? [t.description] : [] }
}

export function emptySlotPop(rules: MechRules, typeName: string, editable: boolean): PopText {
  const t = slotTypePop(rules, typeName)
  return {
    title: `Empty ${(typeName || 'untyped').toLowerCase()} slot`,
    lines: [...t.lines, 'Still takes a wound when hit.', ...(editable ? ['Drag a matching part here.'] : [])],
  }
}

export function woundPop(section: ChassisSection, index: number, wounded: boolean): PopText {
  return {
    title: `${section.name} slot ${index + 1}`,
    status: [wounded ? { text: 'Wounded', tone: 'bad' } : { text: 'Unwounded' }],
    lines: [wounded ? 'Click to repair (1 Scrap + a check).' : 'Click to mark a wound.'],
  }
}

export type StatKind = 'energy' | 'heat' | 'speed' | 'evasion' | 'hand' | 'stowage'

export function statPop(rules: MechRules, mech: Mech, kind: StatKind): PopText {
  const d = deriveStats(rules, mech), t = mech.turn
  const chassis = findChassis(rules, mech.chassis)
  switch (kind) {
    case 'energy':
      return {
        title: `Energy ${t.energy}/${turnEnergy(d)}`,
        stats: [
          { value: `+${d.energyOut}`, label: 'reactor' },
          ...(d.upkeep ? [{ value: `−${d.upkeep}`, label: 'cooler upkeep' }] : []),
          ...(d.capacitor ? [{ value: `${d.capacitor}`, label: 'can be stored' }] : []),
        ],
        lines: [`Refills to ${turnEnergy(d)} each New turn; unspent energy is lost${d.capacitor ? ' unless stored' : ''}.`],
      }
    case 'heat': {
      const proj = Math.max(0, t.shutdown ? (t.holdShutdown ? t.heat : t.heat - d.cooling) : t.heat + d.reactorHeat - d.cooling)
      const sinks = d.heatMax - d.baseHeatMax
      const status: PopLine[] = []
      if (t.heat > d.heatMax) status.push({ text: `OVERHEATED by ${t.heat - d.heatMax}: every action rolls self-damage`, tone: 'bad' })
      else if (proj > d.heatMax) status.push({ text: `Ends the turn over Heat Max by ${proj - d.heatMax}`, tone: 'warn' })
      return {
        title: `Heat ${t.heat}/${d.heatMax}`,
        sub: `Heat Max ${d.baseHeatMax} chassis${sinks ? ` ${signed(sinks)} sinks` : ''}`,
        stats: [
          { value: `${proj}`, label: 'at end of turn', tone: proj > d.heatMax ? 'warn' : undefined },
          ...(t.shutdown ? [] : [{ value: `+${d.reactorHeat}`, label: 'reactor' }]),
          { value: `−${d.cooling}`, label: 'cooling' },
        ],
        status,
        lines: ['Over Heat Max, each further action rolls 1d4 per point over; each 4 wounds the part that acted.'],
      }
    }
    case 'speed': {
      const sp = sprintCost(rules, mech)
      return {
        title: `Speed ${d.speed}`,
        stats: [
          ...(chassis?.sections ?? []).filter(s => s.provides?.speed).map(s => sectionDestroyed(mech, s.id)
            ? { value: '0', label: `${s.name} (destroyed)`, tone: 'bad' as Tone }
            : { value: `${s.provides?.speed}`, label: s.name }),
          ...(d.heavy ? [{ value: `−${d.heavy}`, label: 'Heavy parts', tone: 'warn' as Tone }] : []),
        ],
        lines: [`Moving is free. Sprint: ${sp.energy}E +${sp.heat}H to move again and gain Evasion.`],
      }
    }
    case 'evasion':
      return { title: `Evasion ${d.evasion}`, lines: ['After a Sprint, attacks against the mech roll this many fewer dice.'] }
    case 'hand':
      return { title: `Hand ${d.hand ? '✓' : '✗'}`, lines: ['Needs a working Manipulator on a surviving arm: grab, carry and use hand-held gear.'] }
    case 'stowage':
      return { title: `Stowage ${(mech.equipment.Stowage ?? []).length}/${d.stowage}`, lines: [
        'Pilot-scale cargo: scrap, supplies, salvage. Lost or out of reach while its rack is destroyed.'] }
  }
}
