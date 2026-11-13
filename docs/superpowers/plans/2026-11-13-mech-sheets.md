# Mech Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in mech documents to the Caltrops character sheet. A new "Scrap Lancer" ruleset gets chassis with typed slots, a drag-and-drop loadout, energy/heat/turn tracking, location damage and activation roll prompts. Pilots get Pilot | Mech tabs, and a mech can also be opened on its own.

**Architecture:** All mech rules are pure, immutable TypeScript functions in `char-sheet/src/lib/mech/`. Each takes `(rules, mech, …)` and returns a new `Mech` (plus log events where something happened), with randomness injected through a `Roller`. They are unit tested with Jest. A mech is a server document of type `"mech"`, held in the existing `ObjectService` under the path `mech`, next to `sheet`. React components in `char-sheet/src/components/mech/` read it with `useListener` and write it with `view.publish`, exactly as the sheet components do. Rules data (chassis, attachments, ammo, slot types) lives in the new ruleset file `data/scraplancer.tsx` under `Rules.mechs`.

**Tech Stack:** React 18, TypeScript 4.8, react-scripts 5 (Jest), DaisyUI 2 / Tailwind 3, react-dnd 16, existing `ObjectService`/`View`.

**Spec:** `docs/superpowers/specs/2026-11-13-mech-sheet-design.md`. Behaviour reference: `.superpowers/brainstorm/48986-1794544213/content/mech-prototype.html` (git-ignored; open it in a browser; its `<script>` holds working logic for every rule below). Where they differ, the spec wins.

## Global Constraints

- **Branch:** work on `feature/mechs` off `master`. Never commit `.superpowers/` (it is git-ignored). Do not touch `.github/workflows/*`.
- **Opt-in:** rulesets without `mechs` must look and behave exactly as before. Do not edit `data/lancer.tsx` or any other existing ruleset file except to register the new one in `data/rulesets.tsx`.
- **Sheet compatibility:** `Sheet.mech` is optional. Existing saved sheets must still load, and `loadSheet`/`cleanSheet` must preserve `mech`.
- **Automation defaults:** `MechSettings` defaults are `{ autoAmmo:false, autoHeatDamage:false, autoCookoff:false, autoHitDamage:false }`. With a setting off, the sheet logs what to roll or mark and changes nothing for it.
- **Purity:** `lib/mech/*` has no React imports and no `Math.random`. Randomness comes in as `Roller = (n: number) => number[]` (n d4 results, each 1–4). A success is a 4.
- **Patterns:** use `useListener`/`view.publish`, `EditMode` (loadout editing needs `EditMode.Full`; play needs `EditMode.Live`), `ActionModal`, `PointEntryBox`, `IconButton`, `DropTarget`/`DragSource` (react-dnd type `'mech-part'`).
- **Tests:** `cd char-sheet && CI=true npx react-scripts test --watchAll=false <path>`. Test files sit next to their source as `*.test.tsx`.
- **Commits:** end every message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Old sheets and old mech documents:** a saved Bludgeon or Lancer sheet with no `mech` field, or a mech document missing `turn`, `settings` or `equipment`, loads without crashing and gets defaults. Tests in Task 1 (`loadSheet`) and Task 2 (`loadMech` on partial input).
2. **Read-only viewers:** someone opening another player's mech by link sees everything, but every control that changes the mech is disabled (`EditMode.None`). Checked in Task 7's manual check and by the `editable` prop on every Task 8–11 component.
3. **A rule pushes a value out of range:** energy never goes negative, heat never below 0, ammo stays within 0..perBin, armour within 0..max, and wounds past the core never throw. Tests in Tasks 4 and 5.
4. **A chassis loses the part that makes something possible:** a destroyed leg lowers Speed and Evasion, a destroyed heat sink lowers Heat Max mid-turn, a destroyed reactor gives 0 energy, and a destroyed Manipulator removes Hand. Tests in Task 3.
5. **The mech's ruleset isn't loaded,** or the mech names an attachment that is not in the ruleset: render the mount as "Unknown part: <name>" with no actions, and never crash. Tests in Task 2 (`findAttachment` miss) and Task 3 (`deriveStats` skips unknowns).

---

### Task 1: Mech types and sheet field

**Files:**
- Create: `char-sheet/src/lib/mech/types.tsx`
- Modify: `char-sheet/src/lib/rules.tsx` (add `mechs?: MechRules` to `Rules`, `mech?: string` to `Sheet`)
- Modify: `char-sheet/src/lib/caltrops.tsx` (`loadSheet` keeps `mech`)
- Test: `char-sheet/src/lib/caltrops.test.tsx`

**Interfaces:**
- Produces, in `lib/mech/types.tsx`. Every later task imports these.

