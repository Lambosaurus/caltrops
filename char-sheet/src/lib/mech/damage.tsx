import { findAttachment, findChassis, mountCovering } from './loadout'
import { mountWrecked } from './derive'
import type { Chassis, Mech, MechRoll, MechRules, MechSectionState, Mount, Roller, MechResult } from './types'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// Deep copy of the parts of a mech that damage touches, so inputs are never mutated.
export function cloneMech(mech: Mech): Mech {
  const sections: Mech['sections'] = {}
  for (const [id, s] of Object.entries(mech.sections)) {
    sections[id] = {
      armour: s.armour ? { ...s.armour } : null,
      mounts: s.mounts.map(m => ({ ...m, ...(m.state ? { state: { ...m.state } } : {}) })),
      wounds: [...s.wounds],
    }
  }
  return { ...mech, sections, turn: { ...mech.turn } }
}

function withSection(mech: Mech, sectionId: string, change: (s: MechSectionState) => MechSectionState): Mech {
  if (!mech.sections[sectionId]) return mech
  return { ...mech, sections: { ...mech.sections, [sectionId]: change(mech.sections[sectionId]) } }
}

const sectionDef = (chassis: Chassis | undefined, id: string) => chassis?.sections.find(x => x.id === id)
const sectionName = (chassis: Chassis | undefined, id: string): string => sectionDef(chassis, id)?.name ?? id

const coreDestroyed = (rules: MechRules, mech: Mech): boolean => {
  const core = findChassis(rules, mech.chassis)?.sections.find(s => s.transfer === null)
  const wounds = core ? mech.sections[core.id]?.wounds ?? [] : []
  return wounds.length > 0 && wounds.every(Boolean)
}

// Marks the mech out of action once, with a notice.
export function markOut(mech: Mech, notices: string[]) {
  if (mech.turn.out) return
  mech.turn.out = true
  notices.push('Mech is out of action.')
}

/** Cook-off dice: a Volatile (X) part's X. An ammo bin only cooks off while it holds rounds; any other part once. */
export function cookoffDice(rules: MechRules, mount: Mount): number {
  const att = findAttachment(rules, mount.name)
  if (!att?.volatile) return 0
  const armed = att.bin ? (mount.ammo ?? 0) > 0 : !mount.state?.cooked
  return armed ? att.volatile : 0
}

interface Opts { ignoreArmour?: boolean, cookoff: boolean, roller: Roller, rolls?: MechRoll[] /* collects cook-off rolls */ }

function apply(rules: MechRules, mech: Mech, startId: string, count: number, ignoreArmour: boolean, opts: Opts, events: string[], notices: string[]) {
  const chassis = findChassis(rules, mech.chassis)
  let sectionId: string | null = startId
  let n = Math.max(0, Math.floor(count))
  while (n > 0 && sectionId) {
    if (sectionId === 'pilot') {
      mech.turn.pilotWounds += n
      events.push(`  ${plural(n, 'wound')} pass through the open cockpit to the PILOT.`)
      notices.push(`${plural(n, 'wound')} pass through the open cockpit to the PILOT.`)
      return
    }
    const def = sectionDef(chassis, sectionId)
    const s: MechSectionState | undefined = mech.sections[sectionId]
    if (!def || !s) return
    if (!ignoreArmour && s.armour && s.armour.points > 0) {
      const k = Math.min(n, s.armour.points)
      s.armour.points -= k
      n -= k
      events.push(`  ${def.name}: armour absorbs ${k}.`)
      continue
    }
    const i = s.wounds.findIndex(w => !w)
    if (i < 0) {
      if (def.transfer === null) {
        markOut(mech, notices)
        events.push('  CORE DESTROYED. Mech out of action.')
        return
      }
      events.push(`  ${def.name} destroyed; ${n} pass to ${def.transfer === 'pilot' ? 'pilot' : sectionName(chassis, def.transfer)}.`)
      sectionId = def.transfer
      continue
    }
    s.wounds[i] = true
    n--
    const hit = mountCovering(rules, mech, sectionId, i)
    const what = hit ? hit.name : def.slots[i] === 'Hull' ? 'hull' : 'empty'
    events.push(`  ${def.name} slot ${i + 1}: ${what} wounded${hit && mountWrecked(rules, mech, sectionId, hit) ? ' → DISABLED' : ''}.`)
    checkCookoffs(rules, mech, sectionId, opts, events, notices)
    if (s.wounds.every(Boolean)) events.push(`  ${def.name} DESTROYED.`)
  }
  if (coreDestroyed(rules, mech)) markOut(mech, notices)
}

