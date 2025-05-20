import { DEFAULT_RULES, Rules } from '../lib/rules'

const briefcaseRuleset: Rules = {
    ...DEFAULT_RULES,

    name: 'Briefcase',
    theme: 'retro',
    woundSizeLimit: 3,
    currency: [
        {
            name: "Solari",
            precision: 1,
        }
    ],
    skills: [
        {
            name: 'Snooping',
        },
        {
            name: 'Accounting',
        },
        {
            name: 'Legal',
        },
        {
            name: 'Logistics',
        },
        {
            name: 'Computing',
        },
        {
            name: 'Logic',
        },
        {
            name: 'Banter',
        },
        {
            name: 'Gossip',
        },
        {
            name: 'Empathy',
        },
        {
            name: 'Athletics',
        },
        {
            name: 'Presentation',
        },
        {
            name: 'Diligence',
        },
        {
            name: 'Wealth',
        },
    ],
    equipment: [
        {
            name: 'Coffee mug',
            description: "May be full or empty.",
            stack: 1,
        },
        {
            name: 'Mirrored sunglasses',
            description: "Armored vs empathy rolls.",
        },
        {
            name: 'In-ear headset',
            description: "A blue led blinks on the side. Its unclear whether you are on a call.",
        },
        {
            name: 'Stiletto heels',
            description: "Incredibly loud.",
        },
        {
            name: 'Makeup kit',
            description: "A small compact with a mirror. The foundation is nearly exhausted.",
        },
        {
            name: 'Lipstick',
            description: "Red #6. Bold. Provocative. Adheres to a surprising number of surfaces.",
        },
        {
            name: 'Jeweled broach',
            description: "Either a family heirloom, or a pawn shop bargain.",
        },
        {
            name: 'Rolex watch',
            description: "Almost certainly fake. It reads one hour early.",
        },
        {
            name: 'Three piece suit',
            description: "Provides a block tokens against social attacks.",
            stack: 1,
        },
        {
            name: 'Gold Hairpin',
            description: "Unnecessarily sharp.",
        },
        {
            name: 'Brightly colored tie',
            description: "It clashes with your suit. It clashes with everyones suit.",
        },
        {
            name: 'Hand computer',
            description: "State of the art computing in a modern form factor. It is crippled by the IT department.",
        },
        {
            name: 'Calculator',
            description: "Minimal, yet functional. It displays a truth to materials.",
        },
        {
            name: 'Notebook',
            description: "Bound with genuine leather. Most of the pages are blank.",
        },
        {
            name: 'Clipboard',
            description: "Light, yet sturdy. A pen hangs from a piece of string. One corner is chipped.",
        },
        {
            name: 'Box of tissues',
            description: "Nothing makes crying worse than being noticed.",
            stack: 10,
        },
        {
            name: 'Stapler',
            description: "A Swingline 747 in lipstick red. A classic.",
        },
        {
            name: 'Binder',
            description: "A black 3 ring binder. The label has long since faded.",
        },
        {
            name: 'Duct tape',
            description: "Very difficult to tear. Leaves a sticky residue.",
            stack: 4,
        },
        {
            name: 'Permanent marker',
            description: "Comes in a variety of fun colors!",
            stack: 6,
        },
        {
            name: 'Laser pointer',
            description: "People stopped using these ages ago.",
        },
        {
            name: 'Really nice pen',
            description: "It's really nice. Really nice.",
            stack: 4,
        },
        {
            name: 'Screwdriver set',
            description: "Includes multiples sizes of flathead and phillips. No torx.",
        },
        {
            name: 'Business card',
            description: "Look at that subtle off while coloring. The tasteful thickness of it. It even has a watermark.",
            stack: 10,
        },
        {
            name: 'Security badge',
            description: "It opens all the electronic doors.",
        },
        {
            name: 'Corporate branding guide',
            description: "Know your monograms from your letterforms."
        },
        {
            name: 'Pantone color palette',
            description: "Looking at this incurrs a fee.",
        },
        {
            name: 'Technical manual',
            description: "Makes a satisfying thump when closed.",
        },
        {
            name: 'Saucy novel',
            description: "Definitely not safe for work.",
        },
        {
            name: 'Scented candle',
            description: "Smells of cinnamon and vanilla.",
        },
        {
            name: 'Packed lunch',
            description: "This probably needs to be microwaved.",
        },
        {
            name: 'A can of tuna',
            stack: 3,
        },
        {
            name: 'Kitten',
            description: "This is not a pet friendly workplace.",
        },
        {
            name: 'Box of donuts',
            description: "A corporate sanctioned way to express favoritism.",
            stack: 8,
        },
        {
            name: 'Data chip',
            description: "Contains K-drama episodes and some strange executable files.",
            stack: 4,
        },
        {
            name: 'Voice recorder',
        },
        {
            name: 'HR complaint forms',
            description: "Currently unfilled.",
            stack: 10,
        },
        {
            name: 'Site safety forms',
            description: "Currently unfilled.",
            stack: 10,
        },
        {
            name: 'Performance review forms',
            description: "Powerful vs junior employees.",
            stack: 10,
        },
        {
            name: 'Company bonds',
            stack: 10,
        },
        {
            name: 'Sticky notes',
            description: "A reliable way to remember your login details.",
            stack: 10,
        },
        {
            name: 'Schematics',
            description: "You could make these. If only you had some elemental silicon, a nano-scale CNC mill, and a semiconductor foundry.",
            stack: 4,
        },
        {
            name: 'Blueprints',
            description: "This seems to be the office floorplan. The roof contains a surprising number of ventilation ducts.",
            stack: 2,
        },
        {
            name: 'Incriminiating photo',
            stack: 10,
        },
        {
            name: 'Hi-vis vest',
            description: "A bright yellow vest with reflective strips. Visibility guarantees safety.",
        },
        {
            name: 'Cocaine',
            stack: 4,
        },
        {
            name: 'Bleach',
            description: "Comes in a 4L industrial jug.",
            stack: 4,
        },
        {
            name: 'Fire extinguisher',
            description: "Surprisingly heavy.",
            stack: 1,
        },
        {
            name: 'Six pack of beer',
            description: "Room temperature. You do not recognize the brand.",
            stack: 6,
        },
        {
            name: 'Strange key',
            description: "The tag reads: 'removing this key is a firable offense.'",
        },
        ...DEFAULT_RULES.equipment,
    ],
    containers: [
        {
            name: "Personal",
            size: 4,
        },
        {
            name: "Briefcase",
            size: 4,
        },
        {
            name: "Desk",
            size: 8,
        },
    ],
    powers: [
        {
            name: 'Wealth'
        },
    ]
}

export default briefcaseRuleset;