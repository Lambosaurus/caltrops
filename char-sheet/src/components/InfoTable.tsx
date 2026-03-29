// Components
import PointEntryBox from './PointEntryBox'
import TextEntryBox from './TextEntryBox'

// Internal imports
import { EditMode } from '../lib/util'
import { SheetInfo } from '../lib/rules'
import { View, useListener } from '../lib/objectservice'



function InfoTable({view, editable=EditMode.Live}: {
    view: View
    editable?:EditMode
  }): JSX.Element {

  const info: SheetInfo = useListener(view)

  return (
    <div>
      <table className="table table-compact w-80">
        <thead>
        <tr>
            <th>Info</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
          <tr className='hover' >
            <td>Name</td>
            <td className='py-0'><TextEntryBox
              value={info.name}
              setValue={v => view.publish('name', v) }
              editable={editable >= EditMode.Full}
              placeholder='enter name'
              />
            </td>
          </tr>
          <tr className='hover' >
            <td>Level</td>
            <td><PointEntryBox
              value={info.level}
              setValue={v => view.publish('level', v)}
              editable={editable >= EditMode.Full}
            /></td>
          </tr>
          <tr className='hover'>
            <td>Background</td>
            <td className='py-0'><TextEntryBox
              value={info.background}
              setValue={v => view.publish('background', v)}
              editable={editable >= EditMode.Full}
              placeholder='enter background'
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default InfoTable