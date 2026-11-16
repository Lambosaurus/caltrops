import scrapLancerRuleset from '../../data/scraplancer'
import { applyPrefab, findAttachment, loadMech, newMech, normaliseMech, refitMech } from './loadout'
import { deriveStats, turnEnergy } from './derive'
import { activate, activationBlocker, adjustTurn, clearShot, fireShot, newScene, newTurn, setCharges, shotRoll, shotTags } from './turn'
import { applyWounds, cookoffDice } from './damage'
import type { Mech } from './types'

const rules = scrapLancerRuleset
const mr = rules.mechs!
const roll1 = (n: number) => Array(n).fill(1)
const prefab = (name: string): Mech => {
  const p = mr.prefabs!.find(x => x.name === name)!
  return newMech(rules, p.chassis, name, name)
}
const countMounts = (m: Mech) => Object.values(m.sections).reduce((n, s) => n + s.mounts.length, 0)
const keyOf = (m: Mech, part: string): string => {
  for (const [id, s] of Object.entries(m.sections)) {
    const found = s.mounts.find(x => x.name === part)
    if (found) return `${id}:${found.start}`
  }
  throw new Error(part)
}

describe('Scrap Lancer catalogue', () => {
  it('has the doc catalogue: 21 chassis, 249 parts plus 6 ammo bins', () => {
    expect(mr.chassis).toHaveLength(21)
    expect(mr.attachments.filter(a => a.group !== 'Ammo')).toHaveLength(249)
    expect(mr.ammo.map(a => a.name)).toEqual(['Light', 'Standard', 'Missile', 'Heavy', 'Slug', 'Fuel'])
  })

  it('gives every part a make, tier and price, and every chassis a trait', () => {
    for (const a of mr.attachments.filter(x => x.group !== 'Ammo')) {
      expect([a.name, !!a.make && !!a.tier && (a.price ?? 0) > 0]).toEqual([a.name, true])
    }
    for (const c of mr.chassis) expect([c.name, !!c.trait && !!c.tier]).toEqual([c.name, true])
  })

  it('reads weapon numbers from the Parts tab', () => {
    expect(findAttachment(mr, 'BRO AC-50')).toMatchObject({ size: 4, energy: 3, heat: 3, repeat: 2, ammo: 'Standard', ammoPer: 2, range: 'Mid', roll: { skill: 'Gunnery', bonus: 8 } })
    expect(findAttachment(mr, 'HTC Halcyon HX-3')).toMatchObject({ cooling: 3, upkeep: 1, type: 'Tech' })
    expect(findAttachment(mr, 'OHS Breaker BH3')).toMatchObject({ type: 'Hand', range: 'Melee', roll: { aspect: 'Violence', skill: 'Melee', bonus: 2 } })
    expect(findAttachment(mr, 'HTC Phase P3')).toMatchObject({ heatSink: 3, heat: -3, charges: 1, recharge: 'scene' })
    expect(mr.tags!.Searing).toContain('gains X heat')
  })
})

describe('prefabs', () => {
  it('fit completely: every listed part is mounted and every section armoured', () => {
    expect(mr.prefabs!.length).toBeGreaterThanOrEqual(15)
    for (const p of mr.prefabs!) {
      const m = newMech(rules, p.chassis, p.name, p.name)
      const listed = Object.values(p.loadout).reduce((n, l) => n + l.mounts.length, 0)
      expect([p.name, countMounts(m)]).toEqual([p.name, listed])
      for (const s of Object.values(m.sections)) expect([p.name, !!s.armour]).toEqual([p.name, true])
      const d = deriveStats(mr, m)
      expect([p.name, d.hasReactor, d.hasCooling, turnEnergy(d) > 0]).toEqual([p.name, true, true, true])
      expect(m.turn.energy).toBe(turnEnergy(d))
    }
  })

  it('applyPrefab swaps chassis and loadout but keeps identity', () => {
    const m = { ...newMech(rules, 'KR Tinpot R0', 'Pot'), owner: 'sam' }
    const next = applyPrefab(rules, m, 'Fortress')
    expect(next).toMatchObject({ id: m.id, name: 'Pot', owner: 'sam', chassis: 'VDG Bastion VX-12' })
    expect(countMounts(next)).toBeGreaterThan(10)
  })

  it('old chassis names load onto their new names', () => {
    const old = loadMech({ rules: 'Scrap Lancer', chassis: 'Mule', sections: {} })
    expect(normaliseMech(mr, old).chassis).toBe('OHS Mule Mk II')
  })
})

