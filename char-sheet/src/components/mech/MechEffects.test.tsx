import { render, screen } from '@testing-library/react'
import scrapLancerRuleset from '../../data/scraplancer'
import { newMech } from '../../lib/mech/loadout'
import { toggleWound } from '../../lib/mech/damage'
import MechEffects from './MechEffects'

const mr = scrapLancerRuleset.mechs!
const snare = () => newMech(scrapLancerRuleset, 'HCA Picket Block 1', 'Snare', 'Snare')

test('lists each standing effect with its rule and source part', () => {
  render(<MechEffects rules={mr} mech={snare()}/>)
  expect(screen.getByText('Effects')).toBeTruthy()
  expect(screen.getByText('Jamming')).toBeTruthy()
  expect(screen.getByText('breaks and blocks locks on this mech')).toBeTruthy()
  expect(screen.getByText(/SBL Jammer J1/)).toBeTruthy()
})

test('marks the effect of a disabled part as lost', () => {
  render(<MechEffects rules={mr} mech={toggleWound(mr, snare(), 'cockpit', 0)}/>)
  expect(screen.getByTestId('effect-Jamming').className).toContain('line-through')
  expect(screen.getByText(/disabled/)).toBeTruthy()
})

test('renders nothing for a mech with no standing effects', () => {
  const { container } = render(<MechEffects rules={mr} mech={newMech(scrapLancerRuleset, 'OHS Mule Mk II', 'Cleaver', 'Cleaver')}/>)
  expect(container.innerHTML).toBe('')
})
