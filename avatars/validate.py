#!/usr/bin/env python3
"""Validate the avatar XML, restricted geometry, palette and manifest (stdlib only)."""
import json
import math
from pathlib import Path
import re
import xml.etree.ElementTree as ET

from build import element_polylines

BASE = Path(__file__).resolve().parent
NS = '{http://www.w3.org/2000/svg}'
PALETTE = {'#4D9EFF', '#00ED95', '#FFFFFF', '#FF3A5D'}
COMMON = {'fill': 'none', 'stroke-width': '1.5',
          'stroke-linecap': 'round', 'stroke-linejoin': 'round'}
GEOMETRY = {'path': {'d'}, 'polyline': {'points'},
            'line': {'x1', 'y1', 'x2', 'y2'},
            'circle': {'cx', 'cy', 'r'}, 'ellipse': {'cx', 'cy', 'rx', 'ry'}}
TOKEN = re.compile(r'[MLCQZ]|-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?')
ARITY = {'M': 2, 'L': 2, 'C': 6, 'Q': 4, 'Z': 0}


def check(condition, message):
    if not condition:
        raise ValueError(message)


def validate_path(d):
    check(not re.sub(TOKEN, '', d).replace(',', '').strip(), 'illegal path command/token')
    tokens = TOKEN.findall(d)
    check(tokens and tokens[0] == 'M', 'path must begin with M')
    i = 0
    active = False
    while i < len(tokens):
        command = tokens[i]
        check(command in ARITY, 'expected absolute M/L/C/Q/Z command')
        i += 1
        start = i
        while i < len(tokens) and tokens[i] not in ARITY:
            check(math.isfinite(float(tokens[i])), 'nonfinite path coordinate')
            i += 1
        count = i-start
        arity = ARITY[command]
        check(count == 0 if command == 'Z' else count >= arity and count % arity == 0,
              f'invalid argument count for {command}')
        check(command == 'M' or active, 'drawing command without a subpath')
        active = command != 'Z'


def validate():
    entries = json.loads((BASE/'index.json').read_text())
    expected = {(kind, pose) for kind in ('lead', 'explore', 'plan', 'general-purpose',
                                         'guide', 'review', 'status', 'workflow', 'other')
                for pose in ('idle', 'work')}
    expected |= {('lead', pose) for pose in ('think', 'wait', 'done', 'fail')}
    check(len(entries) == 22, 'manifest must have 22 entries')
    check({(e['type'], e['pose']) for e in entries} == expected, 'incorrect athlete/pose set')
    check({e['file'] for e in entries} == {f'svg/{p.name}' for p in (BASE/'svg').glob('*.svg')},
          'manifest and SVG directory differ')
    for entry in entries:
        name = entry['file']
        check(name == f"svg/{entry['type']}-{entry['pose']}.svg", f'{name}: filename mismatch')
        check(isinstance(entry['description'], str) and entry['description'].strip(),
              f'{name}: missing description')
        root = ET.parse(BASE/name).getroot()
        check(root.tag == NS+'svg', f'{name}: missing SVG namespace')
        check(root.attrib == {'viewBox': '0 0 64 64'}, f'{name}: illegal root attributes')
        check(0 < len(root) <= 90, f'{name}: element count outside 1..90')
        accents = set()
        points = []
        for element in root:
            tag = element.tag.removeprefix(NS)
            attrs = element.attrib
            check(element.tag == NS+tag and tag in GEOMETRY, f'{name}: forbidden element {tag}')
            check(not len(element), f'{name}: nested elements')
            check(not (element.text or '').strip(), f'{name}: embedded text')
            check(set(attrs) == GEOMETRY[tag] | set(COMMON) | {'stroke'},
                  f'{name}: forbidden/missing attributes')
            check(all(attrs[k] == v for k, v in COMMON.items()), f'{name}: invalid stroke/fill')
            color = attrs['stroke']
            check(color == 'currentColor' or color in PALETTE, f'{name}: invalid color')
            if color != 'currentColor':
                accents.add(color)
            if tag == 'path':
                validate_path(attrs['d'])
            else:
                for key in GEOMETRY[tag] - {'points'}:
                    check(math.isfinite(float(attrs[key])), f'{name}: nonfinite coordinate')
                if tag == 'polyline':
                    values = re.split(r'[\s,]+', attrs['points'].strip())
                    check(len(values) >= 4 and len(values) % 2 == 0 and
                          all(math.isfinite(float(v)) for v in values), f'{name}: invalid points')
                for key in ('r', 'rx', 'ry'):
                    if key in attrs:
                        check(float(attrs[key]) > 0, f'{name}: nonpositive radius')
            polylines = element_polylines(element)
            check(polylines, f'{name}: geometry did not survive build parser')
            points.extend(p for line in polylines for p in line)
        check(len(accents) <= 1, f'{name}: multiple accent colors')
        check(accents == ({entry['accent']} if entry['accent'] else set()), f'{name}: accent mismatch')
        check(any(e.attrib['stroke'] == 'currentColor' for e in root), f'{name}: no body strokes')
        check(all(.75 <= x <= 63.25 and .75 <= y <= 63.25 for x, y in points),
              f'{name}: strokes extend beyond viewBox')
        check(58 <= max(y for x, y in points) <= 61, f'{name}: incorrect baseline')
        print(f'{Path(name).name}: {len(root)} elements; valid')
    print('PASS: 22 SVGs, 9 athletes; XML, format, palette, bounds and build parser verified.')


if __name__ == '__main__':
    validate()
