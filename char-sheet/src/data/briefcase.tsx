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
            name: 'Headset',
        },
        {
            name: 'Stiletto heels',
            description: "Incredibly loud.",
        },
        {
            name: 'Jeweled broach',
            description: "Either a family heirloom, or a pawn shop bargain.",
            stack: 3,
        },
        {
            name: 'Rolex watch',
            description: "Almost certainly fake.",
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
        },
        {
            name: 'Calculator',
            description: "Very old school. It was incredibly expensive.",
        },
        {
            name: 'Notebook',
            description: "Bound with genuine leather. Most of the pages are blank.",
        },
        {
            name: 'Clipboard',
        },
        {
            name: 'Stapler',
        },
        {
            name: 'Binder',
        },
        {
            name: 'Duct tape',
            stack: 4,
        },
        {
            name: 'Perment marker',
            stack: 6,
            description: "Comes in a variety of colors!",
        },
        {
            name: 'Laser pointer',
            description: "Nobody uses these anymore.",
        },
        {
            name: 'Really nice pen',
            description: "It's really nice. Really nice.",
            stack: 4,
        },
        {
            name: 'Screwdriver set',
        },
        {
            name: 'Business card',
            stack: 10,
        },
        {
            name: 'Security badge',
            description: "It opens all the electronic doors.",
        },
        {
            name: 'Corporate branding guide',
        },
        {
            name: 'Pantone color palette',
        },
        {
            name: 'Technical manual',
        },
        {
            name: 'Scented candle',
        },
        {
            name: 'Packed lunch',
        },
        {
            name: 'Box of donuts',
            stack: 8,
        },
        {
            name: 'Data chip',
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
            name: 'Company bonds',
            stack: 10,
        },
        {
            name: 'Sticky notes',
            stack: 10,
        },
        {
            name: 'Schematics',
            stack: 4,
        },
        {
            name: 'Blueprints',
            stack: 4,
        },
        {
            name: 'Incriminiating photo',
            stack: 10,
        },
        {
            name: 'Cocaine',
            stack: 4,
        },
        {
            name: 'Fire extinguisher',
            description: "Surprisingly heavy.",
            stack: 1,
        },
        ...DEFAULT_RULES.equipment,
    ],
    containers: [
        {
            name: "Personal",
            size: 3,
        },
        {
            name: "Briefcase",
            size: 5,
        }
    ],
    powers: [
        {
            name: 'Wealth'
        },
    ]
}

export default briefcaseRuleset;