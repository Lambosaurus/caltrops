# Parts (draft)

> Snapshot of the "Scrap Lancer Mech Rules (Draft)" doc, Parts tab. The char sheet generates its Scrap Lancer data from these files: edit them (or re-export the doc), then run `python scripts/scraplancer/gen.py` and `python scripts/scraplancer/prefabs.py` in `char-sheet/`.

249 parts from twenty specialist makers (see Manufacturers on the Catalogue tab). Each family runs from small junk to huge, expensive hardware, so you can read a table as an upgrade path. All numbers are (call).

Everything a part does beyond its numbers is a tag. The core tags (Repeating, Passive, Powerful, Armoured, Weak, Deflection, Indirect, Area, damage types) are on the Rules tab; every other tag is defined on the Catalogue tab. Notes are flavour only.

## Scaling rules

The numbers follow six rules, so new parts can be built the same way.

Size sets the scale. Parts run from size 1 to size 5: Light (1), Medium (2), Heavy (3), Super-heavy (4) and Siege (5). A part sits in consecutive slots of one section, so most frames take size 1–2 weapons, medium and heavy frames have three-slot gun arms, the Rampart Block 6 has a four-slot cannon arm, and only the Bastion VX-12 can mount a size-5 weapon.

Big guns pay in every column. Size 4–5 weapons hit hardest of anything, with big rolls, Powerful and Piercing, but they cost slots, energy, heat and money, and most are Braced, Reload or Hungry as well. A frame that carries one needs a big reactor and big coolers to match.

At low tiers, one big part beats two small ones. From Scrap to Standard, a bigger reactor, cooler, sink or store gives more per slot and less heat per point of output. Two Smokestack G2s make 4 energy for +6 heat; one Smokestack G4 makes the same 4 for +4.

Compact parts are a Military and Elite trade. At those tiers, small parts can match a big one in fewer slots, but they cost more heat and money. Two Pocket Core PC5s make 10 energy in 2 slots for +6 heat and 18,000; a Twin-core TC10 makes 10 in 3 slots for +4 and 15,000.

Cheap parts run hot. Reactors make roughly this much heat per point of energy: Scrap 1, Salvage 0.7, Standard 0.5, Military 0.4, Elite 0.3. Scrap weapons and tools run about 2 heat hotter than the Standard part for the same job, and Salvage about 1 hotter.

Pumped coolers cost power. Tech exchangers draw energy every turn, and cheap ones draw more. Radiators are free to run but bulky.

### Roll bonus

Each weapon rolls on its own (see Attacks on the Rules tab): the pilot's dice, plus the weapon's dice for each shot. A weapon's roll is the dice it adds, built from its size times its tier, so one big gun always adds more than two small guns in the same slots, and better tiers add a lot more. Scrap and Salvage parts also pay with Jams and extra heat; special tags are free on Military and Elite parts.

| Size | Base dice |  | Tier | Multiplier |
|---|---|---|---|---|
| 1 | 2 |  | Scrap | ×0.6 |
| 2 | 5 |  | Salvage | ×0.8 |
| 3 | 8 |  | Standard | ×1 |
| 4 | 12 |  | Military | ×1.25 |
| 5 | 17 |  | Elite | ×1.5 |

Round to the nearest whole die, minimum 1. Melee weapons multiply by a further ×1.5 for having to get engaged. A Repeating (X) weapon splits that total across its activations, rounded to the nearest (minimum 1), and each activation costs about 1/X of a single gun's energy and heat: you pay only for the dice you use. So a Salvage AC-15 adds +1 a shot and +2 at full fire; a Standard AC-30 adds +5; a Military AC-50 adds +16 at full fire; a Military Thunderer 120 adds +15 in one shot, and an Elite Rail R6 adds +26.

## Two ends of the scale

Two worked loadouts show the range the numbers are built for.

KR Tinpot R0 (Scrap, Heat Max 5). A KR Smokestack G2 makes 2 energy and +3 heat. A CWF Array RA3 in the core and a Fin-1 in each leg remove 5, so it cools 2 a turn while idle. Its KR Nailer N1 costs 1 energy and 2 heat a shot, adds +1 die to its roll per shot, and Jams on a miss: one shot a turn breaks even, and two shots fill its heat bank in two turns. It potters, picks its moments and runs from anything big.

VDG Bastion VX-12 (Military, Heat Max 20). An HRW Twin-core TC16 makes 16 energy and +7 heat. Three Halcyon CX-5s (−15, drawing 3 energy) and a CWF Array RA4 in each tread (−8) remove 23. Against a target at Mid it fires four weapons, each its own Precision + Gunnery roll with its own hit location: an ARH Thunderer 120 (+14: +15, −1 for the closer band; 6 energy, 8 heat), a BRO Twin AC-33 once (+5; 2 and 2), a BRO AC-30 (+5; 2 and 2) and a BRO AC-20 (+2; 2 and 2). That is 12 of its 13 energy and 2 heat under even. The Twin AC-33's second shot would make its roll +10, but needs 2 energy it hasn't got, and the Thunderer is Braced, so a Bastion that wants its main gun stands still.

## Reading model names

Within a family, a higher model number is a later and better model: LZ-2, LZ-3, LZ-4. A suffix marks a variant of an existing model. The variants follow these rules, so a GM can make up new ones at the table.

| Suffix | Variant | Change from the base model | Price |
|---|---|---|---|
| -C | Compact | Size −1: rolls as its new size, but keeps the base model's range and tags; heat +1. Standard tier and up only | ×1.5 |
| -E | Extended | Range one band longer, heat +1 | ×1.5 |
| -HV | High-velocity | Piercing +1, energy +1, heat +1 | ×1.6 |
| -X | Export | A Sol model sold down to the colony: rolls one tier lower, −1, heat +1 | ×0.5 |
| R | Kessler rebuild | Scrap tier, rolls −1 from the base model, heat +2, gains Jams (Volatile on reactors) | ×0.4 |
| Next number | Later model | More dice or less heat, often one tier up | ×1.5–2 |

## Power

### Reactors

All are Passive and go in Reactor slots; a size-3 or size-4 reactor needs a bay that big. The model number is the energy per turn.

