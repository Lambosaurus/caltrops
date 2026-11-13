import { findAttachment, findChassis, mountCovering } from './loadout'
import { mountDisabled } from './derive'
import type { Mech, MechRules, MechSectionState, Mount, Roller, MechResult } from './types'

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

// Deep copy of the parts of a mech that damage touches, so inputs are never mutated.
export function cloneMech(mech: Mech): Mech {
  const sections: Mech['sections'] = {}
  for (const [id, s] of Object.entries(mech.sections)) {
    sections[id] = {
      armour: s.armour ? { ...s.armour } : null,
      mounts: s.mounts.map(m => ({ ...m })),
      wounds: [...s.wounds],
    }
  }
  return { ...mech, sections, turn: { ...mech.turn } }
}

function withSection(mech: Mech, sectionId: string, change: (s: MechSectionState) => MechSectionState): Mech {
  if (!mech.sections[sectionId]) return mech
  return { ...mech, sections: { ...mech.sections, [sectionId]: change(mech.sections[sectionId]) } }
}

const coreDestroyed = (rules: MechRules, mech: Mech): boolean => {
  const core = findChassis(rules, mech.chassis)?.sections.find(s => s.transfer === null)
  const wounds = core ? mech.sections[core.id]?.wounds ?? [] : []
  return wounds.length > 0 && wounds.every(Boolean)
}

export function cookoffDice(rules: MechRules, mount: Mount): number {
  const bin = findAttachment(rules, mount.name)?.bin
  const volatility = rules.ammo.find(a => a.name === bin)?.volatility ?? 1
  return Math.max(0, mount.ammo ?? 0) * volatility
}

interface Opts { ignoreArmour?: boolean, cookoff: boolean, roller: Roller }

function apply(rules: MechRules, mech: Mech, startId: string, count: number, ignoreArmour: boolean, opts: Opts, events: string[]) {
  const chassis = findChassis(rules, mech.chassis)
  let sectionId: string | null = startId
  let n = Math.max(0, Math.floor(count))
  while (n > 0 && sectionId) {
    if (sectionId === 'pilot') {
      mech.turn.pilotWounds += n
      events.push(`  ${plural(n, 'wound')} pass through the open cockpit to the PILOT.`)
      return
    }
    const def = chassis?.sections.find(s => s.id === sectionId)
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
        mech.turn.out = true
        events.push('  CORE DESTROYED. Mech out of action.')
        return
      }
      events.push(`  ${def.name} destroyed; ${n} pass to ${def.transfer === 'pilot' ? 'pilot' : chassis?.sections.find(x => x.id === def.transfer)?.name ?? def.transfer}.`)
      sectionId = def.transfer
      continue
    }
    s.wounds[i] = true
    n--
    const hit = mountCovering(rules, mech, sectionId, i)
    const what = hit ? hit.name : def.slots[i] === 'Hull' ? 'hull' : 'empty'
    events.push(`  ${def.name} slot ${i + 1}: ${what} wounded${hit && mountDisabled(rules, mech, sectionId, hit) ? ' → DISABLED' : ''}.`)
    checkCookoffs(rules, mech, sectionId, opts, events)
    if (s.wounds.every(Boolean)) events.push(`  ${def.name} DESTROYED.`)
  }
  if (coreDestroyed(rules, mech)) mech.turn.out = true
}

function checkCookoffs(rules: MechRules, mech: Mech, sectionId: string, opts: Opts, events: string[]) {
  for (const m of mech.sections[sectionId].mounts) {
    const att = findAttachment(rules, m.name)
    if (!att?.bin || !(m.ammo && m.ammo > 0) || !mountDisabled(rules, mech, sectionId, m)) continue
    const dice = cookoffDice(rules, m)
    if (!opts.cookoff) {
      events.push(`  ${m.name} disabled with ${m.ammo} rounds: cook-off is ${dice}d4 to this section, ignoring armour. Apply by hand.`)
      continue
    }
    const vol = dice / m.ammo
    const rolled = opts.roller(dice)
    const k = rolled.filter(x => x === 4).length
    events.push(`  COOK-OFF: ${m.name}, ${m.ammo} rounds × ${vol} = ${dice}d4 [${rolled.join(' ')}] → ${plural(k, 'wound')}, ignoring armour.`)
    m.ammo = 0
    if (k) apply(rules, mech, sectionId, k, true, opts, events)
  }
}

export function applyWounds(rules: MechRules, mech: Mech, sectionId: string, count: number, opts: Opts): MechResult {
  const next = cloneMech(mech)
  const events: string[] = []
  apply(rules, next, sectionId, count, !!opts.ignoreArmour, opts, events)
  return { mech: next, events }
}

// Manual-mode hit: soak armour, then mark slots in this section only. No overflow, cook-off or out/pilot changes.
export function markWounds(rules: MechRules, mech: Mech, sectionId: string, count: number, ignoreArmour: boolean): MechResult {
  const next = cloneMech(mech)
  const s = next.sections[sectionId]
  if (!s) return { mech: next, events: [] }
  let n = Math.max(0, Math.floor(count))
  if (!ignoreArmour && s.armour && s.armour.points > 0) {
    const k = Math.min(n, s.armour.points)
    s.armour.points -= k
    n -= k
  }
  for (let i = 0; i < s.wounds.length && n > 0; i++) {
    if (!s.wounds[i]) { s.wounds[i] = true; n-- }
  }
  const name = findChassis(rules, mech.chassis)?.sections.find(x => x.id === sectionId)?.name ?? sectionId
  return { mech: next, events: [`${count} wounds marked on ${name}`] }
}

export function toggleWound(rules: MechRules, mech: Mech, sectionId: string, slot: number): Mech {
  const s = mech.sections[sectionId]
  if (!s || slot < 0 || slot >= s.wounds.length) return mech
  const next = withSection(mech, sectionId, sec => ({ ...sec, wounds: sec.wounds.map((w, i) => (i === slot ? !w : w)) }))
  return { ...next, turn: { ...next.turn, out: coreDestroyed(rules, next) } }
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

export function repairAll(rules: MechRules, mech: Mech): Mech {
  const sections: Mech['sections'] = {}
  for (const [id, s] of Object.entries(mech.sections)) {
    sections[id] = {
      armour: s.armour ? { ...s.armour, points: findAttachment(rules, s.armour.name)?.armour ?? s.armour.points } : null,
      wounds: s.wounds.map(() => false),
      mounts: s.mounts.map(m => {
        const att = findAttachment(rules, m.name)
        const out: Mount = { ...m }
        if (att?.bin) out.ammo = rules.ammo.find(a => a.name === att.bin)?.perBin ?? 0
        if (att?.charges) out.charges = att.charges
        return out
      }),
    }
  }
  return { ...mech, sections, turn: { ...mech.turn, out: false, pilotWounds: 0 } }
}
