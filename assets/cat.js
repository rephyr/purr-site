// The cat, ported from purr's tui/cat.py: every mood is a list of frames, a frame is three lines of
// [cat, extra]. The cat part is pink (her bow hot pink, or a moon at night), the extras lilac.
// Keep the frames in step with cat.py when she changes there (its hollow hearts are solid ♥ here).

const EARS = " /\\_/\\♥";
const SIT = " > ^ < ";

const frames = (list) => list.map((f) => f.map((l) => (Array.isArray(l) ? l : [l, ""])));

function sleeping() {
  const zs = [["", "  z"], ["   z", "  Z"], ["    Z", "   z"], ["     z", ""], ["", ""],
    ["   z", ""], ["", " z"], ["  z", ""]];
  const tails = [' (")(")~', ' (")(")~', ' (")(")~', ' (")(")~', ' (")(")~', ' (")(") ', ' (")(")~', ' (")(")~'];
  return frames(zs.map(([z0, z1], i) => [[EARS, z0], ["( -ω- )", z1], tails[i]]));
}

// while she sleeps the sky on her bottom row: stars and fireflies at night, the sun by day (cat.py render())
const STARS = ["  ⋆    ✧", "  ✧    ⋆", "   ⋆     ", "     ✧  ⋆"];
const FIREFLIES = ["  ·   ✧", " ·   ✧ ", "  ✧  · ", " ✧   · "];
const SUN = "   ☀";

function sky(isNight, frameNo) {
  if (!isNight) return SUN;
  const tick = frameNo * 5; // a sleeping frame is 5 of purr's ticks
  const list = Math.floor(tick / 24) % 2 ? FIREFLIES : STARS;
  return list[Math.floor(tick / 6) % list.length];
}

function waiting() {
  return frames([
    [[EARS, "  ?"], "( °ω° )", [SIT, " ~"]],
    [[EARS, "  ?"], "( °ω° )", [SIT, "~"]],
    [[EARS, ""], "( °ω° )", [SIT, " ~"]],
    [[EARS, ""], "( °ω° )", [SIT, "~"]],
  ]);
}

// purr's "happy" (done!): hearts drift up
function copied() {
  const hs = [["", "  ♥"], ["  ♥", "   ♥"], ["   ♥", "  ♥"], ["    ♥", ""], ["", ""]];
  return frames(hs.map(([h0, h1]) => [[EARS, h0], ["( ^ω^ )", h1], SIT + "~"]));
}

function thinking() {
  const bubbles = [" .", " . o", " . o O", " . o O", " . o O", " . o O", " . o", " ."];
  const faces = ["( •ω• )", "( •ω• )", "( •ω• )", "( -ω- )", "( •ω• )", "( •ω•)", "( •ω• )", "( •ω• )"];
  const tails = [SIT, SIT, SIT, SIT, SIT + "~", SIT, SIT, SIT];
  return frames(bubbles.map((b, i) => [[EARS, b], faces[i], tails[i]]));
}

function exploring() {
  const out = [];
  for (const pos of [0, 1, 2, 3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 0, 0]) {
    const right = out.length < 7;
    const pad = " ".repeat(pos);
    out.push([pad + EARS, pad + (right ? "(  •ω•)" : "(•ω•  )"), pad + (pos % 2 ? " /   \\ " : "  | |  ")]);
  }
  return frames(out);
}

function building() {
  const stacks = ["▂", "▂▄", "▂▄▆", "▂▄▆█", "▂▄▆█", ""];
  return frames(stacks.map((stack, i) => {
    const up = i % 2 === 0;
    return [[EARS, up ? "  ✦" : "   ✧"], ["( •ω• )" + (up ? "/" : " "), " " + stack], SIT + (up ? "" : "_")];
  }));
}

function running() {
  const typed = ["", "▪", "▪▪", "▪▪▪", "▪▪▪", ""];
  return frames(typed.map((t, i) => {
    const cursor = i % 2 === 0 ? "_" : " ";
    return [[EARS, "  ╭──────╮"], ["( •ω• )", `  │$ ${(t + cursor).padEnd(4)}│`], [SIT, "  ╰──────╯"]];
  }));
}

function proud() {
  return frames([
    [[EARS, " ✧"], ["( >ω< )", " ♥"], [SIT, " ✧"]],
    [[EARS, "  ✧ ⋆"], ["( ^ω^ )", "  ♥ ✧"], [SIT, "  ⋆ ✧"]],
    [[EARS, "   ⋆  ✧"], ["( >ω< )", "    ♥  ⋆"], [SIT, "   ✧   ⋆"]],
    [[EARS, "    ✧   ⋆"], ["( ^ω^ )", "  ⋆    ♥"], [SIT, "     ⋆"]],
  ]);
}

function petted() {
  return frames([
    [[EARS, "  ♥"], ["( ^ω^ )", " prr"], SIT + "~"],
    [[EARS, "   ♥ ♥"], ["( -ω- )", " prrr~"], SIT + " ~"],
    [[EARS, " ♥   ♥"], ["( ^ω^ )", " prrrr~"], SIT + "~"],
    [[EARS, "  ♥ ♥ ♥"], ["( -ω- )", " prrr~"], SIT + " ~"],
  ]);
}

