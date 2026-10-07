# purr-site ♥

The website for [purr](https://github.com/rephyr/purr): a landing page, plus the guide, benchmarks and
changelog made from purr's own Markdown so they never drift from the repo.

```
../purr/.venv/bin/python build.py        # builds _site/ (reads purr from ../purr, or PURR_DIR)
python -m http.server -d _site 8000      # look at it on http://localhost:8000
```

- `index.html`, `assets/`: the landing page, written by hand. `assets/cat.js` has the cat's frames,
  ported from purr's `tui/cat.py`; `tools/logo.py` draws `assets/logo.svg` from purr's start-screen logo.
- `templates/doc.html` + `build.py`: the docs pages. Links between purr's docs stay on the site; every
  other link goes to GitHub.
- `.github/workflows/pages.yml`: builds and publishes on GitHub Pages (on push, and daily so the docs
  follow purr's main branch).

Fonts are self-hosted, no requests to anyone else: Maple Mono, Coiny and M PLUS Rounded 1c (all OFL).
