import { makeCat, MODE_COLOUR } from "./cat.js";
import { glyphLogo } from "./glyphs.js";
import { roam, hearts } from "./roam.js";
import { scenes } from "./scenes.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

// purr's "auto" theme: cotton-candy by day, bubblegum-night (and stars) from 18 to 06
const hour = new Date().getHours();
const isNight = hour < 6 || hour >= 18;
document.documentElement.classList.toggle("day", !isNight);

const sky = $(".hero-sky");
if (sky && isNight) {
  const spots = [[6, 12], [18, 64], [31, 8], [47, 22], [58, 74], [72, 14], [86, 40], [93, 70], [12, 88], [64, 92], [79, 84], [38, 52]];
  spots.forEach(([x, y], i) => {
    const s = document.createElement("span");
    s.textContent = i % 3 ? "⋆" : "✧";
    s.style.left = `${x}%`;
    s.style.top = `${y}%`;
    s.style.fontSize = `${10 + (i * 7) % 9}px`;
    s.style.animationDelay = `${(i * 0.7) % 5}s`;
    sky.append(s);
  });
}

// ---------- the cats ----------

const hero = makeCat($('[data-cat="hero"]'), $('[data-cat-label="hero"]'), "watching");
const heroCat = $(".hero-cat");

// she says hello when you arrive, then keeps an eye on you
setTimeout(() => hero.once("greeting", 2), still ? 0 : 700);
heroCat.addEventListener("click", () => {
  hero.once("petted", 2);
  const r = $('[data-cat="hero"]').getBoundingClientRect();
  hearts(r.left + r.width * 0.4, r.top, 9);
});
$(".install").addEventListener("pointerenter", () => hero.mood === "watching" && !hero.busy && hero.once("thinking", 1));

// the logo is made of live pixels (not with reduced motion: then it's the plain logo)
if (!still) glyphLogo($(".hero"), $(".hero-logo"), $(".install")).catch(() => {});

// once the hero cat is out of sight, Mochi roams the page
const sections = $$("[data-mood]").filter((s) => s.querySelector("h2"));
const buddy = roam({ heroCat, sections });

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

async function copy(text, btn) {
  const label = $(".copy-label", btn);
  try {
    await navigator.clipboard.writeText(text);
    label.textContent = "copied ♥";
    btn.classList.add("done");
    (btn.closest(".hero") ? hero : buddy).once("proud", 2);
    const r = btn.getBoundingClientRect();
    hearts(r.left + r.width / 2, r.top, 6);
  } catch {
    label.textContent = "select it";
  }
  setTimeout(() => { label.textContent = "copy"; btn.classList.remove("done"); }, 1800);
}
$$("[data-copy]").forEach((btn) => btn.addEventListener("click", () => {
  const code = $(".install-body [role=tabpanel]:not([hidden]) code");
  copy(code.textContent.replace(/^[$>] /, ""), btn);
}));
$$("[data-copy-text]").forEach((btn) => btn.addEventListener("click", () => copy(btn.dataset.copyText, btn)));

// the modes table: each row shows that mode's little scene
$$(".modes-table tr").forEach((row) => {
  const m = row.dataset.mode;
  row.style.setProperty("--mc", MODE_COLOUR[m]);
  const show = () => {
    $$(".modes-table tr.on").forEach((r) => r.classList.remove("on"));
    row.classList.add("on");
    const modes = $(".modes");
    modes.dataset.liveMood = `mode_${m}`;
    modes.dispatchEvent(new Event("cat-mood"));
  };
  row.addEventListener("pointerenter", show);
  row.addEventListener("focus", show);
});

// ---------- purr acts out each repair ----------

scenes();

// ---------- things draw in as you scroll ----------

if (!still && "IntersectionObserver" in window) {
  const targets = [
    ...$$(".front, .block h2, .lede, .aside, .demo figcaption, .privacy p, .close h2, .close-cmd, .close-links"),
    $(".screen"), $(".modes-table"), $(".eval-table"), ...$$(".log > li"),
  ].filter(Boolean);
  targets.forEach((t) => { if (!t.matches(".log > li, .modes-table, .eval-table")) t.classList.add("reveal"); });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
      // once the rows are in, hovering them shouldn't wait for their entrance delay
      setTimeout(() => $$("tr", e.target).forEach((r) => (r.style.transitionDelay = "")), 1400);
    }
  }, { rootMargin: "0px 0px -12% 0px" });
  targets.forEach((t) => io.observe(t));

  // table rows come in one after another
  $$(".modes-table tr, .eval-table tbody tr").forEach((r, i) => {
    r.style.transitionDelay = `${(i % 7) * 60}ms`;
  });
}
