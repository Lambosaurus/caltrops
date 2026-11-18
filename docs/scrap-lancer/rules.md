# Scrap Lancer Mech Rules (Draft)

> Snapshot of the "Scrap Lancer Mech Rules (Draft)" doc, Rules tab. The char sheet generates its Scrap Lancer data from these files: edit them (or re-export the doc), then run `python scripts/scraplancer/gen.py` and `python scripts/scraplancer/prefabs.py` in `char-sheet/`.

 · 

## Overview

A mech is a chassis full of typed slots; everything it can do, including making power and shedding heat, is an attachment in one of those slots. Each slot is also one wound, so damage strips capability piece by piece.

Principles:

Loadout is the character of the mech. Chassis set the shape; attachments set the role. Players upgrade by swapping parts, and enemies degrade them by shooting parts off.

Energy is the action budget, heat is the pressure. A pilot may activate as many attachments as their reactor can power, but every activation brings them closer to shutting down or cooking their own mech.

Caltrops at heart. Attachments grant d4 rolls using pilot aspects and skills. Successes are still the currency; wounds are still slots.

The tool does the maths. Location ranges, aim costs, energy, heat and speed are all derived from the loadout and shown on the sheet.

In scope: chassis, attachments, the mech turn, heat, damage, repair, examples. Not yet decided, and deliberately left open: the detailed combat flow (initiative, pilot vs mech actions).

Anything marked (call) is Claude's suggestion, not yet agreed.

### Pilot skills

Mech rolls use a pilot's aspects and a separate set of pilot skills: Gunnery, Melee, Mobility, Tech and Repair. They are their own track, bought with their own points (1.5 per level, rounded up, at normal skill costs). A character's own skills, including their own Gunnery, Melee and Repair, are what their body can do and never add to a mech roll; Piloting is not a character skill.

| Pilot skill | Rolls for |
|---|---|
| Gunnery | Machine guns, autocannons, cannons, mortars and artillery, mass drivers, flamers, rockets and missiles |
| Melee | Melee weapons, claws, hands and winches |
| Mobility | The Sprint dodge roll |
| Tech | Lasers, plasma, EM weapons, sensors and tactical AI cores |
| Repair | Repair rigs and field repair |

## Chassis

A chassis is the frame: a set of sections, each with typed slots, a range on the location die, somewhere for hits to go once it is destroyed, and whatever it provides to the whole mech. A chassis also sets the mech's Heat Max.

### Sections

Each section defines:

| Field | Meaning | Example (Mule, left leg) |
|---|---|---|
| Location range | Faces of the d12 location die that hit this section | 1–2 |
| Slots | Ordered list of typed slots; each slot is also one wound | Armour, Hull, untyped, untyped |
| Provides | What the section adds while it is not destroyed | Speed 6, Evasion 1 |
| Transfers to | Where hits go once the section is destroyed | Core |

Location numbers run left to right, bottom up: legs get the low numbers, the cockpit gets 12.

Standard sections and what losing them means:

Core — holds the reactor and cooling on most chassis. Destroyed: the mech is out of action.

Cockpit — the pilot sits here. Destroyed: further hits to the cockpit wound the pilot's Body track instead (normal player wound caps apply), and the pilot is exposed to the environment.

Legs — each provides Speed. Mech speed is the sum of surviving legs; no legs, no movement.

Arms — only matter for what is mounted on them. An arm with a working Manipulator provides Hand (grab, carry, use handheld gear).

Nothing is special-cased: a tracked chassis has one Treads section providing Speed 8, a quad has four legs. The tool sums what surviving sections provide.

### Slot types (call)

| Type | Holds | Typical location |
|---|---|---|
| Armour | One armour attachment (a stack of armour points). Always the first slot of a section. | Every section |
| Hull | Nothing. Extra structure that soaks one wound; toughens a chassis without adding mounting space | Usually the top of a section, so it is hit first |
| Reactor | Reactors, or any Generic attachment. The run of Reactor slots caps how big a reactor the chassis can take | Core |
| Weapon | Guns and launchers, or any Generic attachment | Arms, sometimes torso mounts |
| Tech | Exchangers, capacitors, sensors, field generators, or any Generic attachment | Core, cockpit |
| Hand | Manipulators and hand-held melee weapons, or any Generic attachment | End of an arm |
| Untyped | Generic attachments only: ammo bins, heat sinks, fins, jump jets, stowage | Everywhere |

