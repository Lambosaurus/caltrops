import { DEFAULT_RULES } from '../rules'
import { FIXTURE_RULES } from './fixture'
import { newMech, unmount } from './loadout'
import { applyWounds, markWounds, cookoffDice, toggleWound, setArmourPoints, adjustAmmo, repairAll } from './damage'
import type { Mech } from './types'

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }
const mule = () => newMech(RULES, 'Mule', 'Test')
const roll1 = (n: number) => Array(n).fill(1)
const off = { cookoff: false, roller: roll1 }

function setWounds(mech: Mech, id: string, wounds: boolean[]): Mech {
  return { ...mech, sections: { ...mech.sections, [id]: { ...mech.sections[id], wounds } } }
}

describe('applyWounds', () => {
  it('soaks armour then wounds the hull first', () => {
    const { mech } = applyWounds(FIXTURE_RULES, mule(), 'lleg', 3, off)
    expect(mech.sections.lleg.armour!.points).toBe(0)
    expect(mech.sections.lleg.wounds).toEqual([true, false, false])
  })
  it('overflows to the core', () => {
    const { mech, events } = applyWounds(FIXTURE_RULES, mule(), 'lleg', 6, off)
    expect(mech.sections.lleg.wounds).toEqual([true, true, true])
    expect(mech.sections.core.armour!.points).toBe(2)
    expect(events.some(e => e.includes('Left leg destroyed; 1 pass to Core'))).toBe(true)
  })
  it('passes wounds beyond a destroyed cockpit to the pilot', () => {
    const m = setArmourPoints(FIXTURE_RULES, setWounds(mule(), 'cockpit', [true, true]), 'cockpit', 0)
    const { mech } = applyWounds(FIXTURE_RULES, m, 'cockpit', 2, off)
    expect(mech.turn.pilotWounds).toBe(2)
  })
  it('sets out when the core is destroyed, without throwing', () => {
    const { mech, events } = applyWounds(FIXTURE_RULES, mule(), 'core', 99, off)
    expect(mech.turn.out).toBe(true)
    expect(events.some(e => e.includes('CORE DESTROYED'))).toBe(true)
  })
  it('logs hull and empty slots', () => {
    const { events } = applyWounds(FIXTURE_RULES, mule(), 'lleg', 4, off)
    expect(events.some(e => e.includes('slot 1: hull wounded'))).toBe(true)
    expect(events.some(e => e.includes('slot 3: empty wounded'))).toBe(false)
  })
  it('logs empty slots as empty', () => {
    const { events } = applyWounds(FIXTURE_RULES, unmount(mule(), 'lleg', 2), 'lleg', 5, off)
    expect(events.some(e => e.includes('slot 3: empty wounded'))).toBe(true)
  })
  it('only logs the cook-off when off', () => {
    let m = setArmourPoints(FIXTURE_RULES, mule(), 'core', 0)
    m = setWounds(m, 'core', [true, true, true, true, true, false])
    const { mech, events } = applyWounds(FIXTURE_RULES, m, 'core', 1, off)
    expect(mech.sections.core.mounts.find(x => x.name === 'Ammo Bin: Standard')!.ammo).toBe(8)
    expect(events.some(e => e.includes('16d4'))).toBe(true)
  })
  it('rolls the cook-off and applies its wounds ignoring armour', () => {
    const calls: number[] = []
    const roller = (n: number) => { calls.push(n); return Array(n).fill(4) }
    // Light bin (slot 4, 16 rounds x1) is the last slot but one; the hit disables it.
    const m = setArmourPoints(FIXTURE_RULES, setWounds(mule(), 'core', [true, true, true, true, false, true]), 'core', 0)
    const { mech, events } = applyWounds(FIXTURE_RULES, m, 'core', 1, { cookoff: true, roller })
    expect(calls[0]).toBe(16)
    expect(mech.sections.core.mounts.find(x => x.name === 'Ammo Bin: Light')!.ammo).toBe(0)
    expect(events.some(e => e.includes('COOK-OFF'))).toBe(true)
    expect(mech.turn.out).toBe(true)
  })
  it('cook-off with no successes adds no extra wounds', () => {
    const m = setWounds(mule(), 'lleg', [true, true, false])
    const bin = { ...m, sections: { ...m.sections, lleg: { ...m.sections.lleg, armour: { name: 'Plating', points: 0 } } } }
    const { mech } = applyWounds(FIXTURE_RULES, bin, 'lleg', 1, { cookoff: true, roller: roll1 })
    expect(mech.sections.lleg.wounds).toEqual([true, true, true])
  })
  it('does not mutate the input mech', () => {
    const m = mule()
    const before = JSON.stringify(m)
    applyWounds(FIXTURE_RULES, m, 'lleg', 6, off)
    expect(JSON.stringify(m)).toBe(before)
  })
})

