import { render, screen, fireEvent } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import CurrentMechCard from './CurrentMechCard'

function setup(editable: EditMode) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule', 'Rusty')
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('sheet', { id: 's', mech: mech.id })
  view.publish('mech', mech)
  render(<CurrentMechCard view={view} mechRules={FIXTURE_RULES} editable={editable} open={() => {}}/>)
  return { view, mech }
}

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
