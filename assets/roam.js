// Mochi out of her box. Once the hero cat scrolls away she jumps down onto the page: on a desktop she
// walks along the bottom edge (in the side gutter when there's room) and comes to sit beside your
// cursor, naps when you leave her alone, and when you stop scrolling she hops up to sit on the heading
// you're reading (her mood is that section's). Click her while she's standing still and hearts float
// up. On a phone she only perches on headings, so she never covers text. She stays below the pinned
// bar, talks only when something happens, and her loop sleeps whenever she does nothing.

import { makeCat } from "./cat.js";

const HEART_GLYPHS = ["♥", "♥", "✧", "⋆"];

// little glyphs that float up with a wobble; shared with the hero cat and the docs cat.
// size is the glyph size in px (about the cat's own font size)
export function hearts(x, y, n = 7, { size = 18 } = {}) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // one heart that fades where it is
    const s = document.createElement("span");
    s.className = "heart";
    s.textContent = "♥";
    s.setAttribute("aria-hidden", "true");
    s.style.fontSize = `${size}px`;
    s.style.transform = `translate(${x - size * 0.3}px, ${y - size * 1.3}px)`;
    document.body.append(s);
    const fade = s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, easing: "ease-in", fill: "forwards" });
    fade.finished.then(() => s.remove(), () => s.remove());
    return;
  }
  const k = size / 18;
  const bits = [];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = i % 3 === 2 ? "heart lilac" : "heart";
    s.textContent = HEART_GLYPHS[i % HEART_GLYPHS.length];
    s.setAttribute("aria-hidden", "true");
    s.style.fontSize = `${size}px`;
    s.style.opacity = "0";
    document.body.append(s);
    bits.push({ s, x, y, vx: (Math.random() - 0.5) * 5 * k, vy: (-2.2 - Math.random() * 2.4) * k,
      w: Math.random() * 6, age: 0, born: i * 3, max: 70 + Math.random() * 40 }); // born ~50 ms apart
  }
  let last = performance.now();
  (function tick(now) {
    const dt = Math.min(2.5, Math.max(0, now - last) / 16.67);
    last = now;
    for (const b of bits) {
      b.age += dt;
      const life = b.age - b.born;
      if (life < 0) continue;
      b.vy = b.vy * Math.pow(0.97, dt) - 0.015 * dt; // floats, slowing
      b.vx *= Math.pow(0.95, dt);
      b.x += (b.vx + Math.sin((life + b.w * 10) / 9) * 0.5 * k) * dt;
      b.y += b.vy * dt;
      const f = life / b.max;
      b.s.style.transform = `translate(${b.x}px, ${b.y}px) scale(${0.6 + Math.min(f * 3, 0.6)})`;
      b.s.style.opacity = String(1 - f * f);
    }
    const done = (b) => b.age - b.born >= b.max;
    bits.filter(done).forEach((b) => b.s.remove());
    bits.splice(0, bits.length, ...bits.filter((b) => !done(b)));
    if (bits.length) requestAnimationFrame(tick);
  })(last);
}

