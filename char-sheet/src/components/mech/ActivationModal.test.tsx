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

test('Autocannon joins the pending shot, which rolls pilot dice + weapon dice + a d12 once', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  expect(view.read('mech').turn.energy).toBe(energy)
  fireEvent.click(screen.getByText('Activate: +3 dice to the ranged shot'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  expect(view.read('mech').turn.shot).toEqual([{ key: 'larm:1', name: 'Autocannon', dice: 3, penalty: 0 }])
  expect(screen.getByTestId('pending-shot').textContent).toContain('+3 dice')
  fireEvent.click(screen.getByText('Roll ranged shot + d12'))
  // Precision 3 + Gunnery 2 + 3
  fireEvent.click(screen.getByText('Roll 8d4 + d12'))
  expect(document.querySelectorAll('svg polygon').length).toBeGreaterThanOrEqual(8)
  const d12 = Number(/Location d12: (\d+)/.exec(screen.getByTestId('shot-d12').textContent!)![1])
  expect(d12).toBeGreaterThanOrEqual(1)
  expect(d12).toBeLessThanOrEqual(12)
  expect(view.read('mech').turn.shot).toEqual([])
  expect(view.read('mech').turn.fired.shot).toBe(true)
})

test('an aimed shot pays dice and skips the d12', () => {
  setup()
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  fireEvent.click(screen.getByText('Activate: +3 dice to the ranged shot'))
  fireEvent.click(screen.getByText('Roll ranged shot + d12'))
  const aim = screen.getByText('Aimed shot: dice paid (0 = roll the d12)').parentElement!
  fireEvent.click(aim.querySelectorAll('button')[1])
  fireEvent.click(screen.getByText('Roll 7d4'))
  expect(screen.queryByTestId('shot-d12')).toBeNull()
  expect(screen.getByText('Aimed: the attacker names the section.')).toBeTruthy()
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
  fireEvent.click(screen.getByText('Activate: +3 dice to the ranged shot'))
  fireEvent.click(screen.getByText('Roll ranged shot + d12'))
  expect(screen.getByText('Roll 3d4 + d12')).toBeTruthy()
})

function openByHeading(name: string, pattern: RegExp) {
  for (const b of screen.getAllByText(pattern)) {
    fireEvent.click(b)
    if (screen.queryByRole('heading', { name })) return
    fireEvent.click(screen.getAllByText('Cancel').slice(-1)[0])
  }
  throw new Error(`no activation button opened ${name}`)
}

test('choosing Short for the Autocannon costs one die', () => {
  setup()
  openByHeading('Autocannon', /^2E \+2H/)
  fireEvent.click(screen.getByText('Short', { selector: 'button' }))
  fireEvent.click(screen.getByText('Activate: +2 dice to the ranged shot'))
  expect(screen.getByTestId('pending-shot').textContent).toContain('Ranged shot at Short: +2 dice')
})

test('the pending shot fixes the band for the next weapon', () => {
  const { view } = setup()
  openByHeading('Autocannon', /^2E \+2H/)
  fireEvent.click(screen.getByText('Activate: +3 dice to the ranged shot'))
  openByHeading('Machine Gun', /^1E \+1H/)
  expect(screen.getByText('Target is beyond Short range.')).toBeTruthy()
  fireEvent.click(screen.getAllByText('Cancel').slice(-1)[0])
  expect(view.read('mech').turn.shotBand).toBe('Mid')
})

test('Machine Gun at Mid is blocked beyond Short range', () => {
  setup()
  openByHeading('Machine Gun', /^1E \+1H/)
  fireEvent.click(screen.getByText('Mid', { selector: 'button' }))
  expect(screen.getByText('Target is beyond Short range.')).toBeTruthy()
  expect((screen.getByText(/dice to the ranged shot/) as HTMLButtonElement).disabled).toBe(true)
})
