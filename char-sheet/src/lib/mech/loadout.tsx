import { v4 as uuidv4 } from 'uuid'
import type { Rules } from '../rules'
import {
  DEFAULT_MECH_SETTINGS,
  type Chassis, type Mech, type MechAttachment, type MechRules, type MechSectionState, type MechTurn, type Mount,
} from './types'

export function mountKey(sectionId: string, start: number): string {
  return `${sectionId}:${start}`
}

export function findChassis(rules: MechRules, name: string): Chassis | undefined {
  return rules.chassis.find(c => c.name === name)
}

export function findAttachment(rules: MechRules, name: string): MechAttachment | undefined {
  return rules.attachments.find(a => a.name === name)
}

export function slotAccepts(slotType: string, attachmentType: string): boolean {
  if (slotType === 'Armour' || slotType === 'Hull') return false
  if (attachmentType === 'Generic') return true
  return slotType === attachmentType
}

export function freshTurn(): MechTurn {
  return {
    phase: 'active', posture: 'still', energy: 0, heat: 0, stored: 0, shutdown: false,
    used: {}, lastFired: null, target: 'Mid', out: false, pilotWounds: 0,
  }
}

const sizeOf = (a: MechAttachment) => a.size ?? 1

// The mount whose first slot is `slot` (mounts record only their start; sizes live in the rules).
export function mountAt(mech: Mech, sectionId: string, slot: number): Mount | undefined {
  return mech.sections[sectionId]?.mounts.find(m => m.start === slot)
}

function sectionSlots(rules: MechRules, mech: Mech, sectionId: string): string[] | undefined {
  return findChassis(rules, mech.chassis)?.sections.find(s => s.id === sectionId)?.slots
}

export function canMount(
  rules: MechRules, mech: Mech, sectionId: string, name: string, start: number, ignoreStart?: number,
): boolean {
  const att = findAttachment(rules, name)
  const slots = sectionSlots(rules, mech, sectionId)
  const section = mech.sections[sectionId]
  if (!att || !slots || !section || att.type === 'Armour') return false
  const size = sizeOf(att)
  if (start < 0 || start + size > slots.length) return false
  for (let i = start; i < start + size; i++) {
    if (!slotAccepts(slots[i], att.type)) return false
    for (const m of section.mounts) {
      if (m.start === ignoreStart) continue
      const other = findAttachment(rules, m.name)
      const osize = other ? sizeOf(other) : 1
      if (i >= m.start && i < m.start + osize) return false
    }
  }
  return true
}

function newMount(rules: MechRules, att: MechAttachment, start: number): Mount {
  const m: Mount = { name: att.name, start }
  if (att.bin) m.ammo = rules.ammo.find(a => a.name === att.bin)?.perBin ?? 0
  if (att.charges) m.charges = att.charges
  return m
}

function withSection(mech: Mech, sectionId: string, change: (s: MechSectionState) => MechSectionState): Mech {
  return { ...mech, sections: { ...mech.sections, [sectionId]: change(mech.sections[sectionId]) } }
}

export function mount(rules: MechRules, mech: Mech, sectionId: string, name: string, start: number): Mech {
  const att = findAttachment(rules, name)
  if (!att || !mech.sections[sectionId]) return mech
  return withSection(mech, sectionId, s => ({ ...s, mounts: [...s.mounts, newMount(rules, att, start)] }))
}

export function unmount(mech: Mech, sectionId: string, start: number): Mech {
  if (!mech.sections[sectionId]) return mech
  return withSection(mech, sectionId, s => ({ ...s, mounts: s.mounts.filter(m => m.start !== start) }))
}

export function moveMount(
  rules: MechRules, mech: Mech, from: { section: string, start: number }, to: { section: string, start: number },
): Mech {
  const src = mech.sections[from.section]?.mounts.find(m => m.start === from.start)
  if (!src || !mech.sections[to.section]) return mech
  const ignore = from.section === to.section ? from.start : undefined
  if (!canMount(rules, mech, to.section, src.name, to.start, ignore)) return mech
  const removed = unmount(mech, from.section, from.start)
  return withSection(removed, to.section, s => ({ ...s, mounts: [...s.mounts, { ...src, start: to.start }] }))
}

