// Components
import Popover from './Popover'
import MechSection, { TypeTag } from './MechSection'
import ChassisSilhouette from './ChassisSilhouette'
import HitModal from './HitModal'
import ActivationModal from './ActivationModal'
import MechStowage from './MechStowage'
import { statPop, StatKind } from './mechText'
import { showNotices } from './notify'
import { useEffect, useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { findChassis } from '../../lib/mech/loadout'
import { deriveStats, overheated } from '../../lib/mech/derive'
import { adjustAmmo, setArmourPoints, toggleWound } from '../../lib/mech/damage'
import { newTurn, shutdownPurge, sprint, sprintBlocker } from '../../lib/mech/turn'
import { copyMechLink } from '../../lib/mech/store'
import type { Mech, MechResult, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'
import { roller } from './roller'

/*
 * The mech play panel, a widget sized to about three sheet columns: status bar with Sprint / Shut down & purge /
 * New turn, and the section grid over the chassis silhouette. `view` is the root view; `editable` is the effective
 * mech edit mode. `showStowage` adds the stowage list (the pilot sheet shows it in its inventory column instead).
 */
function MechPanel({ view, editable, showStowage = true }: {
    view: View,
    editable: EditMode,
    showStowage?: boolean,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const [hitSection, setHitSection] = useState(null as string | null)
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

  const stats = deriveStats(mechRules, mech)
  const t = mech.turn
  const hot = overheated(mechRules, mech)
  const projected = Math.max(0, t.shutdown ? t.heat : t.heat + stats.reactorHeat - stats.cooling)
  const heatColor = hot ? 'bg-error' : t.heat > stats.heatMax * 0.7 ? 'bg-warning' : 'bg-primary'
  const warns: string[] = []
  if (!stats.hasReactor) warns.push('No reactor mounted')
  if (!stats.hasCooling) warns.push('No cooling mounted')

  const stat = (kind: StatKind, children: React.ReactNode) =>
    <Popover content={statPop(mechRules, mech, kind)}>
      <span className='px-2 border border-base-300 whitespace-nowrap'>{children}</span>
    </Popover>

  const play = editable >= EditMode.Live
  const mv = view.view('mech')

  // Every handler publishes the new mech, then toasts anything the player must act on.
  function run(res: MechResult) {
    view.publish('mech', res.mech)
    showNotices(res.notices)
  }
  const publish = (next: Mech) => view.publish('mech', next)

  const sprintDisabled = !play || sprintBlocker(mechRules, mech) !== null
  const purgeDisabled = !play || t.shutdown || t.out

  return <div className='w-full'>
    <table className='table table-compact w-full'>
      <thead>
        <tr>
          <th>Mech: {mech.name}</th>
        </tr>
      </thead>
    </table>
    <div className='flex flex-col gap-2 p-2 bg-base-100 font-mono text-xs'>

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
      <button className='btn btn-xs btn-outline rounded-none' disabled={sprintDisabled} onClick={() => run(sprint(mechRules, mech, roller))}>
        Sprint ({mechRules.sprint.energy}E +{mechRules.sprint.heat}H)
      </button>
      <button className='btn btn-xs btn-error rounded-none' disabled={purgeDisabled} onClick={() => run(shutdownPurge(mechRules, mech))}>
        Shut down &amp; purge
      </button>
      <button className='btn btn-xs btn-success rounded-none' disabled={!play || t.out} onClick={() => run(newTurn(mechRules, mech))}>New turn ▶</button>
      <button className='btn btn-xs btn-outline rounded-none' onClick={() => copyMechLink(mech.id)}>Copy mech link</button>
    </div>

    {warns.length ? <div className='border border-error bg-error/10 p-2'>⚠ {warns.join(' · ')}</div> : null}

    {/* Legend */}
    <div className='flex flex-wrap items-center gap-1.5 opacity-90'>
      <span>Slots:</span>
      {mechRules.slotTypes.filter(s => s.name !== 'Generic').map(s =>
        <TypeTag key={s.name} rules={mechRules} type={s.name} label={s.label}/>
      )}
    </div>

    {/* Body */}
    <div className='relative'>
      <ChassisSilhouette chassis={chassis}/>
      <div className='relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 p-2'>
        {chassis.sections.map(section =>
          <MechSection
            key={section.id}
            rules={mechRules}
            section={section}
            view={mv}
            editable={editable}
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

    {/* Stowage (standalone page only; the pilot sheet lists it with the inventory) */}
    {showStowage ? <div className='bg-base-200 border border-base-300 p-2 overflow-x-auto max-w-md'>
      <Popover content={statPop(mechRules, mech, 'stowage')}>
        <h4 className='font-bold text-accent mb-1'>Stowage {(mech.equipment.Stowage ?? []).length}/{stats.stowage}</h4>
      </Popover>
      <MechStowage view={view} editable={editable}/>
    </div> : null}

    <HitModal view={view} sectionId={hitSection} close={() => setHitSection(null)}/>
    {play && rules ? <ActivationModal rules={rules} view={view} mountKey={activeKey} close={() => setActiveKey(null)}/> : null}
    </div>
  </div>
}

function Meter({ fraction, color, mark }: { fraction: number, color: string, mark?: number }): JSX.Element {
  return <span className='inline-block w-24 h-2 bg-base-300 align-middle relative'>
    <i className={`absolute left-0 top-0 bottom-0 ${color}`} style={{ width: `${Math.max(0, Math.min(1, fraction)) * 100}%` }}/>
    {mark !== undefined ? <b className='absolute -top-0.5 -bottom-0.5 w-0.5 bg-white' style={{ left: `${mark * 100}%` }}/> : null}
  </span>
}

export default MechPanel
