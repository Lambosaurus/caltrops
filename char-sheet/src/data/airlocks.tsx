import { DEFAULT_RULES, Rules } from '../lib/rules'

const airlockRuleset: Rules = {
    ...DEFAULT_RULES,

    name: 'Airlocks',
    theme: 'duskers',
    levelup: {
        skills: 3,
        aspects: 1,
        attributes: 0,
    },
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
            description: "The capacity to observe the details of one's surroundings",
        },
        {
            name: 'Gunnary',
        },
        {
            name: 'Melee',
        },
        {
            name: 'Explosives',
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
            name: 'Athletics',
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
            name: 'Jacked',
            trained: true,
        },
        {
            name: 'Mech',
            trained: true,
        },
        {
            name: 'Wirehead',
            trained: true,
        },
        {
            name: 'Bio',
            trained: true,
        },
        {
            name: 'Robotics',
            trained: true,
        }
    ],
    equipment: [
        {
            name: 'Pistol',
            description: 'A common sidearm. Easily concealed and quickly drawn. Consumes a clip per encounter.',
        },
        {
            name: 'Rifle',
            description: 'An assault rifle. For precision shooting at moderate range. Consumes a clip per encounter.',
        },
        {
            name: 'Submachine gun',
            description: 'A short weapon, intended to send a withering quantity of lead downrange. Consumes a clip per encounter. May consume an clip per round to lay down supressing fire.',
        },
        {
            name: 'Shotgun',
            description: '',
        },
        {
            name: 'Ammunition',
            stack: 4,
            description: 'Clips of ammunition for standardised conventional weapons.',
        },
        {
            name: 'Bandages',
            stack: 3,
            description: 'Composite sheets of elastic, padding, and gauze. Suitable for protecting open wounds.',
        },
        {
            name: 'Medicines',
            stack: 4,
            description: 'A pouch of assorted antibiotics, opioids, steriods, and other generic problem solvers.',
        },
        {
            name: 'Rations',
            stack: 4,
            description: 'A single celled protien combined with syntheic amnios, vitamins and minerals. Everything the body needs.',
        },
        {
            name: 'Crowbar',
            description: 'A long piece of metal with a hookey thing at the end.',
        },
        {
            name: 'Wrench',
            description: 'A large adjustable wrench perfect for general shipboard maintenence.',
        },
        {
            name: 'Machete',
            description: 'A broad cutting implement - as effective for intimidation as it is for agriculture.',
        },
        {
            name: 'Flares',
            stack: 3,
            description: 'Chemical exploration flares. These burn without oxygen, and are perfect for illuminating large areas, starting fires, and overwhelming infra-red targeting arrays.',
        },
        {
            name: 'Torch',
            description: 'A handheld torch for lighting your way. Consumes a battery after a days operation.',
        },
        {
            name: 'Batteries',
            stack: 6,
            description: 'Lithium graphene polymer batteries in a standardised form-factor. Do not over-charge. Do not over-discharge. Do not burn. Do not immerse in water. Do not consume.',
        },
        {
            name: 'Hand computer',
            description: 'A compact tablet computer. Useful for data entry or interfacing with other computers. Comes with a range of standard industrial connectors.',
        },
        {
            name: 'Tether',
            description: 'A 30m industrial cable complete with eyelets and hooks. Its rated capacity is 5 Ton. (1 Ton in impact conditions).',
        },
        {
            name: 'Rebreather',
            description: 'A mask with an air filtration and oxygen enrichment unit. Can enable a days worth of operation in hostile atmospheres.',
        },
        {
            name: 'Explosves',
            stack: 3,
            description: 'Sticks of plastic explosive with remotely triggered detonation caps. Until the detonation caps are armed, the compound is extremely inert.',
        },
        {
            name: 'Chaff grenade',
            stack: 3,
            description: 'This grenade explodes into a shower of bright magnesium fire and aliumium foil strips. This defeats a wide range of optical and electromagnetic sensors.',
        },
        {
            name: 'Grenade',
            stack: 3,
            description: 'Does what it says in the tin. Explodes.',
        },
        {
            name: 'Smoke grenade',
            stack: 3,
            description: 'Emits a thick cloud of white smoke.',
        },
        {
            name: 'Rocket',
            stack: 3,
            description: 'Ammunition for the missile launcher. This has no guidance system.',
        },
        {
            name: 'Seeking missile',
            stack: 3,
            description: 'Ammunition for the missile launcher. This can adjust its course mid flight, and be used to target distant foes.',
        },
        {
            name: 'Missile launcher',
            description: 'A shoulder mounted weapon for firing a range of missiles.',
        },
        {
            name: 'Laser',
            description: 'A man portable laser - its blinding orange beam is capable of cutting through doors as easily as humans. Consumes one battery per round.',
        },
        {
            name: 'Flame thrower',
            description: 'This can project a jet of burning liquid fuel some 15 meters. With the addition of plasticiser sachets, any traditional heavy fuel can be used. Consumes one fuel canister per encounter.',
        },
        {
            name: 'Flame canister',
            stack: 3,
            description: 'A small cylinder of liquid fuel. Used exclusively for burning things.',
        },
        {
            name: 'Spiderbot',
            description: 'A hexapod robot with 30cm legspan. This can be remotely controlled to explore confined spaces, carry small tools, and even enact minor repairs.',
        },
        {
            name: 'Plutonium rod',
            description: 'An plutonium fuel rod for reactor for compact nuclear reactors.',
        },
        {
            name: 'Toxins',
            stack: 4,
            description: 'Vials of potent neurotoxins.',
        },
        {
            name: 'Injector',
            description: 'A injector for in-field application of toxins or medicines.',
        },
        {
            name: 'Components',
            stack: 3,
            description: 'Salvaged components possible suitable for item manufacturing.',
        },
        {
            name: 'Cherry',
            stack: 4,
            description: 'A small vial full of a bright red liquid. This provides a brief burst of power at the expense of organ damage. Highly addictive.',
        },
        {
            name: 'Opioids',
            stack: 4,
            description: 'Assorted vials of white or clear liquids. Grant effective pain relief. Highly addictive.',
        },
        ...DEFAULT_RULES.equipment,
    ],
    containers: [
        {
            name: "Personal",
            size: 5,
        },
        {
            name: "Pack",
            size: 5,
        }
    ],
    powers: [
        {
            name: 'Jacked'
        },
        {
            name: 'Mech'
        },
        {
            name: 'Wirehead'
        },
        {
            name: 'Bio'
        },
        {
            name: 'Robotics'
        }
    ]
}

export default airlockRuleset;