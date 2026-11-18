import { render, screen } from '@testing-library/react'
import SkillTable from './SkillTable'
import caltrops from '../lib/caltrops'
import { ObjectService } from '../lib/objectservice'
import { EditMode } from '../lib/util'

test('only listed skills count toward the cost (a removed skill like Piloting does not)', () => {
  const view = new ObjectService().view('')
  view.publish('skills', { Gunnery: 1, Piloting: 3 })
  render(<SkillTable title='Skills' skills={[{ name: 'Gunnery' }]} skillView={view.view('skills')} rollView={view.view('roll')} maxCostTotal={10} editable={EditMode.Full}/>)
  expect(screen.getByText(`${caltrops.skillCost(1)} / 10`)).toBeTruthy()
})
