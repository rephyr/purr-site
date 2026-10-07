import { makeCat, MODE_COLOUR, MOODS } from "./cat.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const html = document.documentElement;
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// purr's "auto" theme: cotton-candy by day, bubblegum-night (and stars) from 18 to 06.
// The inline script in <head> sets .day before the first paint.
const isNight = !html.classList.contains("day");

// twelve stars in the empty sky: a band along the top, the gutters beside the cat and the logo's
// heart, the strip under the cue. Spots (left %, top %) are tried in this order and any that
// would touch the hero's content is skipped, so phones get the same rule as desktops.
const sky = $(".hero-sky");
if (sky && isNight) {
  const spots = [[4, 6], [27, 12], [44, 5], [63, 10], [82, 5], [96, 13], [3, 32], [97, 34],
    [5, 60], [96, 62], [22, 96], [74, 95], [13, 9], [54, 13], [72, 4], [89, 10], [35, 7],
    [3, 46], [97, 48], [4, 76], [96, 78], [40, 97], [58, 96], [90, 94], [8, 93], [20, 4],
    [86, 41], [64, 3], [50, 98], [92, 22], [82, 99], [18, 99]];
  const clearOf = $$(".hero-cat .cat, .cat-label, .hero-logo, .tagline, .install, .then, .down");
  const place = () => {
    sky.textContent = "";
    const keep = clearOf.filter((el) => el.offsetParent).map((el) => el.getBoundingClientRect());
    let n = 0;
    for (const [x, y] of spots) {
      if (n === 12) break;
      const s = document.createElement("span");
      s.textContent = n % 3 ? "⋆" : "✧";
      s.style.left = `${x}%`;
      s.style.top = `${y}%`;
      s.style.fontSize = `${14 + (n * 7) % 11}px`;
      s.style.animationDelay = `${(n * 0.7) % 5}s`;
      sky.append(s);
      const r = s.getBoundingClientRect();
      if (keep.some((c) => r.left < c.right + 8 && r.right > c.left - 8 && r.top < c.bottom + 8 && r.bottom > c.top - 8)) {
        s.remove();
      } else n += 1;
    }
  };
  place();
  document.fonts?.ready.then(place); // the tagline can rewrap once its font arrives
  let width = innerWidth, t = 0;
  addEventListener("resize", () => {
    if (innerWidth === width) return; // a phone's address bar coming and going isn't a new layout
    width = innerWidth;
    clearTimeout(t);
    t = setTimeout(place, 200);
  });
}

// the pinned header casts a little shadow once the page moves under it
const bar = $(".bar");
let lastScroll = 0;
const stuck = () => bar.classList.toggle("stuck", scrollY > 4);
addEventListener("scroll", () => { stuck(); lastScroll = performance.now(); }, { passive: true });
stuck();

// one polite status line for screen readers; cleared first so the same words are said again
const status = $("#say");
let sayTimer = 0;
function say(text) {
  if (!status) return;
  status.textContent = "";
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => (status.textContent = text), 50);
}

// a mood the cat may not know yet (cat.js grows new ones) is skipped instead of breaking her
const play = (cat, mood, times) => cat && MOODS[mood] && cat.once(mood, times);

// ---------- the cats ----------

const hero = makeCat($('[data-cat="hero"]'), $('[data-cat-label="hero"]'), "watching");
const heroCat = $(".hero-cat");

// hearts come from roam.js; until it loads (or if it can't) there are none
let hearts = () => {};
let mochi = null;

// she says hello when you arrive, then keeps an eye on you
setTimeout(() => play(hero, "greeting", 2), still ? 0 : 700);
heroCat.addEventListener("click", () => {
  play(hero, "petted", 2);
  const r = $('[data-cat="hero"]').getBoundingClientRect();
  hearts(r.left + r.width * 0.4, r.top, 9);
  say("Mochi purrs ♥");
});
heroCat.addEventListener("pointerenter", () => hero.mood === "watching" && !hero.busy && play(hero, "waiting", 1));
$(".install").addEventListener("pointerenter", () => hero.mood === "watching" && !hero.busy && play(hero, "thinking", 1));

// the extras load on their own: a file that's missing costs only its own feature
(async () => {
  // the logo is made of live pixels (not with reduced motion: then it's the plain logo)
  if (still) return;
  try {
    const { glyphLogo } = await import("./glyphs.js");
    await glyphLogo($(".hero"), $(".hero-logo"), $(".install"));
  } catch {
    html.classList.add("logo-static");
  }
})();

(async () => {
  // once the hero cat is out of sight, Mochi roams the page
  try {
    const m = await import("./roam.js");
    hearts = m.hearts;
    mochi = m.roam({ heroCat, sections: $$("[data-mood]").filter((s) => s.querySelector("h2")) });
  } catch (e) {
    console.warn("purr: no roaming cat", e);
  }
})();

(async () => {
  // purr acts out each repair
  try {
    (await import("./scenes.js")).scenes();
  } catch (e) {
    console.warn("purr: no scenes", e);
  }
})();

// ---------- install tabs and copy ----------

const tabs = $$(".install-tabs [role=tab]");
function pick(tab, focus) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", on);
    t.tabIndex = on ? 0 : -1;
    $(`#${t.getAttribute("aria-controls")}`).hidden = !on;
  });
  if (focus) tab.focus();
  try { localStorage.setItem("purr-install-tab", tab.id); } catch {}
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => pick(t));
  t.addEventListener("keydown", (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) pick(tabs[(i + step + tabs.length) % tabs.length], true);
    if (e.key === "Home") pick(tabs[0], true);
    if (e.key === "End") pick(tabs[tabs.length - 1], true);
  });
});
try {
  const saved = document.getElementById(localStorage.getItem("purr-install-tab"));
  if (saved && tabs.includes(saved)) pick(saved);
  else if (/Win/.test(navigator.platform)) pick($("#tab-wsl"));
} catch {}

