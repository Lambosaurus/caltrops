import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { alertInfo, alertWarning } from '../../lib/alerts'
import { withDnd } from '../dnd/testWrap'
import MechPanel from './MechPanel'
import HitModal from './HitModal'
import { showNotices } from './notify'

jest.mock('../../lib/alerts')

function makeView(tweak?: (m: any) => void) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES, equipment: [] }
  const mech = newMech(rules, 'Mule', 'Rusty')
  tweak?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mech', mech)
  return view
}

beforeEach(() => jest.clearAllMocks())

test('showNotices: applied is info, anything else a warning', () => {
  showNotices(['Overheated: rolled 2d4 self-damage on Legs → 1 wound applied.', 'Overheated: roll 2d4 by hand.'])
  expect(alertInfo).toHaveBeenCalledTimes(1)
  expect(alertWarning).toHaveBeenCalledTimes(1)
})

test('HitModal manual path marks wounds on the left leg without a toast', () => {
  const view = makeView()
  expect(view.read('mech').sections.lleg.armour.points).toBe(2)
  render(<HitModal view={view} sectionId='lleg' close={() => {}}/>)
  fireEvent.change(screen.getByLabelText('Wounds'), { target: { value: '3' } })
  fireEvent.click(screen.getByText('Apply'))
  const after = view.read('mech').sections.lleg
  expect(after.armour.points).toBe(0)
  expect(after.wounds.slice(0, 3)).toEqual([true, false, false])
  expect(alertInfo).not.toHaveBeenCalled()
  expect(alertWarning).not.toHaveBeenCalled()
  expect(view.read('mechLog')).toBeUndefined()
})

test('HitModal with autoHitDamage on destroys the leg and overflows', () => {
  const view = makeView(m => { m.settings.autoHitDamage = true })
  render(<HitModal view={view} sectionId='lleg' close={() => {}}/>)
  fireEvent.change(screen.getByLabelText('Wounds'), { target: { value: '9' } })
  fireEvent.keyDown(screen.getByLabelText('Wounds'), { key: 'Enter' })
  expect(view.read('mech').sections.lleg.wounds.every(Boolean)).toBe(true)
})

test('Sprint pays energy and heat; New turn clears used marks', () => {
  const view = makeView()
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  fireEvent.click(screen.getByText('Sprint (2E +2H)'))
  expect(view.read('mech').turn.used.sprint).toBe(1)
  expect((screen.getByText('Sprint (2E +2H)') as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByText(/New turn/))
  expect(view.read('mech').turn.used).toEqual({})
})

test('Shut down & purge disables itself and Sprint until New turn', () => {
  const view = makeView()
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  fireEvent.click(screen.getByText('Shut down & purge'))
  expect(view.read('mech').turn.shutdown).toBe(true)
  expect((screen.getByText('Shut down & purge') as HTMLButtonElement).disabled).toBe(true)
  expect((screen.getByText('Sprint (2E +2H)') as HTMLButtonElement).disabled).toBe(true)
  expect((screen.getByText(/New turn/) as HTMLButtonElement).disabled).toBe(false)
  fireEvent.click(screen.getByText(/New turn/))
  expect(view.read('mech').turn.shutdown).toBeFalsy()
})

test('Sprint when overheated toasts the self-damage', () => {
  const view = makeView(m => { m.turn.heat = 10 })
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  fireEvent.click(screen.getByText('Sprint (2E +2H)'))
  expect(alertWarning).toHaveBeenCalledTimes(1)
})

test('wound box toggles a wound', () => {
  const view = makeView()
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  fireEvent.click(screen.getByLabelText('Left leg slot 1 wound'))
  expect(view.read('mech').sections.lleg.wounds[0]).toBe(true)
})
