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
  it('returns null without a roll', () => {
    expect(activationRoll(RULES, att('Jump Jets'), 'Short', {})).toBeNull()
  })
})
