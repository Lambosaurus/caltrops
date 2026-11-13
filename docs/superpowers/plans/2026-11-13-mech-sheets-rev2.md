# Mech Sheets Revision 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slim the mech feature to what players use at the table:
- the mech panel is embedded on the Pilot page, with Sprint, Shut down & purge and New turn;
- the roll prompt picks the range;
- toast alerts replace the log;
- a Mech tab handles management only;
- testing and DM tools are removed.

**Architecture:**
- **Rules layer:** `lib/mech/turn.tsx` swaps `endTurn`/`startTurn`/`move`/`attackModifier` for a single `newTurn`. Range becomes a parameter of activation, not mech state, and `MechResult` gains `notices` for toasts.
- **UI layer:**
    - `MechView` splits into `MechPanel` (play) and `MechManage` (management).
    - SheetView embeds `MechPanel` under the pilot sheet and uses the Mech tab for `MechManage`.
    - Standalone mode shows `MechPanel` with a Manage tab.

**Tech Stack:** unchanged (React 18, TS, react-scripts/Jest + RTL, DaisyUI, react-dnd).

**Spec:** `docs/superpowers/specs/2026-11-13-mech-sheet-design.md`. Read **Revision 2** at the end; it supersedes the earlier goals where they conflict.

## Global Constraints

- **Branch:** work on branch `feature/mechs`; it updates draft PR #77. Never commit `.superpowers/`.
- **Other rulesets:** rulesets without `mechs` must still render and behave exactly as on `master`.
- **Rules layer:** `lib/mech/*` stays pure (no React, no `Math.random`); randomness comes in via `Roller`.
- **Automation defaults:** all four automation settings stay default **off**.
- **Toasts:** use the existing `alertInfo` / `alertWarning` from `lib/alerts.tsx`.
- **Verification:** `CI=true npx react-scripts test --watchAll=false` all pass, `npx tsc --noEmit -p .` clean, and `CI=true npm run build` succeeds with no warnings.
- **Commits:** end with `Co-Authored-By: Claude <model> <noreply@anthropic.com>`. Keep existing files' line endings and write non-ASCII as UTF-8.

## Review Focus

1. **Saved mechs from before the revision:** documents still holding `turn.posture`, `turn.target` or `turn.phase: 'ended'` load without crashing and play normally. Test in Task 1 (`loadMech`).
2. **A shut-down mech:** every action (activate, Sprint) is blocked until New turn, and New turn after a shutdown does not add reactor heat. Tests in Task 1.
3. **No alert spam:** routine actions (spending energy, marking a wound by hand) produce no toast. Only the `notices` categories in the spec do. Test in Task 1 (`notices` empty for a plain activation).
4. **Read-only viewers:** see the panel with every control disabled, the Copy link button excepted. Test in Task 2.
5. **Non-mech sheets:** unchanged. Test in Task 2 (a render test asserting no mech panel and no tabs for a Bludgeon sheet).

---

### Task 1: Rules layer revision

**Files:**
- Modify: `char-sheet/src/lib/mech/types.tsx`, `turn.tsx`, `damage.tsx` (notices), `loadout.tsx` (`freshTurn`, `loadMech` tolerance), `fixture.tsx`
- Modify: `char-sheet/src/data/scraplancer.tsx` (drop `sittingDuck` / `stunned`)
- Test: `turn.test.tsx`, `damage.test.tsx`, `loadout.test.tsx`, `src/data/scraplancer.test.tsx`

**Interfaces (Produces):**

```ts
// types.tsx
interface MechTurn { energy: number, heat: number, stored: number, shutdown: boolean,
  used: { [key: string]: number }, lastFired: string | null, out: boolean, pilotWounds: number }
// removed from MechTurn: phase, posture, target
interface MechRules { /* … */ sprint: { energy: number, heat: number } }
// removed from MechRules: sittingDuck, stunned
interface MechResult { mech: Mech, events: string[], notices: string[] }
```

