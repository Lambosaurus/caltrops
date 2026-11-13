import { render } from '@testing-library/react'
import DiceResult from './DiceResult'

test('renders one triangle per die with its value', () => {
  const { container } = render(<DiceResult dice={[4, 2, 1]}/>)
  expect(container.querySelectorAll('svg').length).toBe(3)
  expect(container.textContent).toBe('421')
})
