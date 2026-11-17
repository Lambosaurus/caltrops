import caltrops from '../lib/caltrops'
import lancerRuleset from './lancer'
import scrapLancerRuleset from './scraplancer'
import { canMount, changeChassis, newMech } from '../lib/mech/loadout'

const mechs = scrapLancerRuleset.mechs!

describe('Scrap Lancer data', () => {
  it('has no sitting duck / stunned values', () => {
    expect(mechs).not.toHaveProperty('sittingDuck')
    expect(mechs).not.toHaveProperty('stunned')
  })

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

describe('Scrap Lancer pilot skills', () => {
  const pilot = scrapLancerRuleset.pilotSkills!

  it('levels aspects, not attributes', () => {
    expect(scrapLancerRuleset.levelup).toEqual({ aspects: 0.5, attributes: 0, skills: 2.5 })
  })

  it('keeps the body skills, drops Piloting, and has its own pilot track', () => {
    const names = scrapLancerRuleset.skills.map(s => s.name)
    expect(names).toEqual(expect.arrayContaining(['Gunnery', 'Melee', 'Repair']))
    expect(names).not.toContain('Piloting')
    expect(pilot.skills.map(s => s.name)).toEqual(['Gunnery', 'Melee', 'Mobility', 'Tech', 'Repair'])
    expect([1, 2, 3].map(l => caltrops.pilotSkillCostMax(scrapLancerRuleset, l))).toEqual([2, 3, 5])
    expect(lancerRuleset.skills.map(s => s.name)).toContain('Piloting')
  })

  it('rolls every part on a pilot skill, with Tech for energy weapons and sensors', () => {
    const names = pilot.skills.map(s => s.name)
    const skillOf = (family: string) => Array.from(new Set(mechs.attachments.filter(a => a.family === family).map(a => a.roll?.skill)))
    for (const a of mechs.attachments) if (a.roll) expect([a.name, names.includes(a.roll.skill)]).toEqual([a.name, true])
    for (const f of ['Lasers', 'Plasma', 'EM weapons']) expect([f, skillOf(f)]).toEqual([f, ['Tech']])
    for (const f of ['Machine guns', 'Autocannons', 'Cannons', 'Mortars and artillery', 'Mass drivers', 'Flamers', 'Rockets and missiles']) expect([f, skillOf(f)]).toEqual([f, ['Gunnery']])
    expect(mechs.attachments.find(a => a.name === 'SBL Sensor SA1')!.roll).toMatchObject({ aspect: 'Wit', skill: 'Tech' })
    expect(mechs.attachments.find(a => a.name === 'OHS Welding Rig WR1')!.roll).toMatchObject({ aspect: 'Knowledge', skill: 'Repair' })
  })

  it('gives every Evasive part the dodge roll', () => {
    const evasive = mechs.attachments.filter(a => (a.tags ?? '').split(',').some(t => t.trim() === 'Evasive'))
    expect(evasive.map(a => a.name).sort()).toEqual(['MAS Flicker FL1', 'MAS Vector VT2'])
    for (const a of evasive) expect([a.name, a.roll]).toEqual([a.name, { aspect: 'Reflex', skill: 'Mobility', bonus: 0, evasion: true }])
  })

  it('keeps pilot skills when a sheet loads', () => {
    expect(caltrops.importSheet({ pilotSkills: { Tech: 2, Melee: 0 } }).pilotSkills).toEqual({ Tech: 2 })
    expect(caltrops.importSheet({}).pilotSkills).toEqual({})
  })
})
