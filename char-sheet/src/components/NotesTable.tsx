// Components
import IconButton from './IconButton'
import Markdown from 'react-markdown'

// Internal imports
import { EditMode } from '../lib/util'
import ObjectService from '../lib/objectservice'
import { useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkBreaks  from 'remark-breaks'


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

  function handleEditClick(event: React.MouseEvent<HTMLDivElement>, index: number) {
    if (editable >= EditMode.Live) {
      setEditingIndex(index);
    }
  }

  function handleCheckboxClick(event: React.MouseEvent<HTMLInputElement>, index: number) {
    event.stopPropagation();
    const checkbox = event.currentTarget;
    const checked = checkbox.checked; // new state after the click

    // Find the ordinal position of this checkbox among all checkboxes in the note
    const allCheckboxes = checkbox.closest('td')?.querySelectorAll('input[type="checkbox"]') || [];
    const checkboxIndex = Array.from(allCheckboxes).indexOf(checkbox);

    const currentValue = notes[index] || "";

    // Match GFM task-list items: "- [ ]", "- [x]", "* [X]", "+ [ ]", etc.
    const checkboxRegex = /[-*+] \[[ xX]\]/g;
    let match;
    let matchCount = 0;
    while ((match = checkboxRegex.exec(currentValue)) !== null) {
      if (matchCount === checkboxIndex) {
        const prefix = match[0][0]; // list marker: -, *, or +
        const replacement = `${prefix} [${checked ? 'x' : ' '}]`;
        const newValue = currentValue.substring(0, match.index) + replacement + currentValue.substring(match.index + match[0].length);
        service.set_index(index, newValue);
        return;
      }
      matchCount++;
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
                  <div onClick={(event) => handleEditClick(event, i)} className='markdown textarea textarea-bordered leading-tight w-full overflow-hidden resize-none p-2 pb-0 mt-2 mb-2'>
                    { note ? <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{
                      input(props) {
                        const {type, checked} = props
                        if (type !== 'checkbox') return <input {...props} />;

                        return <input type="checkbox" onClick={(event) => handleCheckboxClick(event, i)} checked={checked} />
                      }
                    }}>{note}</Markdown> : (
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
