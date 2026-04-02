// External imports
import { useState } from 'react'

// Components
import IconButton from './IconButton'
import NewWoundModal from './NewWoundModal'
import ActionModal from './ActionModal'
import { ImHeartBroken, ImHeart } from 'react-icons/im'
import { PiSkullFill, PiWarningFill } from 'react-icons/pi'

// Internal imports
import caltrops from '../lib/caltrops'
import { SheetWound, Container } from '../lib/rules'
import { EditMode, listUtil } from '../lib/util'
import { View, useListener } from '../lib/objectservice'


function WoundTable( {view, container, woundSizeLimit=2, editable=EditMode.Live}: {
    view: View,
    container: Container,
    woundSizeLimit?: number,
    editable?: EditMode,
  }): JSX.Element | null {

  const [newWoundOpen, setNewWoundOpen] = useState(false)
  const [selected, setSelected] = useState(-1)
  const wounds: SheetWound[] = useListener(view) ?? []

  function treatWound(success: boolean) {
    let index = selected
    let wound = caltrops.woundTreat(wounds[index], success)
    view.publish('',
      wound ? listUtil.set(wounds, index, wound) : listUtil.delete(wounds, index)
    )
  }

  const status = caltrops.woundStatus(wounds, container)

  return (
    <div className='relative'>
      {
        (status.isUnconcious) ? 
          <div className='absolute w-full h-full z-20 grid place-items-center pointer-events-none'>
            { status.isDead
              ? <PiSkullFill size={150} color='hsl(var(--er))' className='opacity-50'></PiSkullFill>
              : <PiWarningFill size={150} color='hsl(var(--wa))' className='opacity-15'></PiWarningFill>
            }
          </div>
        : null
      }

      <table className="table table-compact w-80">
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
                  onClick={() => view.publish('', listUtil.delete(wounds, n))}
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
                enabled={editable >= EditMode.Live && !status.isDead}
              />
              </div>
            </th>
          </tr>
        </tfoot>
      </table>

      <NewWoundModal
        open={newWoundOpen}
        close={() => setNewWoundOpen(false)}
        addWound={wound => view.publish('', listUtil.add(wounds, wound))}
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