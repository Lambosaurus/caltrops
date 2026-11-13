import { EditMode } from '../util'
import { ObjectService } from '../objectservice'
import { capLog, readMechEditable, logMech, mechEditMode, openMech } from './store'
import { newMech } from './loadout'
import { FIXTURE_RULES } from './fixture'
import { DEFAULT_RULES } from '../rules'
import caltrops from '../caltrops'
import server from '../server'

jest.mock('../server')
jest.mock('../alerts')

const RULES = { ...DEFAULT_RULES, name: 'Test', mechs: FIXTURE_RULES }

describe('mechEditMode', () => {
  test('unowned mechs are editable', () => {
    expect(mechEditMode(null, null)).toBe(EditMode.Full)
    expect(mechEditMode(undefined, 'bob')).toBe(EditMode.Full)
  })
  test('owner is editable', () => {
    expect(mechEditMode('bob', 'bob')).toBe(EditMode.Full)
  })
  test('others and anonymous are read only', () => {
    expect(mechEditMode('bob', 'alice')).toBe(EditMode.None)
    expect(mechEditMode('bob', null)).toBe(EditMode.None)
  })
})

describe('capLog / logMech', () => {
  test('prepends in order', () => {
    expect(capLog(['c'], ['a', 'b'])).toEqual(['a', 'b', 'c'])
  })
  test('caps at 100 keeping newest', () => {
    const old = Array.from({ length: 100 }, (_, i) => `old${i}`)
    const result = capLog(old, ['new1', 'new2'])
    expect(result).toHaveLength(100)
    expect(result.slice(0, 2)).toEqual(['new1', 'new2'])
    expect(result[99]).toBe('old97')
  })
  test('logMech publishes to the view and ignores empty', () => {
    const view = new ObjectService().view('')
    logMech(view, [])
    expect(view.read('mechLog')).toBeUndefined()
    logMech(view, ['x'])
    logMech(view, ['y'])
    expect(view.read('mechLog')).toEqual(['y', 'x'])
  })
})

describe('openMech', () => {
  const chassis = FIXTURE_RULES.chassis[0].name
  function setup(mech: any, token: string | null = null, mode = 'sheet') {
    ;(server.read as jest.Mock).mockResolvedValue({ content: mech })
    ;(server.parseToken as jest.Mock).mockImplementation((t: string) => t)
    const view = new ObjectService().view('')
    view.publish('token', token)
    view.publish('rules', RULES)
    view.publish('mode', mode)
    return view
  }
  test('publishes loaded mech, log and editability', async () => {
    const m = newMech(RULES, chassis, 'Mule')
    const view = setup(m)
    await openMech(view, m.id)
    expect(view.read('mech/name')).toBe('Mule')
    expect(view.read('mechEditable')).toBe(EditMode.Full)
    expect(view.read('mechLog')).toEqual([])
    expect(view.read('mechFresh')).toBe(true)
  })
  test('foreign owner is read only', async () => {
    const m = { ...newMech(RULES, chassis), owner: 'bob' }
    const view = setup(m, 'alice')
    await openMech(view, m.id)
    expect(readMechEditable(view)).toBe(EditMode.None)
  })
  test('owner gets Full', async () => {
    const m = { ...newMech(RULES, chassis), owner: 'bob' }
    const view = setup(m, 'bob')
    await openMech(view, m.id)
    expect(view.read('mechEditable')).toBe(EditMode.Full)
  })
  test('mech mode loads the mech ruleset', async () => {
    const sl = caltrops.loadRules('Scrap Lancer')
    const m = newMech(sl, sl.mechs!.chassis[0].name)
    const view = setup(m, null, 'mech')
    await openMech(view, m.id)
    expect(view.read('rules/name')).toBe('Scrap Lancer')
  })
  test('read error leaves state untouched', async () => {
    ;(server.read as jest.Mock).mockRejectedValue(new Error('nope'))
    const view = new ObjectService().view('')
    await openMech(view, 'x')
    expect(view.read('mech')).toBeUndefined()
  })
})
