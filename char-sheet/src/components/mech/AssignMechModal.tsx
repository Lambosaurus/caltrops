// External imports
import { useEffect, useState } from 'react'

// Components
import ActionModal from '../ActionModal'
import LoadingSpinner from '../LoadingSpinner'

// Internal imports
import server, { Document } from '../../lib/server'
import { MECH_DOC_TYPE } from '../../lib/mech/store'
import { alertError } from '../../lib/alerts'

/** Accepts a bare id or a link containing `?mech=<id>`. */
export function parseMechId(input: string): string {
  const s = input.trim()
  const m = s.match(/[?&]mech=([^&#\s]+)/)
  return m ? decodeURIComponent(m[1]) : s
}

function AssignMechModal({ open, close, token, assign }: {
    open: boolean,
    close(): void,
    token: string | null,
    assign(id: string): void,
  }): JSX.Element | null {

  const [mechs, setMechs] = useState(null as Document[] | null)
  const [pasted, setPasted] = useState('')

  useEffect(() => {
    if (!open || !token) {
      return
    }
    let live = true
    setMechs(null)
    server.list(token, MECH_DOC_TYPE)
      .then(l => { if (live) setMechs(l) })
      .catch(e => { if (live) { setMechs([]); alertError(`Error listing mechs: ${e.message}`) } })
    return () => { live = false }
  }, [open, token])

  if (!open) {
    return null
  }

  const id = parseMechId(pasted)

  return <ActionModal
    open={open}
    close={close}
    title='Assign mech'
    actions={[{
      name: 'Assign pasted id',
      type: 'primary',
      disabled: !id,
      callback: () => { assign(id); setPasted('') },
    }]}
  >
    <div className='flex flex-col gap-2 p-2'>
      <label className='label-text'>Paste a mech id or link</label>
      <input
        className='input input-bordered input-sm w-full'
        value={pasted}
        onChange={e => setPasted(e.target.value)}
        placeholder='Mech id or link'
      />
      {token ? <>
        <label className='label-text mt-2'>Or pick one of yours</label>
        {mechs === null ? <LoadingSpinner/>
          : !mechs.length ? <span className='opacity-60'>No mechs found</span>
          : <div className='flex flex-col gap-1 max-h-64 overflow-auto'>
            {mechs.map(m =>
              <button key={m.id} className='btn btn-primary btn-sm justify-start normal-case' onClick={() => { assign(m.id); close() }}>
                {m.title}
              </button>
            )}
          </div>}
      </> : <span className='opacity-60 mt-2'>Log in to list your mechs.</span>}
    </div>
  </ActionModal>
}

export default AssignMechModal
