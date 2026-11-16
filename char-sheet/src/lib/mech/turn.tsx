import { cloneMech, applyWounds, markOut } from './damage'
import { deriveStats, mountDisabled, mountWorking, sectionDestroyed, slotsOf, turnEnergy } from './derive'
import { findAttachment, findChassis, mountKey } from './loadout'
import type { Dictionary, RollInfo, Rules } from '../rules'
import type { Mech, MechAttachment, MechRules, MechResult, Mount, RangeBand, Roller, ShotKind, ShotPart } from './types'

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

// Working bins of `ammo` that still hold rounds, in loadout order.
function ammoSources(rules: MechRules, mech: Mech, ammo: string): Mount[] {
  const out: Mount[] = []
  for (const [sectionId, s] of Object.entries(mech.sections)) {
    for (const m of s.mounts) {
      if (findAttachment(rules, m.name)?.bin === ammo && (m.ammo ?? 0) > 0 && mountWorking(rules, mech, sectionId, m)) out.push(m)
    }
  }
  return out
}

const roundsLeft = (rules: MechRules, mech: Mech, ammo: string): number =>
  ammoSources(rules, mech, ammo).reduce((n, m) => n + (m.ammo ?? 0), 0)

/** A weapon adds its dice to the turn's one ranged shot or one melee strike instead of rolling on its own. */
export const isWeapon = (att: MechAttachment): boolean => !!att.range && !!att.roll
export const shotKindOf = (att: MechAttachment): ShotKind => (att.range === 'Melee' ? 'strike' : 'shot')
export const SHOT_LABEL: { [k in ShotKind]: string } = { shot: 'ranged shot', strike: 'melee strike' }

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
  const kind = shotKindOf(att)
  if (isWeapon(att) && t.fired[kind]) return `This turn's ${SHOT_LABEL[kind]} is already made.`
  const energy = att.energy ?? 0
  if (t.energy < energy) return `Not enough energy: needs ${energy}, have ${t.energy}.`
  if (att.charges && !((found.mount.charges ?? 0) > 0)) return 'No charges left.'
  const per = att.ammoPer ?? 1
  if (att.ammo && roundsLeft(rules, mech, att.ammo) < per) {
    return per === 1 ? `No working ${att.ammo} ammo bin with rounds.` : `Needs ${per} ${att.ammo} rounds from working ammo bins.`
  }
  if (target && outOfRange(att, target)) return att.range === 'Melee' ? 'Melee only: target must be Short (engaged).' : `Target is beyond ${att.range} range.`
  if (isWeapon(att) && kind === 'shot' && target && t.shot.length && t.shotBand && target !== t.shotBand) {
    return `The pending shot is at ${t.shotBand} range.`
  }
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
  if (hits > 0) notices.push(`Overheated: rolled ${dice}d4 self-damage on ${partName} → ${plural(hits, 'wound')} applied.`)
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
    const per = att.ammoPer ?? 1
    if (next.settings.autoAmmo) {
      let left = per
      for (const bin of ammoSources(rules, next, att.ammo)) {
        const k = Math.min(left, bin.ammo ?? 0)
        bin.ammo = (bin.ammo ?? 0) - k
        left -= k
        if (!left) break
      }
      extra = `, ${per} ${att.ammo} ammo`
    } else extra = `, spend ${per} ${att.ammo} ammo by hand`
  }
  if (att.charges) {
    found.mount.charges = (found.mount.charges ?? 0) - 1
    extra = `, ${found.mount.charges} charges left`
  }
  if (isWeapon(att)) {
    const kind = shotKindOf(att)
    const part: ShotPart = { key, name: att.name, dice: att.roll!.bonus ?? 0, penalty: rangePenalty(att, target) }
    t[kind] = [...t[kind], part]
    if (kind === 'shot') t.shotBand = target
    extra += `; ${signed(part.dice - part.penalty)} dice to the ${SHOT_LABEL[kind]}`
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
  const next: Mech = { ...mech, turn: { ...mech.turn, heat, shutdown: true, stored: 0, shot: [], strike: [], shotBand: null } }
  return {
    mech: next,
    events: [`SHUT DOWN & PURGE: no reactor heat, cooling −${d.cooling}: heat ${before} → ${heat}. Shut down until New turn.`],
    notices: [],
  }
}

const TURN_RESET = { used: {}, shot: [], strike: [], shotBand: null, fired: {} }

