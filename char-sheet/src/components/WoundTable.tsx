// External imports
import { useState } from 'react'

// Components
import IconButton from './IconButton'
import NewWoundModal from './NewWoundModal'
import ActionModal from './ActionModal'
import { ImHeartBroken, ImHeart } from 'react-icons/im'

// Internal imports
import caltrops from '../lib/caltrops'
import { SheetWound, Container } from '../lib/rules'
import { EditMode } from '../lib/util'
import ObjectService from '../lib/objectservice'


function WoundTable( {service, container, woundSizeLimit=2, useIndexedWounds=false, editable=EditMode.Live}: {
    service: ObjectService,
    container: Container,
    woundSizeLimit?: number,
    editable?: EditMode,
    useIndexedWounds: boolean,
  }): JSX.Element | null {

  const [newWoundOpen, setNewWoundOpen] = useState(false)
  const [selected, setSelected] = useState(-1)
  const wounds: SheetWound[] = service.subscribe([])

  function removeWound(index: number) {
    if (useIndexedWounds) {
      if (index === wounds.length - 1) {
        // This is the last wound. We may need to trim the list.
        let remaining_wounds = wounds.length - 1;
        while (remaining_wounds > 0 && !wounds[remaining_wounds-1].name) { remaining_wounds-- }
        service.publish(wounds.slice(0, remaining_wounds))
      } else {
        // Replace with an unnamed wound.
        service.set_index(index, {
          size: wounds[index].size,
          locked: false,
        })
      }
    } else {
      service.remove_index(index)
    }
  }

  function treatWound(success: boolean) {
    let index = selected
    let wound = caltrops.woundTreat(wounds[index], success)
    if (wound == null) {
      removeWound(index)
    }
    else{
      service.set_index(index, wound)
    }
  }

  const woundTotal = caltrops.woundTotal(wounds)

  return (
    <div>
      <table className="table table-compact w-64">
        <thead>
          <tr>
            <th colSpan={4}>Wounds: {container.name}</th>
          </tr>
        </thead>
        <tbody>
        {
          wounds.map((wound,n) => { 
            return <tr className='hover' key={n}>
              <td className='p-0'>
                <div>
                  {
                    Array(wound.size).fill(0).map( (i, n) =>
                      (n === (wound.size - 1) && !wound.locked)
                      ? <ImHeart size={40} color='hsl(var(--er))' className='p-3' key={n}/>
                      : <ImHeartBroken size={40} color='hsl(var(--er))' className='p-3' key={n}/>
                    )
                  }
                </div>
              </td>
              <td className='w-full'>
                <div>
                  {wound.name}
                </div>
              </td>
              <td>
                {
                  editable >= EditMode.Full ? 
                <IconButton
                  icon='cross'
                  onClick={() => removeWound(n)}
                  btnStyle='btn-outline btn-error'
                /> :
                <IconButton
                  icon='heart'
                  onClick={() => setSelected(n)}
                  enabled={!wound.locked && editable >= EditMode.Live}
                />
                }
              </td>
            </tr>
          })
        }
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>
              <div className='flex justify-center'>
              <IconButton
                icon='plus'
                onClick={() => setNewWoundOpen(true)}
                enabled={editable >= EditMode.Live}
              />
              </div>
            </th>
          </tr>
        </tfoot>
      </table>

      <NewWoundModal
        open={newWoundOpen}
        close={() => setNewWoundOpen(false)}
        addWound={wound => service.append_index(wound)}
        maxSize={woundSizeLimit}
      />

      <ActionModal
        open={selected > -1}
        close={() => setSelected(-1)}
        title="Treat wound"
        actions={[
          {
            name: "Treat",
            callback: () => treatWound(true),
            type: "success"
          }, {
            name: "Botch",
            callback: () => treatWound(false),
            type: "error"
          }
        ]}
      />
    </div>
  )
}

export default WoundTable