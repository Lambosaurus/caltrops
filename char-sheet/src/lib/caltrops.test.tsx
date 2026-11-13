import caltrops from './caltrops'

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