describe('one shot a turn', () => {
  it('pools every weapon activation into one roll', () => {
    let m = prefab('Fortress')
    for (const part of ['ARH Thunderer 120', 'BRO Twin AC-33', 'BRO AC-30', 'BRO AC-20']) {
      m = activate(mr, m, keyOf(m, part), roll1, 'Mid').mech
    }
    expect(m.turn.shot.map(p => p.dice - p.penalty)).toEqual([14, 5, 5, 2])
    const info = shotRoll(rules, m, 'shot', { Precision: 2, Gunnery: 1 })!
    expect(info).toMatchObject({ attribute: { name: 'Precision', score: 2 }, skill: { name: 'Gunnery', score: 1 }, bonus: 26 })
    expect(shotTags(mr, m, 'shot')).toEqual(expect.arrayContaining(['Kinetic', 'Powerful', 'Piercing (2)', 'Concussive']))
    m = fireShot(m, 'shot')
    expect(m.turn.shot).toEqual([])
    expect(activationBlocker(mr, m, keyOf(m, 'BRO Twin AC-33'), 'Mid')).toContain('already made')
    m = newTurn(mr, m).mech
    expect(m.turn.fired).toEqual({})
    expect(activationBlocker(mr, m, keyOf(m, 'BRO Twin AC-33'), 'Mid')).toBeNull()
  })

  it('melee goes to a separate strike, and clearing drops the pool', () => {
    let m = prefab('Workhorse')
    m = activate(mr, m, keyOf(m, 'OHS Breaker BH3'), roll1, 'Short').mech
    expect(m.turn.strike).toHaveLength(1)
    expect(shotRoll(rules, m, 'strike', {})!.attribute!.name).toBe('Violence')
    expect(clearShot(m, 'strike').turn.strike).toEqual([])
  })

  it('Hungry weapons draw several rounds, across bins', () => {
    let m = { ...prefab('Workhorse') }
    m = applyPrefab(rules, m, 'Fortress')
    m = { ...m, settings: { ...m.settings, autoAmmo: true } }
    const before = m.sections.core.mounts.find(x => x.name === 'Ammo Bin: Heavy')!.ammo
    m = activate(mr, m, keyOf(m, 'ARH Thunderer 120'), roll1, 'Long').mech
    expect(m.sections.core.mounts.find(x => x.name === 'Ammo Bin: Heavy')!.ammo).toBe(before! - 1)
  })
})

describe('turn economy', () => {
  it('pumped coolers draw upkeep from each turn\'s energy', () => {
    const m = prefab('Workhorse')
    const d = deriveStats(mr, m)
    expect([d.energyOut, d.upkeep, turnEnergy(d)]).toEqual([6, 1, 5])
    expect(newTurn(mr, adjustTurn(m, { energy: 0 })).mech.turn.energy).toBe(5)
  })

  it('Heavy parts slow the mech', () => {
    const m = prefab('Junkyard Dog')
    expect(deriveStats(mr, m).heavy).toBe(5)
    expect(deriveStats(mr, m).speed).toBe(55)
  })

  it('adjustTurn sets values directly, floored at 0', () => {
    const m = adjustTurn(prefab('Kettle'), { heat: 9, energy: -4, pilotWounds: 2, shutdown: true })
    expect(m.turn).toMatchObject({ heat: 9, energy: 0, pilotWounds: 2, shutdown: true })
  })

  it('charges clamp, refill each scene, and refit restores everything', () => {
    let m = prefab('Ghost')
    const key = keyOf(m, 'HTC Phase P3')
    m = setCharges(mr, m, key, 99)
    expect(m.sections.rleg.mounts[0].charges).toBe(1)
    m = activate(mr, m, key, roll1, 'Short').mech
    expect(m.sections.rleg.mounts[0].charges).toBe(0)
    expect(newScene(mr, m).mech.sections.rleg.mounts[0].charges).toBe(1)
    m = applyWounds(mr, m, 'core', 6, { cookoff: false, roller: roll1 }).mech
    const fixed = refitMech(mr, m)
    expect(Object.values(fixed.sections).every(s => s.wounds.every(w => !w))).toBe(true)
    expect(fixed.sections.core.armour!.points).toBe(7)
    expect(fixed.sections.rleg.mounts[0].charges).toBe(1)
  })

  it('self-repairing armour regains a point each New turn', () => {
    const m = applyWounds(mr, prefab('Ghost'), 'core', 2, { cookoff: false, roller: roll1 }).mech
    expect(m.sections.core.armour!.points).toBe(5)
    expect(newTurn(mr, m).mech.sections.core.armour!.points).toBe(6)
  })

  it('Volatile parts cook off once when disabled', () => {
    let m = prefab('Scrapheap') // KR Hotpile F6, Volatile (8), core slots 2-3
    m = { ...m, sections: { ...m.sections, core: { ...m.sections.core, armour: null } } }
    const calls: number[] = []
    const roller = (n: number) => { calls.push(n); return Array(n).fill(1) }
    const res = applyWounds(mr, m, 'core', 4, { cookoff: true, roller })
    expect(calls).toEqual([8])
    expect(res.notices.some(n => n.includes('COOK-OFF: KR Hotpile F6'))).toBe(true)
    const pile = res.mech.sections.core.mounts.find(x => x.name === 'KR Hotpile F6')!
    expect(cookoffDice(mr, pile)).toBe(0)
  })
})