// Self-repairing armour regains a point each New turn.
function selfRepair(rules: MechRules, mech: Mech, events: string[]): Mech['sections'] {
  const sections: Mech['sections'] = { ...mech.sections }
  for (const [id, s] of Object.entries(mech.sections)) {
    const att = s.armour ? findAttachment(rules, s.armour.name) : undefined
    if (s.armour && att?.selfRepair && s.armour.points < (att.armour ?? 0)) {
      sections[id] = { ...s, armour: { ...s.armour, points: s.armour.points + 1 } }
      events.push(`${att.name} self-repairs 1 point.`)
    }
  }
  return sections
}

export function newTurn(rules: MechRules, mech: Mech): MechResult {
  if (mech.turn.out) return { mech, events: [], notices: [] }
  const d = deriveStats(rules, mech)
  const repairs: string[] = []
  const sections = selfRepair(rules, mech, repairs)
  const fresh = turnEnergy(d)
  const upkeep = d.upkeep ? ` (${d.energyOut} − ${d.upkeep} cooler upkeep)` : ''
  if (mech.turn.shutdown) {
    return {
      mech: { ...mech, sections, turn: { ...mech.turn, ...TURN_RESET, shutdown: false, stored: 0, energy: fresh } },
      events: [`Rebooted after shutdown: energy ${fresh}${upkeep}.`, ...repairs],
      notices: [],
    }
  }
  const before = mech.turn.heat
  const stored = Math.min(d.capacitor, mech.turn.energy)
  const capHeat = stored > 0 ? d.capacitorHeat : 0
  const heat = Math.max(0, before + d.reactorHeat - d.cooling) + capHeat
  const energy = fresh + stored
  const events = [
    `New turn: heat ${before} +${d.reactorHeat} reactor −${d.cooling} cooling${capHeat ? ` +${capHeat} capacitor draw` : ''} = ${heat}.${heat > d.heatMax ? ' Still overheated.' : ''}`,
    `Power up: energy ${energy}${upkeep}${stored ? `, incl. ${stored} stored` : ''}.`,
    ...repairs,
  ]
  return { mech: { ...mech, sections, turn: { ...mech.turn, ...TURN_RESET, heat, stored: 0, energy } }, events, notices: [] }
}

/** The roll for a shot or strike made of `parts`: the pilot's aspect + skill once, plus every activation's dice. */
export function shotRoll(rules: Rules, parts: ShotPart[], kind: ShotKind, band: RangeBand, scores: Dictionary<number>): RollInfo | null {
  const mr = rules.mechs
  if (!parts.length || !mr) return null
  const biggest = parts.reduce((a, b) => (b.dice > a.dice ? b : a))
  const lead = findAttachment(mr, biggest.name)
  const aspect = kind === 'shot' ? mr.rangeAspects[band] : lead?.roll?.aspect ?? mr.rangeAspects.Short
  const skill = lead?.roll?.skill ?? (kind === 'shot' ? 'Gunnery' : 'Melee')
  return {
    attribute: { name: aspect, score: scores[aspect] ?? 0 },
    skill: { name: skill, score: scores[skill] ?? 0 },
    bonus: parts.reduce((n, p) => n + p.dice - p.penalty, 0),
  }
}

const POOL_ONLY_TAGS = /^(Repeating|Charges|Recharging|Hungry|Reload|Braced|Lobbed|Volatile|Heavy|Missile)\b/

