import caltrops from './caltrops'

describe('loadSheet mech field', () => {
    test('loadSheet keeps mech id', () => {
        expect(caltrops.importSheet({ mech: 'abc' }).mech).toBe('abc')
    })
    test('loadSheet without mech leaves it undefined', () => {
        expect(caltrops.importSheet({}).mech).toBeUndefined()
    })
})
