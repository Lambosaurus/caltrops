# **Caltrops**

Caltrops is a rules-light TTRPG system.

It is provided without a [Setting](#settings).

Guiding principles:
 * Combat shouldn't be distinct from other forms of interaction. It should be fast to resolve, and not consume a disproportionate amount of game time.
 * Numbers should be small, or eliminated when possible. 
 * Wounds should feel meaningful, and are a gateway to roleplay.
 * There should be a minimal barrier for a DM to improvise content. Stat bocks not required.
 * Having social checks revolve around charisma is bad - this puts too much emphasis on one character.
 * Power creep is unnecessary, and makes the game difficult to balance.
 * D4's are pretty neat.


# **Character sheet**
# Level

Each level characters are given the following:
* `+1` to an [Aspect](#aspects) of their choice.
* `+3` [skill](#skills) points.

Theoretically a character starts at level `0` (no [Skill](#skills) or [Aspect](#aspects) scores, only [Attributes](#attributes)), however its encouraged to start characters at level `2` or more.

There is no maximum level.

> Caltrops provides no guidelines on when level-up's occurr. Its reccommended to provide them frequently, such as each time the players resolve a story arc.

# Attributes

A character has 4 attributes:
 * Strength
 * Dexterity
 * Intellect
 * Will

These are assigned at character creation - and shape the characters basic capability.

The attributes are assigned a number from `1` to `3`, and shall sum to `8`.

> The setting may decrease the attribute total to `7` for a bleaker experience.

# Aspects

Each [Attribute](#attributes) has 2 Aspects:

| Attribute | Aspect        |
| --------- | ------------- |
| Strength  | Violence      |
|           | Control       |
| Dexterity | Reflex        |
|           | Precision     |
| Intellect | Wit           |
|           | Knowledge     |
| Will      | Presence      |
|           | Focus         |

Each aspects initial score is equal to its corresponding Attribute.

You may increase an aspect by `1` each time you [level up](#level).

> Note that aspects are rougly broken down into a 'quick' and 'slow' component for each attribute. This can help you select the appropriate aspect for rolls.

# Skills

It is up to the [setting](#settings) to define the specific skills available to your characters.

You are assigned `3` skill points per level. These points can be used to increase your skill scores.

The cost to increase a skill score by `1` increases every `2` increases, but does not exceed `3`, as show below:

| Score | Total cost | Next point |
| -- | -- |  - |
|  0 |  0 |  1 |
|  1 |  1 |  1 |
|  2 |  2 |  2 |
|  3 |  4 |  2 |
|  4 |  6 |  3 |
|  5 |  9 |  3 |
|  6 | 12 |  3 |
|  7 | 15 |  3 |
|  8 | 18 |  3 |
|  9 | 21 |  3 |

> The setting will provide around 15 to 20 skills

# Equipment

// TODO

# Wounds

Players are given `5` wound slots.

When a wound is dealt, it occupies one or more wound slots, depending on the size of the wound.

| Description | Size |
| ----------- | ---- |
| Minor       | 1    |
| Major       | 2    |

Wound size is capped at `2`. Any additional wound size is truncated.

> Optionally, the wound size cap may be increased to 3: Mortal.

The wound should be recorded in the taken slots, along with a description.

> The setting may decrease the wound slots to `4` for a grittier game.

## Treating wounds

// TODO

# Powers

Powers are a special class of [skills](#skills). A skill corresponding to the power should be included in the skills table.

> For magic, consider making skills for each school, such as pyromancy, cryomancy, ect.

> Power skills should not be used in checks by those who do not have a score of at least `1`.

> It may be extremely advantageous for players to get a single point in multiple powers. Currently there is not mechanism to discourage this, except for the DM.

// TODO.
// Describe using powers.

# **Settings**

// TODO

# **Checks**

Throughout gameplay, most character interractions will be done using checks.

A check is made by rolling a number of D4's.

The number of D4's is the sum of an [Aspect](#aspects) score, a [Skill](#skills) score, and optionally a [Bonus](#bonuses).

A "success" is represented by a `4` on one of the D4's. The outcome of the roll will be determined by the DM based on the total number of successes. 

The required number of successes is set as either a [flat](#flat-checks) or [contested](#contested-checks) value.

In either case, the DM may choose to [convert failures into wounds](#converting-failures-to-wounds).

# Flat checks

Flat checks have a pre-determined threshold for success. The reccommended thresholds are shown below:

| Difficulty | Threshold |
| ---------- | --------- |
| Moderate   | 1         |
| Difficult  | 2         |
| Extreme    | 3         |

> Easy actions should not require a roll

> The majority of game interractions will be a moderate flat check.

The action succeeds if the roll meets or exceeds the threshold.

# Contested checks

Contested checks involve a player rolling against a [Foe](#foes). The DM will roll dice for the foe.

The side with the highest number of successes wins. Equal successes represents an impasse.

# Group checks

Groups checks are modifications to [flat](#flat-checks) or [contested](#contested-checks) checks, where multiple members are involved in either side.

Players may be assigned different skills, aspects or bonuses, depending on how they are contributing to the check.

The players sum their total successes.

In the case of a flat group check, the success threshold should be multiplied by the number of players.

> For example, an easy check with 3 players requires 3 total successes (on average 1 success each).

# Converting failures to wounds

In the case of a check failure, the DM may opt do deal a [Wound](#wounds) to the player.

The size of the wound increases for each missing success.

In the case of contested checks, extra successes will deal wounds to the [Foe](#foes).

> The DM should always use their judgement when converting failures into wounds. For example: a ranged attacker is unlikely to recieve damage for failing to hit his mark.

In the case of a group check, assign the wounds considering:
* The player targeted by the foes
* The player with the least number of successes

# Aspect and skill selection

The appropriate Skill and Aspect will be selected by the DM.

The Skill is typically straight forward - representing the task being solved.

The selected Aspect adds nuance to the way the character approaches a problem. The players are encouraged to describe their actions to influence the Aspect being selected by the DM.

> For example, a player may want to open a door:
>
> If they describe attempting to barge through, they should roll `Athletics + Violence`.
>
> If instead they describe trying to lever it open, they should roll `Athletics + Control`

> Players are incentivised to describe their approach in a way that causes their strongest Aspects to be selected. This is considered a feature.

> You may allow the players to suggest the skill or aspect they want to use. This can alleviate the pressure off the DM. Beware - players will tend to prefer their better stats even when not appropriate for the situation.

# Bonuses

A bonus may be assigned by the DM to reward the players for advantages gained by novel or tactical gameplay. The bonus may also be negative for disadvantages.

Normally `+1` dice should be applied for each advantage.

The following concepts should frequently be considered:
 * Weapon advantages - such as a spear against a charging foe, or concecrated weapon against undead.
 * Tactical advantages - such as high ground or crossfire.
 * Morale advantages - such as the element of suprise.
 * Help - another player may help a player in a check. They must first describe a practical manner in which they can help.

> The total bonuses added by the DM should rarely exceed `+3`

# Repeating rolls

Outside of [combat](#combat), checks should never be repeated by players.

> Having multiple players attempt the same check creates a disproportionate chance of success, and enables them to brute force problems.

> Failure does not represent a momentary failure, but rather the players incapability of overcoming the problem.

Once an attempt has been made to overcome an obstacle, there shall be no more attempts, even by other party members.

To make a new attempt, they players should come up with a new approach, such as breaking down a door after failing to pick the lock.

> As an optional rule: the DM may allow players to reroll checks - but they take exhaustion as a [Wound](#wounds) whether they succeed of fail.

> Note: Because failure is common, it is very easy for players to fail important checks - disrupting the flow of the session. A failed roll may mean that the players succeed their goal, but have negative side effects, such as taking a [Wound](#wounds) instead.

## Retries with bonuses:
Players may fail a check, and afterwards come up with several methods with which to improve their odds via [Bonuses](#bonuses).

The DM **may** allow them to roll the newly gained bonus dice. They should not reroll the entire dice pool.

# **Combat**

Combat is handled in successive rounds where, where in each round, players act simultaneously.

A round consists of the following steps:
1. The DM describes the situation, including the apparent actions of any [Foes](#foes).
2. The players may deliberate on their actions.
3. The players describe their actions to the DM.
4. The DM breaks the combat into indivisible [combat groups](#combat-groups)
5. Each [combat group](#combat-groups) is individually resolved as a [contested](#contested-checks) [group](#group-checks) check.

> In most cases, a round of combat is resolved by [dealing wounds](#converting-failures-to-wounds).

## Combat groups

Players and foes that are interracting in combat should be subdivided into the smallest possible groups. Units that are interracting must be in the same group.

> For example, consider the following scenario:
> * Foe[1] attacks Player[1]
> * Foe[2] attacks Player[2]
> * Foe[3] attacks Player[2]
>
> The groups are:
> * Foe[1] vs Player[1]
> * Foe[2] + Foe[3] vs Player[2]

## Overwhelming force

If a player wields overwhelming force (such as pushing a rock onto foes, using explosives, or magic), then they can be rewarded by allowing a [foe](#foes) to be killed with a single success, bypassing the foes roll.

> This is effectively converting the check into an easy flat check.

If the player fails, the foes roll should still be considered.

## Uncontested attacks

If a player (or foe) is the target of attacks, but cannot use their action to evade or mitigate the attack, then the attack is uncontested.

In this event, the [contested check](#contested-checks) still proceeds, but the target does not roll - their score is automatically `0`.

> This is effectively converting the check into an easy flat check.

# **Foes**

Foes do not require complex stat blocks - merely a [strength value](#foe-strength) and [wound count](#foe-strength).

## Foe Strength
The strength value is the number of dice they roll in [combat](#combat).

> In combat, their dice may be modified with [Bonuses](#bonuses) by the DM.
>
> The DM should prefer to modify the players dice rather than the foes, as this provides clear feedback to the players.

Reference strength values are listed below:

| Strength | Difficulty  |
| -------- | ----------- |
| 1        | Swarm critter |
| 3        | Easy        |
| 5        | Moderate    |
| 8        | Difficult   |

> Consider that most players will contriute ~5 dice to a contested check at low levels.

> Because combat is broken into [combat groups](#combat-groups), is is trivial to run swarm enemies. Allow excess wounds to kill multiple foes in the swarm.

## Foe wounds

Most foes should be given `1` [wound slot](#wounds), and die upon taking a single wound.

Large or important creatures may be given multiple wounds.

# Pause

// TODO