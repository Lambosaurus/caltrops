import type { SheetEquipment } from '../rules'

/** A weapon's reach. */
export type RangeBand = 'Short' | 'Mid' | 'Long'
/** Where a target is: Engaged is base to base (melee), and counts as Short for guns. */
export type TargetBand = 'Engaged' | RangeBand
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
  size?: number /* 1 (ultralight) to 5 (super-heavy): Sprint costs this much energy and heat */,
  make?: string, model?: string, class?: string, tier?: string, price?: number,
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
  range?: RangeBand | 'Melee', roll?: MechRollSpec,
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
/** A roll: aspect + skill + bonus dice, plus one die per point of each named mech stat (a MechStats key, e.g. 'evasion'). */
export interface MechRollSpec { aspect?: string, skill: string, bonus?: number, add?: string[] }
export interface MechAmmo { name: string, perBin: number /* rounds a bin holds */, refill?: number }
export interface MechRules {
  slotTypes: MechSlotType[], chassis: Chassis[], attachments: MechAttachment[], ammo: MechAmmo[],
  rangeAspects: { [band in RangeBand]: string },
  sprint: { energy: number, heat: number } /* for a chassis with no size */,
  prefabs?: MechPrefab[], chassisAliases?: { [oldName: string]: string }, tags?: { [tag: string]: string } /* tag name -> rule text */,
  tagsShort?: { [tag: string]: string } /* tag name -> one-line summary for popovers; X and Y stand for its number and type */,
  skillSet?: string /* id of the ruleset skill set mech rolls use; default the first */,
  sprintRoll?: MechRollSpec & { label: string, note?: string } /* rolled after a Sprint; none if absent */,
  effectTags?: string[] /* tags that are standing effects on the whole mech, listed in the Effects panel in this order */,
  effectNotes?: string[] /* tags shown beside a part's effects as qualifiers (e.g. Frontal) */,
}
export interface Mount { name: string, start: number, ammo?: number, charges?: number, state?: { [k: string]: any } }
export interface MechSectionState { armour: { name: string, points: number } | null, mounts: Mount[], wounds: boolean[] }
/** Ranged weapons (shot) and melee weapons (strike) are picked in separate attack dialogs. */
export type ShotKind = 'shot' | 'strike'
/** One weapon's roll in an attack: its activations this time, the dice each adds, and the range penalty (once). */
export interface Volley { key: string, name: string, shots: number, dice: number, penalty: number }
export interface MechTurn {
  energy: number, heat: number, stored: number, shutdown: boolean,
  /** Shut down & purge: the mech stays shut down through its whole next turn, then reboots. */
  holdShutdown: boolean,
  used: { [mountKey: string]: number }, lastFired: string | null, out: boolean, pilotWounds: number,
}
export interface MechSettings { autoAmmo: boolean, autoHeatDamage: boolean, autoCookoff: boolean, autoHitDamage: boolean }
export interface Mech {
  rules: string, id: string, owner: string | null, name: string, chassis: string,
  sections: { [sectionId: string]: MechSectionState },
  equipment: { [container: string]: SheetEquipment[] } /* key 'Stowage' */,
  turn: MechTurn, settings: MechSettings,
}
/**
 * A d4 pool the rules call for outside an attack (overheat self-damage, cook-off). `rolled` is set when the sheet has
 * already rolled and applied it; without it the player rolls it (in the VTT when there is one) and applies it by hand.
 */
export interface MechRoll { label: string, dice: number, rolled?: number[] }
export interface MechResult { mech: Mech, events: string[], notices: string[], rolls?: MechRoll[] }
export const DEFAULT_MECH_SETTINGS: MechSettings = { autoAmmo: false, autoHeatDamage: false, autoCookoff: false, autoHitDamage: false }
