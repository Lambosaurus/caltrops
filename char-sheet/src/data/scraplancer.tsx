import { DEFAULT_RULES, Rules } from '../lib/rules'
import type { MechRules } from '../lib/mech/types'
import lancerRuleset from './lancer'
import { AMMO, ATTACHMENTS, CHASSIS, TAGS } from './scraplancerCatalogue'
import { PREFABS } from './scraplancerPrefabs'

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
    // Mechs saved before the catalogue gave every frame a make and model.
    chassisAliases: { Jackal: 'MAS Jackal J-7', Mule: 'OHS Mule Mk II', Bulwark: 'HCA Bulwark Block 4' },
    rangeAspects: { Short: 'Reflex', Mid: 'Precision', Long: 'Precision' },
    sprint: { energy: 2, heat: 2 },
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
