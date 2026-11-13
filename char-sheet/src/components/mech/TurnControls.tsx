// Internal imports
import { View, useListener } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'
import { deriveStats, overheated } from '../../lib/mech/derive'
import { newTurn, shutdownPurge, sprint } from '../../lib/mech/turn'
import { logMech } from '../../lib/mech/store'
import type { Mech, MechResult, MechRules } from '../../lib/mech/types'
import type { Rules } from '../../lib/rules'
import { roller } from './roller'

const noDice = () => []

/** Sprint, shut down and new turn buttons, plus the OVERHEATED prompt. */
function TurnControls({ view, editable }: { view: View, editable: EditMode }): JSX.Element | null {
  const mech: Mech | undefined = useListener(view, 'mech')
  const rules: Rules | undefined = useListener(view, 'rules')
  const mechRules: MechRules | undefined = rules?.mechs
  if (!mech || !mechRules) {
    return null
  }

  const play = editable >= EditMode.Live
  const t = mech.turn
  const stats = deriveStats(mechRules, mech)

  function run(fn: (m: Mech) => MechResult) {
    const { mech: next, events } = fn(mech!)
    view.publish('mech', next)
    logMech(view, events)
  }
  // The pure functions return no events when an action is not allowed; use that to disable the button.
  const allowed = (fn: (m: Mech) => MechResult) => fn(mech).events.length > 0

  const doSprint = (m: Mech) => sprint(mechRules, m, noDice)
  const doPurge = (m: Mech) => shutdownPurge(mechRules, m)
  const doNew = (m: Mech) => newTurn(mechRules, m)

  const hot = overheated(mechRules, mech)

  return <>
    <div className='flex flex-wrap items-center gap-2'>
      <button className='btn btn-xs btn-outline' disabled={!play || !allowed(doSprint)} onClick={() => run(m => sprint(mechRules, m, roller))}>
        Sprint ({mechRules.sprint.energy}E +{mechRules.sprint.heat}H)
      </button>
      <button className='btn btn-xs btn-error' disabled={!play || !allowed(doPurge)} onClick={() => run(doPurge)}>Shut down &amp; purge</button>
      <button className='btn btn-xs btn-success' disabled={!play || !allowed(doNew)} onClick={() => run(doNew)}>New turn ▶</button>
    </div>
    {hot && !t.shutdown && !t.out ? <div className='border border-error bg-error/10 p-2 flex flex-wrap items-center gap-2'>
      <span><b>OVERHEATED: heat {t.heat}/{stats.heatMax}.</b> Every further action rolls d4s equal to the overage after it, as self-damage to that part.</span>
      <button className='btn btn-xs btn-error' disabled={!play} onClick={() => run(doPurge)}>
        Shut down &amp; purge (ends turn, −{stats.cooling} heat)
      </button>
    </div> : null}
  </>
}

export default TurnControls
