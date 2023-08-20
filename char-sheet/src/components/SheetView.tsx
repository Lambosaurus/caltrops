// External imports
import { useState } from 'react'

// Components
import SkillTable from './SkillTable'
import InfoTable from './InfoTable'
import AttributeTable from './AttributeTable'
import PowerTable from './PowerTable'
import EquipmentTable from './EquipmentTable'
import WoundTable from './WoundTable'
import RollCreateModal from './RollModal'
import NotesTable from './NotesTable'
import CurrencyTable from './CurrencyTable'

// Internal imports
import { EditMode, Modifier, keyModifier } from '../lib/util'
import caltrops from '../lib/caltrops'
import { RollInfo, Rules, Sheet } from '../lib/rules'

/* 
 * Sheet view. Contains all other sheet displaying components.
 */

function SheetView( { rules, sheet, setSheet, editable=EditMode.Live }: {
    rules: Rules,
    sheet: Sheet,
    setSheet( cb: Modifier<Sheet> ): void,
    editable?: EditMode
  }): JSX.Element {

  const [roll, setRoll] = useState({} as RollInfo)

  return (
    <div className='flex flex-wrap justify-center flex-row gap-4 basis-full p-4 scrollbar scrollbar-neutral'>

        {/* Info & Attributes */}
        <section className='flex gap-4 flex-col'>
          <InfoTable
            info={sheet.info}
            setInfo={cb => setSheet(keyModifier('info', cb))}
            editable={editable}
          />
          <CurrencyTable
            currencies={rules.currency}
            values={sheet.currency}
            setValues={cb => setSheet(keyModifier('currency', cb))}
            editable={editable}
          />
          <AttributeTable
            attributes={rules.attributes}
            scores={sheet.attributes}
            setScores={cb => setSheet(keyModifier('attributes', cb))}
            aspectMax={caltrops.aspectTotalMax(rules, sheet.info.level)}
            editable={editable}
            roll={roll}
            setRoll={setRoll}
          />
        </section>

        {/* Skills */}
        <section className='flex gap-4 flex-col'>
          <SkillTable
            skills={rules.skills}
            scores={sheet.skills}
            setScores={cb => setSheet(keyModifier('skills', cb))}
            maxCostTotal={caltrops.skillCostMax(rules, sheet.info.level)}
            editable={editable}
            roll={roll}
            setRoll={setRoll}
          />
        </section>
        
        {/* Equipment column */}
        <section className='flex gap-4 flex-col'>
        {
          rules.containers.map( container => {
            return <EquipmentTable
              equipment={rules.equipment}
              container={container}
              items={sheet.equipment[container.name] ?? []}
              editable={editable}
              setItems={cb => {setSheet( keyModifier('equipment', keyModifier( container.name, cb )) )}}
              key={`equipment-${container.name}-table`}
          />
          } )
        }
        </section>

        {/* Powers & wounds */}
        <section className='flex gap-4 flex-col'>
          {(() => {
            // This feels like a crime. This element is only included if powers are available
            const availablePowers = rules.powers.filter(p => caltrops.powerIsAvailable(p, sheet.skills));
            return availablePowers.length ?
              <PowerTable
                powers={availablePowers}
                powerDice={sheet.powers}
                skillScores={sheet.skills}
                setPowerDice={cb => setSheet(keyModifier('powers', cb))}
                editable={editable}
                key='power-table'
              /> :
               null
          })()}

          {(() => {
            return rules.wounds.map( w =>
            <WoundTable
              key={w.name}
              wounds={sheet.wounds[w.name] || []}
              setWounds={cb => {setSheet( keyModifier('wounds', keyModifier( w.name, cb )) )}}
              container={w}
              woundSizeLimit={rules.woundSizeLimit}
              editable={editable}
            />
          )})()}
        </section>
        
        {/* Notes */}
        <section className='flex gap-4 flex-col'>
          <NotesTable
            notes={sheet.notes}
            setNotes={cb => setSheet(keyModifier('notes', cb))}
            editable={editable}
          />
        </section>

        <RollCreateModal
          roll={roll}
          setRoll={setRoll}
          attributes={rules.attributes}
          scores={sheet.attributes}
        />
    </div>
  )
}

export default SheetView