| Make | Model | Kind | Tier | Size | Energy / turn | Heat / turn | Tags | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|
| KR | Smokestack G2 | Combustion generator | Scrap | 1 | 2 | +3 | — | 300 | Bolted inside the cab. Two lose to one G4 |
| KR | Smokestack G4 | Combustion generator | Scrap | 2 | 4 | +4 | — | 600 | Weak and hot, but it can't blow up |
| KR | Hotpile F6 | Fission pile | Scrap | 2 | 6 | +5 | Volatile (8) | 800 | Was Salvage Fission Pile |
| KR | Dipole D6R | Rebuilt fusion | Scrap | 2 | 6 | +5 | Volatile (4) | 1,200 | A patched HRW Dipole: half as dangerous as a Hotpile |
| KR | Hotpile F9 | Fission pile | Scrap | 3 | 9 | +7 | Volatile (12) | 1,400 | The cheap way to power a heavy frame |
| KR | Hotpile F14 | Fission pile | Scrap | 4 | 14 | +10 | Volatile (16) | 2,000 | A reactor you stand well back from. Beats two F6s |
| HRW | Dipole D5 | Fusion reactor | Salvage | 2 | 5 | +3 | — | 1,500 | The pre-war Dipole; every yard has spares |
| HRW | Militia Core MC3 | Compact fission | Salvage | 1 | 3 | +4 | Volatile (2) | 2,000 | Frees a slot, but two run far hotter than a D5 |
| KR | Redline D7 | Overclocked fusion | Salvage | 2 | 7 | +5 | Volatile (4) | 2,500 | A Dipole with the limiters cut out |
| HRW | Dipole D6 | Fusion reactor | Standard | 2 | 6 | +3 | — | 3,000 | The baseline. Was Dipole Fusion Reactor |
| GWC | Kiln Pattern 6 | Biomass furnace | Standard | 3 | 6 | +2 | Analog | 4,000 | Bulky but cool. Burns anything |
| HRW | Arc-point A9 | Fusion reactor | Standard | 3 | 9 | +4 | — | 6,000 | Was Arc-point Fusion Reactor |
| HRW | Arc-point A14 | Fusion reactor | Standard | 4 | 14 | +6 | — | 9,000 | For super-heavy bays. Beats two Dipoles |
| HRW | Pocket Core PC5 | Compact fusion | Military | 1 | 5 | +3 | — | 9,000 | Two match a TC10 in one slot fewer, for +2 heat |
| GWC | Kiln Pattern 8 | Biomass furnace | Military | 3 | 8 | +2 | Analog | 10,000 |  |
| HRW | Flash F7 | Light fusion | Military | 2 | 7 | +3 | — | 12,000 | Built for Meridian's light frames |
| HRW | Pocket Core PC6 | Compact fusion | Military | 1 | 6 | +4 | — | 13,000 |  |
| HRW | Twin-core TC10 | Fusion reactor | Military | 3 | 10 | +4 | — | 15,000 |  |
| HRW | Twin-core TC13 | Fusion reactor | Military | 3 | 13 | +6 | Volatile (4) | 20,000 | Run past spec; voids the warranty |
| HRW | Twin-core TC16 | Fusion reactor | Military | 4 | 16 | +7 | — | 26,000 | Feeds a Bastion's main gun and its cannons |
| AZP | Torus T5 | Torus reactor | Elite | 1 | 5 | +2 | — | 16,000 |  |
| AZP | Torus T10 | Torus reactor | Elite | 2 | 10 | +3 | — | 24,000 | Heavy-frame output in a light-frame bay |
| AZP | Lattice Z14 | Zero-point lattice | Elite | 3 | 14 | +4 | — | 35,000 |  |
| AZP | Lattice Z22 | Zero-point lattice | Elite | 4 | 22 | +6 | — | 50,000 | Powers anything you can cool. Beats two T10s |

### Capacitors

All are Passive. Capacitors bank unspent energy into the next turn; the model number is what they store. Big ones let a frame save up for a big gun. Cheap ones heat up as they discharge: the heat is added once on any turn you draw from them.

| Make | Model | Kind | Tier | Type | Size | Stores | Heat when drawn | Tags | Price |
|---|---|---|---|---|---|---|---|---|---|
| KR | Stackpack B3 | Battery bank | Scrap | Generic | 2 | 3 | +2 | Volatile (4) | 400 |
| HRW | Cell Bank CB1 | Battery bank | Salvage | Generic | 1 | 1 | +1 | — | 300 |
| HRW | Cap C3 | Capacitor | Standard | Tech | 1 | 3 | +1 | — | 1,500 |
| HRW | Cap C6 | Capacitor | Standard | Tech | 2 | 6 | +1 | — | 2,500 |
| HRW | Supercap SC5 | Supercapacitor | Military | Tech | 1 | 5 | 0 | — | 5,000 |
| HRW | Supercap SC12 | Supercapacitor | Military | Tech | 2 | 12 | 0 | Volatile (4) | 9,000 |
| HRW | Supercap SC20 | Supercapacitor | Military | Generic | 3 | 20 | +2 | Volatile (8) | 15,000 |
| AZP | Well W8 | Charge well | Elite | Tech | 1 | 8 | 0 | — | 18,000 |

## Cooling

The model number is the heat removed, or the Heat Max added for a sink. Each kind has Generic versions for frames short of Tech slots, and big ones for heavy frames.

### Passive cooling

All are Passive and remove heat every turn. Radiators run free; pumped exchangers draw energy every turn.