function greeting() {
  return frames([
    [[EARS, "  ♥"], ["\\( •ω• )/", ""], SIT],
    [[EARS, "   ♥"], ["( •ω• )/", " ~"], [SIT, ""]],
    [[EARS, "  ♥"], ["\\( •ω• )/", ""], SIT],
    [[EARS, " ♥"], ["( •ω• )", " ~"], SIT],
  ]);
}

function watching() {
  return frames([
    [[EARS, ""], "( •ω• )", [SIT, " ~"]],
    [[EARS, ""], ["(•ω• )", ""], SIT],
    [[EARS, ""], "( •ω• )", [SIT, "  ~"]],
    [[EARS, ""], ["( •ω•)", ""], SIT],
  ]);
}

function purring() {
  return frames([
    [[EARS, " ♥ ♥"], ["( -ω- )", " prrr"], [SIT, "~"]],
    [[EARS, "  ♥  ♥"], ["( -ω- )", " prrr~"], [SIT, "~ ~"]],
    [[EARS, " ♥ ♥"], ["( -ω- )", " prrrr"], [SIT, "~"]],
  ]);
}

function yawning() {
  return frames([
    [[EARS, "  o"], ["( •ω• )", ""], SIT],
    [[EARS, "   o"], ["( •o• )", ""], SIT],
    [[EARS, "    o"], ["( •O• )", " ~yawn"], SIT],
    [[EARS, ""], ["( -ω- )", " ~yawn"], SIT],
  ]);
}

// walking along the bottom of the page, facing where she's going
function walking(dir) {
  const face = dir > 0 ? "(  •ω•)" : "(•ω•  )";
  return frames([[EARS, face, "  | |  "], [EARS, face, " /   \\ "]]);
}

function hopping() {
  return frames([[[EARS, " ✧"], "\\( •ω• )/", SIT]]);
}

const MODE_ART = {
  code: [
    [[EARS, " ┌─────┐"], ["( •ω• )", " │ </>_│"], [SIT, " ╘═════╛"]],
    [[EARS, " ┌─────┐"], ["( •ω• )", " │ </> │"], [SIT, " ╘═════╛"]],
  ],
  ask: [
    [[EARS, "     ╭─╮"], ["( •ω• )", "━━━━━│?│"], [SIT, "     ╰─╯"]],
    [[EARS, "     ╭─╮"], ["( °ω° )", "━━━━━│·│"], [SIT, "     ╰─╯"]],
  ],
  learn: [
    [[EARS, "  ╭──┬──╮"], ["( •ω• )", "  │≡≡│≡ │"], [SIT, "  ╰──┴──╯"]],
    [[EARS, "  ╭──┬──╮"], ["( -ω- )", "  │≡≡│≡≡│"], [SIT, "  ╰──┴──╯"]],
  ],
  pair: [
    [[EARS, "    /\\_/\\"], ["( •ω• )", " ⇄ ( •ω• )"], [SIT, "    > ^ <"]],
    [[EARS, "    /\\_/\\"], ["( ^ω^ )", " ⇄ ( ^ω^ )"], [SIT, "    > ^ <"]],
  ],
  plan: [
    [[EARS, "  ┌─┴─┴─┐"], ["( •ω• )", "  │☑ ── │"], [SIT, "  │☐ ── │"]],
    [[EARS, "  ┌─┴─┴─┐"], ["( •ω• )", "  │☑ ── │"], [SIT, "  │☑ ── │"]],
  ],
  chat: [
    [[EARS, "  ╭───────╮"], ["( •o• )", " < meow! │"], [SIT, "  ╰───────╯"]],
    [[EARS, "  ╭───────╮"], ["( •ω• )", " < hi! ♥ │"], [SIT, "  ╰───────╯"]],
  ],
  create: [
    [[EARS, "   ✧   ⋆"], ["( ^ω^ )", "/  ✦"], [SIT, "  ⋆   ✧"]],
    [[EARS, "    ⋆  ✧"], ["( ^ω^ )", " \\ ✧  ✦"], [SIT, "   ✧  ⋆"]],
  ],
};

export const MODE_COLOUR = {
  code: "#f5a9d0", ask: "#c8a2f0", learn: "#f0829b", pair: "#a8b8ff", plan: "#8fd8e8",
  chat: "#ffb8c8", create: "#96dcaf",
};