```ts
// turn.tsx
activationBlocker(rules, mech, key: string, target?: RangeBand): string | null
// with target undefined, skip the range check
activate(rules, mech, key, roller, target: RangeBand): MechResult
sprintBlocker(rules, mech): string | null
sprint(rules, mech, roller): MechResult            // once per turn, tracked as used['sprint']
shutdownPurge(rules, mech): MechResult
newTurn(rules, mech): MechResult
rangePenalty(att, target): number
outOfRange(att, target): boolean
// removed: move, endTurn, startTurn, attackModifier
```

- [ ] **Step 1: Failing tests.**
    - **Blocked while shut down:** after `shutdownPurge` (heat 13, cooling 4 → 9, `shutdown true`), `activationBlocker` returns `'Shut down until New turn.'` and Sprint is blocked.
    - **New turn after shutdown:** `newTurn` sets `shutdown false`, refills energy to 6, clears `used`, and leaves heat at 9 (no reactor heat, no second cooling).
    - **Normal new turn:** heat 6 gives 6 + 2 − 4 = 4, energy goes to `energyOut + min(capacitor, leftover)`, and `used` is cleared.
    - **Sprint:** used once gives energy −2 and heat +2. A second Sprint the same turn gives `sprintBlocker === 'Already sprinted this turn.'`.
    - **Range:**
        - `activationBlocker(…, 'Mid')` for the Machine Gun gives `'Target is beyond Short range.'`;
        - with no target, it returns null;
        - `activate(…, 'Short')` for the Autocannon works.
    - **Notices:**
        - a plain activation gives `notices` of `[]`;
        - an overheated action with `autoHeatDamage` off gives exactly one notice containing `d4`;
        - a cook-off (`autoCookoff` on or off) gives a notice;
        - a cockpit overflow gives a pilot notice;
        - a core destroyed gives an out-of-action notice.
    - **Old mechs:** `loadMech` with `turn: { phase:'ended', posture:'still', target:'Long', energy:3, heat:2 }` returns a turn without those keys, with energy 3 and heat 2.
    - **Data:** the scraplancer data test no longer expects `sittingDuck` or `stunned`.
- [ ] **Step 2:** Run the tests and expect FAIL.
- [ ] **Step 3: Implement.**
    - `newTurn`:
        - if `shutdown` → clear it, refill energy, clear `used`;
        - else → heat `max(0, heat + reactorHeat − cooling)`, store `min(capacitor, energy)`, refill energy (`energyOut + stored`), clear `used`.
    - **Blocker wording:**
        - `'Shut down until New turn.'` replaces the old "Turn ended" blocker;
        - `'Mech is out of action.'`;
        - sprint at Speed 0 → `'Cannot move: no working legs.'`.
    - **Notices:** add them where the spec's alert categories occur. `damage.tsx` adds them inside `applyWounds` and `markWounds`; `markWounds` adds none.
- [ ] **Step 4:** Run all of `src/lib/mech` and `src/data`, and expect PASS.
- [ ] **Step 5: Commit:** `refactor(mech): new turn, range at activation, notices; drop posture`

---

### Task 2: Play panel on the Pilot page

**Files:**
- Create: `char-sheet/src/components/mech/MechPanel.tsx` (status bar with Sprint / Shut down & purge / New turn, the body, the Stowage `EquipmentTable`; replaces the play half of `MechView`)
- Modify: `SheetView.tsx` (Pilot tab = pilot sheet + `MechPanel` when a mech is assigned, else a "No mech assigned — manage in the Mech tab" line), `MechSection.tsx`, `HitModal.tsx` (remove the attacker-modifier line), `mechText.tsx` (remove posture and target text)
- Create: `char-sheet/src/components/mech/notify.tsx` exporting `showNotices(notices: string[]): void`. Each notice goes through `alertWarning`, or `alertInfo` when the text contains `applied`.
- Delete: `TurnControls.tsx`, `TakeHitPanel.tsx`, `MechLog.tsx`. Remove `logMech`, `capLog`, `MECH_LOG_LIMIT` and the `mechLog` path from `store.tsx` and `MainPage.tsx`.
- Test: `PlayControls.test.tsx` (rewrite), `MechView.test.tsx` → `MechPanel.test.tsx`, `mechText.test.tsx`

