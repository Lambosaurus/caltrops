// External imports
import { useState } from 'react'

// Components
import ActionModal from '../ActionModal'
import TextEntryBox from '../TextEntryBox'

// Internal imports
import { Rules } from '../../lib/rules'
import { Mech } from '../../lib/mech/types'
import { newMech } from '../../lib/mech/loadout'


function NewMechModal({open, close, rules, setMech}:{
    open: boolean,
    close(): void,
    rules: Rules,
    setMech(mech: Mech): void,
  }): JSX.Element | null {

  const chassisNames = rules.mechs?.chassis.map(c => c.name) ?? []
  const [chassis, setChassis] = useState("")
  const [name, setName] = useState("")

  if (!open || !rules.mechs) {
    return null
  }

  const selected = chassisNames.includes(chassis) ? chassis : chassisNames[0]

  function closeModal() {
    close()
    setName("")
  }

  return <ActionModal
    open={open}
    close={closeModal}
    title="New mech"
    actions={[
      {
        name: "Create",
        type: "primary",
        disabled: name.length === 0 || !selected,
        callback: () => { setMech(newMech(rules, selected, name)); setName("") }
      }
    ]}
    >
    <div className="form-control w-full max-w-xs">
      <label className="label">
        <span className="label-text">Name mech</span>
      </label>
      <TextEntryBox
        value={name}
        setValue={setName}
        limit={32}
        inputSize='input-md'
        placeholder='Mech name here'
      ></TextEntryBox>

      <label className="label">
        <span className="label-text">Select chassis</span>
      </label>
      <select className="select select-bordered" value={selected} onChange={e=>setChassis(e.target.value)}>
        { chassisNames.map( c => <option key={c}>{c}</option> ) }
      </select>
    </div>
  </ActionModal>
}


export default NewMechModal
