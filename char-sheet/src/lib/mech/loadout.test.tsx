import { DEFAULT_RULES } from '../rules'
import { DEFAULT_MECH_SETTINGS } from './types'
import { FIXTURE_RULES } from './fixture'
import {
  slotAccepts, canMount, mount, mountAt, unmount, canDropPart, dropPart, canDropArmour, dropOnCatalogue, mountCovering, moveMount, newMech, changeChassis, loadMech, findAttachment,
} from './loadout'

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }

describe('slotAccepts', () => {
  it('matches types', () => {
    expect(slotAccepts('Weapon', 'Weapon')).toBe(true)
    expect(slotAccepts('Weapon', 'Tech')).toBe(false)
    expect(slotAccepts('', 'Generic')).toBe(true)
    expect(slotAccepts('', 'Weapon')).toBe(false)
    expect(slotAccepts('Reactor', 'Generic')).toBe(true)
    expect(slotAccepts('Hull', 'Generic')).toBe(false)
    expect(slotAccepts('Armour', 'Generic')).toBe(false)
  })
})

describe('canMount', () => {
  const empty = changeChassis(RULES, newMech(RULES, 'Mule'), 'Mule')
  it('checks size, type and untyped slots', () => {
    expect(canMount(FIXTURE_RULES, empty, 'larm', 'Autocannon', 1)).toBe(true)
    expect(canMount(FIXTURE_RULES, empty, 'larm', 'Autocannon', 2)).toBe(false)
    expect(canMount(FIXTURE_RULES, empty, 'core', 'Dipole Fusion Reactor', 1)).toBe(true)
    expect(canMount(FIXTURE_RULES, empty, 'core', 'Dipole Fusion Reactor', 3)).toBe(false)
    expect(canMount(FIXTURE_RULES, empty, 'core', 'Ammo Bin: Light', 4)).toBe(true)
    expect(canMount(FIXTURE_RULES, empty, 'lleg', 'Machine Gun', 1)).toBe(false)
  })
  it('rejects overlaps', () => {
    const m = mount(FIXTURE_RULES, empty, 'larm', 'Autocannon', 1)
    expect(canMount(FIXTURE_RULES, m, 'larm', 'Machine Gun', 1)).toBe(false)
    expect(canMount(FIXTURE_RULES, m, 'larm', 'Machine Gun', 2)).toBe(false)
  })
})

describe('mountAt / mountCovering', () => {
  it('distinguishes start from covered slots', () => {
    const m = mount(FIXTURE_RULES, changeChassis(RULES, newMech(RULES, 'Mule'), 'Mule'), 'larm', 'Autocannon', 1)
    expect(mountCovering(FIXTURE_RULES, m, 'larm', 2)?.name).toBe('Autocannon')
    expect(mountCovering(FIXTURE_RULES, m, 'larm', 0)).toBeUndefined()
    expect(mountAt(m, 'larm', 2)).toBeUndefined()
    expect(mountAt(m, 'larm', 1)?.name).toBe('Autocannon')
  })
})

describe('newMech', () => {
  const m = newMech(RULES, 'Mule')
  it('applies the chassis loadout', () => {
    expect(m.rules).toBe('Test')
    expect(m.sections.core.mounts.map(x => x.name)).toContain('Dipole Fusion Reactor')
    expect(m.sections.core.mounts.find(x => x.name === 'Ammo Bin: Light')!.ammo).toBe(16)
    expect(m.sections.core.armour).toEqual({ name: 'Composite Plating', points: 3 })
    expect(m.sections.larm.armour).toEqual({ name: 'Plating', points: 2 })
    expect(m.settings).toEqual(DEFAULT_MECH_SETTINGS)
    expect(m.turn.energy).toBe(6)
  })
})

describe('moveMount', () => {
  it('is a no-op for an invalid target', () => {
    const m = newMech(RULES, 'Mule')
    const r = moveMount(FIXTURE_RULES, m, { section: 'larm', start: 1 }, { section: 'lleg', start: 1 })
    expect(r).toEqual(m)
  })
  it('moves a valid mount', () => {
    const m = changeChassis(RULES, newMech(RULES, 'Mule'), 'Mule')
    const b = mount(FIXTURE_RULES, m, 'rarm', 'Machine Gun', 1)
    const r = moveMount(FIXTURE_RULES, b, { section: 'rarm', start: 1 }, { section: 'larm', start: 2 })
    expect(r.sections.larm.mounts[0]).toMatchObject({ name: 'Machine Gun', start: 2 })
    expect(r.sections.rarm.mounts).toEqual([])
  })
})

