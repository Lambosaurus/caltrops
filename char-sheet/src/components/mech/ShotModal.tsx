// External imports
import { useEffect, useState } from 'react'

// Components
import ActionModal, { ModalActionInfo } from '../ActionModal'
import DiceResult from '../DiceResult'
import { Why } from './Popover'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import caltrops from '../../lib/caltrops'
import foundry from '../../lib/foundry'
import { findAttachment, findChassis } from '../../lib/mech/loadout'
import { attack, gunBand, planCost, rangePenalty, shotsBlocker, TARGET_BANDS, weaponKeys, weaponRoll, weaponTags, type AttackCounts } from '../../lib/mech/turn'
import type { Mech, ShotKind, TargetBand, Volley } from '../../lib/mech/types'
import type { Dictionary, Rules } from '../../lib/rules'
import { roller } from './roller'
import { showResult } from './notify'

const signed = (n: number) => (n >= 0 ? '+' : '') + n

/** Rolls a d12 hit-location die. */
export const rollD12 = (): number => Math.floor(Math.random() * 12) + 1

export interface AttackTarget { kind: ShotKind, key?: string /* weapon to start with one shot picked */ }

interface Result { volley: Volley, dice: number[] | null /* null: rolled in the VTT */, d12: number | null, tags: string[], short: boolean }

