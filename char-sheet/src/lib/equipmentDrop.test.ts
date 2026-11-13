import { ObjectService } from './objectservice'
import { applyEquipmentDrop } from './equipmentDrop'

function setup() {
  const root = new ObjectService().view('')
  root.publish('sheet/equipment/Pack', [{ name: 'a' }, { name: 'b' }])
  root.publish('sheet/equipment/Belt', [{ name: 'c' }])
  root.publish('mech/equipment/Stowage', [{ name: 'm' }])
  return root
}
const names = (v: any, p: string) => (v.read(p) ?? []).map((i: any) => i.name)

test('same-root drag without a path moves between sibling containers', () => {
  const root = setup()
  expect(applyEquipmentDrop(root.view('sheet/equipment/Belt'), { container: 'Pack', index: 0 }, 0)).toBe(true)
  expect(names(root, 'sheet/equipment/Pack')).toEqual(['b'])
  expect(names(root, 'sheet/equipment/Belt')).toEqual(['a', 'c'])
})

test('same container reorders', () => {
  const root = setup()
  applyEquipmentDrop(root.view('sheet/equipment/Pack'), { container: 'Pack', index: 0, path: 'sheet/equipment/Pack' }, 1)
  expect(names(root, 'sheet/equipment/Pack')).toEqual(['b', 'a'])
})

test('pilot container to mech stowage and back', () => {
  const root = setup()
  const stow = root.view('mech/equipment/Stowage')
  expect(applyEquipmentDrop(stow, { container: 'Pack', index: 1, path: 'sheet/equipment/Pack' }, 0, 3)).toBe(true)
  expect(names(root, 'sheet/equipment/Pack')).toEqual(['a'])
  expect(names(root, 'mech/equipment/Stowage')).toEqual(['b', 'm'])
  expect(applyEquipmentDrop(root.view('sheet/equipment/Belt'), { container: 'Stowage', index: 1, path: 'mech/equipment/Stowage' }, 0, 5)).toBe(true)
  expect(names(root, 'mech/equipment/Stowage')).toEqual(['b'])
  expect(names(root, 'sheet/equipment/Belt')).toEqual(['m', 'c'])
})

test('drop into an empty stowage works and a full one is refused', () => {
  const root = setup()
  root.publish('mech/equipment/Stowage', [])
  expect(applyEquipmentDrop(root.view('mech/equipment/Stowage'), { container: 'Pack', index: 0, path: 'sheet/equipment/Pack' }, 0, 1)).toBe(true)
  expect(applyEquipmentDrop(root.view('mech/equipment/Stowage'), { container: 'Pack', index: 0, path: 'sheet/equipment/Pack' }, 0, 1)).toBe(false)
  expect(names(root, 'sheet/equipment/Pack')).toEqual(['b'])
})

test('unknown source is ignored', () => {
  const root = setup()
  expect(applyEquipmentDrop(root.view('sheet/equipment/Belt'), { container: 'Nope', index: 0 }, 0)).toBe(false)
})
