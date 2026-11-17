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
  const prefabs = rules.mechs?.prefabs ?? []
  const [chassis, setChassis] = useState("")
  const [prefab, setPrefab] = useState("")
  const [name, setName] = useState("")

  if (!open || !rules.mechs) {
    return null
  }

  const selected = chassisNames.includes(chassis) ? chassis : chassisNames[0]
  const fits = prefabs.filter(p => p.chassis === selected)
  const loadout = fits.some(p => p.name === prefab) ? prefab : ''
  const info = rules.mechs?.chassis.find(c => c.name === selected)

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
        callback: () => { setMech(newMech(rules, selected, name, loadout || undefined)); setName("") }
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
      {info?.tier ? <div className="text-xs opacity-70 mt-1">
        {info.class} · {info.tier} · {info.price?.toLocaleString()} Solari · Heat Max {info.heatMax}
      </div> : null}

      <label className="label">
        <span className="label-text">Loadout</span>
      </label>
      <select className="select select-bordered" value={loadout} onChange={e=>setPrefab(e.target.value)}>
        <option value="">{fits.length ? 'Bare chassis' : 'Default'}</option>
        { fits.map( p => <option key={p.name} value={p.name}>Prefab: {p.name}</option> ) }
      </select>
      {loadout ? <div className="text-xs opacity-70 mt-1">{fits.find(p => p.name === loadout)?.description}</div> : null}
    </div>
  </ActionModal>
}


export default NewMechModal
