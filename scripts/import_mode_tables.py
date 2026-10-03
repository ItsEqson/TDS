"""Convert the user-supplied mode reference into static browser data.

This is a one-time authoring helper; the game imports only the generated ES module.
"""
import json
import re
import sys
from pathlib import Path


def parse_section(text, heading, next_heading=None):
    start = text.index(heading)
    end = text.index(next_heading, start + len(heading)) if next_heading else len(text)
    return text[start:end]


def main(source, destination):
    text = Path(source).read_text(encoding='utf-8-sig').replace('\r\n', '\n')
    headings = [
        '1. EASY MODE\n20 waves', '2. CASUAL MODE\n25 waves',
        '3. INTERMEDIATE MODE\n30 waves', '4. MOLTEN MODE 🔥\n35 waves',
        '5. FALLEN MODE ⚔️\n40 normal waves', '6. HARDCORE MODE ☠️\n45 waves',
        '7. VOIDCORE MODE 🟣\n50 waves',
    ]
    modes = ['easy', 'casual', 'intermediate', 'molten', 'fallen', 'hardcore', 'voidcore']
    wave_counts = [20, 25, 30, 35, 40, 45, 50]
    result = {}
    for index, mode in enumerate(modes):
        section = parse_section(text, headings[index], headings[index + 1] if index + 1 < len(headings) else 'Important note about the numbers')
        roster = section.split('Every ' + mode.capitalize() + ' enemy\n', 1)[1]
        roster = roster.split('Enemy\n', 1)[1]
        roster = roster.split('\n' + mode.capitalize() + ' — ', 1)[0]
        lines = roster.splitlines()[2:]
        enemies = {}
        cursor = 0
        while cursor + 2 < len(lines):
            name, hp, description = lines[cursor:cursor + 3]
            if not re.fullmatch(r'[\d,]+', hp):
                break
            enemies[name] = {'health': int(hp.replace(',', '')), 'description': description}
            cursor += 3
        waves_text = section.split(mode.capitalize() + ' — ', 1)[1]
        waves_text = waves_text.split('\n1\n', 1)[1]
        waves = []
        raw = ['1'] + waves_text.splitlines()
        for number in range(1, wave_counts[index] + 1):
            marker = str(number)
            try:
                at = raw.index(marker)
            except ValueError as exc:
                raise ValueError(f'{mode} wave {number} missing') from exc
            row = raw[at + 1]
            groups = []
            for part in row.split(', '):
                match = re.fullmatch(r'(\d+) (.+)', part)
                if not match or match.group(2) not in enemies:
                    raise ValueError(f'{mode} wave {number}: {part!r} is not in roster')
                groups.append([match.group(2), int(match.group(1))])
            waves.append(groups)
        result[mode] = {'enemies': enemies, 'waves': waves}
    output = '// Authored from the mode and wave tables supplied for this project.\n'
    output += 'export const MODE_CAMPAIGNS = Object.freeze({\n'
    for mode, campaign in result.items():
        output += f'  {mode}: {{\n    enemies: {{\n'
        for name, enemy in campaign['enemies'].items():
            output += f'      {json.dumps(name)}: {json.dumps(enemy, ensure_ascii=False)},\n'
        output += '    },\n    waves: [\n'
        for number, groups in enumerate(campaign['waves'], 1):
            output += f'      {json.dumps(groups, ensure_ascii=False, separators=(',', ':'))}, // {number}\n'
        output += '    ],\n  },\n'
    output += '});\n'
    Path(destination).write_text(output, encoding='utf-8')
    for mode, campaign in result.items():
        print(mode, len(campaign['enemies']), 'enemy types,', len(campaign['waves']), 'waves')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
