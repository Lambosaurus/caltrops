// Components
import Popover from './Popover'
import MechSection, { TypeTag } from './MechSection'
import ChassisSilhouette from './ChassisSilhouette'
import TurnControls from './TurnControls'
import HitModal from './HitModal'
import ActivationModal from './ActivationModal'
import TakeHitPanel from './TakeHitPanel'
import MechSettingsPanel from './MechSettingsPanel'
import MechLog from './MechLog'
import AttachmentCatalogue from './AttachmentCatalogue'
import EquipmentTable from '../EquipmentTable'
import ActionModal from '../ActionModal'
import { statPop, StatKind } from './mechText'
import { useEffect, useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { changeChassis, dropOnCatalogue, dropPart, findChassis, setArmour, unmount, type PartDrag } from '../../lib/mech/loadout'
import { deriveStats, overheated } from '../../lib/mech/derive'
import { adjustAmmo, repairAll, setArmourPoints, toggleWound } from '../../lib/mech/damage'
import { logMech, copyMechLink } from '../../lib/mech/store'
import type { Mech, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'

/*
 * The mech sheet: status bar, slot legend, section grid over the chassis silhouette, and a side column.
 * `view` is the root view; `editable` is the effective mech edit mode (see SheetView / MainPage).
 * Hits, wound and armour edits, ammo and repair are wired here; activation opens ActivationModal.
 */
function MechView({ view, editable }: {
    view: View,
    editable: EditMode,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const [hitSection, setHitSection] = useState(null as string | null)
  const [confirmRepair, setConfirmRepair] = useState(false)
  const [loadout, setLoadout] = useState(false)
  const [newChassis, setNewChassis] = useState(null as string | null)
  const [activeKey, setActiveKey] = useState(null as string | null)
  const mechRules: MechRules | undefined = rules?.mechs
  const chassis = mech && mechRules ? findChassis(mechRules, mech.chassis) : undefined

  // Closing the activation modal when play rights drop (e.g. a different, read only mech opens).
  useEffect(() => {
    if (editable < EditMode.Live) {
      setActiveKey(null)
    }
  }, [editable])

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
  const stats = deriveStats(mechRules, mech)
  const t = mech.turn
  const hot = overheated(mechRules, mech)
  const projected = Math.max(0, t.heat + (t.shutdown ? 0 : stats.reactorHeat) - stats.cooling)
  const heatColor = hot ? 'bg-error' : t.heat > stats.heatMax * 0.7 ? 'bg-warning' : 'bg-primary'
  const warns: string[] = []
  if (!stats.hasReactor) warns.push('No reactor mounted')
  if (!stats.hasCooling) warns.push('No cooling mounted')

  const stat = (kind: StatKind, children: React.ReactNode) =>
    <Popover content={statPop(mechRules, mech, kind)}>
      <span className='px-2 border border-base-300 whitespace-nowrap'>{children}</span>
    </Popover>

  const posture = t.posture === 'still'
    ? <span className='badge badge-warning rounded-none font-bold'>SITTING DUCK</span>
    : t.posture === 'sprint'
    ? <span className='badge badge-primary rounded-none font-bold'>SPRINTING −{stats.evasion}</span>
    : <span className='badge badge-outline rounded-none font-bold'>MOVED</span>

  // Loadout editing needs full edit rights; while it is on, play controls are off.
  const loading = loadout && editable === EditMode.Full
  const playMode = loading ? EditMode.None : editable
  const play = playMode >= EditMode.Live
  const publish = (next: Mech) => view.publish('mech', next)

  const stowageContainer = { name: 'Stowage', size: stats.stowage, tags: ['handheld', 'custom'] }

  return <div className='flex flex-col gap-2 p-4 w-full font-mono text-xs'>

    {/* Status bar */}
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
      {stat('energy', <>
        Energy <b>{t.energy}</b>/{stats.energyOut}
        {stats.capacitor ? <span className='opacity-60'> (+store {stats.capacitor})</span> : null}
        {' '}<Meter fraction={stats.energyOut ? t.energy / stats.energyOut : 0} color='bg-primary'/>
      </>)}
      {stat('heat', <>
        Heat <b className={hot ? 'text-error' : ''}>{t.heat}</b>/{stats.heatMax}
        {' '}<Meter fraction={t.heat / (stats.heatMax * 1.5)} color={heatColor} mark={1 / 1.5}/>
        {' '}<span className='opacity-60'>end of turn → {projected}</span>
      </>)}
      {stat('speed', <>Speed {stats.speed}</>)}
      {stat('evasion', <>Evasion {stats.evasion}</>)}
      {stat('hand', <>Hand {stats.hand ? '✓' : '✗'}</>)}
      {t.pilotWounds ? <span className='px-2 border border-error text-error'>Pilot wounds {t.pilotWounds}</span> : null}
      {t.out ? <span className='badge badge-error rounded-none font-bold'>OUT OF ACTION</span>
        : t.shutdown ? <span className='badge badge-error rounded-none font-bold'>SHUT DOWN</span>
        : hot ? <span className='badge badge-error rounded-none font-bold'>OVERHEATED</span> : null}
      <span className='flex-1'/>
      <button className='btn btn-xs btn-outline rounded-none' onClick={() => copyMechLink(mech.id)}>Copy mech link</button>
      {editable === EditMode.Full
        ? <button className={`btn btn-xs rounded-none ${loading ? 'btn-primary' : 'btn-outline'}`} onClick={() => setLoadout(!loadout)}>
            {loading ? 'Done editing' : 'Edit loadout'}
          </button>
        : null}
      <Popover content={statPop(mechRules, mech, 'posture')}>{posture}</Popover>
    </div>

    {loading ? null : <TurnControls view={view} editable={editable}/>}

    {warns.length ? <div className='border border-error bg-error/10 p-2'>⚠ {warns.join(' · ')}</div> : null}

    <div className='flex flex-col lg:flex-row gap-2 items-start'>
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
                editable={playMode}
                loadout={loading}
                onDropPart={(item, id, start) => publish(dropPart(mechRules, mech, item, id, start))}
                onUnmount={(id, start) => publish(unmount(mech, id, start))}
                onDropArmour={(id, name) => publish(setArmour(mechRules, mech, id, name))}
                onClearArmour={id => publish(setArmour(mechRules, mech, id, null))}
                onHit={setHitSection}
                onActivate={key => { setActiveKey(key) }}
                onWound={(id, i) => publish(toggleWound(mechRules, mech, id, i))}
                onArmour={(id, points) => {
                  const cur = mech.sections[id]?.armour?.points
                  // Clicking the current top pip lowers it by one, so the last pip can be cleared.
                  publish(setArmourPoints(mechRules, mech, id, cur === points ? points - 1 : points))
                }}
                onAmmo={(key, delta) => publish(adjustAmmo(mechRules, mech, key, delta))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Side column */}
      <div className='flex flex-col gap-2 w-full lg:w-80 flex-none'>
        {loading
          ? <AttachmentCatalogue rules={mechRules} onRemove={(item: PartDrag) => publish(dropOnCatalogue(mech, item))}/>
          : null}
        <div className='bg-base-200 border border-base-300 p-2 overflow-x-auto'>
          <Popover content={statPop(mechRules, mech, 'stowage')}>
            <h4 className='font-bold text-accent mb-1'>Stowage {(mech.equipment.Stowage ?? []).length}/{stats.stowage}</h4>
          </Popover>
          <EquipmentTable
            equipment={rules!.equipment}
            container={stowageContainer}
            view={view.view('mech/equipment/Stowage')}
            editable={editable}
          />
        </div>
        {loading ? null : <>
          <TakeHitPanel view={view} editable={editable}/>
          <MechSettingsPanel view={view} editable={editable}/>
          <div className='bg-base-200 border border-base-300 p-2'>
            <h4 className='font-bold text-accent mb-1'>Between missions</h4>
            <button className='btn btn-xs btn-outline' disabled={!play} onClick={() => setConfirmRepair(true)}>Repair &amp; rearm</button>
          </div>
        </>}
        <MechLog view={view}/>
      </div>
    </div>

    <HitModal view={view} sectionId={hitSection} close={() => setHitSection(null)}/>
    {play && rules ? <ActivationModal rules={rules} view={view} mountKey={activeKey} close={() => setActiveKey(null)}/> : null}
    <ActionModal
      open={newChassis !== null}
      close={() => setNewChassis(null)}
      title='Change chassis'
      actions={[
        { name: 'Cancel', callback: () => {} },
        { name: 'Change chassis', type: 'primary', callback: () => {
          if (newChassis && rules) {
            publish(changeChassis(rules, mech, newChassis))
            logMech(view, [`Chassis changed to ${newChassis}; loadout cleared.`])
          }
        } },
      ]}
    >
      <p className='my-4'>Change chassis to {newChassis}? The current loadout, armour and turn state are cleared. Stowage is kept.</p>
    </ActionModal>
    <ActionModal
      open={confirmRepair}
      close={() => setConfirmRepair(false)}
      title='Repair & rearm'
      actions={[
        { name: 'Cancel', callback: () => {} },
        { name: 'Repair & rearm', type: 'primary', callback: () => {
          publish(repairAll(mechRules, mech))
          logMech(view, ['Repaired, re-armoured and rearmed.'])
        } },
      ]}
    >
      <p className='my-4'>Clear all wounds and pilot wounds, restore armour, ammo and charges?</p>
    </ActionModal>
  </div>
}

function Meter({ fraction, color, mark }: { fraction: number, color: string, mark?: number }): JSX.Element {
  return <span className='inline-block w-24 h-2 bg-base-300 align-middle relative'>
    <i className={`absolute left-0 top-0 bottom-0 ${color}`} style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }}/>
    {mark !== undefined ? <b className='absolute -top-0.5 -bottom-0.5 w-0.5 bg-white' style={{ left: `${mark * 100}%` }}/> : null}
  </span>
}

export default MechView
