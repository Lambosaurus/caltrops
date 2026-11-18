// Internal imports
import { mechEffects } from '../../lib/mech/effects'
import type { Mech, MechRules } from '../../lib/mech/types'

/**
 * The mech's standing effects (defences, sensor bonuses, penalties) from its fitted parts, as the ruleset's
 * `effectTags` name them. An effect whose part is disabled stays listed, struck through, so the loss is visible.
 * Renders nothing when the mech has none.
 */
function MechEffects({ rules, mech }: { rules: MechRules, mech: Mech }): JSX.Element | null {
  const effects = mechEffects(rules, mech)
  if (!effects.length) return null
  return <div className='bg-base-200 border border-base-300 p-2'>
    <h4 className='font-bold text-accent mb-1'>Effects</h4>
    <ul className='grid gap-x-4 gap-y-1 sm:grid-cols-2 xl:grid-cols-3'>
      {effects.map((e, i) =>
        <li key={`${e.part}:${e.section}:${e.tag}:${i}`} className={`min-w-0 ${e.working ? '' : 'opacity-50'}`}>
          <b data-testid={`effect-${e.base}`} className={e.working ? '' : 'line-through'}>{e.tag}</b>
          {e.text ? <> <span>{e.text}</span></> : null}
          <div className='opacity-60'>
            {[e.part, e.section, ...e.notes].join(' · ')}{e.working ? '' : ' · disabled'}
          </div>
        </li>
      )}
    </ul>
  </div>
}

export default MechEffects
