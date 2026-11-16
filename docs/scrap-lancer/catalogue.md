# Catalogue (draft)

> Snapshot of the "Scrap Lancer Mech Rules (Draft)" doc, Catalogue tab. The char sheet generates its Scrap Lancer data from these files: edit them (or re-export the doc), then run `python scripts/scraplancer/gen.py` and `python scripts/scraplancer/prefabs.py` in `char-sheet/`.

Twenty-one chassis and about 249 parts (Parts tab) from twenty manufacturers, from Kessler's welded-together scrap to Concord's AI-designed Elite frames. Every part is named by make and model, e.g. OHS Ox Mk III. Better parts buy the same job in fewer slots, for less heat or energy, or with no risk; cheap parts are big, hot, volatile or unreliable. Every number and price is a (call) to play-test.

## Tiers and prices

Every chassis and attachment has one of five tiers, which sets its price and how easy it is to find. Prices are in Solari; a chassis price is the bare frame with no attachments or armour.

| Tier | What it is | Where you find it | Typical tradeoff |
|---|---|---|---|
| Scrap | Welded from wrecks and industrial gear | Anywhere, or built from Scrap | Big, hot, Volatile or Jams |
| Salvage | Old frontier and civilian parts, patched up | Junkyards, frontier towns | Works, but a little hot or hungry |
| Standard | Colony militia and corporate stock | Towns and shipyards | The baseline every number is balanced against |
| Military | Current front-line hardware | Military contacts, battlefield salvage | Same job in fewer slots, or more output for the heat |
| Elite | AI-designed Elite tech | Almost never for sale | Efficient and compact; parts are rare to replace |

The price sets the cost of repairs: rebuilding a destroyed section costs a tenth of its chassis price, and replacing a part costs its full price (call). A lance starting out has about 10,000 Solari between them, enough for one Salvage frame or two Scrap frames, stocked (call).

## Manufacturers

Twenty makes, each with a narrow trade. Seven build frames, and a frame maker only makes parts that belong with its frames; everything else comes from specialists. A mech is usually a mix: an HCA Warden runs on an HRW reactor, cools with Halcyon exchangers and carries a Brannoc autocannon. Kessler is the exception: it rebuilds anyone's wrecks. In play a part is called by abbreviation and model, e.g. "HRW Dipole D6" or "VDG Monolith VX-9".

