// Components
import PointEntryBox from './PointEntryBox'

// Internal imports
import { EditMode } from '../lib/util'
import caltrops from '../lib/caltrops'
import { Power, Dictionary } from '../lib/rules'
import ObjectService from '../lib/objectservice'

/* 
 * Power table.
 *   in: powers <- rules.powers for power metadata
 *   in: skillScores <- sheet.skills
 *   in: powerDice <- sheet.powers
 *   out: setPowerDice -> sheet.powers
 */

function PowerTable({powers, skillScores, service, editable=EditMode.Live}: {
    powers: Power[],
    skillScores: Dictionary<number>,
    service: ObjectService,
    editable?: EditMode,
  }): JSX.Element {

  const powerDice: Dictionary<number> = service.subscribe()

  return (
    <div>
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Power</th>
            <th>Skill</th>
            <th>Dice</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          powers.map(power => {
            let diceMax = caltrops.powerDiceMax(power, skillScores)
            return <tr key={power.name}>
              <td>{power.name}</td>
              <td>{skillScores[power.source ?? power.name] ?? 0}</td>
              <td> <PointEntryBox
                value={powerDice[power.name] ?? 0}
                setValue={v => { service.set_key(power.name, v) }}
                max={diceMax}
                editable={editable >= EditMode.Live}
                />
              </td>
              <td>/ {diceMax}</td>
            </tr>
          })
        }
        </tbody>
      </table>
    </div>
  )
}

export default PowerTable