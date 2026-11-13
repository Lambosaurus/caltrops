import { DEFAULT_RULES, Rules } from '../lib/rules'
import type { MechAttachment, MechRules } from '../lib/mech/types'
import lancerRuleset from './lancer'

const att = (a: MechAttachment): MechAttachment => a

const mechs: MechRules = {
    slotTypes: [
        { name: '', label: 'Untyped', color: '#46536e', description: 'Untyped slot. Takes Generic attachments only (ammo bins, heat sinks, fins, jump jets, stowage).' },
        { name: 'Hull', label: 'Hull', color: '#7d8aa3', description: 'Hull slot. Holds nothing; extra structure that soaks a wound. Chassis use these to add toughness without adding mounting space.' },
        { name: 'Reactor', label: 'Reactor', color: '#f2a024', description: 'Reactor slot. Reactors only, or any Generic attachment. The run of Reactor slots caps how big a reactor the chassis can take.' },
        { name: 'Weapon', label: 'Weapon', color: '#ff5c6c', description: 'Weapon slot. Guns and launchers, or any Generic attachment.' },
        { name: 'Tech', label: 'Tech', color: '#20d6fa', description: 'Tech slot. Exchangers, capacitors, sensors and field generators, or any Generic attachment.' },
        { name: 'Hand', label: 'Hand', color: '#c58cff', description: 'Hand slot. Manipulators and hand-held melee weapons, or any Generic attachment.' },
        { name: 'Armour', label: 'Armour', color: '#24e076', description: 'Armour slot. Holds one armour attachment; its points soak wounds before any slot in this section.' },
        { name: 'Generic', label: 'Generic', color: '#d8dee9', description: 'Fits any slot except Armour and Hull.' },
    ],
    chassis: [
        {
            name: 'Jackal', description: 'Light scout.', heatMax: 6, shape: 'biped',
            sections: [
                { id: 'cockpit', name: 'Cockpit', range: [11, 12], slots: ['Tech'], transfer: 'pilot', area: '1 / 3 / 2 / 5' },
                { id: 'larm', name: 'Left arm', range: [5, 5], slots: ['Hand', 'Weapon'], transfer: 'core', area: '2 / 1 / 3 / 3' },
                { id: 'core', name: 'Core', range: [6, 9], slots: ['Hull', 'Reactor', 'Reactor', ''], transfer: null, area: '2 / 3 / 3 / 5' },
                { id: 'rarm', name: 'Right arm', range: [10, 10], slots: ['Weapon', 'Weapon'], transfer: 'core', area: '2 / 5 / 3 / 7' },
                { id: 'lleg', name: 'Left leg', range: [1, 2], slots: ['Hull', ''], transfer: 'core', provides: { speed: 40, evasion: 2 }, area: '3 / 2 / 4 / 4' },
                { id: 'rleg', name: 'Right leg', range: [3, 4], slots: ['Hull', ''], transfer: 'core', provides: { speed: 40, evasion: 2 }, area: '3 / 4 / 4 / 6' },
            ],
            loadout: {
                core: { armour: 'Plating', mounts: [['Salvage Fission Pile', 1], ['Radiator Fins', 3]] },
                cockpit: { armour: 'Plating', mounts: [['Heat Exchanger', 0]] },
                larm: { armour: 'Plating', mounts: [['Manipulator', 0], ['Machine Gun', 1]] },
                rarm: { armour: 'Plating', mounts: [['Laser', 0]] },
                lleg: { armour: 'Plating', mounts: [['Ammo Bin: Light', 1]] },
                rleg: { armour: 'Plating', mounts: [['Stowage Rack', 1]] },
            },
        },
        {
            name: 'Mule', description: 'Medium salvager.', heatMax: 7, shape: 'biped',
            sections: [
                { id: 'cockpit', name: 'Cockpit', range: [11, 11], slots: ['Hull', 'Tech'], transfer: 'pilot', area: '1 / 3 / 2 / 5' },
                { id: 'larm', name: 'Left arm', range: [5, 6], slots: ['Hand', 'Weapon', 'Weapon'], transfer: 'core', area: '2 / 1 / 3 / 3' },
                { id: 'core', name: 'Core', range: [7, 9], slots: ['Hull', 'Reactor', 'Reactor', 'Tech', '', ''], transfer: null, area: '2 / 3 / 3 / 5' },
                { id: 'rarm', name: 'Right arm', range: [10, 10], slots: ['Hand', 'Weapon'], transfer: 'core', area: '2 / 5 / 3 / 7' },
                { id: 'shoulder', name: 'Right shoulder', range: [12, 12], slots: ['Weapon', ''], transfer: 'core', area: '1 / 5 / 2 / 7' },
                { id: 'lleg', name: 'Left leg', range: [1, 2], slots: ['Hull', '', ''], transfer: 'core', provides: { speed: 30, evasion: 1 }, area: '3 / 2 / 4 / 4' },
                { id: 'rleg', name: 'Right leg', range: [3, 4], slots: ['Hull', '', ''], transfer: 'core', provides: { speed: 30, evasion: 1 }, area: '3 / 4 / 4 / 6' },
            ],
            loadout: {
                core: { armour: 'Composite Plating', mounts: [['Dipole Fusion Reactor', 1], ['Heat Exchanger', 3], ['Ammo Bin: Light', 4], ['Ammo Bin: Standard', 5]] },
                shoulder: { armour: 'Plating', mounts: [['SRM Rack', 0], ['Ammo Bin: Missile', 1]] },
                cockpit: { armour: 'Plating', mounts: [['Sensor Array', 1]] },
                larm: { armour: 'Plating', mounts: [['Manipulator', 0], ['Autocannon', 1]] },
                rarm: { armour: 'Plating', mounts: [['Breaching Hammer', 0], ['Machine Gun', 1]] },
                lleg: { armour: 'Plating', mounts: [['Jump Jets', 1], ['Heat Sink', 2]] },
                rleg: { armour: 'Plating', mounts: [['Stowage Rack', 1], ['Radiator Fins', 2]] },
            },
        },
        {
            name: 'Bulwark', description: 'Heavy tracked.', heatMax: 9, shape: 'tracked',
            sections: [
                { id: 'cockpit', name: 'Cockpit', range: [12, 12], slots: ['Hull', 'Tech', 'Tech'], transfer: 'pilot', area: '1 / 3 / 2 / 5' },
                { id: 'larm', name: 'Left arm', range: [3, 4], slots: ['Hull', 'Weapon', 'Weapon', 'Weapon'], transfer: 'core', area: '2 / 1 / 3 / 3' },
                { id: 'core', name: 'Core', range: [5, 9], slots: ['Hull', 'Hull', 'Reactor', 'Reactor', 'Reactor', '', '', '', ''], transfer: null, area: '2 / 3 / 3 / 5' },
                { id: 'rarm', name: 'Right arm', range: [10, 11], slots: ['Hull', 'Weapon', 'Weapon', 'Weapon'], transfer: 'core', area: '2 / 5 / 3 / 7' },
                { id: 'treads', name: 'Treads', range: [1, 2], slots: ['Hull', 'Hull', '', '', ''], transfer: 'core', provides: { speed: 40, evasion: 1 }, area: '3 / 2 / 4 / 6' },
            ],
            loadout: {
                core: { armour: 'Composite Plating', mounts: [['Arc-point Fusion Reactor', 2], ['Ammo Bin: Heavy', 5], ['Ammo Bin: Heavy', 6], ['Radiator Fins', 7], ['Heat Sink', 8]] },
                cockpit: { armour: 'Composite Plating', mounts: [['Sensor Array', 1], ['Heat Exchanger', 2]] },
                larm: { armour: 'Composite Plating', mounts: [['Heavy Cannon', 1]] },
                rarm: { armour: 'Composite Plating', mounts: [['Missile Rack', 1], ['Ammo Bin: Missile', 3]] },
                treads: { armour: 'Composite Plating', mounts: [['Stowage Rack', 2], ['Stowage Rack', 3]] },
            },
        },
    ],
    attachments: [
        att({ name: 'Salvage Fission Pile', size: 2, type: 'Reactor', group: 'Power', tags: 'Volatile', description: 'A crude salvaged pile. Cheap, hot, and not something you want shot.', reactor: { energy: 5, heat: 2 } }),
        att({ name: 'Dipole Fusion Reactor', size: 2, type: 'Reactor', group: 'Power', tags: '', description: 'Reliable mid-grade fusion plant. The salvager standard.', reactor: { energy: 6, heat: 2 } }),
        att({ name: 'Arc-point Fusion Reactor', size: 3, type: 'Reactor', group: 'Power', tags: '', description: 'High-output reactor. Powers a heavy loadout, but runs hot.', reactor: { energy: 8, heat: 3 } }),
        att({ name: 'Capacitor', size: 1, type: 'Tech', group: 'Power', tags: '', description: 'Banks unspent energy into next turn instead of losing it.', capacitor: 3 }),
        att({ name: 'Radiator Fins', size: 1, type: 'Generic', group: 'Cooling', tags: '', description: 'Passive radiator panels. Weak, but they fit anywhere.', cooling: 1 }),
        att({ name: 'Heat Exchanger', size: 1, type: 'Tech', group: 'Cooling', tags: '', description: 'Passive coolant loop tied into the core.', cooling: 3 }),
        att({ name: 'Heat Sink', size: 1, type: 'Generic', group: 'Cooling', tags: '', description: 'Thermal mass. Raises Heat Max while it works; lose it and your ceiling drops.', heatSink: 2 }),
        att({ name: 'Active Cooling', size: 1, type: 'Tech', group: 'Cooling', tags: '', description: 'Spend energy to force heat out on demand.', energy: 3, heat: -4, effect: 'Dump 4 heat' }),
        att({ name: 'Coolant Flush', size: 1, type: 'Generic', group: 'Cooling', tags: '', description: 'Single-use coolant purge. Refilled at a haven.', energy: 0, heat: -6, charges: 2, effect: 'Emergency purge' }),
        att({ name: 'Machine Gun', size: 1, type: 'Weapon', group: 'Weapons', tags: 'Short, Kinetic', description: 'Cheap, fast and hungry for ammo.', energy: 1, heat: 1, ammo: 'Light', repeat: 2, range: 'Short', roll: { skill: 'Gunnery', bonus: 2 } }),
        att({ name: 'Autocannon', size: 2, type: 'Weapon', group: 'Weapons', tags: 'Mid, Kinetic', description: 'Workhorse gun of the salvage lances.', energy: 2, heat: 2, ammo: 'Standard', range: 'Mid', roll: { skill: 'Gunnery', bonus: 3 } }),
        att({ name: 'Heavy Cannon', size: 3, type: 'Weapon', group: 'Weapons', tags: 'Long, Kinetic', description: 'Big gun, big ammo. Needs 3 consecutive Generic slots.', energy: 2, heat: 2, ammo: 'Heavy', range: 'Long', roll: { skill: 'Gunnery', bonus: 4 } }),
        att({ name: 'Laser', size: 2, type: 'Weapon', group: 'Weapons', tags: 'Mid, Thermal', description: 'No ammo, but heavy on energy and heat.', energy: 3, heat: 3, range: 'Mid', roll: { skill: 'Gunnery', bonus: 3 } }),
        att({ name: 'Missile Rack', size: 2, type: 'Weapon', group: 'Weapons', tags: 'Long, Indirect, Explosive', description: 'Each missile is an automatic success against a locked target.', energy: 1, heat: 1, ammo: 'Missile', repeat: 3, range: 'Long', effect: '1 automatic success per missile vs a locked target' }),
        att({ name: 'SRM Rack', size: 1, type: 'Weapon', group: 'Weapons', tags: 'Short, Explosive', description: 'Dumbfire short-range missiles. No lock needed; one volley per activation.', energy: 1, heat: 1, ammo: 'Missile', repeat: 2, range: 'Short', roll: { skill: 'Gunnery', bonus: 2 } }),
        att({ name: 'Flamer', size: 1, type: 'Weapon', group: 'Weapons', tags: 'Short, Area 1, Thermal', description: 'Powerful against infantry and flesh.', energy: 1, heat: 3, range: 'Short', roll: { skill: 'Gunnery', bonus: 2 } }),
        att({ name: 'Arc Lance', size: 2, type: 'Weapon', group: 'Weapons', tags: 'Short, EM', description: 'Ignores deflection. 2 successes may disable an attachment instead of wounding.', energy: 3, heat: 2, range: 'Short', roll: { skill: 'Gunnery', bonus: 2 } }),
        att({ name: 'Breaching Hammer', size: 1, type: 'Hand', group: 'Weapons', tags: 'Melee, Kinetic', description: 'Spend 2 extra energy for Powerful.', energy: 1, heat: 1, range: 'Melee', roll: { aspect: 'Violence', skill: 'Melee', bonus: 3 } }),
        att({ name: 'Rotary Saw', size: 1, type: 'Hand', group: 'Weapons', tags: 'Melee, Kinetic', description: '+1 die each consecutive turn on the same target.', energy: 1, heat: 1, range: 'Melee', roll: { aspect: 'Control', skill: 'Melee', bonus: 2 } }),
        att({ name: 'Manipulator', size: 1, type: 'Hand', group: 'Utility', tags: 'Melee', description: 'A working hand. Grab, carry, use handheld gear, or punch.', hand: true, energy: 1, heat: 1, range: 'Melee', roll: { aspect: 'Violence', skill: 'Melee', bonus: 0 }, effect: 'Punch' }),
        att({ name: 'Sensor Array', size: 1, type: 'Tech', group: 'Utility', tags: '', description: 'One target lock per success. Locks give +1 die and enable indirect fire.', energy: 1, heat: 1, roll: { aspect: 'Wit', skill: 'Computing', bonus: 0 }, effect: 'Target locks' }),
        att({ name: 'Field Generator', size: 2, type: 'Tech', group: 'Utility', tags: 'Deflection 1', description: 'Until your next turn: Armoured vs Kinetic, Weak vs EM.', energy: 2, heat: 4, effect: 'Deflection 1; Armoured vs Kinetic' }),
        att({ name: 'Jump Jets', size: 1, type: 'Generic', group: 'Utility', tags: '', description: 'Jump up to Speed over obstacles.', energy: 2, heat: 2, effect: 'Jump; +2 melee on landing' }),
        att({ name: 'Stowage Rack', size: 1, type: 'Generic', group: 'Utility', tags: '', stowage: 3 }),
        att({ name: 'Ammo Bin: Light', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '16 small rounds for machine guns. Cooks off if disabled while loaded.', bin: 'Light' }),
        att({ name: 'Ammo Bin: Standard', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '8 rounds for autocannons. Cooks off if disabled while loaded.', bin: 'Standard' }),
        att({ name: 'Ammo Bin: Heavy', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '4 big shells for heavy cannons. Cooks off if disabled while loaded.', bin: 'Heavy' }),
        att({ name: 'Ammo Bin: Missile', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '5 missiles for missile and SRM racks. Cooks off if disabled while loaded.', bin: 'Missile' }),
        att({ name: 'Plating', type: 'Armour', group: 'Armour', tags: '', description: 'Basic armour plate.', armour: 2 }),
        att({ name: 'Composite Plating', type: 'Armour', group: 'Armour', tags: '', description: 'Layered armour. One extra point.', armour: 3 }),
        att({ name: 'Ablative Plating', type: 'Armour', group: 'Armour', tags: 'Armoured vs Thermal (while it has points)', description: 'Burns away instead of you.', armour: 2 }),
        att({ name: 'Reactive Plating', type: 'Armour', group: 'Armour', tags: 'Armoured vs Explosive (while it has points)', description: 'Detonating tiles that blunt blasts.', armour: 2 }),
    ],
    ammo: [
        { name: 'Light', perBin: 16, volatility: 1 },
        { name: 'Standard', perBin: 8, volatility: 2 },
        { name: 'Missile', perBin: 5, volatility: 3 },
        { name: 'Heavy', perBin: 4, volatility: 4 },
    ],
    rangeAspects: { Short: 'Reflex', Mid: 'Precision', Long: 'Precision' },
    sprint: { energy: 2, heat: 2 },
    sittingDuck: 2,
    stunned: 1,
}

const scrapLancerRuleset: Rules = {
    ...DEFAULT_RULES,

    name: 'Scrap Lancer',
    theme: 'lancers',
    useAspects: true,
    attributes: DEFAULT_RULES.attributes,
    levelup: { ...lancerRuleset.levelup },
    skills: lancerRuleset.skills.map(s => s.name === 'Gunnary' ? { ...s, name: 'Gunnery' } : { ...s }),
    currency: [
        { name: 'Solari', precision: 1 },
        { name: 'U', precision: 1 },
    ],
    equipment: [
        ...lancerRuleset.equipment.filter(e => e.tag === 'handheld'),
        ...DEFAULT_RULES.equipment,
    ],
    containers: [
        { name: 'Personal', size: 5, tags: ['handheld', 'custom'] },
        { name: 'Pack', size: 5 },
    ],
    wounds: [
        { name: 'Body', size: 5 },
    ],
    powers: lancerRuleset.powers,
    mechs,
}

export default scrapLancerRuleset
