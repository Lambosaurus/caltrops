import { DEFAULT_RULES } from '../rules'
import { FIXTURE_RULES } from './fixture'
import { findAttachment } from './loadout'
import { activationRoll, sprintRoll, statDice } from './roll'
import { newMech } from './loadout'
import { deriveStats } from './derive'

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }
const att = (n: string) => findAttachment(FIXTURE_RULES, n)!

describe('activationRoll', () => {
  it('rolls Autocannon at Short with the range penalty', () => {
    expect(activationRoll(RULES, att('Autocannon'), 'Short', { Precision: 3, Gunnery: 2 })).toEqual({
      attribute: { name: 'Precision', score: 3 }, skill: { name: 'Gunnery', score: 2 }, bonus: 2,
    })
  })
  it('uses the explicit Violence aspect for the Manipulator', () => {
    expect(activationRoll(RULES, att('Manipulator'), 'Short', {})?.attribute?.name).toBe('Violence')
  })
  it('adds any extra dice the caller passes', () => {
    expect(activationRoll(RULES, att('Autocannon'), 'Mid', {}, 2)?.bonus).toBe(5)
  })
  it('lists the mech stats a roll adds, by name', () => {
    const m = newMech(RULES, 'Mule', 'Test')
    const d = deriveStats(FIXTURE_RULES, m)
    expect(statDice(FIXTURE_RULES, m, ['evasion', 'speed'])).toEqual([{ name: 'evasion', value: d.evasion }, { name: 'speed', value: d.speed }])
    expect(statDice(FIXTURE_RULES, m, undefined)).toEqual([])
  })
  it('returns null without a roll', () => {
    expect(activationRoll(RULES, att('Jump Jets'), 'Short', {})).toBeNull()
  })
})

describe('sprintRoll', () => {
  it('is whatever the mech rules define, with its stats added', () => {
    const rules = { ...RULES, mechs: { ...FIXTURE_RULES, sprintRoll: { label: 'Dodge', aspect: 'Reflex', skill: 'Mobility', add: ['evasion'] } } }
    const m = newMech(rules, 'Mule', 'Test')
    expect(sprintRoll(rules, m, { Reflex: 2, Mobility: 1, Gunnery: 5 })).toEqual({
      attribute: { name: 'Reflex', score: 2 }, skill: { name: 'Mobility', score: 1 }, bonus: deriveStats(rules.mechs, m).evasion,
    })
  })
  it('is null when the ruleset has no Sprint roll', () => {
    expect(sprintRoll(RULES, newMech(RULES, 'Mule', 'Test'), {})).toBeNull()
  })
})
