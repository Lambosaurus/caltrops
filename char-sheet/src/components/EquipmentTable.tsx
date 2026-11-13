// External imports
import { useRef, useState } from 'react'

// Components
import PointEntryBox from './PointEntryBox'
import IconButton from './IconButton'
import EquipmentSelectModal from './EquipmentSelectModal'

// Internal imports
import { Equipment, Container, SheetEquipment, Dictionary } from '../lib/rules'
import caltrops from '../lib/caltrops'
import { EditMode, listUtil } from '../lib/util'
import { View, useListener } from '../lib/objectservice'
import TextEntryBox from './TextEntryBox'
import { DropTarget } from './dnd/DropTarget'
import { DragSource } from './dnd/DragSource'
import { applyEquipmentDrop, EquipmentDrag } from '../lib/equipmentDrop'

function EquipmentTable({equipment, container, view, editable=EditMode.Live, title}: {
    equipment: Equipment[],
    container: Container,
    view: View,
    editable?: EditMode,
    title?: string, // header text; defaults to "Items: <container name>"
  }): JSX.Element {

  const items: SheetEquipment[] = useListener(view) ?? []
  const freeCapacity = container.size !== undefined ? (container.size - items.length) : 1
  const empty = items.length === 0
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
    view.publish('', listUtil.add(items, item))
  }

  function lookupDescription(name: string): string {
    for (let item of equipment) {
      if (item.name === name) {
        return item.description ?? name;
      }
    }
    return name;
  }

  function dropHandlerFactory(dropIdx = 0) {
    return (item: EquipmentDrag) => {
      applyEquipmentDrop(view, item, dropIdx, container.size)
    }
  }

  // Items past the container's size (e.g. a destroyed rack) are shown struck through. Inert unless over capacity.
  const overCapacity = (i: number) => container.size !== undefined && items.length > container.size && i >= container.size

  const previewRef = useRef(null)

  return (
    <DropTarget
      accept='equipment'
      enabled={ editable >= EditMode.Live && freeCapacity > 0 && empty } // Only use if empty
      onDrop={dropHandlerFactory()}
    >
      <table className="table table-compact w-80">
        <thead>
          <tr>
            <th colSpan={4}>{title ?? <>Items: {container.name}</>}</th>
          </tr>
        </thead>
        <tbody>
        {
          items.map((item, i) => {
            return <DropTarget
                key={i}
                accept='equipment'
                hoverClass='drop-hover'
                enabled={ editable >= EditMode.Live && freeCapacity > 0 }
                wrappingElement={<tr className={`hover tooltip tooltip-left w-full border-t-2 border-transparent ${overCapacity(i) ? 'line-through text-error' : ''}`} data-tip={lookupDescription(item.name)}></tr>}
                onDrop={dropHandlerFactory(i)}
              >
              {
                editable >= EditMode.Full && item.custom ?
                <td className='w-full text-left py-0 px-0'>
                  <TextEntryBox
                    value={item.name}
                    setValue={ v => view.publish('', listUtil.set(items, i, {...item, name: v} )) }
                    placeholder='item name'
                  />
                </td> :
                <td className='w-full text-left'>
                  <DragSource
                      type='equipment'
                      item={ {container: container.name, index: i, path: view.path} }
                      enabled={editable >= EditMode.Live}
                    >
                      { item.name }
                    </DragSource>
                </td>
              }
              <td>
                <PointEntryBox
                  value={item.count ?? 0}
                  setValue={ v => view.publish('', listUtil.set(items, i, {...item, count: v})) }
                  max={item.stack ?? 1}
                  visible={item.stack !== undefined}
                  editable={editable >= EditMode.Live}
                />
              </td>
              <td>
                <IconButton
                  icon='cross'
                  onClick={() => { view.publish('', listUtil.delete(items, i)) }}
                  btnStyle='btn-outline btn-error'
                  enabled={editable >= EditMode.Live}
                />
              </td>
            </DropTarget>
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
    </DropTarget>
  )
}

export default EquipmentTable