**Interfaces:**
- Consumes: Task 1 `newTurn`, `sprint`, `sprintBlocker`, `shutdownPurge`, `activate`, `activationBlocker`, `applyWounds`, `markWounds`.
- Produces: `MechPanel({ view: View /* root */, editable: EditMode })`.
- Every handler: publish `result.mech`, then `showNotices(result.notices)`.

- [ ] **Step 1: Failing RTL tests:**
    - The Pilot tab for a Scrap Lancer sheet with a mech shows the pilot sheet and the panel together; the status bar shows Sprint, Shut down & purge and New turn.
    - There are no "Move", "Target", "Take a hit", "Repair" or log elements.
    - Hit on the left leg with 3 (manual) gives armour 0, wounds `[true,false,false]` and no toast.
    - At `EditMode.None` every control is disabled except Copy link.
    - A Bludgeon sheet renders no mech panel and no tabs.
- [ ] **Step 2:** Run the tests and expect FAIL.
- [ ] **Step 3: Implement.** The activation buttons open `ActivationModal`, whose range picker is Task 3's work; until then pass the weapon's own band.
- [ ] **Step 4:** Full test run, tsc, and `CI=true npm run build`; expect PASS and no warnings.
- [ ] **Step 5: Commit:** `feat(mech): embed play panel on the pilot page; strip table tools`

---

### Task 3: Management tab, standalone mode, range in the roll prompt

**Files:**
- Create: `char-sheet/src/components/mech/MechManage.tsx`. It holds New / Load / Assign / Unassign / Copy link (move them out of `CurrentMechCard`, whose remaining Pilot-page role is replaced by `MechPanel`; delete `CurrentMechCard` if nothing uses it), the chassis change, the loadout editor (catalogue plus a drag-and-drop body using `MechSection` in loadout mode) and `MechSettingsPanel`.
- Modify: `SheetView.tsx` (the Mech tab renders `MechManage`), `MainPage.tsx` (standalone `?mech=` renders tabs "Mech" → `MechPanel` and "Manage" → `MechManage`), `ActivationModal.tsx` (Short / Mid / Long buttons, default `att.range`, Melee fixed to Short; pass the target to `activationRoll` / `activationBlocker` / `activate`; a beyond-range choice disables confirm with the blocker text; the choice lives in component state only), `MenuRibbon.tsx` (New mech / Load mech can stay or move into `MechManage`; avoid duplicate entry points by keeping them only in `MechManage`).
- Test: `LoadoutEdit.test.tsx` (now via `MechManage`), `ActivationModal.test.tsx`, `CurrentMechCard.test.tsx` → `MechManage.test.tsx`

**Interfaces:**
- Consumes: Task 1 activation signatures, Task 2 `MechPanel` and `showNotices`.
- Produces: `MechManage({ view: View, editable: EditMode })`.

- [ ] **Step 1: Failing tests:**
    - **Range in the prompt:**
        - With Precision 3 and Gunnery 2, the Autocannon defaults to Mid and shows "Roll 8 dice" (3 + 2 + 3, no penalty).
        - Choosing Short shows "Roll 7 dice" (−1 die for one band closer).
        - The Machine Gun at Mid disables confirm with `'Target is beyond Short range.'`.
    - **Mech tab:**
        - it shows the loadout editor and settings, and the play status bar is not on it;
        - Unassign deletes `sheet/mech`.
    - **Standalone:** standalone mode renders Mech and Manage tabs.
- [ ] **Step 2:** Run the tests and expect FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4:** Full test run, tsc, and `CI=true npm run build`; expect PASS and no warnings.
- [ ] **Step 5: Commit:** `feat(mech): management tab, standalone tabs, range choice in roll prompt`
