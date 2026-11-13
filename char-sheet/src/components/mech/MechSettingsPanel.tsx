// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import type { Mech, MechSettings } from '../../lib/mech/types'

const OPTIONS: [keyof MechSettings, string][] = [
  ['autoAmmo', 'Spend ammo on activation'],
  ['autoHeatDamage', 'Roll and apply overheat damage'],
  ['autoCookoff', 'Roll and apply ammo cook-off'],
  ['autoHitDamage', 'Apply hit damage to sections'],
]

/** Automation checkboxes. Each writes mech/settings/<key>. */
function MechSettingsPanel({ view, editable }: { view: View, editable: EditMode }): JSX.Element | null {
  const mech: Mech | undefined = useListener(view, 'mech')
  if (!mech) {
    return null
  }
  return <div className='bg-base-200 border border-base-300 p-2'>
    <h4 className='font-bold text-accent mb-1'>Automation</h4>
    {OPTIONS.map(([key, label]) =>
      <label key={key} className='flex items-center gap-2 cursor-pointer'>
        <input
          type='checkbox'
          className='checkbox checkbox-xs'
          checked={!!mech.settings[key]}
          disabled={editable < EditMode.Live}
          onChange={e => view.publish(`mech/settings/${key}`, e.target.checked)}
        />
        {label}
      </label>
    )}
    <div className='opacity-60 mt-1'>Off: the sheet tells you what to roll and you mark it by hand.</div>
  </div>
}

export default MechSettingsPanel