```ts
export type RangeBand = 'Short' | 'Mid' | 'Long'
export type Roller = (n: number) => number[]
export interface MechSlotType { name: string /* '' = untyped */, label: string, color: string, description: string }
export interface ChassisSection {
  id: string, name: string, range: [number, number], slots: string[],
  transfer: string | null /* section id, 'pilot', or null for the core */,
  provides?: { speed?: number, evasion?: number }, area: string /* CSS grid-area */,
}
export interface ChassisLoadout { armour?: string, mounts: [string, number][] /* [attachment name, start slot] */ }
export interface Chassis {
  name: string, description?: string, heatMax: number, shape: 'biped' | 'tracked',
  sections: ChassisSection[], loadout?: { [sectionId: string]: ChassisLoadout },
}
export interface MechAttachment {
  name: string, type: string /* slot type name, 'Generic', or 'Armour' */, group: string, size?: number,
  description?: string, tags?: string, effect?: string,
  energy?: number, heat?: number, ammo?: string, repeat?: number, charges?: number,
  range?: RangeBand | 'Melee', roll?: { aspect?: string, skill: string, bonus?: number },
  reactor?: { energy: number, heat: number }, cooling?: number, heatSink?: number,
  capacitor?: number, hand?: boolean, stowage?: number, bin?: string /* ammo name */, armour?: number,
}
export interface MechAmmo { name: string, perBin: number, volatility: number }
export interface MechRules {
  slotTypes: MechSlotType[], chassis: Chassis[], attachments: MechAttachment[], ammo: MechAmmo[],
  rangeAspects: { [band in RangeBand]: string }, sprint: { energy: number, heat: number },
  sittingDuck: number, stunned: number,
}
export interface Mount { name: string, start: number, ammo?: number, charges?: number, state?: { [k: string]: any } }
export interface MechSectionState { armour: { name: string, points: number } | null, mounts: Mount[], wounds: boolean[] }
export interface MechTurn {
  phase: 'active' | 'ended', posture: 'still' | 'moved' | 'sprint', energy: number, heat: number,
  stored: number, shutdown: boolean, used: { [mountKey: string]: number }, lastFired: string | null,
  target: RangeBand, out: boolean, pilotWounds: number,
}
export interface MechSettings { autoAmmo: boolean, autoHeatDamage: boolean, autoCookoff: boolean, autoHitDamage: boolean }
export interface Mech {
  rules: string, id: string, owner: string | null, name: string, chassis: string,
  sections: { [sectionId: string]: MechSectionState },
  equipment: { [container: string]: SheetEquipment[] } /* key 'Stowage' */,
  turn: MechTurn, settings: MechSettings,
}
export interface MechResult { mech: Mech, events: string[] }
export const DEFAULT_MECH_SETTINGS: MechSettings = { autoAmmo: false, autoHeatDamage: false, autoCookoff: false, autoHitDamage: false }
```

- A mount key is `` `${sectionId}:${start}` ``.

- [ ] **Step 1: Branch and failing test**

Run `git checkout -b feature/mechs`. In `caltrops.test.tsx`:
- `loadSheet keeps mech id`: `caltrops.importSheet({ mech: 'abc' }).mech === 'abc'`.
- `loadSheet without mech leaves it undefined`: `caltrops.importSheet({}).mech === undefined`.

- [ ] **Step 2: Run, expect FAIL** (`mech` is dropped)

Run: `cd char-sheet && CI=true npx react-scripts test --watchAll=false src/lib/caltrops.test.tsx`

- [ ] **Step 3: Implement.** Add the types file, add `mechs?: MechRules` to `Rules`, add `mech?: string` to `Sheet`, and in `loadSheet` set `mech: obj.mech ?? undefined`. Add `mech` only when it is defined, so existing sheets serialise unchanged.

- [ ] **Step 4: Run, expect PASS.** Also run `npx tsc --noEmit -p .` and expect no errors.

- [ ] **Step 5: Commit** — `feat(mech): mech types and optional sheet.mech`

---

### Task 2: Loadout logic

**Files:**
- Create: `char-sheet/src/lib/mech/loadout.tsx`
- Test: `char-sheet/src/lib/mech/loadout.test.tsx`, with a small fixture `char-sheet/src/lib/mech/fixture.tsx` exporting `FIXTURE_RULES: MechRules`. Use a Mule-like chassis `Mule`, copied from the spec rules tables. It has:
    - core `['Hull','Reactor','Reactor','Tech','','']`, hit range 7–9;
    - arms with a `Hand` slot followed by `Weapon` slots;
    - legs `['Hull','','']` with `provides: {speed:30, evasion:1}`;
    - cockpit `['Hull','Tech']`, transfer `'pilot'`;
    - shoulder `['Weapon','']`;
    - and attachments Dipole Fusion Reactor, Heat Exchanger, Autocannon, Machine Gun, Manipulator, Heat Sink, Radiator Fins, Ammo Bin: Light / Standard / Missile, Plating, Composite Plating, Stowage Rack, Jump Jets, SRM Rack, Sensor Array.

    Take the attachment numbers from the prototype's `CAT` table. Later tasks' tests reuse this fixture.

