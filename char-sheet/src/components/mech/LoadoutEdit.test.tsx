import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import EquipmentTable from '../EquipmentTable'
import MechView from './MechView'

function setup(editable: EditMode, tweak?: (m: any) => void) {
  const mechs = { ...FIXTURE_RULES, chassis: [...FIXTURE_RULES.chassis, { ...FIXTURE_RULES.chassis[0], name: 'Jackal', loadout: {} }] }
  const rules: any = { name: 'x', mechs, equipment: [] }
  const mech = newMech(rules, 'Mule', 'Rusty')
  tweak?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mech', mech)
  view.publish('mechLog', [])
  render(withDnd(<MechView view={view} editable={editable}/>))
  return view
}

test('loadout toggle is only offered with full edit rights', () => {
  setup(EditMode.Live)
  expect(screen.queryByText('Edit loadout')).toBeNull()
})

test('loadout mode shows the catalogue and hides play controls', () => {
  setup(EditMode.Full)
  expect(screen.queryByTestId('mech-catalogue')).toBeNull()
  fireEvent.click(screen.getByText('Edit loadout'))
  expect(screen.getByTestId('mech-catalogue')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Repair & rearm' })).toBeNull()
})

test('x removes the reactor and the warning appears', () => {
  const view = setup(EditMode.Full)
  expect(screen.queryByText(/No reactor mounted/)).toBeNull()
  fireEvent.click(screen.getByText('Edit loadout'))
  fireEvent.click(screen.getByLabelText('Remove Dipole Fusion Reactor'))
  expect(view.read('mech').sections.core.mounts.some((m: any) => m.name === 'Dipole Fusion Reactor')).toBe(false)
  expect(screen.getByText(/No reactor mounted/)).toBeTruthy()
})

test('changing chassis asks first', () => {
  const view = setup(EditMode.Full)
  fireEvent.click(screen.getByText('Edit loadout'))
  const options = Array.from((screen.getByLabelText('Chassis') as HTMLSelectElement).options).map(o => o.value)
  expect(options).toContain('Jackal')
  fireEvent.change(screen.getByLabelText('Chassis'), { target: { value: 'Jackal' } })
  expect(view.read('mech').chassis).toBe('Mule')
  fireEvent.click(screen.getByText('Change chassis', { selector: 'button' }))
  expect(view.read('mech').chassis).toBe('Jackal')
  expect(view.read('mech').sections.core.mounts).toEqual([])
})

describe('EquipmentTable capacity strike-through', () => {
  function table(size: number | undefined, n: number) {
    const view = new ObjectService().view('')
    view.publish('', Array.from({ length: n }, (_, i) => ({ name: `Item${i}` })))
    render(withDnd(<EquipmentTable equipment={[]} container={{ name: 'C', size }} view={view} editable={EditMode.Live}/>))
  }
  test('rows past size are struck through', () => {
    table(2, 3)
    expect(screen.getByText('Item2').closest('tr')!.className).toContain('line-through')
    expect(screen.getByText('Item1').closest('tr')!.className).not.toContain('line-through')
  })
  test('inert when within size or without size', () => {
    table(undefined, 3)
    expect(screen.getByText('Item2').closest('tr')!.className).not.toContain('line-through')
  })
})

test('remove buttons render a multiplication sign', () => {
  setup(EditMode.Full)
  fireEvent.click(screen.getByText('Edit loadout'))
  expect(screen.getByLabelText('Remove Dipole Fusion Reactor').textContent).toBe('×')
  screen.getAllByLabelText('Remove Plating').forEach(b => expect(b.textContent).toBe('×'))
})
