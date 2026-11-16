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
import { fireShot, shotRoll, shotTags, SHOT_LABEL } from '../../lib/mech/turn'
import type { Mech, ShotKind } from '../../lib/mech/types'
import type { Dictionary, RollInfo, Rules } from '../../lib/rules'

const signed = (n: number) => (n >= 0 ? '+' : '') + n

/** Rolls a d12 hit-location die. */
export const rollD12 = (): number => Math.floor(Math.random() * 12) + 1

/**
 * Rolls the pending ranged shot or melee strike: the pilot's aspect + skill once, plus every weapon activation's
 * dice, with the d12 location die rolled alongside (or an aimed shot that pays dice to skip it). `kind` null = closed.
 */
function ShotModal({ rules, view, kind, close }: {
    rules: Rules,
    view: View, // root
    kind: ShotKind | null,
    close(): void,
  }): JSX.Element | null {
  const mech: Mech | undefined = useListener(view, 'mech')
  const mode: string | undefined = useListener(view, 'mode')
  const attributes: Dictionary<number> | undefined = useListener(view, 'sheet/attributes')
  const skills: Dictionary<number> | undefined = useListener(view, 'sheet/skills')
  const [aspectScore, setAspectScore] = useState(0)
  const [skillScore, setSkillScore] = useState(0)
  const [other, setOther] = useState(0)
  const [aim, setAim] = useState(0) // 0 = roll the d12; otherwise dice paid to pick the section
  const [location, setLocation] = useState(true)
  const [done, setDone] = useState(null as { dice: number[], d12: number | null, parts: string[], tags: string[] } | null)

  useEffect(() => {
    setOther(0)
    setAim(0)
    setDone(null)
  }, [kind])

  const mechRules = rules.mechs
  if (!kind || !mech || !mechRules) {
    return null
  }
  const parts = mech.turn[kind]
  if (!parts.length && !done) {
    return null
  }

  const mechMode = mode === 'mech'
  const names = shotRoll(rules, mech, kind, {})
  const scores: Dictionary<number> = mechMode && names
    ? { [names.attribute!.name]: aspectScore, [names.skill!.name]: skillScore }
    : { ...(attributes ?? {}), ...(skills ?? {}) }
  const base = shotRoll(rules, mech, kind, scores)
  const info: RollInfo | null = base ? { ...base, bonus: (base.bonus ?? 0) + other - aim } : null
  const count = info ? Math.max(0, caltrops.rollDiceCount(info)) : 0
  const tags = shotTags(mechRules, mech, kind)
  const title = kind === 'shot' ? `Ranged shot${mech.turn.shotBand ? ` at ${mech.turn.shotBand}` : ''}` : 'Melee strike'

  function roll(toVtt: boolean) {
    if (!mech || !kind || !info) return
    const d12 = location && !aim ? rollD12() : null
    const summary = parts.map(p => `${p.name} ${signed(p.dice - p.penalty)}`)
    view.publish('mech', fireShot(mech, kind))
    if (toVtt && foundry.isPresent()) {
      foundry.submitRoll(info)
    }
    setDone({ dice: toVtt && foundry.isPresent() ? [] : caltrops.rollDice(info), d12, parts: summary, tags })
  }

  const actions: ModalActionInfo[] = []
  if (done) {
    actions.push({ name: 'Done', type: 'primary', callback: () => {} })
  } else {
    actions.push({ name: 'Cancel', callback: () => {} })
    actions.push({ name: `Roll ${count}d4${location && !aim ? ' + d12' : ''}`, type: 'primary', disabled: !info, callback: () => roll(false), stayOpen: true })
    if (foundry.isPresent()) {
      actions.push({ name: 'Send to VTT', type: 'primary', disabled: !info, callback: () => roll(true), stayOpen: true })
    }
  }

  const hits = done ? done.dice.filter(d => d >= 4).length : 0
  const shown = done ? done.parts : parts.map(p => `${p.name} ${signed(p.dice - p.penalty)}${p.penalty ? ` (−${p.penalty} closer band)` : ''}`)
  const shownTags = done ? done.tags : tags

  return <ActionModal open={true} close={close} title={title} actions={actions}>
    <div className='my-2'>
      <div className='opacity-70'>One {SHOT_LABEL[kind]}: the pilot's dice once, plus each activation's dice. All wounds go to one section.</div>
      {shown.map((p, i) => <div key={i}>· {p}</div>)}
      {shownTags.length ? <div className='mt-1'>Tags: {shownTags.join(', ')}</div> : null}
    </div>
    {info && !done ? <div className='my-2'>
      {mechMode ? <>
        <div className='flex justify-between items-center'>
          <span>{info.attribute!.name} (aspect)</span>
          <PointEntryBox value={aspectScore} setValue={setAspectScore} editable={true} min={0} max={9}/>
        </div>
        <div className='flex justify-between items-center'>
          <span>{info.skill!.name} (skill)</span>
          <PointEntryBox value={skillScore} setValue={setSkillScore} editable={true} min={0} max={9}/>
        </div>
      </> : <>
        <div className='flex justify-between'><span>{info.attribute!.name} (aspect)</span><span>{signed(info.attribute!.score)}</span></div>
        <div className='flex justify-between'><span>{info.skill!.name} (skill)</span><span>{signed(info.skill!.score)}</span></div>
      </>}
      <div className='flex justify-between'><span>Weapon dice</span><span>{signed(base?.bonus ?? 0)}</span></div>
      <div className='flex justify-between items-center'>
        <span>Other (locks +1, Sitting Duck +2, Evasion −X…)</span>
        <PointEntryBox value={other} setValue={setOther} editable={true} min={-20} max={20}/>
      </div>
      <div className='flex justify-between items-center'>
        <span>Aimed shot: dice paid (0 = roll the d12)</span>
        <PointEntryBox value={aim} setValue={setAim} editable={true} min={0} max={4}/>
      </div>
      <label className='flex justify-between items-center cursor-pointer'>
        <span>Roll the d12 location die</span>
        <input type='checkbox' className='checkbox checkbox-sm' checked={location && !aim} disabled={!!aim} onChange={e => setLocation(e.target.checked)}/>
      </label>
      <div className='flex justify-between font-bold border-t border-base-300 mt-1 pt-1'>
        <span>Roll</span><span>{count}d4{location && !aim ? ' + d12' : ''}</span>
      </div>
    </div> : null}
    {done ? <>
      {done.dice.length ? <>
        <DiceResult dice={done.dice}/>
        <div className='text-center font-bold'>{hits} success{hits === 1 ? '' : 'es'}</div>
      </> : <div className='text-center'>Sent to the VTT.</div>}
      {done.d12 !== null ? <div className='text-center font-bold text-lg mt-2' data-testid='shot-d12'>Location d12: {done.d12}</div>
        : aim ? <div className='text-center mt-2'>Aimed: the attacker names the section.</div> : null}
    </> : null}
  </ActionModal>
}

export default ShotModal