A Reactor, Weapon, Tech or Hand attachment fits only slots of its own type. A Generic attachment fits any slot except Armour and Hull, so untyped slots are where the Generic gear goes. A multi-slot attachment must sit in consecutive slots of one section (call). Slot order matters: it is the default order in which wounds land (see Damage).

Arms and legs pass overflow hits to the core; only the cockpit passes them to the pilot.

## Attachments

Every part of a mech beyond the frame is an attachment, including reactors, cooling, armour and ammo. Attachments are written in one line:

BRO HC-40 — Size 3, Weapon. 2 energy, 2 heat, 1 Heavy ammo. Long range, Kinetic. Adds +8 dice to a Precision + Gunnery shot.

| Field | Meaning |
|---|---|
| Size | Slots it occupies, and so wounds it can take before it is disabled |
| Type | Slot type it needs |
| Energy | Energy spent per activation |
| Heat | Heat gained per activation (negative = cooling) |
| Ammo | Ammo type and amount drawn per activation, from any ammo bin of that type |
| Tags | Rule keywords (below) |
| Effect | What one activation does, usually a pilot roll |

Activation. An attachment can be activated once per turn unless tagged Repeating (X). Passive attachments are never activated; their effect is always on while the attachment works.

Disabled. When every slot an attachment occupies is wounded it is disabled and does nothing until repaired. Until then it works at full strength (call).

### Required systems

The tool warns, but does not block, when any of these is missing:

Reactor (Reactor slots, Passive). Sets energy available each turn and adds its own heat every turn. No working reactor: no energy, though the mech can still be standing.

Cooling (Tech or Generic). Passive cooling removes heat every turn; active cooling spends energy to dump heat on demand.

### Armour

Armour sits in each section's Armour slot as a stack of points. Each point absorbs one wound before any slot in that section is hit. Spent points can only be refilled at a haven, town or shipyard. Armour types may add a tag while they still have points, e.g. Ablative is Armoured vs Thermal.

### Ammo bins

Ammo lives in Ammo Bin attachments: Size 1, Generic, holding one ammo type. More ammo costs slots. Bins are Volatile (X), with X set by the ammo type: if a bin is disabled while it holds any ammo, it cooks off. Roll Xd4, however many rounds are left; each success is a hit to that section, and its armour soaks them first. An empty bin does not cook off.

| Ammo | Rounds per bin | Volatile (X) | Cook-off |
|---|---|---|---|
| Light | 16 | 2 | 2d4 |
| Standard | 8 | 4 | 4d4 |
| Heavy | 4 | 6 | 6d4 |
| Missile | 5 | 8 | 8d4 |

Heavier ammo is more dangerous to carry. The Catalogue tab adds Slug (8 rounds, never cooks off) and Fuel (5 rounds, Volatile (6)). To be confirmed in play-testing.

### Tags

| Tag | Rule |
|---|---|
| Repeating (X) | May be activated up to X times per turn; on a weapon, each activation adds its dice to that weapon's roll |
| Passive | Always on, never activated |
| Powerful | +1 success if the roll already scores at least one |
| Armoured vs Y | Incoming attacks of damage type Y lose 1 success |
| Weak vs Y | Incoming attacks of damage type Y gain 1 success |
| Deflection (X) | Gain X deflection until your next turn; each cancels one incoming success |
| Indirect | May fire without line of sight at a locked target |
| Area (X) | Roll once against every target within X tiles of the point of impact |
| Volatile (X) | Cooks off when disabled: roll Xd4, each success a hit to that section, armour first (see Ammo bins). Defined on the Catalogue tab with about forty more tags |
| Kinetic / Thermal / Explosive / EM | Damage types, used by Armoured and Weak |

### Scale

One tile is 10 m, about one mech wide. One turn is 6 seconds. So 1 tile per turn is 6 km/h: multiply Speed by 6 for km/h.

| Speed | Per turn | km/h | Sprinting |
|---|---|---|---|
| 4 (super-heavy) | 40 m | 24 | 8 tiles, 48 km/h |
| 12 (medium) | 120 m | 72 | 24 tiles, 144 km/h |
| 18 (fast light) | 180 m | 108 | 36 tiles, 216 km/h |

