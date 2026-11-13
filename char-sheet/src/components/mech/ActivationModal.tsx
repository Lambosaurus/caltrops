// External imports
import { useEffect, useState } from 'react'

// Components
import ActionModal, { ModalActionInfo } from '../ActionModal'
import DiceResult from '../DiceResult'
import PointEntryBox from '../PointEntryBox'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import caltrops from '../../lib/caltrops'
import foundry from '../../lib/foundry'
import { findAttachment, mountKey as keyOf } from '../../lib/mech/loadout'
import { overheated, deriveStats } from '../../lib/mech/derive'
import { activate, activationBlocker } from '../../lib/mech/turn'
import { activationRoll } from '../../lib/mech/roll'
import type { Mech, RangeBand } from '../../lib/mech/types'
import type { Dictionary, RollInfo, Rules } from '../../lib/rules'
import { roller } from './roller'
import { showNotices } from './notify'

const signed = (n: number) => (n >= 0 ? '+' : '') + n

/**
 * One modal per activation. Costs are paid only when the user confirms; then the activation roll (if any)
 * is made and shown. `mountKey` null means closed.
 */
function ActivationModal({ rules, view, mountKey, close }: {
    rules: Rules,
    view: View, // root
    mountKey: string | null,
    close(): void,
  }): JSX.Element | null {
  const mech: Mech | undefined = useListener(view, 'mech')
  const mode: string | undefined = useListener(view, 'mode')
  const attributes: Dictionary<number> | undefined = useListener(view, 'sheet/attributes')
  const skills: Dictionary<number> | undefined = useListener(view, 'sheet/skills')
  const [aspectScore, setAspectScore] = useState(0)
  const [skillScore, setSkillScore] = useState(0)
  const [other, setOther] = useState(0)
  const [done, setDone] = useState(null as { dice: number[], info: RollInfo } | null)

  useEffect(() => {
    setAspectScore(0)
    setSkillScore(0)
    setOther(0)
    setDone(null)
  }, [mountKey])

  const mechRules = rules.mechs
  if (!mountKey || !mech || !mechRules) {
    return null
  }
  let mountName: string | undefined
  for (const [id, s] of Object.entries(mech.sections)) {
    const m = s.mounts.find(x => keyOf(id, x.start) === mountKey)
    if (m) mountName = m.name
  }
  const att = mountName ? findAttachment(mechRules, mountName) : undefined
  if (!att) {
    return null
  }

  const mechMode = mode === 'mech'
  const band: RangeBand = att.range && att.range !== 'Melee' ? att.range : 'Short' // own band: no range penalty
  const names = activationRoll(rules, att, band, {})
  const scores: Dictionary<number> = mechMode && names
    ? { [names.attribute!.name]: aspectScore, [names.skill!.name]: skillScore }
    : { ...(attributes ?? {}), ...(skills ?? {}) }
  const base = activationRoll(rules, att, band, scores)
  const info: RollInfo | null = base ? { ...base, bonus: (base.bonus ?? 0) + other } : null
  const count = info ? Math.max(0, caltrops.rollDiceCount(info)) : 0

  const blocker = done ? null : activationBlocker(mechRules, mech, mountKey, band)
  const hot = overheated(mechRules, mech)
  const heat = att.heat ?? 0
  const selfDamage = Math.max(0, mech.turn.heat + heat - deriveStats(mechRules, mech).heatMax)

  const costs = [`${att.energy ?? 0} energy`, `${signed(heat)} heat`]
  if (att.ammo) costs.push(`1 ${att.ammo} ammo`)
  if (att.charges) costs.push('1 charge')

  const parts: { label: string, value: number }[] = []
  if (info && base) {
    parts.push({ label: `${info.attribute!.name} (aspect)`, value: info.attribute!.score })
    parts.push({ label: `${info.skill!.name} (skill)`, value: info.skill!.score })
    if (att.roll!.bonus) parts.push({ label: `${att.name} bonus`, value: att.roll!.bonus })
    const pen = (att.roll!.bonus ?? 0) - (base.bonus ?? 0)
    if (pen) parts.push({ label: `Target inside ${att.range} range`, value: -pen })
  }

  function confirm(toVtt: boolean) {
    if (!mech || !mechRules || !mountKey) return
    const res = activate(mechRules, mech, mountKey, roller, band)
    if (res.mech === mech) {
      return // blocked: nothing was paid, so do not roll
    }
    view.publish('mech', res.mech)
    showNotices(res.notices)
    if (info) {
      if (toVtt && foundry.isPresent()) {
        foundry.submitRoll(info)
        close()
        return
      }
      const dice = caltrops.rollDice(info)
      setDone({ dice, info })
    } else {
      close()
    }
  }

  const actions: ModalActionInfo[] = []
  if (done) {
    actions.push({ name: 'Done', type: 'primary', callback: () => {} })
  } else {
    actions.push({ name: 'Cancel', callback: () => {} })
    actions.push({
      name: info ? `Roll ${count} dice & activate` : 'Activate',
      type: 'primary',
      disabled: blocker !== null,
      callback: () => confirm(false),
      stayOpen: true,
    })
    if (info && foundry.isPresent()) {
      actions.push({ name: 'Send to VTT', type: 'primary', disabled: blocker !== null, callback: () => confirm(true), stayOpen: true })
    }
  }

  const hits = done ? done.dice.filter(d => d >= 4).length : 0

  return <ActionModal open={true} close={close} title={att.name + (att.effect && info ? ` · ${att.effect}` : '')} actions={actions}>
    <div className='my-2'>Cost: {costs.join(', ')}</div>
    {hot && !done ? <div className='my-2 text-error'>
      Overheated: this action also rolls {selfDamage}d4 of heat self-damage.
    </div> : null}
    {blocker ? <div className='my-2 text-error' role='alert'>{blocker}</div> : null}
    {info ? <div className='my-2'>
      {mechMode ? <>
        <div className='flex justify-between items-center'>
          <span>{info.attribute!.name} (aspect)</span>
          <PointEntryBox value={aspectScore} setValue={setAspectScore} editable={!done} min={0} max={9}/>
        </div>
        <div className='flex justify-between items-center'>
          <span>{info.skill!.name} (skill)</span>
          <PointEntryBox value={skillScore} setValue={setSkillScore} editable={!done} min={0} max={9}/>
        </div>
        {parts.slice(2).map(p => <div key={p.label} className='flex justify-between'><span>{p.label}</span><span>{signed(p.value)}</span></div>)}
      </> : parts.map(p => <div key={p.label} className='flex justify-between'><span>{p.label}</span><span>{signed(p.value)}</span></div>)}
      <div className='flex justify-between items-center'>
        <span>Other bonus</span>
        <PointEntryBox value={other} setValue={setOther} editable={!done} min={-9} max={9}/>
      </div>
      <div className='flex justify-between font-bold border-t border-base-300 mt-1 pt-1'>
        <span>Roll</span><span>{count}d4</span>
      </div>
    </div> : <div className='my-2'>{att.effect ?? att.description ?? ''}</div>}
    {done ? <>
      <DiceResult dice={done.dice}/>
      <div className='text-center font-bold'>{hits} success{hits === 1 ? '' : 'es'}</div>
    </> : null}
  </ActionModal>
}

export default ActivationModal