**Interfaces:**
- Produces:
  - `mountKey(sectionId: string, start: number): string`
  - `findChassis(rules: MechRules, name: string): Chassis | undefined`
  - `findAttachment(rules: MechRules, name: string): MechAttachment | undefined`
  - `slotAccepts(slotType: string, attachmentType: string): boolean`
  - `mountAt(mech: Mech, sectionId: string, slot: number): Mount | undefined`
  - `canMount(rules: MechRules, mech: Mech, sectionId: string, name: string, start: number, ignoreStart?: number): boolean`
  - `mount(rules, mech, sectionId, name, start): Mech` (fills ammo/charges)
  - `unmount(mech, sectionId, start): Mech`
  - `moveMount(rules, mech, from: {section: string, start: number}, to: {section: string, start: number}): Mech` (a no-op if the move is invalid)
  - `setArmour(rules, mech, sectionId, name: string | null): Mech` (fills points)
  - `newMech(rules: Rules, chassisName: string, name?: string): Mech`
  - `changeChassis(rules: Rules, mech: Mech, chassisName: string): Mech` (empty loadout, same id, owner and name)
  - `loadMech(obj: any): Mech` (sanitises; fills `DEFAULT_MECH_SETTINGS`, a fresh turn, and `equipment: {Stowage: []}`)
  - `freshTurn(): MechTurn` (phase `'active'`, posture `'still'`, target `'Mid'`, everything else zero/empty)

- [ ] **Step 1: Failing tests** in `loadout.test.tsx`:
    - `slotAccepts`:
        - `('Weapon','Weapon')` is true; `('Weapon','Tech')` is false;
        - `('','Generic')` is true; `('','Weapon')` is false;
        - `('Reactor','Generic')` is true;
        - `('Hull','Generic')` and `('Armour','Generic')` are false.
    - `canMount` on an empty Mule:
        - Autocannon (size 2) at left arm start 1 is true; at start 2 is false (it runs off the end);
        - Dipole (size 2) at core 1 is true; at core 3 is false (the slot is Tech);
        - Ammo Bin: Light at core 4 is true;
        - Machine Gun at left leg 1 is false (untyped slot);
        - after mounting a Heat Exchanger at core 3, a Dipole at core 2 is false (the slots overlap).
    - `newMech` with a chassis loadout:
        - the mounts are present;
        - ammo bins are full (`Ammo Bin: Light` has `ammo === 16`);
        - armour points are at max;
        - `settings` equals `DEFAULT_MECH_SETTINGS`;
        - `turn.energy` equals the reactor output (6 for a Dipole).
    - `moveMount`: an invalid target leaves the mech deep-equal to the input.
    - `changeChassis` keeps `id` and `name`, and every section's `mounts` is empty.
    - `loadMech({ chassis:'Mule', sections:{} })` returns `settings` equal to the defaults, `turn.phase === 'active'` and `equipment.Stowage` equal to `[]`.
    - `findAttachment(FIXTURE_RULES,'Nope')` is `undefined`.
- [ ] **Step 2: Run, expect FAIL** (module missing). Command: `CI=true npx react-scripts test --watchAll=false src/lib/mech/loadout.test.tsx`
- [ ] **Step 3: Implement `loadout.tsx`.** Ids come from `uuid` v4, as in `caltrops.newSheet`. `newMech` takes its energy from `deriveStats` (Task 3) through a local `reactorOutput` helper so this task stays independent: sum `reactor.energy` over mounted reactors.
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `feat(mech): loadout rules (slot fit, mount, move, new mech)`

---

### Task 3: Derived stats

**Files:**
- Create: `char-sheet/src/lib/mech/derive.tsx`
- Test: `char-sheet/src/lib/mech/derive.test.tsx`

**Interfaces:**
- Consumes: Task 2 `findChassis`, `findAttachment`, `mountKey`.
- Produces:
  - `slotsOf(rules, mount): number[]`
  - `mountDisabled(rules, mech, sectionId, mount): boolean` (every slot it occupies is wounded)
  - `sectionDestroyed(mech, sectionId): boolean` (has slots and all are wounded)
  - `mountWorking(rules, mech, sectionId, mount): boolean`
  - `aimCost(section: ChassisSection): number` (`max(1, 5 − faces)`)
  - `hitLabel(section): string` (`'7–9'` or `'12'`)
  - `sectionForRoll(chassis: Chassis, d12: number): ChassisSection`
  - `interface MechStats { energyOut, reactorHeat, cooling, heatMax, baseHeatMax, capacitor, speed, evasion, stowage: number; hand, hasReactor, hasCooling: boolean }`
  - `deriveStats(rules: MechRules, mech: Mech): MechStats`
  - `overheated(rules, mech): boolean` (heat > heatMax)

- [ ] **Step 1: Failing tests:**
    - Fixture Mule loaded as in the spec's worked example (Dipole, Heat Exchanger, Radiator Fins, Heat Sink, two legs). `deriveStats` gives `energyOut 6`, `reactorHeat 2`, `cooling 4`, `heatMax 9` (7 + 2), `speed 60`, `evasion 2`, `hand true`.
    - Wound every left-leg slot. Then `speed 30`, `evasion 1`, and `heatMax 7` (the heat sink was in that leg).
    - Wound both reactor slots. Then `energyOut 0` and `hasReactor true` (it is still mounted).
    - Disable the Manipulator. Then `hand false`.
    - `aimCost` of a 1-face section is 4, of a 3-face section is 2, of a 5-face section is 1.
    - `sectionForRoll(mule, 12).id === 'shoulder'` and `sectionForRoll(mule, 1).id === 'lleg'`.
    - A mount whose name is unknown is skipped by `deriveStats` without throwing.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement `derive.tsx`.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `feat(mech): derived mech stats`

