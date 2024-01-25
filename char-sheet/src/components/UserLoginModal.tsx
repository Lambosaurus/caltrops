// External imports
import { useState } from 'react'
import server from '../lib/server'

// Components
import ActionModal from './ActionModal'

// Internal imports
import { isEmail } from '../lib/util'
import { alertError, alertInfo } from '../lib/alerts'

function UserLoginModal({open, close, setUser, isLoggedIn}:{
    open: boolean,
    close(): void,
    setUser(user: string | null): void,
    isLoggedIn: boolean,
  }): JSX.Element | null {

  const [token, setToken] = useState("")
  const username = server.parseToken(token.trim())
  const [requestTokenOpen, setRequestTokenOpen] = useState(false)

  if (!open) {
    return null
  }

  function closeModal() {
    setToken("")
    setRequestTokenOpen(false)
    close()
  }

  if (isLoggedIn) {
    return <ActionModal
      title="Confirm logout"
      open={open}
      close={closeModal}
      actions={[
        {
          name: "Logout",
          callback: () => setUser(null),
          type: "error",
        }
      ]}
    />
  }
  else {
    return <ActionModal
      title="Login"
      open={open}
      close={closeModal}
      actions={[
        {
          name: "Login",
          callback: () => setUser(token.trim()),
          type: "primary",
          disabled: !username,
        }
      ]}
    >

    <label className="label">
      <span className="label-text">Enter token</span>
      <button
        className='btn btn-xs'
        onClick={() => {setRequestTokenOpen(true)}}
      >Request new token</button>
    </label>
    <textarea
      className={`textarea textarea-bordered w-full ${(token && !username) ? 'textarea-error' : ''}`}
      placeholder="paste token here"
      value={token}
      onChange={ (e) => setToken(e.target.value) }
      />

      <RequestTokenModal
        open={requestTokenOpen}
        close={() => setRequestTokenOpen(false)}
      />

    </ActionModal>
  }
}


function RequestTokenModal({open, close}:{
  open: boolean,
  close(): void,
}): JSX.Element | null {

  const [email, setEmail] = useState("")

  function sendRequest(email: string): void {
    server.requestToken(email)
    .then(() => alertInfo(`Email sent to ${email}`))
    .catch(e => alertError(`Error sending email: ${e.message}`))
  }

  return <ActionModal
      title="Request new token"
      open={open}
      close={() => { setEmail(""); close() }}
      actions={[
        {
          name: "Submit",
          callback: () => sendRequest(email),
          disabled: !isEmail(email),
        }
      ]}
    >

    <label className="label">
      <span className="label-text">Enter email</span>
    </label>
    <input
      className={`input w-full max-w-xs input-bordered input-sm ${email && !isEmail(email) ? 'input-error' : ''}`}
      value={email}
      type='email'
      onChange={e => setEmail(e.target.value)}
      placeholder="example@email.com"
    />

    </ActionModal>
}

export default UserLoginModal