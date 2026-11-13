// Components
import MechSection, { TypeTag } from './MechSection'
import ChassisSilhouette from './ChassisSilhouette'
import MechSettingsPanel from './MechSettingsPanel'
import AttachmentCatalogue from './AttachmentCatalogue'
import ActionModal from '../ActionModal'
import { useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { changeChassis, dropOnCatalogue, dropPart, findChassis, setArmour, unmount, type PartDrag } from '../../lib/mech/loadout'
import { deriveStats } from '../../lib/mech/derive'
import { copyMechLink } from '../../lib/mech/store'
import type { Mech, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'

/*
 * The mech management view: chassis, loadout editing and the automation settings. Play lives in MechPanel.
 * `view` is the root view; `editable` is the effective mech edit mode (see SheetView / MainPage).
 * Task 3 replaces this with MechManage.
 */
function MechView({ view, editable }: {
    view: View,
    editable: EditMode,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const [loadout, setLoadout] = useState(false)
  const [newChassis, setNewChassis] = useState(null as string | null)
  const mechRules: MechRules | undefined = rules?.mechs
  const chassis = mech && mechRules ? findChassis(mechRules, mech.chassis) : undefined

  if (!mech) {
    return null
  }
  if (!mechRules) {
    return <div className='p-4 opacity-70'>This mech's ruleset ({rules?.name ?? mech.rules}) has no mech rules loaded.</div>
  }
  if (!chassis) {
    return <div className='p-4 text-error'>Unknown chassis: {mech.chassis}</div>
  }

  const mv = view.view('mech')
  // Loadout editing needs full edit rights.
  const loading = loadout && editable === EditMode.Full
  const publish = (next: Mech) => view.publish('mech', next)
  const stats = deriveStats(mechRules, mech)
  const warns: string[] = []
  if (!stats.hasReactor) warns.push('No reactor mounted')
  if (!stats.hasCooling) warns.push('No cooling mounted')

  return <div className='flex flex-col gap-2 p-4 w-full font-mono text-xs'>

    <div className='flex flex-wrap items-center gap-2 bg-base-200 p-2'>
      <span className='px-2 border border-base-300 font-bold'>{mech.name}</span>
      {loading
        ? <select
            className='select select-xs select-bordered rounded-none'
            aria-label='Chassis'
            value={chassis.name}
            onChange={e => e.target.value !== chassis.name && setNewChassis(e.target.value)}
          >
            {mechRules.chassis.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        : <span className='px-2 border border-base-300'>{chassis.name}</span>}
      <span className='flex-1'/>
      <button className='btn btn-xs btn-outline rounded-none' onClick={() => copyMechLink(mech.id)}>Copy mech link</button>
      {editable === EditMode.Full
        ? <button className={`btn btn-xs rounded-none ${loading ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLoadout(!loadout)}>
            {loading ? 'Done editing' : 'Edit loadout'}
          </button>
        : null}
    </div>

    {loading && warns.length ? <div className='border border-error bg-error/10 p-2'>⚠ {warns.join(' · ')}</div> : null}

    {loading ? <div className='flex flex-col lg:flex-row gap-2 items-start'>
      <div className='flex-1 min-w-0 w-full'>

        {/* Legend */}
        <div className='flex flex-wrap items-center gap-1.5 mb-1 opacity-90'>
          <span>Slots:</span>
          {mechRules.slotTypes.filter(s => s.name !== 'Generic').map(s =>
            <TypeTag key={s.name} rules={mechRules} type={s.name} label={s.label}/>
          )}
          <span className='opacity-60 ml-1'>Generic parts fit any slot except Armour and Hull.</span>
        </div>

        {/* Body */}
        <div className='relative'>
          <ChassisSilhouette chassis={chassis}/>
          <div className='relative grid grid-cols-2 lg:grid-cols-6 gap-2.5 p-2.5'>
            {chassis.sections.map(section =>
              <MechSection
                key={section.id}
                rules={mechRules}
                section={section}
                view={mv}
                editable={EditMode.None}
                loadout={true}
                onDropPart={(item, id, start) => publish(dropPart(mechRules, mech, item, id, start))}
                onUnmount={(id, start) => publish(unmount(mech, id, start))}
                onDropArmour={(id, name) => publish(setArmour(mechRules, mech, id, name))}
                onClearArmour={id => publish(setArmour(mechRules, mech, id, null))}
                onHit={() => {}}
                onActivate={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-2 w-full lg:w-80 flex-none'>
        <AttachmentCatalogue rules={mechRules} onRemove={(item: PartDrag) => publish(dropOnCatalogue(mech, item))}/>
      </div>
    </div> : <div className='w-full lg:w-80'>
      <MechSettingsPanel view={view} editable={editable}/>
    </div>}

    <ActionModal
      open={newChassis !== null}
      close={() => setNewChassis(null)}
      title='Change chassis'
      actions={[
        { name: 'Cancel', callback: () => {} },
        { name: 'Change chassis', type: 'primary', callback: () => {
          if (newChassis && rules) {
            publish(changeChassis(rules, mech, newChassis))
          }
        } },
      ]}
    >
      <p className='my-4'>Change chassis to {newChassis}? The current loadout, armour and turn state are cleared. Stowage is kept.</p>
    </ActionModal>
  </div>
}

export default MechView
