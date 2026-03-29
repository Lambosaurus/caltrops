// Components
import InfoTable from './InfoTable'
import AttributeTable from './AttributeTable'
import CurrencyTable from './CurrencyTable'
import SkillTable from './SkillTable'
import RollCreateModal from './RollModal'
import PowerTable from './PowerTable'
import WoundTable from './WoundTable'
import EquipmentTable from './EquipmentTable'
import NotesTable from './NotesTable'

// Internal imports
import { View, useListener } from '../lib/objectservice'
import { EditMode } from '../lib/util'
import caltrops from '../lib/caltrops'
import { Rules } from '../lib/rules'



/* 
 * Sheet view. Contains all other sheet displaying components.
 */

function SheetView( { view, editable=EditMode.Live }: {
    view: View,
    editable?: EditMode
  }): JSX.Element {
  
  // This will trigger a re-render if the level changes. This is probably fine.
  let level: number = useListener(view, 'sheet/info/level') ?? 0
  let rules: Rules = useListener(view, 'rules')

  return (
    <div className='flex flex-wrap justify-center flex-row gap-4 basis-full p-4 scrollbar scrollbar-neutral'>

        {/* Info & Attributes */}
        <section className='flex gap-4 flex-col'>
          <InfoTable
            view={view.view('sheet/info')}
            editable={editable}
          />
          <CurrencyTable
            currencies={rules.currency}
            view={view.view('sheet/currency')}
            editable={editable}
          />
          <AttributeTable
            rules={rules}
            level={level}
            scoreView={view.view('sheet/attributes')}
            rollView={view.view('roll')}
            editable={editable}
          />
        </section>

        {/* Skills */}
        <section className='flex gap-4 flex-col'>
          <SkillTable
            skills={rules.skills}
            skillView={view.view('sheet/skills')}
            rollView={view.view('roll')}
            maxCostTotal={caltrops.skillCostMax(rules, level)}
            editable={editable}
          />
        </section>

        {/* Equipment column */}
        <section className='flex gap-4 flex-col'>
        {
          rules.containers.map( container => {
            return <EquipmentTable
              key={`equipment-${container.name}-table`}
              equipment={rules.equipment}
              container={container}
              view={view.view( `sheet/equipment/${container.name}`)}
              editable={editable}
          />
          } )
        }
        </section>

        {/* Powers & Wounds */}
        <section className='flex gap-4 flex-col'>
          <PowerTable
            powers={rules.powers}
            skillView={view.view('sheet/skills')}
            powerView={view.view('sheet/powers')}
            editable={editable}
          />

          {(() => {
            return rules.wounds.map( w =>
            <WoundTable
              key={`wound-${w.name}-table`}
              view={ view.view(`sheet/wounds/${w.name}`)}
              container={w}
              woundSizeLimit={rules.woundSizeLimit}
              editable={editable}
            />
          )})()}
        </section>

        {/* Notes */}
        <section className='flex gap-4 flex-col'>
          <NotesTable
            view={view.view('sheet/notes')}
            editable={editable}
          />
        </section>

        <RollCreateModal
          rollView={view.view('roll')}
          scoreView={view.view('sheet/attributes')}
          useAspects={rules.useAspects}
          attributes={rules.attributes}
        />
    </div>
  )
}

export default SheetView