import { FIXTURE_RULES } from '../../lib/mech/fixture'
import { newMech, mountKey } from '../../lib/mech/loadout'
import { aimText, attachmentStats, costText, emptySlotPop, mountPop, passiveText, sectionPop, slotTag, slotTypePop, statPop, unknownPartPop } from './mechText'

const rules: any = { name: 'x', mechs: FIXTURE_RULES }
const mule = () => newMech(rules, 'Mule', 'M')
const chassis = FIXTURE_RULES.chassis[0]
const sec = (id: string) => chassis.sections.find(s => s.id === id)!
const att = (n: string) => FIXTURE_RULES.attachments.find(a => a.name === n)!
const text = (p: { title: string, sub?: string, lines: string[] }) => [p.title, p.sub, ...p.lines].join('\n')

test('section popover for the left leg shows provides and hit text', () => {
  const t = text(sectionPop(FIXTURE_RULES, mule(), sec('lleg')))
  expect(t).toContain('Speed 30')
  expect(t).toContain('Evasion 1')
  expect(t).toContain('(hit: 1–2) · aim 3')
})

test('aim text', () => {
  expect(aimText(sec('lleg'))).toBe('(hit: 1–2) · aim 3')
  expect(aimText(sec('shoulder'))).toBe('(hit: 12) · aim 4')
})

test('destroyed section is flagged', () => {
  const m = mule()
  m.sections.lleg.wounds = m.sections.lleg.wounds.map(() => true)
  expect(text(sectionPop(FIXTURE_RULES, m, sec('lleg')))).toContain('DESTROYED')
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

test('attachment stats list activation and cook-off', () => {
  expect(attachmentStats(FIXTURE_RULES, att('Machine Gun')).join('\n')).toContain('Repeating 2')
  expect(attachmentStats(FIXTURE_RULES, att('Ammo Bin: Light')).join('\n')).toContain('Cook-off: 1d4 per round left (16d4 when full)')
})

test('mount popover offers activation when allowed', () => {
  const m = mule()
  m.turn.energy = 6
  const mount = m.sections.rarm.mounts.find(x => x.start === 1)!
  const key = mountKey('rarm', 1)
  expect(text(mountPop(FIXTURE_RULES, m, 'rarm', mount, key, true))).toContain('Click the button to activate.')
  expect(text(mountPop(FIXTURE_RULES, m, 'rarm', mount, key, false))).toContain('Read only.')
})

test('stat popovers', () => {
  const m = mule()
  expect(statPop(FIXTURE_RULES, m, 'speed').title).toBe('Speed 60')
  expect(text(statPop(FIXTURE_RULES, m, 'heat'))).toContain('Heat Max 7 chassis')
})

test('slot type text and unknown part', () => {
  expect(slotTypePop(FIXTURE_RULES, 'Hull').title).toBe('Hull slot')
  expect(emptySlotPop(FIXTURE_RULES, '', true).lines.join('\n')).toContain('Drag a matching part')
  expect(unknownPartPop('Zap').title).toBe('Unknown part: Zap')
})
