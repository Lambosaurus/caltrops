// External imports
import { useState } from 'react'

// Components
import ActionModal, {ModalActionInfo} from './ActionModal'

// Interal imports
import { Attribute, RollInfo, Dictionary } from '../lib/rules'
import PointEntryBox from './PointEntryBox';
import caltrops from '../lib/caltrops';
import { modifyObject } from '../lib/util';
import foundry from '../lib/foundry';


function RollCreateModal({attributes, scores, roll, setRoll}: {
    attributes: Attribute[],
    scores: Dictionary<number>,
    roll: RollInfo,
    setRoll(roll: RollInfo): void,
  }): JSX.Element | null {

  const [result, setResult] = useState(null as number[] | null)

  if (roll == null || !roll.skill) {
    return null
  }

  function closeModal() {
    setRoll({})
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

    function setBonus(bonus: number): void {
      setRoll(modifyObject(roll, 'bonus', bonus))
    }
  
    function setAspect(name: string, score: number): void {
      setRoll(modifyObject(roll, 'aspect', {
        name: name,
        score: score,
      }))
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
        disabled: !roll.aspect,
        callback: () => rollDiceLocal(),
        stayOpen: true,
      }
    ]
  
    if (isFoundryPresent) {
      actions.push({
        name: "Send to VTT",
        type: 'primary',
        disabled: !roll.aspect,
        callback: () => rollDiceFoundry(),
      })
    }

    return <ActionModal
      open={true}
      close={closeModal}
      title={`Roll ${roll.skill.name}`}
      actions={actions}
    >
      <label className="label">
          <span className="label-text">Select aspect</span>
      </label>
      <div className='flex justify-center'>
        <div className='grid grid-cols-1 gap-2'>
          {
            attributes.map( attr => 
              <div className="btn-group" key={attr.name}>
              {
                attr.aspects.map( a => {
                  let selected = roll.aspect?.name === a.name
                  return <button
                    key={a.name}
                    className={ `btn btn-sm w-24 ${ selected ? 'btn-active' : '' }`}
                    onClick={() => {setAspect(a.name, scores[a.name] ?? 0)}}
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
        setValue={setBonus}
        min={-9}
        max={9}
      />
    </ActionModal>
  }
}

export default RollCreateModal