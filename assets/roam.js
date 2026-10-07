// Mochi out of her box. Once the hero cat scrolls away she jumps down onto the page: on a desktop she
// walks along the bottom edge and follows your cursor, naps when you leave her alone, and when you
// stop scrolling she hops up to sit on the heading you're reading (her mood is that section's).
// Click her and hearts float up. On a phone she only perches on headings, so she never covers text.

import { makeCat } from "./cat.js";

const HEART_GLYPHS = ["♥", "♥", "✧", "⋆"];

// little glyphs that float up with a wobble; shared with the hero cat
export function hearts(x, y, n = 7) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) n = 3;
  const bits = [];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "heart";
    s.textContent = HEART_GLYPHS[i % HEART_GLYPHS.length];
    s.setAttribute("aria-hidden", "true");
    document.body.append(s);
    bits.push({ s, x, y, vx: (Math.random() - 0.5) * 3.2, vy: -2.2 - Math.random() * 2.4,
      w: Math.random() * 6, life: 0, max: 70 + Math.random() * 40 });
  }
  let last = performance.now();
  (function tick(now) {
    const dt = Math.min(2.5, (now - last) / 16.67);
    last = now;
    for (const b of bits) {
      b.life += dt;
      b.vy = b.vy * Math.pow(0.97, dt) - 0.015 * dt; // floats, slowing
      b.vx *= Math.pow(0.95, dt);
      b.x += (b.vx + Math.sin((b.life + b.w * 10) / 9) * 0.5) * dt;
      b.y += b.vy * dt;
      const k = b.life / b.max;
      b.s.style.transform = `translate(${b.x}px, ${b.y}px) scale(${0.6 + Math.min(k * 3, 0.6)})`;
      b.s.style.opacity = String(1 - k * k);
    }
    const alive = bits.filter((b) => b.life < b.max);
    bits.filter((b) => b.life >= b.max).forEach((b) => b.s.remove());
    bits.splice(0, bits.length, ...alive);
    if (bits.length) requestAnimationFrame(tick);
  })(last);
}

