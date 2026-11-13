// Components
import MechSection, { TypeTag } from './MechSection'
import ChassisSilhouette from './ChassisSilhouette'
import MechSettingsPanel from './MechSettingsPanel'
import AttachmentCatalogue from './AttachmentCatalogue'
import ActionModal from '../ActionModal'
import AssignMechModal from './AssignMechModal'
import NewMechModal from './NewMechModal'
import LoadMechModal from './LoadMechModal'
import { useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { changeChassis, dropOnCatalogue, dropPart, findChassis, setArmour, unmount, type PartDrag } from '../../lib/mech/loadout'
import { deriveStats } from '../../lib/mech/derive'
import { MECH_DOC_TYPE, copyMechLink, openMech } from '../../lib/mech/store'
import server, { Document } from '../../lib/server'
import { alertError } from '../../lib/alerts'
import type { Mech, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'

/*
 * The mech management view (the Mech tab, and "Manage" in standalone mode): New / Load / Assign / Unassign /
 * Copy link, the chassis change, loadout editing and the automation settings. Play lives in MechPanel.
 * `view` is the root view; `editable` is the effective mech edit mode (loadout needs Full, settings Live).
 * `sheetEditable` is the sheet's own edit mode, which gates assigning (defaults to `editable`).
 */
function MechManage({ view, editable, sheetEditable }: {
    view: View,
    editable: EditMode,
    sheetEditable?: EditMode,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const mode: string | undefined = useListener(view, 'mode')
  const token: string | null = useListener(view, 'token') ?? null
  const sheetMechId: string | undefined = useListener(view, 'sheet/mech')
  const [loadout, setLoadout] = useState(false)
  const [newChassis, setNewChassis] = useState(null as string | null)
  const [creating, setCreating] = useState(false)
  const [listing, setLoadingList] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [mechList, setMechList] = useState(null as Document[] | null)
  const mechRules: MechRules | undefined = rules?.mechs
  const chassis = mech && mechRules ? findChassis(mechRules, mech.chassis) : undefined
  const standalone = mode === 'mech'
  const attach = standalone || (sheetEditable ?? editable) > EditMode.None
  const unassign = !standalone && !!sheetMechId && (sheetEditable ?? editable) >= EditMode.Live

  function chooseMech(id: string) {
    if (standalone) {
      openMech(view, id)
    } else {
      view.publish('sheet/mech', id)
    }
  }

  const actions = <>
    <button className='btn btn-xs btn-outline rounded-none' disabled={!rules || !attach} onClick={() => setCreating(true)}>New mech</button>
    <button className='btn btn-xs btn-outline rounded-none' disabled={!token || !attach} onClick={() => {
      if (token) {
        setMechList(null)
        server.list(token, MECH_DOC_TYPE)
          .then(m => setMechList(m))
          .catch(e => alertError(`Error listing mechs: ${e.message}`))
        setLoadingList(true)
      }
    }}>Load mech</button>
    {standalone ? null : <button className='btn btn-xs btn-outline rounded-none' disabled={!attach} onClick={() => setAssigning(true)}>Assign…</button>}
    {standalone ? null : <button className='btn btn-xs btn-outline rounded-none' disabled={!unassign} onClick={() => view.delete('sheet/mech')}>Unassign</button>}
  </>

  const modals = <>
    {rules ? <NewMechModal
      open={creating}
      close={() => setCreating(false)}
      rules={rules}
      setMech={m => {
        view.publish('mechEditable', EditMode.Full)
        view.publish('mech', m)
        if (!standalone) {
          view.publish('sheet/mech', m.id)
        }
      }}
    /> : null}
    {token ? <LoadMechModal
      open={listing}
      close={() => setLoadingList(false)}
      setMechId={chooseMech}
      setMechs={setMechList}
      mechs={mechList}
      token={token}
    /> : null}
    <AssignMechModal
      open={assigning}
      close={() => setAssigning(false)}
      token={token}
      assign={id => view.publish('sheet/mech', id)}
    />
  </>

  if (!mech) {
    return <div className='flex flex-col gap-2 p-4 w-full font-mono text-xs'>
      <div className='flex flex-wrap items-center gap-2 bg-base-200 p-2'>
        <span className='opacity-70'>{sheetMechId ? 'Loading mech...' : 'No mech assigned.'}</span>
        <span className='flex-1'/>
        {actions}
      </div>
      {modals}
    </div>
  }
  if (!mechRules || !chassis) {
    return <div className='flex flex-col gap-2 p-4 w-full font-mono text-xs'>
      <div className='flex flex-wrap items-center gap-2 bg-base-200 p-2'>
        {!mechRules
          ? <span className='opacity-70'>This mech's ruleset ({rules?.name ?? mech.rules}) has no mech rules loaded.</span>
          : <span className='text-error'>Unknown chassis: {mech.chassis}</span>}
        <span className='flex-1'/>
        {actions}
      </div>
      {modals}
    </div>
  }

  const mv = view.view('mech')
  // Loadout editing needs full edit rights.
  const editing = loadout && editable === EditMode.Full
  const publish = (next: Mech) => view.publish('mech', next)
  const stats = deriveStats(mechRules, mech)
  const warns: string[] = []
  if (!stats.hasReactor) warns.push('No reactor mounted')
  if (!stats.hasCooling) warns.push('No cooling mounted')

  return <div className='flex flex-col gap-2 p-4 w-full font-mono text-xs'>

    <div className='flex flex-wrap items-center gap-2 bg-base-200 p-2'>
      <span className='px-2 border border-base-300 font-bold'>{mech.name}</span>
      {editing
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
      {actions}
      {editable === EditMode.Full
        ? <button className={`btn btn-xs rounded-none ${editing ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLoadout(!loadout)}>
            {editing ? 'Done editing' : 'Edit loadout'}
          </button>
        : null}
    </div>

    {editing && warns.length ? <div className='border border-error bg-error/10 p-2'>⚠ {warns.join(' · ')}</div> : null}

    {editing ? <div className='flex flex-col lg:flex-row gap-2 items-start'>
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
    </div> : null}

    <div className='w-full lg:w-80'>
      <MechSettingsPanel view={view} editable={editable}/>
    </div>

    {modals}

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

export default MechManage
