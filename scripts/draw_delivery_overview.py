#!/usr/bin/env python3
"""Draw the ORCA delivery overview as editable SVG using only Python's stdlib.

Scientific source: wiki/pages/software.html (whole-body model overview).
Art direction: AI-generated concept, redrawn as original vector paths and text.
No raster content, experimental data, or quantitative simulation is embedded.
Usage: python scripts/draw_delivery_overview.py [--output path/to/figure.svg]
"""

from __future__ import annotations

import argparse
from html import escape
from pathlib import Path
import math

NAVY = '#10264b'
BLUE = '#297dc3'
TEAL = '#19a8ac'
PURPLE = '#8b65c7'
CORAL = '#db7959'
parts: list[str] = []


def add(markup: str) -> None:
    parts.append(markup)


def path(d: str, fill: str = 'none', stroke: str = NAVY, width: float = 2,
         extra: str = '') -> None:
    add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" '
        f'stroke-linecap="round" stroke-linejoin="round" {extra}/>')


def text(x: float, y: float, value: str, size: float = 24, weight: str = 'normal',
         anchor: str = 'middle', fill: str = NAVY, extra: str = '') -> None:
    add(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
        f'text-anchor="{anchor}" fill="{fill}" {extra}>{escape(value)}</text>')


def circle(x: float, y: float, r: float, fill: str, stroke: str = 'none',
           width: float = 1.5, extra: str = '') -> None:
    add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" '
        f'stroke-width="{width}" {extra}/>')


def rect(x: float, y: float, w: float, h: float, fill: str, stroke: str = 'none',
         radius: float = 10, width: float = 1.8, extra: str = '') -> None:
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{width}" {extra}/>')


def arrow(d: str, color: str = BLUE, width: float = 2.6, dashed: bool = False) -> None:
    path(d, stroke=color, width=width,
         extra='marker-end="url(#arrow)"' + (' stroke-dasharray="6 6"' if dashed else ''))


def group(x: float, y: float, scale: float = 1) -> None:
    add(f'<g transform="translate({x} {y}) scale({scale})">')


def end() -> None:
    add('</g>')


def rna(x: float, y: float, scale: float = 1, colors: tuple[str, ...] = ()) -> None:
    group(x, y, scale)
    for i in range(9):
        px = -64 + i * 16
        py = 16 * math.sin((px + 75) * math.pi / 75)
        c = colors[i % len(colors)] if colors else ['#79b7da', '#a07bd3', '#5fbcc3'][i % 3]
        path(f'M{px:.1f} {py:.1f} v{20 if i % 2 else 25}', stroke=c, width=5)
    path('M-80 0 C-54 -31 -30 -23 0 0 S53 28 80 0', stroke='#537797', width=7)
    path('M-80 -2 C-54 -33 -30 -25 0 -2 S53 26 80 -2', stroke='#b7d3df', width=2)
    end()


