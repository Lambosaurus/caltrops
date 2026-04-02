import { Attribute, Rules, Sheet, Power, SheetWound, Dictionary, Equipment, RollInfo, Skill, Container } from './rules'
import RULESETS from '../data/rulesets'
import { v4 as uuidv4 } from 'uuid';
import { filterObject } from './util';

const SKILL_COST = [
    0,
    1,  // +1
    2,  // +1
    4,  // +2
    6,  // +2
    9,  // +3
    12, // +3
]
const SKILL_COST_ONGOING = 3

const ATTRIBUTE_MIN = 1
const ATTRIBUTE_STARTING_MAX = 3
const ATTRIBUTE_STARTING_TOTAL = 8
const ASPECT_MAX = 3

const POWER_DICE_DEFAULT = 2

function skillCost(score: number): number {
    if (score < SKILL_COST.length) {
        return SKILL_COST[score]
    } else {
        return SKILL_COST[SKILL_COST.length-1] + ((score - SKILL_COST.length + 1) * SKILL_COST_ONGOING);
    }
}

function skillIncrementCost(score: number): number {
    // Todo. Make this less wasteful.
    return skillCost(score+1) - skillCost(score)
}

function skillCostTotal(scores: Dictionary<number>): number {
    let sum = 0;
    for (const s in scores) {
        sum += skillCost(scores[s])
    }
    return sum;
}

function skillCostMax(rules: Rules, level: number): number {
    return Math.ceil(level * rules.levelup.skills);
}

function skillIsRollable(skill: Skill, scores: Dictionary<number>): boolean {
    return scores[skill.name] > 0 || !skill.trained;
}

function attributeTotal(attributes: Attribute[], scores: Dictionary<number>): number {
    let sum = 0;
    for (const attr of attributes) {
        sum += scores[attr.name] ?? 0
    }
    return sum;
}

function aspectTotalMax(rules: Rules, level: number): number {
    return Math.ceil(level * rules.levelup.aspects);
}

function aspectTotal(attributes: Attribute[], scores: Dictionary<number>): number {
    let sum = 0;
    for (const attr of attributes) {
        const base = scores[attr.name] ?? 0
        for (const aspect of attr.aspects) {
            sum += (scores[aspect.name] ?? 0) - base
        }
    }
    return sum;
}

function aspectMax(attribute: number): number {
    return attribute + ASPECT_MAX;
}

function attributeMax(rules: Rules, level: number): number {
    return ATTRIBUTE_STARTING_MAX + Math.floor(level * rules.levelup.attributes);
}

function attributeTotalMax(rules: Rules, level: number): number {
    return ATTRIBUTE_STARTING_TOTAL + Math.floor(level * rules.levelup.attributes);
}

/*
 * Modifies the given attribute - adjusting the child aspects
 */
function attributeModify(scores: Dictionary<number>, attribute: Attribute, value: number): Dictionary<number> {
    let newScores = {...scores}
    let delta = value - (scores[attribute.name] ?? 0)
    newScores[attribute.name] = value
    for (const aspect of attribute.aspects) {
        let aspectScore = (scores[aspect.name] ?? 0) + delta
        newScores[aspect.name] = aspectScore > ASPECT_MAX ? ASPECT_MAX : aspectScore;
    }
    return newScores
}

function powerDiceMax(power: Power, scores: Dictionary<number>): number {
    const score = scores[power.source ?? power.name] ?? 0
    if (power.dice) {
        return power.dice.base + (power.dice.level * (score - 1));
    }
    return POWER_DICE_DEFAULT * score;
}

function powerIsAvailable(power: Power, scores: Dictionary<number>): boolean {
    return (scores[power.source ?? power.name] ?? 0) > 0;
}

function woundCreate(size: number, name: string = ""): SheetWound {
    return {
        name: name,
        size: size,
        locked: false,
    }
}

function woundTotal(wounds: SheetWound[]) {
    let total = 0;
    for (let wound of wounds) {
        total += wound.size
    }
    return total;
}

function woundTreat(wound: SheetWound, success: boolean): SheetWound | null {
    if (success) {
        if (wound.size <= 1) {
            return null;
        }
        return {
            ...wound,
            size: wound.size - 1,
            locked: true,
        }
    }
    return {
        ...wound,
        locked: true,
    }
}

function woundStatus(wounds: SheetWound[], body: Container): { isDead: boolean, isUnconcious: boolean } {
    if (!body.size) {
        return {
            isDead: false,
            isUnconcious: false,
        }
    }

    let wound_total = 0
    let locked_wounds = 0
    for (let wound of wounds) {
        if (wound.locked) {
            locked_wounds += wound.size
        }
        wound_total += wound.size
    }
    return {
        isUnconcious: wound_total >= body.size,
        isDead: (wound_total > body.size) || (locked_wounds >= body.size)
    }
}

