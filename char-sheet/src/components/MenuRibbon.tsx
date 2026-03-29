// External imports
import React, { useState } from 'react'

// Components
import NewSheetModal from './NewSheetModal';
import LoadSheetModal from './LoadSheetModal'
import { BsPerson, BsShare, BsCloudArrowDown,
  BsCloudArrowUp, BsFileEarmarkPlus, BsDownload,
  BsJournalText, BsCopy,
 } from 'react-icons/bs'
import { ImCheckmark, ImPencil } from 'react-icons/im';

// Internal imports
import { downloadObject, copyToClipboard, EditMode } from '../lib/util'
import { Sheet } from '../lib/rules'
import server, { ServerItem } from '../lib/server'
import UserLoginModal from './UserLoginModal';
import { alertError, alertInfo, alertSuccess } from '../lib/alerts';
import caltrops from '../lib/caltrops';
import { View, useListener } from "../lib/objectservice"


function MenuRibbon( {editable, setEditable, view, children}: {
    editable: EditMode,
    setEditable(editable: EditMode): void,
    view: View,
    children?: React.ReactNode,
  }): JSX.Element {

  const [isNewSheetOpen, setIsNewSheetOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isLoadSheetOpen, setIsLoadSheetOpen] = useState(false)
  const [sheetList, setSheetList] = useState(null as ServerItem[] | null)

  const token = useListener(view, "token")
  const sheetId = useListener(view, "sheet/id")

  const menuItems = [
  <li key='new'>
    <button
      className='btn btn-ghost'
      onClick={() => setIsNewSheetOpen(true)}
    >
      <BsFileEarmarkPlus size={25}/>
      New
    </button>
  </li>,
  <li key='load'>
    <button
      className='btn btn-ghost'
      onClick={() => {
        if (token) {
          setSheetList(null)
          server.list(token)
            .then( s => setSheetList(s))
            .catch(e => alertError(`Error listing sheets: ${e.message}`))
          setIsLoadSheetOpen(true)
        }
      }}
      disabled={!token}
    >
      <BsCloudArrowDown size={27}/>
      Load
    </button>
  </li>,
  <li key='save'>
    <button
      className='btn btn-ghost'
      onClick={() => {
        const sheet = view.read('sheet')
        if (token && sheet) {
          const username = server.parseToken(token)
          if (username && sheet.owner !== username) {
            sheet.owner = username
          }
          server.write(token, sheet.id, sheet.info.name, caltrops.cleanSheet(sheet))
            .then( s => alertSuccess("Sheet saved") )
            .catch(e => alertError(`Error saving sheet: ${e.message}`))
        }
      }}
      disabled={!(sheetId && token && editable > EditMode.None)}
    >
      <BsCloudArrowUp size={27}/>
      Save
    </button>
  </li>,
  <li key='clone'>
    <button
      className='btn btn-ghost'
      onClick={() => {
        if (sheetId) {
          view.publish('sheet', caltrops.cloneSheet(view.read('sheet')))
        }
      }}
      disabled={!sheetId}
    >
    <BsCopy size={25}/>
    Clone
  </button>
  </li>,
  <li key='download'>
    <button
      className='btn btn-ghost'
      onClick={() => {
          if (sheet) {
          downloadObject(sheet,
            `caltrops-${sheet.info.name.replace(' ', '-').toLowerCase()}.json`,
            true
          )
        }
      }}
      disabled={!sheet}
    >
      <BsDownload size={25}/>
      Download
    </button>
  </li>,
  <li key='share'>
    <button
      className='btn btn-ghost'
      onClick={ () => {
        if (sheet) {
          copyToClipboard( `${window.location.href.split('?')[0]}?sheet=${sheet.id}` )
          alertInfo("Share URL copied to clipboard")
        }
        }}
      disabled={ !sheet }
    >
      <BsShare size={25}/>
      Share
    </button>
  </li>,
  <li key='rules'>
  <button
    className='btn btn-ghost'
    onClick={ () => {
      window.open("caltrops_doc.pdf", '_blank');
      }}
    >
    <BsJournalText size={25}/>
    Rules
  </button>
</li>,
  <li key='login'>
    <button
      className='btn btn-ghost'
      onClick={ () => setIsLoginOpen(true) }
    >
      <BsPerson size={25}/>
      {token ? server.parseToken(token) : "Login"}
    </button>
  </li>,
  ]
  
  function closeRibbon() {
    (document.getElementById("menu-ribbon-drawer") as any).checked = false;
  }
  
  return (
  <div className="drawer">
    <input id="menu-ribbon-drawer" type="checkbox" className="drawer-toggle"/> 
    <div className="drawer-content flex flex-col">
      {/*<!-- Navbar -->*/}
      <div className="w-full navbar bg-base-300 min-h-12 my-0 p-0">
        <div className="flex-none lg:hidden">
          <label htmlFor="menu-ribbon-drawer" className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </label>
        </div>
        <div className="flex-1 px-2 mx-2">
          <button
            className={`btn btn-square ${ editable >= EditMode.Full ? 'btn-primary' : 'btn-ghost' }`}
            onClick={() => setEditable( editable >= EditMode.Full ? EditMode.Live : EditMode.Full )}
            disabled={ editable === EditMode.None }
            >
            { editable >= EditMode.Full ? <ImCheckmark size={22}/> : <ImPencil size={22}/> }
          </button>
        </div>
        <div className="flex-none hidden lg:block">
          <ul className="menu menu-horizontal">
            { menuItems }
          </ul>
        </div>
      </div>
        {children}
    </div>
    <div className="drawer-side">
      <label htmlFor="menu-ribbon-drawer" className="drawer-overlay"></label> 
      <ul className="menu p-4 overflow-y-auto w-80 bg-base-100">
        { menuItems }
      </ul>
    </div>

    <NewSheetModal
      open={isNewSheetOpen}
      close={() => setIsNewSheetOpen(false)}
      setSheet={s => { setSheet(s); closeRibbon() }}
      />

    <UserLoginModal
      open={isLoginOpen}
      close={() => setIsLoginOpen(false)}
      setUser={u => setToken(u)}
      isLoggedIn={!!token}
      />

    { token ? <LoadSheetModal
      open={isLoadSheetOpen}
      close={() => setIsLoadSheetOpen(false)}
      setSheet={s => { setSheet(s); closeRibbon() }}
      setSheets={setSheetList}
      sheets={sheetList}
      token={token}
    /> : null }
  </div>
  )
}

export default MenuRibbon