---

### Task 4: Damage logic

**Files:**
- Create: `char-sheet/src/lib/mech/damage.tsx`
- Test: `char-sheet/src/lib/mech/damage.test.tsx`

**Interfaces:**
- Consumes: Tasks 2–3.
- Produces:
  - `applyWounds(rules: MechRules, mech: Mech, sectionId: string, count: number, opts: { ignoreArmour?: boolean, cookoff: boolean, roller: Roller }): MechResult`
  - `cookoffDice(rules, mount): number` (rounds left × `volatility`)
  - `toggleWound(rules, mech, sectionId, slot): Mech`
  - `setArmourPoints(rules, mech, sectionId, points): Mech` (clamped to 0..max)
  - `adjustAmmo(rules, mech, key: string, delta: number): Mech` (clamped to 0..perBin)
  - `repairAll(rules, mech): Mech` (clears wounds, refills armour, ammo and charges, sets `turn.out` false and `pilotWounds` 0)

**Algorithm for `applyWounds`.** It is not determined by the signature, so here it is. Loop while `count > 0`:
1. If the section is `'pilot'`: add `count` to `turn.pilotWounds`, log it, and stop.
2. If armour applies (not `ignoreArmour`) and has points: soak `min(count, points)` and continue the loop.
3. Mark the first unwounded slot, top to bottom. If that disables an ammo bin with rounds left:
    - with `cookoff` on: roll `cookoffDice` with `roller`, zero the bin, and recursively apply the 4s to this section with armour ignored;
    - with it off: log `"<bin> disabled with N rounds: cook-off is Xd4 to this section, ignoring armour. Apply by hand."`.
4. If no unwounded slot remains: move to `transfer`. If `transfer` is `null`, set `turn.out = true` and stop.

Log one event per soak, wound, destruction and transfer, worded like the prototype's log.

- [ ] **Step 1: Failing tests** (fixture Mule with full Plating (2) on the left leg; `roller` returns preset arrays):
    - **Soak:** 3 wounds to the left leg give armour 0 and `wounds [true,false,false]` (Hull hit first).
    - **Overflow:** 6 wounds to the left leg destroy it (3 slots after 2 armour), and 1 wound transfers to the core, whose Composite armour goes from 3 to 2.
    - **Cockpit to pilot:** wounds past a destroyed cockpit add to `turn.pilotWounds`.
    - **Core destroyed:** sets `turn.out` and stops without throwing, even with `count` 99.
    - **Cook-off off:** disabling a full Ammo Bin: Standard leaves `ammo === 8`, and an event contains `16d4`.
    - **Cook-off on:** with roller `n => Array(n).fill(4)` and a full Light bin, the cook-off rolls 16 dice and its wounds land in that section, ignoring armour.
    - **Clamps:** `adjustAmmo` past 0 or past perBin clamps; `setArmourPoints(…, 9)` clamps to max.
    - **Repair:** `repairAll` clears every wound and refills a bin set to 0.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement `damage.tsx`.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `feat(mech): location damage, overflow and cook-off`

---

### Task 5: Turn and roll logic

**Files:**
- Create: `char-sheet/src/lib/mech/turn.tsx`, `char-sheet/src/lib/mech/roll.tsx`
- Test: `char-sheet/src/lib/mech/turn.test.tsx`, `char-sheet/src/lib/mech/roll.test.tsx`

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces (`turn.tsx`):
  - `rangePenalty(att: MechAttachment, target: RangeBand): number`
  - `outOfRange(att, target): boolean` (Melee needs Short)
  - `activationBlocker(rules, mech, key: string): string | null` (null means it can activate)
  - `activate(rules, mech, key, roller): MechResult`
  - `move(rules, mech): MechResult`
  - `sprint(rules, mech, roller): MechResult`
  - `endTurn(rules, mech): MechResult`
  - `shutdownPurge(rules, mech): MechResult`
  - `startTurn(rules, mech): MechResult`
  - `attackModifier(rules, mech): { total: number, parts: { value: number, label: string }[] }`
- Produces (`roll.tsx`):
  - `activationRoll(rules: Rules, att: MechAttachment, target: RangeBand, scores: Dictionary<number>): RollInfo | null`
  - The aspect is `att.roll.aspect ?? rules.mechs.rangeAspects[att.range]`. The skill is `att.roll.skill`; each score comes from `scores[name] ?? 0`. The bonus is `(att.roll.bonus ?? 0) − rangePenalty`. An attachment with no `roll` returns `null`.

