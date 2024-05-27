import airlockRuleset from "./airlocks";
import bludgeonRuleset from "./bludgeon";
import felfuturesRuleset from "./felfutures";
import turnipRuleset from "./turnip28";
import lancerRuleset from "./lancer"
import vermisRuleset from "./vermis";

// List additional rules here
const RULESETS = [
    bludgeonRuleset,
    lancerRuleset,
    airlockRuleset,
    turnipRuleset,
    felfuturesRuleset,
    vermisRuleset,
];

RULESETS.forEach(r => {
    r.skills.sort( (a,b) => a.name > b.name ? 1 : -1 )
})

export default RULESETS;