| Make | Abbr. | What they make | Tiers | House style | Model names |
|---|---|---|---|---|---|
| Frames |  |  |  |  |  |
| Kessler Reclamation | KR | Rebuilt frames, and rebuilt copies of anyone's parts | Scrap–Salvage | Cheap, hot, Volatile, prone to jams | Name + R number: Rattler R1. Rebuilt parts keep the original model + R: AC-30R |
| Orion Hardline Systems | OHS | Labour frames, and industrial tools: claws, saws, drills, winches, cargo, cutting beams | Scrap–Standard | Over-built, Hull-heavy, slow; spares in every town | Beast of burden + Mk: Ox Mk III. Tools by code: Rotosaw RS2 |
| Hesper Colonial Armouries | HCA | Militia frames only; it buys in everything it fits | Salvage–Standard | Balanced and modular; the baseline | Role + Block: Warden Block 2 |
| Meridian Aerospace | MAS | Light, fast frames, and propulsion: jump jets and thrusters | Salvage–Military | Fast, evasive, lightly built | Hunting bird + letter-number: Kestrel K-12 |
| Vantor Defence Group | VDG | Sol military frames only | Military | Efficient front-line frames; spares are controlled | Name + VX number: Halberd VX-6 |
| Greenward Cooperative | GWC | Naturalist frames, and the analog systems that keep them running: Kiln reactors, water cooling, repair rigs | Standard–Military | Analog, EM-proof, heavy, field-repairable | Hardwood or craft + Pattern: Ironbark Pattern 5 |
| Concord Lattice Foundry | CLF | Elite frames, and the AI systems built into them: tactical cores, veils, aegis fields | Elite | Compact, no Hull, rarely for sale | Name + S number: Wraith S9. Systems by letter: Mind M3 |
| Weapons |  |  |  |  |  |
| Brannoc Ordnance | BRO | Colonial guns: machine guns, autocannons, cannons, mortars | Salvage–Military | Reliable, fairly priced, every calibre | Kind + calibre: M12, AC-30, HC-60 |
| Ashby-Raine Heavy Ordnance | ARH | Sol heavy guns: big cannons, artillery, mass drivers | Military–Elite | Devastating, huge, hot and hungry | Name + calibre: Thunderer 120. Rails and coils by letter: Rail R4 |
| Lumen Directed Energy | LDE | Lasers and plasma | Salvage–Elite | No ammo, lots of power | LZ, HL, PX + rating: LZ-3 |
| Stormglass Works | SGW | Naturalist EM weapons | Salvage–Military | Built to switch Elite frames off | Name + Pattern: Arc Lance Pattern 2 |
| Corvid Missile Systems | CMS | Rockets, missiles and point-defence | Salvage–Elite | Cheap to fire, dangerous to carry | Range class + tubes: LRM-5 |
| Hadley Pyrotechnics | HPY | Flamers, napalm, smoke and obscurants | Salvage–Military | Fire and cover, fuel-fed | Kind + number: Napalm NP2 |
| Vasquez Close Combat | VCC | Military melee: blades, rams, drivers, mauls | Salvage–Elite | Fighting tools, not work tools | Kind + rating: Shear SB3 |
| Systems |  |  |  |  |  |
| Halvorsen Reactor Works | HRW | Fusion reactors and capacitors | Salvage–Military | The colony's power, from Dipoles to Twin-cores | Name + energy: Dipole D6 |
| Aurel Zero-Point | AZP | Elite reactors and charge wells | Elite | Huge output, little heat, almost no supply | Name + energy: Torus T10 |
| Coldwater Fabrication | CWF | Radiators and vent stacks | Scrap–Standard | Cheap and bulky, but free to run | Fin or Array + heat: Array RA4 |
| Halcyon Thermal | HTC | Heat exchangers, heat sinks and active cooling | Salvage–Elite | The best coolers there are | HX, CX, HS + rating: HX-3 |
| Anvil & Ward Plate | AWP | Armour and shields | Salvage–Elite | Every grade of plate | Kind + points: Laminate L4 |
| Sable Logic | SBL | Sensors, fire control, ECM, field generators | Salvage–Military | The colony's electronics house | Code + rating: ECM-2 |

For parts, the number in a model name is the part's headline stat: energy for a reactor, heat removed for a cooler, armour points for armour, tubes or calibre for weapons. A Torus T10 makes 10 energy; a Halcyon HX-3 removes 3 heat.

## Chassis overview

Twenty-one frames from seven makes, grouped by make. Prices run from 800 to 70,000, and Heat Max from 3 to 20: junk frames scrape by on small numbers, while super-heavies run big reactors, big coolers and big guns. Jackal J-7, Mule Mk II and Bulwark Block 4 are the original Jackal, Mule and Bulwark under their makers' names; only their Heat Max has changed.

Slot counts exclude each section's Armour slot.

Hardpoints are Reactor / Weapon / Tech / Hand / untyped slots.

