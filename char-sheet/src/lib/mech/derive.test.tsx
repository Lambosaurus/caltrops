import { DEFAULT_RULES } from '../rules'
import { FIXTURE_RULES } from './fixture'
import { newMech, findChassis } from './loadout'
import { deriveStats, aimCost, hitLabel, sectionForRoll, mountDisabled, sectionDestroyed, mountWorking, slotsOf, overheated } from './derive'
import type { Mech } from './types'

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }
const mule = () => newMech(RULES, 'Mule', 'Test')
const chassis = findChassis(FIXTURE_RULES, 'Mule')!

function wound(mech: Mech, sectionId: string, slots?: number[]): Mech {
  const s = mech.sections[sectionId]
  const wounds = s.wounds.map((w, i) => (slots ? slots.includes(i) : true) || w)
  return { ...mech, sections: { ...mech.sections, [sectionId]: { ...s, wounds } } }
}

describe('deriveStats', () => {
  it('derives the loaded Mule', () => {
    const st = deriveStats(FIXTURE_RULES, mule())
    expect(st).toMatchObject({
      energyOut: 6, reactorHeat: 2, cooling: 4, heatMax: 9, baseHeatMax: 7, speed: 60, evasion: 2,
      hand: true, stowage: 3, capacitor: 0, hasReactor: true, hasCooling: true,
    })
  })
  it('loses a leg', () => {
    const st = deriveStats(FIXTURE_RULES, wound(mule(), 'lleg'))
    expect(st.speed).toBe(30)
    expect(st.evasion).toBe(1)
    expect(st.heatMax).toBe(7)
  })
  it('wounded reactor yields nothing but is still mounted', () => {
    const st = deriveStats(FIXTURE_RULES, wound(mule(), 'core', [1, 2]))
    expect(st.energyOut).toBe(0)
    expect(st.hasReactor).toBe(true)
  })
  it('disabled manipulator means no hand', () => {
    expect(deriveStats(FIXTURE_RULES, wound(mule(), 'larm', [0])).hand).toBe(false)
  })
  it('skips unknown mounts', () => {
    const m = mule()
    const bad = { ...m, sections: { ...m.sections, larm: { ...m.sections.larm, mounts: [...m.sections.larm.mounts, { name: 'Nope', start: 2 }] } } }
    expect(() => deriveStats(FIXTURE_RULES, bad)).not.toThrow()
    expect(deriveStats(FIXTURE_RULES, bad).energyOut).toBe(6)
  })
  it('overheated when heat exceeds heatMax', () => {
    const m = mule()
    expect(overheated(FIXTURE_RULES, { ...m, turn: { ...m.turn, heat: 9 } })).toBe(false)
    expect(overheated(FIXTURE_RULES, { ...m, turn: { ...m.turn, heat: 10 } })).toBe(true)
  })
})

describe('mount state helpers', () => {
  it('slotsOf, disabled, destroyed, working', () => {
    const m = mule()
    const ac = m.sections.larm.mounts.find(x => x.name === 'Autocannon')!
    expect(slotsOf(FIXTURE_RULES, ac)).toEqual([1, 2])
    const half = wound(m, 'larm', [1])
    expect(mountDisabled(FIXTURE_RULES, half, 'larm', ac)).toBe(false)
    const full = wound(m, 'larm', [1, 2])
    expect(mountDisabled(FIXTURE_RULES, full, 'larm', ac)).toBe(true)
    expect(mountWorking(FIXTURE_RULES, full, 'larm', ac)).toBe(false)
    expect(sectionDestroyed(full, 'larm')).toBe(false)
    const dead = wound(m, 'larm')
    expect(sectionDestroyed(dead, 'larm')).toBe(true)
    expect(mountWorking(FIXTURE_RULES, dead, 'larm', m.sections.larm.mounts[0])).toBe(false)
  })
})

describe('section helpers', () => {
  const sec = (n: number) => ({ ...chassis.sections[0], range: [1, n] as [number, number] })
  it('aimCost', () => {
    expect(aimCost(sec(1))).toBe(4)
    expect(aimCost(sec(3))).toBe(2)
    expect(aimCost(sec(5))).toBe(1)
  })
  it('hitLabel', () => {
    expect(hitLabel(chassis.sections.find(s => s.id === 'core')!)).toBe('7–9')
    expect(hitLabel(chassis.sections.find(s => s.id === 'shoulder')!)).toBe('12')
  })
  it('sectionForRoll', () => {
    expect(sectionForRoll(chassis, 12).id).toBe('shoulder')
    expect(sectionForRoll(chassis, 1).id).toBe('lleg')
  })
})
