# Chassis slots and variety — design

## Intent

Playtesting showed two problems with the Scrap Lancer chassis roster:

1. Slot counts don't follow quality. The Elite CLF Wraith S9 (45,000) has 15 slots and no Hull, barely more than
   the 1,200 Scrap KR Rattler R1 (12). The Elite Paragon S11 has the same 24 slots as the Standard Rampart Block 6.
2. Too little variety. 18 of 21 frames share one body plan (two legs, two arms, core, cockpit), and the Salvage tier is
   nearly all that plan.

The user wants better frames to have more slots within a size class, every frame to have some Hull, and more frame
types per class with their own flavour, especially at Salvage.

## Goals, non-goals, anti-goals

- Goal: one slot rule (class × tier) every chassis follows, with a Hull minimum.
- Goal: 10 new chassis, each with a body plan no other frame has.
- Non-goal: new rules for sections. New section kinds (wing pylon, crane boom, cargo bed, dozer blade, sensor head or
  mast, halo, backpack, missile rack, welded cannon) are layouts only: slots, hardpoints and a d12 range. (User: "it
  just adds more parts and flavor".)
- Non-goal: changing parts, tags, tiers or prices of existing frames.
- Anti-goal: invented mechanics. No traits (removed in 9cd03f9) and no section-specific rules.

## Approaches

1. **Slot rule, re-slot all 21, add ~10 new frames.** Chosen by the user. Fixes balance and variety together;
   costs prefab refits.
2. Only add new frames. Leaves the Wraith/Rattler problem.
3. Only re-slot existing frames. Leaves Salvage samey.

## The slot rule

Total slots (not counting each section's Armour slot):

| Class | Scrap | Salvage | Standard | Military | Elite | Min Hull |
|---|---|---|---|---|---|---|
| Ultralight | 10 | 12 | 13 | 15 | 17 | 2 |
| Light | 12 | 14 | 16 | 18 | 20 | 2 |
| Medium | 17 | 19 | 21 | 23 | 25 | 3 |
| Heavy | 21 | 23 | 26 | 28 | 31 | 4 |
| Heavy assault | 26 | 28 | 31 | 33 | 36 | 6 |
| Super-heavy | 31 | 34 | 37 | 40 | 43 | 6 |

OHS and GWC frames get +2 (their over-built house style). Quad and tracked frames use their size class.

## Existing frames

Only changed sections are listed; every other section, d12 range, Speed/Evasion, Heat Max and price stays as is.
"Total" is slots / Hull.

| Frame | Total before → after | Changed sections (after) |
|---|---|---|
| KR Tinpot R0 | 10/3 → 10/3 | — |
| KR Rattler R1 | 12/3 → 12/3 | — |
| KR Hulk R3 | 15/5 → 17/6 | Core: Hull ×2, Reactor ×2, untyped ×3 · Right arm: Hull, Weapon ×2 |
| OHS Ox Mk II | 21/8 → 19/8 | Cargo bed (core): Hull ×2, Reactor ×2, Tech, untyped ×2 · Cockpit: Hull |
| OHS Ox Mk III | 23/8 → 21/8 | Cargo bed (core): Hull ×2, Reactor ×2, Tech, untyped ×2 · Cockpit: Hull, Tech |
| OHS Mule Mk II | 21/4 → 21/4 | — |
| OHS Mastodon Mk I | 21/6 → 25/9 | Treads: Hull ×3, untyped ×3 · Core: Hull ×3, Reactor ×3, Tech, untyped ×3 · Crane arm: Hull, Hand, untyped · Cockpit: Hull, Tech ×2 |
| HCA Picket Block 1 | 14/3 → 14/3 | — |
| MAS Jackal J-7 | 13/3 → 14/4 | Cockpit: Hull, Tech |
| HCA Warden Block 2 | 21/5 → 21/5 | — |
| HCA Bulwark Block 4 | 25/7 → 26/7 | Core: Hull ×2, Reactor ×3, Tech, untyped ×4 |
| HCA Rampart Block 6 | 24/7 → 26/8 | Core: Hull, Reactor ×3, Tech ×2, untyped ×3 · Left arm: Hull, Hand, Weapon ×2 |
| GWC Thornback Pattern 3 | 21/10 → 23/11 | Left arm: Hull, Hand, Weapon ×2 · Core: Hull ×3, Reactor ×2, Tech, untyped ×2 |
| MAS Kestrel K-12 | 17/3 → 18/4 | Sensor head (cockpit): Hull, Tech ×2 |
| MAS Harrier H-3 | 19/3 → 23/6 | Left arm: Hull, Hand, Weapon ×2 · Core: Hull, Reactor ×2, Tech ×2, untyped ×2 · Right arm: Hull, Weapon ×3 · Cockpit: Hull, Tech |
| VDG Halberd VX-6 | 23/6 → 23/6 | — |
| GWC Ironbark Pattern 5 | 27/10 → 30/13 | Left arm: Hull ×2, Hand, Weapon ×2 · Core: Hull ×3, Reactor ×3, Tech, untyped ×2 · Right arm: Hull ×2, Hand, Weapon ×2 |
| VDG Monolith VX-9 | 31/10 → 33/11 | Right arm: Hull, Hand, Weapon ×3 · Left shoulder: Hull, Weapon ×2, untyped |
| VDG Bastion VX-12 | 37/11 → 40/11 | Left tread: Hull ×2, untyped ×3 · Right tread: Hull ×2, untyped ×3 · Core: Hull ×2, Reactor ×4, Tech ×3, untyped ×3 |
| CLF Wraith S9 | 15/0 → 20/2 | Left leg: Hull, untyped ×2 · Right leg: Hull, untyped ×2 · Left arm: Hand, Weapon ×2 · Core: Reactor ×2, Tech ×4 · Right arm: Weapon ×3 |
| CLF Paragon S11 | 24/4 → 31/6 | Left leg: Hull, untyped ×3 · Right leg: Hull, untyped ×3 · Left arm: Hull, Hand, Weapon ×3 · Core: Hull, Reactor ×3, Tech ×3, untyped ×2 · Right arm: Hull, Hand, Weapon ×3 · Cockpit: Hull, Tech ×3 |

Description text that the change makes false gets fixed: Ox Mk III ("a cab with a Tech slot"), Wraith ("two Hull
slots", not "no Hull"), the CLF house style ("little Hull"), the Greenward/Concord intro ("little Hull"), and the
Jackal's Rules-tab line (14 slots, 4 of them Hull; it wrongly said 4 of 13 before).

## New frames

Speed and Evasion are per leg or tread section and sum to the overview figure. Every section transfers to the core,
the cockpit to the pilot, as now.

### KR Scuttler R2 — ultralight quad, Salvage · 2,000 · Heat Max 5 · 12/3 · Speed 12 / Evasion 2

A rebuilt dock crawler: four stubby legs and one big claw. Cheap, low and hard to pin down.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Rear left leg | 1 | Hull | Speed 3 |
| Rear right leg | 2 | Hull | Speed 3 |
| Front left leg | 3 | untyped | Speed 3, Evasion 1 |
| Front right leg | 4 | untyped | Speed 3, Evasion 1 |
| Core | 5–8 | Reactor ×2, untyped ×2 | — |
| Claw arm | 9–11 | Hull, Hand, Weapon | Hand (with Manipulator) |
| Cockpit | 12 | Tech | — |

### MAS Merlin M-2 — ultralight, Standard · 6,000 · Heat Max 6 · 13/3 · Speed 18 / Evasion 4

A reverse-jointed scout: a sensor head, a gun pod and very fast legs. No hands.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–3 | Hull, untyped | Speed 9, Evasion 2 |
| Right leg | 4–6 | Hull, untyped | Speed 9, Evasion 2 |
| Core | 7–9 | Reactor ×2, Tech, untyped | — |
| Gun pod | 10 | Weapon ×2 | — |
| Sensor head (cockpit) | 11–12 | Hull, Tech ×2 | — |

### MAS Osprey O-5 — medium, Salvage · 7,000 · Heat Max 7 · 19/4 · Speed 14 / Evasion 2

An old atmospheric airframe on legs. Its wing pylons carry guns where arms would be, with room for jets.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 7, Evasion 1 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 7, Evasion 1 |
| Left wing pylon | 5–6 | Weapon ×2, untyped | — |
| Core | 7–9 | Hull, Reactor ×2, Tech, untyped | — |
| Right wing pylon | 10–11 | Weapon ×2, untyped | — |
| Cockpit | 12 | Hull, Tech | — |

### OHS Yak Mk I — medium tracked, Salvage · 5,500 · Heat Max 7 · 21/7 · Speed 8 / Evasion 0

A tracked tow rig with a crane boom and an open cargo bed. Slow, tough and full of room.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Treads | 1–3 | Hull ×2, untyped ×3 | Speed 8 |
| Cargo bed | 4–5 | Hull, untyped ×3 | — |
| Core | 6–9 | Hull ×2, Reactor ×2, Tech, untyped | — |
| Crane boom | 10–11 | Hull, Hand, Weapon, untyped | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech | — |

### KR Brute R5 — heavy, Salvage · 6,500 · Heat Max 10 · 23/7 · Speed 8 / Evasion 0

A heavy reactor bay bolted into a walker, with a three-slot cannon welded across the right shoulder.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped | Speed 4 |
| Right leg | 3–4 | Hull ×2, untyped | Speed 4 |
| Left arm | 5–6 | Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×3, untyped ×2 | — |
| Right arm | 10 | Hull, Weapon ×2 | — |
| Welded cannon | 11 | Weapon ×3 | — |
| Cockpit | 12 | Hull, untyped | — |

### GWC Willow Pattern 2 — light, Standard · 7,000 · Heat Max 7 · 18/7 · Speed 16 / Evasion 2

A long-legged Naturalist ranger with a backpack frame for water cooling.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped | Speed 8, Evasion 1 |
| Right leg | 3–4 | Hull ×2, untyped | Speed 8, Evasion 1 |
| Left arm | 5 | Hull, Hand, Weapon | Hand (with Manipulator) |
| Core | 6–8 | Hull, Reactor ×2 | — |
| Right arm | 9–10 | Weapon ×2 | — |
| Backpack | 11 | untyped ×2 | — |
| Cockpit | 12 | Hull, Tech | — |

### HCA Outrider Block 3 — light, Standard · 8,000 · Heat Max 7 · 16/3 · Speed 16 / Evasion 4

A militia skirmisher with a back-mounted missile rack and a sensor mast.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped | Speed 8, Evasion 2 |
| Right leg | 3–4 | Hull, untyped | Speed 8, Evasion 2 |
| Left arm | 5–6 | Hand, Weapon | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×2, Tech | — |
| Right arm | 10 | Weapon ×2 | — |
| Missile rack | 11 | Weapon ×2 | — |
| Sensor mast (cockpit) | 12 | Tech ×2 | — |

### HCA Sentinel Block 5 — heavy assault, Standard · 26,000 · Heat Max 14 · 31/9 · Speed 6 / Evasion 0

The militia's walking bunker: two shoulder mounts and a gun arm on a slow, heavy frame.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped ×2 | Speed 3 |
| Right leg | 3–4 | Hull ×2, untyped ×2 | Speed 3 |
| Left arm | 5 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 6–8 | Hull ×2, Reactor ×3, Tech ×2 | — |
| Right arm | 9 | Hull, Weapon ×3 | — |
| Left shoulder | 10 | Weapon ×2, untyped | — |
| Right shoulder | 11 | Weapon ×2, untyped | — |
| Cockpit | 12 | Hull, Tech | — |

### KR Goliath R9 — super-heavy tracked, Scrap · 12,000 · Heat Max 16 · 31/11 · Speed 4 / Evasion 0

A mining crawler pressed into war: a dozer blade, a cutting boom and a reactor bay big enough for anything.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left tread | 1–2 | Hull ×2, untyped ×3 | Speed 2 |
| Right tread | 3–4 | Hull ×2, untyped ×3 | Speed 2 |
| Dozer blade | 5–6 | Hull ×3, Hand | — |
| Core | 7–9 | Hull ×2, Reactor ×4, untyped ×4 | — |
| Cutting boom | 10–11 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech, untyped | — |

### CLF Seraph S10 — medium, Elite · 55,000 · Heat Max 11 · 25/5 · Speed 16 / Evasion 4

An Elite line frame with a dorsal halo of Tech slots behind the head.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 8, Evasion 2 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 8, Evasion 2 |
| Left arm | 5–6 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×2, Tech ×2, untyped ×2 | — |
| Right arm | 10 | Weapon ×3 | — |
| Halo | 11 | Tech ×3 | — |
| Cockpit | 12 | Hull, Tech | — |

## Where it changes

- **Claude Doc** (the rules source): Catalogue tab overview table (10 new rows; Slots (Hull) and Hardpoints columns
  recomputed for changed frames), changed section tables, 10 new section tables (Kessler/Orion, Hesper/Meridian/Vantor
  and Greenward/Concord groups by make), the house-style and intro text above. Rules tab: Jackal and Bulwark tables and
  their heading lines, "The other eighteen frames" → twenty-eight.
- **Repo snapshots** `docs/scrap-lancer/{catalogue,rules}.md` and `char-sheet/scripts/scraplancer/{catalogue,rules}.txt`
  to match, then regenerate `scraplancerCatalogue.tsx`.
- **Generator** `gen.py` `ROLE`: map the new section labels to existing section ids (each unique within a frame):
  Claw arm, Gun pod, Right wing pylon, Crane boom, Cutting boom → `rarm`; Left wing pylon, Cargo bed, Dozer blade →
  `larm`; Welded cannon, Missile rack, Halo, Right shoulder → `shoulder`; Backpack, Left shoulder → `lshoulder`;
  Sensor mast (cockpit) → `cockpit`. No silhouette changes: shoulders already draw, quads and tracks already draw.
- **Prefabs** `prefabs.py`: every prefab on a changed frame is re-checked; parts are moved to valid slots, keeping each
  build's intent. Tests that pin slot counts are updated.

## Left to the builder

- Hardpoints R/W/T/H/U and Slots (Hull) overview columns are computed from the section tables, not hand-typed.
- Exact placement of prefab parts after re-slotting, as long as each prefab still fits and fires the same way.