describe('cookoffDice', () => {
  it('is rounds times volatility', () => {
    const bin = mule().sections.core.mounts.find(x => x.name === 'Ammo Bin: Standard')!
    expect(cookoffDice(FIXTURE_RULES, bin)).toBe(16)
    expect(cookoffDice(FIXTURE_RULES, { ...bin, ammo: 0 })).toBe(0)
  })
})

describe('markWounds', () => {
  it('soaks armour then marks slots', () => {
    const { mech, events } = markWounds(FIXTURE_RULES, mule(), 'lleg', 3, false)
    expect(mech.sections.lleg.armour!.points).toBe(0)
    expect(mech.sections.lleg.wounds).toEqual([true, false, false])
    expect(events).toEqual(['Left leg: armour absorbs 2.', '1 wound marked on Left leg'])
  })
  it('does not overflow', () => {
    const m = mule()
    const { mech } = markWounds(FIXTURE_RULES, m, 'lleg', 10, false)
    expect(mech.sections.lleg.wounds).toEqual([true, true, true])
    expect(mech.sections.core).toEqual(m.sections.core)
    expect(mech.turn).toEqual(m.turn)
  })
  it('ignores armour on request', () => {
    const { mech } = markWounds(FIXTURE_RULES, mule(), 'lleg', 1, true)
    expect(mech.sections.lleg.armour!.points).toBe(2)
    expect(mech.sections.lleg.wounds).toEqual([true, false, false])
  })
  it('logs plural wounds and omits absent armour', () => {
    const { events } = markWounds(FIXTURE_RULES, mule(), 'lleg', 2, true)
    expect(events).toEqual(['2 wounds marked on Left leg'])
  })
})

describe('direct edits', () => {
  it('toggles wounds and tracks out', () => {
    let m = toggleWound(FIXTURE_RULES, mule(), 'lleg', 1)
    expect(m.sections.lleg.wounds).toEqual([false, true, false])
    m = toggleWound(FIXTURE_RULES, m, 'lleg', 1)
    expect(m.sections.lleg.wounds).toEqual([false, false, false])
    m = setWounds(mule(), 'core', [true, true, true, true, true, false])
    expect(toggleWound(FIXTURE_RULES, m, 'core', 5).turn.out).toBe(true)
  })
  it('clamps ammo and armour', () => {
    const m = mule()
    expect(adjustAmmo(FIXTURE_RULES, m, 'core:4', -99).sections.core.mounts.find(x => x.start === 4)!.ammo).toBe(0)
    expect(adjustAmmo(FIXTURE_RULES, m, 'core:4', 99).sections.core.mounts.find(x => x.start === 4)!.ammo).toBe(16)
    expect(setArmourPoints(FIXTURE_RULES, m, 'lleg', 9).sections.lleg.armour!.points).toBe(2)
    expect(setArmourPoints(FIXTURE_RULES, m, 'lleg', -3).sections.lleg.armour!.points).toBe(0)
  })
  it('repairs everything', () => {
    let m = applyWounds(FIXTURE_RULES, mule(), 'core', 99, off).mech
    m = adjustAmmo(FIXTURE_RULES, m, 'core:4', -99)
    m = { ...m, turn: { ...m.turn, pilotWounds: 2 } }
    const r = repairAll(FIXTURE_RULES, m)
    expect(Object.values(r.sections).every(s => s.wounds.every(w => !w))).toBe(true)
    expect(r.sections.core.mounts.find(x => x.start === 4)!.ammo).toBe(16)
    expect(r.sections.core.armour!.points).toBe(3)
    expect(r.turn.out).toBe(false)
    expect(r.turn.pilotWounds).toBe(0)
  })
})