**Rules values:**
- **Activate:** costs energy and heat; ammo is spent only if `settings.autoAmmo` (otherwise log "spend 1 X ammo by hand"); increments `used[key]`; sets `lastFired`.
- **Overheat:** if the mech was already overheated before the action, the overage after it is rolled as d4 when `settings.autoHeatDamage`. The 4s wound the acting mount's slots first (sprint: the first surviving leg); any left over go through `applyWounds` with armour ignored. With the setting off, log the roll to make.
- **Blockers:** turn ended, out of action, section destroyed, mount disabled, Repeating limit reached, not enough energy, no charges, no working bin with rounds, out of range. Use the prototype's `whyNot` wording.
- **Move/sprint:** sprint costs `rules.sprint` (2 energy, +2 heat) and sets posture `'sprint'`; move sets `'moved'`. Neither is allowed at Speed 0.
- **End turn:** heat `+ reactorHeat − cooling`, floored at 0; stores `min(capacitor, energy)`; phase `'ended'`.
- **Shut down & purge:** heat `− cooling`, floored at 0; `shutdown true`; stored 0; phase `'ended'`.
- **Start turn:** phase `'active'`, used `{}`, posture `'still'`, shutdown `false`, energy `energyOut + stored`, stored 0.
- **Attack modifier:** `+sittingDuck` (2) if posture `'still'`; `−evasion` if `'sprint'`; `+stunned` (1) if shut down.

- [ ] **Step 1: Failing tests** (`turn.test.tsx`, fixture Mule, settings all on unless stated):
    - **Brawl pacing (the spec's worked example):** at target Short, from heat 0, activate Autocannon, Machine Gun ×2 and Jump Jets each turn.
        - Turn 1 ends at heat 4.
        - In turn 2, the Jump Jets take heat to 10 with no roll (the roller is never called).
        - `endTurn` gives 8.
    - **Overheated action:** at heat 10/9, activating the Machine Gun calls the roller with 2 (overage after = 11 − 9). A 4 wounds the Machine Gun.
    - **Overheat damage off:** `autoHeatDamage false`, so the roller is never called and an event mentions `d4`.
    - **Ammo off:** `autoAmmo false`, so activation leaves the bin count unchanged.
    - **Blockers:**
        - Machine Gun at target Mid → `'Target is beyond Short range.'`;
        - Hammer at target Mid → contains `'Melee'`;
        - a third Machine Gun use → contains `'Already activated 2×'`.
    - **Shut down & purge:** at heat 13, cooling 4 → heat 9, `shutdown true`, `attackModifier(...).total === 3` (still + stunned).
    - **Start turn:** clears `used`, sets posture `'still'`, energy back to 6.
    - **Sprint:** gives energy −2, heat +2, posture `'sprint'`, and `attackModifier` total −2. With both legs destroyed, `move` and `sprint` return the mech unchanged.

    `roll.test.tsx`:
    - Autocannon at target Short with scores `{Precision:3, Gunnery:2}` gives `{attribute:{name:'Precision',score:3}, skill:{name:'Gunnery',score:2}, bonus:2}` (3 − 1 range penalty).
    - The Manipulator gives aspect `Violence`.
    - Jump Jets give `null`.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Implement `turn.tsx` and `roll.tsx`.**
- [ ] **Step 4: Run, expect PASS** for all of `src/lib/mech`.
- [ ] **Step 5: Commit** — `feat(mech): turn, heat, mobility and activation rolls`

---

### Task 6: Scrap Lancer ruleset data

**Files:**
- Create: `char-sheet/src/data/scraplancer.tsx`
- Modify: `char-sheet/src/data/rulesets.tsx` (import it and add it after `lancerRuleset`)
- Test: `char-sheet/src/data/scraplancer.test.tsx`

**Interfaces:**
- Consumes: Task 1 types; Task 2 `canMount` and `newMech`.
- Produces: `scrapLancerRuleset: Rules`, with:
    - `name 'Scrap Lancer'`, `theme 'lancers'`;
    - `useAspects true` with `DEFAULT_RULES.attributes`;
    - `levelup` copied from Lancer;
    - Lancer's skills with `Gunnary` renamed `Gunnery`;
    - currency Solari and U;
    - Lancer's `handheld` equipment plus `DEFAULT_RULES.equipment`;
    - containers `Personal` (5, tags `handheld`, `custom`) and `Stowage` (5);
    - wounds `[{name:'Body', size:5}]`;
    - powers from Lancer;
    - and `mechs`.
- `mechs` holds:
    - `slotTypes` (labels and colours below);
    - the chassis Jackal, Mule and Bulwark, exactly as the prototype's `CHASSIS` and `PRESETS` (current version, with Reactor/Weapon/untyped slots, the Mule's shoulder, and the hit numbering);
    - all attachments in the prototype's `CAT`, with field names mapped to `MechAttachment`. Weapons roll `Gunnery`; melee rolls `Melee`; the Sensor Array rolls `{aspect:'Wit', skill:'Computing'}`;
    - `ammo`: `[Light 16 ×1, Standard 8 ×2, Missile 5 ×3, Heavy 4 ×4]`;
    - `rangeAspects` `{Short:'Reflex', Mid:'Precision', Long:'Precision'}`, `sprint {energy:2, heat:2}`, `sittingDuck 2`, `stunned 1`.
