import type { SheetEquipment } from '../rules'

export type RangeBand = 'Short' | 'Mid' | 'Long'
export type Roller = (n: number) => number[]
export interface MechSlotType { name: string /* '' = untyped */, label: string, color: string, description: string }
export interface ChassisSection {
  id: string, name: string, range: [number, number], slots: string[],
  transfer: string | null /* section id, 'pilot', or null for the core */,
  provides?: { speed?: number, evasion?: number }, area: string /* CSS grid-area */,
}
export interface ChassisLoadout { armour?: string, mounts: [string, number][] /* [attachment name, start slot] */ }
export interface Chassis {
  name: string, description?: string, heatMax: number, shape: 'biped' | 'tracked',
  sections: ChassisSection[], loadout?: { [sectionId: string]: ChassisLoadout },
}
export interface MechAttachment {
  name: string, type: string /* slot type name, 'Generic', or 'Armour' */, group: string, size?: number,
  description?: string, tags?: string, effect?: string,
  energy?: number, heat?: number, ammo?: string, repeat?: number, charges?: number,
  range?: RangeBand | 'Melee', roll?: { aspect?: string, skill: string, bonus?: number },
  reactor?: { energy: number, heat: number }, cooling?: number, heatSink?: number,
  capacitor?: number, hand?: boolean, stowage?: number, bin?: string /* ammo name */, armour?: number,
}
export interface MechAmmo { name: string, perBin: number, volatility: number }
export interface MechRules {
  slotTypes: MechSlotType[], chassis: Chassis[], attachments: MechAttachment[], ammo: MechAmmo[],
  rangeAspects: { [band in RangeBand]: string }, sprint: { energy: number, heat: number },
  sittingDuck: number, stunned: number,
}
export interface Mount { name: string, start: number, ammo?: number, charges?: number, state?: { [k: string]: any } }
export interface MechSectionState { armour: { name: string, points: number } | null, mounts: Mount[], wounds: boolean[] }
export interface MechTurn {
  phase: 'active' | 'ended', posture: 'still' | 'moved' | 'sprint', energy: number, heat: number,
  stored: number, shutdown: boolean, used: { [mountKey: string]: number }, lastFired: string | null,
  target: RangeBand, out: boolean, pilotWounds: number,
}
export interface MechSettings { autoAmmo: boolean, autoHeatDamage: boolean, autoCookoff: boolean, autoHitDamage: boolean }
export interface Mech {
  rules: string, id: string, owner: string | null, name: string, chassis: string,
  sections: { [sectionId: string]: MechSectionState },
  equipment: { [container: string]: SheetEquipment[] } /* key 'Stowage' */,
  turn: MechTurn, settings: MechSettings,
}
export interface MechResult { mech: Mech, events: string[] }
export const DEFAULT_MECH_SETTINGS: MechSettings = { autoAmmo: false, autoHeatDamage: false, autoCookoff: false, autoHitDamage: false }
