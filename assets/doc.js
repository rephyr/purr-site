import { makeCat } from "./cat.js";
import { hearts } from "./roam.js";

// the pinned header casts a little shadow once the page moves under it
const bar = document.querySelector(".bar");
const stuck = () => bar.classList.toggle("stuck", scrollY > 4);
addEventListener("scroll", stuck, { passive: true });
stuck();

// on the docs she reads along with you, in the page's mood (build.py painted her first frame)
const catEl = document.querySelector('[data-cat="doc"]');
const cat = makeCat(catEl, null, catEl.dataset.mood || "mode_learn");
document.querySelector(".doc-cat").addEventListener("click", () => {
  cat.once("petted", 2);
  const r = catEl.getBoundingClientRect();
  hearts(r.left + r.width * 0.3, r.top, 6);
});

// on a phone the contents start folded, and fold again once you pick a section
const phone = matchMedia("(max-width: 900px)");
const toc = document.querySelector(".toc");
if (phone.matches) toc.open = false;
toc.addEventListener("click", (e) => {
  if (e.target.closest("a") && phone.matches) toc.open = false;
});

// the contents list follows where you are: the last heading that has passed under the bar
const links = new Map([...toc.querySelectorAll("a")].map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
const heads = [...document.querySelectorAll(".doc h2[id], .doc h3[id]")].filter((h) => links.has(h.id));
const side = document.querySelector(".doc-side");
const list = toc.querySelector("ul");
const now = toc.querySelector(".toc-now");
let current = null;

function follow() {
  const line = bar.offsetHeight + 120;
  let at = null;
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) at = heads.at(-1);
  else for (const h of heads) if (h.getBoundingClientRect().top <= line) at = h; else break;
  if (at === current) return;
  current = at;
  links.forEach((a) => a.removeAttribute("aria-current"));
  const a = at && links.get(at.id);
  if (now) now.textContent = at ? `\u00a0· ${at.textContent}` : ""; // nbsp: a flex summary would drop a plain space
  if (!a) return;
  a.setAttribute("aria-current", "true");
  // keep it in view inside whichever box scrolls (the sidebar, or the list on a phone),
  // moving only that box: scrollIntoView could move the page too
  for (const box of [list, side]) {
    if (box.scrollHeight <= box.clientHeight + 1) continue;
    const r = a.getBoundingClientRect(), b = box.getBoundingClientRect();
    if (r.top < b.top + 8) box.scrollTop -= b.top + 8 - r.top;
    else if (r.bottom > b.bottom - 8) box.scrollTop += r.bottom - (b.bottom - 8);
    break;
  }
}

let queued = false;
const soon = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; follow(); });
};
addEventListener("scroll", soon, { passive: true });
addEventListener("resize", soon);
follow();

// tables and code blocks that scroll sideways show a cue while there's more to the right
const more = (el) => el.classList.toggle("more", el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
const scrollers = document.querySelectorAll(".doc .table-wrap, .doc pre");
const sized = new ResizeObserver((entries) => entries.forEach((e) => more(e.target)));
scrollers.forEach((el) => {
  el.addEventListener("scroll", () => more(el), { passive: true });
  sized.observe(el);
  more(el);
});
