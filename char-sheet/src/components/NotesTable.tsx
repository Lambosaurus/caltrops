// Components
import IconButton from './IconButton'

// Internal imports
import { EditMode, Modifier } from '../lib/util'

/* 
 * Power table.
 *   in: notes <- sheet.notes
 *   out: setNotes -> sheet.notes
 */

function NotesTable({notes, setNotes, editable=EditMode.Live}: {
    notes: string[],
    setNotes(cb: Modifier<string[]>): void,
    editable?: EditMode,
  }): JSX.Element {

  console.log("rendering notes")

  function createNote() {
    setNotes(notes => [...notes, ""])
  }

  function editNote(index: number, content: string) {
    setNotes(notes => {
      let new_notes = [...notes]
      new_notes[index] = content
      return new_notes
    })
  }

  function deleteNote(index: number) {
    setNotes(notes => notes.filter( (_, i) => i !== index ))
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
                <textarea
                  className='textarea textarea-bordered leading-tight w-full scrollbar scrollbar-neutral p-2'
                  placeholder='Enter notes here'
                  value={note}
                  onChange={ evt => editNote(i, evt.target.value) }
                  disabled={!(editable >= EditMode.Live)}
                />
              </td>
              <td>
                <IconButton
                  icon="cross"
                  btnStyle="btn-outline btn-error"
                  onClick={() => deleteNote(i)}
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
                onClick={() => {createNote()}}
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