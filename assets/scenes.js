// Little scenes that act out what purr does, one per pinned note in "Why small models finish here".
// The model's part is lilac, purr's part pink, the result mint. One scene plays at a time: the one
// nearest the middle of the screen. The others rest on their solved frame. The numbers are purr's
// real settings (harness/agent.py, harness/limits.py). Without JS, or with reduced motion, the plain
// log lines stay.

function waiter(signal) {
  return (ms) => new Promise((ok, no) => {
    if (signal.aborted) return no(new DOMException("stopped", "AbortError"));
    const t = setTimeout(ok, ms);
    signal.addEventListener("abort", () => { clearTimeout(t); no(new DOMException("stopped", "AbortError")); }, { once: true });
  });
}

async function type(el, text, wait, cps = 40) {
  el.textContent = "";
  for (let i = 0; i < text.length; i += 2) {
    el.textContent = text.slice(0, i + 2);
    await wait(2000 / cps);
  }
}

function say(stage, who, text) {
  const s = stage.querySelector(".sc-say");
  s.className = `sc-say ${who}`;
  s.innerHTML = text;
  s.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
}

// what purr's text-call repair reads: the Qwen form (harness/agent.py TEXT_CALL), run's parameter is "command"
// (a word joiner keeps "-q" from breaking after its hyphen on a phone)
const TEXT_CALL = "<function=run><parameter=command>pytest -\u2060q</parameter></function>";

