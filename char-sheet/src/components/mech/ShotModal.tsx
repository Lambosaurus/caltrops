// External imports
import { useEffect, useState } from 'react'

// Components
import ActionModal, { ModalActionInfo } from '../ActionModal'
import DiceResult from '../DiceResult'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import caltrops from '../../lib/caltrops'
import foundry from '../../lib/foundry'
import { findAttachment, findChassis } from '../../lib/mech/loadout'
import { activationBlocker, attack, planCost, planParts, shotRoll, shotTags, weaponKeys, type AttackCounts } from '../../lib/mech/turn'
import type { Mech, RangeBand, ShotKind } from '../../lib/mech/types'
import type { Dictionary, Rules } from '../../lib/rules'
import { roller } from './roller'
import { showResult } from './notify'

const BANDS: RangeBand[] = ['Short', 'Mid', 'Long']
const signed = (n: number) => (n >= 0 ? '+' : '') + n

/** Rolls a d12 hit-location die. */
export const rollD12 = (): number => Math.floor(Math.random() * 12) + 1

export interface AttackTarget { kind: ShotKind, key?: string /* weapon to start with one activation selected */ }

/**
 * The turn's ranged shot or melee strike in one dialog: choose the range and how many activations of each weapon,
 * add one bonus (locks, Sitting Duck, aiming, or the pilot's dice on a standalone mech), and fire. Firing pays every
 * activation's costs and rolls the pilot's dice + all weapon dice + the bonus once, with a d12 location die.
 */
