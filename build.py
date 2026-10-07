"""Builds the site into _site/: the landing page and assets as they are, plus the docs pages made from
purr's own Markdown, so they never drift from the repo. The Markdown is read from a git ref of purr
(origin/main), never from the working tree, so a feature branch checked out there can't leak in.

    python build.py                 # reads purr from ../purr at origin/main
    PURR_DIR=/path/to/purr python build.py
    PURR_REF=v0.5.0 python build.py # another ref
    SITE_OUT=/tmp/x python build.py # build into another folder

Needs markdown-it-py (purr's own venv has it through Textual: ../purr/.venv/bin/python build.py).
"""

import html
import os
import re
import shutil
import subprocess
from pathlib import Path

from markdown_it import MarkdownIt

HERE = Path(__file__).resolve().parent
OUT = Path(os.environ.get("SITE_OUT", HERE / "_site")).resolve()  # SITE_OUT: build somewhere else
PURR = Path(os.environ.get("PURR_DIR", HERE.parent / "purr")).resolve()
REF = os.environ.get("PURR_REF", "origin/main")
REPO = "https://github.com/rephyr/purr"
BASE = "https://rephyr.github.io/purr-site/"

# source in purr -> (page folder, title, what it is, in the top nav, the cat's mood there)
PAGES = {
    "docs/guide.md": ("guide", "Guide", "Every purr command, mode and setting", True, "mode_learn"),
    "docs/benchmarks.md": ("benchmarks", "Benchmarks", "How purr is measured, and where the results are", True,
                           "mode_ask"),
    "CHANGELOG.md": ("changelog", "Changelog", "What changed in purr, release by release", True, "mode_plan"),
    "benchmarks/terminal-bench/README.md": (
        "benchmarks/terminal-bench", "Terminal-Bench",
        "purr's Terminal-Bench 2.1 runs, version by version, next to published scores of other harnesses "
        "on the same model", False, "mode_ask"),
    "benchmarks/deepswe/README.md": (
        "benchmarks/deepswe", "DeepSWE",
        "purr's DeepSWE 1.1 runs, next to published scores of other harnesses on the same model", False,
        "mode_ask"),
    "benchmarks/purr-bench/README.md": (
        "benchmarks/purr-bench", "purr bench",
        "purr against OpenCode on purr's own small tasks: not official, for improving the harness", False,
        "mode_ask"),
}
# a link to a page's source, or to the folder it's the README of, goes to the page here
SITE_LINKS = {}
for _src, (_slug, *_) in PAGES.items():
    SITE_LINKS[_src] = f"{_slug}/"
    if _src.endswith("/README.md"):
        SITE_LINKS[os.path.dirname(_src)] = f"{_slug}/"

# the first frame cat.js paints for each mood by day (makeCat repaints her on load):
# three lines of (cat, extra), extras in the mode's colour
EARS, SIT = " /\\_/\\♥", " > ^ < "
CAT_FRAMES = {
    "mode_learn": ("#f0829b", [(EARS, "  ╭──┬──╮"), ("( •ω• )", "  │≡≡│≡ │"), (SIT, "  ╰──┴──╯")]),
    "mode_ask": ("#c8a2f0", [(EARS, "     ╭─╮"), ("( •ω• )", "━━━━━│?│"), (SIT, "     ╰─╯")]),
    "mode_plan": ("#8fd8e8", [(EARS, "  ┌─┴─┴─┐"), ("( •ω• )", "  │☑ ── │"), (SIT, "  │☐ ── │")]),
}


def git(*args):
    return subprocess.run(["git", "-C", str(PURR), *args], capture_output=True, text=True, check=True).stdout


def show(src):
    return git("show", f"{REF}:{src}")


def is_tree(target):
    try:
        return git("cat-file", "-t", f"{REF}:{target}").strip() == "tree"
    except subprocess.CalledProcessError:
        return False


def updated(src):
    """The day the source last changed on REF, or "" when git can't say (a shallow clone only knows its tip)."""
    if git("rev-parse", "--is-shallow-repository").strip() == "true":
        return ""
    return git("log", "-1", "--format=%cs", REF, "--", src).strip()


def slugify(text, seen):
    """GitHub's heading ids, so links like guide.md#modes keep working."""
    s = re.sub(r"[^\w\- ]", "", text.strip().lower()).replace(" ", "-")
    n = seen.get(s, 0)
    seen[s] = n + 1
    return s if n == 0 else f"{s}-{n}"


def link_for(href, src, root):
    """A link in purr's Markdown, pointed at this site when the page is here, else at GitHub."""
    if re.match(r"^[a-z]+:|^#", href):
        return href
    path, _, anchor = href.partition("#")
    target = os.path.normpath(os.path.join(os.path.dirname(src), path)) if path else src
    anchor = f"#{anchor}" if anchor else ""
    if target in SITE_LINKS:
        return f"{root}{SITE_LINKS[target]}{anchor}"
    kind = "tree" if path.endswith("/") or is_tree(target) else "blob"
    return f"{REPO}/{kind}/main/{target}{anchor}"


def cat_frame(mood):
    """Her first frame as cat.js paints it, so she's there before the script runs."""
    colour, lines = CAT_FRAMES[mood]
    return "\n".join(
        html.escape(cat).replace("♥", '<span class="c-bow">♥</span>')
        + f'<span class="c-extra" style="color: {colour}">{html.escape(extra)}</span>'
        for cat, extra in lines
    )