Out of combat, Speed in tiles × 6 is also the travel speed in km/h. Start fights around the Mid/Long boundary (25–30 tiles apart); a medium mech closes from Long to Short in about five turns walking, two or three sprinting.

### Range

A target is in one of four bands. The map is about 120 tiles (1,200 m) square, so Long reaches about half way across it.

| Band | Tiles | Distance | Used by |
|---|---|---|---|
| Engaged | Adjacent | Base to base | Melee. Guns treat it as Short. |
| Short | 1–6 | Up to 60 m | Machine guns, flamers, short-range missiles |
| Mid | 7–25 | 61–250 m | Autocannons, lasers, most guns |
| Long | 26–65 | 251–650 m | Cannons, rails, long-range missiles |

Each weapon has one range band: Short, Mid or Long. Ranged attacks roll Reflex + the weapon's skill at Engaged or Short and Precision + the weapon's skill at Mid or Long: Gunnery for most guns, Tech for lasers, plasma and EM weapons.

Target beyond the weapon's band: cannot fire.

Target in a closer band: −1 die per band closer, once per roll (call).

Melee attachments (punch, hammer, saw) need an Engaged target.

### Attacks (call)

Each weapon fires on its own. Its roll is the pilot's aspect + skill, plus the weapon's dice for each shot, against one target, with its own d12 hit location. Firing an AC-30 (+5) and an HC-40 (+8) at the same target is two rolls: Precision + Gunnery + 5, and Precision + Gunnery + 8.

Shots: a weapon fires once a turn, or up to X times if it is Repeating (X). Pick how many shots before rolling; each shot pays its own energy, heat and ammo, and adds the weapon's dice to that weapon's one roll. An M12 firing both shots rolls Reflex + Gunnery + 2.

Several weapons can fire in the same turn, at the same target or different ones, as long as the energy, heat and ammo last.

Tags: each roll carries only its own weapon's tags. Piercing from one gun never combines with Area from another.

Wounds: each roll's wounds go to the section its own d12 picks, so a volley spreads its damage unless the pilot aims.

Jams: a Jams weapon jams when its own roll scores no successes.

Other rolls: activations that roll for something other than an attack (Targeting, Repair, Tow) roll on their own as usual.

## The mech turn

Each turn the reactor fills the energy pool; the pilot spends it on movement and activations in any order, then heat is settled at the end of the turn.

Power up. Energy resets to the reactor's output. Unspent energy from last turn is lost unless stored in a Capacitor (call).

Act, in any order.

Move up to the mech's Speed (sum of surviving legs) for free. Any movement removes Sitting Duck.

Sprint: spend energy and gain heat equal to the chassis Size to move Speed again, and make a dodge roll (see Mobility). Size follows the chassis class: Ultralight 1, Light 2, Medium 3, Heavy 4, Heavy assault and Super-heavy 5. Small mechs sprint cheaply; a heavy one pays for every dash, which is what evasion jets are for.

Activate attachments: pay energy, gain heat, draw ammo, apply the effect. Each attachment once, unless Repeating.

Running hot. Once heat is above Heat Max the mech is Overheated: every further action risks self-damage (below).

End the turn, one of two ways:

End turn: add the reactor's passive heat, subtract passive cooling (never below 0).

Shut down & purge (an action, any time): the reactor adds no heat, cooling applies, and the mech stays shut down, stunned, through its whole next turn.

### Shut down & purge

Shutting down is an action the pilot can take at any point in their turn, and it ends the turn. The reactor adds no heat that end of turn; passive cooling still applies. The mech then stays shut down through its whole next turn, like a stun: no energy, no actions, no movement, and it is stunned (+1 die to attacks against it) and a Sitting Duck. The reactor adds no heat at the end of that turn either, and cooling applies again. It reboots at the start of the turn after, with full energy; if still above Heat Max, it starts that turn overheated. Because it costs a whole turn, pilots usually shut down at the end of a turn, after they have acted.

### Overheated

There is no override switch: running hot simply means acting while overheated. Every action taken while heat is already above Heat Max rolls a d4 per point of heat over Max after that action. Each success is a wound to the part that acted (sprinting hurts the legs), starting at that attachment; the DM may place further wounds. The action that first takes heat over Max is free: pilots can ride the edge, but it leaves them hotter and slower to cool. Heat settles at end of turn as normal, and a mech still above Max starts its next turn overheated.

### Mobility

