---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface: purr website (landing + docs pages)

Mode: Persuade for the landing (index.html); Read for the generated docs pages (guide, benchmarks, changelog).
Audience: local-model tinkerers (see PRODUCT.md). Action: copy the install line.
Proof: the demo GIF, the slip-repair mechanisms, Terminal-Bench 82.0% ± 4.1 with the method linked.
Constraints: dark only; the ASCII cat from purr's tui/cat.py; docs generated from purr's Markdown.
User steer (2026-10-07): install command and the ASCII cat first when you land; minimal page; smooth
scroll-down animation; build something to refine from. Arch tab shows `yay -S purr-agent-git` as a
placeholder until the AUR package exists.

## Direction contract

THESIS: purr's site is its own local-model card: you land on the install line and the cat, then read it
the way you size up any model for your rig. It refuses the gradient hero, the feature-card grid and the
glowing terminal screenshot.

OWN-WORLD: bubblegum-night plum ground (#120c16), panels #22152b, hairlines #3c2346. Two spot inks only,
pink #f5a9d0 and lilac #c8a2f0; mint #96dcaf only for pass/✓. Card grammar: a front-matter strip of
key: value pairs, tag chips with purr's mode glyphs, quant-table style mono tables, a tabbed "use with"
install panel. Coiny for the wordmark and section heads, M PLUS Rounded 1c for prose, Maple Mono for the
cat, code and tables.

STORY: the visitor sees a cute agent they can install in one line, understands it is built for small
models (repairs slips, checks work, catches loops), sees it work in the demo and the benchmark with its
±, and copies the install line or opens the guide.

FIRST VIEWPORT: top bar: wordmark left, guide / benchmarks / changelog / github right. Main: the ASCII
cat large (napping, wakes on hover, cheers on copy) beside "purr ♡" in Coiny at display size and one
plain tagline; under them, full column width, the install panel: tabs curl / uv / arch / windows, the
command in Maple Mono, the copy button as the primary action. A chip row of backends below. A small
scroll cue where the card body starts.

FORM: The Model Card, candidate 3 of my grounded list (1 pocket pet, 2 GPU monitor, 3 model card, 4 TUI as
page, 5 kawaii sticker sheet, 6 arcade cabinet, 7 job tickets); seed key 23646387.
Signature interaction (overdrive, 2026-10-07, user picked both): the logo is live pixels on a canvas that
assemble from glyphs, get knocked loose by the cursor and pour into the install box as you scroll; once
the hero cat is gone Mochi roams free, walking the bottom edge after your cursor, napping, and hopping
onto the heading you're reading to take its mood. Hearts float up when she's petted.
Raises: states change glyph and fill, not only tint (Memphis); notes pinned to the exact line in the
repair section (tensegrity); bow by day, moon at night (daylight); pink and lilac as the only inks
(risograph).

ADAPTATIONS (recorded after the first review): the wordmark is purr's own pixel logo from the TUI start
screen (tools/logo.py), not Coiny; backends are a prose line, not chips (user steer: minimal); the modes
table uses purr's mode colours from tui/themes.py beyond the two inks; by day the ground is cotton-candy
#1f1626, at night bubblegum-night #120c16 (purr's auto theme, the owner's day rule); mono is kept to the
cat, code, tables and front matter.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
