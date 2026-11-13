// Components
import EquipmentTable from '../EquipmentTable'

// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { findChassis } from '../../lib/mech/loadout'
import { deriveStats } from '../../lib/mech/derive'
import type { Mech, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'

/*
 * The mech's stowage as an inventory table. `view` is the root view; `editable` is the effective mech edit mode.
 * Renders nothing without a loaded mech whose chassis is known.
 */
function MechStowage({ view, editable, title }: {
    view: View,
    editable: EditMode,
    title?: string,
  }): JSX.Element | null {

  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const mechRules: MechRules | undefined = rules?.mechs
  if (!mech || !rules || !mechRules || !findChassis(mechRules, mech.chassis)) {
    return null
  }
  const stats = deriveStats(mechRules, mech)
  const container = { name: 'Stowage', size: stats.stowage, tags: ['handheld', 'custom'] }
  return <EquipmentTable
    equipment={rules.equipment}
    container={container}
    view={view.view('mech/equipment/Stowage')}
    editable={editable}
    title={title}
  />
}

export default MechStowage
