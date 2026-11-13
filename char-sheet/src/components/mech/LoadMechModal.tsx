// External imports
import { useState } from 'react'

// Components
import LoadingSpinner from '../LoadingSpinner';
import { ImCross } from 'react-icons/im';
import ActionModal from '../ActionModal';

// Libraries
import server, { Document } from '../../lib/server'
import { MECH_DOC_TYPE } from '../../lib/mech/store'
import { alertError, alertSuccess } from '../../lib/alerts'
import { timeSince } from '../../lib/util';


function LoadMechModal({open, close, setMechId, mechs, setMechs, token}:{
    open: boolean,
    close(): void,
    setMechId(id: string): void,
    mechs: Document[] | null,
    setMechs( mechs: Document[] | null ): void,
    token: string
  }): JSX.Element | null {

  const [toDelete, setToDelete] = useState(null as Document | null)

  if (!open) {
    return null
  }

  function selectMech(item: Document) {
    setMechId(item.id)
    close()
  }

  return <ActionModal
    open={open}
    close={close}
    title="Select mech"
    >
    {
      mechs == null ?
        <LoadingSpinner/> :
      !mechs.length ?
        "No mechs found" :
      <div className='scrollbar scrollbar-neutral flex flex-col items-center gap-2 p-2'>
      {
        mechs.map( m =>
          <div className='flex flex-row gap-2 max-w-xl w-full' key={m.id}>
            <button
              className='btn btn-primary p-0 grow'
              onClick={() => selectMech(m)}
            >
              <div>
                <h2 className='font-bold text-xl'>
                  {m.title}
                </h2>
                <section className='text-md normal-case'>
                  { timeSince(new Date(m.time))} ago
                </section>
              </div>
            </button>
            <button
              className='btn btn-outline btn-error btn-square'
              onClick={() => setToDelete(m)}
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
            setMechs(null);
            server.delete(token, toDelete?.id ?? "").then( () => {
                alertSuccess(`${toDelete?.title} deleted`)
                server.list(token, MECH_DOC_TYPE).then( setMechs )
              }
            ).catch( e => alertError(`Error deleting mech: ${e.message}`))
          },
        }
      ]}
    >
    Mech deletion cannot be undone.
    </ActionModal>
  </ActionModal>
}


export default LoadMechModal
