import { DEFAULT_RULES } from '../rules'
import { FIXTURE_RULES } from './fixture'
import { newMech } from './loadout'
import { activate, activationBlocker, newTurn, outOfRange, rangePenalty, shutdownPurge, sprint, sprintBlocker } from './turn'
import type { Mech, MechSettings } from './types'

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }
const ON: MechSettings = { autoAmmo: true, autoHeatDamage: true, autoCookoff: true, autoHitDamage: true }
const R = FIXTURE_RULES
const AC = 'larm:1', MG = 'rarm:1', HAMMER = 'rarm:0', JJ = 'lleg:1'

function mule(settings: Partial<MechSettings> = {}): Mech {
  const m = newMech(RULES, 'Mule', 'Test')
  return { ...m, settings: { ...ON, ...settings } }
}
const S = 'Short' as const
const never = jest.fn(() => { throw new Error('roller called') })
const hp = (m: Mech) => m.turn.heat

describe('brawl pacing', () => {
  it('matches the spec example', () => {
    let m = mule()
    for (const k of [AC, MG, MG, JJ]) m = activate(R, m, k, never, S).mech
    expect(hp(m)).toBe(6)
    m = newTurn(R, m).mech
    expect(hp(m)).toBe(4)
    for (const k of [AC, MG, MG, JJ]) m = activate(R, m, k, never, S).mech
    expect(hp(m)).toBe(10)
    expect(never).not.toHaveBeenCalled()
    expect(hp(newTurn(R, m).mech)).toBe(8)
  })
})

describe('overheat', () => {
  it('rolls overage after the action and wounds the acting mount', () => {
    const m = mule()
    const hot = { ...m, turn: { ...m.turn, heat: 10 } }
    const roller = jest.fn(() => [4, 1])
    const r = activate(R, hot, MG, roller, S)
    expect(roller).toHaveBeenCalledWith(2)
    expect(r.mech.sections.rarm.wounds[1]).toBe(true)
    expect(r.mech.sections.rarm.wounds[0]).toBe(false)
  })
  it('overflows extra wounds into the section', () => {
    const m = mule()
    const hot = { ...m, turn: { ...m.turn, heat: 10 } }
    const r = activate(R, hot, MG, () => [4, 4], S)
    expect(r.mech.sections.rarm.wounds).toEqual([true, true])
  })
  it('does nothing automatic when off', () => {
    const m = mule({ autoHeatDamage: false })
    const hot = { ...m, turn: { ...m.turn, heat: 10 } }
    const roller = jest.fn(() => [4])
    const r = activate(R, hot, MG, roller, S)
    expect(roller).not.toHaveBeenCalled()
    expect(r.events.join('\n')).toContain('d4')
    expect(r.mech.sections.rarm.wounds).toEqual([false, false])
  })
})

describe('ammo', () => {
  const bins = (m: Mech) => Object.values(m.sections).flatMap(s => s.mounts).filter(x => x.ammo !== undefined).map(x => x.ammo)
  it('spends ammo when on', () => {
    const m = mule()
    const before = bins(m)
    expect(bins(activate(R, m, MG, never, S).mech)).not.toEqual(before)
  })
  it('leaves ammo when off', () => {
    const m = mule({ autoAmmo: false })
    const r = activate(R, m, MG, never, S)
    expect(bins(r.mech)).toEqual(bins(m))
    expect(r.events.join('\n')).toContain('by hand')
  })
})

describe('blockers', () => {
  it('range is checked against the given target', () => {
    expect(activationBlocker(R, mule(), MG, 'Mid')).toBe('Target is beyond Short range.')
    expect(activationBlocker(R, mule(), HAMMER, 'Mid')).toContain('Melee')
    expect(activationBlocker(R, mule(), HAMMER, 'Short')).toBeNull()
    expect(activationBlocker(R, mule(), MG)).toBeNull()
    expect(activationBlocker(R, mule(), MG, 'Short')).toBeNull()
  })
  it('activate works at the weapon band', () => {
    const m = mule()
    const r = activate(R, m, AC, never, 'Short')
    expect(r.mech.turn.used[AC]).toBe(1)
    expect(activate(R, m, MG, never, 'Mid').mech).toBe(m)
  })
  it('range helpers', () => {
    const mg = R.attachments.find(a => a.name === 'Machine Gun')!
    expect(outOfRange(mg, 'Mid')).toBe(true)
    expect(rangePenalty(mg, 'Short')).toBe(0)
  })
  it('repeat limit', () => {
    let m = mule()
    m = activate(R, m, MG, never, S).mech
    m = activate(R, m, MG, never, S).mech
    expect(activationBlocker(R, m, MG)).toContain('Already activated 2×')
  })
  it('energy', () => {
    const m = mule()
    expect(activationBlocker(R, { ...m, turn: { ...m.turn, energy: 0 } }, AC)).toBe('Not enough energy: needs 2, have 0.')
  })
  it('out of action', () => {
    const m = mule()
    expect(activationBlocker(R, { ...m, turn: { ...m.turn, out: true } }, MG)).toBe('Mech is out of action.')
  })
})