| Make | Model | Kind | Tier | Type | Size | Energy / turn | Heat / turn | Tags | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| CWF | Fin-1 | Radiator fins | Scrap | Generic | 1 | 0 | −1 | — | 200 | The cheapest cooling. Was Radiator Fins |
| KR | Patchloop XR2 | Salvaged exchanger | Scrap | Tech | 1 | 2 | −2 | — | 600 | A leaky pump: the HX-2's cooling at twice the draw |
| CWF | Fin-2 | Radiator fins | Salvage | Generic | 1 | 0 | −1 | — | 300 | Fin-1's cooling, plus +1 Heat Max |
| CWF | Array RA3 | Radiator array | Salvage | Generic | 2 | 0 | −3 | — | 700 | Beats two Fin-1s |
| KR | Patchloop XR5 | Salvaged exchanger | Salvage | Tech | 2 | 2 | −5 | — | 1,000 | Beats two HX-2s, for 2 energy |
| HTC | Halcyon HX-2 | Heat exchanger | Salvage | Tech | 1 | 1 | −2 | — | 1,000 | The older HX: the XR2's cooling for half the draw |
| CWF | Array RA4 | Radiator array | Standard | Generic | 2 | 0 | −4 | — | 1,500 | One more point than an RA3 |
| HTC | Halcyon HX-3G | Heat exchanger | Standard | Generic | 1 | 1 | −2 | — | 1,800 | An HX-2 that fits a Generic slot |
| HTC | Halcyon HX-3 | Heat exchanger | Standard | Tech | 1 | 1 | −3 | — | 2,000 | Was Heat Exchanger |
| CWF | Array RA7 | Radiator array | Standard | Generic | 3 | 0 | −7 | — | 2,500 | The big radiator for heavy frames |
| GWC | Radiator Pattern 5 | Water jacket | Standard | Generic | 2 | 0 | −5 | Analog | 3,000 | One more point than an RA4 |
| HTC | Halcyon CX-4 | Cryo exchanger | Military | Tech | 1 | 1 | −4 | — | 6,000 |  |
| HTC | Halcyon CX-5 | Cryo exchanger | Military | Tech | 1 | 1 | −5 | — | 10,000 | The best one-slot pumped cooler short of Elite |
| HTC | Halcyon CX-10 | Cryo exchanger | Military | Tech | 2 | 2 | −10 | — | 16,000 | Two CX-5s of cooling for less money |
| HTC | Phonon P6 | Phonon exchanger | Elite | Tech | 1 | 0 | −6 | — | 18,000 | No pump: draws no energy |
| HTC | Phonon P14 | Phonon exchanger | Elite | Tech | 2 | 0 | −14 | — | 40,000 | Cools a Paragon's whole gun line |

### Heat sinks

All are Passive and raise Heat Max; the Phase sinks can also be activated to dump heat.

| Make | Model | Kind | Tier | Type | Size | Heat Max | Energy | Heat | Tags | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KR | Ballast BB2 | Ballast sink | Scrap | Generic | 2 | +2 | — | — | — | 200 | A block of scrap iron |
| KR | Ballast BB4 | Ballast sink | Scrap | Generic | 3 | +4 | — | — | Heavy (1) | 400 | Two blocks |
| HTC | Halcyon HS-2 | Heat sink | Standard | Generic | 1 | +2 | — | — | — | 800 | Was Heat Sink |
| HTC | Halcyon HS-5 | Heat sink | Standard | Generic | 2 | +5 | — | — | — | 1,600 | Beats two HS-2s |
| HTC | Halcyon HS-8 | Heat sink | Standard | Generic | 3 | +8 | — | — | — | 2,800 | Heat bank for a big-gun frame |
| HTC | Halcyon GS-3 | Graphene sink | Military | Generic | 1 | +3 | — | — | — | 4,000 |  |
| HTC | Heat Well HW4 | Molten-salt sink | Military | Generic | 1 | +4 | — | — | Volatile (2) | 6,000 |  |
| HTC | Phase P3 | Phase-change sink | Elite | Generic | 1 | +3 | 0 | −3 | Recharging (1) | 14,000 |  |
| HTC | Phase P5 | Phase-change sink | Elite | Generic | 1 | +3 | 0 | −5 | Recharging (2) | 20,000 |  |

### Active cooling

Activated: spends energy or charges to dump heat on demand.

| Make | Model | Kind | Tier | Type | Size | Energy | Heat | Tags | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Spraybar SB3 | Water spray | Scrap | Generic | 1 | 0 | −3 | Charges (2), Renewable | 200 |  |
| CWF | Vent VS2 | Vent stack | Salvage | Generic | 1 | 1 | −2 | Loud | 500 |  |
| HTC | Flushpak FP6 | Coolant flush | Salvage | Generic | 1 | 0 | −6 | Charges (2) | 600 | Was Coolant Flush. Refills cost 100 each |
| HTC | Chiller CH3 | Active cooling | Salvage | Tech | 1 | 3 | −3 | — | 1,200 |  |
| CWF | Vent VS3 | Vent stack | Standard | Generic | 1 | 1 | −3 | Loud | 1,500 |  |
| HTC | Flushpak FP6-3 | Coolant flush | Standard | Generic | 1 | 0 | −6 | Charges (3) | 1,500 |  |
| GWC | Quench Pattern 2 | Quench tank | Standard | Generic | 1 | 0 | −4 | Charges (3), Renewable, Analog | 2,000 |  |
| HTC | Chiller CH4 | Active cooling | Standard | Tech | 1 | 3 | −4 | — | 2,500 | Was Active Cooling |
| HTC | Thermal Pump TP5 | Active cooling | Military | Tech | 1 | 2 | −5 | — | 7,000 |  |
| HTC | Chiller CH9 | Active cooling | Military | Tech | 2 | 3 | −9 | — | 8,000 | The big chiller: beats two one-slot coolers |
| HTC | Purge Stack PS10 | Emergency purge | Military | Generic | 3 | 6 | −10 | — | 12,000 | Dumps a big gun's shot in one go |
| HTC | Loop L4 | Superconducting loop | Elite | Tech | 1 | 1 | −4 | Repeating (2) | 20,000 | Two cheap dumps a turn |

## Ballistic weapons

All go in Weapon slots. Low energy and heat for the punch; every activation draws a round, and loaded bins cook off. Rolls give the bonus only: the aspect comes from range (Short = Reflex, Mid and Long = Precision).

### Machine guns

Light ammo. Machine guns throw lots of weak shots: they rarely wreck a section, but every success can pin a target down instead (Suppressive).

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Nailer N1 | Scrap | 1 | 1 | 2 | Short | Repeating (2), Kinetic, Suppressive, Jams | Gunnery +1 | 300 | Industrial rivet gun |
| KR | LMG-6R | Scrap | 1 | 1 | 2 | Short | Repeating (3), Kinetic, Suppressive, Jams | Gunnery +1 | 1,000 | Rebuilt BRO LMG-6 |
| BRO | M8 | Salvage | 1 | 1 | 1 | Short | Kinetic, Suppressive | Gunnery +2 | 400 | A single pintle gun: cheap to run |
| BRO | M12 | Salvage | 1 | 1 | 2 | Short | Repeating (2), Kinetic, Suppressive | Gunnery +1 | 800 | Was Machine Gun |
| BRO | M12-E | Salvage | 1 | 1 | 3 | Mid | Repeating (2), Kinetic, Suppressive | Gunnery +1 | 1,200 | Long barrel |
| BRO | LMG-6 | Standard | 1 | 1 | 1 | Short | Repeating (3), Kinetic, Suppressive | Gunnery +1 | 2,500 | The militia squad gun, scaled up |
| BRO | Rotary RC4 | Military | 2 | 1 | 1 | Short | Repeating (4), Kinetic, Suppressive | Gunnery +2 | 5,000 | Empties a Light bin in four turns |
| BRO | Needler FL2 | Military | 1 | 1 | 1 | Short | Repeating (2), Kinetic, Piercing (1), Suppressive | Gunnery +2 | 6,000 | Flechettes |
| BRO | Rotary RC8 | Military | 3 | 1 | 1 | Short | Repeating (6), Kinetic, Suppressive | Gunnery +2 | 9,000 | Heavy gatling: a bin a turn |
| ARH | Hail H6 | Elite | 1 | 1 | 1 | Short | Repeating (4), Kinetic, Piercing (1), Suppressive | Gunnery +1 | 20,000 |  |

