// External imports
import { useState } from 'react'

// Components
import ActionModal, {ModalActionInfo} from './ActionModal'

// Interal imports
import { Attribute, RollInfo, Dictionary } from '../lib/rules'
import PointEntryBox from './PointEntryBox';
import caltrops from '../lib/caltrops';
import { chunkArray } from '../lib/util';
import { View, useListener } from '../lib/objectservice';
import foundry from '../lib/foundry';


function RollCreateModal({scoreView, attributes, useAspects, rollView}: {
    scoreView: View,
    attributes: Attribute[],
    useAspects: boolean,
    rollView: View,
  }): JSX.Element | null {

  const [result, setResult] = useState(null as number[] | null)

  const roll: RollInfo = useListener(rollView)
  const scores: Dictionary<number> = useListener(scoreView)
  if (!roll || !roll.skill) {
    return null
  }

  function closeModal() {
    rollView.delete('')
    setResult(null)
  }

  if (result) {
    
    return <ActionModal
      open={true}
      close={closeModal}
      title={caltrops.rollDescribe(roll)}
      >
      <div className='flex gap-4 flex-row flex-wrap justify-center mt-4'>
        {
        result.map( (r, i) => {
          let success = r >= 4
          return <div key={i}
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 animate-ping"
            style={{
              animation: "ping 0.5s cubic-bezier(.49,.01,.83,.45)",
              animationDirection: "reverse",
              animationDelay: `${0.1 * i}s`,
              animationFillMode: "backwards"
            }}
            viewBox="0 0 100 100"
            strokeWidth={0}
            preserveAspectRatio="xMidYMid meet"
            >
              <polygon points="0,86 100,86 50,0"
                style={{strokeWidth: 2, stroke: success ? "hsl(var(--su))" : "hsl(var(--er))"}}
                fill={success ? "hsl(var(--suc))" : "hsl(var(--erc))"}
              />
              <text
                x={50}
                y={60}
                style={{fontSize: 48}}
                fill={success ? "hsl(var(--su))" : "hsl(var(--er))"}
                dominantBaseline="middle"
                textAnchor="middle"
              >
                {r}
              </text>
          </svg>
          </div>
          })
        }
        <div className='h-32 sm:h-0' />
      </div>
    </ActionModal>

  } else {

    function setAttribute(name: string, score: number): void {
      rollView.publish('attribute', {
        name: name,
        score: score,
      })
    }
  
    function rollDiceLocal() {
      if (roll) {
        const result = caltrops.rollDice(roll)
        setResult(result)
      }
    }
  
    function rollDiceFoundry() {
      if (roll) {
        foundry.submitRoll(roll)
      }
    }

    const isFoundryPresent = foundry.isPresent()

    const actions: ModalActionInfo[] = [
      {
        name: `Roll ${caltrops.rollDiceCount(roll)} Dice`,
        type: isFoundryPresent ? undefined : 'primary',
        disabled: !roll.attribute,
        callback: () => rollDiceLocal(),
        stayOpen: true,
      }
    ]
  
    if (isFoundryPresent) {
      actions.push({
        name: "Send to VTT",
        type: 'primary',
        disabled: !roll.attribute,
        callback: () => rollDiceFoundry(),
      })
    }

    let attribute_grid = null;
    if (useAspects) {
      attribute_grid = attributes.map( attr => attr.aspects )
    } else {
      attribute_grid = [...chunkArray(attributes, 2)]
    }

    return <ActionModal
      open={true}
      close={closeModal}
      title={`Roll ${roll.skill.name}`}
      actions={actions}
    >
      <label className="label">
          <span className="label-text">{ useAspects ? "Select aspect" : "Select attribute"}</span>
      </label>
      <div className='flex justify-center'>
        <div className='grid grid-cols-1 gap-2'>
          {
            attribute_grid.map( attr_pairs => 
              <div className="btn-group" key={attr_pairs[0].name}>
              {
                attr_pairs.map( a => {
                  let selected = roll.attribute?.name === a.name
                  return <button
                    key={a.name}
                    className={ `btn btn-sm w-24 ${ selected ? 'btn-active' : '' }`}
                    onClick={() => {setAttribute(a.name, scores[a.name] ?? 0)}}
                  >{a.name}</button>
                  }
                )
              }
              </div>
            )
          }
        </div>
      </div>

      <label className="label">
          <span className="label-text">Roll bonus</span>
      </label>
      <PointEntryBox
        value={roll.bonus ?? 0}
        setValue={v => rollView.publish('bonus', v)}
        min={-9}
        max={9}
      />
    </ActionModal>
  }
}

export default RollCreateModal