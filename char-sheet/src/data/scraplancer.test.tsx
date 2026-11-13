import caltrops from '../lib/caltrops'
import lancerRuleset from './lancer'
import scrapLancerRuleset from './scraplancer'
import { canMount, changeChassis, newMech } from '../lib/mech/loadout'

const mechs = scrapLancerRuleset.mechs!

describe('Scrap Lancer data', () => {
  it('has hit faces 1-12 exactly once per chassis', () => {
    for (const c of mechs.chassis) {
      const faces: number[] = []
      c.sections.forEach(s => { for (let i = s.range[0]; i <= s.range[1]; i++) faces.push(i) })
      expect(faces.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    }
  })

  it('has loadouts that fit', () => {
    for (const c of mechs.chassis) {
      const empty = changeChassis(scrapLancerRuleset, newMech(scrapLancerRuleset, c.name), c.name)
      for (const [id, l] of Object.entries(c.loadout ?? {})) {
        expect(c.sections.some(s => s.id === id)).toBe(true)
        expect(l.armour === undefined || mechs.attachments.some(a => a.name === l.armour && a.type === 'Armour')).toBe(true)
        for (const [name, start] of l.mounts) {
          expect([c.name, id, name, canMount(mechs, empty, id, name, start)]).toEqual([c.name, id, name, true])
        }
      }
    }
  })

  it('resolves references', () => {
    const ammo = mechs.ammo.map(a => a.name)
    const types = mechs.slotTypes.map(t => t.name)
    for (const a of mechs.attachments) {
      if (a.ammo) expect(ammo).toContain(a.ammo)
      if (a.bin) expect(ammo).toContain(a.bin)
      expect(types).toContain(a.type)
    }
    for (const c of mechs.chassis) for (const s of c.sections) for (const slot of s.slots) expect(types).toContain(slot)
  })

  it('is registered, and Lancer has no mechs', () => {
    expect(caltrops.listRules()).toContain('Scrap Lancer')
    expect((lancerRuleset as any).mechs).toBeUndefined()
    expect(scrapLancerRuleset.skills.map(s => s.name)).toContain('Gunnery')
    expect(scrapLancerRuleset.skills.map(s => s.name)).not.toContain('Gunnary')
  })
})
