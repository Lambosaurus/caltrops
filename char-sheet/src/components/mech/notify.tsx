// Internal imports
import { alertInfo, alertWarning } from '../../lib/alerts'

/** Toast each notice: info when it reports something already applied, a warning when the player must act. */
export function showNotices(notices: string[]): void {
  for (const n of notices) {
    if (n.includes('applied')) {
      alertInfo(n)
    } else {
      alertWarning(n)
    }
  }
}
