"""Subsets Maple Mono for the site: tools/fonts-src/maple-mono-*.woff2 (the full fonts, not shipped) ->
assets/fonts/maple-mono-*.woff2.

    uv run -q --with fonttools --with brotli python -I tools/subset_fonts.py
    PURR_DIR=/path/to/purr PURR_REF=v0.5.0 uv run ... tools/subset_fonts.py   # like build.py

Keeps broad Unicode blocks (so a new arrow or star on the page still has its glyph) plus every
character the site can show in mono: the landing, the templates, the scripts and styles, and purr's
Markdown that build.py turns into the docs pages. All OpenType layout features stay (calt, liga,
the cv/ss sets). Fails if a character the site uses, and the full font has, is not in the subset.
Run it again after the page or purr's docs gain new symbols.
"""

import html
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent.parent
SRC = HERE / "tools" / "fonts-src"
OUT = HERE / "assets" / "fonts"
FONTS = ["regular", "medium", "bold", "italic"]
PURR = Path(os.environ.get("PURR_DIR", HERE.parent / "purr")).resolve()
REF = os.environ.get("PURR_REF", "origin/main")

RANGES = [
    (0x0020, 0x007E),  # Basic Latin
    (0x00A0, 0x00FF),  # Latin-1
    (0x0100, 0x017F),  # Latin Extended-A
    (0x0300, 0x036F),  # Combining marks (the browser builds ≮ ↚ ⇍ from < ← ⇐ plus U+0338)
    (0x0370, 0x03FF),  # Greek (ω)
    (0x2000, 0x206F),  # General Punctuation
    (0x2190, 0x21FF),  # Arrows
    (0x2200, 0x22FF),  # Math Operators
    (0x2300, 0x23FF),  # Misc Technical
    (0x2500, 0x257F),  # Box Drawing
    (0x2580, 0x259F),  # Block Elements
    (0x25A0, 0x25FF),  # Geometric Shapes
    (0x2600, 0x26FF),  # Misc Symbols (☀ ☾ ♥)
    (0x2700, 0x27BF),  # Dingbats (✧ ✦ ✎ ✿)
]


def site_texts():
    """(name, text) of everything on the site that can be set in Maple Mono."""
    files = [HERE / "index.html", HERE / "404.html", HERE / "build.py"]
    files += sorted((HERE / "templates").glob("*.html"))
    files += sorted((HERE / "assets").glob("*.js")) + sorted((HERE / "assets").glob("*.css"))
    for f in files:
        if f.exists():
            yield f.name, f.read_text(encoding="utf-8")
    listed = subprocess.run(["git", "-C", PURR, "ls-tree", "-r", "--name-only", REF], check=True,
                            capture_output=True, text=True).stdout.split()
    docs = ["docs/guide.md", "docs/benchmarks.md", "CHANGELOG.md"]
    docs += [p for p in listed if re.fullmatch(r"benchmarks/[^/]+/README\.md", p)]
    for doc in docs:
        text = subprocess.run(["git", "-C", PURR, "show", f"{REF}:{doc}"], check=True,
                              capture_output=True, text=True).stdout
        yield f"purr:{doc}", text


def with_parts(cps):
    """The code points plus the pieces of their decompositions, which the browser falls back to."""
    return set(cps) | {ord(c) for cp in cps for c in unicodedata.normalize("NFD", chr(cp))}


def chars(name, text):
    """The characters a file shows, with JS, CSS and HTML escapes decoded."""
    if name.endswith((".js", ".py")):
        text = re.sub(r"\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})",
                      lambda m: chr(int(m[1] or m[2], 16)), text)
    if name.endswith(".css"):
        text = re.sub(r"\\([0-9a-fA-F]{1,6}) ?", lambda m: chr(int(m[1], 16)), text)
    if name.endswith((".html", ".md")):
        text = html.unescape(text)
    return {ord(c) for c in text if c.isprintable() or c == "\u00a0"}


def main():
    used = {}  # code point -> first file it was seen in
    for name, text in site_texts():
        for cp in chars(name, text):
            for part in with_parts([cp]):
                used.setdefault(part, name)
    wanted = set(used)
    for lo, hi in RANGES:
        wanted.update(range(lo, hi + 1))

    missing, in_font = [], set()
    for style in FONTS:
        src, out = SRC / f"maple-mono-{style}.woff2", OUT / f"maple-mono-{style}.woff2"
        full = TTFont(src)
        has = set(full.getBestCmap())
        in_font |= has
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]  # kern, liga, calt and the cv/ss sets
        opts.layout_scripts = ["*"]
        opts.name_IDs = ["*"]
        opts.name_languages = ["*"]
        opts.notdef_outline = True
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=sorted(wanted & has))
        sub.subset(full)
        subset.save_font(full, out, opts)

        kept = set(TTFont(out).getBestCmap())
        for cp in sorted((set(used) & has) - kept):
            missing.append(f"{style}: U+{cp:04X} {chr(cp)!r} (from {used[cp]})")
        before, after = TTFont(src), TTFont(out)
        print(f"maple-mono-{style}.woff2: {len(before.getGlyphOrder())} -> {len(after.getGlyphOrder())} glyphs, "
              f"{src.stat().st_size // 1024} -> {out.stat().st_size // 1024} KB")

    not_in_font = sorted(cp for cp in used if cp > 0x7E and cp not in in_font)
    if not_in_font:  # these were never Maple Mono's: the browser falls back for them either way
        print("not in Maple Mono at all:", " ".join(chr(cp) for cp in not_in_font))
    if missing:
        print("FAIL: characters the site uses are missing from the subset:", *missing, sep="\n  ")
        sys.exit(1)
    print(f"ok: all {len(used)} characters the site uses that Maple Mono has are kept")


if __name__ == "__main__":
    main()
