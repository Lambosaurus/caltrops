import scrapLancerRuleset from '../../data/scraplancer'
import { newMech } from './loadout'
import { mountDisabled, mountWrecked } from './derive'
import { activationBlocker } from './turn'
import { toggleDisrupt, toggleWound } from './damage'
import { mechEffects } from './effects'
import type { Mech } from './types'

const rules = scrapLancerRuleset
const mr = rules.mechs!
const workhorse = (): Mech => newMech(rules, 'OHS Mule Mk II', 'Workhorse', 'Workhorse')
const ac = (m: Mech) => m.sections.larm.mounts.find(x => x.name === 'BRO AC-30')!

test('disrupting a part disables it without wounding it', () => {
  const m = toggleDisrupt(mr, workhorse(), 'larm', ac(workhorse()).start)
  expect(ac(m).disrupted).toBe(true)
  expect(m.sections.larm.wounds.some(Boolean)).toBe(false)
  expect(mountDisabled(mr, m, 'larm', ac(m))).toBe(true)
  expect(mountWrecked(mr, m, 'larm', ac(m))).toBe(false)
  expect(activationBlocker(mr, m, `larm:${ac(m).start}`)).toBe('Disrupted: disabled until repaired.')
})

test('a disrupted part stays disrupted through wound repairs and is restored by toggling again', () => {
  const start = ac(workhorse()).start
  let m = toggleDisrupt(mr, workhorse(), 'larm', start)
  m = toggleWound(mr, toggleWound(mr, m, 'larm', start), 'larm', start)
  expect(ac(m).disrupted).toBe(true)
  m = toggleDisrupt(mr, m, 'larm', start)
  expect(ac(m).disrupted).toBeFalsy()
  expect(activationBlocker(mr, m, `larm:${start}`)).toBeNull()
})

test('any slot of a large part disrupts the whole part; an empty slot does nothing', () => {
  const m = workhorse()
  const big = Object.entries(m.sections).flatMap(([id, s]) => s.mounts.map(x => ({ id, x })))
    .find(({ x }) => (mr.attachments.find(a => a.name === x.name)?.size ?? 1) > 1)!
  const next = toggleDisrupt(mr, m, big.id, big.x.start + 1)
  expect(next.sections[big.id].mounts.find(x => x.start === big.x.start)!.disrupted).toBe(true)
  const empty = m.sections.core.wounds.findIndex((_, i) => !m.sections.core.mounts.some(x => i >= x.start && i < x.start + (mr.attachments.find(a => a.name === x.name)?.size ?? 1)))
  if (empty >= 0) expect(toggleDisrupt(mr, m, 'core', empty)).toBe(m)
})

test('Analog parts cannot be disrupted', () => {
  const m = workhorse()
  const fin = m.sections.rleg.mounts.find(x => x.name === 'CWF Fin-1')!
  const analog: Mech = { ...m, sections: { ...m.sections, rleg: { ...m.sections.rleg, mounts: m.sections.rleg.mounts.map(x => (x === fin ? { ...x, name: 'GWC Radiator Pattern 5' } : x)) } } }
  expect(toggleDisrupt(mr, analog, 'rleg', fin.start)).toBe(analog)
})

test('the Effects panel shows a disrupted part as lost', () => {
  const snare = newMech(rules, 'HCA Picket Block 1', 'Snare', 'Snare')
  const jam = mechEffects(mr, snare).find(e => e.base === 'Jamming')!
  const [id, s] = Object.entries(snare.sections).find(([, s]) => s.mounts.some(x => x.name === jam.part))!
  const next = toggleDisrupt(mr, snare, id, s.mounts.find(x => x.name === jam.part)!.start)
  expect(mechEffects(mr, next).find(e => e.base === 'Jamming')!.working).toBe(false)
})