What a mech did with its legs this turn changes how hard it is to hit, until its next turn starts.

| Posture | How | Attacks against it |
|---|---|---|
| Sitting Duck | Did not move (including while shut down, or with no legs left) | +2 dice |
| Moved | Moved up to Speed | No change |
| Sprinting | Sprinted (energy and heat equal to Size) | No change; the dodge roll below |

Legs provide Evasion the way they provide Speed: the sum over surviving legs. A medium mech's legs give 2 in total. Example values: Jackal 4, Mule 2, Bulwark treads 1 (call: light and heavy values).

Dodge: a Sprint rolls Reflex + Mobility + Evasion. Each success is a dodge token. Spend a token to thwart one success of an attack against the mech. Unspent tokens are lost when the mech's next turn starts. The VTT tracks the tokens, not the sheet. A shut-down mech is also stunned (+1 die), so it suffers +3 in total (call: they stack).

## Damage

A hit's successes become wounds in one section, chosen by a location die; armour soaks first, then slots, and a full section passes further hits on.

### Resolving a hit

Roll together. The attacker rolls their d4 pool and a d12 location die at the same time.

Adjust. Subtract the target's deflection, then apply Armoured / Weak / Powerful. What is left are wounds.

Locate. All wounds go to the section whose range the d12 landed in (call: no spreading).

Armour first. Each armour point in that section absorbs one wound.

Then slots. Remaining wounds mark slots in that section. The DM places them; by default they land in slot order, top to bottom, so players can shield vital parts by ordering their loadout (call). Empty slots take wounds too (call).

Overflow. Once every slot in the section is wounded, the section is destroyed; remaining wounds move to its Transfers-to section and continue from step 4.

### Aimed shots

Before rolling, the attacker may name a section and remove dice from their pool equal to 5 − that section's range size (minimum 1) (call: minimum). They skip the location die. On a typical chassis, aiming at a 4-face core costs 1 die; at a 1-face cockpit, 4 dice. The tool shows each section's aim cost.

### Section loss

| Section | Effect when destroyed | Hits then go to |
|---|---|---|
| Arm | Its attachments are lost, including Hand | Core |
| Leg / Treads | Its Speed is lost | Core |
| Core | Mech is out of action | — |
| Cockpit | Pilot exposed | Pilot's Body track |

### Repair

Field repair: spend 1 Scrap and make a repair check (Knowledge + Repair). Each success clears one slot wound, which can re-enable an attachment. Field repair cannot restore armour points or a destroyed section (call).

At a haven: armour is refilled and destroyed sections rebuilt, for Scrap or Solari.

Mech wounds are not fresh or locked; that pilot-wound rule does not apply to mechs (call).

## Example chassis

Three starting frames, all numbers (call) and untested. Every section also has one Armour slot, not counted below. Aim cost = 5 − range size, minimum 1.

### MAS Jackal J-7 — light scout

Heat Max 6. 14 slots, 4 of them Hull. Fast, with an exposed canopy that is easy to snipe and a left arm that is a hand and little else.

| Section | d12 | Aim cost | Slots | Provides | Transfers to |
|---|---|---|---|---|---|
| Left leg | 1–2 | 3 | Hull, untyped | Speed 8, Evasion 2 | Core |
| Right leg | 3–4 | 3 | Hull, untyped | Speed 8, Evasion 2 | Core |
| Left arm | 5 | 4 | Hand, Weapon | Hand (with Manipulator) | Core |
| Core | 6–9 | 1 | Hull, Reactor ×2, untyped | — | — |
| Right arm | 10 | 4 | Weapon, Weapon | — | Core |
| Cockpit | 11–12 | 3 | Hull, Tech | — | Pilot |

### OHS Mule Mk II — medium salvager

Heat Max 7. 21 slots, 4 of them Hull. Two working hands, a lighter right arm, a missile pod on the right shoulder, and tough, roomy legs.

| Section | d12 | Aim cost | Slots | Provides | Transfers to |
|---|---|---|---|---|---|
| Left leg | 1–2 | 3 | Hull, untyped ×2 | Speed 6, Evasion 1 | Core |
| Right leg | 3–4 | 3 | Hull, untyped ×2 | Speed 6, Evasion 1 | Core |
| Left arm | 5–6 | 3 | Hand, Weapon ×2 | Hand (with Manipulator) | Core |
| Core | 7–9 | 2 | Hull, Reactor ×2, Tech, untyped ×2 | — | — |
| Right arm | 10 | 4 | Hand, Weapon | Hand (with Manipulator) | Core |
| Cockpit | 11 | 4 | Hull, Tech | — | Pilot |
| Right shoulder | 12 | 4 | Weapon, untyped | — | Core |