### Autocannons

Standard ammo. Each profile does a different job: the AC-15 fires fast up close, the AC-20 is a small single-shot gun, the AC-25 sprays, the AC-35M snipes, and the AC-50 hits like a cannon but eats two rounds a shot.

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Pipe P2 | Scrap | 2 | 2 | 3 | Mid | Kinetic, Jams | Gunnery +3 | 700 | A pipe and a breech |
| BRO | AC-15 | Salvage | 1 | 1 | 2 | Short | Repeating (2), Kinetic | Gunnery +1 | 900 | Carbine cannon |
| KR | AC-30R | Scrap | 2 | 2 | 4 | Mid | Kinetic, Jams | Gunnery +4 | 1,000 | Rebuilt BRO AC-30 |
| BRO | AC-20 | Salvage | 1 | 2 | 2 | Mid | Kinetic | Gunnery +2 | 1,500 | Light single-shot cannon |
| BRO | AC-30 | Standard | 2 | 2 | 2 | Mid | Kinetic | Gunnery +5 | 2,500 | The baseline. Was Autocannon |
| BRO | AC-25 | Standard | 2 | 1 | 1 | Short | Repeating (3), Kinetic, Scatter | Gunnery +2 | 3,000 | Burst cannon |
| BRO | AC-30E | Standard | 2 | 2 | 3 | Long | Kinetic | Gunnery +5 | 3,800 | Extended barrel |
| BRO | AC-30HV | Standard | 2 | 3 | 3 | Mid | Kinetic, Piercing (1) | Gunnery +5 | 4,000 | High-velocity rounds |
| BRO | Twin AC-33X | Standard | 3 | 2 | 2 | Mid | Repeating (2), Kinetic | Gunnery +4 | 4,000 | Export Twin AC-33 |
| BRO | AC-35M | Standard | 2 | 2 | 2 | Long | Kinetic, Accurate | Gunnery +5 | 4,500 | Marksman barrel |
| BRO | Twin AC-33 | Military | 3 | 2 | 2 | Mid | Repeating (2), Kinetic | Gunnery +5 | 8,000 |  |
| BRO | AC-50 | Military | 4 | 3 | 3 | Mid | Repeating (2), Kinetic, Powerful, Piercing (1), Hungry (2) | Gunnery +8 | 16,000 | The whopper: two cannon-weight bursts a turn |
| ARH | Burst B3 | Elite | 2 | 1 | 1 | Mid | Repeating (2), Kinetic, Piercing (1) | Gunnery +4 | 24,000 | Twin-cannon fire from one barrel |

### Cannons

Heavy ammo, Long range. Cannons fire one huge shot that staggers whatever it wounds (Concussive). The big end of the table is where fights are decided: a Thunderer or Longinus hit wrecks a section, but the gun needs its own reactor and coolers.

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | HC-40R | Scrap | 3 | 2 | 4 | Long | Kinetic, Concussive, Jams | Gunnery +7 | 2,400 | Rebuilt BRO HC-40 |
| KR | Bigmouth BM1 | Scrap | 4 | 3 | 8 | Mid | Kinetic, Powerful, Braced, Jams | Gunnery +7 | 3,000 | A ship's deck gun bolted to a frame |
| BRO | HC-40 | Standard | 3 | 2 | 2 | Long | Kinetic, Concussive | Gunnery +8 | 6,000 | Was Heavy Cannon |
| BRO | HC-40C | Standard | 2 | 2 | 3 | Long | Kinetic, Concussive | Gunnery +5 | 9,000 | Compact |
| BRO | HC-60 | Standard | 4 | 4 | 6 | Long | Kinetic, Powerful, Braced, Concussive | Gunnery +12 | 11,000 | The colony's big gun: cheap for its size, hot for its punch |
| BRO | HC-45 | Military | 3 | 2 | 2 | Long | Kinetic, Powerful, Concussive | Gunnery +10 | 12,000 | The HC-40's successor |
| ARH | Sledge 90 | Military | 3 | 4 | 5 | Long | Kinetic, Powerful, Piercing (1), Concussive | Gunnery +10 | 16,000 |  |
| ARH | Breacher 130 | Military | 4 | 5 | 7 | Long | Explosive, Area (1), Powerful, Braced, Lobbed, Concussive | Gunnery +15 | 22,000 | Siege shells |
| ARH | Thunderer 120 | Military | 4 | 6 | 8 | Long | Kinetic, Powerful, Piercing (2), Braced, Concussive | Gunnery +15 | 26,000 | The super-heavy main gun |
| ARH | Longinus 150 | Military | 5 | 9 | 12 | Long | Kinetic, Powerful, Piercing (3), Braced, Reload (1), Hungry (2), Concussive | Gunnery +21 | 40,000 | Fires every other turn and ends whatever it hits |

### Mortars and artillery

Heavy ammo.

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Lobber L1 | Scrap | 2 | 1 | 3 | Long | Indirect, Lobbed, Area (1), Explosive, Jams | Gunnery +3 | 800 | A pipe mortar |
| OHS | Demo Mortar DM2 | Salvage | 2 | 1 | 2 | Long | Indirect, Lobbed, Area (1), Explosive | Gunnery +4 | 2,000 | Mining charge thrower |
| BRO | Mortar MT3 | Standard | 2 | 1 | 1 | Long | Indirect, Lobbed, Area (1), Explosive | Gunnery +5 | 4,000 |  |
| ARH | Howitzer HZ5 | Military | 3 | 2 | 2 | Long | Indirect, Lobbed, Area (2), Explosive | Gunnery +10 | 14,000 |  |
| ARH | Howitzer HZ8 | Military | 5 | 5 | 7 | Long | Indirect, Lobbed, Area (3), Explosive, Powerful, Braced, Reload (1) | Gunnery +21 | 30,000 | Corps artillery on tracks |

### Mass drivers

