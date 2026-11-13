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
import MechView from './mech/MechView'
import MechPanel from './mech/MechPanel'
import CurrentMechCard from './mech/CurrentMechCard'

// Internal imports
import { View, useListener } from '../lib/objectservice'
import { EditMode } from '../lib/util'
import caltrops from '../lib/caltrops'
import { Rules } from '../lib/rules'
import { readMechEditable } from '../lib/mech/store'
import { useState } from 'react'



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
  const mechName: string | undefined = useListener(view, 'mech/name')
  const mechId: string | undefined = useListener(view, 'mech/id')
  // Subscribes to editability changes; the value itself is read through the helper (0 reads back as undefined).
  useListener(view, 'mechEditable')
  const [tab, setTab] = useState('pilot' as 'pilot' | 'mech')

  const mechEditable = Math.min(editable, readMechEditable(view))
  const card = rules.mechs ? <CurrentMechCard
    view={view}
    mechRules={rules.mechs}
    editable={editable}
    open={() => setTab('mech')}
  /> : null

  const pilot = (
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

        {rules.mechs && mechId === undefined ?
          <section className='flex gap-4 flex-col'>
            {card}
            <div className='opacity-60 max-w-xs'>No mech assigned — manage in the Mech tab.</div>
          </section> : null
        }

        <RollCreateModal
          rollView={view.view('roll')}
          scoreView={view.view('sheet/attributes')}
          useAspects={rules.useAspects}
          attributes={rules.attributes}
        />
    </div>
  )

  if (!rules.mechs) {
    return pilot
  }

  // The pilot sheet with the mech play panel below it.
  const pilotPage = <>
    {pilot}
    {mechId !== undefined ? <MechPanel view={view} editable={mechEditable}/> : null}
  </>

  return (
    <div className='flex flex-col w-full'>
      <div className='tabs tabs-boxed justify-center m-2'>
        <button type='button' className={`tab ${tab === 'pilot' ? 'tab-active' : ''}`} onClick={() => setTab('pilot')}>Pilot</button>
        <button type='button' className={`tab ${tab === 'mech' ? 'tab-active' : ''}`} onClick={() => setTab('mech')}>
          {mechName ? `Mech: ${mechName}` : 'Mech'}
        </button>
      </div>
      {tab === 'pilot' ? pilotPage :
        mechId !== undefined ?
        <>
          <div className='flex justify-center p-4'>{card}</div>
          <MechView view={view} editable={mechEditable}/>
        </> :
        <div className='p-4 text-center opacity-60'>No mech assigned. Use Assign... on the Pilot tab, or the Mech menu.</div>
      }
    </div>
  )
}

export default SheetView