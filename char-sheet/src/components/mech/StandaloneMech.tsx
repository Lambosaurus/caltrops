// External imports
import { useState } from 'react'

// Components
import MechPanel from './MechPanel'
import MechManage from './MechManage'

// Internal imports
import { View } from '../../lib/objectservice'
import { EditMode } from '../../lib/util'

/* Standalone `?mech=` page: a "Mech" tab with the play panel and a "Manage" tab. */
function StandaloneMech({ view, editable }: { view: View, editable: EditMode }): JSX.Element {
  const [tab, setTab] = useState('mech' as 'mech' | 'manage')
  return <div className='flex flex-col w-full'>
    <div className='tabs tabs-boxed justify-center m-2'>
      <button type='button' className={`tab ${tab === 'mech' ? 'tab-active' : ''}`} onClick={() => setTab('mech')}>Mech</button>
      <button type='button' className={`tab ${tab === 'manage' ? 'tab-active' : ''}`} onClick={() => setTab('manage')}>Manage</button>
    </div>
    {tab === 'mech' ? <MechPanel view={view} editable={editable}/> : <MechManage view={view} editable={editable}/>}
  </div>
}

export default StandaloneMech