describe('shutdown, new turn, sprint', () => {
  const shut = () => { const m = mule(); return shutdownPurge(R, { ...m, turn: { ...m.turn, heat: 13 } }).mech }
  it('shutdown & purge', () => {
    expect(shut().turn).toMatchObject({ heat: 9, shutdown: true, stored: 0 })
  })
  it('blocks actions while shut down', () => {
    const m = shut()
    expect(activationBlocker(R, m, MG)).toBe('Shut down until New turn.')
    expect(sprintBlocker(R, m)).toBe('Shut down until New turn.')
  })
  it('new turn after shutdown only reboots and refills', () => {
    const m = newTurn(R, shut()).mech
    expect(m.turn).toMatchObject({ shutdown: false, energy: 6, used: {}, heat: 9 })
  })
  it('normal new turn', () => {
    let m = mule()
    m = activate(R, m, MG, never, S).mech
    const left = m.turn.energy
    const r = newTurn(R, { ...m, turn: { ...m.turn, heat: 6 } }).mech
    expect(r.turn.heat).toBe(4)
    expect(r.turn.used).toEqual({})
    expect(r.turn.energy).toBeGreaterThanOrEqual(6)
    expect(r.turn.energy).toBeLessThanOrEqual(6 + left)
  })
  it('sprint once per turn', () => {
    const m = mule()
    const r = sprint(R, m, never).mech
    expect(r.turn).toMatchObject({ energy: m.turn.energy - 2, heat: m.turn.heat + 2 })
    expect(r.turn.used.sprint).toBe(1)
    expect(sprintBlocker(R, r)).toBe('Already sprinted this turn.')
    expect(sprint(R, r, never).mech).toBe(r)
    expect(newTurn(R, r).mech.turn.used).toEqual({})
  })
  it('refuses at speed 0', () => {
    const m = mule()
    const sections = { ...m.sections, lleg: { ...m.sections.lleg, wounds: m.sections.lleg.wounds.map(() => true) }, rleg: { ...m.sections.rleg, wounds: m.sections.rleg.wounds.map(() => true) } }
    const dead = { ...m, sections }
    expect(sprintBlocker(R, dead)).toBe('Cannot move: no working legs.')
    expect(sprint(R, dead, never).mech).toBe(dead)
  })
})

describe('notices', () => {
  it('none for a plain activation', () => {
    expect(activate(R, mule(), MG, never, S).notices).toEqual([])
  })
  it('overheat to roll by hand', () => {
    const m = mule({ autoHeatDamage: false })
    const r = activate(R, { ...m, turn: { ...m.turn, heat: 10 } }, MG, never, S)
    expect(r.notices).toHaveLength(1)
    expect(r.notices[0]).toContain('d4')
  })
  it('overheat applied', () => {
    const m = mule()
    const r = activate(R, { ...m, turn: { ...m.turn, heat: 10 } }, MG, () => [4, 1], S)
    expect(r.notices).toHaveLength(1)
    expect(r.notices[0]).toContain('wound')
  })
  it('overheat applied with no wounds rolled is not a notice', () => {
    const m = mule()
    const r = activate(R, { ...m, turn: { ...m.turn, heat: 10 } }, MG, () => [1, 2], S)
    expect(r.notices).toEqual([])
  })
  it('sprint when overheated notifies', () => {
    const m = mule({ autoHeatDamage: false })
    expect(sprint(R, { ...m, turn: { ...m.turn, heat: 10 } }, never).notices).toHaveLength(1)
  })
})
