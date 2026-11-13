// Components
import Popover from './Popover'
import { DragSource } from '../dnd/DragSource'
import { DropTarget } from '../dnd/DropTarget'
import { typeColor } from './MechSection'
import { attachmentPop } from './mechText'

// Internal imports
import type { MechRules } from '../../lib/mech/types'
import type { PartDrag } from '../../lib/mech/loadout'

/*
 * Every attachment of the ruleset, grouped. Parts drag onto slots; dropping a mounted part here unmounts it.
 */
function AttachmentCatalogue({ rules, onRemove }: { rules: MechRules, onRemove(item: PartDrag): void }): JSX.Element {
  const groups: { [group: string]: typeof rules.attachments } = {}
  for (const a of rules.attachments) (groups[a.group] ??= []).push(a)

  return <DropTarget
    accept='mech-part'
    canDrop={(item: PartDrag) => !!item?.from}
    hoverClass='outline outline-2 outline-success'
    invalidClass=''
    onDrop={onRemove}
    wrappingElement={<div className='bg-base-200 border border-base-300 p-2' data-testid='mech-catalogue'></div>}
  >
    <h4 className='font-bold text-accent mb-1'>Attachments</h4>
    <div className='opacity-60 mb-1'>Drag onto a slot. Drag a mounted part back here to remove it.</div>
    {Object.entries(groups).map(([group, atts]) => <div key={group} className='mb-1.5'>
      <div className='opacity-60 uppercase text-[10px]'>{group}</div>
      {atts.map(a =>
        <DragSource
          key={a.name}
          type='mech-part'
          item={{ name: a.name }}
          wrappingElement={<div className='border-l-4 pl-1 py-0.5 border-t border-dashed border-base-300' style={{ borderLeftColor: typeColor(rules, a.type) }}></div>}
        >
          <Popover content={attachmentPop(rules, a)}>
            <span>{a.name}{(a.size ?? 1) > 1 ? ` (${a.size} slots)` : ''}</span>
          </Popover>
        </DragSource>
      )}
    </div>)}
  </DropTarget>
}

export default AttachmentCatalogue
