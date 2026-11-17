import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech, mountKey, findAttachment } from '../../lib/mech/loadout'
import scrapLancerRuleset from '../../data/scraplancer'
import {
  aimText, attachmentPop, costText, emptySlotPop, keyStats, mountPop, passiveText, sectionPop, slotTag, slotTypePop,
  statPop, tagList, unknownPartPop, type PopText,
} from './mechText'

const rules: any = { name: 'x', mechs: FIXTURE_RULES }
const mule = () => newMech(rules, 'Mule', 'M')
const chassis = FIXTURE_RULES.chassis[0]
const sec = (id: string) => chassis.sections.find(s => s.id === id)!
const att = (n: string) => FIXTURE_RULES.attachments.find(a => a.name === n)!
const text = (p: PopText) => [
  p.title, p.sub, ...(p.stats ?? []).map(s => `${s.value} ${s.label ?? ''}`.trim()), ...(p.status ?? []).map(s => s.text),
  ...(p.tags ?? []).map(t => `${t.name} · ${t.text}`), ...p.lines, p.note,
].filter(Boolean).join('\n')

const SL = scrapLancerRuleset.mechs!
const slPart = (n: string) => findAttachment(SL, n)!

test('section popover: hit range and aim in the sub line, numbers as stats', () => {
  const p = sectionPop(FIXTURE_RULES, mule(), sec('lleg'))
  expect(p.sub).toBe('d12 1–2 · aimed shot −3 dice')
  expect(p.stats).toEqual(expect.arrayContaining([{ value: '6', label: 'Speed tiles' }, { value: '1', label: 'Evasion' }]))
})

test('aim text', () => {
  expect(aimText(sec('lleg'))).toBe('(hit: 1–2) · aim 3')
  expect(aimText(sec('shoulder'))).toBe('(hit: 12) · aim 4')
})

test('destroyed section is flagged in red', () => {
  const m = mule()
  m.sections.lleg.wounds = m.sections.lleg.wounds.map(() => true)
  expect(sectionPop(FIXTURE_RULES, m, sec('lleg')).status).toEqual([{ text: 'DESTROYED', tone: 'bad' }])
})

test('slot tags and passive text', () => {
  expect(slotTag('Weapon')).toBe('WEAP')
  expect(slotTag('')).toBe('')
  expect(passiveText(att('Dipole Fusion Reactor'))).toBe('+6E +2H')
  expect(passiveText(att('Heat Exchanger'))).toBe('−3H')
  expect(passiveText(att('Heat Sink'))).toBe('+2 max')
  expect(passiveText(att('Machine Gun'))).toBeNull()
  expect(costText(att('Machine Gun'))).toBe('1E +1H')
})

test('a weapon shows its dice, range, cost and repeats as headline numbers', () => {
  expect(keyStats(FIXTURE_RULES, att('Machine Gun')).map(s => `${s.value} ${s.label ?? ''}`.trim()))
    .toEqual(['+2 dice', 'Short', '1E +1H each', '×2 a turn', '1 Light ammo'])
  expect(text(attachmentPop(FIXTURE_RULES, att('Ammo Bin: Light')))).toContain('2d4 cook-off while loaded')
})

test('tags get one short line each, with their number filled in', () => {
  const tags = tagList(SL, 'Kinetic, Piercing (2), Repeating (2), Armoured vs Thermal')
  expect(tags).toEqual([
    { name: 'Kinetic', text: 'damage type' },
    { name: 'Piercing (2)', text: '2 wounds skip armour' },
    { name: 'Armoured vs Thermal', text: 'Thermal attacks against it lose 1 success' },
  ])
})

test('no design notes reach a popover', () => {
  for (const a of SL.attachments) {
    const t = text(attachmentPop(SL, a))
    expect([a.name, /\bWas \w|\(call\)|Replaces /.test(t)]).toEqual([a.name, false])
  }
  // Play popovers leave out the shop details and flavour entirely.
  const m = newMech(scrapLancerRuleset, 'OHS Mule Mk II', 'W', 'Workhorse')
  const mount = m.sections.larm.mounts.find(x => x.name === 'BRO AC-30')!
  const p = mountPop(SL, m, 'larm', mount, mountKey('larm', mount.start), true)
  expect(text(p)).not.toMatch(/Solari|Standard ·|The baseline/)
  expect(p.stats!.map(s => s.value)).toEqual(['+5', 'Mid', '2E +2H', '1'])
})

test('mount popover shows live state, and why it cannot activate', () => {
  const m = mule()
  m.turn.energy = 0
  const mount = m.sections.rarm.mounts.find(x => x.start === 1)!
  const key = mountKey('rarm', 1)
  expect(mountPop(FIXTURE_RULES, m, 'rarm', mount, key, true).status).toEqual([{ text: 'Not enough energy: needs 1, have 0.', tone: 'warn' }])
  expect(mountPop(FIXTURE_RULES, m, 'rarm', mount, key, false).status).toEqual([])
  m.sections.rarm.wounds[1] = true
  expect(mountPop(FIXTURE_RULES, m, 'rarm', mount, key, true).status![0]).toEqual({ text: 'DISABLED: every slot wounded', tone: 'bad' })
})

test('stat popovers', () => {
  const m = mule()
  expect(statPop(FIXTURE_RULES, m, 'speed').title).toBe('Speed 12 tiles / turn')
  expect(statPop(FIXTURE_RULES, m, 'heat').sub).toBe('Heat Max 7 chassis +2 sinks')
  m.turn.heat = 12
  expect(statPop(FIXTURE_RULES, m, 'heat').status![0].tone).toBe('bad')
})

test('speed popover gives the size-based sprint cost', () => {
  const m = newMech(scrapLancerRuleset, 'VDG Bastion VX-12', 'F', 'Fortress')
  expect(text(statPop(SL, m, 'speed'))).toContain('Sprint: 8 tiles (80 m) for 5E +5H')
  expect(slPart('MAS Flicker FL1').tags).toContain('Evasive')
})

test('slot type text and unknown part', () => {
  expect(slotTypePop(FIXTURE_RULES, 'Hull').title).toBe('Hull slot')
  expect(emptySlotPop(FIXTURE_RULES, '', true).lines.join('\n')).toContain('Drag a matching part')
  expect(unknownPartPop('Zap').title).toBe('Unknown part: Zap')
})