- Slot type colours, from the prototype: Hull `#7d8aa3`, Reactor `#f2a024`, Weapon `#ff5c6c`, Tech `#20d6fa`, Hand `#c58cff`, untyped `#46536e`, Armour `#24e076`, Generic `#d8dee9`.

- [ ] **Step 1: Failing tests:**
    - **Hit faces:** every chassis's section ranges cover 1–12 exactly once.
    - **Loadouts fit:** every chassis loadout entry passes `canMount` on an empty mech of that chassis.
    - **References resolve:** every `ammo` and `bin` attachment field names an entry in `ammo`, and every slot string is a `slotTypes` name.
    - **Registration:** `caltrops.listRules()` contains `'Scrap Lancer'`, and the `Lancer` ruleset object has no `mechs` key.
- [ ] **Step 2: Run, expect FAIL.**
- [ ] **Step 3: Write the data file and register it.**
- [ ] **Step 4: Run, expect PASS.**
- [ ] **Step 5: Commit** — `feat(mech): Scrap Lancer ruleset with chassis and attachments`

---

### Task 7: Loading, saving and opening mechs

**Files:**
- Modify: `char-sheet/src/pages/MainPage.tsx`
- Modify: `char-sheet/src/components/MenuRibbon.tsx`
- Create: `char-sheet/src/components/mech/NewMechModal.tsx`
- Create: `char-sheet/src/components/mech/LoadMechModal.tsx` (pattern of `LoadSheetModal`, listing `server.list(token,'mech')`)
- Create: `char-sheet/src/lib/mech/store.tsx`

**Interfaces:**
- Consumes: Task 2 `newMech`, `loadMech`.
- Produces in the `ObjectService` root view:
    - path `mech` (the current `Mech` or undefined);
    - path `mechEditable` (an `EditMode`);
    - path `mechLog` (`string[]`, ephemeral, never saved);
    - path `mode` (`'sheet' | 'mech'`; `'mech'` means a standalone mech with no pilot).
