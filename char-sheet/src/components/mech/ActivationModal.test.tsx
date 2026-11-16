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

test('clicking a weapon opens the attack dialog with it selected; Fire pays and rolls once with a d12', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  expect(screen.getByRole('heading', { name: 'Ranged shot' })).toBeTruthy()
  expect(screen.getByTestId('count-larm:1').textContent).toBe('1')
  expect(view.read('mech').turn.energy).toBe(energy)
  // Precision 3 + Gunnery 2 + Autocannon 3
  fireEvent.click(screen.getByText('Fire: 8d4 + d12'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  expect(view.read('mech').turn.fired.shot).toBe(true)
  expect(document.querySelectorAll('svg polygon').length).toBeGreaterThanOrEqual(8)
  const d12 = Number(/Location d12: (\d+)/.exec(screen.getByTestId('shot-d12').textContent!)![1])
  expect(d12).toBeGreaterThanOrEqual(1)
  expect(d12).toBeLessThanOrEqual(12)
})

test('the attack dialog takes counts per weapon and one bonus', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getByText('Attack'))
  fireEvent.click(screen.getByText('Short', { selector: 'button' }))
  fireEvent.click(screen.getByLabelText('Autocannon more'))
  fireEvent.click(screen.getByLabelText('Machine Gun more'))
  fireEvent.click(screen.getByLabelText('Machine Gun more'))
  expect(screen.getByTestId('count-rarm:1').textContent).toBe('2')
  expect((screen.getByLabelText('Machine Gun more') as HTMLButtonElement).disabled).toBe(true) // Repeating 2
  fireEvent.change(screen.getByLabelText('Bonus'), { target: { value: '-2' } })
  // Reflex 0 + Gunnery 2 + Autocannon 3 − 1 (closer band) + Machine Gun 2 × 2 − 2
  fireEvent.click(screen.getByText('Fire: 6d4 + d12'))
  expect(view.read('mech').turn.energy).toBe(energy - 4)
})

test('melee goes through Strike, separate from the shot', () => {
  const { view } = setup()
  fireEvent.click(screen.getByText('Strike'))
  expect(screen.getByRole('heading', { name: 'Melee strike' })).toBeTruthy()
  fireEvent.click(screen.getByLabelText('Breaching Hammer more'))
  fireEvent.click(screen.getByText(/^Fire: \d+d4 \+ d12$/))
  expect(view.read('mech').turn.fired).toEqual({ strike: true })
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

test('Sensor Array still rolls on its own', () => {
  setup()
  fireEvent.click(screen.getAllByText(/^1E \+1H/).find(b => {
    fireEvent.click(b)
    const ok = !!screen.queryByRole('heading', { name: /Sensor Array/ })
    if (!ok) fireEvent.click(screen.getAllByText('Cancel').slice(-1)[0])
    return ok
  }) ?? document.body)
  expect(screen.getByText(/Roll \d+ dice & activate/)).toBeTruthy()
})

test('an attack sends its d4s and its d12 hit location to the VTT', () => {
  const postMessage = jest.fn()
  Object.defineProperty(window, 'opener', { value: { postMessage }, configurable: true })
  try {
    const { view, energy } = setup()
    fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
    fireEvent.click(screen.getByText('Send to VTT'))
    expect(postMessage).toHaveBeenCalledTimes(1)
    const body = postMessage.mock.calls[0][0]
    expect(body).toMatchObject({ dice: 8 })
    const d12 = Number(/Hit location d12: (\d+)/.exec(body.text)![1])
    expect(d12).toBeGreaterThanOrEqual(1)
    expect(d12).toBeLessThanOrEqual(12)
    expect(screen.getByTestId('shot-d12').textContent).toBe(`Location d12: ${d12}`)
    expect(body.text).toContain('Gunnery: Precision +3')
    expect(body.text).toContain('Ranged shot at Mid · Autocannon')
    expect(view.read('mech').turn.energy).toBe(energy - 2)
    expect(view.read('mech').turn.fired.shot).toBe(true)
    expect(screen.getByTestId('shot-vtt')).toBeTruthy()
  } finally {
    Object.defineProperty(window, 'opener', { value: null, configurable: true })
  }
})
