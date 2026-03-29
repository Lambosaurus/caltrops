// Components
import PointEntryBox from './PointEntryBox'

// Internal imports
import { EditMode } from '../lib/util'
import caltrops from '../lib/caltrops'
import { Skill, Dictionary } from '../lib/rules'
import { View, useListener } from '../lib/objectservice'


function SkillTable({skills, skillView, maxCostTotal, editable = EditMode.Live, rollView}: {
    skills: Skill[],
    skillView: View,
    maxCostTotal: number,
    editable?: EditMode,
    rollView: View,
  }): JSX.Element {

  const scores: Dictionary<number> = useListener(skillView) ?? {}
  const totalCost = caltrops.skillCostTotal(scores)
  const sparePoints = maxCostTotal - totalCost;

  function startRoll(skill: string): void {
    rollView.publish("skill", {
      name: skill,
      score: scores[skill] ?? 0,
    })
  }

  if (editable !== EditMode.Full) {
    skills = skills.filter(s => caltrops.skillIsRollable(s, scores))
  }

  return (
    <div>
      <table className="table table-compact w-80">
        <thead>
          <tr className='px-2'>
            <th>Skills</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {skills.map(s => {
            let value = scores[s.name] ?? 0
            return(
              <tr className='hover cursor-pointer'
                onClick={editable < EditMode.Full ? () => startRoll(s.name) : undefined}
                key={s.name}
                >
                <td>{s.name}</td>
                <td className='text-center'>
                  <PointEntryBox
                    value={value}
                    setValue={(v) => { skillView.publish(s.name, v) }}
                    editable={editable >= EditMode.Full}
                    isCapped={caltrops.skillIncrementCost(value) > sparePoints}
                    encourageUp={true}
                  />
                </td>
              </tr>
          )})}
        </tbody>
        <tfoot>
          <tr className='px-2 text-center'>
            <th>Skill cost</th>
            <th>{totalCost} / {maxCostTotal}</th>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default SkillTable