// each scene: html, play (one loop), rest (its solved frame, shown while it isn't playing)
const SCENES = {
  // a 32k-context model: old tool output is trimmed at 60%, the chat compacts at 72% so a reply still fits
  context: {
    html: `<div class="sc-head"><span>context</span><span class="sc-dim">32k model</span><span class="sc-pct">0%</span></div>
      <div class="ctx-bar"><span class="seg s-prompt"></span><span class="seg s-sum"></span><span class="seg s-chat"></span><i class="ctx-mark"><b>72%</b></i></div>
      <div class="sc-say"></div>`,
    bar(st, p, s, c) {
      const [prompt, sum, chat] = st.querySelectorAll(".seg");
      prompt.style.width = `${p}%`; sum.style.width = `${s}%`; chat.style.width = `${c}%`;
      st.querySelector(".sc-pct").textContent = `${Math.round(p + s + c)}%`;
    },
    async play(st, wait) {
      const set = (p, s, c) => this.bar(st, p, s, c), mark = st.querySelector(".ctx-mark");
      set(0, 0, 0);
      await wait(300);
      say(st, "purr", "purr's prompt is small (pink): most of the 32k is left for the work");
      set(5, 0, 0);
      await wait(2400);
      say(st, "model", "reading files, editing, running tests…");
      for (let c = 6; c <= 55; c += 7) { set(5, 0, c); await wait(380); }
      // prune_at = compact_at - 0.12, trimmed to 15% under it; no model call (agent.py _prune_old_tools)
      say(st, "purr", "at 60%: old tool output folded to a one-line note, no model call");
      await wait(500);
      set(5, 0, 40);
      await wait(1100);
      for (const c of [46, 52, 58, 64, 67]) { set(5, 0, c); await wait(380); }
      mark.classList.add("hit");
      await wait(500);
      say(st, "purr", "72% full: the older chat becomes a short summary");
      set(5, 7, 0);
      mark.classList.remove("hit");
      await wait(2600);
      say(st, "ok", "✓ room left for the reply (bigger contexts compact later)");
      for (let c = 4; c <= 16; c += 4) { set(5, 7, c); await wait(380); }
      await wait(2000);
    },
    rest(st) {
      st.querySelector(".ctx-mark").classList.remove("hit");
      this.bar(st, 5, 7, 16);
      say(st, "ok", "✓ room left for the reply (bigger contexts compact later)");
    },
  },

  // indentation off: matched ignoring leading whitespace, then re-indented the file's way
  fuzzy: {
    html: `<div class="sc-head"><span>src/stats.py</span></div>
      <div class="sc-code">
        <div class="sc-ln"><span class="g">1</span>def total(items, off):</div>
        <div class="sc-ln tgt"><span class="g">2</span><span class="t">    price = sum(items)</span></div>
        <div class="sc-ln"><span class="g">3</span>    return price</div>
      </div>
      <div class="sc-ln sc-old"><span class="g">−</span><span class="o">      price = sum(items)</span></div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const old = st.querySelector(".sc-old"), o = old.querySelector(".o"), tgt = st.querySelector(".tgt"), t = tgt.querySelector(".t");
      old.style.opacity = 0; o.style.transform = ""; tgt.classList.remove("hl"); t.innerHTML = "    price = sum(items)";
      await wait(400);
      say(st, "model", "edit: replace this line");
      // end values go inline and the animations keep no fill: a finished fill can outlive cancel() in
      // still() (the browser stops listing it after GC) and pin the old line on the resting frame
      old.style.opacity = 1;
      old.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      await wait(1800);
      say(st, "warn", "no exact match: the model indented 6 spaces, the file uses 4");
      o.animate([{ transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }], { duration: 300 });
      await wait(2600);
      say(st, "purr", "same lines once you ignore the indent");
      o.style.transform = "translateX(-2ch)";
      tgt.classList.add("hl");
      await wait(2200);
      old.style.opacity = 0;
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      t.innerHTML = '    price = sum(items)<span class="new"> * (1 - off)</span>';
      say(st, "ok", "✓ applied, re-indented to 4 spaces");
      await wait(2400);
    },
    rest(st) {
      const old = st.querySelector(".sc-old");
      old.style.opacity = 0; old.querySelector(".o").style.transform = "translateX(-2ch)";
      st.querySelector(".tgt").classList.add("hl");
      st.querySelector(".tgt .t").innerHTML = '    price = sum(items)<span class="new"> * (1 - off)</span>';
      say(st, "ok", "✓ applied, re-indented to 4 spaces");
    },
  },

  // a tool call written as text becomes a real call
  text: {
    html: `<div class="sc-head"><span>the model's reply</span></div>
      <div class="sc-bubble"><code class="typed"></code></div>
      <div class="sc-chip"><span class="run">▶ run</span> pytest -q <span class="res"></span></div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const bubble = st.querySelector(".sc-bubble"), code = st.querySelector(".typed"), chip = st.querySelector(".sc-chip"), res = chip.querySelector(".res");
      bubble.classList.remove("caught", "gone"); chip.classList.remove("on"); res.textContent = "";
      say(st, "model", "writes its tool call…");
      await type(code, TEXT_CALL, wait, 60);
      await wait(500);
      say(st, "warn", "…as plain text. On its own, nothing would run");
      await wait(2400);
      bubble.classList.add("caught");
      say(st, "purr", "that's a tool call: purr makes it a real one");
      await wait(1600);
      bubble.classList.add("gone");
      chip.classList.add("on");
      for (const d of ["·", "··", "···", "··", "···"]) { res.textContent = d; await wait(220); }
      res.innerHTML = '<span class="okc">✓ 3 passed</span>';
      say(st, "ok", "✓ ran for real");
      await wait(2200);
    },
    // the still keeps the caught text next to the real call, so it tells the whole story
    rest(st) {
      const bubble = st.querySelector(".sc-bubble");
      bubble.classList.remove("gone"); bubble.classList.add("caught");
      st.querySelector(".typed").textContent = TEXT_CALL;
      st.querySelector(".sc-chip").classList.add("on");
      st.querySelector(".sc-chip .res").innerHTML = '<span class="okc">✓ 3 passed</span>';
      say(st, "ok", "✓ ran for real");
    },
  },

  // every edit: a syntax check and ruff; only problems the edit added go back (harness/checks.py)
  checks: {
    html: `<div class="sc-head"><span>src/report.py</span><span class="sc-gates"><span class="gate">syntax</span><span class="gate">ruff</span></span></div>
      <div class="sc-code"><div class="sc-ln"><span class="g">12</span><span class="typed"></span></div></div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const line = st.querySelector(".typed"), [g1, g2] = st.querySelectorAll(".gate");
      g1.className = g2.className = "gate";
      say(st, "model", "edits a line");
      await type(line, "    return totl * rate", wait, 26);
      await wait(400);
      say(st, "purr", "checks the file by itself…");
      await wait(1000);
      g1.className = "gate pass";
      await wait(500);
      g2.className = "gate fail";
      line.innerHTML = '    return <span class="wavy">totl</span> * rate';
      say(st, "warn", "F821 undefined name 'totl': purr hands back only what this edit broke");
      await wait(3200);
      say(st, "model", "fixes it");
      line.querySelector(".wavy").outerHTML = '<span class="fixed">total</span>';
      g1.className = g2.className = "gate";
      await wait(900);
      g1.className = "gate pass";
      await wait(300);
      g2.className = "gate pass";
      say(st, "ok", "✓ clean before the next step");
      await wait(2200);
    },
    rest(st) {
      st.querySelector(".typed").innerHTML = '    return <span class="fixed">total</span> * rate';
      st.querySelectorAll(".gate").forEach((g) => (g.className = "gate pass"));
      say(st, "ok", "✓ clean before the next step");
    },
  },

  // the same file changed 8 times: purr asks for a step back (harness/agent.py STEP_BACK_EDITS)
  loop: {
    html: `<div class="sc-head"><span>changes to src/stats.py</span><span class="sc-count">0</span></div>
      <div class="sc-ticks">${"<i></i>".repeat(8)}</div>
      <ol class="sc-back"><li>what I know for sure</li><li>why the attempts fail</li><li>a different approach</li></ol>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const ticks = st.querySelectorAll(".sc-ticks i"), count = st.querySelector(".sc-count"), back = st.querySelector(".sc-back");
      ticks.forEach((t) => (t.className = "")); back.classList.remove("on"); count.textContent = "0";
      const tries = ["tries a fix", "tries again", "a variant", "another variant", "still failing", "and again", "one more…", "and again"];
      for (let i = 0; i < 8; i++) {
        ticks[i].className = "on";
        count.textContent = String(i + 1);
        say(st, "model", tries[i]);
        await wait(i < 7 ? 520 : 700);
      }
      ticks.forEach((t) => (t.className = "on stop"));
      say(st, "purr", "8 changes and still not done: stop, step back, write three lines");
      await wait(1800);
      back.classList.add("on");
      await wait(1800);
      say(st, "ok", "✓ then a different approach, riskiest part first");
      await wait(2800);
    },
    rest(st) {
      st.querySelectorAll(".sc-ticks i").forEach((t) => (t.className = "on stop"));
      st.querySelector(".sc-count").textContent = "8";
      st.querySelector(".sc-back").classList.add("on");
      say(st, "ok", "✓ then a different approach, riskiest part first");
    },
  },

  // "done" only after purr runs the tests itself and the model reads the request again
  // (harness/agent.py _final_check: _test_report() first, then the check)
  done: {
    html: `<div class="sc-head"><span>the request</span><span class="sc-stamp">done!</span></div>
      <ul class="sc-points"><li>happy hour prices are right</li><li>the cause is found</li><li>tests run at the end</li></ul>
      <div class="sc-tests"><span class="dots"></span><span class="res"></span></div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const stamp = st.querySelector(".sc-stamp"), pts = st.querySelectorAll(".sc-points li"), dots = st.querySelector(".dots"), res = st.querySelector(".sc-tests .res");
      stamp.className = "sc-stamp"; pts.forEach((p) => (p.className = "")); dots.textContent = ""; res.textContent = "";
      await wait(300);
      stamp.className = "sc-stamp on";
      say(st, "model", "wants to say it's done");
      await wait(1600);
      stamp.className = "sc-stamp on held";
      say(st, "purr", "not yet: purr runs the tests itself first");
      await wait(600);
      for (let i = 1; i <= 3; i++) { dots.textContent = "●".repeat(i); await wait(350); }
      res.textContent = " ✓ 3 passed";
      await wait(1200);
      say(st, "purr", "now read the request again, point by point");
      await wait(1400);
      for (const p of pts) { p.className = "on"; await wait(700); }
      stamp.className = "sc-stamp on ok";
      say(st, "ok", "✓ now it's done");
      await wait(2400);
    },
    rest(st) {
      st.querySelector(".sc-stamp").className = "sc-stamp on ok";
      st.querySelectorAll(".sc-points li").forEach((p) => (p.className = "on"));
      st.querySelector(".dots").textContent = "●●●";
      st.querySelector(".sc-tests .res").textContent = " ✓ 3 passed";
      say(st, "ok", "✓ now it's done");
    },
  },

  // plan mode: a big model writes tickets (.purr/tickets/01-….md), a small model does them one by one
  plan: {
    html: `<div class="plan-row"><span class="who big">big model</span><span class="who small">small model</span></div>
      <div class="plan-board">
        <div class="tk" style="--i:0">01 read prices</div>
        <div class="tk" style="--i:1">02 fix discount</div>
        <div class="tk" style="--i:2">03 add a test</div>
      </div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const tks = st.querySelectorAll(".tk");
      tks.forEach((t) => (t.className = "tk"));
      say(st, "big", "the big model plans: small, checkable tickets");
      for (const t of tks) { t.className = "tk on"; await wait(450); }
      await wait(1400);
      for (const t of tks) {
        t.className = "tk on moved";
        say(st, "model", `the small model takes ticket ${t.textContent.slice(0, 2)}`);
        await wait(1300);
        t.className = "tk on moved done";
        await wait(500);
      }
      say(st, "ok", "✓ a small model finishing a big job");
      await wait(2400);
    },
    rest(st) {
      st.querySelectorAll(".tk").forEach((t) => (t.className = "tk on moved done"));
      say(st, "ok", "✓ a small model finishing a big job");
    },
  },
};

