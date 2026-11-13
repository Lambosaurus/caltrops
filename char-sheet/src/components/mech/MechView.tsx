// Components
import Popover from './Popover'
import MechSection, { TypeTag } from './MechSection'
import ChassisSilhouette from './ChassisSilhouette'
import TurnControls from './TurnControls'
import HitModal from './HitModal'
import TakeHitPanel from './TakeHitPanel'
import MechSettingsPanel from './MechSettingsPanel'
import MechLog from './MechLog'
import ActionModal from '../ActionModal'
import { statPop, StatKind } from './mechText'
import { useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { findChassis } from '../../lib/mech/loadout'
import { deriveStats, overheated } from '../../lib/mech/derive'
import { adjustAmmo, repairAll, setArmourPoints, toggleWound } from '../../lib/mech/damage'
import { logMech } from '../../lib/mech/store'
import type { Mech, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'

/*
 * The mech sheet: status bar, slot legend, section grid over the chassis silhouette, and a side column.
 * `view` is the root view; `editable` is the effective mech edit mode (see SheetView / MainPage).
 * Hits, wound and armour edits, ammo and repair are wired here; activation is wired by the parent.
 */
function MechView({ view, editable, onActivate = () => {} }: {
    view: View,
    editable: EditMode,
    onActivate?(key: string): void,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const [hitSection, setHitSection] = useState(null as string | null)
  const [confirmRepair, setConfirmRepair] = useState(false)
  const mechRules: MechRules | undefined = rules?.mechs
  const chassis = mech && mechRules ? findChassis(mechRules, mech.chassis) : undefined

  if (!mech || !mechRules) {
    return null
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

  const play = editable >= EditMode.Live
  const publish = (next: Mech) => view.publish('mech', next)

  const stowage = mech.equipment.Stowage ?? []

  return <div className='flex flex-col gap-2 p-4 w-full font-mono text-xs'>

    {/* Status bar */}
    <div className='flex flex-wrap items-center gap-2 bg-base-200 p-2'>
      <span className='px-2 border border-base-300 font-bold'>{mech.name}</span>
      <span className='px-2 border border-base-300'>{chassis.name}</span>
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
      <Popover content={statPop(mechRules, mech, 'posture')}>{posture}</Popover>
    </div>

    <TurnControls view={view} editable={editable}/>

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
                editable={editable}
                onHit={setHitSection}
                onActivate={onActivate}
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
      <div className='flex flex-col gap-2 w-full lg:w-64 flex-none'>
        <div className='bg-base-200 border border-base-300 p-2'>
          <Popover content={statPop(mechRules, mech, 'stowage')}>
            <h4 className='font-bold text-accent mb-1'>Stowage {stowage.length}/{stats.stowage}</h4>
          </Popover>
          {stowage.length ? stowage.map((e, i) => <div key={i}>{e.name}{e.count && e.count > 1 ? ` x${e.count}` : ''}</div>)
            : <div className='opacity-50'>Nothing stowed.</div>}
        </div>
        <TakeHitPanel view={view} editable={editable}/>
        <MechSettingsPanel view={view} editable={editable}/>
        <div className='bg-base-200 border border-base-300 p-2'>
          <h4 className='font-bold text-accent mb-1'>Between missions</h4>
          <button className='btn btn-xs btn-outline' disabled={!play} onClick={() => setConfirmRepair(true)}>Repair &amp; rearm</button>
        </div>
        <MechLog view={view}/>
      </div>
    </div>

    <HitModal view={view} sectionId={hitSection} close={() => setHitSection(null)}/>
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
