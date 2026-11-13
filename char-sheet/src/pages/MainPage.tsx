// External imports
import { useState } from 'react'

// Components
import FileUploader from '../components/FileUploader'
import MenuRibbon from '../components/MenuRibbon'
import SheetView from '../components/SheetView'
import AlertGroup from '../components/AlertGroup'

// Internal imports
import { EditMode, setTheme } from '../lib/util'
import caltrops from '../lib/caltrops'
import { Sheet, Rules } from '../lib/rules'
import LoadingSpinner from '../components/LoadingSpinner'
import server from '../lib/server'
import { alertSuccess, alertError, alertWarning } from '../lib/alerts'
import { ObjectService, View, useListener } from '../lib/objectservice'
import { MECH_DOC_TYPE, openMech, readMechEditable } from '../lib/mech/store'

const AUTO_SAVE_TIMEOUT = 5.0
let SAVE_TIMEOUT_ID: any = -1
let MECH_SAVE_TIMEOUT_ID: any = -1

/* 
  - Top level parent component responsible for all state management
  - Individual state fragments passed down into child components for updating etc
  - Itended to provide a single point of truth via which future API calls can be conducted 
    - (otherwise they'd end up being done in the children on an as-needed basis)
  - Further lookup and controlling logic can be split out into modules if desired
*/
function MainPage(): JSX.Element {

  function loadToken(): string | null {
    let token = new URLSearchParams(window.location.search).get("token")
    if (token && server.parseToken(token)) {
      // Token supplied via URI. Save it.
      localStorage.setItem('caltrops-token', token)
      // Reload without query params
      window.location.href = window.location.href.split('?')[0]
    }
    else {
      token = localStorage.getItem('caltrops-token');
    }

    if (token && server.parseToken(token)) {
      return token;
    }
    return null;
  }

  function saveToken(token: string | null) {
    if (token) {
      localStorage.setItem('caltrops-token', token)
    } else {
      localStorage.removeItem('caltrops-token')
    }
  }

  function loadRules(): Rules {
    const last_rules = localStorage.getItem('caltrops-rules')
    return caltrops.loadRules(last_rules ?? undefined)
  }

  function loadSheet(view: View): Sheet | null {
    if (view.read('mode') === 'mech') {
      // A standalone mech has no pilot sheet.
      return null
    }
    let sheet_id = new URLSearchParams(window.location.search).get("sheet")
    if (!sheet_id) {
      sheet_id = localStorage.getItem('caltrops-sheet')
    }
    if (sheet_id) {
      server.read(sheet_id).then( sheet => {
          view.publish("sheet", caltrops.importSheet(sheet.content))
        }
      ).catch(e => alertError(`Error reading sheet: ${e.message}`))
      return null;
    }
    return caltrops.newSheet(view.read('rules'))
  }

  function setTitle(title: string | undefined) {
    if (!title) {
      title = "Caltrops"
    }
    if (title !== document.title) {
      document.title = title;
    }
  }

  function onSheetChange(view: View) {

    // Ok, so this is a filthy wretched hack.
    // We want to cancel out the triggered autosave.
    // We guarantee onSheetChange is registered after onSheetEdit.
    if (SAVE_TIMEOUT_ID) {
      clearTimeout(SAVE_TIMEOUT_ID)
      SAVE_TIMEOUT_ID = -1
    }

    const sheet = view.read('sheet')
    if (!sheet)
      return
    const token = view.read('token')
    const rules = view.read('rules')

    // This could be done on its own subscription, but rules should only ever change with a sheet change.
    if (rules.name !== sheet.rules) {
      const new_rules = caltrops.loadRules(sheet.rules)
      view.publish("rules", new_rules)
      if (new_rules.name !== sheet.rules) {
        alertWarning(`Ruleset ${sheet.rules} was not loaded. ${new_rules.name} loaded instead.`)
        sheet.rules = new_rules.name
      }
    }

    if (sheet.owner && (!token || sheet.owner !== server.parseToken(token))) {
      alertWarning(`Sheet opened in read only mode. Owner: ${sheet.owner}.`)
      setEditable(EditMode.None)
    } else {
      setEditable(EditMode.Live)
      localStorage.setItem('caltrops-sheet',sheet.id)
      localStorage.setItem('caltrops-rules',sheet.rules)
    }

  }

  function onSheetEdit(view: View) {
    if (SAVE_TIMEOUT_ID >= 0) {
      clearTimeout(SAVE_TIMEOUT_ID)
      SAVE_TIMEOUT_ID = -1;
    }

    const token = view.read('token')
    if (token) {
      SAVE_TIMEOUT_ID = setTimeout(() => {
        const sheet = view.read('sheet')
        if (token && sheet) {
          setTitle(sheet?.info.name)
          const username = server.parseToken(token)
          if (username && sheet.owner !== username) {
            sheet.owner = username
          }
          server.write(token, sheet.id, "sheet", sheet.info.name, caltrops.cleanSheet(sheet))
            .then( s => alertSuccess("Sheet auto saved") )
            .catch(e => alertError(`Error auto saving sheet: ${e.message}`))
        }
      }, AUTO_SAVE_TIMEOUT * 1000)
    }
  }

  function onMechEdit(view: View) {
    if (MECH_SAVE_TIMEOUT_ID >= 0) {
      clearTimeout(MECH_SAVE_TIMEOUT_ID)
      MECH_SAVE_TIMEOUT_ID = -1
    }

    const token = view.read('token')
    if (token && view.read('mech') && readMechEditable(view) > EditMode.None) {
      MECH_SAVE_TIMEOUT_ID = setTimeout(() => {
        MECH_SAVE_TIMEOUT_ID = -1
        const mech = view.read('mech')
        // Re-check at fire time: the mech may have been swapped or the user logged out.
        if (token && mech && readMechEditable(view) > EditMode.None) {
          const username = server.parseToken(token)
          if (username && mech.owner !== username) {
            mech.owner = username
          }
          server.write(token, mech.id, MECH_DOC_TYPE, mech.name, mech)
            .then( s => alertSuccess("Mech auto saved") )
            .catch(e => alertError(`Error auto saving mech: ${e.message}`))
        }
      }, AUTO_SAVE_TIMEOUT * 1000)
    }
  }

  function onMechChange(view: View) {
    // openMech flags the mech it just loaded: cancel the save its publish triggered.
    // Registered after onMechEdit, like the sheet equivalents.
    if (view.read('mechFresh')) {
      view.publish('mechFresh', false)
      if (MECH_SAVE_TIMEOUT_ID >= 0) {
        clearTimeout(MECH_SAVE_TIMEOUT_ID)
        MECH_SAVE_TIMEOUT_ID = -1
      }
    }
  }

  function onSheetMechChange(view: View) {
    if (view.read('mode') === 'mech') {
      return
    }
    const sheet = view.read('sheet')
    if (!sheet) {
      return
    }
    if (!sheet.mech) {
      if (view.read('mech')) {
        view.delete('mech')
      }
    } else if (view.read('mech/id') !== sheet.mech) {
      openMech(view, sheet.mech)
    }
  }

  const [editable, setEditable] = useState(EditMode.Live);

  const [view, _] = useState( () => {
    const view = new ObjectService().view('')

    view.subscribe("sheet/info/name", () => setTitle(view.read("sheet/info/name")))
    view.subscribe("rules/theme", () => setTheme(view.read("rules/theme")))

    const mechId = new URLSearchParams(window.location.search).get("mech")
    view.publish('mode', mechId ? 'mech' : 'sheet')
    view.publish('mechLog', [])
    view.publish('mechEditable', EditMode.None)

    view.publish('token', loadToken())
    view.publish('rules', loadRules())
    view.publish('sheet', loadSheet(view))

    view.subscribe('token', () => saveToken(view.read('token')))
    view.subscribe('sheet', () => onSheetEdit(view))
    view.subscribe('sheet/id', () => onSheetChange(view))

    view.subscribe('mech', () => onMechEdit(view))
    view.subscribe('mech/id', () => onMechChange(view))
    view.subscribe('sheet/mech', () => onSheetMechChange(view))
    view.subscribe('mech/name', () => {
      if (view.read('mode') === 'mech') {
        setTitle(view.read('mech/name'))
      }
    })
    view.subscribe('mech/id', () => {
      // Keep the URL pointing at the open standalone mech.
      const id = view.read('mech/id')
      if (id && view.read('mode') === 'mech' && new URLSearchParams(window.location.search).get('mech') !== id) {
        window.history.replaceState(null, '', `${window.location.href.split('?')[0]}?mech=${id}`)
      }
    })

    if (mechId) {
      openMech(view, mechId)
    }

    return view;
  })

  const sheetId = useListener(view, "sheet/id")
  const mode = useListener(view, "mode")
  const mechId = useListener(view, "mech/id")
  const mechName = useListener(view, "mech/name")
  const mechEditable = useListener(view, "mechEditable") ?? EditMode.None

  return (
    <FileUploader setFile={s => { if (mode !== 'mech') view.publish("sheet", s) }}>

      <MenuRibbon
        editable={mode === 'mech' ? mechEditable : editable}
        setEditable={mode === 'mech' ? (e => view.publish('mechEditable', e)) : setEditable}
        view={view}
      >
        {
          mode === 'mech' ?
          (
            // Placeholder until MechView exists.
            mechId !== undefined ? <pre>{mechName}</pre> : <LoadingSpinner size={100}/>
          ) :
          sheetId !== undefined ?
          <SheetView
            view={view}
            editable={editable}
          /> :
          <LoadingSpinner size={100}/>
        }
      </MenuRibbon>

      <AlertGroup/>

    </FileUploader>
  )
}

export default MainPage