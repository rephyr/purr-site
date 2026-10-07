// The hero logo as live pixels. Every pixel of purr's start-screen logo (assets/logo.svg) is a cell
// on a canvas: on load the cells gather around the logo as little glyphs and lock into squares,
// your cursor knocks them loose (they turn back into glyphs and spring home), and as you scroll
// down they pour around the tagline into the install box. Scroll back up and they climb back.

const GLYPHS = ["♥", "✧", "⋆", "✦", "·", "♥", "✧"];
const R = 120; // how far the cursor reaches
const SPAN = 0.5; // how much of the scroll one cell's pour takes

export async function glyphLogo(hero, img, box) {
  const res = await fetch(img.src);
  if (!res.ok) throw new Error(`logo: ${res.status}`);
  const doc = new DOMParser().parseFromString(await res.text(), "image/svg+xml");
  const [, , vw, vh] = (doc.documentElement.getAttribute("viewBox") || "").split(" ").map(Number);
  if (!(vw > 0 && vh > 0)) throw new Error("logo: no viewBox");
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
      pour: 0.12 + (1 - y / vh) * 0.15 + Math.random() * 0.2, // bottom rows let go first
      u: Math.min(0.999, (x + Math.random()) / vw), // where along the free lanes it lands
      kick: 0, // how loose the cursor knocked it, 0..1
      via: 0, // going around the tagline: -1 off its left end, 1 off its right, 0 straight home
      pressed: 0, // frames spent held against the tagline
      ghost: 0, // frames left in which it may pass through the tagline (after being held too long)
    });
  }
  if (!cells.length) throw new Error("logo: no pixels");
  const pourEnd = Math.max(...cells.map((c) => c.pour)) + SPAN; // every cell is in the box by here

  const canvas = document.createElement("canvas");
  canvas.className = "glyph-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); throw new Error("logo: no canvas"); }
  hero.classList.add("glyphs-on");

  const bar = document.querySelector(".bar");
  const tagline = hero.querySelector(".tagline");
  const cat = hero.querySelector(".hero-cat");

  let W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
  }
  size();
  new ResizeObserver(() => { size(); wake(); }).observe(hero);

  // everyone starts as a glyph near the logo: above it and a little to the sides, never below
  {
    const hr = hero.getBoundingClientRect(), lr = img.getBoundingClientRect();
    const ox = lr.left - hr.left, oy = lr.top - hr.top;
    for (const c of cells) {
      c.px = ox + (Math.random() * 1.4 - 0.2) * lr.width;
      c.py = oy - 80 + Math.random() * (lr.height + 80);
      c.vx = (Math.random() - 0.5) * 3;
      c.vy = -Math.random() * 1.5; // drifting up, away from the tagline
      c.kick = 1;
    }
  }

  // 0 while the logo sits below the bar, 1 a little before the install box reaches it
  function progress() {
    const bh = bar ? bar.getBoundingClientRect().height : 0;
    const start = img.getBoundingClientRect().top + scrollY - (bh + 10);
    const end = Math.max(start + 60, box.getBoundingClientRect().top + scrollY - bh - 40);
    return Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
  }

  // the tagline's words themselves (not the paragraph's box), in client coordinates
  const range = document.createRange();
  function words() {
    if (!tagline) return null;
    range.selectNodeContents(tagline);
    const t = range.getBoundingClientRect();
    return t.width ? t : null;
  }

  // the stretches of the box's top edge the pour can reach without crossing the tagline (or the cat
  // when she sits beside it): the gaps between them, left to right, in canvas coordinates
  function lanes(hr, lr, br, t) {
    const left = br.left + 20, right = br.right - 20;
    const blocks = [];
    if (t) blocks.push([t.left - 18, t.right + 18]);
    if (cat) {
      const k = cat.getBoundingClientRect();
      if (k.bottom > lr.bottom && k.width) blocks.push([k.left - 12, k.right + 12]);
    }
    blocks.sort((a, b) => a[0] - b[0]);
    const out = [];
    let x = left;
    for (const [a, b] of blocks) {
      if (Math.min(a, right) - x >= 16) out.push([x, Math.min(a, right)]);
      x = Math.max(x, b);
    }
    if (right - x >= 16) out.push([x, right]);
    const open = out.length > 0;
    if (!open) out.push([left, right]); // nowhere clear: straight down, through the words
    return Object.assign(out.map(([a, b]) => [a - hr.left, b - hr.left]), { open });
  }

  const t0 = performance.now();
  let mx = -1e4, my = -1e4, last = 0, running = false, visible = true, idle = 0;
  let pointerSpeed = 0, lastX = 0, lastY = 0, lastT = 0; // px per 60fps frame, in client coordinates
  let poured = false, ringArmed = true, ringTimer = 0;

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const frames = Math.max(1, (e.timeStamp - lastT) / 16.67);
    if (lastT) pointerSpeed = Math.max(pointerSpeed, Math.hypot(e.clientX - lastX, e.clientY - lastY) / frames);
    lastX = e.clientX; lastY = e.clientY; lastT = e.timeStamp;
    mx = e.clientX - r.left; my = e.clientY - r.top;
    wake();
  });
  hero.addEventListener("pointerleave", () => { mx = my = -1e4; lastT = 0; });
  addEventListener("scroll", wake, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(hero);
  document.addEventListener("visibilitychange", wake);

  function wake() {
    idle = 0;
    if (running || !visible || document.hidden) return;
    // all poured into the box: nothing to draw until the scroll brings them back out
    if (poured) {
      if (progress() >= pourEnd) return;
      poured = false;
    }
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
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
    const p = progress();
    const since = now - t0;

    // the cursor only pushes while it moves: rest it on the logo and the pixels settle back
    pointerSpeed *= Math.pow(0.75, dt);
    if (pointerSpeed < 0.05) pointerSpeed = 0;
    const push = Math.min(1, pointerSpeed / 6);

    // the pour's lanes, laid end to end so each cell's u picks a spot on one of them
    const t = words();
    const ways = p > 0 ? lanes(hr, lr, br, t) : [];
    const total = ways.reduce((s, [a, b]) => s + b - a, 0);
    const by = br.top - hr.top + ch; // just inside the box's top edge, behind the panel

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.round(cw * 1.15)}px "Maple Mono", monospace`;

    // the words' box grown by half a glyph, in canvas coordinates: no glyph crosses it
    const g = cw * 0.6 + 4;
    const wall = t && { l: t.left - hr.left - g, r: t.right - hr.left + g, t: t.top - hr.top - g, b: t.bottom - hr.top + g };
    const inWall = (x, y) => x > wall.l && x < wall.r && y > wall.t && y < wall.b;

    // which side of the words a centre y is on: -1 above, 1 below, 0 level with them
    const side = (y) => (y <= wall.t ? -1 : y >= wall.b ? 1 : 0);

    let moving = 0, arrived = 0;
    for (const c of cells) {
      // where it belongs: in the logo, or poured into the install box
      let tx = ox + c.x * cw, ty = oy + c.y * ch;
      const q = Math.min(1, Math.max(0, (p - c.pour) / SPAN));
      if (q > 0) {
        let s = c.u * total, bx = ways[0][0];
        for (const [a, b] of ways) {
          if (s <= b - a) { bx = a + s; break; }
          s -= b - a;
        }
        // out to the side first, then down: the path bends around the tagline
        const ex = 1 - (1 - Math.min(1, q / 0.55)) ** 3;
        tx += (bx - cw / 2 - tx) * ex;
        ty += (by - ty) * q * q;
      }
      if (q >= 1) arrived++;
      // on its way around the words: it heads for just past the chosen end until it's level with
      // or past them on its home's side, so the spring doesn't pull it back under the words
      if (c.via) {
        const ts = wall ? side(ty + ch / 2) : 0, cs = wall ? side(c.py + ch / 2) : 0;
        if (!wall || ts === 0 || cs === ts) c.via = 0;
      }
      const hx = c.via < 0 ? wall.l - cw : c.via > 0 ? wall.r : tx;
      const started = since > c.delay;
      if (started) {
        const k = (q > 0 ? 0.12 : 0.075) * dt, damp = Math.pow(q > 0 ? 0.78 : 0.84, dt);
        c.vx = (c.vx + (hx - c.px) * k) * damp;
        c.vy = (c.vy + (ty - c.py) * k) * damp;
      } else {
        c.vx *= 0.96; c.vy *= 0.96; // drifting until its turn
      }
      // the cursor knocks cells loose
      const dx = c.px + cw / 2 - mx, dy = c.py + ch / 2 - my;
      const d = Math.hypot(dx, dy);
      if (push > 0 && d < R && q < 0.5) {
        const f = (1 - d / R) ** 2 * 2.6 * dt * push;
        c.vx += (dx / (d || 1)) * f;
        c.vy += (dy / (d || 1)) * f;
        c.kick = Math.min(1, c.kick + 0.2 * dt * push);
      }
      const was = [c.px + cw / 2, c.py + ch / 2];
      c.px += c.vx * dt;
      c.py += c.vy * dt;
      // a glyph that would cut across the tagline (a fast scroll, a flung cell) slides along its edge
      let held = false;
      if (wall && c.ghost <= 0 && (q === 0 || ways.open) && inWall(c.px + cw / 2, c.py + ch / 2) && !inWall(tx + cw / 2, ty + ch / 2)) {
        const above = was[1] <= wall.t;
        held = above || was[1] >= wall.b || was[0] <= wall.l || was[0] >= wall.r; // pressed to an edge
        if (above || was[1] >= wall.b) {
          c.py = above ? wall.t - ch / 2 : wall.b - ch / 2;
          c.vy = above ? Math.min(0, c.vy) : Math.max(0, c.vy);
          // where it's going is past the words: go around the nearer end
          if (above !== (ty + ch / 2 <= wall.t)) {
            const x = c.px + cw / 2;
            if (!c.via) c.via = x - wall.l < wall.r - x ? -1 : 1;
            c.vx = c.via * Math.max(3, Math.abs(c.vx));
          }
        } else if (was[0] <= wall.l) { c.px = wall.l - cw / 2; c.vx = Math.min(0, c.vx); }
        else if (was[0] >= wall.r) { c.px = wall.r - cw / 2; c.vx = Math.max(0, c.vx); }
      }
      // never stuck for good: held for over 1.5s, it slips through the words once
      c.pressed = held ? c.pressed + dt : 0;
      if (c.pressed > 90) { c.pressed = 0; c.via = 0; c.ghost = 45; }
      c.ghost = Math.max(0, c.ghost - dt);
      c.spin += c.vx * 0.012 * dt;
      const off = Math.hypot(tx - c.px, ty - c.py);
      const speed = Math.hypot(c.vx, c.vy);
      if (off > 0.4 || speed > 0.05) moving++;
      else { c.px = tx; c.py = ty; c.vx = c.vy = 0; c.spin *= 0.8; }
      c.kick = Math.max(0, c.kick - 0.025 * dt);

      // locked = a solid square; loose = its glyph. In between the square shrinks under the glyph
      const loose = Math.max(Math.min(1, off / (cw * 1.2)), c.kick * 0.9, smooth(0, 0.4, q));
      const fade = 1 - smooth(0.9, 1, q);
      if (fade <= 0) continue;
      ctx.fillStyle = c.fill;
      if (loose < 1) {
        const sw = (cw + 0.6) * (1 - loose), sh = (ch + 0.6) * (1 - loose);
        ctx.globalAlpha = fade;
        ctx.fillRect(c.px + (cw - sw) / 2, c.py + (ch - sh) / 2, sw, sh);
      }
      if (loose > 0) {
        ctx.globalAlpha = loose * fade;
        ctx.save();
        ctx.translate(c.px + cw / 2, c.py + ch / 2);
        ctx.rotate(c.spin);
        ctx.fillText(c.glyph, 0, 0);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    // more than half are in: the box rings once, and again only after they've climbed back out
    if (arrived > cells.length / 2) {
      if (ringArmed) {
        ringArmed = false;
        box.classList.add("landed");
        clearTimeout(ringTimer);
        ringTimer = setTimeout(() => box.classList.remove("landed"), 400);
      }
    } else ringArmed = true;

    // everything is in the box: the canvas is clear, so stop until the scroll brings them back
    if (arrived === cells.length) { poured = true; running = false; return; }

    // sleep once everything is home and nothing is happening
    idle = moving || push ? 0 : idle + 1;
    if (idle > 30 && since > 4000) { running = false; return; }
    requestAnimationFrame(frame);
  }
  wake();
}