### HCA Bulwark Block 4 — heavy tracked

Heat Max 11. 26 slots, 7 of them Hull. One treads section: a lucky hit there immobilises it.

| Section | d12 | Aim cost | Slots | Provides | Transfers to |
|---|---|---|---|---|---|
| Treads | 1–2 | 3 | Hull ×2, untyped ×3 | Speed 8, Evasion 1 | Core |
| Left arm | 3–4 | 3 | Hull, Weapon ×3 | — | Core |
| Core | 5–9 | 1 | Hull ×2, Reactor ×3, Tech, untyped ×4 | — | — |
| Right arm | 10–11 | 3 | Hull, Weapon ×3 | — | Core |
| Cockpit | 12 | 4 | Hull, Tech, Tech | — | Pilot |

Only the Bulwark's three-slot reactor bay can take a size-3 reactor such as the HRW Arc-point A9; the Jackal and Mule top out at size-2 reactors. The other twenty-eight frames are on the Catalogue tab.

## Example attachments

A starter set to play-test the economy: the original starter parts under their makes and models, with current numbers. The full catalogue and prices are on the Parts tab, and the rules for every tag beyond the core ones are on the Catalogue tab.

### Power and cooling

| Attachment | Size | Type | Energy | Heat | Ammo | Tags | Effect |
|---|---|---|---|---|---|---|---|
| KR Hotpile F6 (fission pile) | 2 | Reactor | — | +5 / turn | — | Passive, Volatile (8) | 6 energy per turn |
| HRW Dipole D6 (fusion reactor) | 2 | Reactor | — | +3 / turn | — | Passive | 6 energy per turn |
| HRW Arc-point A9 (fusion reactor) | 3 | Reactor | — | +4 / turn | — | Passive | 9 energy per turn |
| HRW Cap C3 (capacitor) | 1 | Tech | — | +1 when drawn | — | Passive | Stores up to 3 unspent energy between turns |
| CWF Fin-1 (radiator fins) | 1 | Generic | — | −1 / turn | — | Passive | Passive cooling |
| HTC Halcyon HX-3 (heat exchanger) | 1 | Tech | 1 / turn | −3 / turn | — | Passive | Passive cooling; its pump draws 1 energy every turn |
| HTC Halcyon HS-2 (heat sink) | 1 | Generic | — | — | — | Passive | +2 Heat Max while working |
| HTC Chiller CH4 (active cooling) | 1 | Tech | 3 | −4 | — | — | Dump heat on demand |
| HTC Flushpak FP6 (coolant flush) | 1 | Generic | 0 | −6 | — | Charges (2) | Emergency purge; refilled at a haven |

### Weapons

| Attachment | Size | Type | Energy | Heat | Ammo | Range | Tags | Effect |
|---|---|---|---|---|---|---|---|---|
| BRO M12 (machine gun) | 1 | Weapon | 1 | 2 | 1 Light | Short | Repeating (2), Kinetic, Suppressive | Reflex + Gunnery shot: +1 per activation |
| BRO AC-30 (autocannon) | 2 | Weapon | 2 | 2 | 1 Standard | Mid | Kinetic | Precision + Gunnery shot: +5 |
| BRO HC-40 (heavy cannon) | 3 | Weapon | 2 | 2 | 1 Heavy | Long | Kinetic, Concussive | Precision + Gunnery shot: +8 |
| LDE LZ-3 (laser) | 2 | Weapon | 3 | 3 | — | Mid | Thermal, Accurate | Precision + Tech shot: +5 |
| CMS SRM-2 (short-range missiles) | 1 | Weapon | 1 | 2 | 1 Missile | Short | Missile, Repeating (2), Explosive | Reflex + Gunnery shot: +1 per activation |
| CMS LRM-3 (long-range missiles) | 2 | Weapon | 1 | 1 | 1 Missile | Long | Missile, Guided, Repeating (3), Indirect, Explosive | Precision + Gunnery shot: +2 per activation |
| OHS Burnoff BF1 (flamer) | 1 | Weapon | 1 | 4 | — | Short | Area (1), Thermal, Searing (1) | Reflex + Gunnery shot: +2 |
| SGW Arc Lance Pattern 2 | 2 | Weapon | 3 | 2 | — | Short | EM, Disruptor | Reflex + Tech shot: +5 |
| OHS Breaker BH3 (breaching hammer) | 1 | Hand | 1 | 2 | — | Melee | Kinetic, Overcharge (2) | Violence + Melee strike: +2 |
| OHS Rotosaw RS2 (rotary saw) | 1 | Hand | 1 | 2 | — | Melee | Kinetic, Grinding, Cutter | Control + Melee strike: +2 |

