// Components
import IconButton from './IconButton'
import Markdown from 'react-markdown'

// Internal imports
import { EditMode } from '../lib/util'
import ObjectService from '../lib/objectservice'
import { useState } from 'react'
import remarkGfm from 'remark-gfm'


function NotesTable({service, editable=EditMode.Live}: {
    service: ObjectService,
    editable?: EditMode,
  }): JSX.Element {

  const notes: string[] = service.subscribe()
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function adjustHeight(textarea: HTMLTextAreaElement | null) {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  return (
    <div>
      <table className="table table-compact w-80">
        <thead>
          <tr>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
          notes.map((note, i) => {
            return <tr key={i}>
              <td className='p-1 pb-0 w-full'>
                {editingIndex !== i ? (
                  <div onClick={() => setEditingIndex(i)} className='markdown textarea textarea-bordered leading-tight w-full overflow-hidden resize-none p-2 pb-0 mt-2 mb-2'>
                    { note ? <Markdown remarkPlugins={[remarkGfm]}>{note.replaceAll(/\b\n\b/g, '\n\n')}</Markdown> : (
                      <em>Click to add notes...</em>
                    ) }
                  </div>
                ) : (
                <textarea
                  onBlur={() => setEditingIndex(null)}
                  className='textarea textarea-bordered leading-tight w-full overflow-hidden resize-none p-2 mt-2 mb-2'
                  placeholder='Enter notes here'
                  autoFocus={true}
                  value={note}
                  onChange={ evt => service.set_index(i, evt.target.value) }
                  ref={(textarea) => adjustHeight(textarea)}
                  disabled={!(editable >= EditMode.Live)}
                />
                )}
              </td>
              <td>
                <IconButton
                  icon="cross"
                  btnStyle="btn-outline btn-error"
                  onClick={() => service.remove_index(i)}
                  enabled={editable >= EditMode.Live}
                />
              </td>
            </tr>
          })
        }
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>
              <div className='flex justify-center'>
              <IconButton
                icon='plus'
                onClick={() => {service.append_index("")}}
                enabled={editable >= EditMode.Live}
              />
              </div>
            </th>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default NotesTable
