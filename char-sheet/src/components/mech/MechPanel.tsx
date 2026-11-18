// Components
import Popover, { Why } from './Popover'
import MechSection, { TypeTag } from './MechSection'
import ChassisSilhouette from './ChassisSilhouette'
import HitModal from './HitModal'
import ActivationModal from './ActivationModal'
import ShotModal, { type AttackTarget } from './ShotModal'
import MechAdjustModal from './MechAdjustModal'
import MechStowage from './MechStowage'
import { statPop, StatKind } from './mechText'
import { showResult } from './notify'
import { useEffect, useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { deriveStats, overheated, turnEnergy } from '../../lib/mech/derive'
import { adjustAmmo, setArmourPoints, toggleWound } from '../../lib/mech/damage'
import { adjustTurn, isWeapon, newTurn, shotKindOf, shutdownPurge, shutdownText, sprint, sprintBlocker, sprintCost } from '../../lib/mech/turn'
import { findAttachment, findChassis, mountCovering } from '../../lib/mech/loadout'
import { copyMechLink } from '../../lib/mech/store'
import type { Mech, MechResult, MechRules } from '../../lib/mech/types'
import type { Dictionary, Rules } from '../../lib/rules'
import caltrops from '../../lib/caltrops'
import foundry from '../../lib/foundry'
import { alertInfo } from '../../lib/alerts'
import { roller } from './roller'
import { mechSkillPath, sprintRoll } from '../../lib/mech/roll'

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
  const mode: string | undefined = useListener(view, 'mode')
  const attributes: Dictionary<number> | undefined = useListener(view, 'sheet/attributes')
  const skills: Dictionary<number> | undefined = useListener(view, mechSkillPath(rules))
  const [hitSection, setHitSection] = useState(null as string | null)
  const [activeKey, setActiveKey] = useState(null as string | null)
  const [attackOn, setAttackOn] = useState(null as AttackTarget | null)
  const [adjusting, setAdjusting] = useState(false)
  const mechRules: MechRules | undefined = rules?.mechs
  const chassis = mech && mechRules ? findChassis(mechRules, mech.chassis) : undefined

  // Closing the activation modal when play rights drop (e.g. a different, read only mech opens).
  useEffect(() => {
    if (editable < EditMode.Live) {
      setActiveKey(null)
      setAttackOn(null)
      setAdjusting(false)
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
  // Heat after the next New turn: unchanged going into a held shutdown turn, cooled (no reactor) after one.
  const projected = Math.max(0, t.shutdown ? (t.holdShutdown ? t.heat : t.heat - stats.cooling) : t.heat + stats.reactorHeat - stats.cooling)
  const sprintCosts = sprintCost(mechRules, mech)
  const perTurn = turnEnergy(stats)
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
    showResult(res, mech!.name)
  }
  const publish = (next: Mech) => view.publish('mech', next)

  // Sprint pays, then makes the ruleset's Sprint roll if it has one: to the VTT, or rolled here without one.
  function doSprint() {
    const res = sprint(mechRules!, mech!, roller)
    run(res)
    const spec = mechRules!.sprintRoll
    const scores = mode === 'mech' ? {} : { ...(attributes ?? {}), ...(skills ?? {}) }
    const info = rules && spec ? sprintRoll(rules, res.mech, scores) : null
    if (!info || !spec) return
    const what = `Sprint, ${spec.label}`
    if (foundry.isPresent()) {
      foundry.submitRoll(info, { detail: [`${mech!.name}: ${what}`, spec.note].filter(Boolean).join(': ') })
    } else {
      const dice = caltrops.rollDice(info)
      const n = dice.filter(d => d === 4).length
      const note = spec.note ? `, ${spec.note}` : ''
      alertInfo(`${what}: ${n} success${n === 1 ? '' : 'es'} (${dice.length}d4: ${dice.join(' ') || 'none'})${note}.`)
    }
  }

  // Why each status-bar control is disabled, shown on hover (null = enabled).
  const readOnly = play ? null : 'Read only: you cannot play this mech.'
  const sprintWhy = readOnly ?? sprintBlocker(mechRules, mech)
  const purgeWhy = readOnly ?? (t.out ? 'Mech is out of action.' : t.shutdown ? 'Already shut down.' : null)
  const newTurnWhy = readOnly ?? (t.out ? 'Out of action: repair the core (or untick it in Adjust…) first.' : null)
  const off = (why: string | null) => (why ? 'pointer-events-none' : '')
  // Inline −/+ for energy and heat; the Adjust dialog sets anything else.
  const nudge = (field: 'energy' | 'heat', delta: number) => publish(adjustTurn(mech, { [field]: t[field] + delta }))
  const step = (field: 'energy' | 'heat', delta: number) => play
    ? <button
        className='btn btn-xs btn-ghost px-1 min-h-0 h-4'
        aria-label={`${field} ${delta < 0 ? 'minus' : 'plus'}`}
        disabled={delta < 0 && t[field] <= 0}
        onClick={() => nudge(field, delta)}
      >{delta < 0 ? '−' : '+'}</button>
    : null
  // A weapon's button opens the attack dialog for that weapon alone; other parts use the activation dialog.
  function onActivate(key: string) {
    const [sectionId, start] = key.split(':')
    const m = mountCovering(mechRules!, mech!, sectionId, Number(start))
    const att = m && findAttachment(mechRules!, m.name)
    if (att && isWeapon(att)) setAttackOn({ kind: shotKindOf(att), key })
    else setActiveKey(key)
  }

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
        Energy {step('energy', -1)}<b>{t.energy}</b>{step('energy', 1)}/{perTurn}
        {stats.capacitor ? <span className='opacity-60'> (+store {stats.capacitor})</span> : null}
        {' '}<Meter fraction={stats.energyOut ? t.energy / stats.energyOut : 0} color='bg-primary'/>
      </>)}
      {stat('heat', <>
        Heat {step('heat', -1)}<b className={hot ? 'text-error' : ''}>{t.heat}</b>{step('heat', 1)}/{stats.heatMax}
        {' '}<Meter fraction={t.heat / (stats.heatMax * 1.5)} color={heatColor} mark={1 / 1.5}/>
        {' '}<span className='opacity-60'>end of turn → {projected}</span>
      </>)}
      {stat('speed', <>Speed <b>{stats.speed}</b> <span className='opacity-60'>tiles</span></>)}
      {stat('evasion', <>Evasion {stats.evasion}</>)}
      {stat('hand', <>Hand {stats.hand ? '✓' : '✗'}</>)}
      {t.pilotWounds ? <span className='px-2 border border-error text-error'>Pilot wounds {t.pilotWounds}</span> : null}
      {t.out ? <span className='badge badge-error rounded-none font-bold'>OUT OF ACTION</span>
        : t.shutdown ? <span className='badge badge-error rounded-none font-bold' title={t.holdShutdown ? 'Stays shut down through the next turn' : 'Reboots at New turn'}>
          {t.holdShutdown ? 'SHUT DOWN: next turn too' : 'SHUT DOWN: reboots at New turn'}
        </span>
        : hot ? <span className='badge badge-error rounded-none font-bold'>OVERHEATED</span> : null}
      <span className='flex-1'/>
      <Why why={sprintWhy}>
        <button className={`btn btn-xs btn-outline rounded-none ${off(sprintWhy)}`} disabled={!!sprintWhy} onClick={doSprint}>
          Sprint ({sprintCosts.energy}E +{sprintCosts.heat}H)
        </button>
      </Why>
      <Why why={purgeWhy}>
        <button className={`btn btn-xs btn-error rounded-none ${off(purgeWhy)}`} disabled={!!purgeWhy} onClick={() => run(shutdownPurge(mechRules, mech))}>
          Shut down &amp; purge
        </button>
      </Why>
      <Why why={newTurnWhy}>
        <button className={`btn btn-xs btn-success rounded-none ${off(newTurnWhy)}`} disabled={!!newTurnWhy} onClick={() => run(newTurn(mechRules, mech))}>New turn ▶</button>
      </Why>
      <Why why={readOnly}>
        <button className={`btn btn-xs btn-outline rounded-none ${off(readOnly)}`} disabled={!!readOnly} onClick={() => setAdjusting(true)}>Adjust…</button>
      </Why>
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

    {/* Stowage (standalone page only; the pilot sheet lists it with the inventory) */}
    {showStowage ? <div className='bg-base-200 border border-base-300 p-2 overflow-x-auto max-w-md'>
      <Popover content={statPop(mechRules, mech, 'stowage')}>
        <h4 className='font-bold text-accent mb-1'>Stowage {(mech.equipment.Stowage ?? []).length}/{stats.stowage}</h4>
      </Popover>
      <MechStowage view={view} editable={editable}/>
    </div> : null}

    <HitModal view={view} sectionId={hitSection} close={() => setHitSection(null)}/>
    {play && rules ? <ActivationModal rules={rules} view={view} mountKey={activeKey} close={() => setActiveKey(null)}/> : null}
    {play && rules ? <ShotModal rules={rules} view={view} target={attackOn} close={() => setAttackOn(null)}/> : null}
    {play && rules ? <MechAdjustModal rules={rules} view={view} open={adjusting} close={() => setAdjusting(false)}/> : null}
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
