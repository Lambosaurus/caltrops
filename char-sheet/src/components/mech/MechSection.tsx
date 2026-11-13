// Components
import Popover from './Popover'
import { DragSource } from '../dnd/DragSource'
import { DropTarget } from '../dnd/DropTarget'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { canDropArmour, canDropPart, findAttachment, mountCovering, mountKey, type PartDrag } from '../../lib/mech/loadout'
import { mountDisabled, sectionDestroyed } from '../../lib/mech/derive'
import { activationBlocker } from '../../lib/mech/turn'
import type { ChassisSection, Mech, MechRules, MechSlotType } from '../../lib/mech/types'
import {
  aimText, armourPop, costText, emptySlotPop, mountPop, passiveText, binCapacity, sectionPop, slotTag, slotTypePop,
  unknownPartPop, woundPop,
} from './mechText'

const FALLBACK_COLOR = '#46536e'

export const slotTypeOf = (rules: MechRules, name: string): MechSlotType | undefined =>
  rules.slotTypes.find(s => s.name === name)

export const typeColor = (rules: MechRules, name: string): string => slotTypeOf(rules, name)?.color ?? FALLBACK_COLOR

/** Coloured chip naming a slot type. Colour comes from the ruleset. */
export function TypeTag({ rules, type, label }: { rules: MechRules, type: string, label?: string }): JSX.Element {
  const color = typeColor(rules, type)
  return <Popover content={slotTypePop(rules, type)}>
    <span
      className={`text-[10px] px-1 border font-bold text-center flex-none min-w-[2.2rem] ${type ? '' : 'border-dashed'}`}
      style={{ color, borderColor: color, backgroundColor: type ? `${color}29` : 'transparent' }}
    >
      {label ?? (slotTag(type) || ' ')}
    </span>
  </Popover>
}

