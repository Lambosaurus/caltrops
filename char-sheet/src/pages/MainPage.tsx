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
    const params = new URLSearchParams(window.location.search)
    let token = params.get("token")
    if (token && server.parseToken(token)) {
      localStorage.setItem('caltrops-token', token)
      // Preserve ?campaign= if present so loadSheet can pick it up
      const campaignParam = params.get("campaign")
      const next = campaignParam
        ? `${window.location.pathname}?campaign=${encodeURIComponent(campaignParam)}`
        : window.location.pathname
      window.location.href = window.location.origin + next
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
    const params = new URLSearchParams(window.location.search)
    let sheet_id = params.get("sheet")
    if (!sheet_id) {
      sheet_id = localStorage.getItem('caltrops-sheet')
    }

    const campaignParam = params.get("campaign")
    if (campaignParam) {
      // Store pending campaign join; handled after sheet loads
      sessionStorage.setItem('caltrops-pending-campaign', campaignParam)
      // Strip query params without full reload
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (sheet_id) {
      server.read(sheet_id).then(sheet => {
          const imported = caltrops.importSheet(sheet.content)
          view.publish("sheet", imported)
          tryJoinPendingCampaign(view, imported.id)
        }
      ).catch(e => alertError(`Error reading sheet: ${e.message}`))
      return null;
    }

    // No saved sheet — warn if an invite link was followed
    if (sessionStorage.getItem('caltrops-pending-campaign')) {
      alertWarning('Open your character sheet first, then follow the campaign invite link.')
    }

    return caltrops.newSheet(view.read('rules'))
  }

  function tryJoinPendingCampaign(view: View, sheetId: string) {
    const pendingCampaign = sessionStorage.getItem('caltrops-pending-campaign')
    if (!pendingCampaign) return
    sessionStorage.removeItem('caltrops-pending-campaign')
    const token = view.read('token')
    if (!token) {
      alertWarning('Log in to join the campaign.')
      return
    }
    server.joinCampaign(token, pendingCampaign, sheetId)
      .then(() => {
        view.publish('sheet/campaignId', pendingCampaign)
        alertSuccess('Joined campaign')
      })
      .catch(e => alertError(`Error joining campaign: ${e.message}`))
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
          server.write(token, sheet.id, sheet.info.name, caltrops.cleanSheet(sheet))
            .then( s => alertSuccess("Sheet auto saved") )
            .catch(e => alertError(`Error auto saving sheet: ${e.message}`))
        }
      }, AUTO_SAVE_TIMEOUT * 1000)
    }
  }

  const [editable, setEditable] = useState(EditMode.Live);

  const [view, _] = useState( () => {
    const view = new ObjectService().view('')

    view.subscribe("sheet/info/name", () => setTitle(view.read("sheet/info/name")))
    view.subscribe("rules/theme", () => setTheme(view.read("rules/theme")))

    view.publish('token', loadToken())
    view.publish('rules', loadRules())
    view.publish('sheet', loadSheet(view))

    view.subscribe('token', () => saveToken(view.read('token')))
    view.subscribe('sheet', () => onSheetEdit(view))
    view.subscribe('sheet/id', () => onSheetChange(view))

    return view;
  })

  const sheetId = useListener(view, "sheet/id")
  const token = useListener(view, "token")
  const activeCampaignId: string | null = useListener(view, "sheet/campaignId") ?? null

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
            campaignId={activeCampaignId}
            token={token}
          /> :
          <LoadingSpinner size={100}/>
        }
      </MenuRibbon>

      <AlertGroup/>

    </FileUploader>
  )
}

export default MainPage