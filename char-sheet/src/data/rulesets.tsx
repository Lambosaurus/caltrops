import airlockRuleset from "./airlocks";
import bludgeonRuleset from "./bludgeon";
import felfuturesRuleset from "./felfutures";
import turnipRuleset from "./turnip28";
import lancerRuleset from "./lancer"
import vermisRuleset from "./vermis";
import briefcaseRuleset from "./briefcase";
import driftersRuleset from "./drifters";

// List additional rules here
const RULESETS = [
    bludgeonRuleset,
    driftersRuleset,
    lancerRuleset,
    airlockRuleset,
    turnipRuleset,
    felfuturesRuleset,
    vermisRuleset,
    briefcaseRuleset,
];

RULESETS.forEach(r => {
    r.skills.sort( (a,b) => a.name > b.name ? 1 : -1 )
})

export default RULESETS;