Slug ammo: magnetic guns use a lot of energy for ballistic weapons, but inert Slug bins never cook off, and Military rails are Accurate: the snipers of the catalogue.

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Spitcoil SC1 | Salvage | 2 | 4 | 5 | Mid | Kinetic, Jams | Gunnery +4 | 3,000 | Hand-wound coils |
| ARH | Coil C2 | Military | 1 | 3 | 2 | Mid | Kinetic, Piercing (1), Accurate | Gunnery +3 | 7,000 | Light coilgun |
| ARH | Coil C3 | Military | 2 | 4 | 2 | Long | Kinetic, Piercing (1), Accurate | Gunnery +6 | 10,000 |  |
| ARH | Coil C3-C | Military | 1 | 4 | 3 | Long | Kinetic, Piercing (1), Accurate | Gunnery +3 | 9,000 | Compact: a C2 with the C3's reach |
| ARH | Rail R2 | Elite | 2 | 4 | 2 | Long | Kinetic, Piercing (2), Accurate | Gunnery +8 | 22,000 |  |
| ARH | Rail R4 | Elite | 3 | 6 | 4 | Long | Kinetic, Piercing (2), Powerful, Accurate | Gunnery +12 | 30,000 |  |
| ARH | Rail R6 | Elite | 5 | 10 | 8 | Long | Kinetic, Piercing (3), Powerful, Braced, Accurate | Gunnery +26 | 50,000 | Spinal rail for a super-heavy mount |

## Energy weapons

All go in Weapon slots. With no ammo there is nothing to cook off or run out of, but each shot costs a lot of energy and heat. Better tiers get more dice for less heat, and from Standard up lasers are Accurate; the biggest beams need a reactor of their own.

### Lasers

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| OHS | Weldbeam W2 | Scrap | 2 | 3 | 6 | Short | Thermal, Cutter | Tech +3 | 900 | An industrial cutting beam |
| LDE | LZ-1 | Salvage | 1 | 2 | 3 | Short | Thermal | Tech +2 | 1,200 | Light laser |
| KR | LZ-3R | Scrap | 2 | 3 | 5 | Mid | Thermal, Jams | Tech +4 | 1,600 | Rebuilt LDE LZ-3 |
| LDE | LZ-2 | Salvage | 2 | 3 | 5 | Mid | Thermal | Tech +4 | 2,000 | The older LZ |
| LDE | LZ-3 | Standard | 2 | 3 | 3 | Mid | Thermal, Accurate | Tech +5 | 4,000 | Was Laser |
| LDE | LZ-3E | Standard | 2 | 3 | 4 | Long | Thermal, Accurate | Tech +5 | 6,000 | Extended focus |
| LDE | HL-4X | Standard | 3 | 5 | 6 | Long | Thermal, Powerful | Tech +7 | 6,000 | Export HL-4 |
| LDE | Pulse PL2 | Military | 1 | 1 | 1 | Short | Repeating (2), Thermal | Tech +2 | 6,000 |  |
| LDE | LZ-4 | Military | 2 | 3 | 2 | Mid | Thermal, Accurate | Tech +6 | 8,000 | An LZ-3 that runs cool |
| LDE | Pulse PL3 | Military | 1 | 1 | 1 | Short | Repeating (3), Thermal | Tech +1 | 9,000 |  |
| LDE | HL-4 | Military | 3 | 5 | 5 | Long | Thermal, Powerful, Accurate | Tech +10 | 12,000 |  |
| LDE | Lance HL-6 | Military | 4 | 9 | 10 | Long | Thermal, Powerful, Piercing (1), Accurate | Tech +15 | 24,000 | Heavy beam: needs a reactor of its own |
| LDE | Focus F2 | Elite | 1 | 2 | 1 | Mid | Thermal, Accurate | Tech +3 | 16,000 |  |
| LDE | Focus F4 | Elite | 2 | 3 | 2 | Long | Thermal, Accurate | Tech +8 | 25,000 |  |
| LDE | Focus F8 | Elite | 4 | 6 | 4 | Long | Thermal, Powerful, Piercing (2), Accurate | Tech +18 | 45,000 |  |

### Plasma

Plasma heats the target as fast as it heats you.

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Slagger ST3 | Salvage | 2 | 4 | 8 | Short | Thermal, Searing (2), Volatile (4) | Tech +4 | 4,000 | Bottled plasma from a smelter |
| LDE | Plasma PX2 | Standard | 1 | 3 | 4 | Short | Thermal, Searing (1) | Tech +2 | 4,500 | Plasma pistol |
| LDE | Plasma PX4 | Military | 2 | 4 | 5 | Mid | Thermal, Searing (2) | Tech +6 | 14,000 |  |
| LDE | Plasma PX6 | Military | 3 | 6 | 6 | Mid | Thermal, Searing (3), Powerful | Tech +10 | 20,000 |  |
| LDE | Plasma PX8 | Military | 4 | 8 | 10 | Mid | Thermal, Searing (4), Powerful, Area (1) | Tech +15 | 28,000 | Plasma cannon |
| LDE | Sun S5 | Elite | 2 | 4 | 3 | Long | Thermal, Searing (2) | Tech +8 | 32,000 |  |

### EM weapons

Stormglass builds these to fight Concord's Elite frames: Disruptor attacks switch parts off instead of breaking them.

| Make | Model | Tier | Size | Energy | Heat | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Zapper Z1 | Scrap | 1 | 2 | 4 | Short | EM, Disruptor, Jams | Tech +1 | 900 | A mains cable on a pole |
| SGW | Arc Lance Pattern 1 | Salvage | 2 | 3 | 4 | Short | EM, Disruptor | Tech +4 | 2,500 |  |
| SGW | Arc Lance Pattern 2 | Standard | 2 | 3 | 2 | Short | EM, Disruptor | Tech +5 | 5,000 | Was Arc Lance |
| SGW | Ion Disruptor Pattern 3 | Military | 2 | 4 | 2 | Mid | EM, Disruptor | Tech +6 | 14,000 |  |
| SGW | Ion Disruptor Pattern 4 | Military | 2 | 4 | 2 | Long | EM, Disruptor | Tech +6 | 18,000 |  |
| SGW | Storm Pattern 5 | Military | 3 | 5 | 3 | Mid | EM, Disruptor, Area (1) | Tech +10 | 20,000 | Arc projector |
| SGW | Tempest Pattern 7 | Military | 4 | 8 | 5 | Long | EM, Disruptor, Area (2), Reload (1) | Tech +15 | 30,000 | Blacks out a whole Concord lance |