/**
 * The attack dialog. Pick the target's band, then how many shots each weapon fires ([1] [2] [3] for Repeating
 * weapons); a choice the mech cannot afford is disabled and says why on hover. Each weapon rolls on its own: the
 * pilot's aspect + skill + that weapon's dice for each shot + the bonus, with its own tags and d12 hit location.
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
  const [band, setBand] = useState(null as TargetBand | null)
  const [bonus, setBonus] = useState(0)
  const [done, setDone] = useState(null as Result[] | null)

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
    return { att: m ? findAttachment(mr, m.name) : undefined, section: chassis?.sections.find(s => s.id === sectionId)?.name ?? sectionId }
  }
  // Default band: the first picked weapon's own band (no penalty). Melee is always Engaged.
  const firstRange = Object.keys(counts).map(k => attOf(k).att?.range).find(r => r && r !== 'Melee') as TargetBand | undefined
  const targetBand: TargetBand = kind === 'strike' ? 'Engaged' : band ?? firstRange ?? 'Mid'
  const bands = kind === 'strike' ? ['Engaged' as TargetBand] : TARGET_BANDS

  const scores: Dictionary<number> = mode === 'mech' ? {} : { ...(attributes ?? {}), ...(skills ?? {}) }
  const picked = Object.entries(counts).filter(([, n]) => n > 0)
  const cost = planCost(mr, mech, counts)

  function pick(key: string, n: number) {
    setCounts(c => {
      const next = { ...c }
      if (!n || c[key] === n) delete next[key] // clicking the picked number again clears it
      else next[key] = n
      return next
    })
  }

  function fire(toVtt: boolean) {
    if (!mech || !mr || !picked.length) return
    const res = attack(mr, mech, targetBand, counts, roller)
    view.publish('mech', res.mech)
    showResult(res, mech.name)
    const vtt = toVtt && foundry.isPresent()
    const out: Result[] = []
    for (const v of res.volleys) {
      const base = weaponRoll(rules, v, targetBand, scores)
      if (!base) continue
      const roll = { ...base, bonus: (base.bonus ?? 0) + bonus }
      const tags = weaponTags(mr, v.name)
      const short = v.shots < (counts[v.key] ?? 0)
      if (vtt) {
        const what = `${v.name}${v.shots > 1 ? ` ×${v.shots}` : ''} at ${targetBand}`
        foundry.submitRoll(roll, { detail: [what, tags.join(', ')].filter(Boolean).join(' · '), location: true })
        out.push({ volley: v, dice: null, d12: null, tags, short })
      } else {
        out.push({ volley: v, dice: caltrops.rollDice(roll), d12: rollD12(), tags, short })
      }
    }
    setDone(out)
  }

  const noneReason = !picked.length ? 'Pick at least one shot.' : null
  const actions: ModalActionInfo[] = done
    ? [{ name: 'Done', type: 'primary', callback: () => {} }]
    : [
        { name: 'Cancel', callback: () => {} },
        { name: picked.length > 1 ? `Fire ${picked.length} weapons` : 'Fire', type: 'primary', disabled: !!noneReason, callback: () => fire(false), stayOpen: true },
        ...(foundry.isPresent()
          ? [{ name: 'Send to VTT', type: 'primary', disabled: !!noneReason, callback: () => fire(true), stayOpen: true } as ModalActionInfo]
          : []),
      ]

  return <ActionModal open={true} close={close} title={kind === 'shot' ? 'Ranged attack' : 'Melee attack'} actions={actions}>
    {done ? <div className='flex flex-col gap-2 my-2'>
      {done.map(r => {
        const hits = r.dice ? r.dice.filter(d => d >= 4).length : 0
        return <div key={r.volley.key} className='border border-base-300 p-2' data-testid={`result-${r.volley.key}`}>
          <div className='flex justify-between font-bold'>
            <span>{r.volley.name}{r.volley.shots > 1 ? ` ×${r.volley.shots}` : ''}</span>
            {r.dice ? <span>{hits} success{hits === 1 ? '' : 'es'} · <span data-testid='shot-d12'>d12 {r.d12}</span></span>
              : <span data-testid='shot-vtt'>Rolled in the VTT, with its d12</span>}
          </div>
          {r.dice ? <DiceResult dice={r.dice}/> : null}
          {r.tags.length ? <div className='text-xs opacity-70'>{r.tags.join(', ')}</div> : null}
          {r.short ? <div className='text-xs text-warning'>Fired {r.volley.shots} of {counts[r.volley.key]}: it ran out partway.</div> : null}
        </div>
      })}
      {!done.length ? <div className='text-warning'>Nothing could fire.</div> : null}
    </div> : <div className='my-2 flex flex-col gap-1'>
      <div className='flex items-center gap-2'>
        <span>Target</span>
        {bands.map(b => <button
          key={b}
          type='button'
          className={`btn btn-xs rounded-none ${b === targetBand ? 'btn-primary' : 'btn-outline'}`}
          aria-pressed={b === targetBand}
          onClick={() => setBand(b)}
        >{b}</button>)}
      </div>

      {keys.length ? keys.map(key => {
        const { att, section } = attOf(key)
        if (!att) return null
        const n = counts[key] ?? 0
        const options = Array.from({ length: att.repeat ?? 1 }, (_, i) => i + 1)
        const per = att.roll?.bonus ?? 0
        const pen = rangePenalty(att, targetBand)
        const rowBlock = shotsBlocker(mr, mech, {}, key, 1, targetBand)
        return <div key={key} className='flex items-center gap-2 border-t border-dashed border-base-300 pt-1'>
          <span className='flex-1 min-w-0'>
            <span className={rowBlock && !n ? 'opacity-50' : 'font-bold'}>{att.name}</span>
            <span className='opacity-60'> · {section} · {signed(per)} dice/shot{pen ? `, −${pen} at ${gunBand(targetBand)}` : ''} · {att.energy ?? 0}E {signed(att.heat ?? 0)}H</span>
          </span>
          <span className='flex gap-0.5' role='group' aria-label={`${att.name} shots`}>
            {options.map(k => {
              const why = k === n ? null : shotsBlocker(mr, mech, counts, key, k, targetBand)
              return <Why key={k} why={why}>
                <button
                  type='button'
                  className={`btn btn-xs rounded-none px-2 min-w-[1.75rem] ${k === n ? 'btn-primary' : 'btn-outline'} ${why ? 'pointer-events-none' : ''}`}
                  aria-label={`${att.name} ${k} shot${k === 1 ? '' : 's'}`}
                  aria-pressed={k === n}
                  disabled={!!why}
                  onClick={() => pick(key, k)}
                >{k}</button>
              </Why>
            })}
          </span>
        </div>
      }) : <div className='opacity-60'>No {kind === 'shot' ? 'ranged' : 'melee'} weapons fitted.</div>}

      <div className='flex items-center justify-between gap-2 border-t border-base-300 pt-2 mt-1'>
        <span>Bonus <span className='opacity-60'>(+ or −, each roll)</span></span>
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
      {picked.map(([key, shots]) => {
        const att = attOf(key).att
        if (!att) return null
        const info = weaponRoll(rules, { key, name: att.name, shots, dice: att.roll?.bonus ?? 0, penalty: rangePenalty(att, targetBand) }, targetBand, scores)
        const total = info ? Math.max(0, caltrops.rollDiceCount(info) + bonus) : 0
        return <div key={key} className='flex justify-between font-bold' data-testid={`roll-${key}`}>
          <span>{att.name}{shots > 1 ? ` ×${shots}` : ''}{info && mode !== 'mech' ? <span className='font-normal opacity-60'> · {info.attribute!.name} + {info.skill!.name}</span> : null}</span>
          <span>{total}d4 + d12</span>
        </div>
      })}
      <div className='opacity-60'>Costs {cost.energy} of {mech.turn.energy} energy, {signed(cost.heat)} heat.</div>
    </div>}
  </ActionModal>
}

export default ShotModal
