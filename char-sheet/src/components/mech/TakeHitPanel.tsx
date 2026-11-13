// External imports
import { useState } from 'react'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { findChassis } from '../../lib/mech/loadout'
import { sectionForRoll } from '../../lib/mech/derive'
import { attackModifier } from '../../lib/mech/turn'
import type { Mech } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'
import { applyHit } from './HitModal'

/** Successes minus deflection, then a rolled or aimed location, then the same path as the hit popup. */
function TakeHitPanel({ view, editable }: { view: View, editable: EditMode }): JSX.Element | null {
  const rules: Rules | undefined = useListener(view, 'rules')
  const mech: Mech | undefined = useListener(view, 'mech')
  const [successes, setSuccesses] = useState('3')
  const [deflect, setDeflect] = useState('0')
  const [loc, setLoc] = useState('roll')

  const mechRules = rules?.mechs
  const chassis = mechRules && mech ? findChassis(mechRules, mech.chassis) : undefined
  if (!mechRules || !mech || !chassis) {
    return null
  }
  const m = attackModifier(mechRules, mech)
  const play = editable >= EditMode.Live

  function apply() {
    const n = Math.max(0, (parseInt(successes) || 0) - (parseInt(deflect) || 0))
    const prefix: string[] = []
    let section = chassis!.sections.find(s => s.id === loc)
    if (!section) {
      const d12 = Math.floor(Math.random() * 12) + 1
      section = sectionForRoll(chassis!, d12)
      prefix.push(`Hit location: d12 = ${d12} → ${section.name}.`)
    } else {
      prefix.push(`Aimed hit: ${section.name}.`)
    }
    if (n === 0) {
      prefix.push('Hit fully deflected.')
    }
    applyHit(view, section.id, n, false, prefix)
  }

  return <div className='bg-base-200 border border-base-300 p-2 flex flex-col gap-1'>
    <h4 className='font-bold text-accent'>Take a hit</h4>
    <div className={m.total > 0 ? 'text-warning' : m.total < 0 ? 'text-primary' : 'opacity-60'}>
      Attacker dice {m.total >= 0 ? '+' : ''}{m.total}{m.parts.length ? `: ${m.parts.map(p => `${p.value > 0 ? '+' : ''}${p.value} ${p.label}`).join(', ')}` : ''}
    </div>
    <div className='flex items-center gap-2'>
      <label>Successes <input type='number' min={0} className='input input-bordered input-xs w-14' aria-label='Successes'
        value={successes} onChange={e => setSuccesses(e.target.value)} disabled={!play}/></label>
      <label>Deflect <input type='number' min={0} className='input input-bordered input-xs w-14' aria-label='Deflect'
        value={deflect} onChange={e => setDeflect(e.target.value)} disabled={!play}/></label>
    </div>
    <div className='flex items-center gap-2'>
      <select className='select select-bordered select-xs flex-1' aria-label='Hit location' value={loc}
        onChange={e => setLoc(e.target.value)} disabled={!play}>
        <option value='roll'>Roll d12 location</option>
        {chassis.sections.map(s => <option key={s.id} value={s.id}>Aimed: {s.name}</option>)}
      </select>
      <button className='btn btn-xs btn-error' disabled={!play} onClick={apply}>Apply</button>
    </div>
    <div className='opacity-60'>Click wound boxes or armour pips to adjust by hand.</div>
  </div>
}

export default TakeHitPanel
