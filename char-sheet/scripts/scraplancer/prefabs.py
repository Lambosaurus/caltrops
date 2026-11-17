"""Test-run prefabs for the Scrap Lancer ruleset: checks each fits, prints its numbers, writes src/data/scraplancerPrefabs.tsx.

Run from char-sheet/ after gen.py:  python scripts/scraplancer/prefabs.py
Each loadout is section id -> (armour, [(part, first slot index), ...]); slot indices count Hull slots.
"""
import json
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(HERE, '..', '..', 'src', 'data', 'scraplancerCatalogue.tsx'), encoding='utf-8').read()
OUT = os.path.join(HERE, '..', '..', 'src', 'data', 'scraplancerPrefabs.tsx')


def block(name):
    return json.loads(re.search(r'export const ' + name + r': [^=]+= (.*?)\n(?=export|\Z)', SRC, re.S).group(1))


CHASSIS = {c['name']: c for c in block('CHASSIS')}
PARTS = {a['name']: a for a in block('ATTACHMENTS')}

P2, C3 = 'AWP Plate P2', 'AWP Composite C3'

PREFABS = [
    ('Kettle', 'KR Tinpot R0', 'The Parts tab\'s junk-mech example: one Smokestack, one Nailer, a heat bank of 5. Potters about and picks its moments.', {
        'lleg': ('KR Scrap Plate SP1', [('CWF Fin-1', 1)]),
        'rleg': ('KR Scrap Plate SP1', [('Ammo Bin: Light', 1)]),
        'core': ('KR Scrap Plate SP1', [('KR Smokestack G2', 0), ('CWF Array RA3', 1)]),
        'rarm': ('KR Scrap Plate SP1', [('OHS Grab Claw GC1', 0), ('KR Nailer N1', 1)]),
        'cockpit': ('KR Scrap Plate SP1', []),
    }),
    ('Junkyard Dog', 'KR Rattler R1', 'Scrap brawler: a chainblade, a claw and one machine gun on fins alone. Gains heat every turn it idles.', {
        'lleg': ('KR Scrap Plate SP1', [('CWF Fin-1', 1)]),
        'rleg': ('KR Scrap Plate SP1', [('CWF Fin-1', 1)]),
        'larm': ('KR Scrap Plate SP1', [('KR Chainblade CB1', 0), ('BRO M8', 1)]),
        'core': ('KR Scrap Plate SP2', [('KR Smokestack G4', 0), ('CWF Fin-1', 2)]),
        'rarm': ('KR Scrap Plate SP1', [('OHS Grab Claw GC1', 0), ('Ammo Bin: Light', 1)]),
        'cockpit': ('KR Scrap Plate SP1', []),
    }),
    ('Scrapheap', 'KR Hulk R3', 'A rebuilt Mule on a Volatile fission pile, with a rebuilt autocannon and a firehose. Do not get the core shot.', {
        'lleg': ('KR Scrap Plate SP1', [('Ammo Bin: Standard', 1)]),
        'rleg': ('KR Scrap Plate SP1', [('CWF Fin-1', 1)]),
        'larm': ('KR Scrap Plate SP1', [('OHS Breaker BH3', 0), ('KR Firehose FH1', 1)]),
        'core': ('KR Scrap Plate SP2', [('KR Hotpile F6', 2), ('CWF Array RA3', 4)]),
        'rarm': ('KR Scrap Plate SP1', [('KR AC-30R', 1)]),
        'cockpit': ('KR Scrap Plate SP1', []),
    }),
    ('Packhorse', 'OHS Ox Mk III', 'Salvage hauler: cargo pod, winch, a hand and one autocannon. Cannot dodge.', {
        'rlleg': (P2, [('Ammo Bin: Standard', 1)]), 'rrleg': (P2, [('CWF Fin-2', 1)]),
        'flleg': (P2, [('CWF Fin-2', 1)]), 'frleg': (P2, [('CWF Fin-2', 1)]),
        'core': (C3, [('HRW Dipole D5', 2), ('HTC Halcyon HX-2', 4), ('OHS Cargo Pod P7', 5)]),
        'rarm': (P2, [('OHS Manipulator MH1', 1), ('BRO AC-20', 2), ('OHS Winch W2', 3)]),
        'cockpit': (P2, [('SBL Rangefinder RF1', 1)]),
    }),
    ('Hauler', 'OHS Mastodon Mk I', 'Mining crawler on a Volatile Hotpile: drill, flamer, crane and a 12-slot cargo pod in the treads.', {
        'treads': (P2, [('OHS Cargo Pod P12', 3)]),
        'core': (C3, [('KR Hotpile F9', 3), ('HTC Halcyon HX-2', 6), ('CWF Array RA3', 7), ('CWF Fin-1', 9)]),
        'larm': (P2, [('OHS Rock Drill RD2', 1), ('OHS Burnoff BF1', 2)]),
        'rarm': (P2, [('OHS Manipulator MH1', 1), ('OHS Rack R3', 2)]),
        'cockpit': (P2, [('HTC Halcyon HX-2', 1)]),
    }),
    ('Workhorse', 'OHS Mule Mk II', 'The Rules tab worked example: autocannon, machine gun, breaker, SRMs and jump jets. Fights flat out for about one turn.', {
        'lleg': (P2, [('MAS Jump Jets JJ2', 1), ('HTC Halcyon HS-2', 2)]),
        'rleg': (P2, [('OHS Rack R3', 1), ('CWF Fin-1', 2)]),
        'larm': (P2, [('OHS Manipulator MH1', 0), ('BRO AC-30', 1)]),
        'core': (C3, [('HRW Dipole D6', 1), ('HTC Halcyon HX-3', 3), ('Ammo Bin: Light', 4), ('Ammo Bin: Standard', 5)]),
        'rarm': (P2, [('OHS Breaker BH3', 0), ('BRO M12', 1)]),
        'cockpit': (P2, [('SBL Sensor SA1', 1)]),
        'shoulder': (P2, [('CMS SRM-2', 0), ('Ammo Bin: Missile', 1)]),
    }),
    ('Scout', 'MAS Jackal J-7', 'Fast Salvage scout: a laser and a light autocannon. Sprints for Evasion and runs hot when it shoots.', {
        'lleg': (P2, [('CWF Fin-2', 1)]),
        'rleg': (P2, [('Ammo Bin: Standard', 1)]),
        'larm': (P2, [('OHS Manipulator MH1', 0), ('BRO AC-15', 1)]),
        'core': (P2, [('HRW Dipole D5', 1), ('CWF Fin-2', 3)]),
        'rarm': (P2, [('LDE LZ-2', 0)]),
        'cockpit': (P2, [('HTC Halcyon HX-2', 1)]),
    }),
    ('Spotter', 'HCA Picket Block 1', 'Militia lock-and-launch: a sensor, a rangefinder and an LRM rack for indirect fire on locked targets.', {
        'lleg': (P2, [('Ammo Bin: Light', 1)]),
        'rleg': (P2, [('Ammo Bin: Missile', 1)]),
        'larm': (P2, [('OHS Manipulator MH1', 0), ('BRO M12', 1)]),
        'core': (C3, [('HRW Dipole D6', 1), ('HTC Halcyon HX-3', 3)]),
        'rarm': (P2, [('CMS LRM-3', 0)]),
        'cockpit': (P2, [('SBL Sensor SA1', 0), ('SBL Rangefinder RF1', 1)]),
    }),
    ('Militia Line', 'HCA Warden Block 2', 'The colony baseline: an AC-30 and an HC-40 in one shot, an exchanger and fins, nothing fancy.', {
        'lleg': (P2, [('Ammo Bin: Heavy', 1), ('HTC Halcyon HS-2', 2)]),
        'rleg': (P2, [('CWF Array RA4', 1)]),
        'larm': (P2, [('OHS Manipulator MH3', 0), ('BRO AC-30', 1)]),
        'core': (C3, [('HRW Dipole D6', 1), ('HTC Halcyon HX-3', 3), ('CWF Fin-2', 4), ('Ammo Bin: Standard', 5)]),
        'rarm': (P2, [('BRO HC-40', 1)]),
        'cockpit': (P2, [('SBL Sensor SA1', 1)]),
    }),
    ('Gun Tank', 'HCA Bulwark Block 4', 'Heavy tracked gun platform: HC-40, AC-30 and a laser in one shot, cooled by three exchangers and a radiator.', {
        'treads': (C3, [('CWF Array RA3', 2), ('HTC Halcyon HS-2', 4)]),
        'larm': (C3, [('BRO HC-40', 1)]),
        'core': (C3, [('HRW Arc-point A9', 2), ('Ammo Bin: Heavy', 5), ('Ammo Bin: Heavy', 6), ('Ammo Bin: Standard', 7), ('CWF Fin-2', 8)]),
        'rarm': (C3, [('BRO AC-30', 1), ('LDE LZ-1', 3)]),
        'cockpit': (C3, [('HTC Halcyon HX-3', 1), ('HTC Halcyon HX-3', 2)]),
    }),
    ('Siege Gun', 'HCA Rampart Block 6', 'Built to carry a Brannoc HC-60. Runs hot: a few big shots, then it must cool.', {
        'lleg': (P2, [('CWF Fin-2', 2)]),
        'rleg': (P2, [('Ammo Bin: Standard', 2)]),
        'core': (C3, [('HRW Arc-point A9', 1), ('HTC Halcyon HX-3', 4), ('HTC Halcyon HX-3', 5), ('Ammo Bin: Heavy', 6), ('Ammo Bin: Heavy', 7)]),
        'rarm': (C3, [('BRO HC-60', 1)]),
        'larm': (P2, [('OHS Manipulator MH3', 1), ('BRO AC-30', 2)]),
        'cockpit': (P2, [('SBL Sensor SA1', 1)]),
    }),
    ('Skirmisher', 'MAS Kestrel K-12', 'Military skirmisher: laser, pulse laser and an anti-armour Dart, with fire control and evasion jets.', {
        'lleg': ('AWP Lightweave LW4', [('MAS Flicker FL1', 1), ('Ammo Bin: Missile', 2)]),
        'rleg': ('AWP Lightweave LW4', [('MAS Vector VT2', 1), ('CWF Fin-2', 2)]),
        'larm': ('AWP Lightweave LW4', [('LDE LZ-4', 0)]),
        'core': ('AWP Laminate L4', [('HRW Flash F7', 1), ('HTC Halcyon CX-4', 3), ('HTC Halcyon GS-3', 4)]),
        'rarm': ('AWP Lightweave LW4', [('LDE Pulse PL2', 0), ('CMS Dart DT2', 1)]),
        'cockpit': ('AWP Lightweave LW4', [('SBL Sensor SA2', 1), ('SBL Fire Control FC1', 2)]),
    }),
    ('Jumper', 'MAS Harrier H-3', 'Jump-and-shoot: hop on the light jets and fire the Twin AC-33 and AC-30; the heavy jets are for getting out.', {
        'lleg': ('AWP Lightweave LW4', [('MAS Heavy Jets JJ6', 1)]),
        'rleg': ('AWP Lightweave LW4', [('MAS Jump Jets JJ3', 1), ('Ammo Bin: Standard', 2)]),
        'larm': ('AWP Lightweave LW4', [('VCC Shear SB3', 1), ('BRO AC-30', 2)]),
        'core': ('AWP Laminate L4', [('HRW Flash F7', 1), ('HTC Halcyon CX-4', 3), ('HTC Halcyon GS-3', 4), ('Ammo Bin: Standard', 5)]),
        'rarm': ('AWP Lightweave LW4', [('BRO Twin AC-33', 1)]),
        'cockpit': ('AWP Lightweave LW4', [('SBL Sensor SA2', 1)]),
    }),
    ('Main Battle', 'VDG Halberd VX-6', 'Vantor line frame: HC-45 and AC-35M at Long range, fire control and a deep heat bank.', {
        'lleg': ('AWP Laminate L4', [('HTC Halcyon HS-5', 1)]),
        'rleg': ('AWP Laminate L4', [('HTC Halcyon GS-3', 1), ('Ammo Bin: Heavy', 2)]),
        'larm': ('AWP Laminate L4', [('OHS Manipulator MH3', 1), ('BRO AC-35M', 2)]),
        'core': ('AWP Laminate L5', [('HRW Flash F7', 1), ('HTC Halcyon CX-5', 3), ('HTC Halcyon CX-5', 4), ('Ammo Bin: Standard', 5), ('Ammo Bin: Heavy', 6)]),
        'rarm': ('AWP Laminate L4', [('BRO HC-45', 1)]),
        'cockpit': ('AWP Laminate L4', [('SBL Fire Control FC1', 1)]),
    }),
    ('Missile Wall', 'VDG Monolith VX-9', 'Siege frame on a Twin-core TC13: LRM-5 and Swarm racks plus a coil gun. Lock first, then bury the target.', {
        'lleg': ('AWP Laminate L4', [('CWF Array RA4', 2)]),
        'rleg': ('AWP Laminate L4', [('Ammo Bin: Slug', 2), ('HTC Halcyon HS-2', 3)]),
        'larm': ('AWP Laminate L4', [('CMS LRM-5', 1)]),
        'core': ('AWP Laminate L5', [('HRW Twin-core TC13', 2), ('HTC Halcyon CX-5', 5), ('HTC Halcyon CX-5', 6), ('Ammo Bin: Missile', 7), ('Ammo Bin: Missile', 8)]),
        'rarm': ('AWP Laminate L4', [('OHS Manipulator MH3', 1), ('ARH Coil C3', 2)]),
        'lshoulder': ('AWP Laminate L4', [('CMS Swarm SW3', 1), ('Ammo Bin: Missile', 3)]),
        'cockpit': ('AWP Laminate L4', [('SBL Sensor SA2', 2)]),
    }),
    ('Fortress', 'VDG Bastion VX-12', 'The Parts tab\'s super-heavy example: Thunderer 120, Twin AC-33, AC-30 and AC-20 in one Precision + Gunnery shot.', {
        'ltread': ('AWP Laminate L5', [('CWF Array RA4', 2)]),
        'rtread': ('AWP Laminate L5', [('CWF Array RA4', 2)]),
        'core': ('AWP Laminate L5', [('HRW Twin-core TC16', 2), ('HTC Halcyon CX-5', 6), ('HTC Halcyon CX-5', 7), ('HTC Halcyon CX-5', 8), ('Ammo Bin: Heavy', 9), ('Ammo Bin: Standard', 10)]),
        'gun': ('AWP Laminate L5', [('ARH Thunderer 120', 1), ('BRO AC-20', 5)]),
        'larm': ('AWP Laminate L4', [('BRO Twin AC-33', 1)]),
        'rarm': ('AWP Laminate L4', [('OHS Manipulator MH3', 1), ('BRO AC-30', 2), ('Ammo Bin: Standard', 4)]),
        'cockpit': ('AWP Laminate L4', [('SBL Fire Control FC1', 2)]),
    }),
    ('Hedge', 'GWC Thornback Pattern 3', 'Naturalist militia: an Arc Lance to switch Elite frames off, a flamer, a repair arm and a quench tank.', {
        'lleg': (P2, [('GWC Quench Pattern 2', 2)]),
        'rleg': (P2, [('HTC Halcyon HS-2', 2)]),
        'larm': (P2, [('GWC Repair Arm Pattern 1', 1), ('OHS Burnoff BF2', 2)]),
        'core': (C3, [('HRW Dipole D6', 3), ('HTC Halcyon HX-3', 5), ('GWC Radiator Pattern 5', 6)]),
        'rarm': (P2, [('SGW Arc Lance Pattern 2', 1)]),
        'cockpit': (P2, []),
    }),
    ('Brawler', 'GWC Ironbark Pattern 5', 'Two-handed Greenward brawler: piledriver and shear up close, ion disruptor and napalm on the way in.', {
        'lleg': ('AWP Laminate L4', [('Ammo Bin: Fuel', 2), ('MAS Jump Jets JJ3', 3)]),
        'rleg': ('AWP Laminate L4', [('HTC Halcyon HS-5', 2)]),
        'larm': ('AWP Laminate L4', [('VCC Piledriver PV3', 2), ('SGW Ion Disruptor Pattern 3', 3)]),
        'core': ('AWP Laminate L5', [('GWC Kiln Pattern 8', 3), ('HTC Halcyon CX-4', 6), ('GWC Radiator Pattern 5', 7)]),
        'rarm': ('AWP Laminate L4', [('VCC Shear SB3', 2), ('HPY Napalm NP2', 3)]),
        'cockpit': ('AWP Laminate L4', [('SBL Sensor SA2', 2)]),
    }),
    ('Ghost', 'CLF Wraith S9', 'Elite recon and EW: veil, AI core and Focus lasers on a Torus. Two Hull: most wounds cost a part.', {
        'lleg': ('AWP Weave W5', [('MAS Flicker FL1', 1), ('MAS Vector VT2', 2)]),
        'rleg': ('AWP Weave W5', [('HTC Phase P3', 1), ('HTC Halcyon GS-3', 2)]),
        'larm': ('AWP Weave W5', [('VCC Edge E2', 0), ('LDE Focus F2', 1)]),
        'core': ('AWP Weave W7', [('AZP Torus T10', 0), ('HTC Phonon P6', 2), ('CLF Veil V1', 3), ('CLF Mind M2', 4)]),
        'rarm': ('AWP Weave W5', [('LDE Focus F4', 0)]),
        'cockpit': ('AWP Weave W5', [('SBL Fire Control FC2', 0), ('HTC Phonon P6', 1)]),
    }),
    ('Command', 'CLF Paragon S11', 'Elite command frame: Rail R4 and two Focus lasers, a Mind M3 core and heavy jets. The top of the scale.', {
        'lleg': ('AWP Weave W5', [('MAS Heavy Jets JJ6', 1)]),
        'rleg': ('AWP Weave W5', [('Ammo Bin: Slug', 1), ('HTC Phase P5', 2)]),
        'larm': ('AWP Weave W5', [('VCC Edge E4', 1), ('ARH Rail R4', 2)]),
        'core': ('AWP Weave W7', [('AZP Lattice Z14', 1), ('HTC Phonon P6', 4), ('HTC Phonon P6', 5), ('Ammo Bin: Slug', 6)]),
        'rarm': ('AWP Weave W5', [('OHS Manipulator MH3', 1), ('LDE Focus F4', 2), ('LDE Focus F2', 4)]),
        'cockpit': ('AWP Weave W5', [('CLF Mind M3', 1)]),
    }),
]

