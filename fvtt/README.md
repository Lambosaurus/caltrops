# FVTT Caltrops

This module provides caltrops integration between foundry VTT and the caltrops character sheet.

# Usage

Simply locate the new triangle icon on the chat controls, and click it. This will open a connected caltrops instance.

The caltrops character sheet can now forward dice rolls to foundry. The character sheet is intended to be run side-by-side with foundry.

# Token conditions

The module adds Scrap Lancer conditions to the token HUD, after Foundry's own: Dodge, Target lock, Sitting Duck, Stunned, Shut down, Overheated, Out of action, Suppressed, Staggered, Grappled, In smoke, Jamming, Spoofing, Cloaked, Deflection, Point-defence and Grounding. Dodge tokens are counted with a status-counter module.

To add one, put a white-on-transparent SVG in `icons/` and add a line to `CALTROPS_CONDITIONS` in `scripts/main.js`.

## Icon credits

Icons from [game-icons.net](https://game-icons.net), licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), with the black background removed:

| Condition | Icon | Author |
|---|---|---|
| Dodge | Dodging | Lorc |
| Target lock | Convergence target | Delapouite |
| Sitting Duck | Duck | Delapouite |
| Stunned | Knocked out stars | Delapouite |
| Shut down | Power button | Lord Berandas |
| Overheated | Thermometer hot | Delapouite |
| Out of action | Broken skull | Lorc |
| Suppressed | Bullets | Lorc |
| Staggered | Unbalanced | Delapouite |
| Grappled | Grab | Lorc |
| In smoke | Smoke bomb | Darkzaitzev |
| Jamming | Static waves | Lorc |
| Spoofing | Mirror mirror | Lorc |
| Cloaked | Cloak | Lucasms |
| Deflection | Shield reflect | Lorc |
| Point-defence | Energy shield | Lorc |
| Grounding | Electrical crescent | Lorc |

# Installation

The manifest URL for foundry installation is:
```
https://github.com/Lambosaurus/caltrops/releases/download/fvtt-latest/module.json
```

## Manual installation

If manual install is required, download the [fvtt-caltrops.zip](https://github.com/Lambosaurus/caltrops/releases/download/fvtt-latest/fvtt-caltrops.zip). This should be unzipped into your foundry modules directory.

> Ie, the module.json will be located at `/data/modules/fvtt-caltrops/module.json`

## Foundry Version

Foundry support it not well known, and has only been tested on `v10+`. It *may* work on `v9`.

# Development

## Communications

Foundry and Caltrops communicate using the window.postMessage API. This enables cross site communications. The key requirement to enable this is that the caltrops window must be opened via foundry.

## Deployment

On push to the `deploy/fvtt` branch, module source is zipped and uploaded to the tag `fvtt-latest`.

This is the permanent home of the fvtt module, and serves as a download source.