export function roam({ heroCat, sections }) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth < 720 || matchMedia("(pointer: coarse)").matches;

  const el = document.createElement("div");
  el.className = "roam";
  el.innerHTML = '<span class="roam-bubble" aria-live="polite"></span><button class="roam-cat" type="button" aria-label="Pet Mochi"><pre class="cat" aria-hidden="true"></pre></button>';
  document.body.append(el);
  const bubble = el.querySelector(".roam-bubble");
  const pre = el.querySelector(".cat");
  let bubbleTimer = 0;
  const cat = makeCat(pre, bubble, "watching", () => {
    el.classList.add("talking");
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => el.classList.remove("talking"), 2600);
  });

  // where she is (viewport px, her top-left), and what she's up to
  let x = -200, y = innerHeight + 50, state = "away";
  let jump = null; // { fx, fy, to: () => [x, y], t, then }
  let perch = null; // the heading she sits on
  let goal = null, facing = 1;
  let px = null, pointerAt = 0, quietSince = performance.now(), wanderAt = 0;
  let size = [0, 0];

  const measure = () => { const r = pre.getBoundingClientRect(); size = [r.width, r.height]; };

  function floorSpot() { return [Math.min(Math.max(x, 12), innerWidth - size[0] - 12), innerHeight - size[1] - 10]; }

  function perchSpot(h) {
    const range = document.createRange();
    range.selectNodeContents(h);
    const rects = range.getClientRects();
    const r = rects[0] || h.getBoundingClientRect(); // she sits on the heading's first line, above the text
    const fs = parseFloat(getComputedStyle(h).fontSize);
    const left = Math.min(r.right - size[0] * 0.55, innerWidth - size[0] - 10);
    return [Math.max(10, left), r.top - size[1] + fs * 0.12];
  }

  function hop(to, then) {
    if (still) { [x, y] = to(); then?.(); return; }
    jump = { fx: x, fy: y, to, t: 0, then };
    cat.once("hop", 1);
  }

  function goFloor() {
    perch = null;
    if (phone()) return hop(() => [x, innerHeight + 40], () => { state = "away"; el.classList.remove("here"); });
    state = "floor";
    hop(floorSpot, () => cat.set("watching"));
  }

  function goPerch(h, section) {
    perch = h;
    state = "perch";
    hop(() => perchSpot(h), () => cat.set(section.dataset.liveMood || section.dataset.mood));
  }

  // she comes out when the hero cat is out of sight, and goes back when it's in view
  new IntersectionObserver(([e]) => {
    const gone = !e.isIntersecting && e.boundingClientRect.top < 0;
    if (gone && state === "away") {
      el.classList.add("here");
      measure();
      const r = heroCat.getBoundingClientRect();
      x = r.left; y = r.top;
      if (!pickPerch()) {
        if (phone()) { el.classList.remove("here"); return; }
        state = "floor";
        hop(floorSpot, () => cat.set("watching"));
      }
    } else if (!gone && state !== "away") {
      perch = null;
      state = "leaving";
      hop(() => { const r = heroCat.getBoundingClientRect(); return [r.left, r.top]; },
        () => { state = "away"; el.classList.remove("here"); });
    }
  }).observe(heroCat);

  // a heading in the reading zone is somewhere to sit
  function pickPerch() {
    for (const s of sections) {
      const h = s.querySelector("h2");
      if (!h) continue;
      const r = h.getBoundingClientRect();
      if (r.top > innerHeight * 0.14 && r.top < innerHeight * 0.62) {
        if (perch !== h) goPerch(h, s);
        return true;
      }
    }
    return false;
  }

  let scrollTimer = 0;
  addEventListener("scroll", () => {
    quietSince = performance.now();
    if (state === "away" || state === "leaving") return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (state === "away" || state === "leaving") return;
      if (!pickPerch() && state === "perch") goFloor();
    }, 160);
  }, { passive: true });

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    px = e.clientX; pointerAt = quietSince = performance.now();
  }, { passive: true });

  el.querySelector(".roam-cat").addEventListener("click", () => {
    cat.once("petted", 2);
    hearts(x + size[0] * 0.45, y + 4);
    quietSince = performance.now();
  });

  // the modes table changes her scene while she sits on "Modes"
  sections.forEach((s) => {
    s.addEventListener("cat-mood", () => { if (perch && s.contains(perch)) cat.set(s.dataset.liveMood); });
  });

  addEventListener("resize", () => { measure(); if (state === "floor") [x, y] = floorSpot(); });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(50, now - last) / 1000;
    last = now;
    if (state !== "away") {
      if (jump) {
        jump.t = Math.min(1, jump.t + dt / 0.55);
        const [tx, ty] = jump.to();
        const t = jump.t, e = 1 - (1 - t) ** 3;
        const arc = Math.min(140, 60 + Math.abs(ty - jump.fy) * 0.25);
        x = jump.fx + (tx - jump.fx) * e;
        y = jump.fy + (ty - jump.fy) * t - 4 * arc * t * (1 - t);
        if (t >= 1) { const then = jump.then; jump = null; then?.(); }
      } else if (state === "perch" && perch) {
        [x, y] = perchSpot(perch);
        const r = perch.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) goFloor();
      } else if (state === "floor") {
        y = innerHeight - size[1] - 10;
        const lazy = now - quietSince > 12000;
        const chasing = px !== null && now - pointerAt < 4000;
        if (chasing) goal = px - size[0] / 2;
        else if (!lazy && now > wanderAt) { goal = 40 + Math.random() * (innerWidth - size[0] - 80); wanderAt = now + 7000 + Math.random() * 6000; }
        if (goal !== null) goal = Math.min(Math.max(goal, 12), innerWidth - size[0] - 12);
        const dx = goal === null ? 0 : goal - x;
        if (Math.abs(dx) > 3 && !lazy) {
          facing = Math.sign(dx);
          x += facing * Math.min(Math.abs(dx), (chasing ? 190 : 90) * dt);
          if (!cat.busy) cat.set(facing > 0 ? "walk_r" : "walk_l");
        } else {
          goal = null;
          if (!cat.busy) cat.set(lazy ? "sleeping" : "watching");
        }
      }
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return cat;
}