# Each prefab's signature turn: what it is built to do every turn of hard fighting ('Sprint' costs the chassis size).
SIGNATURE = {
    'Kettle': ['KR Nailer N1', 'KR Nailer N1'],
    'Junkyard Dog': ['KR Chainblade CB1', 'BRO M8'],
    'Scrapheap': ['KR AC-30R', 'OHS Breaker BH3'],
    'Packhorse': ['BRO AC-20', 'OHS Winch W2'],
    'Hauler': ['OHS Rock Drill RD2', 'OHS Burnoff BF1'],
    'Workhorse': ['BRO AC-30', 'BRO M12', 'MAS Jump Jets JJ2'],
    'Scout': ['Sprint', 'BRO AC-15', 'BRO AC-15'],
    'Spotter': ['SBL Sensor SA1', 'CMS LRM-3', 'CMS LRM-3', 'CMS LRM-3'],
    'Militia Line': ['BRO AC-30', 'BRO HC-40'],
    'Gun Tank': ['BRO HC-40', 'BRO AC-30', 'LDE LZ-1'],
    'Siege Gun': ['BRO HC-60', 'BRO AC-30'],
    'Skirmisher': ['LDE LZ-4', 'LDE Pulse PL2', 'MAS Flicker FL1'],
    'Jumper': ['MAS Jump Jets JJ3', 'BRO Twin AC-33', 'BRO AC-30'],
    'Main Battle': ['BRO HC-45', 'BRO AC-35M'],
    'Missile Wall': ['SBL Sensor SA2', 'CMS LRM-5', 'CMS LRM-5', 'CMS LRM-5', 'CMS LRM-5', 'CMS LRM-5', 'ARH Coil C3'],
    'Fortress': ['ARH Thunderer 120', 'BRO Twin AC-33', 'BRO AC-30', 'BRO AC-20'],
    'Hedge': ['SGW Arc Lance Pattern 2', 'OHS Burnoff BF2'],
    'Brawler': ['MAS Jump Jets JJ3', 'VCC Piledriver PV3', 'VCC Shear SB3'],
    'Ghost': ['CLF Veil V1', 'LDE Focus F4', 'LDE Focus F2', 'MAS Flicker FL1'],
    'Command': ['ARH Rail R4', 'LDE Focus F4', 'CLF Mind M3', 'LDE Focus F2'],
}


