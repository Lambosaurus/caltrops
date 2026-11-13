import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechView from './MechView'
import HitModal from './HitModal'
import TurnControls from './TurnControls'

function makeView(tweak?: (m: any) => void) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES }
  const mech = newMech(rules, 'Mule', 'Rusty')
  tweak?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mech', mech)
  view.publish('mechLog', [])
  return view
}

test('HitModal manual path marks wounds on the left leg', () => {
  const view = makeView()
  const before = view.read('mech').sections.lleg
  expect(before.armour.points).toBe(2)
  render(<HitModal view={view} sectionId='lleg' close={() => {}}/>)
  fireEvent.change(screen.getByLabelText('Wounds'), { target: { value: '3' } })
  fireEvent.click(screen.getByText('Apply'))
  const after = view.read('mech').sections.lleg
  expect(after.armour.points).toBe(0)
  expect(after.wounds.slice(0, 3)).toEqual([true, false, false])
  expect(view.read('mechLog')).toContain('3 wounds marked on Left leg')
})

test('HitModal with autoHitDamage on destroys the leg and overflows', () => {
  const view = makeView(m => { m.settings.autoHitDamage = true })
  render(<HitModal view={view} sectionId='lleg' close={() => {}}/>)
  fireEvent.change(screen.getByLabelText('Wounds'), { target: { value: '9' } })
  fireEvent.keyDown(screen.getByLabelText('Wounds'), { key: 'Enter' })
  const m = view.read('mech')
  expect(m.sections.lleg.wounds.every(Boolean)).toBe(true)
  expect(view.read('mechLog').length).toBeGreaterThan(0)
})

test('TurnControls: Move, End turn then Start turn', () => {
  const view = makeView()
  render(<TurnControls view={view} editable={EditMode.Live}/>)
  fireEvent.click(screen.getByText('Move'))
  expect(view.read('mech').turn.posture).toBe('moved')
  fireEvent.click(screen.getByText(/End turn/))
  expect(view.read('mech').turn.phase).toBe('ended')
  expect(screen.getByText(/Start turn/)).toBeTruthy()
  expect(screen.queryByText(/End turn/)).toBeNull()
  fireEvent.click(screen.getByText(/Start turn/))
  expect(view.read('mech').turn.phase).toBe('active')
})

test('target select writes mech/turn/target', () => {
  const view = makeView()
  render(<TurnControls view={view} editable={EditMode.Live}/>)
  fireEvent.change(screen.getByLabelText('Target range'), { target: { value: 'Long' } })
  expect(view.read('mech/turn/target')).toBe('Long')
})

test('settings checkbox writes mech/settings', () => {
  const view = makeView()
  render(withDnd(<MechView view={view} editable={EditMode.Live}/>))
  fireEvent.click(screen.getByLabelText('Spend ammo on activation'))
  expect(view.read('mech').settings.autoAmmo).toBe(true)
})

test('wound box and Repair & rearm', () => {
  const view = makeView()
  render(withDnd(<MechView view={view} editable={EditMode.Live}/>))
  fireEvent.click(screen.getByLabelText('Left leg slot 1 wound'))
  expect(view.read('mech').sections.lleg.wounds[0]).toBe(true)
  fireEvent.click(screen.getAllByText('Repair & rearm')[0])
  fireEvent.click(screen.getAllByText('Repair & rearm').slice(-1)[0])
  expect(view.read('mech').sections.lleg.wounds[0]).toBe(false)
})

test('every play control is disabled when not editable', () => {
  const view = makeView()
  const { container } = render(withDnd(<MechView view={view} editable={EditMode.None}/>))
  // The closed repair dialog is always mounted but hidden.
  const controls = (Array.from(container.querySelectorAll('button, select, input')) as HTMLInputElement[]).filter(c => !c.closest('.modal'))
  expect(controls.length).toBeGreaterThan(10)
  expect(controls.filter(c => !c.disabled).map(c => c.outerHTML)).toEqual([])
})