## Fire and missiles

All go in Weapon slots. Flame weapons make the target mech heat up (Searing). Missiles barely touch your reactor, but bins of them are the most dangerous to carry.

### Flamers

| Make | Model | Tier | Size | Energy | Heat | Ammo | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KR | Firehose FH1 | Scrap | 1 | 1 | 5 | — | Short | Area (1), Thermal, Searing (1), Jams | Gunnery +1 | 400 |  |
| OHS | Burnoff BF1 | Salvage | 1 | 1 | 4 | — | Short | Area (1), Thermal, Searing (1) | Gunnery +2 | 1,000 | A gas-flare tool. Was Flamer |
| HPY | Incinerator IN2 | Standard | 1 | 1 | 1 | Fuel | Short | Area (1), Thermal, Searing (1) | Gunnery +2 | 2,000 | Fuel-fed, so it runs cool |
| OHS | Burnoff BF2 | Standard | 1 | 1 | 2 | — | Short | Area (1), Thermal, Searing (1) | Gunnery +2 | 2,500 | No bin to cook off, but hotter than an IN2 |
| HPY | Napalm NP2 | Military | 2 | 1 | 1 | Fuel | Short | Area (2), Thermal, Searing (2) | Gunnery +6 | 6,000 |  |
| HPY | Napalm NP2-E | Military | 2 | 1 | 2 | Fuel | Mid | Area (2), Thermal, Searing (2) | Gunnery +6 | 9,000 | Extended |
| HPY | Inferno IF4 | Military | 3 | 2 | 3 | Fuel | Mid | Area (3), Thermal, Searing (3), Hungry (2) | Gunnery +10 | 14,000 | Floods a whole engagement |

### Rockets and missiles

Rocket pods carry their own rockets (Charges) and need no bin; refills cost 50 a rocket.

| Make | Model | Tier | Size | Energy | Heat | Ammo | Range | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| KR | Rocket Pod RP4 | Scrap | 1 | 0 | 2 | Charges (4) | Mid | Missile, Repeating (2), Explosive, Volatile (4) | Gunnery +1 | 500 |  |
| KR | Rocket Pod RP8 | Scrap | 2 | 0 | 2 | Charges (8) | Mid | Missile, Repeating (4), Explosive, Volatile (8) | Gunnery +1 | 900 | Two RP4s welded together |
| CMS | SRM-2 | Salvage | 1 | 1 | 2 | Missile | Short | Missile, Repeating (2), Explosive | Gunnery +1 | 1,500 | Was SRM Rack |
| CMS | Rocket Pod RP6 | Standard | 1 | 0 | 1 | Charges (6) | Mid | Missile, Repeating (2), Explosive, Volatile (4) | Gunnery +1 | 2,000 |  |
| CMS | MRM-3 | Standard | 2 | 1 | 1 | Missile | Mid | Missile, Repeating (3), Explosive | Gunnery +2 | 3,000 |  |
| CMS | SRM-4 | Standard | 2 | 1 | 1 | Missile | Short | Missile, Repeating (4), Explosive | Gunnery +1 | 3,500 |  |
| CMS | LRM-3 | Standard | 2 | 1 | 1 | Missile | Long | Missile, Guided, Repeating (3), Indirect, Explosive | Gunnery +2 | 4,000 | Was Missile Rack |
| CMS | Dart DT2 | Military | 1 | 1 | 1 | Missile | Long | Missile, Explosive, Piercing (2) | Gunnery +3 | 8,000 | Anti-armour |
| CMS | Swarm SW3 | Military | 2 | 2 | 2 | Missile | Mid | Missile, Area (1), Explosive | Gunnery +6 | 7,000 |  |
| CMS | LRM-5 | Military | 3 | 1 | 1 | Missile | Long | Missile, Guided, Repeating (5), Indirect, Explosive | Gunnery +2 | 9,000 |  |
| CMS | Swarm SW5 | Military | 3 | 3 | 3 | Missile | Mid | Missile, Area (2), Explosive | Gunnery +10 | 12,000 |  |
| CMS | LRM-10 | Military | 4 | 1 | 1 | Missile | Long | Missile, Guided, Repeating (10), Indirect, Explosive | Gunnery +2 | 16,000 | Ten tubes: two bins in one turn |
| CMS | Hammerfall HF1 | Military | 3 | 2 | 3 | Missile | Long | Missile, Explosive, Area (2), Powerful, Hungry (3), Reload (1) | Gunnery +10 | 18,000 | One huge missile |
| CMS | Seeker S3 | Elite | 2 | 1 | 1 | Missile | Long | Missile, Guided, Seeking, Repeating (3), Indirect, Explosive | Gunnery +3 | 22,000 |  |
| CMS | Seeker S5 | Elite | 3 | 1 | 1 | Missile | Long | Missile, Guided, Seeking, Repeating (4), Indirect, Explosive | Gunnery +3 | 30,000 |  |

## Melee and hands

All go in Hand slots and need an Engaged (base-to-base) target. Orion's are work tools; Vasquez's are built to fight. Melee rolls get +2 over a gun of the same size and tier, for the risk of getting engaged.

### Claws and hands

| Make | Model | Tier | Size | Energy | Heat | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|
| OHS | Grab Claw GC1 | Scrap | 1 | 1 | 2 | Kinetic, Hand, Grapple, Jams | Violence + Melee +2 | 300 |  |
| OHS | Manipulator MH1 | Salvage | 1 | 1 | 2 | Kinetic, Hand, Dextrous (1) | Violence + Melee +2 | 500 | Was Manipulator |
| OHS | Grab Claw GC2 | Standard | 1 | 1 | 1 | Kinetic, Hand, Grapple | Violence + Melee +3 | 1,800 |  |
| OHS | Manipulator MH3 | Standard | 1 | 1 | 0 | Kinetic, Hand, Dextrous (2) | Violence + Melee +3 | 3,000 |  |

### Blades and saws

