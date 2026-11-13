import { DEFAULT_RULES } from '../rules'
import { DEFAULT_MECH_SETTINGS } from './types'
import { FIXTURE_RULES } from './fixture'
import {
  slotAccepts, canMount, mount, moveMount, newMech, changeChassis, loadMech, findAttachment,
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
    const m = mount(FIXTURE_RULES, empty, 'core', 'Heat Exchanger', 3)
    expect(canMount(FIXTURE_RULES, m, 'core', 'Dipole Fusion Reactor', 2)).toBe(false)
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
