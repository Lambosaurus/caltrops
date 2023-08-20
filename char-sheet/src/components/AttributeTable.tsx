// Components
import PointEntryBox from './PointEntryBox'

// Internal imports
import caltrops from '../lib/caltrops'
import { modifyObject, EditMode, Modifier, keyModifier } from '../lib/util'
import { Attribute, Dictionary, RollInfo } from '../lib/rules'

/* 
 * Attributes table.
 *    in: attriutes <- rules.attributes
 *    in: scores <- sheet.attributes
 *    out: setScores -> sheet.attributes
 *    in: level <- sheet.info.level
 */
function AttributeTable({attributes, scores, setScores, aspectMax, editable=EditMode.Live, roll, setRoll}: {
    attributes: Attribute[],
    scores: Dictionary<number>,
    setScores(cb: Modifier<Dictionary<number>>): void,
    aspectMax: number,
    editable?: EditMode,
    roll: RollInfo,
    setRoll(roll: RollInfo): void,
  }): JSX.Element {
  const attributeTotal = caltrops.attributeTotal(attributes, scores)
  const attributeMax = caltrops.attributeTotalMax
  const aspectTotal = caltrops.aspectTotal(attributes, scores)

  function selectAspect(aspect: string) {
    setRoll(modifyObject(roll, "aspect", {
      name: aspect,
      score: scores[aspect] ?? 0
    }))
  }

  function clearAspect() {
    setRoll(modifyObject(roll, "aspect", null))
  }

  return (
    <div>
      <table className="table table-compact">
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
                    setValue={v => {setScores(scores => caltrops.attributeModify(scores, attribute, v)) }}
                    editable={editable >= EditMode.Full}
                    min={caltrops.attributeMin}
                    max={caltrops.attributeMax}
                    isCapped={attributeTotal >= attributeMax}
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
                      const selected = aspect.name === roll.aspect?.name
                      const bg = selected ? "bg-base-200" : ""
                      return <tr 
                          className={ 'hover cursor-pointer'}
                          key={aspect.name}
                          onClick={() => selected ? clearAspect() : selectAspect(aspect.name)}
                          >
                        <td className={`w-24 ${bg}`}>{aspect.name}</td>
                        <td className={bg}><PointEntryBox
                          value={scores[aspect.name] ?? 0}
                          setValue={v => setScores( keyModifier(aspect.name, name => v) )}
                          editable={editable >= EditMode.Full}
                          min={base}
                          max={caltrops.aspectMax(base)}
                          isCapped={aspectTotal >= aspectMax}
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
            <td className='text-center'>{attributeTotal} / {attributeMax}</td>
            <td className='text-center'>{aspectTotal} / {aspectMax}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default AttributeTable