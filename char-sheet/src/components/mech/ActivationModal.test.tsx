import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechPanel from './MechPanel'

jest.mock('../../lib/alerts')

function setup(mode: 'sheet' | 'mech' = 'sheet') {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule', 'Rusty')
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mode', mode)
  view.publish('mech', mech)
  view.publish('sheet', { attributes: { Precision: 3 }, skills: { Gunnery: 2 } })
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  return { view, energy: mech.turn.energy }
}

test('Autocannon shows 8 dice (own band, no penalty) and confirming pays energy and rolls', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  expect(view.read('mech').turn.energy).toBe(energy)
  fireEvent.click(screen.getByText('Roll 8 dice & activate'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  expect(document.querySelectorAll('svg polygon').length).toBeGreaterThanOrEqual(8)
  expect(screen.getByText('Done')).toBeTruthy()
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
