// Components
import PointEntryBox from './PointEntryBox'

// Internal imports
import caltrops from '../lib/caltrops'
import { View, useListener } from '../lib/objectservice'
import { EditMode } from '../lib/util'
import { Dictionary, RollInfo, Rules } from '../lib/rules'



function AttributeTable({rules, level, scoreView, editable, rollView}: {
    rules: Rules,
    level: number,
    scoreView: View,
    editable: EditMode,
    rollView: View,
  }): JSX.Element {

  const scores: Dictionary<number> = useListener(scoreView)
  const attributes = rules.attributes
  // Total from the sheets
  const attributeTotal = caltrops.attributeTotal(attributes, scores)
  const aspectTotal = caltrops.aspectTotal(attributes, scores)

  // Rules defined limits
  const attributeTotalMax = caltrops.attributeTotalMax(rules, level)
  const attributeMax = caltrops.attributeMax(rules, level)
  const aspectTotalMax = caltrops.aspectTotalMax(rules, level)

  const selectedRollAttribute: RollInfo = useListener(rollView, 'attribute/name')

  function selectRollAspect(aspect: string, selected: boolean) {
    if (selected) {
      rollView.delete('attribute')
    } else {
      rollView.publish('attribute', {
        name: aspect,
        score: scores[aspect] ?? 0
      })
    }
  }

  return (
    <div>
      <table className="table table-compact w-80">
        <thead>
          <tr>
            <th>Attributes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          attributes.map( attribute => {
            let base = scores[attribute.name] ?? 0

            return <tr key={attribute.name}>
              <td>
                <div className='card rounded-box bg-base-200'>
                <div className='flex flex-col content-center gap-2 m-2'>
                  <div className='text-center'>{attribute.name}</div>
                  <PointEntryBox
                    value={base}
                    setValue={v => { scoreView.publish('', caltrops.attributeModify(scores, attribute, v)) }}
                    editable={editable >= EditMode.Full}
                    min={caltrops.attributeMin}
                    max={attributeMax}
                    isCapped={attributeTotal >= attributeTotalMax}
                    encourageUp={true}
                  />
                </div>
                </div>
              </td>
              <td className='p-0'>
                <table className='table table-compact'>
                  <tbody>
                  {
                    attribute.aspects.map( aspect => {
                      const selected = aspect.name === selectedRollAttribute
                      const bg = selected ? "bg-base-200" : ""
                      return <tr 
                          className={ 'hover cursor-pointer'}
                          key={aspect.name}
                          onClick={() => selectRollAspect(aspect.name, selected)}
                          >
                        <td className={`w-24 ${bg}`}>{aspect.name}</td>
                        <td className={bg}><PointEntryBox
                          value={scores[aspect.name] ?? 0}
                          setValue={v => scoreView.publish(aspect.name, v) }
                          editable={editable >= EditMode.Full}
                          min={base}
                          max={caltrops.aspectMax(base)}
                          isCapped={aspectTotal >= aspectTotalMax}
                          encourageUp={true}
                        /></td>
                      </tr>
                    })
                  }
                  </tbody>
                </table>
              </td>
            </tr>
          })
        }
        </tbody>
        <tfoot>
          <tr>
            <td className='text-center'>{attributeTotal} / {attributeTotalMax}</td>
            <td className='text-center'>{aspectTotal} / {aspectTotalMax}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default AttributeTable