| Make | Model | Class | Tier | Price | Heat Max | Slots (Hull) | Speed / Evasion | Hardpoints R/W/T/H/U | Trait (call) |
|---|---|---|---|---|---|---|---|---|---|
| KR | Tinpot R0 | Ultralight | Scrap | 800 | 3 | 10 (3) | 50 / 2 | 1 / 1 / 0 / 1 / 4 | Tiny: attacks against it from Long range roll −1 die |
| KR | Rattler R1 | Light | Scrap | 1,200 | 4 | 12 (3) | 60 / 2 | 2 / 1 / 0 / 2 / 4 | Open cab: an Area attack that hits the cockpit also hits the pilot |
| KR | Hulk R3 | Medium | Scrap | 2,200 | 5 | 15 (5) | 50 / 2 | 2 / 3 / 0 / 1 / 4 | Junker: rebuilding a destroyed section costs only Scrap, never Solari |
| OHS | Ox Mk II | Medium quad | Scrap | 2,500 | 5 | 21 (8) | 60 / 0 | 2 / 1 / 2 / 1 / 7 | Unshakeable: cannot be knocked down, shoved or grappled |
| OHS | Ox Mk III | Medium quad | Salvage | 4,000 | 6 | 23 (8) | 60 / 0 | 2 / 2 / 3 / 1 / 7 | Unshakeable |
| OHS | Mule Mk II | Medium | Salvage | 6,000 | 7 | 21 (4) | 60 / 2 | 2 / 4 / 2 / 2 / 6 | Workhorse: field repairs on it roll +1 die |
| OHS | Mastodon Mk I | Heavy tracked | Salvage | 8,000 | 9 | 21 (6) | 30 / 0 | 3 / 1 / 2 / 2 / 7 | Hauler: each Stowage part on it holds +2 |
| HCA | Picket Block 1 | Light | Salvage | 5,000 | 5 | 14 (3) | 70 / 4 | 2 / 3 / 3 / 1 / 2 | Spotter: its target locks also count for allies' attacks |
| HCA | Warden Block 2 | Medium | Standard | 10,000 | 8 | 21 (5) | 60 / 2 | 2 / 5 / 3 / 1 / 5 | Militia standard: armour refills at half price in any colony town |
| HCA | Bulwark Block 4 | Heavy tracked | Standard | 14,000 | 11 | 25 (7) | 40 / 1 | 3 / 6 / 2 / 0 / 7 | Stable platform: Long weapons roll +1 die if it did not move this turn |
| HCA | Rampart Block 6 | Heavy | Standard | 20,000 | 13 | 24 (7) | 30 / 0 | 3 / 6 / 3 / 1 / 4 | Gun platform: a size-4 weapon on its cannon arm ignores Braced |
| MAS | Jackal J-7 | Light | Salvage | 4,000 | 5 | 13 (3) | 80 / 4 | 2 / 3 / 1 / 1 / 3 | Light frame: Sprint costs 1 energy instead of 2 |
| MAS | Kestrel K-12 | Light | Military | 18,000 | 7 | 17 (3) | 90 / 4 | 2 / 4 / 4 / 0 / 4 | Gyro-stabilised: Sprint and jump parts cost 1 less heat |
| MAS | Harrier H-3 | Medium | Military | 22,000 | 8 | 19 (3) | 80 / 4 | 2 / 5 / 3 / 1 / 5 | Built to jump: jump parts cost 1 less energy |
| VDG | Halberd VX-6 | Medium | Military | 20,000 | 10 | 23 (6) | 60 / 2 | 2 / 5 / 3 / 1 / 6 | Fire control: once per turn, one weapon ignores the −1 die for a closer band |
| VDG | Monolith VX-9 | Heavy assault | Military | 30,000 | 14 | 31 (10) | 40 / 0 | 3 / 7 / 3 / 1 / 7 | Siege frame: cannot Sprint; gains Deflection (1) on any turn it does not move |
| VDG | Bastion VX-12 | Super-heavy tracked | Military | 48,000 | 20 | 37 (11) | 20 / 0 | 4 / 11 / 4 / 1 / 6 | Emplacement: its Braced weapons can still fire after it moves up to 10 |
| GWC | Thornback Pattern 3 | Medium | Standard | 9,000 | 8 | 21 (10) | 60 / 2 | 2 / 3 / 1 / 1 / 4 | Analog: EM cannot disable its parts and it is never Weak vs EM; cannot mount CLF parts |
| GWC | Ironbark Pattern 5 | Heavy | Military | 24,000 | 12 | 27 (10) | 50 / 0 | 3 / 4 / 2 / 2 / 6 | Analog; Hull wounds on it can be field-repaired without Scrap |
| CLF | Wraith S9 | Light | Elite | 45,000 | 8 | 15 (0) | 90 / 6 | 2 / 3 / 5 / 1 / 4 | Ghost skin: until it fires a weapon this turn, attacks from beyond Short range roll −2 dice |
| CLF | Paragon S11 | Heavy | Elite | 70,000 | 15 | 24 (4) | 60 / 2 | 3 / 6 / 4 / 2 / 5 | Neural link: once per turn, reroll one die on any mech roll |

