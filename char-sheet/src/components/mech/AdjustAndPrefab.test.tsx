import { fireEvent, render, screen } from '@testing-library/react'
import { ObjectService } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import scrapLancerRuleset from '../../data/scraplancer'
import { newMech } from '../../lib/mech/loadout'
import { withDnd } from '../dnd/testWrap'
import MechPanel from './MechPanel'
import NewMechModal from './NewMechModal'

jest.mock('../../lib/alerts')

function panel() {
  const view = new ObjectService().view('')
  view.publish('rules', scrapLancerRuleset)
  view.publish('mech', newMech(scrapLancerRuleset, 'OHS Mule Mk II', 'Rusty', 'Workhorse'))
  render(withDnd(<MechPanel view={view} editable={EditMode.Live}/>))
  return view
}

test('heat and energy step inline and can be typed in Adjust', () => {
  const view = panel()
  fireEvent.click(screen.getByLabelText('heat plus'))
  fireEvent.click(screen.getByLabelText('heat plus'))
  expect(view.read('mech').turn.heat).toBe(2)
  fireEvent.click(screen.getByLabelText('energy minus'))
  expect(view.read('mech').turn.energy).toBe(4)
  fireEvent.click(screen.getByText('Adjust…'))
  fireEvent.change(screen.getByLabelText('Heat'), { target: { value: '11' } })
  expect(view.read('mech').turn.heat).toBe(11)
  expect(screen.getByText('OVERHEATED')).toBeTruthy()
  fireEvent.click(screen.getByText('Refit at haven (repair, re-arm, reset)'))
  expect(view.read('mech').turn).toMatchObject({ heat: 0, energy: 5 })
})

test('the play panel does not show chassis price, tier, or class', () => {
  panel()
  expect(screen.queryByText(/Workhorse: field repairs/)).toBeNull()
  expect(screen.queryByText(/Solari/)).toBeNull()
})

test('New mech can start from a prefab', () => {
  let made: any = null
  render(<NewMechModal open={true} close={() => {}} rules={scrapLancerRuleset} setMech={m => { made = m }}/>)
  fireEvent.change(screen.getByPlaceholderText('Mech name here'), { target: { value: 'Big Bertha' } })
  const [chassis, loadout] = screen.getAllByRole('combobox')
  fireEvent.change(chassis, { target: { value: 'VDG Bastion VX-12' } })
  fireEvent.change(loadout, { target: { value: 'Fortress' } })
  fireEvent.click(screen.getByText('Create'))
  expect(made.chassis).toBe('VDG Bastion VX-12')
  expect(made.sections.gun.mounts.map((m: any) => m.name)).toEqual(['ARH Thunderer 120', 'BRO AC-20'])
})
