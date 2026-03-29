// External imports
import { useState, useSyncExternalStore } from 'react'

// Components
import InfoTable from './InfoTable'
import AttributeTable from './AttributeTable'
import CurrencyTable from './CurrencyTable'

// Internal imports
import { View, useListener } from '../lib/objectservice'
import { EditMode } from '../lib/util'
import caltrops from '../lib/caltrops'
import { RollInfo, Rules, Sheet } from '../lib/rules'

/* 
 * Sheet view. Contains all other sheet displaying components.
 */

function SheetView( { rules, view, editable=EditMode.Live }: {
    rules: Rules,
    view: View,
    editable?: EditMode
  }): JSX.Element {
  
  // This will trigger a re-render if the level changes. This is probably fine.
  let level: number = useListener(view, 'sheet/info/level') ?? 0

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
            view={view.view('sheet/attributes')}
            editable={editable}
            rollView={view.view('roll')}
          />
        </section>
    </div>
  )
}

export default SheetView