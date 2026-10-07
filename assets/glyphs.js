// The hero logo as live pixels. Every pixel of purr's start-screen logo (assets/logo.svg) is a cell
// on a canvas: on load the cells fly in as little glyphs and lock into squares, your cursor knocks
// them loose (they turn back into glyphs and spring home), and as you scroll down they pour into
// the install box. Scroll back up and they climb back into the logo.

const GLYPHS = ["♥", "✧", "⋆", "✦", "·", "♥", "✧"];
const R = 120; // how far the cursor reaches

export async function glyphLogo(hero, img, box) {
  const svg = await (await fetch(img.src)).text();
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const [, , vw, vh] = doc.documentElement.getAttribute("viewBox").split(" ").map(Number);
  const seen = new Set();
  const cells = [];
  for (const r of doc.querySelectorAll("rect")) {
    const x = +r.getAttribute("x"), y = +r.getAttribute("y");
    if (seen.has(`${x},${y}`)) continue;
    seen.add(`${x},${y}`);
    cells.push({
      x, y, fill: r.getAttribute("fill"),
      glyph: GLYPHS[(x * 7 + y * 3) % GLYPHS.length],
      px: 0, py: 0, vx: 0, vy: 0, spin: 0,
      delay: x * 28 + Math.random() * 380, // a sweep from left to right
      pour: (1 - y / vh) * 0.18 + Math.random() * 0.28, // bottom rows let go first
      lane: Math.random(),
      kick: 0, // how loose the cursor knocked it, 0..1
    });
  }

  const canvas = document.createElement("canvas");
  canvas.className = "glyph-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d");
  hero.classList.add("glyphs-on");

  let W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
  }
  size();
  new ResizeObserver(() => { size(); wake(); }).observe(hero);

  // everyone starts scattered over the hero
  for (const c of cells) {
    c.px = Math.random() * W;
    c.py = Math.random() * H * 0.9;
    c.vx = (Math.random() - 0.5) * 4;
    c.vy = (Math.random() - 0.5) * 4;
    c.kick = 1;
  }

  const t0 = performance.now();
  let mx = -1e4, my = -1e4, last = 0, running = false, visible = true, idle = 0;

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    wake();
  });
  hero.addEventListener("pointerleave", () => { mx = my = -1e4; });
  addEventListener("scroll", wake, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(hero);
  document.addEventListener("visibilitychange", wake);

  function wake() {
    idle = 0;
    if (!running && visible && !document.hidden) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    }
  }

  const smooth = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };

  function frame(now) {
    if (!visible || document.hidden) { running = false; return; }
    const dt = Math.min(2.5, (now - last) / 16.67); // in 60fps frames
    last = now;
    const hr = hero.getBoundingClientRect();
    const lr = img.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    const cw = lr.width / vw, ch = lr.height / vh;
    const ox = lr.left - hr.left, oy = lr.top - hr.top;
    const p = Math.min(1, Math.max(0, scrollY / (hr.height * 0.62)));
    const since = now - t0;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.round(cw * 1.15)}px "Maple Mono", monospace`;

    let moving = 0;
    for (const c of cells) {
      // where it belongs: in the logo, or poured into the install box
      let tx = ox + c.x * cw, ty = oy + c.y * ch;
      const q = Math.min(1, Math.max(0, (p - c.pour) / 0.42));
      const e = q * q;
      if (q > 0) {
        const bx = br.left - hr.left + 24 + c.lane * (br.width - 48);
        const by = br.top - hr.top + 6;
        tx += (bx - tx) * e;
        ty += (by - ty) * e;
      }
      const started = since > c.delay;
      if (started) {
        const k = 0.075 * dt, damp = Math.pow(0.84, dt);
        c.vx = (c.vx + (tx - c.px) * k) * damp;
        c.vy = (c.vy + (ty - c.py) * k) * damp;
      } else {
        c.vx *= 0.96; c.vy *= 0.96; // drifting until its turn
      }
      // the cursor knocks cells loose
      const dx = c.px + cw / 2 - mx, dy = c.py + ch / 2 - my;
      const d = Math.hypot(dx, dy);
      if (d < R && q < 0.5) {
        const f = (1 - d / R) ** 2 * 2.6 * dt;
        c.vx += (dx / (d || 1)) * f;
        c.vy += (dy / (d || 1)) * f;
        c.kick = Math.min(1, c.kick + 0.2 * dt);
      }
      c.px += c.vx * dt;
      c.py += c.vy * dt;
      c.spin += c.vx * 0.012 * dt;
      const off = Math.hypot(tx - c.px, ty - c.py);
      const speed = Math.hypot(c.vx, c.vy);
      if (off > 0.4 || speed > 0.05) moving++;
      else { c.px = tx; c.py = ty; c.vx = c.vy = 0; c.spin *= 0.8; }
      c.kick = Math.max(0, c.kick - 0.025 * dt);

      // locked = a solid square; loose = its glyph
      const loose = Math.max(Math.min(1, off / (cw * 1.2)), c.kick * 0.9, q > 0 ? 1 : 0);
      const fade = 1 - smooth(0.72, 1, e);
      if (fade <= 0) continue;
      if (loose < 1) {
        ctx.globalAlpha = (1 - loose) * fade;
        ctx.fillStyle = c.fill;
        ctx.fillRect(c.px, c.py, cw + 0.6, ch + 0.6);
      }
      if (loose > 0) {
        ctx.globalAlpha = loose * fade;
        ctx.fillStyle = c.fill;
        ctx.save();
        ctx.translate(c.px + cw / 2, c.py + ch / 2);
        ctx.rotate(c.spin);
        ctx.fillText(c.glyph, 0, 0);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    // sleep once everything is home and nothing is happening
    idle = moving ? 0 : idle + 1;
    if (idle > 30 && since > 4000) { running = false; return; }
    requestAnimationFrame(frame);
  }
  wake();
}
