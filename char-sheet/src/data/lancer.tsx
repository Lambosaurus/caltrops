import { DEFAULT_RULES, Rules } from '../lib/rules'

const lancerRuleset: Rules = {
    ...DEFAULT_RULES,

    name: 'Lancer',
    theme: 'lancers',
    useAspects: false,
    levelup: {
        aspects: 0,
        attributes: 0.5,
        skills: 2.5,
    },
    attributes: [
        {
            name: 'Control',
            aspects: []
        },
        {
            name: 'Dexterity',
            aspects: []
        },
        {
            name: 'Intellect',
            aspects: []
        },
        {
            name: 'Presence',
            aspects: []
        },
    ],
    currency: [
        {
            name: "Solari",
            precision: 1,
        },
        {
            name: "U",
            precision: 1,
        }
    ],
    skills: [
        {
            name: 'Observation',
        },
        {
            name: 'Gunnary',
        },
        {
            name: 'Melee',
        },
        {
            name: 'Piloting',
        },
        {
            name: 'Sneak',
        },
        {
            name: 'Diplomacy',
        },
        {
            name: 'History',
        },
        {
            name: 'Medicine',
        },
        {
            name: 'Science',
        },
        {
            name: 'Engineering',
        },
        {
            name: 'Computing',
        },
        {
            name: 'Survival',
        },
        {
            name: 'Repair',
        },
        {
            name: 'Athletics',
        },
        {
            name: 'Overload',
            trained: true,
        },
        {
            name: 'Robotics',
            trained: true,
        },
        {
            name: 'Orbital',
            trained: true,
        }
    ],
    equipment: [
        {
            name: 'Pistol',
            description: 'Dex-Gunnary. -2 at long range. 1 Ammo per encounter. No penalty in melee.',
            tag: 'handheld',
        },
        {
            name: 'Rifle',
            description: 'Dex-Gunnary. 1 Ammo per encounter. -1 at short range.',
            tag: 'handheld',
        },
        {
            name: 'Submachine gun',
            description: 'Dex-Gunnary. 1 Ammo per encounter. -2 at long range. May spend 1 additional ammo for +1.',
            tag: 'handheld',
        },
        {
            name: 'Shotgun',
            description: 'Dex-Gunnary. 1 Ammo per encounter. +1 at short range.',
            tag: 'handheld',
        },
        {
            name: 'Ammunition',
            stack: 4,
            description: 'Clips of ammunition for standardised conventional weapons.',
            tag: 'handheld',
        },
        {
            name: 'Bandages',
            stack: 3,
            description: 'Composite sheets of elastic, padding, and gauze. Suitable for protecting open wounds.',
            tag: 'handheld',
        },
        {
            name: 'Medicines',
            stack: 4,
            description: 'A pouch of assorted antibiotics, opioids, steriods, and other generic problem solvers.',
            tag: 'handheld',
        },
        {
            name: 'Rations',
            stack: 4,
            description: 'A single celled protien combined with syntheic amnios, vitamins and minerals. Everything the body needs.',
            tag: 'handheld',
        },
        {
            name: 'Crowbar',
            description: 'Control-Melee. A long piece of metal with a hookey thing at the end.',
            tag: 'handheld',
        },
        {
            name: 'Wrench',
            description: 'Control-Melee. A large adjustable wrench perfect for general maintenence.',
            tag: 'handheld',
        },
        {
            name: 'Machete',
            description: 'Control-Melee. A broad cutting implement - as effective for intimidation as it is for agriculture.',
            tag: 'handheld',
        },
        {
            name: 'Flares',
            stack: 3,
            description: 'Chemical exploration flares. These burn without oxygen, and are perfect for illuminating large areas, starting fires, and overwhelming infra-red targeting arrays.',
            tag: 'handheld',
        },
        {
            name: 'Torch',
            description: 'A handheld torch for lighting your way. Consumes a battery after a days operation.',
            tag: 'handheld',
        },
        {
            name: 'Batteries',
            stack: 6,
            description: 'Lithium graphene polymer batteries in a standardised form-factor. Do not over-charge. Do not over-discharge. Do not burn. Do not immerse in water. Do not consume.',
            tag: 'handheld',
        },
        {
            name: 'Tether',
            description: 'A 30m industrial cable complete with eyelets and hooks. Its rated capacity is 5 Ton. (1 Ton in impact conditions).',
            tag: 'handheld',
        },
        {
            name: 'Rebreather',
            description: 'A mask with an air filtration and oxygen enrichment unit. Can enable a days worth of operation in hostile atmospheres.',
            tag: 'handheld',
        },
        {
            name: 'Explosves',
            stack: 3,
            description: 'Control-Athletics. Sticks of plastic explosive with remotely triggered detonation caps. Until the detonation caps are armed, the compound is extremely inert.',
            tag: 'handheld',
        },
        {
            name: 'Chaff grenade',
            stack: 3,
            description: 'Control-Athletics. This grenade explodes into a shower of bright magnesium fire and aliumium foil strips. This defeats a wide range of optical and electromagnetic sensors.',
            tag: 'handheld',
        },
        {
            name: 'Grenade',
            stack: 3,
            description: 'Control-Athletics. Does what it says in the tin. Explodes.',
            tag: 'handheld',
        },
        {
            name: 'Smoke grenade',
            stack: 3,
            description: 'Control-Athletics. Emits a thick cloud of white smoke.',
            tag: 'handheld',
        },
        {
            name: 'Rocket',
            stack: 3,
            description: 'Ammunition for the handheld missile launcher.',
            tag: 'handheld',
        },
        {
            name: 'Missile launcher',
            description: 'Dex-Gunnary. Powerful. A shoulder mounted weapon for firing a range of missiles.',
            tag: 'handheld',
        },
        {
            name: 'Handheld Laser',
            description: 'Dex-Gunnary. One battery per shot. Powerful. A man portable laser - its blinding orange beam is capable of cutting through doors as easily as humans.',
            tag: 'handheld',
        },
        {
            name: 'Handheld Flamethrower',
            description: 'Control-Gunnary. Powerful vs flesh. Short range. This can project a jet of burning liquid fuel some 15 meters.',
            tag: 'handheld',
        },
        {
            name: 'Flame canister',
            stack: 3,
            description: 'A small cylinder of liquid fuel. Used exclusively for burning things.',
            tag: 'handheld',
        },
        {
            name: 'Spiderbot',
            description: 'A hexapod robot with 30cm legspan. This can be remotely controlled to explore confined spaces, carry small tools, and even enact minor repairs.',
            tag: 'handheld',
        },
        {
            name: 'Plutonium rod',
            description: 'An plutonium fuel rod for reactor for compact nuclear reactors.',
            tag: 'handheld',
        },
        {
            name: 'Toxins',
            stack: 4,
            description: 'Vials of potent neurotoxins.',
            tag: 'handheld',
        },
        {
            name: 'Injector',
            description: 'Dex-Medicine. A injector for in-field application of toxins or medicines.',
            tag: 'handheld',
        },
        {
            name: 'Components',
            stack: 4,
            description: 'Salvaged components possible suitable for item manufacturing.',
            tag: 'handheld',
        },
        {
            name: 'Cherry',
            stack: 4,
            description: 'Causes 1 wound. +3 to next roll. A small vial full of a bright red liquid. Highly addictive.',
            tag: 'handheld',
        },
        {
            name: 'Opioids',
            stack: 4,
            description: 'Assorted vials of white or clear liquids. Grant effective pain relief. Highly addictive.',
            tag: 'handheld',
        },

        {
            name: 'Scrap',
            stack: 4,
            description: 'Scrap materials, used for repairs or trade.',
            tag: 'bulk',
        },

        // Lancer: Weapons
        {
            name: 'Rotary cannon',
            description: 'Dex-Gunnary. Mid range. One charge per shot (10u). +2 per extra charge (max 1).',
            stack: 12,
            tag: 'lancer',
        },
        {
            name: 'Autocannon',
            stack: 12,
            description: 'Dex-Gunnary. Mid range. One charge per shot (10u). Precise.',
            tag: 'lancer',
        },
        {
            name: 'Coilgun',
            stack: 8,
            description: 'Dex-Gunnary. Long range. Overcharge powered. Powerful vs armored.',
            tag: 'lancer',
        },
        {
            name: 'Railgun',
            stack: 1,
            description: 'Dex-Gunnary. Extremely Long range. Overcharge powered. Powerful. Ignores armor and size penalties.',
            tag: 'lancer',
        },
        {
            name: 'Seeker pod',
            stack: 6,
            description: 'Long range. One success per fired charge (25u). Indirect fire. Target must be locked.',
            tag: 'lancer',
        },
        {
            name: 'Barrage Seeker pod',
            stack: 10,
            description: 'Long range. One success per fired charge (25u). Indirect fire. Target must be locked.',
            tag: 'lancer',
        },
        {
            name: 'Dumbfire pod',
            stack: 6,
            description: 'Dex-Gunnary. Medium range. Extra success per extra charge (20u).',
            tag: 'lancer',
        },
        {
            name: 'Stiletto missile',
            stack: 1,
            description: 'Dex-Gunnary. Extremely long range. Indirect fire. +4 successes if target locked.',
            tag: 'lancer',
        },
        {
            name: 'Hydraulic claw',
            description: 'Control-Melee.',
            tag: 'lancer',
        },
        {
            name: 'Lancet',
            description: 'Dex-Melee. -2 vs machines.',
            tag: 'lancer',
        },
        {
            name: 'Rotary saw',
            description: 'Control-Melee. Gains +1 per round on the same target. -1 vs machines.',
            tag: 'lancer',
        },
        {
            name: 'Grapple harpoon',
            description: 'Control-Gunnary. Medium range. First success to maneuver and stagger a foe. Alternately the user may move themselves.',
            tag: 'lancer',
        },
        {
            name: 'Flamethrower',
            description: 'Control-Gunnary. Short range. One charge per shot (10u). AOE: 1. Powerful vs flesh. -2 vs machine.',
            stack: 4,
            tag: 'lancer',
        },
        {
            name: 'Laser',
            description: 'Dex-Gunnary. Medium range. Overcharge powered. Required for in-field repairs.',
            stack: 6,
            tag: 'lancer',
        },
        {
            name: 'Arc lance',
            description: 'Presence-Gunnary. Short range. Overcharge powered. Cannot be blocked.',
            stack: 6,
            tag: 'lancer',
        },
        {
            name: 'Mortar',
            description: 'Dex-Gunnary. Long range. -4 in short range. Indirect fire. AOE: 3. One charge per shot (20u)',
            stack: 6,
            tag: 'lancer',
        },
        {
            name: 'Ballistic cannon',
            description: 'Dex-Gunnary. Long range. -2 in short range. Indirect fire. AOE: 2. Powerful. One charge per shot (50u)',
            stack: 4,
            tag: 'lancer',
        },

        // Lancer: Utility
        {
            name: 'Autoloader',
            stack: 1,
            description: 'Rearms a weapon in the field. The weapon to be rearmed must be declared when autoloader is installed.',
            tag: 'lancer',
        },
        {
            name: 'Sensor array',
            description: 'Intellect-Computing. Gets a target lock per success. May share a target lock using one success. Target locks provide +1 when attacking, and indirect weapons may hit these targets with no penalty.',
            tag: 'lancer',
        },
        {
            name: 'Pulse jamming array',
            description: 'Intellect-Computing. Medium range. May break target locks or intefere with systems.',
            tag: 'lancer',
        },
        {
            name: 'Point defence',
            description: 'Provides armored vs missiles. Enables reaction: Dex-gunnary to thwart missiles.',
            tag: 'lancer',
        },
        {
            name: 'Chaff dispenser',
            stack: 4,
            description: 'Thwarts a target lock per charge.',
            tag: 'lancer',
        },
        {
            name: 'Passive jamming array.',
            description: 'Armored vs locking or hacking.',
            tag: 'lancer',
        },
        {
            name: 'Repulsion field generator',
            description: 'Enables reaction: Control-Engineering to thwart physical damage (powerful).',
            tag: 'lancer',
        },
        {
            name: 'Dipole Fusion reactor',
            stack: 4,
            description: 'Provides extra power, which may be used like overcharge. Recharged with fusion fuels.',
            tag: 'lancer',
        },
        {
            name: 'Arc-point Fusion reactor',
            stack: 6,
            description: 'Provides extra power, which may be used like overcharge. Recharged with fusion fuels.',
            tag: 'lancer',
        },
        {
            name: 'Heat sink',
            stack: 1,
            description: 'Dissapates heat, which may be used like overcharge. Cools after combat.',
            tag: 'lancer',
        },
        {
            name: 'Plating',
            stack: 1,
            description: 'Thwarts an attacking success per charge (15u). DM may determine when armor is applicable.',
            tag: 'lancer',
        },
        {
            name: 'Composite plating',
            stack: 2,
            description: 'Thwarts an attacking success per charge (15u). DM may determine when armor is applicable.',
            tag: 'lancer',
        },
        {
            name: 'Jump jets',
            description: 'Enables short distance flight. +2 to melee attacks if used to enter fight.',
            tag: 'lancer',
        },
        {
            name: 'Entrenching Shield',
            description: 'Provides armored in a 90 degree arc. May use Control-Melee reaction to thwart incoming damage.',
            tag: 'lancer',
        },

        ...DEFAULT_RULES.equipment,
    ],
    wounds: [
        {
            name: "Body",
            size: 3
        },
        {
            name: "Lancer",
            size: 5,
        }
    ],
    containers: [
        {
            name: "Personal",
            size: 5,
            tags: [ "handheld", "custom" ]
        },
        {
            name: "Lancer",
            size: 5,
            tags: [ "lancer", "custom" ]
        },
        {
            name: "Stowage",
            size: 5,
        }
    ],
    powers: [
        {
            name: 'Overload'
        },
        {
            name: 'Robotics'
        },
        {
            name: 'Orbital'
        }
    ]
}

export default lancerRuleset;