How the tiers show up in the frame:

Cheap frames are slot-poor or Hull-padded. The Ox Mk II has 21 slots, but 8 are Hull and only one takes a gun.

Better frames trade Hull for working slots and Heat Max. The Wraith S9 has no Hull at all: every wound costs it a part, in exchange for 5 Tech slots and Evasion 6.

Reactor bays and gun mounts grow with the frame. The Tinpot R0 runs on one reactor slot and most frames have two. Heavy frames have three, and the Bastion VX-12 has four, plus a five-slot gun mount for Siege-size weapons. Elite reactors fit more output into fewer slots.

Mark numbers are upgrades. The Ox Mk III adds a second gun and two Tech slots to the Mk II for 1,500 more.

## Chassis details: Kessler and Orion

Section layouts for every frame except Jackal J-7, Mule Mk II and Bulwark Block 4, which are on the Rules tab.

Every section also has an Armour slot.

Arms, legs and shoulders transfer hits to the core; the cockpit transfers them to the pilot.

### KR Tinpot R0 — ultralight, Scrap

A one-seat walker built round a car engine. It runs on a single small reactor and a heat bank of 3, so every shot is a decision.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–3 | Hull, untyped | Speed 25, Evasion 1 |
| Right leg | 4–6 | Hull, untyped | Speed 25, Evasion 1 |
| Core | 7–10 | Reactor, untyped ×2 | — |
| Arm | 11 | Hand, Weapon | Hand (with Manipulator) |
| Cockpit | 12 | Hull | — |

### KR Rattler R1 — light, Scrap

A cargo loader with a roll cage and a gun welded to one claw. With no Tech slot, it cools with fins alone.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped | Speed 30, Evasion 1 |
| Right leg | 3–4 | Hull, untyped | Speed 30, Evasion 1 |
| Left arm | 5–6 | Hand, Weapon | Hand (with Manipulator) |
| Core | 7–10 | Reactor ×2, untyped | — |
| Right arm | 11 | Hand, untyped | Hand (with Manipulator) |
| Cockpit | 12 | Hull | — |

### KR Hulk R3 — medium, Scrap

A dead OHS Mule rebuilt with slabs of Hull and a second gun arm. Ugly, slow and cheap to keep running.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped | Speed 25, Evasion 1 |
| Right leg | 3–4 | Hull, untyped | Speed 25, Evasion 1 |
| Left arm | 5–6 | Hand, Weapon | Hand (with Manipulator) |
| Core | 7–9 | Hull ×2, Reactor ×2, untyped ×2 | — |
| Right arm | 10–11 | Weapon ×2 | — |
| Cockpit | 12 | Hull | — |

### OHS Ox Mk II — medium quad, Scrap

A four-legged freight walker with a crane arm. Tough and roomy, but it carries one gun and cannot dodge. Losing a leg costs only 15 Speed.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Rear left leg | 1 | Hull, untyped | Speed 15 |
| Rear right leg | 2 | Hull, untyped | Speed 15 |
| Front left leg | 3 | Hull, untyped | Speed 15 |
| Front right leg | 4 | Hull, untyped | Speed 15 |
| Cargo bed (core) | 5–9 | Hull ×2, Reactor ×2, Tech, untyped ×3 | — |
| Crane arm | 10–11 | Hull, Hand, Weapon | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech | — |

