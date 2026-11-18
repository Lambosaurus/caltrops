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
import { attack, gunBand, planCost, rangePenalty, shotsBlocker, TARGET_BANDS, weaponRoll, weaponTags, type AttackCounts } from '../../lib/mech/turn'
import type { Mech, ShotKind, TargetBand, Volley } from '../../lib/mech/types'
import { mechSkillPath } from '../../lib/mech/roll'
import type { Dictionary, Rules } from '../../lib/rules'
import { roller } from './roller'
import { showResult } from './notify'

const signed = (n: number) => (n >= 0 ? '+' : '') + n

/** Rolls a d12 hit-location die. */
export const rollD12 = (): number => Math.floor(Math.random() * 12) + 1

export interface AttackTarget { kind: ShotKind, key: string /* the weapon that fires */ }

interface Result { volley: Volley, dice: number[] | null /* null: rolled in the VTT */, d12: number | null, tags: string[], short: boolean }

/**
 * The attack dialog for one weapon. Pick the target's band and, for a Repeating weapon, how many shots ([1] [2] [3]);
 * a choice the mech cannot make is disabled and says why on hover. The roll is the pilot's aspect + skill + the
 * weapon's dice for each shot + the bonus, with the weapon's tags and a d12 hit location.
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
  const skills: Dictionary<number> | undefined = useListener(view, mechSkillPath(rules))
  const [shots, setShots] = useState(1)
  const [band, setBand] = useState(null as TargetBand | null)
  const [bonus, setBonus] = useState(0)
  const [done, setDone] = useState(null as Result | null)

  useEffect(() => {
    setShots(1)
    setBand(null)
    setBonus(0)
    setDone(null)
  }, [target?.kind, target?.key])

  const mr = rules.mechs
  if (!target || !mech || !mr) {
    return null
  }
  const { kind, key } = target
  const chassis = findChassis(mr, mech.chassis)
  const [sectionId, start] = key.split(':')
  const mount = mech.sections[sectionId]?.mounts.find(x => x.start === Number(start))
  const att = mount ? findAttachment(mr, mount.name) : undefined
  if (!att) {
    return null
  }
  const section = chassis?.sections.find(s => s.id === sectionId)?.name ?? sectionId
  // Default band: the weapon's own band (no penalty). Melee is always Engaged.
  const own = att.range && att.range !== 'Melee' ? att.range as TargetBand : undefined
  const targetBand: TargetBand = kind === 'strike' ? 'Engaged' : band ?? own ?? 'Mid'
  const bands = kind === 'strike' ? ['Engaged' as TargetBand] : TARGET_BANDS
  const counts: AttackCounts = { [key]: shots }

  const scores: Dictionary<number> = mode === 'mech' ? {} : { ...(attributes ?? {}), ...(skills ?? {}) }
  const cost = planCost(mr, mech, counts)
  const options = Array.from({ length: att.repeat ?? 1 }, (_, i) => i + 1)
  const per = att.roll?.bonus ?? 0
  const pen = rangePenalty(att, targetBand)
  const fireWhy = done ? null : shotsBlocker(mr, mech, {}, key, shots, targetBand)
  const tags = weaponTags(mr, att.name)

  function fire(toVtt: boolean) {
    if (!mech || !mr || fireWhy) return
    const res = attack(mr, mech, targetBand, counts, roller)
    view.publish('mech', res.mech)
    showResult(res, mech.name)
    const v = res.volleys[0]
    const base = v && weaponRoll(rules, v, targetBand, scores)
    if (!v || !base) {
      close()
      return
    }
    const roll = { ...base, bonus: (base.bonus ?? 0) + bonus }
    const short = v.shots < shots
    if (toVtt && foundry.isPresent()) {
      const what = `${v.name}${v.shots > 1 ? ` ×${v.shots}` : ''} at ${targetBand}`
      foundry.submitRoll(roll, { detail: [what, tags.join(', ')].filter(Boolean).join(' · '), location: true })
      setDone({ volley: v, dice: null, d12: null, tags, short })
    } else {
      setDone({ volley: v, dice: caltrops.rollDice(roll), d12: rollD12(), tags, short })
    }
  }

  const info = weaponRoll(rules, { key, name: att.name, shots, dice: per, penalty: pen }, targetBand, scores)
  const total = info ? Math.max(0, caltrops.rollDiceCount(info) + bonus) : 0

  const actions: ModalActionInfo[] = done
    ? [{ name: 'Done', type: 'primary', callback: () => {} }]
    : [
        { name: 'Cancel', callback: () => {} },
        { name: 'Fire', type: 'primary', disabled: !!fireWhy, callback: () => fire(false), stayOpen: true },
        ...(foundry.isPresent()
          ? [{ name: 'Send to VTT', type: 'primary', disabled: !!fireWhy, callback: () => fire(true), stayOpen: true } as ModalActionInfo]
          : []),
      ]

  const hits = done?.dice ? done.dice.filter(d => d >= 4).length : 0
  return <ActionModal open={true} close={close} title={kind === 'strike' ? `${att.name} (melee)` : att.name} actions={actions}>
    {done ? <div className='flex flex-col gap-2 my-2' data-testid={`result-${key}`}>
      <div className='flex justify-between font-bold'>
        <span>{done.volley.name}{done.volley.shots > 1 ? ` ×${done.volley.shots}` : ''} at {targetBand}</span>
        {done.dice ? <span>{hits} success{hits === 1 ? '' : 'es'} · <span data-testid='shot-d12'>d12 {done.d12}</span></span>
          : <span data-testid='shot-vtt'>Rolled in the VTT, with its d12</span>}
      </div>
      {done.dice ? <DiceResult dice={done.dice}/> : null}
      {done.tags.length ? <div className='text-xs opacity-70'>{done.tags.join(', ')}</div> : null}
      {done.short ? <div className='text-xs text-warning'>Fired {done.volley.shots} of {shots}: it ran out partway.</div> : null}
    </div> : <div className='my-2 flex flex-col gap-1'>
      <div className='opacity-60'>
        {section} · {signed(per)} dice/shot{pen ? `, −${pen} at ${gunBand(targetBand)}` : ''} · {att.energy ?? 0}E {signed(att.heat ?? 0)}H
        {tags.length ? ` · ${tags.join(', ')}` : ''}
      </div>
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

      {options.length > 1 ? <div className='flex items-center gap-2'>
        <span>Shots</span>
        <span className='flex gap-0.5' role='group' aria-label={`${att.name} shots`}>
          {options.map(k => {
            const why = k === shots ? null : shotsBlocker(mr, mech, {}, key, k, targetBand)
            return <Why key={k} why={why}>
              <button
                type='button'
                className={`btn btn-xs rounded-none px-2 min-w-[1.75rem] ${k === shots ? 'btn-primary' : 'btn-outline'} ${why ? 'pointer-events-none' : ''}`}
                aria-label={`${att.name} ${k} shot${k === 1 ? '' : 's'}`}
                aria-pressed={k === shots}
                disabled={!!why}
                onClick={() => setShots(k)}
              >{k}</button>
            </Why>
          })}
        </span>
      </div> : null}

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
      <div className='flex justify-between font-bold' data-testid={`roll-${key}`}>
        <span>{att.name}{shots > 1 ? ` ×${shots}` : ''}{info && mode !== 'mech' ? <span className='font-normal opacity-60'> · {info.attribute!.name} + {info.skill!.name}</span> : null}</span>
        <span>{total}d4 + d12</span>
      </div>
      {fireWhy ? <div className='text-warning' data-testid='fire-why'>{fireWhy}</div> : null}
      <div className='opacity-60'>Costs {cost.energy} of {mech.turn.energy} energy, {signed(cost.heat)} heat.</div>
    </div>}
  </ActionModal>
}

export default ShotModal
