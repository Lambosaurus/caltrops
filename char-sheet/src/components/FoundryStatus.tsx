// External imports
import { useEffect, useState } from 'react'
import { BsPlugFill } from 'react-icons/bs'

const PING_MS = 5000

/**
 * Header badge for the Foundry link. Hidden unless the sheet was opened from Foundry. It pings the module, which
 * answers with its version (module 1.1.2 and later): green once answered, amber while opened but silent (an older
 * module still takes rolls). Re-pings so a closed Foundry tab drops back to hidden.
 */
function FoundryStatus(): JSX.Element | null {
  const [opened, setOpened] = useState(() => !!window.opener && !window.opener.closed)
  const [version, setVersion] = useState(null as string | null)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.caltrops === 'pong') setVersion(String(event.data.version ?? '?'))
    }
    function ping() {
      const open = !!window.opener && !window.opener.closed
      setOpened(open)
      if (open) window.opener.postMessage({ ping: true }, '*')
      else setVersion(null)
    }
    window.addEventListener('message', onMessage)
    ping()
    const timer = setInterval(ping, PING_MS)
    return () => {
      window.removeEventListener('message', onMessage)
      clearInterval(timer)
    }
  }, [])

  if (!opened) return null
  const title = version
    ? `Connected to Foundry (module ${version})`
    : 'Opened from Foundry, but the module did not answer: update it to 1.1.2 or later. Rolls still go to Foundry.'
  return (
    <span
      data-testid='foundry-status'
      title={title}
      aria-label={title}
      className={`flex items-center gap-1 px-2 text-sm ${version ? 'text-success' : 'text-warning'}`}
    >
      <BsPlugFill size={18}/>
      <span className='hidden sm:inline'>Foundry</span>
    </span>
  )
}

export default FoundryStatus
