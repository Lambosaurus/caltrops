import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import MechView from './MechView'

function setup(mode: 'sheet' | 'mech' = 'sheet') {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule', 'Rusty')
  mech.turn.target = 'Short'
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mode', mode)
  view.publish('mech', mech)
  view.publish('sheet', { attributes: { Precision: 3 }, skills: { Gunnery: 2 } })
  render(<MechView view={view} editable={EditMode.Live}/>)
  return { view, energy: mech.turn.energy }
}

test('Autocannon shows 7 dice and confirming pays energy and rolls', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  expect(view.read('mech').turn.energy).toBe(energy)
  fireEvent.click(screen.getByText('Roll 7 dice & activate'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  expect(document.querySelectorAll('svg polygon').length).toBeGreaterThanOrEqual(7)
  expect(screen.getByText('Done')).toBeTruthy()
  expect(view.read('mechLog').some((l: string) => /Rolled 7d4/.test(l))).toBe(true)
})

test('Jump Jets show only Activate', () => {
  const { view, energy } = setup()
  const btns = screen.getAllByText(/^2E \+2H/)
  for (const b of btns) {
    fireEvent.click(b)
    if (screen.queryByRole('heading', { name: 'Jump Jets' })) break
    fireEvent.click(screen.getAllByText('Cancel').slice(-1)[0])
  }
  expect(screen.getByRole('heading', { name: 'Jump Jets' })).toBeTruthy()
  expect(screen.queryByText(/Roll \d+ dice/)).toBeNull()
  fireEvent.click(screen.getByText('Activate'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  expect(screen.queryByRole('heading', { name: 'Jump Jets' })).toBeNull()
})

test('mech mode uses editable scores defaulting to 0', () => {
  setup('mech')
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  expect(screen.getByText(/Roll \d+ dice & activate/)).toBeTruthy()
})