// the rest frame, with any half-run animation dropped
function still(stage, scene) {
  stage.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  scene.rest(stage);
}

// the tallest the stage gets at its width: an invisible copy runs the scene once with no waiting
// (and no transitions) and every state is measured, so the first loop doesn't jump either
async function tallest(stage, scene) {
  const copy = document.createElement("div");
  copy.className = stage.className.replace(" playing", "");
  copy.innerHTML = scene.html;
  copy.style.cssText = `position: fixed; left: 0; top: 0; width: ${stage.offsetWidth}px; visibility: hidden; pointer-events: none;`;
  copy.querySelectorAll("*").forEach((el) => (el.style.transition = "none"));
  stage.after(copy);
  let tall = 0;
  const measure = () => { tall = Math.max(tall, Math.ceil(copy.getBoundingClientRect().height)); };
  try {
    scene.rest(copy); measure();
    await scene.play(copy, async () => measure());
    measure();
  } finally {
    copy.remove();
  }
  return tall;
}

export function scenes() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const stages = [];
  for (const holder of document.querySelectorAll("[data-scene]")) {
    const scene = SCENES[holder.dataset.scene];
    if (!scene) continue;
    const stage = document.createElement("div");
    stage.className = `sc sc-${holder.dataset.scene}`;
    stage.setAttribute("aria-hidden", "true"); // the plain lines stay for screen readers
    stage.innerHTML = scene.html;
    holder.querySelector(".lines").classList.add("sr-only");
    holder.querySelector(".lines").after(stage);
    still(stage, scene);
    stages.push({ stage, scene, ctrl: null, width: 0 });
  }
  if (!stages.length) return;

  // heights: hold each stage at its tallest so the page doesn't jump on phones while one plays
  async function fit(s) {
    s.width = s.stage.offsetWidth;
    if (!s.width) return;
    s.stage.style.minHeight = `${await tallest(s.stage, s.scene)}px`;
  }
  const fitAll = () => stages.forEach(fit);
  fitAll();
  document.fonts?.ready.then(fitAll);
  const sizes = new ResizeObserver((entries) => {
    for (const e of entries) {
      const s = stages.find((x) => x.stage === e.target);
      if (s.stage.offsetWidth !== s.width) fit(s);
      else if (s.stage.offsetHeight > parseFloat(s.stage.style.minHeight || 0)) s.stage.style.minHeight = `${s.stage.offsetHeight}px`; // keep the most seen
    }
  });
  stages.forEach((s) => sizes.observe(s.stage));

  // one scene plays at a time: the one most in view, nearest the middle of the screen
  let current = null;
  function stop(s) {
    s.ctrl?.abort(); s.ctrl = null;
    s.stage.classList.remove("playing");
    still(s.stage, s.scene);
  }
  async function start(s) {
    const ctrl = (s.ctrl = new AbortController());
    const wait = waiter(ctrl.signal);
    s.stage.classList.add("playing");
    const line = s.stage.querySelector(".sc-say");
    try {
      for (;;) {
        line.className = "sc-say"; line.textContent = "";
        await s.scene.play(s.stage, wait);
        await wait(900);
      }
    } catch (e) {
      if (e.name !== "AbortError") throw e;
    }
  }
  function pick() {
    let best = null, bestShown = 0, bestOff = Infinity;
    for (const s of stages) {
      const r = s.stage.getBoundingClientRect();
      if (!r.height) continue;
      const seen = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0);
      const shown = Math.floor((Math.max(0, seen) / r.height) * 4) / 4; // the observer's steps
      const off = Math.abs((r.top + r.bottom) / 2 - innerHeight / 2);
      if (shown > bestShown || (shown && shown === bestShown && off < bestOff)) { best = s; bestShown = shown; bestOff = off; }
    }
    if (best === current) return;
    if (current) stop(current);
    current = best;
    if (current) start(current);
  }
  // wait for the scroll to settle a little (but not forever) so a quick fling doesn't start every scene it passes
  let settle = 0, longest = 0;
  function later() {
    clearTimeout(settle);
    if (!longest) longest = setTimeout(() => { clearTimeout(settle); longest = 0; pick(); }, 700);
    settle = setTimeout(() => { clearTimeout(longest); longest = 0; pick(); }, 250);
  }
  const seen = new IntersectionObserver(later, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  stages.forEach((s) => seen.observe(s.stage));
  addEventListener("scroll", later, { passive: true });
  addEventListener("resize", later, { passive: true });
}
