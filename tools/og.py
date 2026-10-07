"""Makes the share image, assets/og.png (1200x630): a capture of the landing hero, the cat, the logo,
the tagline and the install command, with the header and the roaming Mochi hidden.

    uv run -q --with playwright --with pillow python -I tools/og.py            # builds the site itself
    uv run -q --with playwright --with pillow python -I tools/og.py --day      # the day hero
    uv run -q --with playwright --with pillow python -I tools/og.py --url http://127.0.0.1:8000/

Without --url it builds the site into a temp folder (with purr's venv python, as build.py says) and
serves it on a free port. Run it again whenever the hero changes. Needs a Playwright Chromium:
`uv run --with playwright playwright install chromium`, or point CHROME at a chrome binary.
"""

import argparse
import functools
import http.server
import io
import os
import subprocess
import sys
import tempfile
import threading
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent.parent
OUT = HERE / "assets" / "og.png"
W, H = 1200, 630
ZOOM = 1.2  # laid out at 1000x525 CSS px, so the hero fills the frame
MAX_BYTES = 300_000
PURR_PY = HERE.parent / "purr" / ".venv" / "bin" / "python"


def tz_at(hour):
    """A fixed-offset zone where it is `hour` o'clock now: the page picks day or night from the clock."""
    off = (hour - datetime.now(timezone.utc).hour + 12) % 24 - 12  # -12..11
    return "Etc/UTC" if off == 0 else f"Etc/GMT{-off:+d}"  # Etc/GMT signs are flipped


def serve(folder):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass

    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=folder))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_port}/"


def shoot(url, night):
    with sync_playwright() as p:
        chrome = os.environ.get("CHROME")
        browser = p.chromium.launch(**({"executable_path": chrome} if chrome else {}))
        page = browser.new_page(viewport={"width": round(W / ZOOM), "height": 1200}, device_scale_factor=ZOOM,
                                reduced_motion="reduce", color_scheme="dark",
                                timezone_id=tz_at(22 if night else 12))
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        # only the hero's cat, logo, tagline and install box (and its night sky); no header, no Mochi
        clip = page.evaluate("""([w, h]) => {
          for (const el of document.querySelectorAll('.bar, .roam')) el.style.display = 'none';
          const keep = [...document.querySelectorAll('.hero-top, .install, .hero-sky')];
          for (const el of document.body.querySelectorAll('*'))
            if (!keep.some(k => k.contains(el) || el.contains(k))) el.style.visibility = 'hidden';
          const box = () => {
            const rs = [...document.querySelectorAll('.hero-top, .install')].map(e => e.getBoundingClientRect());
            const top = Math.min(...rs.map(r => r.top)), bottom = Math.max(...rs.map(r => r.bottom));
            return [top + scrollY, bottom + scrollY];
          };
          let [top, bottom] = box();
          const pad = h / 2 - (top + bottom) / 2;  // room above, so the hero can sit in the middle
          if (pad > 0) { document.documentElement.style.paddingTop = pad + 'px'; [top, bottom] = box(); }
          return {x: 0, y: Math.round((top + bottom) / 2 - h / 2), width: w, height: h};
        }""", [round(W / ZOOM), round(H / ZOOM)])
        page.wait_for_timeout(300)
        png = page.screenshot(type="png", clip=clip, full_page=True)
        browser.close()
    img = Image.open(io.BytesIO(png)).convert("RGB")
    return img if img.size == (W, H) else img.resize((W, H), Image.LANCZOS)


def save(img):
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    if buf.tell() > MAX_BYTES:  # too big: fewer colours, still smooth on a dark plum
        buf = io.BytesIO()
        img.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(
            buf, "PNG", optimize=True)
    OUT.write_bytes(buf.getvalue())
    return buf.tell()


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--url", help="a served build of the site (default: build and serve one)")
    ap.add_argument("--day", action="store_true", help="the day hero (default: night, with its stars)")
    args = ap.parse_args()
    if args.url:
        img = shoot(args.url, not args.day)
    else:
        with tempfile.TemporaryDirectory() as tmp:
            py = str(PURR_PY) if PURR_PY.exists() else sys.executable
            subprocess.run([py, "build.py"], cwd=HERE, env={**os.environ, "SITE_OUT": tmp}, check=True)
            srv, url = serve(tmp)
            try:
                img = shoot(url, not args.day)
            finally:
                srv.shutdown()
    size = save(img)
    print(f"wrote {OUT.relative_to(HERE)}: {img.width}x{img.height}, {size // 1024} KB")


if __name__ == "__main__":
    main()
