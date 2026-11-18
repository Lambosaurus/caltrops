import scrapLancerRuleset from '../../data/scraplancer'
import { newMech, setArmour } from './loadout'
import { setArmourPoints, toggleWound } from './damage'
import { mechEffects, tagSummary } from './effects'
import type { Mech } from './types'

const mr = scrapLancerRuleset.mechs!
const prefab = (name: string): Mech => {
  const p = mr.prefabs!.find(x => x.name === name)!
  return newMech(scrapLancerRuleset, p.chassis, name, name)
}

describe('tagSummary', () => {
  it('fills in the number and damage type', () => {
    expect(tagSummary(mr, 'Deflection (2)')).toBe('cancels 2 incoming successes until your next turn')
    expect(tagSummary(mr, 'Armoured vs Kinetic (while it has points)')).toBe('Kinetic attacks against it lose 1 success')
    expect(tagSummary(mr, 'Heavy (2)')).toBe('−2 tiles of Speed')
  })
})

describe('mechEffects', () => {
  it('lists only the ruleset effect tags of fitted parts, with their source part and section', () => {
    const fx = mechEffects(mr, prefab('Thumper'))
    expect(fx.map(e => e.tag)).toEqual(['Ranging', 'Long-sight'])
    expect(fx[0]).toMatchObject({ part: 'SBL Rangefinder RF2', section: 'Cockpit', working: true, text: 'no −1 die for a closer band' })
  })

  it('marks an effect not working once its part is disabled', () => {
    let m = prefab('Snare')
    expect(mechEffects(mr, m)).toEqual([expect.objectContaining({ tag: 'Jamming', part: 'SBL Jammer J1', working: true })])
    m = toggleWound(mr, m, 'cockpit', 0)
    expect(mechEffects(mr, m)[0].working).toBe(false)
  })

  it('notes qualifiers such as Frontal beside the effect', () => {
    const m = { ...prefab('Snare') }
    m.sections = { ...m.sections, larm: { ...m.sections.larm, mounts: [{ name: 'AWP Riot Shield SH1', start: 0 }] } }
    const shield = mechEffects(mr, m).find(e => e.base === 'Deflection')!
    expect(shield).toMatchObject({ tag: 'Deflection (1)', notes: ['Frontal'], working: true })
  })

  it('counts armour effects only while the armour has points', () => {
    let m = setArmour(mr, prefab('Snare'), 'core', 'AWP Laminate L4')
    expect(mechEffects(mr, m).find(e => e.base === 'Armoured')).toMatchObject({ tag: 'Armoured vs Kinetic', section: 'Core', working: true })
    m = setArmourPoints(mr, m, 'core', 0)
    expect(mechEffects(mr, m).find(e => e.base === 'Armoured')!.working).toBe(false)
  })

  it('is empty for a ruleset that names no effect tags', () => {
    expect(mechEffects({ ...mr, effectTags: undefined }, prefab('Thumper'))).toEqual([])
  })
})
