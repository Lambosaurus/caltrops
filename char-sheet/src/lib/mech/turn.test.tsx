import { DEFAULT_RULES } from '../rules'
import { FIXTURE_RULES } from './fixture'
import { newMech } from './loadout'
import { activate, activationBlocker, attackModifier, endTurn, move, shutdownPurge, sprint, startTurn } from './turn'
import type { Mech, MechSettings } from './types'

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }
const ON: MechSettings = { autoAmmo: true, autoHeatDamage: true, autoCookoff: true, autoHitDamage: true }
const R = FIXTURE_RULES
const AC = 'larm:1', MG = 'rarm:1', HAMMER = 'rarm:0', JJ = 'lleg:1'

function mule(settings: Partial<MechSettings> = {}, target: 'Short' | 'Mid' | 'Long' = 'Short'): Mech {
  const m = newMech(RULES, 'Mule', 'Test')
  return { ...m, settings: { ...ON, ...settings }, turn: { ...m.turn, target } }
}
const never = jest.fn(() => { throw new Error('roller called') })
const hp = (m: Mech) => m.turn.heat

describe('brawl pacing', () => {
  it('matches the spec example', () => {
    let m = mule()
    for (const k of [AC, MG, MG, JJ]) m = activate(R, m, k, never).mech
    expect(hp(m)).toBe(6)
    m = endTurn(R, m).mech
    expect(hp(m)).toBe(4)
    m = startTurn(R, m).mech
    for (const k of [AC, MG, MG, JJ]) m = activate(R, m, k, never).mech
    expect(hp(m)).toBe(10)
    expect(never).not.toHaveBeenCalled()
    expect(hp(endTurn(R, m).mech)).toBe(8)
  })
})

describe('overheat', () => {
  it('rolls overage after the action and wounds the acting mount', () => {
    const m = mule()
    const hot = { ...m, turn: { ...m.turn, heat: 10 } }
    const roller = jest.fn(() => [4, 1])
    const r = activate(R, hot, MG, roller)
    expect(roller).toHaveBeenCalledWith(2)
    expect(r.mech.sections.rarm.wounds[1]).toBe(true)
    expect(r.mech.sections.rarm.wounds[0]).toBe(false)
  })
  it('overflows extra wounds into the section', () => {
    const m = mule()
    const hot = { ...m, turn: { ...m.turn, heat: 10 } }
    const r = activate(R, hot, MG, () => [4, 4])
    expect(r.mech.sections.rarm.wounds).toEqual([true, true])
  })
  it('does nothing automatic when off', () => {
    const m = mule({ autoHeatDamage: false })
    const hot = { ...m, turn: { ...m.turn, heat: 10 } }
    const roller = jest.fn(() => [4])
    const r = activate(R, hot, MG, roller)
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
    expect(bins(activate(R, m, MG, never).mech)).not.toEqual(before)
  })
  it('leaves ammo when off', () => {
    const m = mule({ autoAmmo: false })
    const r = activate(R, m, MG, never)
    expect(bins(r.mech)).toEqual(bins(m))
    expect(r.events.join('\n')).toContain('by hand')
  })
})

describe('blockers', () => {
  it('range', () => {
    expect(activationBlocker(R, mule({}, 'Mid'), MG)).toBe('Target is beyond Short range.')
    expect(activationBlocker(R, mule({}, 'Mid'), HAMMER)).toContain('Melee')
    expect(activationBlocker(R, mule(), HAMMER)).toBeNull()
  })
  it('repeat limit', () => {
    let m = mule()
    m = activate(R, m, MG, never).mech
    m = activate(R, m, MG, never).mech
    expect(activationBlocker(R, m, MG)).toContain('Already activated 2×')
  })
  it('turn ended and energy', () => {
    const m = mule()
    expect(activationBlocker(R, endTurn(R, m).mech, MG)).toBe('Turn ended: press Start turn.')
    expect(activationBlocker(R, { ...m, turn: { ...m.turn, energy: 0 } }, AC)).toBe('Not enough energy: needs 2, have 0.')
  })
})

describe('shutdown, start, mobility', () => {
  it('shutdown & purge', () => {
    const m = mule()
    const r = shutdownPurge(R, { ...m, turn: { ...m.turn, heat: 13 } })
    expect(r.mech.turn).toMatchObject({ heat: 9, shutdown: true, phase: 'ended', stored: 0 })
    expect(attackModifier(R, r.mech).total).toBe(3)
  })
  it('start turn', () => {
    let m = mule()
    m = activate(R, m, MG, never).mech
    m = move(R, m).mech
    m = startTurn(R, endTurn(R, m).mech).mech
    expect(m.turn).toMatchObject({ used: {}, posture: 'still', energy: 6, phase: 'active' })
  })
  it('sprint', () => {
    const m = mule()
    const r = sprint(R, m, never).mech
    expect(r.turn).toMatchObject({ energy: m.turn.energy - 2, heat: m.turn.heat + 2, posture: 'sprint' })
    expect(attackModifier(R, r).total).toBe(-2)
  })
  it('refuses at speed 0', () => {
    const m = mule()
    const sections = { ...m.sections, lleg: { ...m.sections.lleg, wounds: m.sections.lleg.wounds.map(() => true) }, rleg: { ...m.sections.rleg, wounds: m.sections.rleg.wounds.map(() => true) } }
    const dead = { ...m, sections }
    expect(move(R, dead).mech).toBe(dead)
    expect(sprint(R, dead, never).mech).toBe(dead)
  })
})