### Utility and defence

| Attachment | Size | Type | Energy | Heat | Ammo | Tags | Effect |
|---|---|---|---|---|---|---|---|
| OHS Manipulator MH1 | 1 | Hand | 1 | 2 | — | Kinetic, Hand, Dextrous (1) | Activate to punch: Violence + Melee +2 |
| SBL Sensor SA1 (sensor array) | 1 | Tech | 1 | 1 | — | Targeting | Wit + Tech +1: one lock per success; locks give +1 die to attacks |
| SBL Field Generator FG1 | 2 | Tech | 2 | 4 | — | Deflection (1), Armoured vs Kinetic, Weak vs EM | Its tags last until your next turn |
| MAS Jump Jets JJ2 | 1 | Generic | 2 | 3 | — | Jump | Leap up to Speed; +2 dice to a melee attack on landing |
| OHS Rack R3 (stowage rack) | 1 | Generic | — | — | — | Passive, Stowage (3) | Pilot-scale inventory (scrap, supplies, salvage). Destroyed: its items are lost or unreachable until repaired |
| Ammo Bin | 1 | Generic | — | — | Light 16, Standard 8, Missile 5, Heavy 4, Slug 8, Fuel 5 | Volatile (X) by ammo type | Feeds weapons of its ammo type |

### Armour (Armour slot)

| Attachment | Points | Tags while it has points |
|---|---|---|
| AWP Plate P2 | 2 | — |
| AWP Composite C3 | 3 | — |
| AWP Ablative AB2 | 2 | Armoured vs Thermal |
| AWP Reactive RX2 | 2 | Armoured vs Explosive |

## Worked example

A Mule brawling at Short range with everything ends turn 1 just under Heat Max and goes over on its second action of turn 2. With the catalogue's hotter parts, a Salvage-grade mech can fight flat out for about one turn before it has to pace itself.

### Loadout

| Section | Armour | Slots, top to bottom |
|---|---|---|
| Left leg | AWP Plate P2 (2) | Hull, MAS Jump Jets JJ2, HTC Halcyon HS-2 |
| Right leg | AWP Plate P2 (2) | Hull, OHS Rack R3 (Scrap ×2, Repair kit, Rations ×3), CWF Fin-1 |
| Left arm | AWP Plate P2 (2) | OHS Manipulator MH1, BRO AC-30 (2 Weapon) |
| Core | AWP Composite C3 (3) | Hull, HRW Dipole D6 (2 Reactor), HTC Halcyon HX-3 (Tech), Ammo Bin: Light (16), Ammo Bin: Standard (8) |
| Right arm | AWP Plate P2 (2) | OHS Breaker BH3 (Hand), BRO M12 (Weapon) |
| Cockpit | AWP Plate P2 (2) | Hull, SBL Sensor SA1 |
| Right shoulder | AWP Plate P2 (2) | CMS SRM-2 (Weapon), Ammo Bin: Missile (5) |

Derived: 6 energy per turn, of which the exchanger's pump draws 1, so 5 to spend. Passive heat +3 (reactor) −4 (exchanger 3, fins 1) = net −1 per turn. Heat Max 7 + 2 (heat sink) = 9, Speed 12, Hand. Losing the heat sink drops Heat Max back to 7 mid-fight.

### Heat over two turns

Brawl at Short range each turn: BRO AC-30 (2 energy, +2 heat, −1 die for a target inside its Mid band), BRO M12 twice (2, +4) and OHS Breaker BH3 (1, +2). All 5 energy spent, +8 heat.