export function setArmour(rules: MechRules, mech: Mech, sectionId: string, name: string | null): Mech {
  if (!mech.sections[sectionId]) return mech
  const att = name === null ? undefined : findAttachment(rules, name)
  if (name !== null && (!att || att.type !== 'Armour')) return mech
  return withSection(mech, sectionId, s => ({ ...s, armour: att ? { name: att.name, points: att.armour ?? 0 } : null }))
}

function reactorOutput(rules: MechRules, mech: Mech): number {
  let total = 0
  for (const s of Object.values(mech.sections)) {
    for (const m of s.mounts) total += findAttachment(rules, m.name)?.reactor?.energy ?? 0
  }
  return total
}

function emptySections(chassis: Chassis): Mech['sections'] {
  const sections: Mech['sections'] = {}
  for (const sec of chassis.sections) sections[sec.id] = { armour: null, mounts: [], wounds: sec.slots.map(() => false) }
  return sections
}

function requireChassis(rules: Rules, chassisName: string): { mr: MechRules, chassis: Chassis } {
  const mr = rules.mechs
  const chassis = mr && findChassis(mr, chassisName)
  if (!mr || !chassis) throw new Error(`Unknown chassis ${chassisName}`)
  return { mr, chassis }
}

export function newMech(rules: Rules, chassisName: string, name?: string): Mech {
  const { mr, chassis } = requireChassis(rules, chassisName)
  let mech: Mech = {
    rules: rules.name, id: uuidv4(), owner: null, name: name ?? chassis.name, chassis: chassis.name,
    sections: emptySections(chassis), equipment: { Stowage: [] },
    turn: freshTurn(), settings: { ...DEFAULT_MECH_SETTINGS },
  }
  for (const [sectionId, lo] of Object.entries(chassis.loadout ?? {})) {
    if (!mech.sections[sectionId]) continue
    if (lo.armour) mech = setArmour(mr, mech, sectionId, lo.armour)
    for (const [attName, start] of lo.mounts) mech = mount(mr, mech, sectionId, attName, start)
  }
  return { ...mech, turn: { ...mech.turn, energy: reactorOutput(mr, mech) } }
}

export function changeChassis(rules: Rules, mech: Mech, chassisName: string): Mech {
  const { chassis } = requireChassis(rules, chassisName)
  return { ...mech, chassis: chassis.name, sections: emptySections(chassis), turn: freshTurn() }
}

export function loadMech(obj: any): Mech {
  const o = obj ?? {}
  const sections: Mech['sections'] = {}
  for (const [id, raw] of Object.entries<any>(o.sections ?? {})) {
    const s = raw ?? {}
    sections[id] = {
      armour: s.armour && typeof s.armour.name === 'string' ? { name: s.armour.name, points: Number(s.armour.points) || 0 } : null,
      mounts: Array.isArray(s.mounts) ? s.mounts.filter((m: any) => m && typeof m.name === 'string').map((m: any) => ({ ...m, start: Number(m.start) || 0 })) : [],
      wounds: Array.isArray(s.wounds) ? s.wounds.map(Boolean) : [],
    }
  }
  const stowage = Array.isArray(o.equipment?.Stowage) ? o.equipment.Stowage : []
  return {
    rules: typeof o.rules === 'string' ? o.rules : '',
    id: typeof o.id === 'string' ? o.id : uuidv4(),
    owner: typeof o.owner === 'string' ? o.owner : null,
    name: typeof o.name === 'string' ? o.name : '',
    chassis: typeof o.chassis === 'string' ? o.chassis : '',
    sections,
    equipment: { ...(o.equipment ?? {}), Stowage: stowage },
    turn: { ...freshTurn(), ...(o.turn ?? {}) },
    settings: { ...DEFAULT_MECH_SETTINGS, ...(o.settings ?? {}) },
  }
}
