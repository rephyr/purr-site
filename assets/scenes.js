// Little scenes that act out what purr does, one per pinned note in "Why small models finish here".
// The model's part is lilac, purr's part pink, the result mint. Each scene plays while it's on screen,
// rests, and plays again; off screen it stops. The numbers are purr's real settings (harness/agent.py,
// harness/limits.py). Without JS, or with reduced motion, the plain log lines stay.



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

const SCENES = {
  // a 32k-context model: purr compacts at 72% so a reply still fits
  context: {
    html: `<div class="sc-head"><span>context</span><span class="sc-dim">32k model</span><span class="sc-pct">0%</span></div>
      <div class="ctx-bar"><span class="seg s-prompt"></span><span class="seg s-sum"></span><span class="seg s-chat"></span><i class="ctx-mark"><b>72%</b></i></div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const [prompt, sum, chat] = st.querySelectorAll(".seg");
      const pct = st.querySelector(".sc-pct");
      const set = (p, s, c) => { prompt.style.width = `${p}%`; sum.style.width = `${s}%`; chat.style.width = `${c}%`; pct.textContent = `${Math.round(p + s + c)}%`; };
      set(0, 0, 0);
      await wait(300);
      say(st, "purr", "a lean prompt: the model's own room starts big");
      set(5, 0, 0);
      await wait(1200);
      say(st, "model", "reading files, editing, running tests…");
      for (let c = 6; c <= 67; c += 7) { set(5, 0, c); await wait(380); }
      set(5, 0, 67);
      st.querySelector(".ctx-mark").classList.add("hit");
      await wait(500);
      say(st, "purr", "72% full: the older chat becomes a short summary");
      set(5, 7, 0);
      st.querySelector(".ctx-mark").classList.remove("hit");
      await wait(1500);
      say(st, "ok", "✓ room left for the reply. Bigger contexts wait longer");
      for (let c = 4; c <= 16; c += 4) { set(5, 7, c); await wait(380); }
      await wait(1600);
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
      old.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" });
      old.style.opacity = 1;
      await wait(1300);
      say(st, "warn", "no exact match: the model indented 6 spaces, the file uses 4");
      o.animate([{ transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(0)" }], { duration: 300 });
      await wait(1500);
      say(st, "purr", "same lines once you ignore the indent");
      o.style.transform = "translateX(-2ch)";
      tgt.classList.add("hl");
      await wait(1300);
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" });
      t.innerHTML = '    price = sum(items)<span class="new"> * (1 - off)</span>';
      say(st, "ok", "✓ applied, re-indented to 4 spaces");
      await wait(2200);
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
      await type(code, '<tool_call>{"name": "run", "arguments": {"cmd": "pytest -q"}}</tool_call>', wait, 60);
      await wait(500);
      say(st, "warn", "…as plain text. On its own, nothing would run");
      await wait(1500);
      bubble.classList.add("caught");
      say(st, "purr", "that's a tool call: purr makes it a real one");
      await wait(1100);
      bubble.classList.add("gone");
      chip.classList.add("on");
      for (const d of ["·", "··", "···", "··", "···"]) { res.textContent = d; await wait(220); }
      res.innerHTML = '<span class="okc">✓ 14 passed</span>';
      say(st, "ok", "✓ ran for real");
      await wait(2200);
    },
  },

  // every edit: a syntax check and ruff; only problems the edit added go back
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
      await wait(500);
      g1.className = "gate pass";
      await wait(450);
      g2.className = "gate fail";
      line.innerHTML = '    return <span class="wavy">totl</span> * rate';
      say(st, "warn", "F821 undefined name 'totl': only what this edit broke goes back");
      await wait(2000);
      say(st, "model", "fixes it");
      line.querySelector(".wavy").outerHTML = '<span class="fixed">total</span>';
      g1.className = g2.className = "gate";
      await wait(700);
      g1.className = "gate pass";
      await wait(300);
      g2.className = "gate pass";
      say(st, "ok", "✓ clean before the next step");
      await wait(2000);
    },
  },

  // the same file changed 8 times: purr asks for a step back
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
      await wait(900);
      back.classList.add("on");
      await wait(1800);
      say(st, "ok", "✓ then a different approach, riskiest part first");
      await wait(2200);
    },
  },

  // "done" only after the request is read again point by point and the tests pass
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
      await wait(1200);
      stamp.className = "sc-stamp on held";
      say(st, "purr", "not yet: read the request again, point by point");
      await wait(1000);
      for (const p of pts) { p.className = "on"; await wait(600); }
      say(st, "purr", "and run the tests");
      for (let i = 1; i <= 14; i++) { dots.textContent = "●".repeat(i); await wait(90); }
      res.textContent = " 14 passed";
      stamp.className = "sc-stamp on ok";
      say(st, "ok", "✓ now it's done");
      await wait(2400);
    },
  },

  // plan mode: a big model writes tickets, a small model does them one by one
  plan: {
    html: `<div class="plan-row"><span class="who big">big model</span><span class="who small">small model</span></div>
      <div class="plan-board">
        <div class="tk" style="--i:0">001 read prices</div>
        <div class="tk" style="--i:1">002 fix discount</div>
        <div class="tk" style="--i:2">003 add a test</div>
      </div>
      <div class="sc-say"></div>`,
    async play(st, wait) {
      const tks = st.querySelectorAll(".tk");
      tks.forEach((t) => (t.className = "tk"));
      say(st, "big", "the big model plans: small, checkable tickets");
      for (const t of tks) { t.className = "tk on"; await wait(450); }
      await wait(600);
      for (const t of tks) {
        t.className = "tk on moved";
        say(st, "model", `the small model takes ${t.textContent.slice(0, 3)}`);
        await wait(900);
        t.className = "tk on moved done";
        await wait(400);
      }
      say(st, "ok", "✓ a small model finishing a big job");
      await wait(2400);
    },
  },
};

export function scenes() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const holder of document.querySelectorAll("[data-scene]")) {
    const scene = SCENES[holder.dataset.scene];
    if (!scene) continue;
    const stage = document.createElement("div");
    stage.className = `sc sc-${holder.dataset.scene}`;
    stage.setAttribute("aria-hidden", "true"); // the plain lines stay for screen readers
    stage.innerHTML = scene.html;
    holder.querySelector(".lines").classList.add("sr-only");
    holder.querySelector(".lines").after(stage);

    let ctrl = null;
    async function run() {
      ctrl = new AbortController();
      const wait = waiter(ctrl.signal);
      try {
        for (;;) { await scene.play(stage, wait); await wait(900); }
      } catch (e) {
        if (e.name !== "AbortError") throw e;
      }
    }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ctrl) run();
      else if (!e.isIntersecting && ctrl) { ctrl.abort(); ctrl = null; }
    }, { rootMargin: "-10% 0px" }).observe(stage);
  }
}