| Make | Model | Tier | Size | Energy | Heat | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|
| KR | Chainblade CB1 | Scrap | 1 | 1 | 2 | Kinetic, Jams | Control + Melee +2 | 300 |  |
| KR | Torch T2 | Scrap | 1 | 2 | 4 | Thermal, Cutter | Control + Melee +2 | 400 |  |
| VCC | Machete MC1 | Salvage | 1 | 0 | 0 | Kinetic | Control + Melee +2 | 600 | Needs no power |
| OHS | Rotosaw RS2 | Salvage | 1 | 1 | 2 | Kinetic, Grinding, Cutter | Control + Melee +2 | 1,000 | Was Rotary Saw |
| VCC | Shear SB2 | Standard | 1 | 1 | 1 | Kinetic, Piercing (1) | Control + Melee +3 | 2,000 |  |
| OHS | Rotosaw RS3 | Standard | 1 | 1 | 1 | Kinetic, Grinding, Cutter | Control + Melee +3 | 2,500 |  |
| VCC | Shear SB3 | Military | 1 | 1 | 1 | Kinetic, Piercing (1), Repeating (2) | Control + Melee +2 | 5,000 |  |
| VCC | Greatblade GB4 | Military | 2 | 2 | 2 | Kinetic, Powerful | Control + Melee +9 | 9,000 | A two-slot sword for heavy frames |
| VCC | Edge E2 | Elite | 1 | 2 | 2 | Thermal, Searing (1) | Control + Melee +5 | 12,000 |  |
| VCC | Edge E4 | Elite | 1 | 3 | 3 | Thermal, Powerful, Searing (1), Piercing (1) | Control + Melee +5 | 18,000 |  |

### Hammers and drivers

| Make | Model | Tier | Size | Energy | Heat | Tags | Roll | Price | Notes |
|---|---|---|---|---|---|---|---|---|---|
| KR | Wrecking Ball WB2 | Scrap | 2 | 1 | 2 | Kinetic, Area (1), Jams | Violence + Melee +5 | 500 |  |
| OHS | Rock Drill RD2 | Salvage | 1 | 2 | 3 | Kinetic, Piercing (1), Cutter | Violence + Melee +2 | 1,200 | Mining drill |
| OHS | Breaker BH3 | Salvage | 1 | 1 | 2 | Kinetic, Overcharge (2) | Violence + Melee +2 | 1,200 | Was Breaching Hammer |
| OHS | Breaker BH4 | Standard | 1 | 1 | 1 | Kinetic, Overcharge (2) | Violence + Melee +3 | 3,000 |  |
| VCC | Piledriver PV2 | Standard | 1 | 3 | 3 | Kinetic, Piercing (2) | Violence + Melee +3 | 3,000 | Slow and power-hungry, but punches through plate |
| VCC | Piledriver PV3 | Military | 1 | 3 | 2 | Kinetic, Piercing (3) | Violence + Melee +4 | 6,000 |  |
| VCC | Shock Ram SR5 | Military | 2 | 3 | 2 | Kinetic, Powerful, Knockback | Violence + Melee +9 | 10,000 |  |
| VCC | Wrecker Maul WM6 | Military | 3 | 4 | 4 | Kinetic, Powerful, Area (1), Knockback | Violence + Melee +15 | 16,000 | A super-heavy's hammer |

## Utility

Parts that make the mech useful between fights or help the lance. A roll is listed where activating the part takes one.

### Hauling and movement

| Make | Model | Kind | Tier | Type | Size | Energy | Heat | Tags | Roll | Price |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Netting N2 | Cargo net | Scrap | Generic | 1 | — | — | Passive, Stowage (2) | — | 100 |
| OHS | Winch W1 | Salvage winch | Scrap | Generic | 1 | 1 | 1 | Tow | Violence + Melee +1 | 300 |
| OHS | Rack R3 | Stowage rack | Scrap | Generic | 1 | — | — | Passive, Stowage (3) | — | 300 |
| OHS | Cargo Pod P7 | Cargo pod | Scrap | Generic | 2 | — | — | Passive, Stowage (7) | — | 500 |
| OHS | Winch W2 | Salvage winch | Salvage | Generic | 1 | 1 | 0 | Tow | Violence + Melee +2 | 800 |
| OHS | Cargo Pod P12 | Cargo pod | Salvage | Generic | 3 | — | — | Passive, Stowage (12) | — | 900 |
| KR | Rocket Pack RJ1 | Strap-on rockets | Scrap | Generic | 1 | 0 | 4 | Jump, Charges (3), Volatile (2) | — | 600 |
| MAS | Jump Jets JJ2 | Jump jets | Salvage | Generic | 1 | 2 | 3 | Jump | — | 2,000 |
| MAS | Jump Jets JJ3 | Jump jets | Standard | Generic | 1 | 2 | 1 | Jump | — | 4,000 |
| MAS | Vector VT2 | Vectored thrusters | Military | Generic | 1 | 1 | 2 | Jump, Evasive | Reflex + Mobility + Evasion | 6,000 |
| MAS | Flicker FL1 | Evasion jets | Military | Generic | 1 | 2 | 2 | Evasive | Reflex + Mobility + Evasion | 6,000 |
| MAS | Heavy Jets JJ6 | Jump jets | Military | Generic | 2 | 4 | 4 | Jump, Repeating (2) | — | 9,000 |

### Sensors and targeting

| Make | Model | Kind | Tier | Type | Size | Energy | Heat | Tags | Roll | Price |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Scope S1 | Salvaged scope | Scrap | Tech | 1 | 1 | 2 | Targeting, Jams | Wit + Tech −1 | 400 |
| SBL | Rangefinder RF1 | Rangefinder | Salvage | Tech | 1 | — | — | Passive, Ranging | — | 1,000 |
| SBL | Sensor SA1 | Sensor array | Standard | Tech | 1 | 1 | 1 | Targeting | Wit + Tech +1 | 2,000 |
| SBL | Rangefinder RF2 | Rangefinder | Standard | Tech | 1 | — | — | Passive, Ranging, Long-sight | — | 3,000 |
| SBL | Fire Control FC1-X | Targeting computer | Standard | Tech | 1 | — | — | Passive, Fire control (1), Linked | — | 3,500 |
| SBL | Sensor SA2 | Sensor array | Military | Tech | 1 | 1 | 1 | Targeting | Wit + Tech +2 | 6,000 |
| SBL | Recon Mast RM3 | Sensor mast | Military | Tech | 1 | 1 | 0 | Targeting, Thermal sight | Wit + Tech +2 | 7,000 |
| SBL | Fire Control FC1 | Targeting computer | Military | Tech | 1 | — | — | Passive, Fire control (1) | — | 8,000 |
| SBL | Fire Control FC2 | Targeting computer | Military | Tech | 1 | — | — | Passive, Fire control (2) | — | 14,000 |
| CLF | Mind M2 | Tactical AI core | Elite | Tech | 1 | 1 | 1 | Targeting, Datalink | Wit + Tech +3 | 18,000 |
| CLF | Mind M3 | Tactical AI core | Elite | Tech | 2 | 2 | 1 | Targeting, Datalink, Shielded (1) | Wit + Tech +5 | 25,000 |

