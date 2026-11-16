// External imports
import { useState } from 'react'

// Components
import Popover from './Popover'
import { DragSource } from '../dnd/DragSource'
import { DropTarget } from '../dnd/DropTarget'
import { typeColor } from './MechSection'
import { attachmentPop } from './mechText'

// Internal imports
import type { MechAttachment, MechRules } from '../../lib/mech/types'
import type { PartDrag } from '../../lib/mech/loadout'

const TIERS = ['Scrap', 'Salvage', 'Standard', 'Military', 'Elite']

/** Matches a part against the search text: name, make, kind, family, type or tags, case-insensitive. */
export function partMatches(a: MechAttachment, text: string): boolean {
  const q = text.trim().toLowerCase()
  if (!q) return true
  return [a.name, a.kind, a.family, a.group, a.type, a.tags].some(f => f?.toLowerCase().includes(q))
}

/*
 * Every attachment of the ruleset, grouped and filterable by text, tier and group. Parts drag onto slots;
 * dropping a mounted part here unmounts it.
 */
function AttachmentCatalogue({ rules, onRemove }: { rules: MechRules, onRemove(item: PartDrag): void }): JSX.Element {
  const [text, setText] = useState('')
  const [tier, setTier] = useState('')
  const [group, setGroup] = useState('')

  const allGroups = Array.from(new Set(rules.attachments.map(a => a.group)))
  const shown = rules.attachments.filter(a =>
    partMatches(a, text) && (!tier || a.tier === tier || !a.tier) && (!group || a.group === group))
  const groups: { [group: string]: MechAttachment[] } = {}
  for (const a of shown) (groups[a.group] ??= []).push(a)
  const tiers = TIERS.filter(t => rules.attachments.some(a => a.tier === t))

  return <DropTarget
    accept='mech-part'
    canDrop={(item: PartDrag) => !!item?.from}
    hoverClass='outline outline-2 outline-success'
    invalidClass=''
    onDrop={onRemove}
    wrappingElement={<div className='bg-base-200 border border-base-300 p-2' data-testid='mech-catalogue'></div>}
  >
    <h4 className='font-bold text-accent mb-1'>Attachments ({shown.length})</h4>
    <div className='opacity-60 mb-1'>Drag onto a slot. Drag a mounted part back here to remove it.</div>
    <div className='flex flex-col gap-1 mb-2'>
      <input
        className='input input-bordered input-xs w-full'
        placeholder='Search: name, make, kind, tag…'
        aria-label='Search attachments'
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <div className='flex gap-1'>
        {tiers.length ? <select className='select select-bordered select-xs flex-1' aria-label='Tier' value={tier} onChange={e => setTier(e.target.value)}>
          <option value=''>Any tier</option>
          {tiers.map(t => <option key={t}>{t}</option>)}
        </select> : null}
        <select className='select select-bordered select-xs flex-1' aria-label='Group' value={group} onChange={e => setGroup(e.target.value)}>
          <option value=''>Any group</option>
          {allGroups.map(g => <option key={g}>{g}</option>)}
        </select>
      </div>
    </div>
    <div className='max-h-[70vh] overflow-y-auto'>
      {Object.entries(groups).map(([g, atts]) => <div key={g} className='mb-1.5'>
        <div className='opacity-60 uppercase text-[10px]'>{g}</div>
        {atts.map(a =>
          <DragSource
            key={a.name}
            type='mech-part'
            item={{ name: a.name }}
            wrappingElement={<div className='border-l-4 pl-1 py-0.5 border-t border-dashed border-base-300' style={{ borderLeftColor: typeColor(rules, a.type) }}></div>}
          >
            <Popover content={attachmentPop(rules, a)}>
              <span className='flex justify-between gap-1'>
                <span>{a.name}{(a.size ?? 1) > 1 ? ` (${a.size})` : ''}</span>
                {a.tier ? <span className='opacity-50 whitespace-nowrap'>{a.tier}</span> : null}
              </span>
            </Popover>
          </DragSource>
        )}
      </div>)}
      {shown.length ? null : <div className='opacity-60'>No parts match.</div>}
    </div>
  </DropTarget>
}

export default AttachmentCatalogue
