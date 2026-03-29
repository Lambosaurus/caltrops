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
import { ObjectService, useListener } from '../lib/objectservice'

const AUTO_SAVE_TIMEOUT = 5.0
let SAVE_TIMEOUT_ID: any = -1

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

  /*
  function changeToken(token: string | null) {
    if (token) {
      localStorage.setItem('caltrops-token', token)
    } else {
      localStorage.removeItem('caltrops-token')
    }
    setToken(token);
  }
  */

  function loadRules(): Rules {
    const last_rules = localStorage.getItem('caltrops-rules')
    return caltrops.loadRules(last_rules ?? undefined)
  }

  function loadSheet(): Sheet | null {
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

  /*
  function changeSheet(sheet: Sheet | null, remember: boolean = false) {
    // Check if sheet.rules were changed, and load the new rules if so.
    if (sheet && sheet.rules !== rules.name) {
      const newRules = caltrops.loadRules(sheet.rules)
      setRules(newRules)
      localStorage.setItem('caltrops-rules', newRules.name)
      if (sheet.rules !== newRules.name) {
        alertWarning(`Ruleset ${sheet.rules} was not loaded. ${newRules.name} loaded instead.`)
        sheet.rules = newRules.name
      }
    }
    if (sheet) {
      sheet = caltrops.updateSheet(rules, sheet)
    }
    if (sheet && remember) {
      localStorage.setItem('caltrops-sheet', sheet.id)
    }
    if (sheet && sheet.owner && (!token || sheet.owner !== server.parseToken(token))) {
      alertWarning(`Sheet opened in read only mode. Owner: ${sheet.owner}.`)
      setEditable(EditMode.None)
    }
    else {
      setEditable(EditMode.Live)
    }
    setTitle(sheet?.info.name)
    setSheet(sheet)
  }
  */

  /*
  function editSheet(sheet: Sheet | null) {
    if (SAVE_TIMEOUT_ID >= 0) {
      clearTimeout(SAVE_TIMEOUT_ID)
      SAVE_TIMEOUT_ID = -1;
    }
    if (token) {
      SAVE_TIMEOUT_ID = setTimeout(() => {
        if (token && sheet) {
          setTitle(sheet?.info.name)
          const username = server.parseToken(token)
          if (username && sheet.owner !== username) {
            sheet.owner = username
          }
          server.write(token, sheet.id, sheet.info.name, caltrops.cleanSheet(sheet))
            .then( s => alertSuccess("Sheet auto saved") )
            .catch(e => alertError(`Error auto saving sheet: ${e.message}`))
        }
      }, AUTO_SAVE_TIMEOUT * 1000)
    }
  }
  */

  const [editable, setEditable] = useState(EditMode.Live);

  const [view, _] = useState( () => {
    const service = new ObjectService({
      sheet: loadSheet(),
      rules: loadRules(),
      token: loadToken(),
    })

    //service.subscribe("rules/theme", () => setTheme(service.read("rules/theme")))
    //service.subscribe("token")
    //service.subscribe("sheet/info/name" () => setTitle(view.read("sheet/info/name")))

    return service.view('');
  })

  const sheetId = useListener(view, "sheet/id")

  return (
    <FileUploader setFile={s => view.publish("sheet", s)}>

      <MenuRibbon
        editable={editable}
        setEditable={setEditable}
        view={view}
      >
        {
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