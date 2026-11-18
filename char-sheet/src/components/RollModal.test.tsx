import { fireEvent, render, screen } from '@testing-library/react'
import RollCreateModal from './RollModal'
import { ObjectService } from '../lib/objectservice'
import { DEFAULT_RULES } from '../lib/rules'

test('a skill roll made in the app can send that result to the VTT, once', () => {
  const postMessage = jest.fn()
  Object.defineProperty(window, 'opener', { value: { postMessage }, configurable: true })
  try {
    const view = new ObjectService().view('')
    view.publish('roll', { skill: { name: 'Sneak', score: 2 }, attribute: { name: 'Reflex', score: 1 } })
    render(<RollCreateModal scoreView={view.view('attributes')} attributes={DEFAULT_RULES.attributes} useAspects={true} rollView={view.view('roll')}/>)
    fireEvent.click(screen.getByText('Roll 3 Dice'))
    fireEvent.click(screen.getByText('Send result to VTT'))
    const msg = postMessage.mock.calls[0][0]
    expect(msg.rolled).toHaveLength(3)
    expect(msg.text).toContain('Sneak')
    expect((screen.getByText('Sent to VTT').closest('button') as HTMLButtonElement).disabled).toBe(true)
  } finally {
    Object.defineProperty(window, 'opener', { value: null, configurable: true })
  }
})
