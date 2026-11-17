import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechPanel from './MechPanel'

jest.mock('../../lib/alerts')

function setup(mode: 'sheet' | 'mech' = 'sheet', change?: (m: any) => void) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule', 'Rusty')
  change?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mode', mode)
  view.publish('mech', mech)
  view.publish('sheet', { attributes: { Precision: 3 }, skills: { Gunnery: 2 } })
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  return { view, energy: mech.turn.energy }
}

const why = (label: string) => screen.getByLabelText(label).closest('[data-why]')?.getAttribute('data-why') ?? null

test('clicking a weapon opens the attack dialog with one shot picked; Fire pays and rolls it with a d12', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getAllByText(/^2E \+2H/)[0])
  expect(screen.getByRole('heading', { name: 'Ranged attack' })).toBeTruthy()
  expect(screen.getByLabelText('Autocannon 1 shot').getAttribute('aria-pressed')).toBe('true')
  // Precision 3 + Gunnery 2 + Autocannon 3
  expect(screen.getByTestId('roll-larm:1').textContent).toContain('8d4 + d12')
  expect(view.read('mech').turn.energy).toBe(energy)
  fireEvent.click(screen.getByText('Fire'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  const d12 = Number(/d12 (\d+)/.exec(screen.getByTestId('shot-d12').textContent!)![1])
  expect(d12).toBeGreaterThanOrEqual(1)
  expect(d12).toBeLessThanOrEqual(12)
})

test('each weapon rolls on its own: shots are picked per weapon and the bonus applies to each roll', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getByText('Attack'))
  fireEvent.click(screen.getByText('Short', { selector: 'button' }))
  fireEvent.click(screen.getByLabelText('Autocannon 1 shot'))
  fireEvent.click(screen.getByLabelText('Machine Gun 2 shots'))
  expect(screen.queryByLabelText('Machine Gun 3 shots')).toBeNull() // Repeating 2
  fireEvent.change(screen.getByLabelText('Bonus'), { target: { value: '-2' } })
  // Autocannon: Reflex 0 + Gunnery 2 + 3 − 1 (closer band) − 2 = 2. Machine Gun: 0 + 2 + 2 × 2 − 2 = 4.
  expect(screen.getByTestId('roll-larm:1').textContent).toContain('2d4 + d12')
  expect(screen.getByTestId('roll-rarm:1').textContent).toContain('Machine Gun ×2')
  expect(screen.getByTestId('roll-rarm:1').textContent).toContain('4d4 + d12')
  fireEvent.click(screen.getByText('Fire 2 weapons'))
  expect(view.read('mech').turn.energy).toBe(energy - 4)
  expect(screen.getByTestId('result-larm:1')).toBeTruthy()
  expect(screen.getByTestId('result-rarm:1').textContent).toContain('Machine Gun ×2')
})

test('a shot count the mech cannot make is disabled and says why', () => {
  setup('sheet', m => { m.turn.energy = 3 })
  fireEvent.click(screen.getByText('Attack'))
  fireEvent.click(screen.getByText('Short', { selector: 'button' }))
  fireEvent.click(screen.getByLabelText('Autocannon 1 shot'))
  expect((screen.getByLabelText('Machine Gun 2 shots') as HTMLButtonElement).disabled).toBe(true)
  expect(why('Machine Gun 2 shots')).toBe('Not enough energy: 2 shots need 2 (+2 for the other weapons), have 3.')
  expect(why('Machine Gun 1 shot')).toBeNull()
  fireEvent.click(screen.getByText('Long', { selector: 'button' }))
  expect(why('Machine Gun 1 shot')).toBe('Out of range: reaches Short, target is Long.')
})

test('an empty ammo bin is named as the reason', () => {
  setup('sheet', m => {
    for (const s of Object.values<any>(m.sections)) for (const x of s.mounts) if (x.name === 'Ammo Bin: Light') x.ammo = 0
  })
  fireEvent.click(screen.getByText('Attack'))
  fireEvent.click(screen.getByText('Short', { selector: 'button' }))
  expect(why('Machine Gun 1 shot')).toBe('Not enough Light ammo: needs 1 round, 0 left.')
})

test('melee attacks are against an Engaged target', () => {
  const { view, energy } = setup()
  fireEvent.click(screen.getByText('Strike'))
  expect(screen.getByRole('heading', { name: 'Melee attack' })).toBeTruthy()
  expect(screen.getByText('Engaged', { selector: 'button' })).toBeTruthy()
  expect(screen.queryByText('Mid', { selector: 'button' })).toBeNull()
  fireEvent.click(screen.getByLabelText('Breaching Hammer 1 shot'))
  fireEvent.click(screen.getByText('Fire'))
  expect(view.read('mech').turn.energy).toBe(energy - 1)
})

test('status-bar buttons say why they are disabled', () => {
  setup('sheet', m => { m.turn.shutdown = true; m.turn.holdShutdown = true })
  expect(screen.getByText('Attack').closest('[data-why]')!.getAttribute('data-why')).toBe('Shut down: stays down through the next turn.')
  expect(screen.getByText('Shut down & purge').closest('[data-why]')!.getAttribute('data-why')).toBe('Already shut down.')
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

test('each weapon goes to the VTT as its own roll, with a d12 location', () => {
  const postMessage = jest.fn()
  Object.defineProperty(window, 'opener', { value: { postMessage }, configurable: true })
  try {
    const { view, energy } = setup()
    fireEvent.click(screen.getByText('Attack'))
    fireEvent.click(screen.getByText('Short', { selector: 'button' }))
    fireEvent.click(screen.getByLabelText('Autocannon 1 shot'))
    fireEvent.click(screen.getByLabelText('Machine Gun 1 shot'))
    fireEvent.click(screen.getByText('Send to VTT'))
    expect(postMessage).toHaveBeenCalledTimes(2)
    const [ac, mg] = postMessage.mock.calls.map(c => c[0])
    expect(ac).toMatchObject({ dice: 4, location: true })
    expect(ac.text).toContain('Autocannon at Short ·')
    expect(mg).toMatchObject({ dice: 4, location: true })
    expect(mg.text).toContain('Machine Gun at Short')
    expect(view.read('mech').turn.energy).toBe(energy - 3)
    expect(screen.getAllByTestId('shot-vtt')).toHaveLength(2)
  } finally {
    Object.defineProperty(window, 'opener', { value: null, configurable: true })
  }
})
