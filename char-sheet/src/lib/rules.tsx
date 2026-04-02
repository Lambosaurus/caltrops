
export interface Aspect {
    name: string,
    description?: string
}

export interface Attribute {
    name: string,
    description?: string,
    aspects: Aspect[],
}

export interface Skill {
    name: string,
    description?: string,
    trained?: boolean, // If true, this skill can not be used without at least 1 point.
}

export interface Currency {
    name: string,
    precision?: number,
    description?: string,
}

export interface Equipment {
    name: string,
    stack?: number,
    description?: string,
    custom?: boolean,
    tag?: string,
}

export interface Container {
    name: string,
    description?: string,
    size?: number,
    // Tags define what equipment can be entered into this container.
    // Special tag '.' can be used to select untagged items.
    // No tags will select all.
    tags?: string[]
}

export interface Power {
    name: string,
    description?: string,
    source?: string, // name of skill to use as level source
    dice?: {
        base: number, // dice at lvl 1
        level: number, // dice per level.
    }
}

export interface Rules {
    name: string,
    theme: string,
    skills: Skill[],
    attributes: Attribute[],
    equipment: Equipment[],
    containers: Container[],
    powers: Power[],
    wounds: Container[],
    currency: Currency[],
    woundSizeLimit: number,
    useAspects: boolean,
    levelup: {
        aspects: number,
        skills: number,
        attributes: number,
    }
}

export interface SheetEquipment {
    name: string,
    count?: number,
    stack?: number,
    custom?: boolean,
}

export interface SheetWound {
    name?: string,
    size: number,
    locked: boolean,
}

export interface SheetInfo {
    name: string,
    level: number,
    background: string,
}

export type Dictionary<t> = {[key: string]: t};

export interface Sheet {
    rules: string,
    id: string,
    owner: string | null,
    info: SheetInfo,
    currency: Dictionary<number>,
    equipment: Dictionary<SheetEquipment[]>,
    skills: Dictionary<number>,
    attributes: Dictionary<number>,
    powers: Dictionary<number>,
    wounds: Dictionary<SheetWound[]>,
    notes: string[],
}

export interface RollInfo {
    skill?: {
        name: string,
        score: number,
    },
    attribute?: {
        name: string,
        score: number,
    }
    bonus?: number,
}

export const DEFAULT_RULES: Rules = {
    name: 'default',
    theme: 'light',
    woundSizeLimit: 2,
    useAspects: true,
    levelup: {
        aspects: 0.5,
        skills: 3,
        attributes: 0,
    },
    skills: [
        {
            name: 'Default skill',
            description: "Skills should be overidden by the ruleset",
        },
    ],
    currency: [
        {
            name: 'Gold',
            description: 'Currency should be overidden by the ruleset',
        }
    ],
    equipment: [
        {
            name: 'Custom item',
            stack: 10,
            custom: true,
            tag: 'custom',
        },
    ],
    containers: [
        {
            name: 'Personal',
            description: 'Equipment carried on ones person',
            size: 5,
        }
    ],
    wounds: [
        {
            name: 'Body',
            description: 'Physical wounds',
            size: 5,
        }
    ],
    powers: [
        {
            name: 'Default power',
            description: 'Powers should be overidden by the ruleset',
            source: 'Default skill',
            dice: {
                base: 3,
                level: 1,
            }
        }
    ],
    attributes: [
        {
            name: 'Strength',
            description: '',
            aspects: [
                {
                    name: 'Violence',
                    description: ''
                },
                {
                    name: 'Control',
                    description: ''
                },
            ]
        },
        {
            name: 'Dexterity',
            description: '',
            aspects: [
                {
                    name: 'Reflex',
                    description: ''
                },
                {
                    name: 'Precision',
                    description: ''
                },
            ]
        },
        {
            name: 'Intellect',
            description: '',
            aspects: [
                {
                    name: 'Wit',
                    description: ''
                },
                {
                    name: 'Knowledge',
                    description: ''
                },
            ]
        },
        {
            name: 'Will',
            description: '',
            aspects: [
                {
                    name: 'Presence',
                    description: ''
                },
                {
                    name: 'Focus',
                    description: ''
                },
            ]
        },
    ],
}

