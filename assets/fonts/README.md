Fonts, all under the SIL Open Font License 1.1:

- Maple Mono (subframe7536/maple-font, v7 woff2 release): `MapleMono-LICENSE.txt`
- Coiny (Marcelo Magalhães, Google Fonts, latin subset)
- M PLUS Rounded 1c (M+ Fonts Project, Google Fonts, latin subset, 400/500/700)

The Maple Mono files here are subsets: Latin, Greek, punctuation, arrows, math, box drawing, blocks,
shapes, symbols and dingbats, plus every character the site and purr's docs pages use, with all
OpenType features kept. The full fonts live in `tools/fonts-src/`, outside `assets/`, so the build
doesn't ship them. After the page or purr's docs gain new symbols, make the subsets again:

    uv run -q --with fonttools --with brotli python -I tools/subset_fonts.py

It prints each font's glyph count and size, and fails if a character the site uses went missing.
The OFL allows subsetting; Maple Mono declares no Reserved Font Name, so the subsets keep their name.
