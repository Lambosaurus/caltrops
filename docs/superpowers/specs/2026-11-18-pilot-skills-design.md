# Pilot skills and the dodge roll (Scrap Lancer)

## Why

In mech play, one skill (Gunnery) covered 95 of the 128 parts that roll. Piloting did nothing, and a character's
skill with their own body was the same number as their skill through a mech. A separate pilot track makes mech
builds and pilots diverge, and makes Evasion depend on the pilot.

## Decided

- **Level-up fix.** Scrap Lancer levels like default Caltrops: 0.5 aspect points per level, no attribute increases.
  Character skills keep 2.5 points per level.
- **Pilot skills.** A second skill table, "Pilot": Gunnery, Melee, Mobility, Tech, Repair. Its own point pool:
  1.5 per level, rounded up, at normal Caltrops skill costs. Stored in the sheet's own `pilotSkills` dictionary,
  so it never mixes with the character's skills of the same name.
- **Character skills** keep Gunnery, Melee and Repair, which cover the character's own body. Piloting is removed
  (Scrap Lancer only; the Lancer ruleset is unchanged).
- **Mech rolls use pilot skills only.** Aspects stay as now.
- **Which pilot skill each part rolls.**
  - Gunnery: machine guns, autocannons, cannons, mortars and artillery, mass drivers, flamers, rockets and missiles.
  - Tech: lasers, plasma, EM weapons, sensors and targeting, Mind parts (everything that rolled Computing).
  - Melee: melee parts, unchanged.
  - Repair: repair rigs, and field repair (Knowledge + Repair).
- **Dodge.** Sprinting rolls Reflex + Mobility (pilot) + the mech's Evasion dice. Each success is a dodge token; a
  token thwarts one success of an attack against the mech; tokens are lost when the mech's next turn starts.
  Sprinting no longer removes attacker dice. Sitting Duck (+2 attacker dice) stays.
- **Dodge tokens are a VTT concern.** The app posts the Sprint roll to the VTT (or rolls it locally when there is
  no VTT and shows the dice); it does not track tokens.

## Approaches

- Separate `pilotSkills` dictionary with its own table (chosen): no name clashes, separate costs fall out of the
  existing skill-cost code.
- Prefixed names in the one `skills` dictionary: shares storage but needs filtering everywhere costs are counted.

## Left to the builder

- Standalone mech view (no pilot sheet): the Sprint roll uses Evasion dice only.
- Docs: the repo snapshots and the Claude Doc (Rules: Mobility, Repair, the skill placeholder text, starter
  parts; Parts: the Roll column) say the same as the app.
