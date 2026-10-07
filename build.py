"""Builds the site into _site/: the landing page and assets as they are, plus the docs pages made from
purr's own Markdown, so they never drift from the repo.

    python build.py                 # reads purr from ../purr
    PURR_DIR=/path/to/purr python build.py

Needs markdown-it-py (purr's own venv has it through Textual: ../purr/.venv/bin/python build.py).
"""

import html
import os
import re
import shutil
from pathlib import Path

from markdown_it import MarkdownIt

HERE = Path(__file__).resolve().parent
OUT = HERE / "_site"
PURR = Path(os.environ.get("PURR_DIR", HERE.parent / "purr")).resolve()
REPO = "https://github.com/rephyr/purr"

# source in purr -> (page folder, title, what it is)
PAGES = {
    "docs/guide.md": ("guide", "Guide", "every command, mode and setting"),
    "docs/benchmarks.md": ("benchmarks", "Benchmarks", "how purr is measured, and where the results are"),
    "CHANGELOG.md": ("changelog", "Changelog", "what changed, release by release"),
}
SITE_LINKS = {"README.md": "", **{src: f"{slug}/" for src, (slug, _, _) in PAGES.items()}}


def slugify(text, seen):
    """GitHub's heading ids, so links like guide.md#modes keep working."""
    s = re.sub(r"[^\w\- ]", "", text.strip().lower()).replace(" ", "-")
    n = seen.get(s, 0)
    seen[s] = n + 1
    return s if n == 0 else f"{s}-{n}"


def link_for(href, src):
    """A link in purr's Markdown, pointed at this site when the page is here, else at GitHub."""
    if re.match(r"^[a-z]+:|^#", href):
        return href
    path, _, anchor = href.partition("#")
    target = os.path.normpath(os.path.join(os.path.dirname(src), path)) if path else src
    anchor = f"#{anchor}" if anchor else ""
    if target in SITE_LINKS:
        return f"../{SITE_LINKS[target]}{anchor}"
    kind = "tree" if path.endswith("/") or (PURR / target).is_dir() else "blob"
    return f"{REPO}/{kind}/main/{target}{anchor}"


def render(src):
    md = MarkdownIt("commonmark", {"html": False}).enable(["table", "strikethrough"])
    tokens = md.parse((PURR / src).read_text())
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
                    child.attrSet("href", link_for(child.attrGet("href"), src))
                if child.type == "image":
                    child.attrSet("src", link_for(child.attrGet("src"), src).replace("/blob/", "/raw/"))
    body = md.renderer.render(tokens, md.options, {})
    body = re.sub(r"<h1[^>]*>.*?</h1>\n?", "", body, count=1)  # the page header shows it
    body = re.sub(r"<table>", '<div class="table-wrap"><table>', body).replace("</table>", "</table></div>")
    return title, body, toc


def page(src, slug, name, about, template):
    title, body, toc = render(src)
    toc_html = "\n".join(
        f'<li class="toc-{tag}"><a href="#{hid}">{html.escape(text)}</a></li>' for tag, hid, text in toc
    )
    nav = "\n".join(
        f'<a href="../{s}/"{" aria-current=page" if s == slug else ""}>{s}</a>' for s, _, _ in PAGES.values()
    )
    out = (template.replace("{{title}}", html.escape(name))
           .replace("{{heading}}", html.escape(title or name))
           .replace("{{about}}", html.escape(about))
           .replace("{{source}}", src)
           .replace("{{source_url}}", f"{REPO}/blob/main/{src}")
           .replace("{{nav}}", nav)
           .replace("{{toc}}", toc_html)
           .replace("{{body}}", body))
    (OUT / slug).mkdir(parents=True, exist_ok=True)
    (OUT / slug / "index.html").write_text(out)


def main():
    if not (PURR / "docs/guide.md").exists():
        raise SystemExit(f"no purr checkout at {PURR} (set PURR_DIR)")
    shutil.rmtree(OUT, ignore_errors=True)
    OUT.mkdir()
    shutil.copy(HERE / "index.html", OUT / "index.html")
    shutil.copytree(HERE / "assets", OUT / "assets")
    (OUT / ".nojekyll").write_text("")
    template = (HERE / "templates/doc.html").read_text()
    for src, (slug, name, about) in PAGES.items():
        page(src, slug, name, about, template)
    print(f"built {OUT} from {PURR}")


if __name__ == "__main__":
    main()
