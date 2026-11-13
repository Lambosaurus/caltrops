import type { MechRules, MechAttachment } from './types'

const att = (a: MechAttachment): MechAttachment => a

export const FIXTURE_RULES: MechRules = {
  slotTypes: [
    { name: '', label: 'Untyped', color: '#888888', description: 'Takes Generic attachments only.' },
    { name: 'Hull', label: 'Hull', color: '#7a6a55', description: 'Holds nothing; extra structure that soaks a wound.' },
    { name: 'Reactor', label: 'Reactor', color: '#c8a030', description: 'Reactors, or any Generic attachment.' },
    { name: 'Weapon', label: 'Weapon', color: '#c04040', description: 'Guns and launchers, or any Generic attachment.' },
    { name: 'Tech', label: 'Tech', color: '#3080c0', description: 'Exchangers, capacitors, sensors, or any Generic attachment.' },
    { name: 'Hand', label: 'Hand', color: '#40a060', description: 'Manipulators and hand-held melee weapons, or any Generic attachment.' },
  ],
  chassis: [{
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
  }],
  attachments: [
    att({ name: 'Dipole Fusion Reactor', size: 2, type: 'Reactor', group: 'Power', tags: '', description: 'Reliable mid-grade fusion plant. The salvager standard.', reactor: { energy: 6, heat: 2 } }),
    att({ name: 'Radiator Fins', size: 1, type: 'Generic', group: 'Cooling', tags: '', description: 'Passive radiator panels. Weak, but they fit anywhere.', cooling: 1 }),
    att({ name: 'Heat Exchanger', size: 1, type: 'Tech', group: 'Cooling', tags: '', description: 'Passive coolant loop tied into the core.', cooling: 3 }),
    att({ name: 'Heat Sink', size: 1, type: 'Generic', group: 'Cooling', tags: '', description: 'Thermal mass. Raises Heat Max while it works; lose it and your ceiling drops.', heatSink: 2 }),
    att({ name: 'Machine Gun', size: 1, type: 'Weapon', group: 'Weapons', tags: 'Short, Kinetic', description: 'Cheap, fast and hungry for ammo.', energy: 1, heat: 1, ammo: 'Light', repeat: 2, range: 'Short', roll: { skill: 'Gunnery', bonus: 2 } }),
    att({ name: 'Autocannon', size: 2, type: 'Weapon', group: 'Weapons', tags: 'Mid, Kinetic', description: 'Workhorse gun of the salvage lances.', energy: 2, heat: 2, ammo: 'Standard', range: 'Mid', roll: { skill: 'Gunnery', bonus: 3 } }),
    att({ name: 'SRM Rack', size: 1, type: 'Weapon', group: 'Weapons', tags: 'Short, Explosive', description: 'Dumbfire short-range missiles. No lock needed; one volley per activation.', energy: 1, heat: 1, ammo: 'Missile', repeat: 2, range: 'Short', roll: { skill: 'Gunnery', bonus: 2 } }),
    att({ name: 'Breaching Hammer', size: 1, type: 'Hand', group: 'Weapons', tags: 'Melee, Kinetic', description: 'Spend 2 extra energy for Powerful.', energy: 1, heat: 1, range: 'Melee', roll: { aspect: 'Violence', skill: 'Melee', bonus: 3 } }),
    att({ name: 'Manipulator', size: 1, type: 'Hand', group: 'Utility', tags: 'Melee', description: 'A working hand. Grab, carry, use handheld gear, or punch.', hand: true, energy: 1, heat: 1, range: 'Melee', roll: { aspect: 'Violence', skill: 'Melee', bonus: 0 }, effect: 'Punch' }),
    att({ name: 'Sensor Array', size: 1, type: 'Tech', group: 'Utility', tags: '', description: 'One target lock per success. Locks give +1 die and enable indirect fire.', energy: 1, heat: 1, roll: { aspect: 'Wit', skill: 'Tech', bonus: 0 }, effect: 'Target locks' }),
    att({ name: 'Jump Jets', size: 1, type: 'Generic', group: 'Utility', tags: '', description: 'Jump up to Speed over obstacles.', energy: 2, heat: 2, effect: 'Jump; +2 melee on landing' }),
    att({ name: 'Stowage Rack', size: 1, type: 'Generic', group: 'Utility', tags: '', stowage: 3 }),
    att({ name: 'Ammo Bin: Light', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '16 small rounds for machine guns. Cooks off if disabled while loaded.', bin: 'Light' }),
    att({ name: 'Ammo Bin: Standard', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '8 rounds for autocannons. Cooks off if disabled while loaded.', bin: 'Standard' }),
    att({ name: 'Ammo Bin: Missile', size: 1, type: 'Generic', group: 'Ammo', tags: 'Volatile', description: '5 missiles for missile and SRM racks. Cooks off if disabled while loaded.', bin: 'Missile' }),
    att({ name: 'Plating', type: 'Armour', group: 'Armour', tags: '', description: 'Basic armour plate.', armour: 2 }),
    att({ name: 'Composite Plating', type: 'Armour', group: 'Armour', tags: '', description: 'Layered armour. One extra point.', armour: 3 }),
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
