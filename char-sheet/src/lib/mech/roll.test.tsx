import { DEFAULT_RULES } from '../rules'
import { FIXTURE_RULES } from './fixture'
import { findAttachment } from './loadout'
import { activationRoll } from './roll'

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
  it('adds the mech Evasion for a dodge roll (Evasive parts)', () => {
    const evasive = { ...att('Jump Jets'), roll: { aspect: 'Reflex', skill: 'Mobility', bonus: 0, evasion: true } }
    expect(activationRoll(RULES, evasive, 'Short', { Reflex: 2, Mobility: 1 }, 3)).toEqual({
      attribute: { name: 'Reflex', score: 2 }, skill: { name: 'Mobility', score: 1 }, bonus: 3,
    })
    expect(activationRoll(RULES, att('Autocannon'), 'Mid', {}, 3)?.bonus).toBe(3) // only dodge rolls add Evasion
  })
  it('returns null without a roll', () => {
    expect(activationRoll(RULES, att('Jump Jets'), 'Short', {})).toBeNull()
  })
})
