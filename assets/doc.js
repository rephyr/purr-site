import { makeCat } from "./cat.js";

const hour = new Date().getHours();
document.documentElement.classList.toggle("day", hour >= 6 && hour < 18);

// on the docs she reads along with you
const cat = makeCat(document.querySelector('[data-cat="doc"]'), null, "mode_learn");
document.querySelector(".doc-cat").addEventListener("click", () => cat.once("petted", 2));

// on a phone the contents start folded
if (matchMedia("(max-width: 900px)").matches) document.querySelector(".toc").open = false;

// the contents list follows where you are
const links = new Map([...document.querySelectorAll(".toc a")].map((a) => [a.hash.slice(1), a]));
const seen = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    links.forEach((a) => a.removeAttribute("aria-current"));
    links.get(e.target.id)?.setAttribute("aria-current", "true");
  }
}, { rootMargin: "0px 0px -75% 0px" });
document.querySelectorAll(".doc h2[id], .doc h3[id]").forEach((h) => seen.observe(h));
