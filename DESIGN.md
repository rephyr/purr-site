---
name: purr
description: A cute coding agent for your terminal, built to get more out of small local models.
colors:
  bubblegum-night: "#120c16"
  plum-panel: "#22152b"
  plum-panel-hi: "#2c1b36"
  plum-deep: "#0b070e"
  plum-hairline: "#3c2346"
  plum-hairline-hi: "#4c2d59"
  plum-hover: "#3b2149"
  plum-scroll: "#7c4092"
  cotton-candy: "#1f1626"
  cotton-panel: "#2e2038"
  cotton-panel-hi: "#382744"
  cotton-deep: "#17101d"
  cotton-hairline: "#4a3558"
  cotton-hairline-hi: "#5c426d"
  cotton-hover: "#46315a"
  cotton-scroll: "#8a62a8"
  bubblegum-pink: "#f5a9d0"
  dream-lilac: "#c8a2f0"
  hot-pink: "#ff8fcf"
  moonlight: "#d9c8ff"
  pass-mint: "#96dcaf"
  warn-peach: "#ffb8c8"
  mode-learn-rose: "#f0829b"
  mode-pair-periwinkle: "#a8b8ff"
  mode-plan-cyan: "#8fd8e8"
  petal-text: "#e9dff2"
  dusk-dim: "#958aa3"
  dusk-faint: "#6f6580"
  ink: "#15101c"
typography:
  display:
    fontFamily: "Coiny, M PLUS Rounded 1c, ui-rounded, sans-serif"
    fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.15
  headline:
    fontFamily: "Coiny, M PLUS Rounded 1c, ui-rounded, sans-serif"
    fontSize: "clamp(1.75rem, 3.6vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.005em"
  title:
    fontFamily: "M PLUS Rounded 1c, Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.3
  tagline:
    fontFamily: "M PLUS Rounded 1c, Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.9vw, 1.5rem)"
    fontWeight: 500
    lineHeight: 1.45
  body:
    fontFamily: "M PLUS Rounded 1c, Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  lede:
    fontFamily: "M PLUS Rounded 1c, Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "M PLUS Rounded 1c, Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  mono:
    fontFamily: "Maple Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "0.925rem"
    fontWeight: 400
    lineHeight: 1.6
  mono-frontmatter:
    fontFamily: "Maple Mono, ui-monospace, Cascadia Code, monospace"
    fontSize: "clamp(0.875rem, 1.6vw, 1rem)"
    fontWeight: 400
    lineHeight: 1.85
rounded:
  code: "6px"
  sm: "8px"
  tab: "10px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  section: "clamp(80px, 12vh, 128px)"
  close: "clamp(120px, 18vh, 180px)"
  panel-x: "24px"
  panel-y: "20px"
  row: "12px"
components:
  copy-button:
    backgroundColor: "{colors.bubblegum-pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 22px 11px"
  copy-button-hover:
    backgroundColor: "{colors.hot-pink}"
    textColor: "{colors.ink}"
  copy-button-done:
    backgroundColor: "{colors.pass-mint}"
    textColor: "{colors.ink}"
  install-panel:
    backgroundColor: "{colors.plum-panel}"
    textColor: "{colors.petal-text}"
    rounded: "{rounded.lg}"
    padding: "20px 20px 20px 24px"
  install-tab:
    textColor: "{colors.dusk-dim}"
    typography: "{typography.mono}"
    rounded: "{rounded.tab}"
    padding: "10px 16px 11px"
  install-tab-hover:
    backgroundColor: "{colors.plum-panel-hi}"
    textColor: "{colors.petal-text}"
  install-tab-selected:
    backgroundColor: "{colors.bubblegum-pink}"
    textColor: "{colors.ink}"
  front-matter-card:
    backgroundColor: "{colors.plum-panel}"
    textColor: "{colors.petal-text}"
    typography: "{typography.mono-frontmatter}"
    rounded: "{rounded.lg}"
    padding: "20px 24px 18px"
  tag-chip:
    textColor: "{colors.dream-lilac}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
  code-inline:
    backgroundColor: "{colors.plum-panel}"
    textColor: "{colors.dream-lilac}"
    rounded: "{rounded.code}"
    padding: "0.1em 0.4em"
  toc-link:
    textColor: "{colors.dusk-dim}"
    rounded: "{rounded.sm}"
    padding: "5px 10px"
  toc-link-current:
    backgroundColor: "{colors.bubblegum-pink}"
    textColor: "{colors.ink}"
  nav-link:
    textColor: "{colors.dusk-dim}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.bubblegum-pink}"
  roam-bubble:
    backgroundColor: "{colors.plum-panel-hi}"
    textColor: "{colors.lavender-text}"
    typography: "{typography.label}"
    rounded: "12px 12px 12px 4px"
    padding: "4px 10px 5px"
