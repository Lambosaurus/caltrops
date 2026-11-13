// External imports
import { useState } from 'react'

// Components
import AssignMechModal from './AssignMechModal'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { deriveStats } from '../../lib/mech/derive'
import { copyMechLink } from '../../lib/mech/store'
import type { Mech, MechRules } from '../../lib/mech/types'

/* Pilot tab summary of the sheet's current mech. */
function CurrentMechCard({ view, mechRules, editable, open }: {
    view: View, // root
    mechRules: MechRules,
    editable: EditMode, // the sheet's own edit mode
    open(): void,
  }): JSX.Element {

  const mech: Mech | undefined = useListener(view, 'mech')
  const sheetMechId: string | undefined = useListener(view, 'sheet/mech')
  const token: string | null = useListener(view, 'token') ?? null
  const [assigning, setAssigning] = useState(false)

  const stats = mech ? deriveStats(mechRules, mech) : undefined

  return <div className='card bg-base-200 p-4 gap-2 w-72'>
    <h2 className='font-bold text-xl'>Current mech</h2>
    {mech && stats ? <>
      <div className='font-bold text-primary'>{mech.name}</div>
      <div className='opacity-70'>{mech.chassis}</div>
      <div>Energy {mech.turn.energy}/{stats.energyOut} · Heat {mech.turn.heat}/{stats.heatMax}</div>
    </> : <div className='opacity-60'>{sheetMechId ? 'Loading mech...' : 'No mech assigned.'}</div>}
    <div className='flex gap-2'>
      <button className='btn btn-primary btn-sm' disabled={!mech} onClick={open}>Open</button>
      <button className='btn btn-outline btn-sm' disabled={editable === EditMode.None} onClick={() => setAssigning(true)}>Assign…</button>
    </div>
    <div className='flex gap-2'>
      <button className='btn btn-outline btn-sm' disabled={!sheetMechId || editable < EditMode.Live} onClick={() => view.delete('sheet/mech')}>Unassign</button>
      <button className='btn btn-outline btn-sm' disabled={!sheetMechId} onClick={() => sheetMechId && copyMechLink(sheetMechId)}>Copy mech link</button>
    </div>
    <AssignMechModal
      open={assigning}
      close={() => setAssigning(false)}
      token={token}
      assign={id => view.publish('sheet/mech', id)}
    />
  </div>
}

export default CurrentMechCard