### OHS Ox Mk III — medium quad, Salvage

The current Ox. It has the Mk II's legs and cargo bed, plus a second gun on the crane arm and a cab with two Tech slots.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Rear left leg | 1 | Hull, untyped | Speed 15 |
| Rear right leg | 2 | Hull, untyped | Speed 15 |
| Front left leg | 3 | Hull, untyped | Speed 15 |
| Front right leg | 4 | Hull, untyped | Speed 15 |
| Cargo bed (core) | 5–9 | Hull ×2, Reactor ×2, Tech, untyped ×3 | — |
| Crane arm | 10–11 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech ×2 | — |

### OHS Mastodon Mk I — heavy tracked, Salvage

A tracked mining crawler with a drill arm and a crane. It has a heavy reactor bay and lots of room, but only one Weapon slot. A Treads hit can stop it dead.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Treads | 1–3 | Hull ×2, untyped ×3 | Speed 30 |
| Core | 4–8 | Hull ×2, Reactor ×3, Tech, untyped ×3 | — |
| Drill arm | 9–10 | Hull, Hand, Weapon | Hand (with Manipulator) |
| Crane arm | 11 | Hand, untyped | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech | — |

## Chassis details: Hesper, Meridian and Vantor

### HCA Picket Block 1 — light, Salvage

The militia's scout: a sensor head on fast legs, with a hand for field work. Cheap enough to lose.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped | Speed 35, Evasion 2 |
| Right leg | 3–4 | Hull, untyped | Speed 35, Evasion 2 |
| Left arm | 5 | Hand, Weapon | Hand (with Manipulator) |
| Core | 6–9 | Hull, Reactor ×2, Tech | — |
| Right arm | 10 | Weapon ×2 | — |
| Sensor head (cockpit) | 11–12 | Tech ×2 | — |

### HCA Warden Block 2 — medium, Standard

The colony militia's line mech: nothing special, nothing missing. A gun arm on the right, a working hand on the left.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 30, Evasion 1 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 30, Evasion 1 |
| Left arm | 5–6 | Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×2, Tech ×2, untyped | — |
| Right arm | 10–11 | Hull, Weapon ×3 | — |
| Cockpit | 12 | Hull, Tech | — |

### HCA Rampart Block 6 — heavy, Standard

The militia's answer to Sol siege frames: a slow heavy biped with a four-slot cannon arm, built to carry a Brannoc HC-60.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped | Speed 15 |
| Right leg | 3–4 | Hull ×2, untyped | Speed 15 |
| Core | 5–8 | Hull, Reactor ×3, Tech ×2, untyped ×2 | — |
| Cannon arm | 9–10 | Hull, Weapon ×4 | — |
| Left arm | 11 | Hand, Weapon ×2 | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech | — |

### MAS Kestrel K-12 — light, Military

A front-line skirmisher with gun pods for arms and a sensor head. No hands: it fights, it does not salvage.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 45, Evasion 2 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 45, Evasion 2 |
| Left arm | 5 | Weapon ×2 | — |
| Core | 6–9 | Hull, Reactor ×2, Tech ×2 | — |
| Right arm | 10 | Weapon ×2 | — |
| Sensor head (cockpit) | 11–12 | Tech ×2 | — |

### MAS Harrier H-3 — medium, Military

The Kestrel's bigger sibling, built around jump packs: a hand, a three-gun arm and roomy legs for jets.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 40, Evasion 2 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 40, Evasion 2 |
| Left arm | 5–6 | Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×2, Tech ×2, untyped | — |
| Right arm | 10–11 | Weapon ×3 | — |
| Cockpit | 12 | Tech | — |

