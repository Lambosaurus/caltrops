import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechPanel from './MechPanel'

jest.mock('../../lib/alerts')

function setup(mode: 'sheet' | 'mech' = 'sheet', change?: (m: any) => void) {
  const rules: any = { name: 'x', levelup: { skills: 2 }, skills: [{ id: 'skills', name: 'Skills', skills: [] }, { id: 'pilot', name: 'Pilot', skills: [] }], mechs: { ...FIXTURE_RULES, skillSet: 'pilot' } }
  const mech = newMech(rules, 'Mule', 'Rusty')
  change?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mode', mode)
  view.publish('mech', mech)
  // The first set's Gunnery (9) must not count: mech rolls use the set the mech rules name (pilot, Gunnery 2).
  view.publish('sheet', { attributes: { Precision: 3 }, skills: { Gunnery: 9 }, skillSets: { pilot: { Gunnery: 2 } } })
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  return { view, energy: mech.turn.energy }
}

const why = (label: string) => screen.getByLabelText(label).closest('[data-why]')?.getAttribute('data-why') ?? null

/** Clicks part activate buttons until the dialog titled `name` opens. */
function open(name: string | RegExp) {
  for (const b of screen.getAllByText(/^\dE \+\dH/)) {
    fireEvent.click(b)
    if (screen.queryByRole('heading', { name })) return
    const cancel = screen.queryAllByText('Cancel').slice(-1)[0]
    if (cancel) fireEvent.click(cancel)
  }
  throw new Error(`no dialog ${name}`)
}

test('clicking a weapon opens its own attack dialog; Fire pays and rolls it with a d12', () => {
  const { view, energy } = setup()
  open('Autocannon')
  expect(screen.queryByLabelText('Autocannon 1 shot')).toBeNull() // not Repeating: no shot picker
  expect(screen.queryByLabelText('Machine Gun 1 shot')).toBeNull() // no other weapons in the dialog
  expect(screen.queryByTestId('roll-rarm:1')).toBeNull()
  // Precision 3 + Gunnery 2 + Autocannon 3
  expect(screen.getByTestId('roll-larm:1').textContent).toContain('8d4 + d12')
  expect(view.read('mech').turn.energy).toBe(energy)
  fireEvent.click(screen.getByText('Fire'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  const d12 = Number(/d12 (\d+)/.exec(screen.getByTestId('shot-d12').textContent!)![1])
  expect(d12).toBeGreaterThanOrEqual(1)
  expect(d12).toBeLessThanOrEqual(12)
})

test('a Repeating weapon picks how many shots; the bonus and band apply to its roll', () => {
  const { view, energy } = setup()
  open('Machine Gun')
  expect(screen.getByLabelText('Machine Gun 1 shot').getAttribute('aria-pressed')).toBe('true')
  expect(screen.queryByLabelText('Machine Gun 3 shots')).toBeNull() // Repeating 2
  fireEvent.click(screen.getByLabelText('Machine Gun 2 shots'))
  fireEvent.change(screen.getByLabelText('Bonus'), { target: { value: '-2' } })
  // Short is its own band: Reflex 0 + Gunnery 2 + 2 × 2 − 2 = 4.
  expect(screen.getByTestId('roll-rarm:1').textContent).toContain('Machine Gun ×2')
  expect(screen.getByTestId('roll-rarm:1').textContent).toContain('4d4 + d12')
  fireEvent.click(screen.getByText('Fire'))
  expect(view.read('mech').turn.energy).toBe(energy - 2)
  expect(screen.getByTestId('result-rarm:1').textContent).toContain('Machine Gun ×2')
})

test('a shot count the mech cannot make is disabled and says why', () => {
  setup('sheet', m => { m.turn.energy = 1 })
  open('Machine Gun')
  expect((screen.getByLabelText('Machine Gun 2 shots') as HTMLButtonElement).disabled).toBe(true)
  expect(why('Machine Gun 2 shots')).toBe('Not enough energy: 2 shots need 2, have 1.')
  fireEvent.click(screen.getByText('Long', { selector: 'button' }))
  expect(screen.getByTestId('fire-why').textContent).toBe('Out of range: reaches Short, target is Long.')
  expect((screen.getByText('Fire').closest('button') as HTMLButtonElement).disabled).toBe(true)
})

test('a weapon with an empty ammo bin cannot be clicked', () => {
  setup('sheet', m => {
    for (const s of Object.values<any>(m.sections)) for (const x of s.mounts) if (x.name === 'Ammo Bin: Light') x.ammo = 0
  })
  expect(() => open('Machine Gun')).toThrow('no dialog Machine Gun') // its button is disabled
})

test('melee weapons strike an Engaged target', () => {
  const { view, energy } = setup()
  open('Breaching Hammer (melee)')
  expect(screen.getByText('Engaged', { selector: 'button' })).toBeTruthy()
  expect(screen.queryByText('Mid', { selector: 'button' })).toBeNull()
  fireEvent.click(screen.getByText('Fire'))
  expect(view.read('mech').turn.energy).toBe(energy - 1)
})

test('there are no grouped Attack or Strike buttons; status-bar buttons say why they are disabled', () => {
  setup('sheet', m => { m.turn.shutdown = true; m.turn.holdShutdown = true })
  expect(screen.queryByText('Attack')).toBeNull()
  expect(screen.queryByText('Strike')).toBeNull()
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

test('a weapon goes to the VTT as its own roll, with a d12 location', () => {
  const postMessage = jest.fn()
  Object.defineProperty(window, 'opener', { value: { postMessage }, configurable: true })
  try {
    const { view, energy } = setup()
    open('Autocannon')
    fireEvent.click(screen.getByText('Short', { selector: 'button' }))
    fireEvent.click(screen.getByText('Send to VTT'))
    expect(postMessage).toHaveBeenCalledTimes(1)
    const ac = postMessage.mock.calls[0][0]
    expect(ac).toMatchObject({ dice: 4, location: true })
    expect(ac.text).toContain('Autocannon at Short ·')
    expect(view.read('mech').turn.energy).toBe(energy - 2)
    expect(screen.getByTestId('shot-vtt')).toBeTruthy()
  } finally {
    Object.defineProperty(window, 'opener', { value: null, configurable: true })
  }
})
