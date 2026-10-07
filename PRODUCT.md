# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated: its own repo (`~/projects/purr-site`, not inside purr). A static site: hand-written HTML
and CSS for the landing page, no framework. The docs pages are generated from purr's own Markdown
(`docs/guide.md`, `docs/benchmarks.md`, `CHANGELOG.md`, read from a purr checkout) by a small
Python script using markdown-it-py, so the site never drifts from the docs and needs no Node.
Deployed to GitHub Pages by a workflow that checks out rephyr/purr. Chosen because purr is a
Python project with no web tooling, and the site must stay cheap to keep up.

## Users

Local-model tinkerers: people running Ollama, llama.cpp, LM Studio or vLLM on their own GPU, who
want a coding agent in the terminal that actually finishes work with a small model. They have
usually tried a big-model harness with a local model and watched it loop, botch edits or call
tools that don't exist. They evaluate by reading the README, watching the demo, and installing it.

## Product Purpose

purr is a cute coding agent for the terminal, built to get more out of small local models on long,
vague tasks. API models work too. Success: someone with a 24 GB GPU installs it with one line,
points it at their Ollama model, and it finishes the task.

## Positioning

A harness designed around small-model failure modes rather than assuming a frontier model: a lean
prompt and limits fitted to the model's context, repair of slips (fuzzy edits still apply, tool
calls written as text still run), checks after every edit and tests before "done", loop detection,
and plan mode where a big model writes tickets and a small one does them. It is also openly cute:
a cat that shows what the agent is doing.

## Operating Context

- Install: `curl -LsSf https://raw.githubusercontent.com/rephyr/purr/main/install.sh | sh`, or
  `uv tool install git+https://github.com/rephyr/purr`. Arch via a PKGBUILD in the repo (AUR pending).
  Windows through WSL.
- First run opens a setup window that finds local servers automatically, or takes an API key
  (DeepSeek, OpenRouter, free tiers of Groq, Cerebras, Gemini, Mistral, NVIDIA, Cohere, any
  OpenAI-compatible server). You pick a model and name your cat.
- Full-screen Textual TUI, or `--plain`; `-p` for one task.
- Repo: https://github.com/rephyr/purr. MIT licensed. Version 0.5.0 (first release, 2026-10).

## Capabilities and Constraints

- Modes: code, ask, learn, pair, plan, chat, create (each has a colour and a symbol: ✎ ◈ ✿ ⇄ ✦ ♡ ✧).
- Your own agents as Markdown files; Claude Code and OpenCode agents work too. MCP. `/pr`, `/undo`,
  `/resume`, the workbench (ctrl+t), steering while it works.
- `purr bench`: purr vs OpenCode on the same small tasks with the same model; `purr bench --you`.
- Privacy: no telemetry, no account; `/private` for local only.
- Terminology: "purr" is always lowercase. The cat is Mochi until renamed, and is "she".

## Brand Commitments

- Name `purr`, lowercase, often with ♡.
- The cat: ASCII frames in `tui/cat.py` (` /\_/\♡`, `( •ω• )`, ` > ^ < `), moods for thinking,
  exploring, building, running, talking, waiting, napping; bow by day, moon at night.
- The TUI palette in `tui/themes.py`: pink #f5a9d0, lilac #c8a2f0, peach, rose, mint, cyan on
  deep plum backgrounds; theme names plum, strawberry-milk, lilac-dream, bubblegum-night,
  cotton-candy.
- Dark only. No light mode, nothing bright full-screen (the maintainer's hard rule).
- Voice: short, plain, warm sentences; no hype. Cute, never cutesy about the engineering.

## Evidence on Hand

- `docs/demo.gif`: purr fixing a bug with Qwen3.6 on a local GPU (2x speed).
- Terminal-Bench 2.1, DeepSeek V4.1 Flash, one try per task: 82.0% ± 4.1 (0.5.0+fae8051,
  2026-10-04) and 80.9% ± 4.2; details and other harnesses' reported scores in
  `benchmarks/terminal-bench/README.md`. Method in `docs/benchmarks.md`.
- DeepSWE runs: method published, no results yet. Local-model results: "coming". Do not invent any.
- No testimonials, users, stars, or press. Do not fabricate any.

## Product Principles

- Small models first: every claim is about what helps a small model finish.
- Show the work honestly: published methods, the ± with every score, failures named.
- Yours, not a service: local, private, no account.
- Cute is a feature, not decoration: the cat tells you what the agent is doing.

## Accessibility & Inclusion

No product-specific requirement established; meet WCAG AA contrast on the dark grounds and respect
reduced motion (the cat animates).
