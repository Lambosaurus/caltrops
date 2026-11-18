import { Skill, SkillSet } from "../lib/rules";
import airlockRuleset from "./airlocks";
import bludgeonRuleset from "./bludgeon";
import felfuturesRuleset from "./felfutures";
import turnipRuleset from "./turnip28";
import lancerRuleset from "./lancer"
import scrapLancerRuleset from "./scraplancer"
import vermisRuleset from "./vermis";
import briefcaseRuleset from "./briefcase";
import driftersRuleset from "./drifters";

// List additional rules here
const RULESETS = [
    bludgeonRuleset,
    driftersRuleset,
    lancerRuleset,
    scrapLancerRuleset,
    airlockRuleset,
    turnipRuleset,
    felfuturesRuleset,
    vermisRuleset,
    briefcaseRuleset,
];

RULESETS.forEach(r => {
    const sets = r.skills.length > 0 && 'skills' in r.skills[0] ? (r.skills as SkillSet[]).map(s => s.skills) : [r.skills as Skill[]]
    sets.forEach(skills => skills.sort( (a,b) => a.name > b.name ? 1 : -1 ))
})

export default RULESETS;