// mood -> [ms per frame, frames, what she's doing]. A tick in purr is 0.12 s.
export const MOODS = {
  sleeping: [600, sleeping(), ["Mochi is napping", "Mochi is a loaf", "Mochi is dreaming of fish"]],
  thinking: [360, thinking(), ["Mochi is pondering", "Mochi is thinking very hard"]],
  exploring: [240, exploring(), ["Mochi is sniffing around", "Mochi is pawing through files"]],
  building: [360, building(), ["Mochi is kneading code", "Mochi is fixing things with her paws"]],
  running: [360, running(), ["Mochi is chasing a command", "Mochi is pouncing"]],
  proud: [240, proud(), ["tests pass! so proud", "yay, all green!"]],
  copied: [360, copied(), ["copied ♥", "see you in the terminal"]],
  waiting: [480, waiting(), ["Mochi is waiting for pets"]],
  petted: [360, petted(), ["prrr~ Mochi loves you", "Mochi is purring"]],
  greeting: [360, greeting(), ["hello! Mochi is here", "Mochi says hi"]],
  watching: [480, watching(), ["Mochi is watching", "Mochi is keeping an eye out"]],
  purring: [360, purring(), ["purrr~ Mochi is blissful", "Mochi is kneading the air"]],
  yawning: [480, yawning(), ["Mochi is yawning", "Mochi could nap"]],
  walk_r: [200, walking(1), ["Mochi is on patrol", "Mochi is going for a stroll", "Mochi is following you"]],
  walk_l: [200, walking(-1), ["Mochi is on patrol", "Mochi is going for a stroll", "Mochi is following you"]],
  hop: [400, hopping(), ["hop!", "boing"]],
  ...Object.fromEntries(Object.entries(MODE_ART).map(([m, art]) => [`mode_${m}`, [600, frames(art), [`${m} mode`]]])),
};

const night = () => {
  const h = new Date().getHours();
  return h < 6 || h >= 18;
};

const painted = new WeakMap(); // el -> what's on it now

// one row is plain text with only the bow (♥ or ☾) and the extras in spans
function paint(el, frame, mood, frameNo) {
  const isNight = night();
  const extraColour = mood.startsWith("mode_") ? MODE_COLOUR[mood.slice(5)] : null;
  const rows = frame.map(([cat, extra], row) =>
    [isNight && row === 0 ? cat.replace("♥", "☾") : cat, mood === "sleeping" && row === 2 ? sky(isNight, frameNo) : extra]);
  const key = mood + "|" + rows.join("|");
  if (painted.get(el) === key) return; // same picture: leave the DOM alone
  painted.set(el, key);
  el.textContent = "";
  rows.forEach(([cat, extra], i) => {
    for (const part of cat.split(/([♥☾])/)) {
      if (!part) continue;
      if (part === "♥" || part === "☾") {
        const s = document.createElement("span");
        s.className = part === "♥" ? "c-bow" : "c-moon";
        s.textContent = part;
        el.append(s);
      } else el.append(part);
    }
    if (extra) {
      const x = document.createElement("span");
      x.className = extra.includes("♥") ? "c-heart" : extra.includes("☀") ? "c-sun" : "c-extra";
      if (extraColour) x.style.color = extraColour;
      x.textContent = extra;
      el.append(x);
    }
    if (i < 2) el.append("\n");
  });
}

// One cat on the page: cat.set("building") changes her mood, cat.once("petted", 2) plays a mood
// a couple of times and goes back to the one before. She rests (no timer) while she's off-screen,
// or while pause() holds her; pass { watch: false } when the caller knows better (Mochi does).
export function makeCat(el, labelEl, start = "sleeping", onSay = null, { watch = true } = {}) {
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let mood = start, back = null, i = 0, loops = 0, timer = 0;
  let held = false, offscreen = false;
  const resting = () => held || offscreen;

  function say() {
    if (!labelEl) return;
    const lines = MOODS[mood][2];
    labelEl.textContent = lines[Math.floor(Math.random() * lines.length)];
    onSay?.(mood, labelEl.textContent);
  }

  function tick() {
    clearTimeout(timer);
    const [ms, list] = MOODS[mood];
    paint(el, list[i % list.length], mood, i);
    if (resting()) return; // painted where she is; resume() carries on from here
    i += 1;
    if (i % list.length === 0 && back && ++loops >= back[1]) {
      mood = back[0]; back = null; i = 0;
      say();
      if (still.matches) return void (timer = setTimeout(tick, ms)); // paint her still frame once
    }
    if (!still.matches || back) timer = setTimeout(tick, ms);
  }

  function set(next) {
    if (!MOODS[next] || (next === mood && !back)) return;
    mood = next; i = 0; loops = 0; back = null;
    say();
    tick();
  }

  function once(next, times = 1) {
    if (!MOODS[next]) return;
    const to = back ? back[0] : mood;
    mood = next; i = 0; loops = 0; back = [to, times];
    say();
    tick();
  }

  function rest(why, on) {
    const was = resting();
    if (why === "held") held = on; else offscreen = on;
    if (was && !resting()) tick();
    else if (!was && resting()) clearTimeout(timer);
  }

  if (watch && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => rest("offscreen", !e.isIntersecting)).observe(el);
  }

  say();
  tick();
  return {
    set, once,
    pause: () => rest("held", true),
    resume: () => rest("held", false),
    get mood() { return back ? back[0] : mood; },
    get busy() { return !!back; },
  };
}
