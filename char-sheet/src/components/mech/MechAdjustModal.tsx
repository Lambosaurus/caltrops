// Components
import ActionModal from '../ActionModal'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { findAttachment, findChassis, mountKey, refitMech } from '../../lib/mech/loadout'
import { adjustTurn, newScene, setCharges } from '../../lib/mech/turn'
import { adjustAmmo } from '../../lib/mech/damage'
import { binCapacity } from './mechText'
import type { Mech } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'

/*
 * GM adjustments for a mech in play: set energy, heat, stored energy and pilot wounds directly (heat damage,
 * a dunk in a lake, a power surge), toggle shutdown / out of action, set each part's charges and ammo,
 * start a new scene (Recharging parts refill), or refit at a haven (every wound, armour point, round and charge restored).
 */
function MechAdjustModal({ rules, view, open, close }: {
    rules: Rules,
    view: View, // root
    open: boolean,
    close(): void,
  }): JSX.Element | null {
  const mech: Mech | undefined = useListener(view, 'mech')
  const mr = rules.mechs
  if (!open || !mech || !mr) {
    return null
  }
  const t = mech.turn
  const publish = (next: Mech) => view.publish('mech', next)
  const chassis = findChassis(mr, mech.chassis)

  // − / typed value / + : big swings (dump 6 heat in a lake) are typed, small ones clicked.
  const row = (label: string, value: number, set: (v: number) => void, max = 999) =>
    <div className='flex justify-between items-center gap-2' key={label}>
      <span>{label}</span>
      <span className='flex items-center gap-1'>
        <button className='btn btn-xs btn-outline px-2' aria-label={`${label} minus`} disabled={value <= 0} onClick={() => set(value - 1)}>−</button>
        <input
          type='number'
          className='input input-bordered input-xs w-16 text-center'
          aria-label={label}
          value={value}
          min={0}
          max={max}
          onChange={e => set(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
        />
        <button className='btn btn-xs btn-outline px-2' aria-label={`${label} plus`} disabled={value >= max} onClick={() => set(value + 1)}>+</button>
      </span>
    </div>

  const stock: JSX.Element[] = []
  for (const sec of chassis?.sections ?? []) {
    for (const m of mech.sections[sec.id]?.mounts ?? []) {
      const att = findAttachment(mr, m.name)
      const key = mountKey(sec.id, m.start)
      if (att?.charges) {
        stock.push(row(`${att.name} charges (${sec.name})`, m.charges ?? 0, v => publish(setCharges(mr, mech, key, v)), att.charges))
      }
      if (att?.bin) {
        stock.push(row(`${att.name} rounds (${sec.name})`, m.ammo ?? 0, v => publish(adjustAmmo(mr, mech, key, v - (m.ammo ?? 0))), binCapacity(mr, att)))
      }
    }
  }

  return <ActionModal open={true} close={close} title={`Adjust ${mech.name}`} actions={[{ name: 'Done', type: 'primary', callback: () => {} }]}>
    <div className='my-2 flex flex-col gap-1'>
      <div className='opacity-70'>Set values directly for anything the sheet does not track: heat damage, water, a power surge, a GM ruling.</div>
      {row('Energy', t.energy, v => publish(adjustTurn(mech, { energy: v })))}
      {row('Heat', t.heat, v => publish(adjustTurn(mech, { heat: v })))}
      {row('Stored energy (capacitors)', t.stored, v => publish(adjustTurn(mech, { stored: v })))}
      {row('Pilot wounds through the cockpit', t.pilotWounds, v => publish(adjustTurn(mech, { pilotWounds: v })))}
      <label className='flex justify-between items-center cursor-pointer'>
        <span>Shut down</span>
        <input type='checkbox' className='checkbox checkbox-sm' checked={t.shutdown} onChange={e => publish(adjustTurn(mech, { shutdown: e.target.checked }))}/>
      </label>
      <label className='flex justify-between items-center cursor-pointer'>
        <span>Out of action</span>
        <input type='checkbox' className='checkbox checkbox-sm' checked={t.out} onChange={e => publish(adjustTurn(mech, { out: e.target.checked }))}/>
      </label>
      {stock.length ? <div className='font-bold mt-2'>Charges and ammo</div> : null}
      {stock}
      <div className='flex flex-wrap gap-2 mt-3'>
        <button className='btn btn-xs btn-outline rounded-none' onClick={() => publish(newScene(mr, mech).mech)}>
          New scene (refill Recharging parts)
        </button>
        <button className='btn btn-xs btn-warning rounded-none' onClick={() => publish(refitMech(mr, mech))}>
          Refit at haven (repair, re-arm, reset)
        </button>
      </div>
    </div>
  </ActionModal>
}

export default MechAdjustModal