/*
 *  Cleans up an arbitrary object, converting it into a sheet
 *  This also doubles as a way to create a new sheet or sanitise an existing one
 */
function loadSheet(obj: any = {}): Sheet {
    const truthyValues = (_: string,v: any) => !!v;
    const result: Sheet = {
        rules: obj.rules ?? '',
        id: obj.id ?? uuidv4(),
        owner: obj.owner ?? null,
        equipment: filterObject(obj.equipment, truthyValues ),
        skills: filterObject(obj.skills, truthyValues),
        attributes: filterObject(obj.attributes, truthyValues),
        powers: filterObject(obj.powers, truthyValues),
        wounds: filterObject(obj.wounds, truthyValues),
        notes: [ ...(obj.notes || []) ],
        currency: filterObject(obj.currency, truthyValues),
        info: {
            name: obj.info?.name ?? '',
            level: obj.info?.level ?? 1,
            background: obj.info?.background ?? '',
        }
    }
    return result;
}

/*
 * Clones a sheet, removing the unique identifying information
 */
function cloneSheet(sheet: Sheet): Sheet {
    const result: Sheet = {
        ...sheet,
        owner: null,
        id: uuidv4(),
    }
    return result
}

function importSheet(obj: any): Sheet {
    return loadSheet(obj);
}

function cleanSheet(sheet: Sheet): Sheet {
    return loadSheet(sheet)
}

function newSheet(rules: Rules, name: string = 'New Character'): Sheet {
    let sheet = loadSheet();
    sheet.rules = rules.name
    sheet.info.name = name
    for (const attribute of rules.attributes) {
        sheet.attributes[attribute.name] = ATTRIBUTE_MIN
        for (const aspect of attribute.aspects) {
            sheet.attributes[aspect.name] = ATTRIBUTE_MIN
        }
    }
    return sheet;
}

function loadRules(name: string = ""): Rules {
    for (let r of RULESETS) {
        if (r.name === name) {
            return r;
        }
    }
    return RULESETS[0]; // Default
}

function listRules(): string[] {
    return RULESETS.map( r => r.name )
}

function equipmentFilter(equipment: Equipment[], tags?: string[]): Equipment[] {
    if (tags) {
        let resolved = tags.map( t => t === '.' ? undefined : t )
        return equipment.filter( e => resolved.includes(e.tag) )
    }
    // No tags. Return all.
    return equipment;
}

function rollDiceCount(info: RollInfo): number {
    return (info.skill?.score ?? 0) + (info.attribute?.score ?? 0) + (info.bonus ?? 0);
}

function rollD4(): number {
    return Math.floor(Math.random() * 4) + 1;
}

function rollDice(info: RollInfo): number[] {
    const dice = rollDiceCount(info)
    let result: number[] = []
    for (let i = 0; i < dice; i++) {
        result.push( rollD4() )
    }
    return result
}

function rollDescribe(info: RollInfo): string {
    let text = `${info.skill?.name}: ${info.attribute?.name}`
    if (info.bonus) {
        if (info.bonus > 0) {
            text = `${text} +${info.bonus}`
        }
        else {
            text = `${text} ${info.bonus}`
        }
    }
    return text;
}

const caltrops = {
    skillCost: skillCost,
    skillIncrementCost: skillIncrementCost,
    skillCostTotal: skillCostTotal,
    skillCostMax: skillCostMax,
    skillIsRollable: skillIsRollable,
    attributeMin: ATTRIBUTE_MIN,
    attributeMax: attributeMax,
    attributeTotalMax: attributeTotalMax,
    aspectMax: aspectMax,
    attributeTotal: attributeTotal,
    attributeModify: attributeModify,
    aspectTotal: aspectTotal,
    aspectTotalMax: aspectTotalMax,
    powerIsAvailable: powerIsAvailable,
    powerDiceMax: powerDiceMax,
    equipmentFilter: equipmentFilter,
    newSheet: newSheet,
    importSheet: importSheet,
    cleanSheet: cleanSheet,
    woundCreate: woundCreate,
    woundTotal: woundTotal,
    woundTreat: woundTreat,
    woundStatus: woundStatus,
    loadRules: loadRules,
    listRules: listRules,
    rollDice: rollDice,
    rollDiceCount: rollDiceCount,
    rollDescribe: rollDescribe,
    cloneSheet: cloneSheet,
}
export default caltrops;