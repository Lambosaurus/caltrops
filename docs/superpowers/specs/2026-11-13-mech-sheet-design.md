# Mech sheets for Caltrops: design

Date: 2026-11-13. Status: draft for review.

## Intent

A GM running a Caltrops campaign of mech pilots (a Scrap Lancer / MechWarrior-style game built on the Lancer ruleset) wants the character sheet tool to manage mechs properly. Today a mech is a 5-slot "Lancer" equipment container and a 5-slot "Lancer" wound track on the pilot's sheet, with charges tracked as item counts. That is too shallow for the rules the campaign now uses: chassis with typed slots, attachments that cost energy and make heat, location-based damage, and mobility states.

The mech rules are specified in the Claude Doc "Scrap Lancer Mech Rules (Draft)" (https://claude.ai/artifact/DveC5cCJwqRHqHDAKaG3g4). A throwaway HTML prototype that the GM has played with and approved as the direction lives at `.superpowers/brainstorm/48986-1794544213/content/mech-prototype.html` (git-ignored; open it directly in a browser). **Where this document and the prototype differ, this document wins. Where this document is silent on a rule, the rules doc wins, then the prototype.**

The work is meant to be merged upstream into Lambosaurus/caltrops through a PR, so it must not change anything for rulesets that do not opt in.

## Goals

1. **Mechs are their own documents.** A mech is saved on the server as its own document (`type: "mech"`), with an owner. It can be created, loaded, opened by link and swapped between pilots, like a sheet, and used on its own without a pilot (see "Decisions after design review").
2. **Pilot | Mech tabs.** When the sheet's ruleset has mech rules, the sheet shows tabs: Pilot (the existing sheet, unchanged) and Mech (the assigned mech). The Pilot tab also shows a small "current mech" card. A pilot can assign, change or unassign their mech from the sheet.
3. **The mech sheet is laid out like a mech.** Sections (core, arms, legs, cockpit, shoulder, treads, and so on) are placed on a grid over a faint silhouette of the chassis. Each section shows its name, hit range and aim cost, an armour row with pips, and its ordered slots. Each slot shows a colour-coded type tag, what is mounted there and a wound box.
4. **Loadout editing by drag and drop.** In loadout edit mode, a catalogue of attachments (filtered by ruleset, colour-coded by the slot type they need) can be dragged onto slots. Mounted parts can be dragged between slots or removed. Invalid drops are refused, with the target highlighted in red. The sheet warns, but does not block, when there is no reactor or no cooling.
5. **Play tracking.** The mech sheet tracks:
    - energy, heat (with the end-of-turn projection), Heat Max, Speed, Evasion, Hand;
    - movement posture (Sitting Duck / Moved / Sprinting) and target range (Short / Mid / Long);
    - which attachments have been activated this turn (with Repeating counts);
    - armour points, slot wounds, ammo and charges.
6. **Turn controls.** Move, Sprint, End turn, Shut down & purge, Start turn, with the heat, overheat, shutdown and posture rules from the rules doc.
7. **Activations open a roll prompt.** Activating a weapon or tool never resolves silently. It shows the cost (energy, heat, ammo) and the roll (aspect or attribute, skill, attachment bonus, range penalty, extra bonus), using the pilot's actual scores, and rolls through the existing Caltrops roll flow. Attachments without a roll (jump jets, cooling) show their effect and an Activate button.
8. **Taking hits.** Each section has a Hit button that opens a small popup with a number box (wounds) and an "ignores armour" option. There is also a general "take a hit" control that rolls the d12 location. Both show the current attacker dice modifier (Sitting Duck, Evasion, stunned).
9. **Manual by default, automation opt-in.** Everything can be adjusted by hand: wound boxes, armour pips, ammo up/down, energy, heat. Automatic effects are separate settings, all **off** by default:
    - spend ammo on activation;
    - roll and apply overheat self-damage;
    - roll and apply ammo cook-off;
    - apply hit damage through armour, slots and overflow (when off, the Hit popup still works but only marks what you enter).

    When an automation is off, the sheet says what to roll or mark instead (as the prototype's log does).
10. **Hover popovers.** Every slot tag, attachment, section header, stat and turn button explains itself on hover, as in the prototype, including why an activation is unavailable.
11. **Mech rules are ruleset data.** Chassis, slot types, attachments and ammo types are defined in the ruleset file, like skills and equipment are today. A ruleset with no mech data behaves exactly as now.

## Non-goals

- The categorised skill system (Piloting → Gunnery / Mobility / Tech, and so on). That is a separate project. Attachment rolls name a skill, and v1 uses the ruleset's existing skill names.
- Enemy and NPC mechs as a separate feature. A GM can make an ordinary mech document for one.
- Any server or API change. The existing documents API already stores arbitrary `type`s.
- Foundry VTT integration beyond what the existing roll flow already does (it already offers "Send to VTT" when Foundry is present).
- Writing to the pilot's sheet from the mech (for example adding cockpit-breach wounds to the pilot's Body track). v1 tells the user; they add the wound on the Pilot tab.
- Balancing numbers. The example data comes from the rules doc and will change through play-testing.

## Anti-goals (would make this a failure even if it works)

- Any visible or behavioural change for Bludgeon, Drifters, Lancer or any other ruleset that does not opt in.
- Breaking existing saved sheets. New sheet fields must be optional and survive `loadSheet` / `cleanSheet`.
- Rules that silently do things. With automation off, nothing changes a number the user did not touch, except the costs they confirm (energy and heat) and turn bookkeeping.
- Mech rules hard-coded in components. Numbers and names belong in ruleset data so the GM can rebalance by editing one file.

## Constraints

- **Stack:** React 18 + TypeScript (CRA, react-scripts 5), DaisyUI/Tailwind, react-dnd, and the existing `ObjectService` / `View` state model. Follow the existing patterns: `useListener`, `view.publish`, `EditMode`, `ActionModal`, `PointEntryBox`, `IconButton`, `DropTarget` / `DragSource`.
- **Persistence:** server documents through `lib/server.tsx`, with the same auto-save-after-5-seconds behaviour the sheet uses, and the same owner / read-only handling. The mech document id goes in a new optional sheet field. Local file download / upload of a mech is nice to have, not required.
- **Theme:** the Lancer ruleset uses the `lancers` DaisyUI theme (dark, monospace, green/cyan). The slot-type colours must read on that theme and on light themes.
- **Upstream PR:** branch `feature/mechs` off `master`, no changes to deploy workflows. `.superpowers/` is git-ignored and must not be committed.
- **Testing:** there are no tests in the repo today. Mech rules logic must live in pure functions (no React) with Jest unit tests runnable through `npm test` (react-scripts). UI is verified by running the app.

## Decided rules (summary; the rules doc has the detail)

- **Chassis:** a list of sections, each with:
    - an id and name;
    - a hit range on the d12;
    - an ordered list of slot types;
    - an optional "provides" (speed, evasion);
    - "transfers to" (another section, "pilot", or none for the core);
    - a grid position for the layout;
    - plus Heat Max and a silhouette shape.
- **Hit numbering** runs left to right, bottom up (legs low, cockpit and shoulder high).
- **Slot types:** Armour (one per section, first, holds an armour stack), Hull (holds nothing, soaks a wound), Reactor, Weapon, Tech, Hand, and untyped.
    - A typed attachment fits only slots of its type.
    - A Generic attachment fits any slot except Armour and Hull.
    - Untyped slots take Generic attachments only.
    - Multi-slot attachments occupy consecutive slots in one section.
- **Attachments:** size, type, energy cost, heat (negative for cooling), ammo type, Repeating, range band (Short / Mid / Long / Melee), roll (aspect or attribute, skill, bonus), effect text, tags. Passive kinds: reactor (energy and heat per turn), cooling (−heat per turn), heat sink (+Heat Max), capacitor (stores energy), manipulator (provides Hand, and can punch), stowage rack (+3 stowage), ammo bin (type and capacity).
- **Ranges:** Short weapons use Reflex, Mid and Long use Precision. A target beyond the band is impossible; a target inside it costs −1 die per band closer. Melee needs a Short target.
- **Ammo:** Light 16 rounds ×1, Standard 8 ×2, Missile 5 ×3, Heavy 4 ×4. Cook-off is rounds left × multiplier in d4s, to that section, ignoring armour.
- **Damage:** armour points first, then slots top-down (the DM may place them), with empty and hull slots taking wounds too. An attachment is disabled when all its slots are wounded; a section is destroyed when all its slots are; overflow passes to the section it transfers to. Core destroyed means the mech is out of action. Cockpit destroyed means hits go to the pilot. Aimed shots cost (5 − range size, minimum 1) dice.
- **Turn:**
    - Start turn: refill energy from working reactors plus stored energy; clear "used"; reset to Sitting Duck.
    - Move is free. Sprint costs 2 energy and +2 heat, and gives Evasion.
    - Activations cost energy and heat.
    - Overheated (heat > Heat Max): every further action rolls (overage) d4 self-damage on the part that acted. The action that first crosses the line is free.
    - End turn: + reactor heat − cooling.
    - Shut down & purge (any time, ends the turn): no reactor heat, cooling applies, stunned until next turn.
- **Attacker modifiers:** Sitting Duck +2 dice, Sprinting −Evasion, shut down / stunned +1; they stack.

## Parts decided with the GM

- Pilot | Mech **tabs**, with the mech as its **own document**, both viewable and manageable from the pilot's sheet.
- Layout shaped like the mech, over a chassis silhouette; colour per slot type with a legend.
- Drag-and-drop loadout like the inventory.
- Track activations, with turn buttons.
- Hover popovers everywhere.
- A per-section Hit popup with a number box; ammo up/down by hand.
- Activation goes through a roll prompt, never resolved silently.
- Wounds, damage and ammo are manual by default, with automation as configurable settings.

## Left to the builder

- **Component breakdown and file layout.** Suggested: `lib/mechs.tsx` for pure logic; `components/mech/*` for the views; a mech type section in `lib/rules.tsx`; a ruleset data file.
- **How activation hands off to the roll flow.** For example, extend `RollInfo` / `RollCreateModal` with an optional cost line and an on-roll callback, or a mech-specific modal that reuses the dice rendering. Constraint: one modal per activation from the user's point of view, and costs are paid when the user confirms, not when the prompt opens.
- **Popover implementation.** DaisyUI tooltip, or a small custom popover component.
- **Silhouette drawing:** a simple inline SVG per shape (biped, tracked, plus a shoulder pod when present) is enough.
- **Where automation settings live.** On the mech document is suggested, so a mech plays the same for everyone viewing it.
- **Mech document versioning or migration,** if any.

## Decisions after design review

Answered by the GM:

- **New ruleset, "Scrap Lancer".**
    - It is added next to Lancer. Lancer itself is untouched, and so are its existing sheets.
    - Scrap Lancer uses the `lancers` theme, Lancer's skill list (with "Gunnary" spelled "Gunnery"), and the default Caltrops attributes and aspects (`useAspects: true`). Weapon rolls name real aspects: Reflex, Precision, Violence, Control, Wit.
    - Scrap Lancer has no "Lancer" equipment container or "Lancer" wound track. The pilot sheet keeps a Body wound track and personal equipment. Mech gear lives on the mech.
    - The later skill rework will edit this ruleset, so attachment rolls must reference skills by name from ruleset data, not hard-code them.
- **Players own their mechs.**
    - Ownership works exactly like sheets: the owner edits, everyone else sees it read-only. The GM opens a player's mech by link. Enemy mechs are mechs the GM owns.
    - No share-token UI. Whole-document auto-save (PUT) as for sheets.
- **Mechs can be used on their own.** This was already decided: "manageable independent of the main sheet".
    - The menu gains New and Load for mechs, and a `?mech=<id>` URL opens one directly.
    - A pilot sheet can assign a mech it can read. The picker lists the user's own mechs and also accepts a pasted mech id or link.
    - When a mech is open without a pilot, the roll prompt shows the breakdown with the pilot scores as editable numbers (default 0).

Calls made by Claude (change any of these freely):

- **Range-to-aspect mapping** lives in the ruleset's mech data. For Scrap Lancer: Short → Reflex, Mid and Long → Precision. An attachment can override it with its own aspect, as melee weapons do.
- **Skills used by attachment rolls:** guns roll Gunnery, melee rolls Melee, and the Sensor Array rolls Wit + Computing. Lancer has no "Tech" skill; the prototype's placeholder becomes Computing.
- **In v1:**
    - the stowage inventory: a Caltrops equipment container sized by working Stowage Racks, with items over capacity flagged when a rack is destroyed;
    - a "Repair & rearm" button that clears wounds and refills armour, ammo and charges after confirming;
    - a deflection input on the general take-hit control;
    - optional starting loadouts on a chassis, used when a new mech is created;
    - a log of this session's actions, not saved with the mech document.
- **Changing an existing mech's chassis** asks for confirmation and clears its loadout.
- **Effects stay as text in v1,** to be resolved at the table and not modelled in state: optional extra costs (e.g. "spend 2 extra energy for Powerful"), effects lasting until next turn (Field Generator), consecutive-turn bonuses (Rotary Saw), target locks, and field repair. The mech document should store per-attachment turn state in an open-ended way, so adding these later needs no migration.
- **The rules doc and the prototype together** are the full scope of rules that v1 models.
