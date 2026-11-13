import { findAttachment, findChassis } from './loadout'
import type { Chassis, ChassisSection, Mech, MechRules, Mount } from './types'

export function slotsOf(rules: MechRules, mount: Mount): number[] {
  const size = findAttachment(rules, mount.name)?.size ?? 1
  return Array.from({ length: size }, (_, i) => mount.start + i)
}

export function mountDisabled(rules: MechRules, mech: Mech, sectionId: string, mount: Mount): boolean {
  const wounds = mech.sections[sectionId]?.wounds ?? []
  return slotsOf(rules, mount).every(i => wounds[i])
}

export function sectionDestroyed(mech: Mech, sectionId: string): boolean {
  const wounds = mech.sections[sectionId]?.wounds ?? []
  return wounds.length > 0 && wounds.every(Boolean)
}

export function mountWorking(rules: MechRules, mech: Mech, sectionId: string, mount: Mount): boolean {
  return !mountDisabled(rules, mech, sectionId, mount) && !sectionDestroyed(mech, sectionId)
}

export const aimCost = (section: ChassisSection): number => Math.max(1, 5 - (section.range[1] - section.range[0] + 1))

export const hitLabel = (section: ChassisSection): string =>
  section.range[0] === section.range[1] ? `${section.range[0]}` : `${section.range[0]}–${section.range[1]}`

export function sectionForRoll(chassis: Chassis, d12: number): ChassisSection {
  return chassis.sections.find(s => d12 >= s.range[0] && d12 <= s.range[1]) ?? chassis.sections[0]
}

export interface MechStats {
  energyOut: number, reactorHeat: number, cooling: number, heatMax: number, baseHeatMax: number,
  capacitor: number, speed: number, evasion: number, stowage: number,
  hand: boolean, hasReactor: boolean, hasCooling: boolean,
}

export function deriveStats(rules: MechRules, mech: Mech): MechStats {
  const chassis = findChassis(rules, mech.chassis)
  const baseHeatMax = chassis?.heatMax ?? 0
  const st: MechStats = {
    energyOut: 0, reactorHeat: 0, cooling: 0, heatMax: baseHeatMax, baseHeatMax, capacitor: 0, speed: 0, evasion: 0,
    stowage: 0, hand: false, hasReactor: false, hasCooling: false,
  }
  for (const [sectionId, section] of Object.entries(mech.sections)) {
    for (const m of section.mounts) {
      const a = findAttachment(rules, m.name)
      if (!a) continue
      if (a.reactor) st.hasReactor = true
      if (a.cooling || (a.heat ?? 0) < 0) st.hasCooling = true
      if (!mountWorking(rules, mech, sectionId, m)) continue
      if (a.reactor) { st.energyOut += a.reactor.energy; st.reactorHeat += a.reactor.heat }
      st.cooling += a.cooling ?? 0
      st.capacitor += a.capacitor ?? 0
      st.heatMax += a.heatSink ?? 0
      st.stowage += a.stowage ?? 0
      if (a.hand) st.hand = true
    }
  }
  for (const sec of chassis?.sections ?? []) {
    if (sectionDestroyed(mech, sec.id) || !sec.provides) continue
    st.speed += sec.provides.speed ?? 0
    st.evasion += sec.provides.evasion ?? 0
  }
  return st
}

export const overheated = (rules: MechRules, mech: Mech): boolean => mech.turn.heat > deriveStats(rules, mech).heatMax
