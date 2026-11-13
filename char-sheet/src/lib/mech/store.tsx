import { View } from '../objectservice'
import { EditMode } from '../util'
import server from '../server'
import caltrops from '../caltrops'
import { alertError, alertWarning } from '../alerts'
import { loadMech } from './loadout'

export const MECH_DOC_TYPE = 'mech'
export const MECH_LOG_LIMIT = 100

/** Owners and unowned mechs get full edit rights (play and loadout); anyone else is read only. */
export function mechEditMode(owner: string | null | undefined, username: string | null | undefined): EditMode {
  if (!owner || (username && owner === username)) {
    return EditMode.Full
  }
  return EditMode.None
}

/** Prepend events (kept in the order given) to the log, keeping at most `limit` entries. */
export function capLog(log: string[] | undefined, events: string[], limit: number = MECH_LOG_LIMIT): string[] {
  return [...events, ...(log ?? [])].slice(0, limit)
}

/**
 * ObjectService.read returns undefined for falsy values, so EditMode.None (0) reads back as undefined.
 * Always read mechEditable through this helper (or use `?? EditMode.None`).
 */
export function readMechEditable(view: View): EditMode {
  return view.read('mechEditable') ?? EditMode.None
}

export function logMech(view: View, events: string[]): void {
  if (!events.length) {
    return
  }
  view.publish('mechLog', capLog(view.read('mechLog'), events))
}

// Guards against an older, slower read overwriting a newer one.
let OPEN_SEQ = 0

export async function openMech(view: View, id: string): Promise<void> {
  const seq = ++OPEN_SEQ
  let mech
  try {
    const doc = await server.read(id)
    mech = loadMech(doc.content)
    // The document id is authoritative.
    mech.id = id
  } catch (e: any) {
    if (seq === OPEN_SEQ) {
      alertError(`Error reading mech: ${e.message}`)
    }
    return
  }
  if (seq !== OPEN_SEQ) {
    return
  }

  if (view.read('mode') === 'mech' && view.read('rules')?.name !== mech.rules) {
    const rules = caltrops.loadRules(mech.rules)
    view.publish('rules', rules)
    if (rules.name !== mech.rules) {
      alertWarning(`Ruleset ${mech.rules} was not loaded. ${rules.name} loaded instead.`)
    }
  }

  const token = view.read('token')
  const editable = mechEditMode(mech.owner, token ? server.parseToken(token) : null)
  if (editable === EditMode.None) {
    alertWarning(`Mech opened in read only mode. Owner: ${mech.owner}.`)
  }
  // Publish editability first so auto save never sees a stale value for the new mech.
  view.publish('mechEditable', editable)
  view.publish('mechLog', [])
  // Tells MainPage this publish is a load, not an edit, so it must not trigger an auto save.
  view.publish('mechFresh', true)
  view.publish('mech', mech)
}
