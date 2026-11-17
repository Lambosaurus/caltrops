"""Builds src/data/scraplancerCatalogue.tsx from the Scrap Lancer rules, kept as Markdown in docs/scrap-lancer/.

Inputs (snapshots of the Claude Doc "Scrap Lancer Mech Rules (Draft)"; edit them or re-export the doc to resync):
  parts.md      the Parts tab: one table per family under a '### Family' heading
  catalogue.md  the Catalogue tab: chassis overview, chassis layouts, tag table, ammo table
  rules.md      the Rules tab: core tags, the three starter chassis

Run from char-sheet/:  python scripts/scraplancer/gen.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'src', 'data', 'scraplancerCatalogue.tsx')

def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


DOCS = os.path.join(HERE, '..', '..', '..', 'docs', 'scrap-lancer')
SEP = re.compile(r'^\|[\s:|-]+\|$')  # Markdown table separator rows carry no data


def read_md(name):
    text = open(os.path.join(DOCS, name), encoding='utf-8').read()
    return [l for l in text.splitlines() if not SEP.match(l.strip())]


CAT = read_md('catalogue.md')
RULES = read_md('rules.md')


def md_tables(lines):
    """[{heading, rows}] for each table, headed by the nearest '###' heading above it; the first row is the header."""
    tables, heading, cur = [], '', None
    for l in lines:
        if l.startswith('|'):
            if cur is None:
                cur = {'heading': heading, 'rows': []}
                tables.append(cur)
            cur['rows'].append(cells(l))
            continue
        cur = None
        m = re.match(r'#{2,3} (.+)', l)
        if m:
            heading = m.group(1).strip()
    return tables

DASH = ('—', '-', '', '–')


def num(s):
    s = s.replace('−', '-').replace(',', '').replace('+', '').strip()
    m = re.search(r'-?\d+', s)
    return int(m.group()) if m else None


def tag_num(tags, name):
    m = re.search(re.escape(name) + r' \((\d+)', tags)
    return int(m.group(1)) if m else None


def has_tag(tags, name):
    return any(t.strip().split(' (')[0] == name for t in tags.split(','))


def parse_roll(s):
    """'Gunnery +5', 'Violence + Melee +2', 'Wit + Computing −1', 'Knowledge + Repair +0'."""
    if not s or s in DASH:
        return None
    s = s.replace('−', '-')
    d = re.match(r'(\w+) \+ (\w+) \+ Evasion$', s.strip())
    if d:  # the dodge roll: aspect + skill + the mech's Evasion
        return {'skill': d.group(2), 'bonus': 0, 'aspect': d.group(1), 'evasion': True}
    m = re.match(r'(?:(\w+) \+ )?(\w+) ([+-]\d+)$', s.strip())
    if not m:
        raise ValueError('roll ' + s)
    aspect, skill, bonus = m.group(1), m.group(2), int(m.group(3))
    r = {'skill': skill, 'bonus': bonus}
    if aspect:
        r['aspect'] = aspect
    return r


GUN_AMMO = {'Machine guns': 'Light', 'Autocannons': 'Standard', 'Cannons': 'Heavy',
            'Mortars and artillery': 'Heavy', 'Mass drivers': 'Slug'}
MELEE = {'Claws and hands', 'Blades and saws', 'Hammers and drivers'}
WEAPONS = set(GUN_AMMO) | MELEE | {'Lasers', 'Plasma', 'EM weapons', 'Flamers', 'Rockets and missiles'}
GROUPS = {  # table heading -> catalogue group
    'Reactors': 'Power', 'Capacitors': 'Power',
    'Passive cooling': 'Cooling', 'Heat sinks': 'Cooling', 'Active cooling': 'Cooling',
    'Hauling and movement': 'Utility', 'Sensors and targeting': 'Utility',
    'Smoke, electronic warfare and repair': 'Utility', 'Defence': 'Defence', 'Armour': 'Armour',
}


def part(heading, d):
    tags = d.get('Tags', '')
    tags = '' if tags in DASH else tags
    a = {
        'name': f"{d['Make']} {d['Model']}", 'make': d['Make'], 'model': d['Model'], 'tier': d['Tier'],
        'price': num(d['Price']), 'group': GROUPS.get(heading, heading), 'family': heading,
    }
    if d.get('Kind'):
        a['kind'] = d['Kind']
    notes = '. '.join(x for x in re.split(r'\.\s+', d.get('Notes', '').strip(' .')) if x and not x.startswith('Was '))  # drop old-name notes ('Was Flamer')
    if notes:
        a['description'] = notes

    if heading == 'Armour':
        a['type'] = 'Armour'
        a['armour'] = num(d['Points'])
        extra = d.get('Tags while it has points', '')
        t = [x for x in [tags, '' if extra in DASH else f'{extra} (while it has points)'] if x]
        a['tags'] = ', '.join(t)
        if has_tag(tags, 'Heavy'):
            a['heavy'] = tag_num(tags, 'Heavy')
        if has_tag(tags, 'Self-repairing'):
            a['selfRepair'] = True
        return a

    a['size'] = num(d['Size'])
    a['type'] = d.get('Type') or ('Reactor' if heading == 'Reactors' else 'Hand' if heading in MELEE else 'Weapon')
    a['tags'] = tags

    if heading == 'Reactors':
        a['reactor'] = {'energy': num(d['Energy / turn']), 'heat': num(d['Heat / turn'])}
    elif heading == 'Capacitors':
        a['capacitor'] = num(d['Stores'])
        h = num(d['Heat when drawn'])
        if h:
            a['capacitorHeat'] = h
    elif heading == 'Passive cooling':
        a['cooling'] = -num(d['Heat / turn'])
        if num(d['Energy / turn']):
            a['upkeep'] = num(d['Energy / turn'])
        m = re.search(r'\+(\d+) Heat Max', d.get('Notes', ''))  # e.g. Fin-2: 'Fin-1's cooling, plus +1 Heat Max'
        if m:
            a['heatSink'] = int(m.group(1))
    elif heading == 'Heat sinks':
        a['heatSink'] = num(d['Heat Max'])
        if d['Energy'] not in DASH:  # Phase sinks: also activated to dump heat
            a['energy'] = num(d['Energy'])
            a['heat'] = num(d['Heat'])
            a['effect'] = f"Dump {-num(d['Heat'])} heat"
    else:
        if d.get('Energy', '—') not in DASH and not has_tag(tags, 'Passive'):
            a['energy'] = num(d['Energy'])
            a['heat'] = num(d['Heat']) if d.get('Heat', '—') not in DASH else 0
        roll = parse_roll(d.get('Roll', ''))
        if roll:
            a['roll'] = roll
        if heading in WEAPONS or (roll and roll['skill'] in ('Gunnery',)):
            a['range'] = 'Melee' if heading in MELEE else d['Range']
        ammo = d.get('Ammo', '')
        if heading in GUN_AMMO:
            a['ammo'] = GUN_AMMO[heading]
        elif ammo and ammo not in DASH and not ammo.startswith('Charges'):
            a['ammo'] = ammo
        elif ammo.startswith('Charges'):
            tags = a['tags'] = ', '.join(x for x in [f'{ammo}', tags] if x)
        if (a.get('energy') is not None) and a.get('heat', 0) < 0 and 'effect' not in a and not roll:
            a['effect'] = f"Dump {-a['heat']} heat"

    if has_tag(tags, 'Repeating'):
        a['repeat'] = tag_num(tags, 'Repeating')
    if has_tag(tags, 'Hungry'):
        a['ammoPer'] = tag_num(tags, 'Hungry')
    if has_tag(tags, 'Charges'):
        a['charges'] = tag_num(tags, 'Charges')
    if has_tag(tags, 'Recharging'):
        a['charges'] = tag_num(tags, 'Recharging')
        a['recharge'] = 'scene'
    if has_tag(tags, 'Stowage'):
        a['stowage'] = tag_num(tags, 'Stowage')
    if has_tag(tags, 'Hand'):
        a['hand'] = True
    if has_tag(tags, 'Heavy'):
        a['heavy'] = tag_num(tags, 'Heavy')
    if has_tag(tags, 'Volatile'):
        a['volatile'] = tag_num(tags, 'Volatile')
    return a


PARTS = md_tables(read_md('parts.md'))
attachments = []
for t in PARTS:
    hd, rows = t['rows'][0], t['rows'][1:]
    if 'Make' not in hd:
        continue
    for r in rows:
        attachments.append(part(t['heading'], dict(zip(hd, r))))

# Ammo (Catalogue tab ammo table) and one bin per ammo type.
ammo = []
i = next(k for k, l in enumerate(CAT) if l.startswith('| Ammo | Rounds per bin'))
for l in CAT[i + 1:]:
    if not l.startswith('|'):
        break
    c = cells(l)
    name = c[0].replace(' (new)', '')
    ammo.append({'name': name, 'perBin': num(c[1]), 'volatility': num(c[2].replace('×', '')), 'refill': num(c[4])})
for am in ammo:
    vol = am['volatility']
    attachments.append({
        'name': f"Ammo Bin: {am['name']}", 'group': 'Ammo', 'family': 'Ammo bins', 'size': 1, 'type': 'Generic',
        'tags': f'Volatile ({vol})' if vol else '', 'bin': am['name'],
        'description': f"{am['perBin']} {am['name']} rounds. " + (
            'Cooks off if disabled while loaded.' if vol else 'Inert: never cooks off.') + f" Refill {am['refill']} Solari.",
    })

names = [a['name'] for a in attachments]
assert len(names) == len(set(names)), [n for n in names if names.count(n) > 1]

# Chassis: overview table plus section tables (Catalogue tab, and Rules tab for the three starters).
overview = {}
i = next(k for k, l in enumerate(CAT) if l.startswith('| Make | Model | Class'))
for l in CAT[i + 1:]:
    if not l.startswith('|'):
        break
    c = cells(l)
    sp, ev = [num(x) for x in c[7].split('/')]
    overview[f'{c[0]} {c[1]}'] = {'make': c[0], 'model': c[1], 'class': c[2], 'tier': c[3], 'price': num(c[4]),
                                   'heatMax': num(c[5])}

def class_size(cls):
    """Chassis size 1-5 from its class: Ultralight 1, Light 2, Medium 3, Heavy 4, Heavy assault / Super-heavy 5."""
    if 'assault' in cls or cls.startswith('Super'):
        return 5
    return {'Ultralight': 1, 'Light': 2, 'Medium': 3, 'Heavy': 4}[cls.split()[0]]


ROLE = {
    'Left leg': 'lleg', 'Right leg': 'rleg', 'Left arm': 'larm', 'Right arm': 'rarm', 'Arm': 'rarm',
    'Core': 'core', 'Cargo bed (core)': 'core', 'Cockpit': 'cockpit', 'Sensor head (cockpit)': 'cockpit',
    'Treads': 'treads', 'Left tread': 'ltread', 'Right tread': 'rtread',
    'Rear left leg': 'rlleg', 'Rear right leg': 'rrleg', 'Front left leg': 'flleg', 'Front right leg': 'frleg',
    'Drill arm': 'larm', 'Crane arm': 'rarm', 'Cannon arm': 'rarm', 'Right shoulder': 'shoulder',
    'Left shoulder': 'lshoulder', 'Main gun mount': 'gun',
    'Claw arm': 'rarm', 'Gun pod': 'rarm', 'Right wing pylon': 'rarm', 'Crane boom': 'rarm', 'Cutting boom': 'rarm',
    'Left wing pylon': 'larm', 'Cargo bed': 'larm', 'Dozer blade': 'larm',
    'Welded cannon': 'shoulder', 'Missile rack': 'shoulder', 'Halo': 'shoulder',
    'Backpack': 'lshoulder', 'Sensor mast (cockpit)': 'cockpit',
}
AREA = {  # CSS grid-area on the 6-column body grid: row-start / col-start / row-end / col-end
    'cockpit': '1 / 3 / 2 / 5', 'shoulder': '1 / 5 / 2 / 7', 'gun': '1 / 5 / 2 / 7', 'lshoulder': '1 / 1 / 2 / 3',
    'larm': '2 / 1 / 3 / 3', 'core': '2 / 3 / 3 / 5', 'rarm': '2 / 5 / 3 / 7',
    'lleg': '3 / 2 / 4 / 4', 'rleg': '3 / 4 / 4 / 6', 'treads': '3 / 2 / 4 / 6',
    'ltread': '3 / 1 / 4 / 4', 'rtread': '3 / 4 / 4 / 7',
    'flleg': '3 / 1 / 4 / 4', 'frleg': '3 / 4 / 4 / 7', 'rlleg': '4 / 1 / 5 / 4', 'rrleg': '4 / 4 / 5 / 7',
}


def slots(s):
    out = []
    for p in s.split(','):
        p = p.strip()
        m = re.match(r'(\w+)(?: ×(\d+))?$', p)
        name = '' if m.group(1) == 'untyped' else m.group(1)
        out += [name] * int(m.group(2) or 1)
    return out


def section_tables(lines):
    """Yields (chassis name, description, [rows]) for '### MAKE Model — class' blocks."""
    k = 0
    while k < len(lines):
        m = re.match(r'### (.+?) — ', lines[k])
        if m and m.group(1) in overview:
            name, desc, rows = m.group(1), '', []
            k += 1
            while k < len(lines) and not lines[k].startswith('#'):
                l = lines[k]
                if l.startswith('| Section'):
                    pass
                elif l.startswith('|'):
                    rows.append(cells(l))
                elif l.strip() and not desc and not l.startswith('Heat Max'):
                    desc = l.strip()
                elif l.startswith('Heat Max'):  # Rules tab: 'Heat Max 7. 21 slots, 4 of them Hull. <description>'
                    desc = re.sub(r'^Heat Max \d+\. \d+ slots, \d+ of them Hull\. ', '', l).strip()
                k += 1
            yield name, desc, rows
        else:
            k += 1


chassis = {}
for src in (CAT, RULES):
    for name, desc, rows in section_tables(src):
        if name in chassis:
            continue
        o = overview[name]
        secs = []
        for r in rows:
            label, d12, slot_s = r[0], r[1], (r[3] if len(r) == 6 else r[2])
            prov = r[4] if len(r) == 6 else r[3]
            sid = ROLE[label]
            lo, hi = (num(x) for x in (d12.split('–') + [d12])[:2])
            sec = {'id': sid, 'name': label.replace(' (core)', '').replace(' (cockpit)', ''), 'range': [lo, hi],
                   'slots': slots(slot_s), 'transfer': 'pilot' if sid == 'cockpit' else None if sid == 'core' else 'core',
                   'area': AREA[sid]}
            p = {}
            ms = re.search(r'Speed (\d+)', prov)
            me = re.search(r'Evasion (\d+)', prov)
            if ms:
                p['speed'] = int(ms.group(1))
            if me:
                p['evasion'] = int(me.group(1))
            if p:
                sec['provides'] = p
            secs.append(sec)
        ids = {s['id'] for s in secs}
        shape = 'tracked' if ids & {'treads', 'ltread'} else 'quad' if 'flleg' in ids else 'biped'
        chassis[name] = {'name': name, 'make': o['make'], 'model': o['model'], 'class': o['class'], 'size': class_size(o['class']), 'tier': o['tier'],
                         'price': o['price'], 'heatMax': o['heatMax'], 'description': desc,
                         'shape': shape, 'sections': secs}

missing = set(overview) - set(chassis)
assert not missing, missing
order = list(overview)
chassis_list = [chassis[n] for n in order]

# Tag glossary: Rules tab core tags, then the Catalogue tag table (which wins on a clash).
tags = {}


def clean_rule(text):
    """A tag rule without design notes: old-name remarks ('Was ...'), '(call)' markers and 'Replaces ...:' preambles."""
    text = re.sub(r'^Replaces [^:]*:\s*', '', text)
    text = text.replace(' (call)', '')
    parts = [x for x in re.split(r'\.\s+', text.strip(' .')) if x and not x.startswith('Was ')]
    return '. '.join(parts)


def read_tags(lines, header):
    i = next(k for k, l in enumerate(lines) if l.startswith(header))
    for l in lines[i + 1:]:
        if not l.startswith('|'):
            break
        c = cells(l)
        if c[0] == 'Ammo':  # the ammo table follows the tag table directly
            break
        if len(c) < 2 or not c[1]:
            continue
        for name in c[0].split(' / '):
            tags[re.sub(r' \(.*\)$', '', name).replace(' vs Y', '').strip()] = clean_rule(c[1])


read_tags(RULES, '| Tag | Rule |')
read_tags(CAT, '| Tag | Rule |')
tags['Dextrous'] = tags.get('Dexterous', '')


def ts(name, typ, value):
    return f'export const {name}: {typ} = {json.dumps(value, ensure_ascii=False, indent=1)}\n'


with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// GENERATED by scripts/scraplancer/gen.py from the Scrap Lancer rules doc. Do not edit by hand.\n')
    f.write("import type { Chassis, MechAmmo, MechAttachment } from '../lib/mech/types'\n\n")
    f.write(ts('CHASSIS', 'Chassis[]', chassis_list) + '\n')
    f.write(ts('ATTACHMENTS', 'MechAttachment[]', attachments) + '\n')
    f.write(ts('AMMO', 'MechAmmo[]', ammo) + '\n')
    f.write(ts('TAGS', '{ [tag: string]: string }', tags))
print(len(chassis_list), 'chassis,', len(attachments), 'attachments,', len(ammo), 'ammo,', len(tags), 'tags')