def score_cell(cell):
    """Keeps a score with its ± and a date in one piece when a table column gets narrow."""
    cell = re.sub(r"((?:<strong>)?\d+(?:\.\d+)?%(?:</strong>)?) ± (\d+(?:\.\d+)?)", r'<span class="pm">\1 ± \2</span>',
                  cell)
    date = r'<time datetime="\1" style="white-space: nowrap">\1</time>'
    return "".join(part if part.startswith("<") else re.sub(r"\b(\d{4}-\d{2}-\d{2})\b", date, part)
                   for part in re.split(r"(<[^>]+>)", cell))  # text only, never inside a tag


def render(src, root):
    md = MarkdownIt("commonmark", {"html": False}).enable(["table", "strikethrough"])
    # the site only ever shows the solid heart: purr's Markdown has a hollow one or two (♡ chat)
    tokens = md.parse(show(src).replace("♡", "♥"))
    seen, toc, title = {}, [], None
    for i, tok in enumerate(tokens):
        if tok.type == "heading_open":
            text = tokens[i + 1].content.replace("`", "")
            if tok.tag == "h1" and title is None:
                title = text
            hid = slugify(text, seen)
            tok.attrSet("id", hid)
            if tok.tag in ("h2", "h3"):
                toc.append((tok.tag, hid, text))
        if tok.type == "inline":
            for child in tok.children or []:
                if child.type == "link_open":
                    child.attrSet("href", link_for(child.attrGet("href"), src, root))
                if child.type == "image":
                    child.attrSet("src", link_for(child.attrGet("src"), src, root).replace("/blob/", "/raw/"))
    body = md.renderer.render(tokens, md.options, {})
    body = re.sub(r"<h1[^>]*>.*?</h1>\n?", "", body, count=1)  # the page header shows it
    # tables and code scroll sideways on a phone: focusable, so a keyboard can scroll them too
    body = body.replace("<table>", '<div class="table-wrap" tabindex="0" role="region" aria-label="table"><table>')
    body = body.replace("</table>", "</table></div>").replace("<pre><code", '<pre tabindex="0"><code')
    body = re.sub(r"(<td[^>]*>)(.*?)(</td>)", lambda m: m[1] + score_cell(m[2]) + m[3], body)
    return title, body, toc


def pager(slug, root):
    """previous / next along the top nav (home at both ends); a results page goes back to Benchmarks."""
    def link(cls, word, href, text):
        return f'<a class="{cls}" href="{href}"><span class="dir">{word}</span> <span class="t">{text}</span></a>'

    home = (root, "home: install purr")
    pages = [(f"{root}{s}/", html.escape(n)) for s, n, _, nav, _ in PAGES.values() if nav]
    here = next(((s, nav) for s, _, _, nav, _ in PAGES.values() if s == slug))
    if not here[1]:
        parent = slug.rsplit("/", 1)[0]
        links = [link("prev", "previous", *next((u, t) for u, t in pages if u == f"{root}{parent}/"))]
    else:
        i = [u for u, _ in pages].index(f"{root}{slug}/")
        prev, nxt = ([home] + pages + [home])[i], ([home] + pages + [home])[i + 2]
        links = [link("prev", "previous", *prev), link("next", "next", *nxt)]
    return '<nav class="doc-pager" aria-label="More pages">\n  ' + "\n  ".join(links) + "\n</nav>"


def page(src, slug, name, about, mood, template, commit):
    root = "../" * (slug.count("/") + 1)
    title, body, toc = render(src, root)
    toc_html = "\n".join(
        f'<li class="toc-{tag}"><a href="#{hid}">{html.escape(text)}</a></li>' for tag, hid, text in toc
    )
    top = slug.split("/")[0]
    nav = "\n".join(
        f'<a href="{root}{s}/"{" aria-current=page" if s == top else ""}>{s}</a>'
        for s, _, _, in_nav, _ in PAGES.values() if in_nav
    )
    source_url = f"{REPO}/blob/main/{src}"
    front = f'<span class="k">source</span>: <a href="{source_url}">{src}</a> @ {commit}'
    day = updated(src)
    if day:
        front += f'\n<span class="k">updated</span>: <time datetime="{day}">{day}</time>'
    out = (template.replace("{{root}}", root)
           .replace("{{title}}", html.escape(name))
           .replace("{{heading}}", html.escape(title or name))
           .replace("{{description}}", html.escape(f"{about}, from purr's own docs.", quote=False).replace('"', "&quot;"))
           .replace("{{url}}", f"{BASE}{slug}/")
           .replace("{{base}}", BASE)
           .replace("{{source}}", src)
           .replace("{{source_url}}", source_url)
           .replace("{{front}}", front)
           .replace("{{mood}}", mood)
           .replace("{{cat}}", cat_frame(mood))
           .replace("{{nav}}", nav)
           .replace("{{toc}}", toc_html)
           .replace("{{pager}}", pager(slug, root))
           .replace("{{body}}", body))
    (OUT / slug).mkdir(parents=True, exist_ok=True)
    (OUT / slug / "index.html").write_text(out)


def main():
    if not (PURR / ".git").exists():
        raise SystemExit(f"no purr checkout at {PURR} (set PURR_DIR)")
    try:
        commit = git("rev-parse", "--short", f"{REF}^{{commit}}").strip()
    except subprocess.CalledProcessError:
        raise SystemExit(f"purr at {PURR} has no {REF} (git fetch there, or set PURR_REF)")
    shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir()
    shutil.copy(HERE / "index.html", OUT / "index.html")
    shutil.copy(HERE / "404.html", OUT / "404.html")
    shutil.copytree(HERE / "assets", OUT / "assets")
    (OUT / ".nojekyll").write_text("")
    template = (HERE / "templates/doc.html").read_text()
    for src, (slug, name, about, _, mood) in PAGES.items():
        page(src, slug, name, about, mood, template, commit)
    print(f"built {OUT} from {PURR} at {REF} ({commit})")


if __name__ == "__main__":
    main()
