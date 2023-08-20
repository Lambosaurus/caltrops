// Components
import PointEntryBox from './PointEntryBox'
import TextEntryBox from './TextEntryBox'

// Internal imports
import { EditMode, Modifier, keyModifier } from '../lib/util'
import { SheetInfo } from '../lib/rules'

/* 
 * Info table.
 *    in: info <- sheet.info
 *    out: setInfo -> sheet.info
 */
function InfoTable({info, setInfo, editable=EditMode.Live}: {
    info: SheetInfo,
    setInfo(info: Modifier<SheetInfo>): void,
    editable?:EditMode
  }): JSX.Element {

  return (
    <div>
      <table className="table table-compact">
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
              setValue={v => {setInfo(keyModifier('name', name => v))}}
              editable={editable >= EditMode.Full}
              placeholder='enter name'
              />
            </td>
          </tr>
          <tr className='hover' >
            <td>Level</td>
            <td><PointEntryBox
              value={info.level}
              setValue={v => { setInfo(keyModifier('level', level => v)) }}
              editable={editable >= EditMode.Full}
            /></td>
          </tr>
          <tr className='hover'>
            <td>Background</td>
            <td className='py-0'><TextEntryBox
              value={info.background}
              setValue={v => { setInfo(keyModifier('background', background => v)) }}
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