def protein(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    path('M-35 -18 C-55 -37 -38 -61 -16 -49 C-12 -78 26 -77 29 -50 '
         'C56 -64 78 -37 58 -19 C85 6 62 34 40 28 C40 57 9 69 -9 47 '
         'C-35 63 -58 39 -44 18 C-74 12 -64 -15 -35 -18 Z',
         'url(#protein)', '#209b9e', 2.5)
    path('M-29 -25 Q-38 -10 -24 -5 M5 -47 Q-10 -29 3 -20 M33 0 Q15 7 23 26',
         stroke='#62c9c8', width=2)
    end()


def vessel(x: float, y: float, scale: float = 1, vertical: bool = False) -> None:
    group(x, y, scale)
    if vertical:
        add('<g transform="rotate(90)">')
    path('M-90 -33 C-30 -16 30 -48 90 -26 L90 34 C27 12 -27 46 -90 27 Z',
         'url(#vessel)', '#e6a1a4', 2)
    path('M-90 -25 C-25 -8 30 -39 90 -18 M-90 20 C-25 38 26 4 90 26',
         stroke='#f8c5c6', width=5)
    for ex, ey, angle in [(-57, -1, -25), (-18, 6, 15), (28, -7, 20), (61, 8, -15)]:
        add(f'<ellipse cx="{ex}" cy="{ey}" rx="14" ry="8" transform="rotate({angle} {ex} {ey})" '
            'fill="#d97476" stroke="#bc5e64" stroke-width="1.5"/>')
        add(f'<ellipse cx="{ex}" cy="{ey}" rx="7" ry="3" transform="rotate({angle} {ex} {ey})" '
            'fill="#e49b9c"/>')
    circle(-65, -13, 8, '#90d4ee', '#4ca7ce')
    circle(46, 13, 8, '#90d4ee', '#4ca7ce')
    if vertical:
        end()
    end()


def neuron(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    for angle in [-145, -100, -55, -8, 37, 82, 128, 173]:
        a = math.radians(angle)
        ex, ey = 60 * math.cos(a), 60 * math.sin(a)
        bx, by = 39 * math.cos(a), 39 * math.sin(a)
        path(f'M0 0 Q{bx/2:.1f} {by/2:.1f} {ex:.1f} {ey:.1f}', stroke='#a894d5', width=4)
        for da in [-0.45, 0.45]:
            tx, ty = bx + 23 * math.cos(a+da), by + 23 * math.sin(a+da)
            path(f'M{bx:.1f} {by:.1f} L{tx:.1f} {ty:.1f}', stroke='#bba8e5', width=2.5)
    path('M-25 -13 Q-29 -29 -10 -26 Q5 -36 20 -22 Q34 -14 25 4 '
         'Q28 25 10 25 Q-3 35 -21 19 Q-38 10 -25 -13 Z', 'url(#cell)', '#b09bdd', 2)
    circle(0, 0, 10, '#957ac8', '#7660b1')
    circle(-3, -3, 3, '#c0abe8')
    end()


def body(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    path('M-15 -98 C-29 -102 -28 -128 -21 -139 C-14 -151 15 -151 22 -138 '
         'C29 -124 26 -106 15 -98 L16 -85 C28 -76 52 -75 59 -56 '
         'L77 20 L63 25 L39 -41 L32 -22 L36 38 L26 119 L8 119 L0 51 '
         'L-8 119 L-26 119 L-36 38 L-32 -22 L-39 -41 L-63 25 L-77 20 '
         'L-59 -56 C-52 -75 -28 -76 -16 -85 Z', 'url(#body)', '#8dbfe1', 2)
    path('M0 -103 L0 40 M0 -54 C-18 -72 -34 -48 -51 0 M0 -54 C18 -72 34 -48 51 0 '
         'M0 34 L-18 104 M0 34 L18 104 M0 -30 L-24 -15 M0 -15 L24 0',
         stroke='#5e9dcd', width=3)
    path('M6 -103 L6 39 M6 -49 C-14 -66 -31 -41 -44 7 M6 -49 C24 -65 39 -39 57 7 '
         'M6 40 L-12 109 M6 40 L24 109', stroke='#df8e85', width=2.6)
    path('M-2 -47 C-15 -58 -24 -37 -9 -27 L4 -16 L15 -33 C23 -53 8 -59 -2 -47 Z',
         '#d97d78', '#b96568', 1.5)
    end()


def liver(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    path('M-65 -26 C-40 -47 -6 -40 15 -34 C37 -36 64 -32 73 -22 '
         'C68 -8 38 3 22 1 C6 11 -3 30 -27 42 C-42 49 -53 35 -55 18 '
         'C-63 2 -72 -10 -65 -26 Z', 'url(#liver)', '#ab6b68', 2.4)
    path('M15 -32 C4 -16 10 -3 22 1 M-50 -23 C-36 -35 -12 -31 -4 -27',
         stroke='#e9b0aa', width=2.5)
    path('M11 3 Q18 14 12 25', stroke='#72a880', width=4)
    end()


def tissue(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    for dx, dy, rot in [(-28, -18, -25), (25, -14, 10), (-14, 16, -12), (39, 23, 18)]:
        add(f'<g transform="translate({dx} {dy}) rotate({rot})">')
        path('M-42 0 C-20 -26 19 -26 42 0 C20 23 -18 25 -42 0 Z',
             'url(#muscle)', '#dc9d99', 1.5)
        path('M-31 0 Q0 -11 31 0 M-26 5 Q0 -4 28 5', stroke='#f4bdb5', width=2)
        end()
    end()


def cell(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    circle(0, 0, 63, 'url(#cell)', '#ae94df', 2)
    circle(4, 6, 34, 'url(#nucleus)', '#9c7dcb', 2)
    path('M-17 5 Q-12 -10 -7 5 T3 5 T13 5 T23 5', stroke='#62559a', width=2)
    for cx, cy in [(-37,-25), (-38,23), (22,-42), (40,23), (0,-49), (45,-16)]:
        circle(cx, cy, 4, '#cab9e9')
    circle(-41, 1, 8, '#89d5e8', '#51abc9')
    end()


def database(x: float, y: float, scale: float = 1) -> None:
    group(x, y, scale)
    path('M-56 -29 L-56 39 C-56 62 56 62 56 39 L56 -29 Z', 'url(#database)', '#659fbd', 2)
    add('<ellipse cx="0" cy="-29" rx="56" ry="18" fill="#e8f8fc" stroke="#659fbd" stroke-width="2"/>')
    path('M-56 -7 C-56 17 56 17 56 -7 M-56 16 C-56 40 56 40 56 16',
         stroke='#88b7ce', width=2)
    rect(22, -7, 46, 64, '#ffffff', '#75a5c2', 4)
    path('M32 8 h24 M32 20 h24 M32 32 h17 M32 44 h20', stroke='#9abfd2', width=3)
    circle(-35, 18, 3, TEAL)
    circle(-35, 40, 3, TEAL)
    end()


def build() -> str:
    parts.clear()
    add('<?xml version="1.0" encoding="UTF-8"?>')
    add('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" '
        'viewBox="0 0 1600 1100" role="img" aria-labelledby="delivery-title delivery-description" '
        'data-input-x="800" data-input-y="290" data-connector-x="800">')
    add('<title id="delivery-title">Whole-body delivery model</title>')
    add('<desc id="delivery-description">Systemic distribution, barrier transport and expression, '
        'explicit RNA product states, and a complementary tissue coverage model. Central modeling '
        'data informs RNA product composition. Outputs distinguish intended-product retention, '
        'unwanted-edit burden, and tissue coverage. Schematic only; no measured data are depicted.</desc>')
    add('<metadata>Scientific source: wiki/pages/software.html. AI-assisted art direction; '
        'original Python vector construction. Reproduce with scripts/draw_delivery_overview.py. '
        'Created 2026-10-16. License: CC BY 4.0, as in the repository.</metadata>')
    add('''<defs>
      <radialGradient id="blue-panel"><stop stop-color="#f2fbff"/><stop offset="1" stop-color="#dff2fb"/></radialGradient>
      <radialGradient id="teal-panel"><stop stop-color="#f2fcfa"/><stop offset="1" stop-color="#dff4f0"/></radialGradient>
      <radialGradient id="purple-panel"><stop stop-color="#f7f3fd"/><stop offset="1" stop-color="#e9ddf6"/></radialGradient>
      <radialGradient id="coral-panel"><stop stop-color="#fff9f3"/><stop offset="1" stop-color="#fce9db"/></radialGradient>
      <radialGradient id="center"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#e0f5fa"/></radialGradient>
      <linearGradient id="body" x2="1" y2="0"><stop stop-color="#e1f2fb"/><stop offset=".5" stop-color="#c1e1f5"/><stop offset="1" stop-color="#e9f7fc"/></linearGradient>
      <radialGradient id="liver" cx=".3" cy=".2"><stop stop-color="#ebbcb2"/><stop offset=".45" stop-color="#c88c87"/><stop offset="1" stop-color="#b77976"/></radialGradient>
      <linearGradient id="muscle" x2="0" y2="1"><stop stop-color="#f9d2c9"/><stop offset=".5" stop-color="#e9aaa2"/><stop offset="1" stop-color="#f3c2b9"/></linearGradient>
      <linearGradient id="vessel" x2="0" y2="1"><stop stop-color="#f6c4c5"/><stop offset=".5" stop-color="#f3adaf"/><stop offset="1" stop-color="#f9d5d5"/></linearGradient>
      <radialGradient id="cell" cx=".35" cy=".3"><stop stop-color="#f3edfd"/><stop offset="1" stop-color="#d4c4ef"/></radialGradient>
      <radialGradient id="nucleus"><stop stop-color="#c8b6eb"/><stop offset="1" stop-color="#a78dd2"/></radialGradient>
      <radialGradient id="protein" cx=".3" cy=".25"><stop stop-color="#c5f0ec"/><stop offset="1" stop-color="#64c8c6"/></radialGradient>
      <linearGradient id="database" x2="1" y2="0"><stop stop-color="#c9e9f2"/><stop offset=".5" stop-color="#f4fdff"/><stop offset="1" stop-color="#afd6e7"/></linearGradient>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L9 5 L0 9 Z" fill="#297dc3"/></marker>
    </defs>''')
    rect(0, 0, 1600, 1100, '#ffffff', radius=0)
    add('<g font-family="Georgia, Times New Roman, serif">')
    top = ('M24 378 C7 272 27 132 116 76 C201 21 352 19 500 30 '
           'C634 40 715 60 731 118 L731 252 C731 278 686 292 658 321 '
           'C631 349 620 397 580 417 C511 451 208 427 91 416 C48 413 29 403 24 378 Z')
    bottom = ('M25 474 C71 439 247 448 454 457 C552 460 605 483 630 532 '
              'C658 592 674 609 716 634 C739 648 752 650 772 654 '
              'C762 725 705 797 581 819 C422 847 172 829 81 790 '
              'C28 769 17 709 18 632 C17 563 14 505 25 474 Z')
    path(top, 'url(#blue-panel)', 'none')
    add('<g transform="translate(1600 0) scale(-1 1)">')
    path(top, 'url(#teal-panel)', 'none')
    end()
    path(bottom, 'url(#purple-panel)', 'none')
    add('<g transform="translate(1600 0) scale(-1 1)">')
    path(bottom, 'url(#coral-panel)', 'none')
    end()

    # The four section titles intentionally have no explanatory subtitles.
    text(363, 94, 'Systemic distribution', 37, 'bold')
    text(1237, 94, 'Barrier & expression', 37, 'bold')
    text(348, 508, 'Tissue coverage', 37, 'bold')
    text(1260, 508, 'RNA product composition', 33, 'bold')

    body(163, 257, .81)
    text(163, 390, 'Blood circulation', 24)
    liver(406, 199, .85)
    tissue(407, 311, .8)
    arrow('M246 234 C295 234 293 200 331 200')
    arrow('M246 256 C292 256 294 308 331 308')
    text(490, 196, 'Liver', 25, 'bold', 'start')
    text(490, 226, 'Clearance', 22, anchor='start')
    text(470, 282, 'Peripheral tissues', 22, 'bold', 'start')
    text(470, 312, 'Tissue uptake', 21, anchor='start')

    vessel(1000, 224, .67)
    neuron(1150, 224, .84)
    cell(1300, 224, .78)
    protein(1450, 203, .65)
    rna(1450, 254, .61)
    arrow('M1066 225 H1093')
    arrow('M1205 225 H1239')
    arrow('M1360 225 H1396')
    text(1000, 310, 'Blood–brain', 22)
    text(1000, 338, 'barrier', 22)
    text(1150, 310, 'Brain tissue', 22)
    text(1300, 310, 'Uptake &', 22)
    text(1300, 338, 'expression', 22)
    text(1450, 310, 'Editor protein', 22)

    # Complementary spatial illustration; opacity is schematic, not a heat map.
    vessel(109, 665, 1.02, vertical=True)
    for row in range(5):
        for col in range(9):
            cx = 195 + col * 46 + (row % 2) * 15
            cy = 581 + row * 37
            radius = 15 + ((row + col) % 3)
            opacity = .94 - col * .075
            add(f'<g opacity="{opacity:.3f}">')
            circle(cx, cy, radius, 'url(#cell)', '#c4ace6', 1.2)
            circle(cx-2, cy+1, radius*.32, '#9671c9')
            end()
    text(109, 791, 'Vessel', 24)
    text(252, 791, 'Near vessel', 24)
    text(545, 791, 'Far from vessel', 24)
    arrow('M205 752 H579', width=1.8)

    # RNA product states with the selected transitions shown in this overview.
    rna(1036, 650, .55, ('#a17bd1', '#77b7d9'))
    rna(1213, 584, .55, ('#4ab1ca', '#75b8d8'))
    rna(1433, 650, .55, ('#e89b70', '#6bb4d6'))
    rna(1213, 724, .55, ('#ae81ce', '#dfaa7c'))
    text(1036, 696, 'APOE4', 25, 'bold')
    text(1213, 630, 'APOE3-like', 25, 'bold')
    text(1433, 696, 'APOE2-like', 25, 'bold')
    text(1213, 766, 'Alternative', 23, 'bold')
    text(1213, 793, 'RNA state', 23, 'bold')
    arrow('M1087 638 C1114 622 1117 587 1153 584')
    arrow('M1271 585 C1320 587 1332 632 1373 641')
    arrow('M1087 661 C1112 677 1115 724 1153 724')

    # Central model input. The compositor can enter at x800/y290 without
    # crossing panel titles or artwork (x766–834 is open above the circle).
    circle(800, 442, 152, '#ffffff', '#ffffff', 15)
    circle(800, 442, 152, 'url(#center)')
    text(800, 422, 'Modeling data', 39, 'bold')
    database(800, 489, .92)
    # Exactly one data-to-section connection, as requested.
    arrow('M916 543 C953 569 991 585 1016 608', width=5)

    rect(257, 867, 1086, 132, '#ffffff', '#70a4ce', 22, 2)
    text(800, 904, 'Compare strategies & guide validation', 33, 'bold')
    path('M617 925 V981 M984 925 V981', stroke='#b7d2e5', width=1.5)
    rect(294, 927, 42, 52, '#f1f9fd', '#7faad0', 5)
    path('M304 939 h21 M304 950 h19 M304 961 h14', stroke='#96b8d4', width=2.5)
    circle(334, 970, 13, '#5cbb9c', '#37997d')
    path('M328 969 l5 5 l8 -10', stroke='white', width=2.5)
    text(464, 946, 'Intended-product', 25)
    text(464, 977, 'retention', 25)
    path('M655 972 L678 930 Q682 922 687 930 L711 972 Q715 980 706 980 '
         'L661 980 Q650 980 655 972 Z', '#fff6ed', '#ca7862', 3)
    path('M682 942 V960', stroke='#bf6f5d', width=4)
    circle(682, 969, 2.5, '#bf6f5d')
    text(838, 946, 'Unwanted-edit', 25)
    text(838, 977, 'burden', 25)
    neuron(1040, 954, .39)
    text(1184, 946, 'Tissue', 25)
    text(1184, 977, 'coverage', 25)
    text(800, 1071, 'WHOLE-BODY DELIVERY MODEL', 49, 'bold')
    end()
    add('</svg>')
    return '\n'.join(parts) + '\n'


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path(__file__).resolve().parents[1] /
                        'assets/images/whole-body-delivery-overview.svg')
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(build(), encoding='utf-8')
    print(args.output)


if __name__ == '__main__':
    main()