function MechSection({ rules, section, view, editable, loadout = false, onHit, onActivate, onWound, onArmour, onAmmo, onDropPart, onUnmount, onDropArmour, onClearArmour }: {
    rules: MechRules,
    section: ChassisSection,
    view: View, // the mech
    editable: EditMode,
    loadout?: boolean, // loadout editing: slots accept dragged parts
    onHit(sectionId: string): void,
    onActivate(key: string): void,
    onWound?(sectionId: string, index: number): void,
    onArmour?(sectionId: string, points: number): void,
    onAmmo?(key: string, delta: number): void,
    onDropPart?(item: PartDrag, sectionId: string, start: number): void,
    onUnmount?(sectionId: string, start: number): void,
    onDropArmour?(sectionId: string, name: string): void,
    onClearArmour?(sectionId: string): void,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view)
  const state = mech?.sections[section.id]
  if (!mech || !state) {
    return null
  }

  const play = editable >= EditMode.Live
  const dead = sectionDestroyed(mech, section.id)
  const prov = [
    section.provides?.speed ? `Speed ${section.provides.speed}` : '',
    section.provides?.evasion ? `Evasion ${section.provides.evasion}` : '',
  ].filter(Boolean)
  const transferName = section.transfer && section.transfer !== 'pilot'
    ? rules.chassis.find(c => c.name === mech.chassis)?.sections.find(s => s.id === section.transfer)?.name ?? section.transfer
    : section.transfer
  prov.push(section.transfer ? `overflow → ${transferName}` : 'lost: mech out')

  const armourAtt = state.armour ? findAttachment(rules, state.armour.name) : undefined
  const armourMax = armourAtt?.armour ?? state.armour?.points ?? 0
  const armourColor = typeColor(rules, 'Armour')

  function slotRow(i: number): JSX.Element {
    const type = section.slots[i]
    const color = typeColor(rules, type)
    const mount = mountCovering(rules, mech!, section.id, i)
    const wounded = !!state!.wounds[i]
    let body: JSX.Element
    let right: JSX.Element | null = null

    if (type === 'Hull') {
      body = <Popover content={slotTypePop(rules, 'Hull')}>
        <span className='flex-1 min-w-0 truncate opacity-40 italic' style={{ background: 'repeating-linear-gradient(135deg, transparent 0 4px, rgba(32,214,250,.07) 4px 8px)' }}>hull</span>
      </Popover>
    } else if (!mount) {
      body = <Popover content={emptySlotPop(rules, type, false)}>
        <span className='flex-1 min-w-0 truncate opacity-30 italic'>empty</span>
      </Popover>
    } else {
      const att = findAttachment(rules, mount.name)
      const key = mountKey(section.id, mount.start)
      if (!att) {
        body = <Popover content={unknownPartPop(mount.name)}>
          <span className='flex-1 min-w-0 truncate text-error italic'>Unknown part: {mount.name}</span>
        </Popover>
      } else if (mount.start !== i) {
        body = <Popover content={mountPop(rules, mech!, section.id, mount, key, play)}>
          <span className='flex-1 min-w-0 truncate opacity-60 border-l-4 border-primary pl-1'>↳ {att.name}</span>
        </Popover>
      } else {
        const disabled = mountDisabled(rules, mech!, section.id, mount)
        const pop = mountPop(rules, mech!, section.id, mount, key, play)
        const name = <Popover content={pop}>
          <span className={`flex-1 min-w-0 truncate ${(att.size ?? 1) > 1 ? 'border-l-4 border-primary pl-1' : ''} ${disabled ? 'text-error line-through' : ''}`}>
            {att.name}
          </span>
        </Popover>
        body = loadout
          ? <DragSource
              type='mech-part'
              item={{ name: att.name, from: { section: section.id, start: mount.start } }}
              wrappingElement={<span className='flex-1 min-w-0 flex'></span>}
            >{name}</DragSource>
          : name
        if (att.energy !== undefined) {
          const used = mech!.turn.used[key] ?? 0
          const rep = att.repeat ?? 1
          const blocked = activationBlocker(rules, mech!, key) !== null
          const label = rep > 1 ? `${costText(att)} ${used}/${rep}` : used ? 'used' : costText(att)
          right = <Popover content={pop}>
            <button
              className={`btn btn-xs btn-outline px-1 normal-case ${used >= rep ? 'btn-ghost' : 'btn-primary'}`}
              disabled={!play || blocked}
              onClick={() => onActivate(key)}
            >
              {label}{att.charges ? ` (${mount.charges ?? 0})` : ''}
            </button>
          </Popover>
        } else {
          const passive = att.bin ? `${mount.ammo ?? 0}/${binCapacity(rules, att)}` : passiveText(att)
          const text = passive ? <Popover content={pop}><span className='text-[10px] opacity-60 whitespace-nowrap'>{passive}</span></Popover> : null
          right = att.bin && onAmmo ? <>
            <button className='btn btn-xs btn-ghost px-1' disabled={!play} aria-label={`${att.name} ammo minus`} onClick={() => onAmmo(key, -1)}>−</button>
            {text}
            <button className='btn btn-xs btn-ghost px-1' disabled={!play} aria-label={`${att.name} ammo plus`} onClick={() => onAmmo(key, 1)}>+</button>
          </> : text
        }
      }
    }

    const rowClass = 'flex items-center gap-1 border-t border-dashed border-base-300 py-0.5 pl-1 min-h-[1.5rem]'
    const rowStyle = { borderLeft: `2px solid ${color}` }
    const content = <>
      <TypeTag rules={rules} type={type}/>
      {body}
      {right}
      {loadout && mount && mount.start === i ? <button
        className='btn btn-xs btn-ghost btn-error px-1'
        aria-label={`Remove ${mount.name}`}
        onClick={() => onUnmount?.(section.id, mount.start)}
      >�</button> : null}
      {loadout ? null : <Popover content={woundPop(section, i, wounded)}>
        <button
          className={`w-3 h-3 border flex-none ${wounded ? 'bg-error border-error' : 'border-current'}`}
          disabled={!play || !onWound}
          aria-label={`${section.name} slot ${i + 1} wound`}
          onClick={() => onWound?.(section.id, i)}
        />
      </Popover>}
    </>

    if (!loadout) {
      return <div key={i} className={rowClass} style={rowStyle}>{content}</div>
    }
    return <DropTarget
      key={i}
      accept='mech-part'
      canDrop={(item: PartDrag) => canDropPart(rules, mech!, item, section.id, i)}
      hoverClass='bg-success/30'
      invalidClass='bg-error/30'
      onDrop={(item: PartDrag) => onDropPart?.(item, section.id, i)}
      wrappingElement={<div className={rowClass} style={rowStyle}></div>}
    >{content}</DropTarget>
  }

  return <div
    className={`p-1.5 border ${dead ? 'border-error bg-error/20' : section.id === 'core' ? 'border-primary bg-base-200/90' : 'border-base-300 bg-base-200/90'}`}
    style={{ gridArea: section.area }}
  >
    <h5 className='flex justify-between items-center gap-1 text-xs'>
      <Popover content={sectionPop(rules, mech, section)}>
        <span className='font-bold text-accent'>{section.name}{dead ? ' ✖' : ''}</span>
      </Popover>
      <Popover content={sectionPop(rules, mech, section)}>
        <span className='opacity-60'>{aimText(section)}</span>
      </Popover>
      <button className='btn btn-xs btn-outline btn-error px-1' disabled={!play} onClick={() => onHit(section.id)}>Hit</button>
    </h5>
    <div className='text-[10px] opacity-60 mb-0.5'>{prov.join(' · ')}</div>

    <DropTarget
      accept='mech-part'
      enabled={loadout}
      canDrop={(item: PartDrag) => canDropArmour(rules, item)}
      hoverClass='bg-success/30'
      invalidClass='bg-error/30'
      onDrop={(item: PartDrag) => onDropArmour?.(section.id, item.name)}
      wrappingElement={<div className='flex items-center gap-1 border-t border-dashed border-base-300 py-0.5 pl-1' style={{ borderLeft: `2px solid ${armourColor}` }}></div>}
    >
      <TypeTag rules={rules} type='Armour' label='ARMR'/>
      {state.armour ? <>
        <Popover content={armourPop(rules, state.armour.name, state.armour.points)}>
          <span className='flex-1 min-w-0 truncate text-primary'>{state.armour.name}</span>
        </Popover>
        {loadout ? <button
          className='btn btn-xs btn-ghost btn-error px-1'
          aria-label={`Remove ${state.armour.name}`}
          onClick={() => onClearArmour?.(section.id)}
        >�</button> : null}
        {Array.from({ length: armourMax }, (_, k) =>
          <Popover key={k} content={armourPop(rules, state.armour!.name, state.armour!.points)}>
            <button
              className={`w-2.5 h-2.5 border border-primary flex-none ${k < state.armour!.points ? 'bg-primary' : ''}`}
              disabled={!play || !onArmour}
              aria-label={`Armour point ${k + 1}`}
              onClick={() => onArmour?.(section.id, k + 1)}
            />
          </Popover>
        )}
      </> : <Popover content={slotTypePop(rules, 'Armour')}>
        <span className='flex-1 opacity-30 italic'>no armour</span>
      </Popover>}
    </DropTarget>

    {section.slots.map((_, i) => slotRow(i))}
  </div>
}

export default MechSection
