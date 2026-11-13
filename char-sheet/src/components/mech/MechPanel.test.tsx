import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechPanel from './MechPanel'
import SheetView from '../SheetView'
import caltrops from '../../lib/caltrops'
import scrapLancerRuleset from '../../data/scraplancer'
import bludgeonRuleset from '../../data/bludgeon'

jest.mock('../../lib/alerts')
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }))
jest.mock('remark-gfm', () => ({ __esModule: true, default: () => {} }))
jest.mock('remark-breaks', () => ({ __esModule: true, default: () => {} }))

function setup(editable: EditMode, tweak?: (m: any) => void) {
  const rules: any = { name: 'x', mechs: FIXTURE_RULES, equipment: [] }
  const mech = newMech(rules, 'Mule', 'Rusty')
  tweak?.(mech)
  const view = new ObjectService().view('')
  view.publish('rules', rules)
  view.publish('mech', mech)
  const out = render(withDnd(<MechPanel view={view} editable={editable}/>))
  return { mech, container: out.container }
}

test('renders sections with hit labels and the status bar buttons', () => {
  setup(EditMode.Full)
  expect(screen.getByText('(hit: 1–2) · aim 3')).toBeTruthy()
  expect(screen.getByText('(hit: 12) · aim 4')).toBeTruthy()
  expect(screen.getByText('Rusty')).toBeTruthy()
  expect(screen.getByText(/^Sprint/)).toBeTruthy()
  expect(screen.getByText('Shut down & purge')).toBeTruthy()
  expect(screen.getByText(/New turn/)).toBeTruthy()
  expect(screen.getAllByText(/^Stowage/).length).toBeGreaterThan(0)
})

test('no Move, Target, Take a hit, Repair or log elements', () => {
  setup(EditMode.Full)
  for (const re of [/^Move/, /Target/, /Take a hit/, /Repair/, /^Log$/, /End turn/, /Start turn/, /Sitting Duck/]) {
    expect(screen.queryByText(re)).toBeNull()
  }
})

test('activation buttons are disabled when read only', () => {
  setup(EditMode.None)
  const btns = screen.getAllByText(/^1E \+1H 0\/2/) as HTMLButtonElement[]
  expect(btns.length).toBeGreaterThan(0)
  expect(btns.every(b => b.disabled)).toBe(true)
})

test('activation button enabled when live and allowed', () => {
  setup(EditMode.Live)
  const btns = screen.getAllByText(/^1E \+1H 0\/2/) as HTMLButtonElement[]
  expect(btns.some(b => !b.disabled)).toBe(true)
})

test('New turn is disabled when the mech is out of action', () => {
  setup(EditMode.Live, m => { m.turn.out = true })
  expect((screen.getByText(/New turn/) as HTMLButtonElement).disabled).toBe(true)
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
  render(withDnd(<MechPanel view={view} editable={EditMode.Full}/>))
  expect(screen.getByText(/ruleset \(Plain\) has no mech rules loaded/)).toBeTruthy()
})

test('every control is disabled at EditMode.None except Copy link', () => {
  const { container } = setup(EditMode.None)
  const controls = (Array.from(container.querySelectorAll('button, select, input')) as HTMLInputElement[]).filter(c => !c.closest('.modal'))
  expect(controls.length).toBeGreaterThan(10)
  expect(controls.filter(c => !c.disabled && c.textContent !== 'Copy mech link').map(c => c.outerHTML)).toEqual([])
})

describe('Pilot tab', () => {
  function sheet(rules: any, withMech: boolean) {
    const view = new ObjectService().view('')
    view.publish('rules', rules)
    view.publish('sheet', caltrops.newSheet(rules))
    view.publish('mechEditable', EditMode.Full)
    if (withMech) {
      const mech = newMech(rules, rules.mechs.chassis[0].name, 'Rusty')
      view.publish('sheet/mech', mech.id)
      view.publish('mech', mech)
    }
    return render(withDnd(<SheetView view={view} editable={EditMode.Live}/>))
  }

  test('Scrap Lancer shows the pilot sheet and the mech panel together', () => {
    sheet(scrapLancerRuleset, true)
    expect(screen.getByText('Pilot')).toBeTruthy()
    expect(screen.getByText('Rusty', { selector: 'span' })).toBeTruthy()
    expect(screen.getByText(/^Sprint/)).toBeTruthy()
    expect(screen.getByText('Shut down & purge')).toBeTruthy()
    expect(screen.getByText(/New turn/)).toBeTruthy()
    expect(screen.queryByText(/Take a hit/)).toBeNull()
    expect(screen.queryByText(/Repair & rearm/)).toBeNull()
  })

  test('without an assigned mech it shows the manage line', () => {
    sheet(scrapLancerRuleset, false)
    expect(screen.getByText(/No mech assigned — manage in the Mech tab/)).toBeTruthy()
    expect(screen.queryByText(/^Sprint/)).toBeNull()
  })

  test('Mech tab offers management without an assigned mech', () => {
    sheet(scrapLancerRuleset, false)
    fireEvent.click(screen.getByText('Mech'))
    expect(screen.getByText('New mech')).toBeTruthy()
    expect(screen.getByText('Load mech')).toBeTruthy()
    expect(screen.getByText(/^Assign/)).toBeTruthy()
  })

  test('Bludgeon has no mech panel and no tabs', () => {
    sheet(bludgeonRuleset, false)
    expect(screen.queryByText('Pilot')).toBeNull()
    expect(screen.queryByText(/^Sprint/)).toBeNull()
  })
})
