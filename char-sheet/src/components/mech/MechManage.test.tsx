import { render, screen, fireEvent } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechManage from './MechManage'
import StandaloneMech from './StandaloneMech'

jest.mock('../../lib/alerts')

function setup(editable: EditMode, opts: { mode?: string, withMech?: boolean, sheetEditable?: EditMode } = {}) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES, equipment: [] }
  const mech = newMech(rules, 'Mule', 'Rusty')
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  if (opts.mode) view.publish('mode', opts.mode)
  if (opts.withMech !== false) {
    view.publish('sheet', { id: 's', mech: mech.id })
    view.publish('mech', mech)
  } else {
    view.publish('sheet', { id: 's' })
  }
  render(withDnd(<MechManage view={view} editable={editable} sheetEditable={opts.sheetEditable}/>))
  return { view, mech }
}

test('shows settings and the loadout editor, not the play status bar', () => {
  setup(EditMode.Full)
  expect(screen.getByText('Automation')).toBeTruthy()
  expect(screen.queryByText(/^Sprint/)).toBeNull()
  expect(screen.queryByText(/New turn/)).toBeNull()
  expect(screen.queryByTestId('mech-catalogue')).toBeNull()
  fireEvent.click(screen.getByText('Edit loadout'))
  expect(screen.getByTestId('mech-catalogue')).toBeTruthy()
})

test('toggling an automation setting writes mech/settings/<key>', () => {
  const { view } = setup(EditMode.Live)
  fireEvent.click(screen.getByLabelText('Spend ammo on activation'))
  expect(view.read('mech/settings/autoAmmo')).toBe(true)
})

test('Unassign deletes sheet/mech', () => {
  const { view } = setup(EditMode.Live)
  fireEvent.click(screen.getByText('Unassign'))
  expect(view.read('sheet/mech')).toBeUndefined()
})

test('Unassign is disabled below Live', () => {
  setup(EditMode.None)
  expect((screen.getByText('Unassign') as HTMLButtonElement).disabled).toBe(true)
})

test('Copy mech link copies the mech url', () => {
  const write = jest.fn()
  Object.assign(navigator, { clipboard: { writeText: write } })
  const { mech } = setup(EditMode.None)
  fireEvent.click(screen.getByText('Copy mech link'))
  expect(write).toHaveBeenCalledWith(`${window.location.origin}${window.location.pathname}?mech=${mech.id}`)
})

test('with no mech it still offers New, Load and Assign', () => {
  setup(EditMode.None, { withMech: false, sheetEditable: EditMode.Live })
  expect(screen.getByText('No mech assigned.')).toBeTruthy()
  expect((screen.getByText('New mech') as HTMLButtonElement).disabled).toBe(false)
  expect(screen.getByText('Load mech')).toBeTruthy()
  expect((screen.getByText(/^Assign/) as HTMLButtonElement).disabled).toBe(false)
})

test('standalone mode has no Assign or Unassign', () => {
  setup(EditMode.Full, { mode: 'mech' })
  expect(screen.queryByText('Unassign')).toBeNull()
  expect(screen.queryByText(/^Assign/)).toBeNull()
  expect(screen.getByText('New mech')).toBeTruthy()
})

test('standalone renders Mech and Manage tabs, not stacked', () => {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES, equipment: [] }
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mode', 'mech')
  view.publish('mech', newMech(rules, 'Mule', 'Rusty'))
  render(withDnd(<StandaloneMech view={view} editable={EditMode.Full}/>))
  expect(screen.getByText('Mech', { selector: 'button' })).toBeTruthy()
  expect(screen.getByText(/^Sprint/)).toBeTruthy()
  expect(screen.queryByText('Automation')).toBeNull()
  fireEvent.click(screen.getByText('Manage'))
  expect(screen.getByText('Automation')).toBeTruthy()
  expect(screen.queryByText(/^Sprint/)).toBeNull()
})

test('an unknown chassis still shows Unassign so the assignment can be fixed', () => {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES, equipment: [] }
  const mech = { ...newMech(rules, 'Mule', 'Rusty'), chassis: 'Nonexistent' }
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('sheet', { id: 's', mech: mech.id })
  view.publish('mech', mech)
  render(withDnd(<MechManage view={view} editable={EditMode.Live}/>))
  expect(screen.getByText(/Unknown chassis/)).toBeTruthy()
  fireEvent.click(screen.getByText('Unassign'))
  expect(view.read('sheet/mech')).toBeUndefined()
})