---

# Design System: purr

## Overview

**Creative North Star: "The Model Card"**

purr's site reads like its own local-model card: you land on the install line and the cat, then size it up the way you size up any model for your rig. The card grammar carries the whole world: a front-matter strip of `key: value` pairs, tag chips with purr's mode glyphs, quant-table style mono tables, and a tabbed install panel. Everything sits on deep plum grounds lifted straight from purr's TUI themes (`tui/themes.py`), so the site and the terminal app are one place.

It is cute on purpose and plain about the engineering. The cat (Mochi, the ASCII frames from purr's `tui/cat.py`) is the only character and the only animated mascot; she naps, wakes on hover, cheers on copy, follows the reader down the page in a small sticky slot, and changes mood per section. Density is low and calm: one narrow reading column (760px) under a wider hero, generous vertical breathing between blocks, two spot inks on dark.

The world refuses the gradient hero, the feature-card grid and the glowing terminal screenshot. It is dark always: the owner's hard rule and a brand commitment. There is no light mode, and nothing that fills the screen may be bright.

**Key Characteristics:**
- Dark plum grounds only; by day a slightly lighter cotton-candy plum, by night bubblegum-night with twinkling stars.
- Two spot inks, pink and lilac; mint only for passing things.
- Coiny for section heads, M PLUS Rounded 1c for prose, Maple Mono for the cat, code, tables and front matter.
- The wordmark is purr's own pixel logo, not set type.
- Soft, rounded panels with hairline borders; pills for actions and chips.
- Motion is eased and slow-settling: the logo's pixels assemble, react and pour; sections draw in; the cat roams and perches.

## Colors

Two spot inks over a family of deep plum neutrals, with a handful of state and mode colours borrowed from purr's TUI.

### Primary
- **Bubblegum Pink** (bubblegum-pink): the main ink. Section heads, links, the copy button, the selected install tab, the current TOC entry, the cat's body, the `$` prompt, focus rings, text selection, list markers, pin dots.
- **Hot Pink** (hot-pink): pink's pressed-in voice. Copy-button hover and the cat's bow and hearts. Never used for text blocks.

### Secondary
- **Dream Lilac** (dream-lilac): the second ink. Inline code, front-matter keys, tag chips, tool names in log lines, backend names, docs h3, the night-sky stars, and the left half of the pixel logo.
- **Moonlight** (moonlight): the cat's moon at night (it replaces her bow from 18:00 to 06:00).

### Tertiary
- **Pass Mint** (pass-mint): only for things that passed: the ✓ in log lines, the benchmark score, the copy button once it has copied.
- **Warn Peach** (warn-peach): the loop-caught ↺ in log lines; the chat mode colour.
- **Mode colours** (mode-learn-rose, mode-pair-periwinkle, mode-plan-cyan, plus pink, lilac, peach and mint): each of purr's seven modes keeps its TUI colour. Used only in the modes table row glyph and its 12% tinted hover fill, and in the cat's props for that mode.

### Neutral
- **Bubblegum Night** (bubblegum-night): the night page ground, also the `theme-color`.
- **Cotton Candy** (cotton-candy): the day page ground, applied by `:root.day` from 06:00 to 18:00. Every plum neutral has a cotton-candy twin one step lighter (cotton-panel, cotton-hairline, and so on); swap the whole set, never one token.
- **Plum Panel / Panel Hi** (plum-panel, plum-panel-hi): raised surfaces (install panel, front-matter card, log lines, docs code blocks, inline code) and their hover.
- **Plum Deep** (plum-deep): below the ground: the demo frame and scrollbar track.
- **Plum Hairline / Hairline Hi** (plum-hairline, plum-hairline-hi): 1px borders and table rules; the brighter one for chip outlines, table head rules, blockquote bars and pin leaders.
- **Plum Scroll** (plum-scroll): scrollbar thumb.
- **Petal Text** (petal-text): body text.
- **Dusk Dim** (dusk-dim): secondary text: nav, labels, captions, asides, table heads. Holds AA on every ground and panel, day and night.
- **Dusk Faint** (dusk-faint): decoration only (the `---` fences of front matter). It falls below AA on panels, so it never carries words.
- **Ink** (ink): text on pink or mint fills.

### Named Rules
**The Two Inks Rule.** Pink and lilac are the only inks. Any other colour must be a state (mint pass, peach warn) or a purr mode colour shown in its own mode's context.

**The Mint Means Passed Rule.** Mint appears only on something that passed or succeeded. Never as decoration or a third accent.

**The Always Dark Rule.** Every ground is a deep plum. Day mode lightens the plum one step; it never inverts. No light theme, no bright full-width fill.

## Typography

**Display Font:** Coiny (with M PLUS Rounded 1c, ui-rounded)
**Body Font:** M PLUS Rounded 1c (with Nunito, ui-rounded, system-ui)
**Label/Mono Font:** Maple Mono (with ui-monospace, Cascadia Code)

**Character:** A chunky, bubbly display face for a few loud words, a soft rounded sans that stays readable for long docs, and a cute mono that makes the card feel like terminal output. All three are self-hosted woff2.

### Hierarchy
- **Display** (Coiny 400, clamp(2.25rem, 5.5vw, 3.75rem), 1.15): the closing line ("Give her a folder."); docs page h1 uses the same voice at clamp(2.25rem, 5vw, 3.5rem)/1.1.
- **Headline** (Coiny 400, clamp(1.75rem, 3.6vw, 2.5rem), 1.15): landing section heads, in pink, balanced wrap. Docs h2 at clamp(1.5rem, 2.6vw, 2rem)/1.2.
- **Title** (Rounded 700, 1.2rem, 1.3): docs h3, in lilac. Docs h4 is Rounded 700 1rem in text colour.
- **Tagline** (Rounded 500, clamp(1.15rem, 1.9vw, 1.5rem), 1.45): the one hero sentence, max 30ch, with its key phrase in pink.
- **Body** (Rounded 400, 1.0625rem, 1.7): prose. Ledes 1.125rem at 60ch; asides 0.975rem dim at 64ch; docs paragraphs capped at 36em.
- **Label** (Rounded 500, 0.875rem): nav (0.9375rem), cat mood captions, scroll cue, footer, TOC.
- **Mono** (Maple Mono 400, 0.925rem, 1.6): tables, log lines, install tabs, commands; front matter at clamp(0.875rem, 1.6vw, 1rem)/1.85. Inline code at 0.9em.

### Named Rules
**The Mono Is Machine Rule.** Maple Mono is kept to the cat, code, commands, tables and front matter. Prose and headings never set in mono.

**The Coiny Is Loud Rule.** Coiny is for section heads, page titles and the copy button label only. Never for body or labels; never bold (it has one weight).

**The Logo Is Pixels Rule.** The wordmark is purr's own pixel logo (assets/logo.svg, from the TUI start screen), pink and lilac blocks with a shadow plum. Never retype "purr" as a heading in any font.

## Layout

A centred single column. The top bar and footer run to 1240px; the hero to 1040px; the card body to 760px; the close to 860px; docs use a 15rem sticky sidebar plus a 74ch column inside 1180px. Side padding is one fluid gutter (clamp(16px, 4vw, 40px)) everywhere.

The hero fills the first viewport (min-height 100svh minus the bar): cat and logo side by side, the tagline under the logo, then the install panel at full hero width, a prose line on backends, and a small "read the card" cue. Below it, card sections are separated by clamp(80px, 12vh, 128px) of air; the close gets clamp(120px, 18vh, 180px).

The repair log is a two-column grid: the mono line panel and a pinned note in the right margin (15.5rem), joined by a dotted leader and a pink dot. From 1240px the note sits fully in the margin.

At 720px and below: the hero stacks, the install body stacks with the copy button under the command, pinned notes drop under their lines, the eval table becomes a two-column grid, the closing command pill becomes a rounded box, the changelog nav link hides, and the roaming cat only perches on headings (she never walks the bottom edge, where she would cover text). At 900px the docs sidebar collapses into a folded "on this page" disclosure.

## Elevation & Depth

Mostly flat and tonal: depth comes from stepping plum values (deep, ground, panel, panel-hi) and 1px hairlines. Only three surfaces cast a shadow, and each shadow is soft, dark, and pulled in with a negative spread so it reads as a grounded lift rather than a glow.

### Shadow Vocabulary
- **Install lift** (`box-shadow: 0 8px 16px -10px rgba(0, 0, 0, 0.7)`): the install panel, the page's one primary action.
- **Screen lift** (`box-shadow: 0 10px 16px -8px rgba(0, 0, 0, 0.6)`): the demo video frame.

### Named Rules
**The No Glow Rule.** Shadows are black and tucked under; nothing glows in pink or lilac.

## Shapes

Soft and rounded throughout, never sharp. Panels and frames are 16px; inner boxes (log lines, docs code blocks and tables, mobile TOC) 12px; tabs 10px on top corners only; TOC links and small fills 8px; inline code 6px. Actions and chips are pills (999px). Borders are always 1px hairlines; the only other strokes are the 1.5px dotted pin leader and the 7px pin dot. The focus ring is a 2px pink outline at 3px offset with a 6px radius.

## Components

### Buttons
Squishy and sweet: a pink candy pill.
- **Shape:** full pill (999px).
- **Primary (copy):** pink fill, ink text, Coiny 1rem, padding 12px 22px 11px. The only filled button on the page; it appears in the install panel and the closing command pill (smaller: 0.95rem, 10px 18px 9px).
- **Hover / Active:** hot pink and a 1px rise; on press it sinks 1px and scales to 0.98, eased with the house curve.
- **Done:** mint fill and "copied ♥" for 1.8s, and the nearest cat cheers.

### Chips
- **Style:** tag chips in the front-matter title: lilac 0.75rem mono text, 1px hairline-hi outline, pill, each led by a pink purr mode glyph (✎ ✦ ♥).
- **State:** static; no selection states.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** plum panel on the ground; demo frame on plum deep.
- **Shadow Strategy:** flat except the three lifts in Elevation.
- **Border:** 1px plum hairline.
- **Internal Padding:** 20px 24px on panels; 14px 18px on log line boxes (which drop the border).

### Install panel (signature)
The page's primary action. A tab strip (curl / uv / arch / windows) in mono over a hairline, the active tab filled pink with a ♥ before its name; arrow keys, Home and End move between tabs and the choice is remembered. The body holds the command in Maple Mono with a pink `$` prompt that is never copied, and the copy pill on the right.

### Front-matter card (signature)
A panel whose title row is `owner / **name**` in mono with tag chips pushed right, then a YAML block: faint `---` fences, lilac keys, text values. Docs pages reuse the block (without the panel) for page, about and source.

### Tables
Quant-table style, in mono: full width, horizontal hairlines only, 12px cells. Heads are dim 0.8125rem regular. Numbers right-aligned with tabular figures; the headline score in mint 700 with a dim ± after it. The modes table tints the whole row with its mode colour at 12% on hover or focus, brightens the description, and tips the glyph (scale 1.25, rotate -8deg).

### Repair log with pinned notes (signature)
Mono log lines on a panel (tool names lilac, asides dim, ✓ mint, ↺ peach), each with a bold pink note pinned in the margin by a dotted leader and dot. On scroll the lines print in from the left and the note lands after.

### Navigation
- **Top bar:** pixel logo (21px tall) left; lowercase Rounded 500 links right in dim, pink on hover and for the current page. No underline, no pill.
- **Docs TOC:** sticky sidebar under a small cat; dim links on 8px rounded fills, panel on hover, pink fill with ink text for the section in view. Folded into a disclosure on small screens.
- **Links in prose:** pink with a thin underline at 45% pink, full pink on hover.

### The cat (signature)
Mochi is ASCII in Maple Mono, pink body, hot-pink bow and hearts, a moonlight moon instead of the bow at night, lilac or mode-coloured props. She is a button (pet her), with a Rounded dim mood caption under her. One large in the hero; one roaming free once the hero cat scrolls away (assets/roam.js): no box, just glyphs with a ground-coloured text-shadow, a speech-bubble caption that shows for 2.6s when her mood changes. On a desktop she walks the bottom edge facing where she goes, follows the mouse, wanders, and naps after 12s alone; when scrolling stops she hops in an arc onto the first line of the heading in the reading zone and takes that section's mood (the modes table swaps her scene on hover). Clicking her sends up floating ♥ ✧ ⋆ hearts (also on the hero cat and on copy). One in the docs sidebar reading along. With reduced motion she holds still frames and moves without arcs.

### Scenes

Each pinned note in "Why small models finish here" is acted out in its log panel (assets/scenes.js): context filling and compacting at 72%, a mis-indented edit matched and re-indented, a tool call written as text turned into a real call, syntax and ruff gates catching an undefined name, eight changes to one file triggering a step back, "done" held until the request is re-read and the tests pass, and plan-mode tickets moving from a big model to a small one. Grammar: a mono stage on the panel ground, a Rounded narration line whose speaker is named ("model" lilac, "purr ♥" pink, "!" peach, "✓" mint), state shown by colour, glyph and fill changes (gates, ticks, stamps, chips) with the house ease. Scenes loop only while on screen; the numbers are purr's real settings. The plain log lines stay in the DOM for screen readers, no JS and reduced motion.

### Live logo

The hero wordmark is drawn on a canvas from assets/logo.svg's pixel cells (assets/glyphs.js): cells fly in as ♥ ✧ ⋆ ✦ glyphs in a left-to-right sweep and lock into solid squares on a spring; the cursor knocks cells loose within 120px (they become glyphs and spring home); scrolling the hero away pours the cells into the install box, reversibly. The SVG stays in place at opacity 0 for its alt text and layout; the canvas sleeps when settled or off screen. Reduced motion: the plain SVG logo, no canvas.

## Do's and Don'ts

### Do:
- **Do** keep every ground a deep plum, and swap the full day/night set together (`:root.day` from 06:00 to 18:00).
- **Do** use pink for the one primary action and the things you point at, lilac for code and keys, and nothing else as an ink.
- **Do** keep mint for passed results and copied states only.
- **Do** use purr's own mode glyphs (✎ ◈ ✿ ⇄ ✦ ♥ ✧) and mode colours wherever a mode is named; they are the product's symbols.
- **Do** ease motion with the house curve (cubic-bezier(0.16, 1, 0.3, 1)) and long settles (0.9 to 1.2s for reveals), and turn every loop off under prefers-reduced-motion.
- **Do** write numbers with their ± and use tabular figures in tables.

### Don't:
- **Don't** add a light mode, a light section, or any bright full-width fill.
- **Don't** build a gradient hero, a feature-card grid, or a glowing terminal screenshot.
- **Don't** add a third ink or use a mode colour outside its mode.
- **Don't** set prose or headings in Maple Mono, or body text in Coiny.
- **Don't** retype the wordmark; use the pixel logo.
- **Don't** use dusk-faint for any text a person needs to read.
- **Don't** add coloured glows or hard offset shadows; the three soft lifts are the whole vocabulary.
