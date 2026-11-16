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
  name: string, description?: string, heatMax: number, shape: 'biped' | 'tracked' | 'quad',
  make?: string, model?: string, class?: string, tier?: string, price?: number, trait?: string,
  sections: ChassisSection[], loadout?: { [sectionId: string]: ChassisLoadout },
}
/** A ready-made mech: a chassis plus a full loadout, for quick test runs. */
export interface MechPrefab {
  name: string, chassis: string, description?: string, loadout: { [sectionId: string]: ChassisLoadout },
}
export interface MechAttachment {
  name: string, type: string /* slot type name, 'Generic', or 'Armour' */, group: string, size?: number,
  description?: string, tags?: string, effect?: string,
  energy?: number, heat?: number, ammo?: string, repeat?: number, charges?: number,
  range?: RangeBand | 'Melee', roll?: { aspect?: string, skill: string, bonus?: number },
  reactor?: { energy: number, heat: number }, cooling?: number, heatSink?: number,
  capacitor?: number, hand?: boolean, stowage?: number, bin?: string /* ammo name */, armour?: number,
  make?: string, model?: string, tier?: string, price?: number, kind?: string, family?: string,
  upkeep?: number /* energy drawn every turn while working (pumped coolers) */,
  capacitorHeat?: number /* heat gained on a turn that draws stored energy */,
  ammoPer?: number /* rounds drawn per activation (Hungry) */,
  recharge?: 'scene' /* charges refill each scene (Recharging) rather than at a haven */,
  heavy?: number /* −Speed while fitted */, volatile?: number /* d4s rolled when disabled */,
  selfRepair?: boolean /* armour: +1 point each New turn */,
}
export interface MechAmmo { name: string, perBin: number, volatility: number, refill?: number }
export interface MechRules {
  slotTypes: MechSlotType[], chassis: Chassis[], attachments: MechAttachment[], ammo: MechAmmo[],
  rangeAspects: { [band in RangeBand]: string }, sprint: { energy: number, heat: number },
  prefabs?: MechPrefab[], chassisAliases?: { [oldName: string]: string }, tags?: { [tag: string]: string } /* tag name -> rule text */,
}
export interface Mount { name: string, start: number, ammo?: number, charges?: number, state?: { [k: string]: any } }
export interface MechSectionState { armour: { name: string, points: number } | null, mounts: Mount[], wounds: boolean[] }
/** One weapon activation's dice waiting in the pending shot or strike. */
export interface ShotPart { key: string, name: string, dice: number, penalty: number }
export type ShotKind = 'shot' | 'strike'
export interface MechTurn {
  energy: number, heat: number, stored: number, shutdown: boolean,
  used: { [mountKey: string]: number }, lastFired: string | null, out: boolean, pilotWounds: number,
  /** Pending ranged shot / melee strike, built up one weapon activation at a time, then rolled once. */
  shot: ShotPart[], strike: ShotPart[], shotBand: RangeBand | null,
  /** Which of the turn's one shot and one strike have been rolled. */
  fired: { shot?: boolean, strike?: boolean },
}
export interface MechSettings { autoAmmo: boolean, autoHeatDamage: boolean, autoCookoff: boolean, autoHitDamage: boolean }
export interface Mech {
  rules: string, id: string, owner: string | null, name: string, chassis: string,
  sections: { [sectionId: string]: MechSectionState },
  equipment: { [container: string]: SheetEquipment[] } /* key 'Stowage' */,
  turn: MechTurn, settings: MechSettings,
}
export interface MechResult { mech: Mech, events: string[], notices: string[] }
export const DEFAULT_MECH_SETTINGS: MechSettings = { autoAmmo: false, autoHeatDamage: false, autoCookoff: false, autoHitDamage: false }