| Turn | Heat at start | Peak during turn | Heat after end of turn |
|---|---|---|---|
| 1 | 0 | 8 | 7 (+3 reactor, −4 cooling) |
| 2 | 7 | 9 after the AC-30; 11 after the first M12 burst, over Max 9 (free: that action crossed the line) | 10 after End turn, 7 after Shut down & purge |

With heat at 11 and 2 energy left, the pilot can:

End turn: heat settles to 10, still over Max, so it starts turn 3 overheated and every action risks damage until it cools.

Shut down & purge: heat drops to 7, but the mech stays shut down, stunned and a Sitting Duck (+3 dice against it), through the enemy phase and all of turn 3. Cooling takes it to 3 by the end of turn 3, and it reboots in turn 4.

Keep fighting: the second M12 burst (+2 heat, to 13) would roll 4d4 (13 − 9), each 4 wounding the M12.

In turn 1 the mech had heat to spare; in turn 2 it has to choose between a weaker turn, a purge, or burning its own gun. That choice is what the heat system is for.

### Taking a hit

An enemy autocannon rolls 3 successes with a location die of 2: the left leg. Plating absorbs 2; the third wound lands on the top slot, the Hull. The Jump Jets and Heat Sink are untouched: that is what hull slots are for.

## Open questions

The biggest open item is the combat flow; the rest are numbers and edge cases to settle in play-testing.

### Still to design

Combat flow: initiative, and how to keep several rolls per pilot per turn fast at the table. (Decided: while piloting, activating the mech is the pilot's action; no separate personal action.)

Enemy mechs: full sheets like the players, or Caltrops foe notation with a short slot list?

Economy: Solari prices are drafted on the Catalogue and Parts tabs; Scrap costs, armour refills and section rebuilds still need play-testing.

Ejection and pilots on foot once a mech is lost.

### Claude's calls to review

| Call | Section |
|---|---|
| Which slots are Reactor, Weapon, Tech, Hand, Hull or untyped on each example chassis | Chassis |
| Multi-slot attachments sit in consecutive slots of one section | Chassis |
| One Armour slot per section, holding a stack of points | Chassis, Attachments |
| Attachments work at full strength until every slot is wounded | Attachments |
| Missile bin holds 5 (so a full bin cooks off at 15d4, close to the others' 16d4); cook-off hits go through armour like any other | Attachments |
| Stowage Rack: Size 1 Generic, +3 stowage slots; items lost or unreachable while it is destroyed | Attachments |
| Inside a weapon's range band: −1 die per band closer | Attachments |
| Melee needs an Engaged (base-to-base) target; guns treat Engaged as Short | Attachments |
| Each weapon rolls on its own with the full pilot dice; repeat shots add to that weapon's roll | Attacks |
| Range bands: Short to 60 m, Mid 61–250 m, Long 251–650 m | Range |
| Scale: 1 tile = 10 m, 1 turn = 6 s; Speed in tiles per turn (old values ÷ 5) | Scale |
| Unspent energy is lost unless stored in a Capacitor | Mech turn |
| Sprint costs energy and heat equal to chassis Size (1–5) | Mech turn |
| Reactor heat and passive cooling both applied at end of turn | Mech turn |
| Overheat roll uses the overage after the action; sprint damage lands in the legs | Mech turn |
| No forced shutdown: a mech can stay overheated across turns | Mech turn |
| Shut down & purge holds the mech shut down, stunned, through its next turn: +1 die to attacks against it | Mech turn |
| Evasion per chassis (Jackal 4, Mule 2, Bulwark 1); a Sprint rolls Reflex + Mobility + Evasion, each success a dodge token that thwarts one attack success until the next turn; Sitting Duck +2 changes attacker dice | Mobility |
| Pilot skills (Gunnery, Melee, Mobility, Tech, Repair) are a separate track from character skills, 1.5 points per level | Pilot skills |
| Stunned (+1) and Sitting Duck (+2) stack on a shut-down mech | Mobility |
| All wounds from one hit go to one section | Damage |
| Wounds land top to bottom in slot order by default | Damage |
| Empty slots take wounds | Damage |
| Aim cost minimum 1 die | Damage |
| Field repair: 1 Scrap + check, one wound per success; no armour or section restore | Damage |
| Mech wounds are not fresh or locked | Damage |
| Chassis Heat Max values (Jackal 6, Mule 7, Bulwark 11) and Heat Sink at +2 | Examples |
| All other chassis and attachment numbers | Examples |
