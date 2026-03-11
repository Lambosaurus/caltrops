// Components
import PointEntryBox from './PointEntryBox'
import TextEntryBox from './TextEntryBox'

// Internal imports
import { EditMode } from '../lib/util'
import { SheetInfo } from '../lib/rules'
import ObjectService from '../lib/objectservice'



function InfoTable({service, editable=EditMode.Live}: {
    service: ObjectService
    editable?:EditMode
  }): JSX.Element {

  const info: SheetInfo = service.subscribe()

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
              setValue={v => { service.set_key('name', v) }}
              editable={editable >= EditMode.Full}
              placeholder='enter name'
              />
            </td>
          </tr>
          <tr className='hover' >
            <td>Level</td>
            <td><PointEntryBox
              value={info.level}
              setValue={v => { service.set_key('level', v) }}
              editable={editable >= EditMode.Full}
            /></td>
          </tr>
          <tr className='hover'>
            <td>Background</td>
            <td className='py-0'><TextEntryBox
              value={info.background}
              setValue={v => { service.set_key('background', v) }}
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