- `store.tsx` exports:
  - `openMech(view: View, id: string): Promise<void>` (reads the document, publishes `loadMech(content)`, sets `mechEditable` from the owner and token like `onSheetChange`, and loads the mech's ruleset into `rules` when `mode === 'mech'`)
  - `logMech(view: View, events: string[]): void` (prepends events to `mechLog`, keeping at most 100)
  - `MECH_DOC_TYPE = 'mech'`

- [ ] **Step 1: Implement.**
    - **URL:** `?mech=<id>` sets `mode 'mech'` and calls `openMech`. Otherwise `mode 'sheet'`, and when `sheet.mech` is set, `openMech(sheet.mech)` runs after the sheet loads and on `sheet/mech` change.
    - **Auto-save:** subscribe to `mech` with the same 5-second auto-save pattern, using `server.write(token, mech.id, 'mech', mech.name, mech)`. It only runs when the user owns the mech or it is unowned, then sets `owner`.
    - **Menu:** in `MenuRibbon`, when the current rules have `mechs`, add "New mech" (`NewMechModal`: name plus chassis select, which publishes `newMech(...)` and, in sheet mode, sets `sheet/mech` to its id) and "Load mech" (`LoadMechModal`).
    - **Rendering:** in `mode 'mech'`, `MainPage` renders `MechView` (Task 8) instead of `SheetView`. Until Task 8 lands, render a placeholder `<pre>` of `mech.name`.
- [ ] **Step 2: Verify manually.** `npm start`, choose the Scrap Lancer ruleset, then New mech → Mule.
    - The placeholder shows "Mule"; after 5 s a "Mech auto saved" alert appears.
    - Copy the id, open `?mech=<id>` in a private window: it loads read-only (`mechEditable === EditMode.None`).
    - Load a Bludgeon sheet: no mech menu items appear.
- [ ] **Step 3: Commit** — `feat(mech): mech documents, load/save, menu entries`

---

### Task 8: Mech sheet view (display) and Pilot | Mech tabs

**Files:**
- Create: `char-sheet/src/components/mech/MechView.tsx` (status bar, legend, body grid over the silhouette, side column)
- Create: `char-sheet/src/components/mech/MechSection.tsx` (header, provides line, armour row, slot rows)
- Create: `char-sheet/src/components/mech/ChassisSilhouette.tsx` (inline SVG for `biped` / `tracked`, plus a shoulder pod when a section id is `shoulder`; port it from the prototype's `shadowSVG`)
- Create: `char-sheet/src/components/mech/Popover.tsx` (`<Popover content={ReactNode}>{children}</Popover>`: hover shows a fixed-position box that follows the cursor and flips at the viewport edges, as the prototype does)
- Create: `char-sheet/src/components/mech/mechText.tsx` (pure functions returning popover content strings for sections, attachments, slot types and stats, ported from the prototype's `popHTML`/`attStats`, so components stay small)
- Create: `char-sheet/src/components/mech/CurrentMechCard.tsx`, `char-sheet/src/components/mech/AssignMechModal.tsx`
- Modify: `char-sheet/src/components/SheetView.tsx`

**Interfaces:**
- Consumes: Tasks 3 and 5 (`deriveStats`, `aimCost`, `hitLabel`, `activationBlocker`, `attackModifier`) and Task 7's paths.
- Produces: `MechView({ view: View /* root */, editable: EditMode })` and `MechSection({ rules: MechRules, section: ChassisSection, view: View /* mech */, editable: EditMode, onHit(sectionId: string): void, onActivate(key: string): void })`.

- [ ] **Step 1: Implement the display.** Match the prototype's layout:
    - **Status bar:** chassis, energy x/out with a meter, heat x/max with the end-of-turn projection, Speed, Evasion, Hand, posture badge, OVERHEATED / SHUT DOWN / OUT badges.
    - **Legend:** slot-type chips coloured from `rules.mechs.slotTypes`.
    - **Body:** a 6-column grid using `section.area`, over the silhouette.
    - **Slot rows:** a colour stripe and tag for the type, the mounted part name (continuation rows marked `↳ <name>`), a wound box, and an action button showing `"<E>E +<H>H"` or `used/repeat`. The button is disabled when `activationBlocker` is non-null; passive parts show their passive value instead.
    - **Popovers** on every one of these, using `mechText`.
    - **Tabs:** `SheetView` shows DaisyUI tabs "Pilot" and "Mech: <name>" when `rules.mechs` is set; without `rules.mechs` it renders exactly as before.
    - **Current mech card:** the Pilot tab shows `CurrentMechCard` (name, chassis, heat/energy, an "Open" button that switches tab, and "Assign…" which opens `AssignMechModal` to pick from your mechs or paste an id/link, setting `sheet/mech`).
- [ ] **Step 2: Verify manually.**
    - A new Mule renders sections in the mech shape with the right hit labels (left leg `(hit: 1–2) · aim 3`, shoulder `(hit: 12) · aim 4`).
    - Hovering the left leg header shows `Speed 30, Evasion 1`.
    - A Bludgeon sheet shows no tabs.
    - Run `npx tsc --noEmit -p .` and expect no errors.
- [ ] **Step 3: Commit** — `feat(mech): mech sheet view and pilot/mech tabs`

---

### Task 9: Play controls

**Files:**
- Create: `char-sheet/src/components/mech/TurnControls.tsx` (target range select, Move, Sprint, End turn, Shut down & purge, Start turn)
- Create: `char-sheet/src/components/mech/HitModal.tsx` (per section)
- Create: `char-sheet/src/components/mech/TakeHitPanel.tsx` (successes, deflection, location: roll d12 or aimed section)
- Create: `char-sheet/src/components/mech/MechSettingsPanel.tsx`, `char-sheet/src/components/mech/MechLog.tsx`
- Modify: `MechView.tsx`, `MechSection.tsx` (wound box, armour pip and ammo ± handlers; Hit button)

**Interfaces:**
- Consumes: Tasks 4 and 5 functions, and `logMech`.
- Every handler follows one pattern:

  ```
  const { mech: next, events } = fn(rules.mechs, view.read('mech'), …)
  view.publish('mech', next)
  logMech(root, events)
  ```

  Pass `roller = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 4) + 1)`. Define that once in `components/mech/roller.tsx`.

- [ ] **Step 1: Implement.**
    - **Turn buttons:** End turn shows while the phase is `'active'`; Start turn while it is `'ended'`. The OVERHEATED banner offers Shut down & purge.
    - **HitModal:**
        - a number box (focused, Enter applies, Escape cancels), an "ignores armour" checkbox, and the current `attackModifier` line;
        - Apply calls `applyWounds` when `settings.autoHitDamage` is on;
        - when it is off, Apply marks the entered wounds itself (armour points first unless ignored, then slots top-down, no overflow, no cook-off) and logs "N wounds marked on <section>".
    - **TakeHitPanel:** subtracts deflection, picks the section with `sectionForRoll` (rolling the d12 with `Math.random`) or the aimed choice, then behaves like HitModal.
    - **By hand:**
        - a wound box calls `toggleWound`;
        - armour pips call `setArmourPoints`;
        - ammo ± calls `adjustAmmo`;
        - Repair & rearm confirms through `ActionModal`, then calls `repairAll`.
    - **Settings panel:** the four checkboxes write `mech/settings/*`.
    - **Log:** shows `mechLog`.
    - Every control is disabled below `EditMode.Live`.
- [ ] **Step 2: Verify manually** against the spec's worked example on a fresh Mule (all settings off):
    - Move: the badge changes from SITTING DUCK to MOVED.
    - Hit on the left leg with 3: armour 2 → 0, the Hull is wounded, and the log says 3 marked.
    - Turn `autoHitDamage` on, then Hit the left leg with 4: the leg is destroyed and the overflow goes to the core.
    - Read-only private window: every control is disabled.
- [ ] **Step 3: Commit** — `feat(mech): turn controls, hits, manual adjustments, settings, log`

---

### Task 10: Activation roll prompt

**Files:**
- Create: `char-sheet/src/components/DiceResult.tsx` (extract the dice SVG list from `RollModal.tsx`; `RollModal` then uses it, with no visual change)
- Create: `char-sheet/src/components/mech/ActivationModal.tsx`
- Modify: `char-sheet/src/components/RollModal.tsx` (use `DiceResult`)
- Modify: `MechView.tsx` (`onActivate` opens the modal)

**Interfaces:**
- Consumes: `activationRoll`, `activate`, `activationBlocker`, `caltrops.rollDice`, `foundry.isPresent`, `foundry.submitRoll`.
- Produces: `ActivationModal({ rules: Rules, view: View /* root */, mountKey: string | null, close(): void })`.

- [ ] **Step 1: Implement.** One modal per activation:
    - **Content:** the cost line (energy, heat, ammo or charges), a red overheat warning with the dice count when `overheated`, and the roll breakdown from `activationRoll`.
    - **Scores:** in sheet mode they come from `view.read('sheet/attributes')` and `view.read('sheet/skills')`, and are read-only. In `mode 'mech'` they are `PointEntryBox` inputs that default to 0. Add an "Other bonus" `PointEntryBox`.
    - **Confirm button:** reads "Roll N dice & activate", or "Activate" when there is no roll. It calls `activate(...)` (paying the costs at that moment, not before), publishes, logs, then rolls with `caltrops.rollDice(rollInfo)` and shows `DiceResult` with the success count. When Foundry is present, offer "Send to VTT" in the same way `RollModal` does.
    - **Afterwards:** "Done" closes. If `activationBlocker` becomes non-null while the modal is open, it shows the reason and disables confirm.
- [ ] **Step 2: Verify manually.**
    - Autocannon at target Short with pilot Precision 3 and Gunnery 2 shows `5 + 3 − 1 = 7` dice.
    - Confirming drops energy by 2 and rolls 7 dice.
    - Jump Jets show only "Activate".
    - The ordinary skill roll on the Pilot tab looks unchanged.
- [ ] **Step 3: Commit** — `feat(mech): activation roll prompt`

---

### Task 11: Loadout editing and stowage

**Files:**
- Create: `char-sheet/src/components/mech/AttachmentCatalogue.tsx` (attachments grouped by `group`, each a `DragSource` of type `'mech-part'`, with item `{ name }`, a left stripe in the colour of its slot type, and a popover of its stats)
- Modify: `MechSection.tsx` (in loadout mode every slot is a `DropTarget` accepting `'mech-part'`; mounted parts are `DragSource`s with item `{ name, from: {section, start} }`; there is an × to remove; the armour row accepts `Armour` parts only)
- Modify: `MechView.tsx`:
    - a loadout-mode toggle (needs `EditMode.Full`);
    - a chassis select that calls `changeChassis` after a confirmation;
    - the catalogue in the side column while in loadout mode;
    - warnings "No reactor mounted" and "No cooling mounted" from `deriveStats`;
    - the Stowage `EquipmentTable` with `container = { name:'Stowage', size: stats.stowage, tags:['handheld','custom'] }` on view `mech/equipment/Stowage`.

**Interfaces:**
- Consumes: `canMount`, `mount`, `moveMount`, `unmount`, `setArmour`, `changeChassis`, `deriveStats`.

- [ ] **Step 1: Implement.** `DropTarget.enabled` is `canMount(...)` for the dragged item (react-dnd `canDrop`). Hovering colours the target green when it fits and red when it doesn't. Items over stowage capacity (a rack destroyed) render struck through, using the `EquipmentTable` `freeCapacity < 0` case: add a `className` for rows with index ≥ size.
- [ ] **Step 2: Verify manually.**
    - Dragging a Machine Gun onto a leg's untyped slot is refused (red).
    - It is accepted on an arm Weapon slot.
    - Dragging the reactor out to the catalogue removes it and shows "No reactor mounted".
    - Change chassis to Jackal → confirm → the loadout is empty.
    - Stowage on the Mule holds 3 items. Destroying the Stowage Rack's leg slot strikes through the extras.
- [ ] **Step 3: Commit** — `feat(mech): drag-and-drop loadout editing and stowage`

---

### Task 12: Final verification

**Files:** none new (fixes only).

- [ ] **Step 1:** `cd char-sheet && CI=true npx react-scripts test --watchAll=false`. Expect every suite to pass.
- [ ] **Step 2:** `npm run build`. Expect "Compiled successfully" (or only pre-existing warnings).
- [ ] **Step 3: Manual walkthrough of the spec's goals 1–11** in the browser:
    - the Pilot | Mech tabs;
    - a standalone `?mech=` link, read-only for another user;
    - the brawl example overheating at 10/9;
    - Shut down & purge giving +3 to attackers;
    - a cook-off with `autoCookoff` on;
    - a Bludgeon sheet unchanged.
- [ ] **Step 4: Commit** any fixes — `fix(mech): final verification fixes`
