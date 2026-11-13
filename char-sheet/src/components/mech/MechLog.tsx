// Internal imports
import { View, useListener } from '../../lib/objectservice'

function MechLog({ view }: { view: View }): JSX.Element {
  const log: string[] = useListener(view, 'mechLog') ?? []
  return <div className='bg-base-200 border border-base-300 p-2'>
    <h4 className='font-bold text-accent mb-1'>Log</h4>
    <div className='max-h-64 overflow-auto'>
      {log.length ? log.map((l, i) => <div key={i} className='border-t border-dashed border-base-300 py-0.5 whitespace-pre-wrap'>{l}</div>)
        : <div className='opacity-50'>No events yet.</div>}
    </div>
  </div>
}

export default MechLog
