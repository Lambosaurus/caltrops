import caltrops from './caltrops'
import { DEFAULT_RULES } from './rules'

describe('loadSheet mech field', () => {
    test('loadSheet keeps mech id', () => {
        expect(caltrops.importSheet({ mech: 'abc' }).mech).toBe('abc')
    })
    test('loadSheet without mech leaves it undefined', () => {
        expect(caltrops.importSheet({}).mech).toBeUndefined()
    })
})

describe('cloneSheet', () => {
    test('clears mech and owner but leaves the original alone', () => {
        const sheet = caltrops.importSheet({ mech: 'abc', owner: 'bob' })
        const clone = caltrops.cloneSheet(sheet)
        expect(clone.mech).toBeUndefined()
        expect(clone.owner).toBeNull()
        expect(clone.id).not.toBe(sheet.id)
        expect(sheet.mech).toBe('abc')
    })
})

describe('skill sets', () => {
  const base = { ...DEFAULT_RULES, levelup: { aspects: 0.5, attributes: 0, skills: 2 } }

  it('treats a plain skill list as one set stored in sheet.skills', () => {
    const rules = { ...base, skills: [{ name: 'Climb' }] }
    expect(caltrops.skillSets(rules)).toEqual([{ id: 'skills', name: 'Skills', skills: [{ name: 'Climb' }], perLevel: 2 }])
    expect(caltrops.skillSetPath(rules, 'skills')).toBe('sheet/skills')
  })

  it('stores the first set in sheet.skills and the rest by id, each with its own points', () => {
    const rules = { ...base, skills: [
      { id: 'body', name: 'Body', skills: [{ name: 'Climb' }] },
      { id: 'ship', name: 'Ship', skills: [{ name: 'Helm' }], perLevel: 1 },
      { id: 'mind', name: 'Mind', skills: [{ name: 'Lore' }], perLevel: 0.5 },
    ] }
    const sets = caltrops.skillSets(rules)
    expect(sets.map(s => [s.id, s.perLevel])).toEqual([['body', 2], ['ship', 1], ['mind', 0.5]])
    expect(sets.map(s => caltrops.skillSetPath(rules, s.id))).toEqual(['sheet/skills', 'sheet/skillSets/ship', 'sheet/skillSets/mind'])
    expect(caltrops.skillSetCostMax(sets[2], 3)).toBe(2)
  })
})