function ShotModal({ rules, view, target, close }: {
    rules: Rules,
    view: View, // root
    target: AttackTarget | null,
    close(): void,
  }): JSX.Element | null {
  const mech: Mech | undefined = useListener(view, 'mech')
  const mode: string | undefined = useListener(view, 'mode')
  const attributes: Dictionary<number> | undefined = useListener(view, 'sheet/attributes')
  const skills: Dictionary<number> | undefined = useListener(view, 'sheet/skills')
  const [counts, setCounts] = useState({} as AttackCounts)
  const [band, setBand] = useState(null as RangeBand | null)
  const [bonus, setBonus] = useState(0)
  // dice null: the roll went to the VTT, which rolls the d4s and the d12 itself.
  const [done, setDone] = useState(null as { dice: number[] | null, d12: number | null, lines: string[], tags: string[] } | null)

  useEffect(() => {
    setCounts(target?.key ? { [target.key]: 1 } : {})
    setBand(null)
    setBonus(0)
    setDone(null)
  }, [target?.kind, target?.key])

  const mr = rules.mechs
  if (!target || !mech || !mr) {
    return null
  }
  const kind = target.kind
  const chassis = findChassis(mr, mech.chassis)
  const keys = weaponKeys(mr, mech, kind)
  const attOf = (key: string) => {
    const [sectionId, start] = key.split(':')
    const m = mech.sections[sectionId]?.mounts.find(x => x.start === Number(start))
    return { att: m ? findAttachment(mr, m.name) : undefined, mount: m, section: chassis?.sections.find(s => s.id === sectionId)?.name ?? sectionId }
  }
  // Default band: the first selected weapon's own band (no penalty).
  const firstRange = Object.keys(counts).map(k => attOf(k).att?.range).find(r => r && r !== 'Melee') as RangeBand | undefined
  const shotBand: RangeBand = kind === 'strike' ? 'Short' : band ?? firstRange ?? 'Mid'

  const scores: Dictionary<number> = mode === 'mech' ? {} : { ...(attributes ?? {}), ...(skills ?? {}) }
  const parts = planParts(mr, mech, counts, shotBand)
  const info = shotRoll(rules, parts, kind, shotBand, scores)
  const total = info ? Math.max(0, caltrops.rollDiceCount(info) + bonus) : 0
  const cost = planCost(mr, mech, counts)
  const firedAlready = !!mech.turn.fired[kind]

  function setCount(key: string, n: number) {
    setCounts(c => {
      const next = { ...c, [key]: n }
      if (!n) delete next[key]
      return next
    })
  }

  function fire(toVtt: boolean) {
    if (!mech || !mr || !parts.length) return
    const res = attack(mr, mech, kind, shotBand, counts, roller)
    view.publish('mech', res.mech)
    showResult(res, mech.name)
    const base = shotRoll(rules, res.parts, kind, shotBand, scores)
    if (!base) return
    const roll = { ...base, bonus: (base.bonus ?? 0) + bonus }
    const tags = shotTags(mr, res.parts)
    const lines = res.parts.length < parts.length ? [`Only ${res.parts.length} of ${parts.length} activations could fire.`] : []
    if (toVtt && foundry.isPresent()) {
      const weapons = Array.from(new Set(res.parts.map(p => p.name))).join(', ')
      const what = kind === 'shot' ? `Ranged shot at ${shotBand}` : 'Melee strike'
      foundry.submitRoll(roll, { detail: [what, weapons, tags.join(', ')].filter(Boolean).join(' · '), location: true })
      setDone({ dice: null, d12: null, lines, tags })
      return
    }
    setDone({ dice: caltrops.rollDice(roll), d12: rollD12(), lines, tags })
  }

  const actions: ModalActionInfo[] = done
    ? [{ name: 'Done', type: 'primary', callback: () => {} }]
    : [
        { name: 'Cancel', callback: () => {} },
        { name: `Fire: ${total}d4 + d12`, type: 'primary', disabled: !parts.length || firedAlready, callback: () => fire(false), stayOpen: true },
        ...(foundry.isPresent()
          ? [{ name: 'Send to VTT', type: 'primary', disabled: !parts.length || firedAlready, callback: () => fire(true), stayOpen: true } as ModalActionInfo]
          : []),
      ]
  const hits = done?.dice ? done.dice.filter(d => d >= 4).length : 0

  return <ActionModal open={true} close={close} title={kind === 'shot' ? 'Ranged shot' : 'Melee strike'} actions={actions}>
    {done ? <>
      {done.dice ? <>
        <DiceResult dice={done.dice}/>
        <div className='text-center font-bold'>{hits} success{hits === 1 ? '' : 'es'}</div>
        <div className='text-center font-bold text-lg mt-2' data-testid='shot-d12'>Location d12: {done.d12}</div>
      </> : <div className='text-center font-bold' data-testid='shot-vtt'>Sent to the VTT: the d4s and the d12 location are rolled there.</div>}
      {done.tags.length ? <div className='text-center opacity-70 mt-1'>{done.tags.join(', ')}</div> : null}
      {done.lines.map(l => <div key={l} className='text-center text-warning'>{l}</div>)}
    </> : <div className='my-2 flex flex-col gap-1'>
      {firedAlready ? <div className='text-error'>This turn's {kind === 'shot' ? 'shot' : 'strike'} is already made.</div> : null}
      {kind === 'shot' ? <div className='flex items-center gap-2'>
        <span>Range</span>
        {BANDS.map(b => <button
          key={b}
          type='button'
          className={`btn btn-xs rounded-none ${b === shotBand ? 'btn-primary' : 'btn-outline'}`}
          aria-pressed={b === shotBand}
          onClick={() => setBand(b)}
        >{b}</button>)}
      </div> : null}

      {keys.length ? keys.map(key => {
        const { att, mount, section } = attOf(key)
        if (!att || !mount) return null
        const n = counts[key] ?? 0
        const max = Math.min((att.repeat ?? 1) - (mech.turn.used[key] ?? 0), att.charges ? mount.charges ?? 0 : 99)
        const blocker = activationBlocker(mr, mech, key, shotBand)
        const canAdd = !blocker && n < max && cost.energy + (att.energy ?? 0) <= mech.turn.energy
        const dice = (att.roll?.bonus ?? 0) - (planParts(mr, mech, { [key]: 1 }, shotBand)[0]?.penalty ?? 0)
        return <div key={key} className='flex items-center gap-2 border-t border-dashed border-base-300 pt-1'>
          <span className='flex-1 min-w-0'>
            <span className={blocker && !n ? 'opacity-50' : ''}>{att.name}</span>
            <span className='opacity-60'> · {section} · {signed(dice)} dice, {att.energy ?? 0}E {signed(att.heat ?? 0)}H{(att.repeat ?? 1) > 1 ? ` each, up to ${att.repeat}` : ''}</span>
            {blocker && !n ? <div className='text-[10px] text-error'>{blocker}</div> : null}
          </span>
          <button className='btn btn-xs btn-outline px-2' aria-label={`${att.name} fewer`} disabled={!n} onClick={() => setCount(key, n - 1)}>−</button>
          <span className='w-4 text-center' data-testid={`count-${key}`}>{n}</span>
          <button className='btn btn-xs btn-outline px-2' aria-label={`${att.name} more`} disabled={!canAdd} onClick={() => setCount(key, n + 1)}>+</button>
        </div>
      }) : <div className='opacity-60'>No {kind === 'shot' ? 'ranged weapons' : 'melee weapons'} fitted.</div>}

      <div className='flex items-center justify-between gap-2 border-t border-base-300 pt-2 mt-1'>
        <span>Bonus <span className='opacity-60'>(+ or −)</span></span>
        <span className='flex items-center gap-1'>
          <button className='btn btn-xs btn-outline px-2' aria-label='Bonus minus' onClick={() => setBonus(bonus - 1)}>−</button>
          <input
            type='number'
            className='input input-bordered input-xs w-16 text-center'
            aria-label='Bonus'
            value={bonus}
            onChange={e => setBonus(Number(e.target.value) || 0)}
          />
          <button className='btn btn-xs btn-outline px-2' aria-label='Bonus plus' onClick={() => setBonus(bonus + 1)}>+</button>
        </span>
      </div>
      <div className='flex justify-between font-bold'>
        <span>{info && mode !== 'mech' ? `${info.attribute!.name} ${info.attribute!.score} + ${info.skill!.name} ${info.skill!.score} + weapons ${signed(info.bonus ?? 0)}` : `Weapons ${signed(info?.bonus ?? 0)}`}{bonus ? ` ${signed(bonus)}` : ''}</span>
        <span>{total}d4 + d12</span>
      </div>
      <div className='opacity-60'>Costs {cost.energy} of {mech.turn.energy} energy, {signed(cost.heat)} heat.</div>
    </div>}
  </ActionModal>
}

export default ShotModal
