// External imports
import { useState } from 'react'

// Components
import { Modal } from 'react-daisyui'
import { Sheet } from '../lib/rules';
import LoadingSpinner from './LoadingSpinner';

// Libraries
import caltrops from '../lib/caltrops'
import server, { ServerItem } from '../lib/server'


function LoadSheetModal({open, setOpen, setSheet, sheets, user}:{
    open: boolean,
    setOpen(open: boolean): void,
    setSheet(sheet: Sheet | null): void,
    sheets: ServerItem[] | null,
    user: string | null,
  }): JSX.Element | null {

  if (!open) {
    return null
  }

  function closeModal() {
    setOpen(false)
  }

  function selectSheet(item: ServerItem) {
    if (user) {
      setSheet(null)
      server.read(user, item.id).then(s => {
        if (s != null) {
          setSheet( caltrops.loadSheet(s.content) )
        }
      })
    }
    closeModal()
  }

  return <Modal open={open} onClickBackdrop={closeModal}>
    <h1 className='font-bold text-2xl mb-4'>Select sheet</h1>
    {
      sheets == null ?
        <LoadingSpinner/> :
      !sheets.length ?
        "No sheets found" :
      <div className='scrollbar scrollbar-neutral flex flex-col w-full items-center gap-2'>
      {
        sheets.map( s => 
          <section className='card'>
            <button
              className='btn btn-primary w-80'
              onClick={() => selectSheet(s)}
            >{s.title}</button>
          </section>
        )
      }
      </div>
    }
  </Modal>
}


export default LoadSheetModal