// Components
import PointEntryBox from './PointEntryBox'

// Internal imports
import { EditMode } from '../lib/util'
import caltrops from '../lib/caltrops'
import { Power, Dictionary } from '../lib/rules'
import { View, useListener } from '../lib/objectservice'

/* 
 * Power table.
 *   in: powers <- rules.powers for power metadata
 *   in: skillScores <- sheet.skills
 *   in: powerDice <- sheet.powers
 *   out: setPowerDice -> sheet.powers
 */

function PowerTable({powers, skillView, powerView, editable=EditMode.Live}: {
    powers: Power[],
    skillView: View,
    powerView: View,
    editable?: EditMode,
  }): JSX.Element | null {

  
  const powerDice: Dictionary<number> = useListener(powerView)
  const skillScores: Dictionary<number> = useListener(skillView)

  powers = powers.filter( p => caltrops.powerIsAvailable(p, skillScores) )

  if (!powers.length)
    return null;

  return (
    <div>
      <table className="table table-compact w-80">
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
                setValue={v => { powerView.publish(power.name, v) }}
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