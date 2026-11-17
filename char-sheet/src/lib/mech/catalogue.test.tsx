import scrapLancerRuleset from '../../data/scraplancer'
import { applyPrefab, findAttachment, loadMech, newMech, normaliseMech, refitMech } from './loadout'
import { deriveStats, turnEnergy } from './derive'
import { activate, activationBlocker, adjustTurn, attack, newScene, newTurn, outOfRange, planCost, setCharges, shotsBlocker, sprint, sprintCost, weaponRoll, weaponTags } from './turn'
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

  it('gives every part a make, tier and price, and every chassis a tier', () => {
    for (const a of mr.attachments.filter(x => x.group !== 'Ammo')) {
      expect([a.name, !!a.make && !!a.tier && (a.price ?? 0) > 0]).toEqual([a.name, true])
    }
    for (const c of mr.chassis) expect([c.name, !!c.tier]).toEqual([c.name, true])
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

describe('each weapon rolls on its own', () => {
  it('fires each weapon as its own roll, each with only its own tags', () => {
    const m = prefab('Fortress')
    const counts = { [keyOf(m, 'ARH Thunderer 120')]: 1, [keyOf(m, 'BRO Twin AC-33')]: 2, [keyOf(m, 'BRO AC-30')]: 1 }
    expect(planCost(mr, m, counts)).toEqual({ energy: 12, heat: 14 })
    const res = attack(mr, m, 'Mid', counts, roll1)
    expect(res.mech.turn.energy).toBe(m.turn.energy - 12)
    expect(res.volleys.map(v => [v.name, v.shots, v.dice, v.penalty])).toEqual([
      ['ARH Thunderer 120', 1, 15, 1], ['BRO Twin AC-33', 2, 5, 0], ['BRO AC-30', 1, 5, 0],
    ])
    const scores = { Precision: 2, Gunnery: 1 }
    // The pilot's dice go on every roll; a Repeating weapon adds its dice per shot; the range penalty applies once.
    expect(res.volleys.map(v => weaponRoll(rules, v, 'Mid', scores)!.bonus)).toEqual([14, 10, 5])
    expect(weaponRoll(rules, res.volleys[1], 'Mid', scores)).toMatchObject({ attribute: { name: 'Precision', score: 2 }, skill: { name: 'Gunnery', score: 1 } })
    expect(weaponTags(mr, 'ARH Thunderer 120')).toContain('Piercing (2)')
    expect(weaponTags(mr, 'BRO AC-30')).toEqual(['Kinetic'])
    // No once-a-turn limit: a weapon with shots left can fire again this turn.
    expect(activationBlocker(mr, adjustTurn(res.mech, { energy: 9 }), keyOf(m, 'BRO Twin AC-33'), 'Mid')).toContain('Already activated 2×')
    expect(activationBlocker(mr, adjustTurn(res.mech, { energy: 9 }), keyOf(m, 'BRO AC-20'), 'Mid')).toBeNull()
  })

  it('stops a weapon early when it runs out of energy', () => {
    const m = adjustTurn(prefab('Fortress'), { energy: 7 })
    const res = attack(mr, m, 'Long', { [keyOf(m, 'ARH Thunderer 120')]: 1, [keyOf(m, 'BRO Twin AC-33')]: 2 }, roll1)
    expect(res.volleys.map(v => v.name)).toEqual(['ARH Thunderer 120'])
  })

  it('melee needs an Engaged target and uses the weapon aspect', () => {
    const m = prefab('Workhorse')
    const breaker = findAttachment(mr, 'OHS Breaker BH3')!
    expect(outOfRange(breaker, 'Short')).toBe(true)
    expect(outOfRange(breaker, 'Engaged')).toBe(false)
    const res = attack(mr, m, 'Engaged', { [keyOf(m, 'OHS Breaker BH3')]: 1 }, roll1)
    expect(weaponRoll(rules, res.volleys[0], 'Engaged', {})!.attribute!.name).toBe('Violence')
  })

  it('guns treat an Engaged target as Short', () => {
    const m = prefab('Workhorse')
    const res = attack(mr, m, 'Engaged', { [keyOf(m, 'BRO AC-30')]: 1 }, roll1)
    expect(res.volleys[0].penalty).toBe(1)
    expect(weaponRoll(rules, res.volleys[0], 'Engaged', {})!.attribute!.name).toBe('Reflex')
  })

  it('says why a shot count is blocked', () => {
    const m = adjustTurn(prefab('Workhorse'), { energy: 3 })
    const mg = keyOf(m, 'BRO M12'), ac = keyOf(m, 'BRO AC-30')
    expect(shotsBlocker(mr, m, { [ac]: 1 }, mg, 2, 'Short')).toBe('Not enough energy: 2 shots need 2 (+2 for the other weapons), have 3.')
    expect(shotsBlocker(mr, m, {}, mg, 2, 'Short')).toBeNull()
    expect(shotsBlocker(mr, m, {}, mg, 1, 'Long')).toBe('Out of range: reaches Short, target is Long.')
    const used = activate(mr, m, mg, roll1, 'Short').mech
    expect(shotsBlocker(mr, used, {}, mg, 2, 'Short')).toBe('Only 1 shot left this turn (Repeating 2).')
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
    expect(deriveStats(mr, m).heavy).toBe(1)
    expect(deriveStats(mr, m).speed).toBe(11)
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

  it('Sprint costs energy and heat equal to chassis size', () => {
    expect(sprintCost(mr, prefab('Kettle'))).toEqual({ energy: 1, heat: 1 })
    expect(sprintCost(mr, prefab('Scout'))).toEqual({ energy: 2, heat: 2 })
    expect(sprintCost(mr, prefab('Workhorse'))).toEqual({ energy: 3, heat: 3 })
    expect(sprintCost(mr, prefab('Fortress'))).toEqual({ energy: 5, heat: 5 })
    const m = prefab('Workhorse')
    expect(sprint(mr, m, roll1).mech.turn).toMatchObject({ energy: m.turn.energy - 3, heat: 3 })
  })

  it('overheat and cook-off rolls are reported for the VTT', () => {
    let m = adjustTurn(prefab('Workhorse'), { heat: 12 })
    const res = activate(mr, m, keyOf(m, 'BRO AC-30'), roll1, 'Mid')
    expect(res.rolls).toEqual([{ label: 'Overheat self-damage on BRO AC-30. Each success is a wound: mark by hand', dice: 5 }])
    m = { ...m, settings: { ...m.settings, autoHeatDamage: true } }
    const auto = activate(mr, m, keyOf(m, 'BRO AC-30'), roll1, 'Mid')
    expect(auto.rolls![0]).toMatchObject({ dice: 5, rolled: [1, 1, 1, 1, 1] })
    expect(auto.rolls![0].label).toContain('0 wounds (applied)')
  })

  it('Volatile parts cook off once when disabled', () => {
    let m = prefab('Scrapheap') // KR Hotpile F6, Volatile (8), core slots 2-3
    m = { ...m, sections: { ...m.sections, core: { ...m.sections.core, armour: null } } }
    const calls: number[] = []
    const roller = (n: number) => { calls.push(n); return Array(n).fill(1) }
    const res = applyWounds(mr, m, 'core', 4, { cookoff: true, roller })
    expect(calls).toEqual([8])
    expect(res.notices.some(n => n.includes('COOK-OFF: KR Hotpile F6'))).toBe(true)
    expect(res.rolls).toEqual([expect.objectContaining({ dice: 8, rolled: Array(8).fill(1) })])
    expect(res.rolls![0].label).toContain('Cook-off: KR Hotpile F6 in the Core → 0 hits (applied)')
    const pile = res.mech.sections.core.mounts.find(x => x.name === 'KR Hotpile F6')!
    expect(cookoffDice(mr, pile)).toBe(0)
  })
})
