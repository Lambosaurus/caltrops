# Chassis Variety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-slot the 21 Scrap Lancer chassis to the class × tier slot rule and add 10 new frames, in the rules doc and the app.

**Architecture:** The Markdown snapshots in `docs/scrap-lancer/` are the generator's source; `gen.py` turns them into
`scraplancerCatalogue.tsx`, `prefabs.py` into `scraplancerPrefabs.tsx`. Data changes go into the snapshots (and the
Claude Doc, the human source), then regenerate. A test pins the slot rule so future edits can't drift.

**Tech Stack:** Python 3 generator scripts, React/TS + Jest (`CI=true npx react-scripts test --watchAll=false` from `char-sheet/`).

**Spec:** `docs/superpowers/specs/2026-11-17-chassis-variety-design.md`

## Global Constraints

- Slot totals and Hull minimums exactly as the spec's slot-rule table; OHS and GWC +2.
- Every section layout, d12 range, price, Heat Max and Speed/Evasion exactly as the spec's tables.
- No new rules or traits; new section kinds are layouts only.
- Repo files are CRLF where they already are; edit with byte-preserving scripts.
- Claude Doc edits are direct (not suggestions); Doc: https://claude.ai/artifact/DveC5cCJwqRHqHDAKaG3g4, Catalogue tab node 2b268521-dc9c, Rules tab 34881d46-ee3d.

## Review Focus

- A frame whose d12 ranges overlap or leave a gap → every frame covers 1–12 exactly once (test in Task 2).
- Two sections of one frame mapping to the same section id → ids unique per frame (test in Task 2).
- A prefab part left in a slot that no longer exists or no longer fits → `prefabs.py` asserts fit; the existing "fit completely" test (Task 3).
- Overview columns (Slots (Hull), Hardpoints, Speed / Evasion) disagreeing with the section tables → computed in Task 2's test.
- The three starter frames on the Rules tab (Jackal, Mule, Bulwark) missed → covered by the slot-rule test, which reads all 31.

---

### Task 1: Generator accepts the new section labels

**Files:**
- Modify: `char-sheet/scripts/scraplancer/gen.py` (`ROLE`)

- [ ] **Step 1:** Add to `ROLE`: `'Claw arm','Gun pod','Right wing pylon','Crane boom','Cutting boom'` → `'rarm'`;
  `'Left wing pylon','Cargo bed','Dozer blade'` → `'larm'`; `'Welded cannon','Missile rack','Halo'` → `'shoulder'`;
  `'Backpack'` → `'lshoulder'`; `'Sensor mast (cockpit)'` → `'cockpit'`. Strip `' (cockpit)'` from names as now.
- [ ] **Step 2:** Run `python scripts/scraplancer/gen.py` → no change to output yet (no frames use them).

### Task 2: Re-slot existing frames, add the ten new ones, pin the rule

**Files:**
- Modify: `docs/scrap-lancer/catalogue.md`, `docs/scrap-lancer/rules.md`, `char-sheet/scripts/scraplancer/catalogue.txt`, `char-sheet/scripts/scraplancer/rules.txt`
- Regenerate: `char-sheet/src/data/scraplancerCatalogue.tsx`
- Test: `char-sheet/src/lib/mech/catalogue.test.tsx`

- [ ] **Step 1: Write the failing test** in `catalogue.test.tsx`:

```ts
const RULE: Dictionary<number[]> = { 1: [10, 12, 13, 15, 17], 2: [12, 14, 16, 18, 20], 3: [17, 19, 21, 23, 25], 4: [21, 23, 26, 28, 31] }
const BIG: Dictionary<number[]> = { 'Heavy assault': [26, 28, 31, 33, 36], 'Super-heavy': [31, 34, 37, 40, 43] }
const MIN_HULL = [0, 2, 2, 3, 4, 6]
const TIERS = ['Scrap', 'Salvage', 'Standard', 'Military', 'Elite']
it('has 31 chassis that follow the slot rule', () => {
  expect(mr.chassis).toHaveLength(31)
  for (const c of mr.chassis) {
    const slots = c.sections.flatMap(s => s.slots)
    const row = BIG[c.class!.startsWith('Super') ? 'Super-heavy' : c.class!.startsWith('Heavy assault') ? 'Heavy assault' : ''] ?? RULE[c.size!]
    const want = row[TIERS.indexOf(c.tier!)] + (['OHS', 'GWC'].includes(c.make!) ? 2 : 0)
    expect([c.name, slots.length]).toEqual([c.name, want])
    expect([c.name, slots.filter(s => s === 'Hull').length >= MIN_HULL[c.size!]]).toEqual([c.name, true])
    const d12 = c.sections.flatMap(s => Array.from({ length: s.range[1] - s.range[0] + 1 }, (_, i) => s.range[0] + i)).sort((a, b) => a - b)
    expect([c.name, d12]).toEqual([c.name, Array.from({ length: 12 }, (_, i) => i + 1)])
    expect([c.name, new Set(c.sections.map(s => s.id)).size]).toEqual([c.name, c.sections.length])
  }
})
```
  Also update the count test to 31 chassis.
- [ ] **Step 2:** Run tests → FAIL (21 chassis, Wraith 15 slots).
- [ ] **Step 3:** Apply the spec's "Existing frames" section changes and description fixes to the snapshot section tables
  (Rules tab: Jackal, Bulwark, their "Heat Max N. X slots, Y of them Hull." lines, and "eighteen" → "twenty-eight").
  Add the ten new section tables under their make groups and ten overview rows. Recompute every overview row's
  Slots (Hull) and Hardpoints R/W/T/H/U from its section table with a script; Speed / Evasion = sum over sections.
  Mirror `catalogue.md`/`rules.md` into the `.txt` copies.
- [ ] **Step 4:** `python scripts/scraplancer/gen.py`, run tests → the new test passes.
- [ ] **Step 5:** Commit.

### Task 3: Refit prefabs

**Files:**
- Modify: `char-sheet/scripts/scraplancer/prefabs.py`; regenerate `char-sheet/src/data/scraplancerPrefabs.tsx`

- [ ] **Step 1:** Run `python scripts/scraplancer/prefabs.py`; for each fit assertion it raises, move the part to a valid
  slot in the same section (or the nearest section of the same role), keeping the build's weapons and reactor.
- [ ] **Step 2:** Re-run until clean; run the full Jest suite, `npx tsc --noEmit -p .` and `CI=true npx react-scripts build` → all pass.
- [ ] **Step 3:** Commit.

### Task 4: Claude Doc

- [ ] **Step 1:** Catalogue tab: replace changed section tables and overview rows, insert ten overview rows and ten
  section blocks (heading, description, table) in their make groups, fix the house-style and intro text.
- [ ] **Step 2:** Rules tab: Jackal and Bulwark tables and heading lines, "eighteen" → "twenty-eight".
- [ ] **Step 3:** Search both tabs for each changed frame's old slot count to catch leftovers.
