import { act, render, screen } from '@testing-library/react'
import FoundryStatus from './FoundryStatus'

afterEach(() => {
  Object.defineProperty(window, 'opener', { value: null, configurable: true, writable: true })
})

test('shows nothing when the sheet was not opened from Foundry', () => {
  render(<FoundryStatus/>)
  expect(screen.queryByTestId('foundry-status')).toBeNull()
})

test('pings the module, then shows connected with its version once it answers', () => {
  const postMessage = jest.fn()
  Object.defineProperty(window, 'opener', { value: { postMessage, closed: false }, configurable: true, writable: true })
  render(<FoundryStatus/>)
  expect(postMessage).toHaveBeenCalledWith({ ping: true }, '*')
  expect(screen.getByTestId('foundry-status').getAttribute('title')).toMatch(/did not answer/)
  act(() => { window.dispatchEvent(new MessageEvent('message', { data: { caltrops: 'pong', version: '1.1.2' } })) })
  expect(screen.getByTestId('foundry-status').getAttribute('title')).toBe('Connected to Foundry (module 1.1.2)')
})