// the old way, when the clipboard API says no: select the command (without its prompt) and copy that
function copySelected(code) {
  const range = document.createRange();
  range.selectNodeContents(code);
  const prompt = $(".prompt", code);
  if (prompt) range.setStartAfter(prompt);
  const sel = getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  let ok = false;
  try { ok = document.execCommand("copy"); } catch {}
  if (ok) sel.removeAllRanges();
  return ok; // when it fails the selection stays, ready for ctrl+c
}

async function copy(text, btn, code) {
  const label = $(".copy-label", btn);
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    ok = copySelected(code);
  }
  if (ok) {
    label.textContent = "copied ♥";
    btn.classList.add("done");
    play(btn.closest(".hero") ? hero : mochi, "copied", 2);
    const r = btn.getBoundingClientRect();
    hearts(r.left + r.width / 2, r.top, 6);
    say("Install command copied");
  } else {
    label.textContent = "press ctrl+c";
    say("Couldn't copy. Select the command and copy it yourself.");
  }
  clearTimeout(btn._t);
  btn._t = setTimeout(() => { label.textContent = "copy"; btn.classList.remove("done"); }, ok ? 1800 : 4000);
}
$$("[data-copy]").forEach((btn) => btn.addEventListener("click", () => {
  const code = $(".install-body [role=tabpanel]:not([hidden]) code");
  copy(code.textContent.replace(/^[$>] /, ""), btn, code);
}));
$$("[data-copy-text]").forEach((btn) => btn.addEventListener("click", () => {
  copy(btn.dataset.copyText, btn, $("code", btn.parentElement));
}));

// the modes table: each row shows that mode's little scene (not when the page scrolls a row
// under a still pointer)
$$(".modes-table tr").forEach((row) => {
  const m = row.dataset.mode;
  row.style.setProperty("--mc", MODE_COLOUR[m]);
  row.addEventListener("pointerenter", () => {
    if (performance.now() - lastScroll < 150) return;
    $$(".modes-table tr.on").forEach((r) => r.classList.remove("on"));
    row.classList.add("on");
    const modes = $(".modes");
    modes.dataset.liveMood = `mode_${m}`;
    modes.dispatchEvent(new Event("cat-mood"));
  });
});

// ---------- the demo video ----------

const video = $(".screen video");
if (video) {
  const screen = video.closest(".screen");
  const sources = $$("source", video);
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    sources.forEach((s) => (s.src = s.dataset.src));
    video.load();
  };

  // no source would play: say so, with a way to see it anyway (the empty sources also fire
  // errors while the page parses, before they have a src; those don't count)
  const missing = () => {
    if (!loaded || $(".vid-missing", screen)) return;
    screen.innerHTML = '<p class="vid-missing">The demo didn\'t load. <a href="https://github.com/rephyr/purr">Watch it on GitHub</a>.</p>';
    const cap = $(".demo figcaption");
    if (cap) cap.hidden = true;
  };
  sources.at(-1)?.addEventListener("error", missing);
  video.addEventListener("error", missing);

  if (still) {
    video.controls = true; // still: it waits for you to press play
  } else {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "vid-toggle";
    const sync = () => {
      toggle.textContent = video.paused ? "play" : "pause";
      toggle.setAttribute("aria-pressed", video.paused);
    };
    toggle.addEventListener("click", () => {
      if (!video.paused) return video.pause();
      load();
      video.play().catch(() => {});
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
    screen.append(toggle);
  }

  // the video only downloads once it comes near. 300px, not more: the demo starts 420-540px under
  // the fold at common sizes, so a wider margin would fetch it on load
  const start = () => {
    load();
    if (!still) video.play().catch(() => {});
  };
  if ("IntersectionObserver" in window) {
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      start();
    }, { rootMargin: "300px 0px" });
    near.observe(video);
  } else start();
}

// ---------- things draw in as you scroll ----------

if (!still && "IntersectionObserver" in window) {
  const targets = [
    // not the card (.front): its top row peeks above the fold, so it's simply there from the start
    ...$$(".block h2, .lede, .aside, .demo figcaption, .privacy p, .close h2, .close-cmd, .close-links"),
    $(".screen"), $(".modes-table"), $(".eval-table"), ...$$(".log > li"),
  ].filter(Boolean);
  targets.forEach((t) => { if (!t.matches(".log > li, .modes-table, .eval-table")) t.classList.add("reveal"); });
  html.classList.add("reveal-on");
  const show = (t) => {
    t.classList.add("in");
    io.unobserve(t);
    // once the rows are in, hovering them shouldn't wait for their entrance delay
    setTimeout(() => $$("tr", t).forEach((r) => (r.style.transitionDelay = "")), 1400);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(e.target);
  }, { rootMargin: "0px 0px -12% 0px" });
  targets.forEach((t) => io.observe(t));
  // Tab can focus a link near the bottom edge, below where the observer counts it as seen: show it then
  const waiting = ".reveal:not(.in), .log > li:not(.in), .modes-table:not(.in), .eval-table:not(.in)";
  document.addEventListener("focusin", (e) => {
    for (let t = e.target.closest?.(waiting); t; t = t.parentElement?.closest(waiting)) show(t);
  });

  // table rows come in one after another
  $$(".modes-table tr, .eval-table tbody tr").forEach((r, i) => {
    r.style.transitionDelay = `${(i % 7) * 60}ms`;
  });
}