/** The tags a shot or strike carries: every weapon's tags once (numbered tags keep the highest). */
export function shotTags(rules: MechRules, parts: ShotPart[]): string[] {
  const best: { [base: string]: { text: string, n: number } } = {}
  for (const p of parts) {
    for (const raw of (findAttachment(rules, p.name)?.tags ?? '').split(',')) {
      const tag = raw.trim()
      if (!tag || POOL_ONLY_TAGS.test(tag)) continue
      const base = tag.replace(/ \(.*\)$/, '')
      const n = Number(/\((\d+)/.exec(tag)?.[1] ?? 0)
      if (!best[base] || n > best[base].n) best[base] = { text: tag, n }
    }
  }
  return Object.values(best).map(b => b.text)
}

/** The weapons that can join a shot (ranged) or strike (melee), as mount keys, in loadout order. */
export function weaponKeys(rules: MechRules, mech: Mech, kind: ShotKind): string[] {
  const out: string[] = []
  for (const [sectionId, s] of Object.entries(mech.sections)) {
    for (const m of s.mounts) {
      const att = findAttachment(rules, m.name)
      if (att && isWeapon(att) && shotKindOf(att) === kind) out.push(mountKey(sectionId, m.start))
    }
  }
  return out
}

/** How many activations of each weapon an attack uses: mount key -> count. */
export type AttackCounts = { [mountKey: string]: number }

/** The dice an attack would add, without paying anything: one part per activation. */
export function planParts(rules: MechRules, mech: Mech, counts: AttackCounts, band: RangeBand): ShotPart[] {
  const parts: ShotPart[] = []
  for (const [key, n] of Object.entries(counts)) {
    const found = findMountByKey(mech, key)
    const att = found && findAttachment(rules, found.mount.name)
    if (!att?.roll) continue
    for (let i = 0; i < n; i++) parts.push({ key, name: att.name, dice: att.roll.bonus ?? 0, penalty: rangePenalty(att, band) })
  }
  return parts
}

/** Energy and heat an attack's activations would cost. */
export function planCost(rules: MechRules, mech: Mech, counts: AttackCounts): { energy: number, heat: number } {
  let energy = 0, heat = 0
  for (const [key, n] of Object.entries(counts)) {
    const found = findMountByKey(mech, key)
    const att = found && findAttachment(rules, found.mount.name)
    energy += (att?.energy ?? 0) * n
    heat += (att?.heat ?? 0) * n
  }
  return { energy, heat }
}

/**
 * Makes the turn's shot or strike: activates each weapon `counts[key]` times at `band` (paying energy, heat, ammo and
 * charges, with overheat damage as usual), stopping a weapon early if it becomes blocked. Returns the mech with that
 * attack marked as made, and the parts that actually fired, to roll with shotRoll.
 */
export function attack(rules: MechRules, mech: Mech, kind: ShotKind, band: RangeBand, counts: AttackCounts, roller: Roller): MechResult & { parts: ShotPart[] } {
  let m = clearShot(mech, kind)
  const events: string[] = []
  const notices: string[] = []
  for (const [key, n] of Object.entries(counts)) {
    for (let i = 0; i < n; i++) {
      if (activationBlocker(rules, m, key, band) !== null) break
      const res = activate(rules, m, key, roller, band)
      m = res.mech
      events.push(...res.events)
      notices.push(...res.notices)
    }
  }
  const parts = m.turn[kind]
  return { mech: fireShot(m, kind), events, notices, parts }
}

/** Marks the pending shot or strike as rolled: the pool empties and no weapon can join that kind again this turn. */
export function fireShot(mech: Mech, kind: ShotKind): Mech {
  if (!mech.turn[kind].length) return mech
  const band = kind === 'shot' ? { shotBand: null } : {}
  return { ...mech, turn: { ...mech.turn, [kind]: [], ...band, fired: { ...mech.turn.fired, [kind]: true } } }
}

/** Drops the pending shot or strike without rolling it. Costs already paid stay paid. */
export function clearShot(mech: Mech, kind: ShotKind): Mech {
  const band = kind === 'shot' ? { shotBand: null } : {}
  return { ...mech, turn: { ...mech.turn, [kind]: [], ...band } }
}

export interface TurnAdjust { energy?: number, heat?: number, stored?: number, pilotWounds?: number, shutdown?: boolean, out?: boolean }

/** GM override: sets turn values directly (heat damage, a dunk in water, a power surge). Numbers floor at 0. */
export function adjustTurn(mech: Mech, change: TurnAdjust): Mech {
  const t = { ...mech.turn }
  for (const k of ['energy', 'heat', 'stored', 'pilotWounds'] as const) {
    const v = change[k]
    if (v !== undefined) t[k] = Math.max(0, Math.floor(v) || 0)
  }
  if (change.shutdown !== undefined) t.shutdown = change.shutdown
  if (change.out !== undefined) t.out = change.out
  return { ...mech, turn: t }
}

/** Sets a mounted part's charges, clamped to 0..its maximum. */
export function setCharges(rules: MechRules, mech: Mech, key: string, value: number): Mech {
  const found = findMountByKey(mech, key)
  const max = found ? findAttachment(rules, found.mount.name)?.charges : undefined
  if (!found || !max) return mech
  const v = Math.max(0, Math.min(max, Math.floor(value) || 0))
  const s = mech.sections[found.sectionId]
  const mounts = s.mounts.map(m => (m === found.mount ? { ...m, charges: v } : m))
  return { ...mech, sections: { ...mech.sections, [found.sectionId]: { ...s, mounts } } }
}

/** New scene: Recharging parts refill their charges. */
export function newScene(rules: MechRules, mech: Mech): MechResult {
  const events: string[] = []
  const sections: Mech['sections'] = {}
  for (const [id, s] of Object.entries(mech.sections)) {
    sections[id] = {
      ...s,
      mounts: s.mounts.map(m => {
        const att = findAttachment(rules, m.name)
        if (att?.recharge !== 'scene' || !att.charges || m.charges === att.charges) return m
        events.push(`${att.name} recharges to ${att.charges}.`)
        return { ...m, charges: att.charges }
      }),
    }
  }
  return { mech: { ...mech, sections }, events, notices: [] }
}