describe('moveMount within a section', () => {
  const wide = {
    ...FIXTURE_RULES,
    chassis: [{
      ...FIXTURE_RULES.chassis[0],
      sections: FIXTURE_RULES.chassis[0].sections.map(sec => sec.id === 'larm' ? { ...sec, slots: ['Weapon', 'Weapon', 'Weapon'] } : sec),
    }],
  }
  const wrules = { ...RULES, mechs: wide }
  const base = changeChassis(wrules, newMech(wrules, 'Mule'), 'Mule')
  it('allows shifting onto its own old slots', () => {
    const m = mount(wide, base, 'larm', 'Autocannon', 0)
    const r = moveMount(wide, m, { section: 'larm', start: 0 }, { section: 'larm', start: 1 })
    expect(r.sections.larm.mounts).toEqual([{ name: 'Autocannon', start: 1 }])
  })
  it('is a no-op when overlapping a different mount', () => {
    const m = mount(wide, mount(wide, base, 'larm', 'Autocannon', 0), 'larm', 'Machine Gun', 2)
    const r = moveMount(wide, m, { section: 'larm', start: 0 }, { section: 'larm', start: 1 })
    expect(r).toEqual(m)
  })
})

describe('changeChassis', () => {
  it('empties the loadout, keeping identity', () => {
    const m = newMech(RULES, 'Mule', 'Rusty')
    const c = changeChassis(RULES, m, 'Mule')
    expect(c.id).toBe(m.id)
    expect(c.name).toBe('Rusty')
    for (const s of Object.values(c.sections)) expect(s.mounts).toEqual([])
  })
})

describe('loadMech', () => {
  it('fills defaults', () => {
    const m = loadMech({ chassis: 'Mule', sections: {} })
    expect(m.settings).toEqual(DEFAULT_MECH_SETTINGS)
    expect(m.turn.phase).toBe('active')
    expect(m.equipment.Stowage).toEqual([])
  })
})

describe('findAttachment', () => {
  it('returns undefined for unknown', () => {
    expect(findAttachment(FIXTURE_RULES, 'Nope')).toBeUndefined()
  })
})

describe('drag-and-drop helpers', () => {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule')
  test('machine gun is refused in a leg and accepted in an empty arm weapon slot', () => {
    expect(canDropPart(FIXTURE_RULES, mech, { name: 'Machine Gun' }, 'lleg', 1)).toBe(false)
    const free = unmount(mech, 'rarm', 1)
    expect(canDropPart(FIXTURE_RULES, free, { name: 'Machine Gun' }, 'rarm', 1)).toBe(true)
    expect(dropPart(FIXTURE_RULES, free, { name: 'Machine Gun' }, 'rarm', 1).sections.rarm.mounts.length).toBe(2)
  })
  test('a mounted part can be moved onto its own slot but not onto an occupied one', () => {
    const from = { section: 'rarm', start: 1 }
    expect(canDropPart(FIXTURE_RULES, mech, { name: 'Machine Gun', from }, 'rarm', 1)).toBe(true)
    expect(canDropPart(FIXTURE_RULES, mech, { name: 'Machine Gun', from }, 'larm', 1)).toBe(false)
  })
  test('armour only drops on the armour row, and the catalogue unmounts', () => {
    expect(canDropArmour(FIXTURE_RULES, { name: 'Plating' })).toBe(true)
    expect(canDropArmour(FIXTURE_RULES, { name: 'Machine Gun' })).toBe(false)
    expect(canDropPart(FIXTURE_RULES, mech, { name: 'Plating' }, 'rarm', 1)).toBe(false)
    const out = dropOnCatalogue(mech, { name: 'Machine Gun', from: { section: 'rarm', start: 1 } })
    expect(out.sections.rarm.mounts.some(m => m.name === 'Machine Gun')).toBe(false)
  })
})
