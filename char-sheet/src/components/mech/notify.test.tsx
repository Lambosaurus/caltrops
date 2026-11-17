import { sendRolls } from './notify'

function withOpener(run: (post: jest.Mock) => void) {
  const postMessage = jest.fn()
  Object.defineProperty(window, 'opener', { value: { postMessage }, configurable: true })
  try {
    run(postMessage)
  } finally {
    Object.defineProperty(window, 'opener', { value: null, configurable: true })
  }
}

test('a roll to make by hand goes to the VTT as a d4 pool, labelled with the mech', () => {
  withOpener(post => {
    sendRolls([{ label: 'Cook-off: Ammo Bin: Heavy in the Core', dice: 6 }], 'Rusty')
    expect(post).toHaveBeenCalledWith({ dice: 6, text: 'Rusty: Cook-off: Ammo Bin: Heavy in the Core' }, '*')
  })
})

test('a roll already applied goes to the VTT with its own dice', () => {
  withOpener(post => {
    sendRolls([{ label: 'Overheat self-damage on BRO AC-30 → 1 wound (applied)', dice: 3, rolled: [4, 2, 1] }], 'Rusty')
    expect(post).toHaveBeenCalledWith({ dice: 3, rolled: [4, 2, 1], text: 'Rusty: Overheat self-damage on BRO AC-30 → 1 wound (applied)' }, '*')
  })
})

test('nothing is sent without a VTT', () => {
  expect(() => sendRolls([{ label: 'x', dice: 1 }], 'Rusty')).not.toThrow()
})