### VDG Halberd VX-6 — medium, Military

Vantor's main battle frame: a Warden with Hull in every section, more Heat Max and fire control.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 30, Evasion 1 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 30, Evasion 1 |
| Left arm | 5–6 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×2, Tech ×2, untyped ×2 | — |
| Right arm | 10–11 | Hull, Weapon ×3 | — |
| Cockpit | 12 | Hull, Tech | — |

### VDG Monolith VX-9 — heavy assault, Military

A walking gun emplacement with a missile shoulder. Slow, with no Evasion, but 10 Hull slots and Heat Max 14.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped ×2 | Speed 20 |
| Right leg | 3–4 | Hull ×2, untyped ×2 | Speed 20 |
| Left arm | 5–6 | Hull, Weapon ×3 | — |
| Core | 7–9 | Hull ×2, Reactor ×3, Tech ×2, untyped ×2 | — |
| Right arm | 10 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Left shoulder | 11 | Weapon ×2, untyped | — |
| Cockpit | 12 | Hull ×2, Tech | — |

### VDG Bastion VX-12 — super-heavy tracked, Military

A tracked fortress with a four-slot reactor bay and a five-slot main gun mount. It is the only frame that can carry a Siege-size weapon, and it needs every cooler it can fit.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left tread | 1–2 | Hull ×2, untyped ×2 | Speed 10 |
| Right tread | 3–4 | Hull ×2, untyped ×2 | Speed 10 |
| Core | 5–7 | Hull ×2, Reactor ×4, Tech ×3, untyped ×2 | — |
| Main gun mount | 8–9 | Hull, Weapon ×5 | — |
| Left arm | 10 | Hull, Weapon ×3 | — |
| Right arm | 11 | Hull, Hand, Weapon ×3 | Hand (with Manipulator) |
| Cockpit | 12 | Hull ×2, Tech | — |

## Chassis details: Greenward and Concord

The two ends of the setting's divide. Greenward frames are analog, Hull-heavy and short on Tech slots. Concord frames are compact and AI-designed, with little or no Hull.

### GWC Thornback Pattern 3 — medium, Standard

A Naturalist militia frame: hand-built, armoured in Hull, with one Tech slot and nothing an EM weapon can switch off.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped | Speed 30, Evasion 1 |
| Right leg | 3–4 | Hull ×2, untyped | Speed 30, Evasion 1 |
| Left arm | 5–6 | Hull, Hand, Weapon | Hand (with Manipulator) |
| Core | 7–9 | Hull ×2, Reactor ×2, Tech, untyped ×2 | — |
| Right arm | 10–11 | Hull, Weapon ×2 | — |
| Cockpit | 12 | Hull ×2 | — |

### GWC Ironbark Pattern 5 — heavy, Military

Greenward's answer to Elite frames: a slow two-handed brawler with a three-slot reactor bay and 10 Hull slots, built to close in and tear things apart.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull ×2, untyped ×2 | Speed 25 |
| Right leg | 3–4 | Hull ×2, untyped ×2 | Speed 25 |
| Left arm | 5–6 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Core | 7–9 | Hull ×2, Reactor ×3, Tech, untyped ×2 | — |
| Right arm | 10–11 | Hull, Hand, Weapon ×2 | Hand (with Manipulator) |
| Cockpit | 12 | Hull ×2, Tech | — |

### CLF Wraith S9 — light, Elite

An Elite recon and electronic-warfare frame. Five Tech slots and Evasion 6, but no Hull: every wound lands on a part.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | untyped ×2 | Speed 45, Evasion 3 |
| Right leg | 3–4 | untyped ×2 | Speed 45, Evasion 3 |
| Left arm | 5 | Hand, Weapon | Hand (with Manipulator) |
| Core | 6–9 | Reactor ×2, Tech ×3 | — |
| Right arm | 10 | Weapon ×2 | — |
| Cockpit | 11–12 | Tech ×2 | — |

