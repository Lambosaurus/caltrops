// External imports
import { useState } from 'react'

// Components
import { Sheet } from '../lib/rules';
import LoadingSpinner from './LoadingSpinner';
import { ImCross } from 'react-icons/im';
import ActionModal from './ActionModal';

// Libraries
import caltrops from '../lib/caltrops'
import server, { Document } from '../lib/server'
import { alertError, alertSuccess } from '../lib/alerts'
import { timeSince } from '../lib/util';


function LoadSheetModal({open, close, setSheet, sheets, setSheets, token}:{
    open: boolean,
    close(): void,
    setSheet(sheet: Sheet | null): void,
    sheets: Document[] | null,
    setSheets( sheets: Document[] | null ): void,
    token: string
  }): JSX.Element | null {

  const [toDelete, setToDelete] = useState(null as Document | null)

  if (!open) {
    return null
  }

  function selectSheet(item: Document) {
    setSheet(null)
    server.read(item.id).then(s => {
        setSheet( caltrops.importSheet(s.content) )
    }).catch(e => alertError( `Error reading sheet: ${e.message}`))
    close()
  }

  return <ActionModal
    open={open}
    close={close}
    title="Select sheet"
    >
    {
      sheets == null ?
        <LoadingSpinner/> :
      !sheets.length ?
        "No sheets found" :
      <div className='scrollbar scrollbar-neutral flex flex-col items-center gap-2 p-2'>
      {
        sheets.map( s => 
          <div className='flex flex-row gap-2 max-w-xl w-full' key={s.title}>
            <button
              className='btn btn-primary p-0 grow'
              onClick={() => selectSheet(s)}
            >
              <div>
                <h2 className='font-bold text-xl'>
                  {s.title}
                </h2>
                <section className='text-md normal-case'>
                  { timeSince(new Date(s.time))} ago
                </section>
              </div>
            </button>
            <button
              className='btn btn-outline btn-error btn-square'
              onClick={() => setToDelete(s)}
            ><ImCross size={20}/></button>
          </div>
        )
      }
      </div>
    }

    <ActionModal
      title={`Delete ${toDelete?.title ?? ""}?`}
      open={!!toDelete}
      close={() => setToDelete(null)}
      actions={[
        {
          name: "Delete",
          type: "error",
          callback: () => {
            setSheets(null);
            server.delete(token, toDelete?.id ?? "").then( () => {
                alertSuccess(`${toDelete?.title} deleted`)
                server.list(token, "sheet").then(
                  sheets => {
                    setSheets(sheets)
                    
                  }
                )
              }
            ).catch( e => alertError(`Error deleting sheet: ${e.message}`))
          },
        }
      ]}
    >
    Sheet deletion cannot be undone.
    </ActionModal>
  </ActionModal>
}


export default LoadSheetModal