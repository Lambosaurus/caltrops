// External imports
import { useState } from 'react'

// Components
import PointEntryBox from './PointEntryBox'
import IconButton from './IconButton'
import EquipmentSelectModal from './EquipmentSelectModal'

// Internal imports
import { Equipment, Container, SheetEquipment, Sheet } from '../lib/rules'
import caltrops from '../lib/caltrops'
import { EditMode, modifyObject, Modifier, keyModifier } from '../lib/util'

/* 
 * Equipment table.
 *    in: equipment <- rules.equipment
 *    in: container <- rules.containers[n]
 *    in: items <- sheet.equipment[container.name]
 *    out: setItems -> sheet.equipment[container.name]
 */
function EquipmentTable({equipment, container, items, setItems, editable=EditMode.Live}: {
    equipment: Equipment[],
    container: Container,
    items: SheetEquipment[],
    setItems(cb: Modifier<SheetEquipment[]>): void,
    editable?: EditMode
  }): JSX.Element {

  const freeCapacity = container.size ? (container.size - items.length) : 1
  const [modalOpen, setModalOpen] = useState(false)

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
    setItems(items => [...items, item])
  }

  function editItem(index: number, item: SheetEquipment) {
    setItems(items => {
      let new_items = [...items]
      new_items[index] = item
      return new_items
    })
  }

  function removeItem(index: number) {
    setItems(items => {
      let new_items = [...items]
      new_items.splice(index, 1)
      return new_items
    })
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
            return <tr className='hover' key={i}>
              <td className='w-full'>
                { item.name }
              </td>
              <td>
                <PointEntryBox
                  value={item.count ?? 0}
                  setValue={ v => { editItem(i, modifyObject(item, 'count', v)) } }
                  max={item.stack ?? 1}
                  visible={(item.stack ?? 1) > 1}
                  editable={editable >= EditMode.Live}
                />
              </td>
              <td>
                <IconButton
                  icon='cross'
                  onClick={() => { removeItem(i) }}
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