### CLF Paragon S11 — heavy, Elite

An Elite command frame with two hands, two three-gun arms, a three-slot reactor bay and Heat Max 15.

| Section | d12 | Slots | Provides |
|---|---|---|---|
| Left leg | 1–2 | Hull, untyped ×2 | Speed 30, Evasion 1 |
| Right leg | 3–4 | Hull, untyped ×2 | Speed 30, Evasion 1 |
| Left arm | 5–6 | Hand, Weapon ×3 | Hand (with Manipulator) |
| Core | 7–9 | Hull, Reactor ×3, Tech ×2, untyped | — |
| Right arm | 10–11 | Hand, Weapon ×3 | Hand (with Manipulator) |
| Cockpit | 12 | Hull, Tech ×2 | — |

## Parts

All 249 parts (power, cooling, weapons, utility, defence and armour) are on the Parts tab, grouped by family from Scrap to Elite: 

## New tags and ammo

The catalogue adds about forty new tags, widens Volatile and Charges, and adds two ammo types; the rest of the rules are unchanged.

| Tag | Rule |
|---|---|
| Attack modifiers |  |
| Piercing (X) | After deflection and Armoured / Weak, up to X wounds from this attack skip the hit section's armour points and go straight to slots |
| Searing (X) | If the attack deals at least one wound, the target mech gains X heat |
| Accurate | Aimed shots with it cost 1 fewer die (minimum 1). Stacks with Fire control |
| Scatter | Against a target at Short, it also has Area (1) |
| Disruptor | Ignores deflection. Successes can be spent to disrupt an attachment in the hit section instead of wounding: spend 1 success per slot it occupies (a size-3 part costs 3). A disrupted part is disabled until it is repaired, but takes no wounds. Analog parts cannot be disrupted |
| Knockback | Successes can be spent on movement instead of wounds: each one pushes the target one range band away, or moves this mech one band after it. The first success must push the target, and a pushed target is Staggered: its next roll is −1 die and it cannot Sprint until the end of its next turn (call). The rest are wounds as normal |
| Suppressive | Successes can be spent to suppress instead of wounding: each gives the target −1 die on its next roll, to a maximum of −3 from all sources (call). Machine guns pin a target down rather than wreck it |
| Concussive | If the attack deals at least one wound, the target is Staggered (see Knockback) |
| Grapple | Spend a success to grab the target instead of wounding: it cannot move away from this mech until it breaks free or this part is disabled. Breaking free is an action: roll Violence + Melee and spend a success. While it is held, spend a success from any of this part's later attacks to drag it one range band with you |
| Grinding | +1 die for each consecutive turn it has attacked the same target |
| Overcharge (X) | When activating it, you may spend X more energy and gain X more heat to give that activation Powerful |
| Firing limits |  |
| Jams | If the roll scores no successes, the part cannot be activated again until your next turn |
| Braced | Can be activated only if the mech has not moved this turn, and the mech cannot move after activating it this turn, so it ends the turn a Sitting Duck |
| Reload (X) | After activation, it cannot be activated again until X of your turns have passed |
| Hungry (X) | Each activation draws X rounds instead of one |
| Lobbed | Cannot target anything at Short |
| Charges (X) | X activations, refilled at a haven. Was already used by Coolant Flush |
| Recharging (X) | X activations, refilled at the start of each scene |
| Renewable | Its Charges also refill for free, out of combat, wherever what it uses can be found: open water for a spray or quench tank |
| Missiles |  |
| Missile | The attack is a missile: Point-defence and Spoofing work against it |
| Guided | Against a locked target, each activation adds 1 extra die to the shot |
| Seeking | Ignores Evasion, and Spoofing does not stop its Guided dice |
| Locks and sensors |  |
| Targeting | Activation: roll the listed Roll; each success places a lock on a target in line of sight until your next turn. Attacks against a locked target roll +1 die, and Indirect and Guided weapons use locks |
| Datalink | Locks it places count for every mech in your lance |
| Thermal sight | Its locks are not broken by Smoke |
| Ranging | Ignore the −1 die for a target in a closer band |
| Long-sight | Attacks at Long roll +1 die |
| Fire control (X) | Aimed shots cost X fewer dice (minimum 1) |
| Linked | Its effect applies to one weapon only, chosen when it is fitted |
| Concealment and electronic warfare |  |
| Smoke (X) | Activation: a cloud of radius X at a point in line of sight, until your next turn. It blocks line of sight, and locks traced through it break |
| Obscurant | Its smoke also gives Armoured vs Thermal against attacks traced through it |
| Jamming | Activation: every lock on this mech breaks, and no new lock can be placed on it until your next turn |
| Spoofing | Until your next turn, Guided weapons get no extra dice against this mech (except Seeking ones) |
| Cloak (X) | Until your next turn, attacks at Long against this mech roll −X dice |
| Point-defence (X) | Activation: until your next turn, Missile attacks against this mech or an engaged ally lose X successes |
| Grounding (X) | Activation: until your next turn, EM attacks against this mech lose X successes |
| Loud | After activation, attacks against this mech roll +1 die until your next turn: the plume gives its position away |
| Defence |  |
| Frontal | Its effect works only against attacks from in front of the mech |
| Bash (X) | It can also be activated as a melee attack: Violence + Melee +X, Kinetic |
| Hands, tools and movement |  |
| Hand | Gives its section Hand: grab, carry and use hand-held gear |
| Dexterous (X) | +X dice to fine work with this hand: field repairs, locks, salvage |
| Cutter | Out of combat it cuts through doors, hatches, hulls and wrecks (Control + Melee) |
| Tow | Activation: roll the listed Roll against a target at Short or Mid. Spend a success to pull the target one range band closer, or to haul this mech one band to it; the first success must pull the target. Out of combat it drags a wreck or load at half Speed |
| Repair | Activation: roll the listed Roll at Short; each success spends 1 Scrap to clear one slot wound on this mech or an engaged ally, as a field repair |
| Jump | Activation: move up to Speed in one leap, over terrain and out of engagement. A melee attack after landing this turn rolls +2 dice |
| Evasive | Activation: this turn counts as Sprinting for Evasion, without spending a Sprint |
| Stowage (X) | Holds X items of cargo or salvage |
| Frame and build |  |
| Volatile (X) | Replaces plain Volatile on non-ammo parts: when disabled, roll Xd4, each success a wound to that section that ignores armour. Ammo bins keep rounds × volatility |
| Analog | It cannot be disrupted by Disruptor attacks |
| Shielded (X) | Disrupting this part costs X more successes |
| Faraday (X) | Passive: while it works, every other part in its section has Shielded (X). Faraday (X, mech) covers every part on the mech instead |
| Heavy (X) | −X mech Speed while it is fitted |
| Cheap recharge | Refilling it costs half price: armour points on armour, or Charges on a part that has them |
| Self-repairing | Armour only: regains 1 point at the start of each of your turns, up to its maximum |
| Ammo | Rounds per bin | Volatility | Full-bin cook-off | Refill price per bin |
| Light | 16 | ×1 | 16d4 | 100 |
| Standard | 8 | ×2 | 16d4 | 150 |
| Missile | 5 | ×3 | 15d4 | 300 |
| Heavy | 4 | ×4 | 16d4 | 250 |
| Slug (new) | 8 | ×0 | none | 200 |
| Fuel (new) | 5 | ×3 | 15d4 | 150 |

For the web tool:

The tool can already show most of this: energy, heat, ammo, charges, stowage and passive numbers.

The tool would need: make, model, tier and price on each chassis and part, a quad silhouette for the Ox, and the two new ammo types.

Played at the table: chassis traits and the new tags, shown as text in the tool.