def first_overheat(E, net, heat_max, acts, turns=4):
    """Turn (1-based) in which repeating `acts` [(energy, heat)] each turn first takes heat over Max, or None."""
    h = 0
    for t in range(1, turns + 1):
        e = E
        for en, ht in acts:
            if en <= e:
                e -= en
                h = max(0, h + ht)
        if h > heat_max:
            return t
        h = max(0, h + net)
    return None


def balance(name, c, parts, E, net, heat_max):
    """Signature turn affordable; it overheats no sooner than turn 2 (Military/Elite: turn 3). Using everything,
    including a sprint, may overheat Scrap-Standard mechs in turn 1, but not Military/Elite ones."""
    cost = lambda n: (c['size'], c['size']) if n == 'Sprint' else (PARTS[n].get('energy') or 0, PARTS[n].get('heat') or 0)
    sig = [cost(n) for n in SIGNATURE[name]]
    high = c['tier'] in ('Military', 'Elite')
    errs = []
    if sum(e for e, _ in sig) > E:
        errs.append(f'{name}: signature turn needs {sum(e for e, _ in sig)} energy, has {E}')
    t = first_overheat(E, net, heat_max, sig)
    if t is not None and t < (3 if high else 2):
        errs.append(f'{name}: signature turn overheats in turn {t}')
    every = list(sig)
    left = {}
    for n in SIGNATURE[name]:
        left[n] = left.get(n, 0) + 1
    for p in parts:
        if p.get('energy') is None or p.get('charges') or (p.get('heat') or 0) < 0:
            continue
        every += [cost(p['name'])] * max(0, p.get('repeat', 1) - left.get(p['name'], 0))
    every.append(cost('Sprint'))
    t_all = first_overheat(E, net, heat_max, every)
    if high and t_all == 1:
        errs.append(f'{name}: using everything overheats in turn 1')
    return errs, t, t_all