export function roam({ heroCat, sections }) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth < 720 || matchMedia("(pointer: coarse)").matches;
  const bar = document.querySelector(".bar");
  const card = document.querySelector("article.card"); // the reading column
  const spots = sections.map((s) => [s.querySelector("h2"), s]).filter(([h]) => h);
  let barBottom = 0;
  const readBar = () => { barBottom = bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0; };
  readBar();

  const el = document.createElement("div");
  el.className = "roam";
  el.innerHTML = '<span class="roam-bubble" aria-hidden="true"></span><button class="roam-cat" type="button" aria-label="Pet Mochi"><pre class="cat" aria-hidden="true"></pre></button>';
  document.body.append(el);
  const bubble = el.querySelector(".roam-bubble");
  const btn = el.querySelector(".roam-cat");
  const pre = el.querySelector(".cat");
  btn.style.transformOrigin = "bottom";

  // she talks only when something happens: petted, a copy, a mode you pointed at, hello, a new heading.
  // At most one bubble per 5 s unless a click caused it.
  const QUIET = new Set(["walk_l", "walk_r", "hop", "watching", "sleeping", "yawning"]);
  let why = null, saidAt = -1e9, bubbleTimer = 0, bubbleBox = [0, 0];
  const cat = makeCat(pre, document.createElement("span"), "watching", (mood, line) => {
    if (!why || QUIET.has(mood) || !el.classList.contains("here")) return;
    const now = performance.now();
    if (why !== "click" && now - saidAt < 5000) return;
    saidAt = now;
    bubble.textContent = line;
    bubbleBox = [bubble.offsetWidth, bubble.offsetHeight];
    el.classList.add("talking");
    placeBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => el.classList.remove("talking", "hush"), 2600);
    wake();
  }, { watch: false });
  cat.pause(); // she's in her box
  const saying = (reason, fn) => { why = reason; try { fn(); } finally { why = null; } };

  // where she is (viewport px, her top-left), and what she's up to:
  // away (in the hero box), leaving (hopping back to it), waiting (out, hidden, no spot yet), floor, perch
  let x = -200, y = innerHeight + 50, state = "away", heroGone = false;
  let jump = null; // { fx, fy, to: () => [x, y], t, dur, then }
  let perch = null, sitOff = null; // the heading she sits on, and where its first line is inside it
  let goal = null, facing = 1, walking = false;
  let px = null, py = null, pointerAt = 0, quietSince = performance.now(), wanderAt = 0;
  let hopAt = -1e9; // when she last landed: she doesn't flip floor <-> perch more often than 1.5 s
  let size = [0, 0];
  const seen = new Set(); // headings she has landed on
  let greeted = false;

  const place = () => { el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; };
  const measure = () => { const r = pre.getBoundingClientRect(); size = [r.width, r.height]; };
  const here = () => el.classList.contains("here");
  function show() { if (!here()) { el.classList.add("here"); cat.resume(); } }
  function hide() { el.classList.remove("here", "talking", "hush", "passive"); cat.pause(); }

  // her body is 13ch wide, but what she holds (a terminal, a book, stars) can reach 19ch
  const wide = () => size[0] * 19 / 13;
  const clampX = (v) => Math.min(Math.max(v, 12), innerWidth - wide() - 12);
  const floorY = () => innerHeight - size[1] - 10;

  // keep her off the reading column when the side gutter has room for her (the column includes
  // what hangs out of the card, like the captions beside the repairs)
  function gutter(v) {
    if (!card || phone()) return v;
    const c = card.getBoundingClientRect();
    const colRight = c.left + Math.max(c.width, card.scrollWidth);
    if (c.left < size[0] + 24 || v + size[0] <= c.left || v >= colRight) return v;
    const left = Math.max(12, c.left - wide() - 12), right = colRight + 12;
    const rightFits = right + wide() <= innerWidth - 12;
    return !rightFits || v + size[0] / 2 < (c.left + colRight) / 2 ? left : right;
  }

  // she sits on a heading's first line, above the text; measured once per heading (and on resize)
  function offsetsOf(h) {
    const box = h.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(h);
    const r = range.getClientRects()[0] || box;
    return { right: r.right - box.left, top: r.top - box.top, fs: parseFloat(getComputedStyle(h).fontSize) };
  }
  function perchSpot(h = perch, o = sitOff) {
    const box = h.getBoundingClientRect();
    const left = Math.min(box.left + o.right - size[0] * 0.55, innerWidth - wide() - 10);
    return [Math.max(10, left), box.top + o.top - size[1] + o.fs * 0.12];
  }

  // one ballistic hop; she holds her hop pose until she lands
  function hop(to, then) {
    if (still) {
      [x, y] = to();
      jump = null;
      hopAt = performance.now();
      then?.();
      wake();
      return;
    }
    const [tx, ty] = to();
    jump = { fx: x, fy: y, to, t: 0, dur: 0.35 + Math.min(0.35, Math.hypot(tx - x, ty - y) / 1600), then };
    cat.once("hop", 99);
    wake();
  }

  function greet() {
    if (greeted) return;
    greeted = true;
    saying("hello", () => cat.once("greeting", 1));
  }

  function goFloor() {
    perch = null;
    sitOff = null;
    if (phone()) {
      state = "waiting"; // on a phone she drops out of sight until there's a heading to sit on
      return hop(() => [x, innerHeight + 40], () => { cat.set("watching"); hide(); });
    }
    state = "floor";
    const to = clampX(gutter(x));
    hop(() => [to, floorY()], () => { cat.set("watching"); greet(); });
  }

  function goPerch(h, section) {
    perch = h;
    sitOff = offsetsOf(h);
    state = "perch";
    const o = sitOff;
    hop(() => perchSpot(h, o), () => {
      const first = !seen.has(h);
      seen.add(h);
      saying(first ? "landing" : null, () => cat.set(section.dataset.liveMood || section.dataset.mood));
    });
  }

  // a heading near a third of the way down, with room above it for her and her bubble below the
  // bar, is somewhere to sit; at the very bottom of the page she takes the last one in view
  function findPerch() {
    const bottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
    let best = null, bestD = Infinity;
    for (const [h, s] of spots) {
      const r = h.getBoundingClientRect();
      if (r.top - size[1] - 34 <= barBottom) continue;
      if (bottom) {
        if (r.bottom < innerHeight) best = [h, s];
      } else if (r.top > innerHeight * 0.14 && r.top < innerHeight * 0.62) {
        const d = Math.abs(r.top - innerHeight * 0.3);
        if (d < bestD) { bestD = d; best = [h, s]; }
      }
    }
    return best;
  }

  function pickPerch() {
    const p = findPerch();
    if (!p) return false;
    if (p[0] !== perch) goPerch(...p);
    return true;
  }

  // out of the box (fromHero) or back from waiting: onto the best heading, else the floor
  function comeOut(fromHero) {
    measure();
    const p = findPerch();
    if (!p && phone()) { state = "waiting"; hide(); return; }
    const hidden = !here();
    if (fromHero) {
      const r = heroCat.getBoundingClientRect();
      x = r.left;
      y = Math.max(r.top, barBottom);
    } else if (hidden) {
      x = p ? perchSpot(p[0], offsetsOf(p[0]))[0] : clampX(gutter(innerWidth * 0.7));
      y = innerHeight + 20; // she hops up from below the screen
    }
    place();
    show();
    if (p) goPerch(...p);
    else goFloor();
  }

  // back into the box when the hero cat is in view again
  function goHome() {
    if (state === "waiting") { state = "away"; hide(); return; }
    perch = null;
    state = "leaving";
    hop(() => { const r = heroCat.getBoundingClientRect(); return [r.left, r.top]; }, () => {
      if (heroGone) { // you scrolled back down while she was on her way
        y = Math.max(y, barBottom);
        state = "floor";
        if (!pickPerch()) goFloor();
        return;
      }
      state = "away";
      cat.set("watching");
      hide();
    });
  }

  // she comes out when the hero cat is out of sight (under the bar counts), and goes back when it's in view
  let io = null, ioMargin = -1;
  function watchHero() {
    const m = Math.round(barBottom);
    if (m === ioMargin) return;
    ioMargin = m;
    io?.disconnect();
    io = new IntersectionObserver(([e]) => {
      heroGone = !e.isIntersecting && e.boundingClientRect.top < innerHeight / 2;
      if (heroGone) {
        if (state === "away" || state === "waiting") comeOut(state === "away");
        // while she's leaving, the leave hop sees heroGone when it lands
      } else if (state !== "away" && state !== "leaving") goHome();
      wake();
    }, { rootMargin: `-${m}px 0px 0px 0px` });
    io.observe(heroCat);
  }
  watchHero();

  // her heading went under the bar or off the screen: down at once, not after the scroll stops
  function perchLost() {
    if (state !== "perch" || !perch) return false;
    const r = perch.getBoundingClientRect();
    if (r.top - size[1] < barBottom + 4 || r.top > innerHeight) { goFloor(); return true; }
    return false;
  }

  // when the scrolling stops she looks for somewhere to sit
  let scrollTimer = 0;
  function settle() {
    clearTimeout(scrollTimer);
    if (state === "leaving" || state === "away" && !heroGone) return;
    if (jump) { scrollTimer = setTimeout(settle, 200); return; }
    const wait = hopAt + 1500 - performance.now(); // (out of sight she can come back at once)
    if (wait > 0 && here()) { scrollTimer = setTimeout(settle, wait + 20); return; }
    if (state === "away" || state === "waiting") { if (heroGone) comeOut(false); }
    else if (!pickPerch() && state === "perch") goFloor();
  }

  addEventListener("scroll", () => {
    quietSince = performance.now();
    if (state === "leaving") return;
    perchLost();
    if (state === "perch" || state === "floor") wake(true);
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(settle, 160);
  }, { passive: true });

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || (e.clientX === px && e.clientY === py)) return;
    px = e.clientX;
    py = e.clientY;
    pointerAt = quietSince = performance.now();
    if (state === "floor") wake();
  }, { passive: true });

  btn.addEventListener("click", () => {
    saying("click", () => cat.once("petted", 2));
    const fs = parseFloat(getComputedStyle(pre).fontSize) || 15;
    hearts(x + size[0] * 0.45, y + 4, 7, { size: Math.round(fs * 1.15) });
    quietSince = performance.now();
    const say = document.getElementById("say");
    if (say) {
      say.textContent = "";
      setTimeout(() => { say.textContent = "Mochi purrs ♥"; }, 60);
    }
    wake();
  });

  // the modes table changes her scene while she sits on "Modes"; she says so if you pointed at it
  spots.forEach(([, s]) => {
    s.addEventListener("cat-mood", () => {
      if (!perch || !s.contains(perch)) return;
      const pointed = performance.now() - pointerAt < 400;
      saying(pointed ? "mode" : null, () => cat.set(s.dataset.liveMood));
      wake();
    });
  });

  // keyboard focus is never hidden under her: she moves to the other half of the screen
  addEventListener("focusin", (e) => {
    requestAnimationFrame(() => {
      if (!here() || e.target === btn || !(e.target instanceof Element)) return;
      const r = e.target.getBoundingClientRect();
      if (r.right < x || r.left > x + size[0] || r.bottom < y || r.top > y + size[1]) return;
      if (state === "perch") goFloor();
      else if (state === "floor") {
        const to = clampX(gutter(x + size[0] / 2 < innerWidth / 2 ? innerWidth * 0.75 : innerWidth * 0.25 - size[0]));
        goal = null;
        pointerAt = 0;
        wanderAt = performance.now() + 9000;
        hop(() => [to, floorY()], () => cat.set("watching"));
      }
    });
  });

  addEventListener("resize", () => {
    readBar();
    watchHero();
    measure();
    if (perch) sitOff = offsetsOf(perch);
    if (state === "floor" && !jump) {
      if (phone()) { if (!pickPerch()) goFloor(); }
      else { x = clampX(x); y = floorY(); }
    }
    perchLost();
    wake(true);
  });
  document.fonts?.ready.then(() => { measure(); if (perch) sitOff = offsetsOf(perch); wake(true); });

  // the bubble stays on screen, and hushes over a playing scene or under the bar
  function placeBubble() {
    if (!el.classList.contains("talking")) return;
    const [w, h] = bubbleBox;
    const bx = Math.min(0, innerWidth - 8 - (x + w));
    bubble.style.setProperty("--bx", `${bx}px`);
    bubble.classList.toggle("flip", bx < 0);
    const left = x + bx, bottom = y - 6, top = bottom - h;
    const over = top < barBottom || [...document.querySelectorAll(".sc.playing")].some((s) => {
      const r = s.getBoundingClientRect();
      return r.left < left + w && r.right > left && r.top < bottom && r.bottom > top;
    });
    el.classList.toggle("hush", over);
  }

  // her loop runs only while she has something to do: a hop, a walk, a perch to follow, a bubble
  let running = false, last = 0, aliveUntil = 0, napTimer = 0;
  function wake(track) {
    if (track) aliveUntil = performance.now() + 250;
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  // when she's standing on the floor with nothing to do: look again when it's time to wander or nap
  function later(now) {
    clearTimeout(napTimer);
    if (state !== "floor" || still || now - quietSince > 12000) return;
    const chasing = px !== null && now - pointerAt < 4000;
    const at = Math.min(quietSince + 12000, chasing ? pointerAt + 4000 : wanderAt);
    napTimer = setTimeout(wake, Math.max(60, at - now + 20));
  }

  function frame(now) {
    const dt = Math.min(50, Math.max(0, now - last)) / 1000;
    last = now;
    walking = false;
    if (jump) {
      jump.t = Math.min(1, jump.t + dt / jump.dur);
      const [tx, ty] = jump.to();
      const t = jump.t;
      // x straight across, y along a parabola whose top is a little above both ends (never up under
      // the bar): a quadratic Bezier with its control point placed so the curve tops out at the peak
      const fy = jump.fy;
      const peak = Math.max(barBottom, Math.min(fy, ty) - (40 + Math.min(80, Math.abs(tx - jump.fx) * 0.1)));
      const c = peak - Math.sqrt(Math.max(0, (fy - peak) * (ty - peak)));
      x = jump.fx + (tx - jump.fx) * t;
      y = (1 - t) ** 2 * fy + 2 * (1 - t) * t * c + t * t * ty;
      if (t >= 1) {
        const then = jump.then;
        jump = null;
        hopAt = now;
        btn.animate([{ transform: "scaleY(0.9)" }, { transform: "none" }], { duration: 120, easing: "ease-out" });
        then?.();
        if (state === "perch") aliveUntil = Math.max(aliveUntil, now + 1200); // her heading may still be drawing in
      }
    } else if (state === "perch" && perch) {
      [x, y] = perchSpot();
    } else if (state === "floor") {
      y = floorY();
      if (!still) { // with reduced motion she stays where she landed
        const lazy = now - quietSince > 12000;
        const chasing = px !== null && now - pointerAt < 4000;
        // she comes to sit beside the cursor; once she's stopped, a cursor on her or close by is for
        // petting, so she doesn't step away from it
        const close = px !== null && Math.abs(px - (x + size[0] / 2)) < size[0] / 2 + 40;
        if (chasing && !(goal === null && close)) goal = px > x + size[0] / 2 ? px - size[0] - 28 : px + 28;
        else if (!chasing && !lazy && now > wanderAt) {
          goal = gutter(40 + Math.random() * (innerWidth - size[0] - 80));
          wanderAt = now + 7000 + Math.random() * 6000;
        }
        if (goal !== null) goal = clampX(goal);
        const dx = goal === null ? 0 : goal - x;
        if (Math.abs(dx) > 3 && !lazy) {
          walking = true;
          facing = Math.sign(dx);
          x += facing * Math.min(Math.abs(dx), (chasing ? 190 : 90) * dt);
          if (!cat.busy) cat.set(facing > 0 ? "walk_r" : "walk_l");
        } else {
          goal = null;
          if (!cat.busy) cat.set(lazy ? "sleeping" : "watching");
        }
      }
    }
    if (here() || jump) place();
    el.classList.toggle("passive", !!jump || walking); // she can only be petted standing still
    placeBubble();
    const busy = jump || walking || now < aliveUntil || el.classList.contains("talking");
    if (busy && (here() || jump)) requestAnimationFrame(frame);
    else { running = false; later(now); }
  }
  wake();

  // cat.once() from the page (a copy) is something worth saying
  return {
    set: (m) => cat.set(m),
    once: (m, n) => { saying("click", () => cat.once(m, n)); wake(); },
    pause: cat.pause,
    resume: cat.resume,
    get mood() { return cat.mood; },
    get busy() { return cat.busy; },
  };
}