function checkCookoffs(rules: MechRules, mech: Mech, sectionId: string, opts: Opts, events: string[], notices: string[]) {
  for (const m of mech.sections[sectionId].mounts) {
    const att = findAttachment(rules, m.name)
    const dice = cookoffDice(rules, m)
    if (!att || !dice || !mountWrecked(rules, mech, sectionId, m)) continue
    const what = `Volatile (${att.volatile})`
    // A Volatile part cooks off once; repairing it re-arms it (see toggleWound).
    if (!att.bin) m.state = { ...(m.state ?? {}), cooked: true }
    const where = sectionName(findChassis(rules, mech.chassis), sectionId)
    if (!opts.cookoff) {
      events.push(`  ${m.name} disabled${att.bin ? ` with ${m.ammo} rounds` : ''}: cook-off is ${dice}d4 to this section, armour first. Apply by hand.`)
      notices.push(`${m.name} cook-off: roll ${dice}d4 on this section, armour first. Apply by hand.`)
      opts.rolls?.push({ label: `Cook-off: ${m.name} (${what}) in the ${where}. Each success is a hit there, armour first: apply by hand`, dice })
      continue
    }
    const rolled = opts.roller(dice)
    const k = rolled.filter(x => x === 4).length
    const line = `COOK-OFF: ${m.name}, ${what} = ${dice}d4 [${rolled.join(' ')}] → ${plural(k, 'hit')} on the ${where}, armour first.`
    events.push(`  ${line}`)
    notices.push(line)
    opts.rolls?.push({ label: `Cook-off: ${m.name} in the ${where} → ${plural(k, 'hit')} (applied)`, dice, rolled })
    if (att.bin) m.ammo = 0
    if (k) apply(rules, mech, sectionId, k, false, opts, events, notices)
  }
}

export function applyWounds(rules: MechRules, mech: Mech, sectionId: string, count: number, opts: Opts): MechResult {
  const next = cloneMech(mech)
  const events: string[] = []
  const notices: string[] = []
  const rolls: MechRoll[] = opts.rolls ?? []
  apply(rules, next, sectionId, count, !!opts.ignoreArmour, { ...opts, rolls }, events, notices)
  return { mech: next, events, notices, rolls }
}

// Manual-mode hit: soak armour, then mark slots in this section only. No overflow, cook-off or out/pilot changes.
export function markWounds(rules: MechRules, mech: Mech, sectionId: string, count: number, ignoreArmour: boolean): MechResult {
  const next = cloneMech(mech)
  const s = next.sections[sectionId]
  if (!s) return { mech: next, events: [], notices: [] }
  let n = Math.max(0, Math.floor(count))
  const name = sectionName(findChassis(rules, mech.chassis), sectionId)
  const events: string[] = []
  if (!ignoreArmour && s.armour && s.armour.points > 0) {
    const k = Math.min(n, s.armour.points)
    s.armour.points -= k
    n -= k
    if (k > 0) events.push(`${name}: armour absorbs ${k}.`)
  }
  let marked = 0
  for (let i = 0; i < s.wounds.length && n > 0; i++) {
    if (!s.wounds[i]) { s.wounds[i] = true; n--; marked++ }
  }
  if (marked > 0) events.push(`${plural(marked, 'wound')} marked on ${name}`)
  return { mech: next, events, notices: [] }
}

export function toggleWound(rules: MechRules, mech: Mech, sectionId: string, slot: number): Mech {
  const s = mech.sections[sectionId]
  if (!s || slot < 0 || slot >= s.wounds.length) return mech
  let next = withSection(mech, sectionId, sec => ({ ...sec, wounds: sec.wounds.map((w, i) => (i === slot ? !w : w)) }))
  // A repaired Volatile part can cook off again.
  next = withSection(next, sectionId, sec => ({
    ...sec,
    mounts: sec.mounts.map(m => (m.state?.cooked && !mountWrecked(rules, next, sectionId, m) ? { ...m, state: { ...m.state, cooked: false } } : m)),
  }))
  return { ...next, turn: { ...next.turn, out: coreDestroyed(rules, next) } }
}

/**
 * Disrupts the part covering `slot`, or restores it if already disrupted. A disrupted part is disabled but takes no
 * wounds (so it never cooks off). Analog parts cannot be disrupted; an empty slot or an Analog part changes nothing.
 */
export function toggleDisrupt(rules: MechRules, mech: Mech, sectionId: string, slot: number): Mech {
  const mount = mountCovering(rules, mech, sectionId, slot)
  const att = mount && findAttachment(rules, mount.name)
  if (!mount || !att || (!mount.disrupted && /\bAnalog\b/.test(att.tags ?? ''))) return mech
  return withSection(mech, sectionId, sec => ({
    ...sec,
    mounts: sec.mounts.map(m => (m === mount ? { ...m, disrupted: !m.disrupted } : m)),
  }))
}

export function setArmourPoints(rules: MechRules, mech: Mech, sectionId: string, points: number): Mech {
  const a = mech.sections[sectionId]?.armour
  if (!a) return mech
  const max = findAttachment(rules, a.name)?.armour ?? a.points
  return withSection(mech, sectionId, s => ({ ...s, armour: { ...a, points: clamp(Math.floor(points) || 0, 0, max) } }))
}

export function adjustAmmo(rules: MechRules, mech: Mech, key: string, delta: number): Mech {
  const [sectionId, startStr] = key.split(':')
  const start = Number(startStr)
  const s = mech.sections[sectionId]
  const m = s?.mounts.find(x => x.start === start)
  const bin = m && findAttachment(rules, m.name)?.bin
  if (!m || !bin) return mech
  const perBin = rules.ammo.find(a => a.name === bin)?.perBin ?? 0
  return withSection(mech, sectionId, sec => ({
    ...sec, mounts: sec.mounts.map(x => (x === m ? { ...x, ammo: clamp((x.ammo ?? 0) + delta, 0, perBin) } : x)),
  }))
}
