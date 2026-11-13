import { render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechView from './MechView'

function setup(editable: EditMode, tweak?: (m: any) => void) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule', 'Rusty')
  tweak?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mech', mech)
  view.publish('mechLog', ['hello'])
  render(withDnd(<MechView view={view} editable={editable}/>))
  return mech
}

test('renders sections with hit labels', () => {
  setup(EditMode.Full)
  expect(screen.getByText('(hit: 1–2) · aim 3')).toBeTruthy()
  expect(screen.getByText('(hit: 12) · aim 4')).toBeTruthy()
  expect(screen.getByText('Rusty')).toBeTruthy()
  expect(screen.getByText('hello')).toBeTruthy()
})

test('activation buttons are disabled when read only', () => {
  setup(EditMode.None)
  const btns = screen.getAllByText(/^1E \+1H 0\/2/) as HTMLButtonElement[]
  expect(btns.length).toBeGreaterThan(0)
  expect(btns.every(b => b.disabled)).toBe(true)
})

test('activation button enabled when live and allowed', () => {
  setup(EditMode.Live, m => { m.turn.target = 'Short' })
  const btns = screen.getAllByText(/^1E \+1H 0\/2/) as HTMLButtonElement[]
  expect(btns.some(b => !b.disabled)).toBe(true)
})

test('unknown parts render without actions', () => {
  setup(EditMode.Full, m => { m.sections.larm.mounts[0].name = 'Mystery Box' })
  expect(screen.getByText('Unknown part: Mystery Box')).toBeTruthy()
})

test('continuation rows are marked', () => {
  setup(EditMode.Full)
  expect(screen.getByText('↳ Autocannon')).toBeTruthy()
})

test('mech without mech rules shows a message', () => {
  const rules: any = { name: 'Plain' }
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mech', newMech({ name: 'x', mechs: FIXTURE_RULES } as any, 'Mule'))
  render(withDnd(<MechView view={view} editable={EditMode.Full}/>))
  expect(screen.getByText(/ruleset \(Plain\) has no mech rules loaded/)).toBeTruthy()
})