def fits(slot, typ):
    if slot in ('Hull', 'Armour'):
        return False
    return typ == 'Generic' or slot == typ


errors = []
rows = []
for name, chassis, desc, lo in PREFABS:
    c = CHASSIS[chassis]
    secs = {s['id']: s for s in c['sections']}
    assert set(lo) == set(secs), (name, set(secs) ^ set(lo))
    E = upkeep = rh = cool = hm = 0
    price = c['price']
    shot = shot_e = shot_h = 0
    ammo_need, bins = set(), set()
    heavy = 0
    fitted = []
    for sid, (armour, mounts) in lo.items():
        a = PARTS[armour]
        assert a['type'] == 'Armour', armour
        price += a['price']
        heavy += a.get('heavy', 0)
        used = set()
        for part, start in mounts:
            p = PARTS[part]
            fitted.append(p)
            size = p.get('size', 1)
            for i in range(start, start + size):
                if i >= len(secs[sid]['slots']) or not fits(secs[sid]['slots'][i], p['type']) or i in used:
                    errors.append(f'{name}: {part} does not fit {sid} slot {i}')
                used.add(i)
            price += p.get('price') or 0
            heavy += p.get('heavy', 0)
            if p.get('reactor'):
                E += p['reactor']['energy']
                rh += p['reactor']['heat']
            cool += p.get('cooling', 0)
            upkeep += p.get('upkeep', 0)
            hm += p.get('heatSink', 0)
            if p.get('bin'):
                bins.add(p['bin'])
            if p.get('ammo'):
                ammo_need.add(p['ammo'])
            if p.get('range') and p.get('range') != 'Melee' and p.get('roll'):
                n = p.get('repeat', 1)
                shot += p['roll']['bonus'] * n
                shot_e += p['energy'] * n
                shot_h += p['heat'] * n
    errs, t_sig, t_all = balance(name, c, fitted, E - upkeep, rh - cool, c['heatMax'] + hm)
    errors += errs
    if ammo_need - bins:
        errors.append(f'{name}: no bin for {ammo_need - bins}')
    rows.append(f"{name:13} {chassis:24} E {E - upkeep:2} (react {E}, upkeep {upkeep})  heat +{rh} -{cool} = {rh - cool:+d}/turn  "
                f"HeatMax {c['heatMax'] + hm:2}  overheats: signature t{t_sig or '-'}, everything t{t_all or '-'}  full shot +{shot} for {shot_e}E {shot_h}H  speed -{heavy}  price {price:,}")

print('\n'.join(rows))
if errors:
    raise SystemExit('\n'.join(errors))

out = [{'name': n, 'chassis': ch, 'description': d,
        'loadout': {sid: {'armour': a, 'mounts': [[p, s] for p, s in m]} for sid, (a, m) in lo.items()}}
       for n, ch, d, lo in PREFABS]
with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// GENERATED by scripts/scraplancer/prefabs.py. Edit the prefabs there and re-run it.\n')
    f.write("import type { MechPrefab } from '../lib/mech/types'\n\n")
    f.write('export const PREFABS: MechPrefab[] = ' + json.dumps(out, ensure_ascii=False, indent=1) + '\n')
print(len(out), 'prefabs written')
