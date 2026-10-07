"""Draws purr's start-screen logo (LOGO in purr's tui/app.py) as assets/logo.svg.

Each character is one terminal cell, 1 wide and 2 tall: █ fills it, ▀ / ▄ fill the top / bottom half,
░ is the darker inside of a letter, T is a top edge with the inside below it. Run it again if the
logo in purr changes: python tools/logo.py
"""

from pathlib import Path

LILAC, PINK = "#c8a2f0", "#f5a9d0"
LOGO = [
    (["█TT█ █  █ ", "█░░█ █░░█ ", "█▀▀▀ ▀▀▀▀ ", "▀         "], LILAC, "#4f3f66"),
    (["█▀▀▀ █▀▀▀   ", "█    █      ", "▀    ▀      ", "            "], PINK, "#6b4360"),
    (["▄██▄██▄", "▀█████▀", "  ▀█▀  ", "       "], PINK, PINK),
]


def svg():
    rects, x0 = [], 0
    for rows, colour, inside in LOGO:
        for y, row in enumerate(rows):
            for i, ch in enumerate(row):
                x, top, bottom = x0 + i, y * 2, y * 2 + 1
                halves = {"█": (colour, colour), "▀": (colour, None), "▄": (None, colour),
                          "░": (inside, inside), "T": (colour, inside)}.get(ch, (None, None))
                for fill, yy in zip(halves, (top, bottom)):
                    if fill:
                        rects.append(f'<rect x="{x}" y="{yy}" width="1.02" height="1.02" fill="{fill}"/>')
        x0 += len(rows[0])
    # the last row is nearly empty: trim to what's drawn
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x0} 7" shape-rendering="crispEdges" '
            f'role="img" aria-label="purr">' + "".join(rects) + "</svg>\n")


Path(__file__).resolve().parent.parent.joinpath("assets/logo.svg").write_text(svg())
