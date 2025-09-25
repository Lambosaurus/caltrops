import { DEFAULT_RULES, Rules } from '../lib/rules'

const driftersRuleset: Rules = {
    ...DEFAULT_RULES,

    name: 'Stars Adrift',
    theme: 'darkest',
    woundSizeLimit: 3,
    skills: [
        {
            name: 'Athletics',
        },
        {
            name: 'Craftsmanship',
        },
        {
            name: 'Diplomacy',
        },
        {
            name: 'Herbalism',
        },
        {
            name: 'Lore',
        },
        {
            name: 'Marksmanship',
        },
        {
            name: 'Medicine',
        },
        {
            name: 'Melee',
        },
        {
            name: 'Observation',
        },
        {
            name: 'Stealth',
        },
        {
            name: 'Thievery',
        },
        {
            name: 'Endurance',
        },
        {
            name: 'Pyromancy',
            trained: true,
        },
        {
            name: 'Cryomancy',
            trained: true,
        },
        {
            name: 'Occult',
            trained: true,
        },
        {
            name: 'Celestial',
            trained: true,
        }
    ],
    equipment: [

        {
            name: 'Bronze Sword',
            description: 'Brittle. +1 when parrying.',
        },
        {
            name: 'Bronze Scimitar',
            description: 'Brittle. +1 when attacking after charging.',
        },
        {
            name: 'Bronze Khopesh',
            description: 'Brittle. +1 when attempting a maneuver or disarm.',
        },
        {
            name: 'Bronze Axe',
            description: "Brittle. +1 shielded foes."
        },
        {
            name: 'Bronze Mace',
            description: "Brittle. +1 vs armoured foes.",
        },
        {
            name: 'Bronze Spear',
            description: "Brittle. +1 vs charging foe",
        },
        {
            name: 'Bronze Dagger',
            description: "Brittle. May substitute reflex for violence.",
        },
        {
            name: 'Iron Sword',
            description: '+1 when parrying.',
        },
        {
            name: 'Iron Scimitar',
            description: '+1 when attacking after charging.',
        },
        {
            name: 'Iron Khopesh',
            description: '+1 when attempting a maneuver or disarm.',
        },
        {
            name: 'Iron Axe',
            description: "+1 shielded foes."
        },
        {
            name: 'Iron Mace',
            description: "+1 vs armoured foes.",
        },
        {
            name: 'Iron Spear',
            description: "+1 vs charging foe",
        },
        {
            name: 'Iron Dagger',
            description: "May substitute reflex for violence.",
        },
        {
            name: 'Shield',
            description: "May spend successes for shielded (control melee). Armored vs piercing weapons while shielded.",
        },
        {
            name: 'Staff',
        },
        {
            name: 'Bow',
        },
        {
            name: 'Crossbow',
            description: "+2. Takes one action to reload.",
        },
        {
            name: 'Bronze Armor',
            description: "Overlapping plates of bronze armor. Provides 1 block token.",
            stack: 1,
        },
        {
            name: 'Iron Armor',
            description: "Overlapping plates of iron armor. Provides 2 block tokens.",
            stack: 2,
        },

        {
            name: 'Arrows',
            description: "Ammunition for bows.",
            stack: 6,
        },

        {
            name: 'Rope',
            description: "50 ft of hempen rope."
        },
        {
            name: 'Crowbar',
            description: "A long bronze instrument with a hooked end. Heavy."
        },
        {
            name: 'Toolset',
            description: "A set of fine bronze tools."
        },
        {
            name: 'Cloak',
            description: "A sturdy cloak to keep one cool by day, and warm by night.",
        },
        {
            name: 'Tent',
            description: "A sturdy canvas tent. Big enough for two.",
        },

        {
            name: 'Torches',
            description: "A pitch torch. Burns to provide meagre light, but plenty of smoke.",
            stack: 4,
        },
        {
            name: 'Rations',
            stack: 4,
            description: "Bread, dried meats, and a waterskin. Enough for a days labor.",
        },
        {
            name: 'Wine',
            stack: 4,
            description: "Cheap wine in a wineskin. Used to make a hard march easier, or mixed with poor water.",
        },
        {
            name: 'Fresh ingredients',
            stack: 4,
            description: "Fresh meat, fish, vegetables and fruits. Some assembly required. Spoils quickly.",
        },
        {
            name: 'Bandages',
            description: "Linen strips for binding wounds.",
            stack: 4,
        },
        {
            name: 'Herbs',
            description: "Various herbs. Dangerous if not prepared correctly.",
            stack: 4,
        },
        {
            name: 'Poison',
            description: "Green vials of deadly poison. Apply to weapons for a weakening wound. Deadly if allowed to fester.",
            stack: 4,
        },
        {
            name: 'Medicines',
            description: "Specialy prepared tinctures for unusual ailments.",
            stack: 4,
        },
        {
            name: 'Star candle',
            description: "Candles specialy prepared at a shrine. Used to bring a homestars blessings to distant places.",
            stack: 4,
        },
        {
            name: 'Cauldron',
            description: "A small bronze cauldron. Used for cooking or brewing."
        },
        {
            name: 'Lantern',
            description: "A brass oil lantern. Refilled for 1 silver.",
            stack: 6,
        },
        {
            name: 'Spyglass',
            description: "A brass spyglass with fine glass optics."
        },
        {
            name: 'Lyre',
            description: "A common stringed instrument. Easy to carry, hard to play."
        },
        {
            name: 'Flute',
            description: "A common wind instrument."
        },
        {
            name: 'Drum',
            description: "A simple hide drum."
        },

        {
            name: 'Oil',
            stack: 3,
            description: "Flasks of flammable oil.",
        },
        {
            name: 'Incense',
            stack: 6,
            description: "Strong and aromatic. Said to ward off evil.",
        },
        {
            name: 'Perfume',
            stack: 6,
            description: "It smells expensive.",
        },
        {
            name: 'Parchment',
            description: "Beaten papyrus parchment. Includes an ink and quill.",
            stack: 6,
        },
        {
            name: 'Spices',
            stack: 6,
            description: "Rich colors and richer scents."
        },
        {
            name: 'Silk',
            stack: 4,
            description: "Soft flowing silk sheets. Enough to make a fine garment."
        },
        {
            name: 'Tome',
            stack: 2,
            description: "A heavy leatherbound tome. The glyphs contained within seem of great importance."
        },
        {
            name: 'Bronze ingot',
            stack: 2,
            description: "A bronze ingot large enough to cast a medium sized tool."
        },
        {
            name: 'Iron ingot',
            stack: 2,
            description: "An iron ingot large enough to cast a medium sized tool."
        },
        {
            name: 'Silver ingot',
            stack: 6,
            description: "A small trade ingot. Worth its weight in silver."
        },
        {
            name: 'Gold ingot',
            stack: 6,
            description: "A small trade ingot. Enough to make a small totem or amulet."
        },

        {
            name: 'Ceremonial dagger',
            description: "May substitute reflex for violence. After dealing a wound, the next occult spell gains +1 power.",
        },

        ...DEFAULT_RULES.equipment,
    ],
    containers: [
        {
            name: "Body",
            size: 5,
        },
        {
            name: "Pack",
            size: 5,
        },
        {
            name: "Stash",
        }
    ],
    powers: [
        {
            name: 'Pyromancy'
        },
        {
            name: 'Cryomancy'
        },
        {
            name: 'Occult'
        },
        {
            name: 'Celestial'
        }
    ],
    currency: [
        {
            name: "Silver",
            precision: 0,
        }
    ],
}

export default driftersRuleset;