### Smoke, electronic warfare and repair

| Make | Model | Kind | Tier | Type | Size | Energy | Heat | Tags | Roll | Price |
|---|---|---|---|---|---|---|---|---|---|---|
| HPY | Smoke SL2 | Smoke launcher | Salvage | Generic | 1 | 0 | 0 | Smoke (2), Charges (2) | — | 600 |
| HPY | Smoke SL4 | Smoke launcher | Standard | Generic | 1 | 0 | 0 | Smoke (2), Charges (4) | — | 1,200 |
| SBL | Jammer J1 | Jammer | Standard | Tech | 1 | 3 | 3 | Jamming | — | 3,000 |
| HPY | Obscurant OB2 | Obscurant launcher | Military | Generic | 1 | 0 | 0 | Smoke (2), Obscurant, Charges (2) | — | 4,000 |
| SBL | ECM-2 | ECM suite | Military | Tech | 1 | 2 | 2 | Jamming, Spoofing | — | 7,000 |
| SBL | ECM-3 | ECM suite | Military | Tech | 1 | 2 | 1 | Jamming, Spoofing | — | 10,000 |
| CLF | Veil V1 | Ghost veil | Elite | Tech | 1 | 1 | 1 | Jamming, Spoofing, Cloak (1) | — | 20,000 |
| OHS | Welding Rig WR1 | Welding rig | Salvage | Hand | 1 | 2 | 3 | Repair, Cutter | Knowledge + Repair +0 | 1,000 |
| GWC | Repair Arm Pattern 1 | Field repair rig | Standard | Hand | 1 | 2 | 1 | Repair, Analog | Knowledge + Repair +1 | 3,000 |
| GWC | Repair Arm Pattern 2 | Field repair rig | Military | Hand | 1 | 2 | 1 | Repair, Analog | Knowledge + Repair +2 | 7,000 |

## Defence

Defence parts trade energy and heat for fewer incoming successes. An activated defence part's tags last until your next turn.

| Make | Model | Kind | Tier | Type | Size | Energy | Heat | Ammo | Tags | Price |
|---|---|---|---|---|---|---|---|---|---|---|
| KR | Door Shield DS1 | Welded door | Scrap | Hand | 1 | 0 | 0 | — | Deflection (1), Frontal, Charges (3) | 300 |
| AWP | Riot Shield SH1 | Shield | Salvage | Hand | 1 | 1 | 0 | — | Deflection (1), Frontal | 1,500 |
| AWP | Riot Shield SH2 | Shield | Standard | Hand | 1 | 1 | 0 | — | Deflection (1), Frontal, Bash (1) | 3,000 |
| SBL | Field Generator FG1 | Field generator | Standard | Tech | 2 | 2 | 4 | — | Deflection (1), Armoured vs Kinetic, Weak vs EM | 5,000 |
| SBL | Faraday Mesh FM1 | Faraday mesh | Standard | Tech | 1 | — | — | — | Passive, Faraday (1) | 2,500 |
| SBL | Surge Breaker SB2 | Surge breaker | Military | Tech | 1 | 2 | 1 | — | Grounding (2) | 7,000 |
| CMS | Point-defence PD1 | Point-defence turret | Military | Weapon | 1 | 1 | 1 | Light | Point-defence (1) | 6,000 |
| AWP | Tower Shield TS2 | Tower shield | Military | Hand | 2 | 1 | 0 | — | Deflection (2), Frontal, Heavy (2) | 8,000 |
| SBL | Field Generator FG2 | Field generator | Military | Tech | 2 | 2 | 3 | — | Deflection (1), Armoured vs Kinetic, Weak vs EM | 9,000 |
| CMS | Point-defence PD2 | Point-defence turret | Military | Weapon | 1 | 2 | 1 | Light | Point-defence (2) | 10,000 |
| CLF | Aegis A2 | Aegis projector | Elite | Tech | 2 | 3 | 3 | — | Deflection (2) | 20,000 |
| CLF | Ward W2 | Lattice ward | Elite | Tech | 1 | 2 | 1 | — | Grounding (2), Faraday (1, mech) | 22,000 |

## Armour

Each section's Armour slot holds one; the model number is its points. Refilling a point costs a quarter of the armour's price (call).

| Make | Model | Kind | Tier | Points | Tags | Tags while it has points | Price |
|---|---|---|---|---|---|---|---|
| KR | Scrap Plate SP1 | Scrap plate | Scrap | 1 | — | — | 100 |
| KR | Scrap Plate SP2 | Scrap plate | Scrap | 2 | Heavy (1) | — | 250 |
| KR | Slab SB4 | Slab armour | Scrap | 4 | Heavy (2) | — | 600 |
| AWP | Plate P2 | Plating | Salvage | 2 | — | — | 500 |
| AWP | Ablative AB2 | Ablative plating | Salvage | 2 | — | Armoured vs Thermal | 1,200 |
| AWP | Plate P3 | Plating | Standard | 3 | Heavy (1) | — | 900 |
| AWP | Reactive RX2 | Reactive plating | Standard | 2 | — | Armoured vs Explosive | 1,200 |
| AWP | Hardened H2 | Hardened plating | Standard | 2 | — | Armoured vs EM | 1,500 |
| AWP | Composite C3 | Composite plating | Standard | 3 | — | — | 1,500 |
| AWP | Ablative AB3 | Ablative plating | Standard | 3 | — | Armoured vs Thermal | 2,500 |
| AWP | Bulkhead B6 | Bulkhead plate | Standard | 6 | Heavy (2) | — | 5,000 |
| AWP | Lightweave LW4 | Light composite | Military | 4 | Cheap recharge | — | 4,000 |
| AWP | Reactive RX3 | Reactive plating | Military | 3 | — | Armoured vs Explosive | 3,500 |
| AWP | Hardened H3 | Hardened plating | Military | 3 | — | Armoured vs EM | 4,000 |
| AWP | Laminate L4 | Ceramic laminate | Military | 4 | — | Armoured vs Kinetic | 4,000 |
| AWP | Laminate L5 | Ceramic laminate | Military | 5 | — | Armoured vs Kinetic | 6,000 |
| AWP | Weave W5 | Nanoweave | Elite | 5 | Self-repairing | — | 15,000 |
| AWP | Weave W7 | Nanoweave | Elite | 7 | Self-repairing | — | 25,000 |
