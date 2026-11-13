// External imports
import { useEffect, useState } from 'react'

// Components
import ActionModal from '../ActionModal'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { findChassis } from '../../lib/mech/loadout'
import { applyWounds, markWounds } from '../../lib/mech/damage'
import type { Mech, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'
import { roller } from './roller'
import { showNotices } from './notify'

/**
 * Apply `count` wounds to a section and publish the result. With autoHitDamage on, the full rules apply
 * (overflow, cook-off); off, wounds are only marked in that section.
 */
export function applyHit(view: View, sectionId: string, count: number, ignoreArmour: boolean): void {
  const rules: MechRules | undefined = (view.read('rules') as Rules | undefined)?.mechs
  const mech: Mech | undefined = view.read('mech')
  if (!rules || !mech) {
    return
  }
  const { mech: next, notices } = mech.settings.autoHitDamage
    ? applyWounds(rules, mech, sectionId, count, { ignoreArmour, cookoff: mech.settings.autoCookoff, roller })
    : markWounds(rules, mech, sectionId, count, ignoreArmour)
  view.publish('mech', next)
  showNotices(notices)
}

/** Popup for hitting one section: wound count and ignores armour. */
function HitModal({ view, sectionId, close }: { view: View, sectionId: string | null, close(): void }): JSX.Element | null {
  const rules: Rules | undefined = useListener(view, 'rules')
  const mech: Mech | undefined = useListener(view, 'mech')
  const [count, setCount] = useState('1')
  const [ignore, setIgnore] = useState(false)

  useEffect(() => {
    if (sectionId) {
      setCount('1')
      setIgnore(false)
    }
  }, [sectionId])

  const mechRules = rules?.mechs
  if (!mechRules || !mech || !sectionId) {
    return null
  }
  const section = findChassis(mechRules, mech.chassis)?.sections.find(s => s.id === sectionId)
  const n = Math.max(0, parseInt(count) || 0)

  function apply() {
    applyHit(view, sectionId!, n, ignore)
    close()
  }

  return <ActionModal
    open={true}
    close={close}
    title={`Hit: ${section?.name ?? sectionId}`}
    actions={[
      { name: 'Cancel', callback: () => {} },
      { name: 'Apply', type: 'error', callback: apply, stayOpen: true },
    ]}
  >
    <div className='my-2 opacity-70'>
      Wounds to apply here. {mech.settings.autoHitDamage
        ? 'Armour soaks first, then slots top-down; overflow passes on when the section is destroyed.'
        : 'Armour soaks first, then slots top-down; nothing carries over.'}
    </div>
    <label className='flex items-center gap-2 my-2'>
      Wounds
      <input
        autoFocus
        type='number'
        min={0}
        className='input input-bordered input-sm w-20'
        aria-label='Wounds'
        value={count}
        onChange={e => setCount(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') apply()
          if (e.key === 'Escape') close()
        }}
      />
    </label>
    <label className='flex items-center gap-2 my-2'>
      <input type='checkbox' className='checkbox checkbox-sm' checked={ignore} onChange={e => setIgnore(e.target.checked)}/>
      Ignores armour
    </label>
  </ActionModal>
}

export default HitModal
