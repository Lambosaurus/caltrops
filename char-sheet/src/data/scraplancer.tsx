import { DEFAULT_RULES, Rules } from '../lib/rules'
import type { MechRules } from '../lib/mech/types'
import lancerRuleset from './lancer'
import { AMMO, ATTACHMENTS, CHASSIS, TAGS } from './scraplancerCatalogue'
import { PREFABS } from './scraplancerPrefabs'
import { TAG_SHORT } from './scraplancerTagShort'

// Chassis, parts, ammo and tags are generated from the rules doc (scripts/scraplancer/gen.py); prefabs by prefabs.py.

const mechs: MechRules = {
    slotTypes: [
        { name: '', label: 'Untyped', color: '#46536e', description: 'Untyped slot. Takes Generic attachments only (ammo bins, heat sinks, radiators, jump jets, stowage).' },
        { name: 'Hull', label: 'Hull', color: '#7d8aa3', description: 'Hull slot. Holds nothing; extra structure that soaks a wound. Chassis use these to add toughness without adding mounting space.' },
        { name: 'Reactor', label: 'Reactor', color: '#f2a024', description: 'Reactor slot. Reactors only, or any Generic attachment. The run of Reactor slots caps how big a reactor the chassis can take.' },
        { name: 'Weapon', label: 'Weapon', color: '#ff5c6c', description: 'Weapon slot. Guns and launchers, or any Generic attachment.' },
        { name: 'Tech', label: 'Tech', color: '#20d6fa', description: 'Tech slot. Exchangers, capacitors, sensors and field generators, or any Generic attachment.' },
        { name: 'Hand', label: 'Hand', color: '#c58cff', description: 'Hand slot. Manipulators, melee weapons, shields and repair rigs, or any Generic attachment.' },
        { name: 'Armour', label: 'Armour', color: '#24e076', description: 'Armour slot. Holds one armour attachment; its points soak wounds before any slot in this section.' },
        { name: 'Generic', label: 'Generic', color: '#d8dee9', description: 'Fits any slot except Armour and Hull.' },
    ],
    chassis: CHASSIS,
    attachments: ATTACHMENTS,
    ammo: AMMO,
    prefabs: PREFABS,
    tags: TAGS,
    tagsShort: TAG_SHORT,
    // Mechs saved before the catalogue gave every frame a make and model.
    chassisAliases: { Jackal: 'MAS Jackal J-7', Mule: 'OHS Mule Mk II', Bulwark: 'HCA Bulwark Block 4' },
    rangeAspects: { Short: 'Reflex', Mid: 'Precision', Long: 'Precision' },
    sprint: { energy: 2, heat: 2 }, // every chassis here has a size, which sets the Sprint cost instead
}

const scrapLancerRuleset: Rules = {
    ...DEFAULT_RULES,

    name: 'Scrap Lancer',
    theme: 'lancers',
    useAspects: true,
    attributes: DEFAULT_RULES.attributes,
    // Aspects, not attributes, go up with level (the Lancer ruleset has no aspects).
    levelup: { aspects: 0.5, attributes: 0, skills: lancerRuleset.levelup.skills },
    // The character's own body skills; piloting is the separate pilot track below.
    skills: lancerRuleset.skills
        .filter(s => s.name !== 'Piloting')
        .map(s => s.name === 'Gunnary' ? { ...s, name: 'Gunnery' } : { ...s }),
    pilotSkills: {
        perLevel: 1.5,
        skills: [
            { name: 'Gunnery', description: 'Ballistic guns, mass drivers, mortars, flamers, rockets and missiles.' },
            { name: 'Melee', description: 'Mech melee weapons, claws, hands and winches.' },
            { name: 'Mobility', description: 'The Sprint dodge roll: Reflex + Mobility + Evasion.' },
            { name: 'Tech', description: 'Lasers, plasma, EM weapons, sensors and Mind parts.' },
            { name: 'Repair', description: 'Repair rigs and field repair.' },
        ],
    },
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
