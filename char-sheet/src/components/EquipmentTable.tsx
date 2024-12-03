// External imports
import { useState } from 'react'

// Components
import PointEntryBox from './PointEntryBox'
import IconButton from './IconButton'
import EquipmentSelectModal from './EquipmentSelectModal'

// Internal imports
import { Equipment, Container, SheetEquipment } from '../lib/rules'
import caltrops from '../lib/caltrops'
import { EditMode } from '../lib/util'
import ObjectService from '../lib/objectservice'


function EquipmentTable({equipment, container, service, editable=EditMode.Live}: {
    equipment: Equipment[],
    container: Container,
    service: ObjectService,
    editable?: EditMode
  }): JSX.Element {
  
  const items: SheetEquipment[] = service.subscribe([])
  const freeCapacity = container.size ? (container.size - items.length) : 1
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  function addItem(equipment: Equipment) {
    let item: SheetEquipment = {
      name: equipment.name,
    }
    if (equipment.custom) {
      item.custom = true
    }
    if (equipment.stack) {
      item.count = 1
      item.stack = equipment.stack
    }
    service.append_index(item)
  }

  function lookupDescription(name: string): string {
    for (let item of equipment) {
      if (item.name === name) {
        return item.description ?? name;
      }
    }
    return name;
  }

  return (
    <div>
      <table className="table table-compact w-64">
        <thead>
          <tr>
            <th colSpan={4}>Items: {container.name}</th>
          </tr>
        </thead>
        <tbody>
        {
          items.map((item, i) => {
            return <tr className='hover tooltip tooltip-left w-full' data-tip={lookupDescription(item.name)} key={i}>
              <td className='w-full text-left'>
                {item.custom ? (
                  editingIndex === i ? (
                    <input
                      type='text'
                      className='input input-bordered w-full'
                      value={item.name}
                      onChange={(evt) => {
                        service.set_index(i, { ...item, name: evt.target.value });
                      }}
                      onBlur={() => setEditingIndex(null)}
                      disabled={!(editable >= EditMode.Live)}
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => setEditingIndex(i)} className='cursor-pointer'>
                      {item.name}
                    </span>
                  )
                ) : (item.name)}
              </td>
              <td>
                <PointEntryBox
                  value={item.count ?? 0}
                  setValue={ v => { service.set_index(i, {...item, count: v}) } }
                  max={item.stack ?? 1}
                  visible={(item.stack ?? 1) > 1}
                  editable={editable >= EditMode.Live}
                />
              </td>
              <td>
                <IconButton
                  icon='cross'
                  onClick={() => { service.remove_index(i) }}
                  btnStyle='btn-outline btn-error'
                  enabled={editable >= EditMode.Live}
                />
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
                enabled={editable >= EditMode.Live && freeCapacity > 0}
                onClick={() => {setModalOpen(true)}}
              />
              </div>
            </th>
          </tr>
        </tfoot>
      </table>

      <EquipmentSelectModal
        open={modalOpen}
        close={() => setModalOpen(false)}
        enabled={editable >= EditMode.Live && freeCapacity > 0}
        equipment={modalOpen ? caltrops.equipmentFilter(equipment, container.tags) : []}
        addEquipment={addItem}
      />
    </div>
  )
}

export default EquipmentTable