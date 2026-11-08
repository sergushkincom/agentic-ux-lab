# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A design lab: each experiment is a self-contained interactive prototype that answers one UX
question about AI/enterprise software. It is explicitly **not production code** — fake data
throughout, no backend, no model calls. Each experiment's README states the question, the
design decisions behind it, and a "Deliberately not built" list; respect that scope rather
than adding features outside it.

Internal experiments in this repo: **02 · Usage widget** (`src/app/experiments/usage-widget/`),
a macOS-style desktop widget for AI usage limits — read its README before changing behaviour
or copy — and **Translation trust** (`src/app/experiments/translation-trust/`), which has no
number because no source publishes one. The index also links external repos (01 workflow
canvas, plus knowledge-atlas, keyword-tracker and permission-rings, which publish no number).

## Working rules

- Never run git commit, push, merge or switch branches. I commit and open PRs myself in GitHub Desktop.
- Before editing, show a plan and wait for my OK.
- After changes, run `npm run build` and fix errors until it passes.
- Explain what you changed in plain words, file by file.
- Fake data only, nothing from real companies or real people.

## Commands

```bash
npm ci             # reproducible install from package-lock.json
npm run dev        # http://localhost:3000/experiments/usage-widget
npm run typecheck  # tsc --noEmit
npm run check:registry # internal vs external lookup and href
npm run check:translation # rewrite, restore, correct, simulated send
npm run build      # production build (also type-checks and lints)
npm run lint       # next lint (next/core-web-vitals + next/typescript)
```

GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, `npm run typecheck`,
`npm run check:registry`, `npm run check:translation`, `npm run lint`, and `npm run build`
on Node 22 for pull requests and pushes to `main`.

There is no test suite. Verify changes by type-checking (`npm run typecheck`) and running the
dev server; right-click the widget to switch size (small/medium/large) and scenario.

Stack: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4 via
`@tailwindcss/postcss`. Path alias `@/*` → `src/*`. Deployed on Vercel
(agentic-ux-lab.vercel.app).

## Layout conventions

- Experiments are registered in `src/lib/experiments.ts` (`slug`, optional `number`,
  `title`, `question`, optional `href`). The home page (`src/app/page.tsx`) and the shared shell
  (`src/app/experiments/layout.tsx` — back link, number, title, question; finds its entry via
  `usePathname()`) both render from that registry. No hardcoded entries. `experimentHref()`
  returns `href` when set, otherwise `/experiments/<slug>`. `getExperiment(slug)` returns
  internal rows only. An external row opens in a new tab (`rel="noopener noreferrer"`) and
  shows an external-link marker. Leave `number` unset when the source does not publish one.
- A new internal experiment = a registry entry + `src/app/experiments/<slug>/` with `page.tsx` and
  `README.md` (+ a row in the root README's Experiments table). An external experiment is a
  registry row with `href` and a README table row; it has no route in this repo.
  Experiment-specific logic lives in that folder, not in `src/lib/`. Pages render inside the
  shell's `flex-1` main, so size to `h-full`, not `h-screen`.
- Colours for the lab shell/home are CSS custom properties in `src/app/tokens.css` (light +
  `prefers-color-scheme: dark`), imported by `globals.css`. Use `var(--…)`, not hex, there.
- `src/components` and `src/hooks` currently all belong to the usage widget.

## Usage widget architecture

Widget logic modules sit next to the page in `src/app/experiments/usage-widget/`;
components and hooks are in `src/components` and `src/hooks`.

Data flow: `page.tsx` (size + scenario state) → `DesktopStage` (wallpaper, menu bar, desktop
area; runs `useSimulation`) → `UsageWidget` (effort state, drag, context menu, picks the
size layout) → `widget/widget-{small,medium,large-row}` + `ModelRing`, `Sparkline`,
`EffortControl`.

- **`data.ts`** — types and all fake data. Two shapes per model: `BaseModel` (raw
  `used` 0–1, `resetsInMin`, `baseBurnPerMin`) and `Model` (adds effective `burnPerMin`).
  `applyEffort*` converts via `EFFORT_MULTIPLIER` (Low 0.6 / Medium 1.0 / High 1.8).
  `SCENARIO_CONFIG` defines the four demo scenarios (idle, working, burning-fast,
  limit-reached), each with starting models, whether it simulates, and default effort.
  Each model has two limit windows: `session` (5h) and `weekly` (7d).
- **`hooks/useSimulation.ts`** — rAF loop that advances `used` and `resetsInMin` on
  `BaseModel`s at `SIM_SPEED` (60× real time) × effort multiplier. Effort is held in a ref,
  pushed up from `UsageWidget` via `onEffortChange`. Resets when scenario changes.
- **`provider-status.ts`** — the core logic. Time-to-empty = `(1 - used) / burnPerMin`.
  Window status: `empty` (used ≥ 1), `tight` (runs out before reset), `healthy`. The
  **binding window** is whichever runs out first; the widget always leads with it.
  `getAdvisoryLine` returns the one-line advisory only when effort is High and dropping to
  Medium would turn a tight session window healthy.
- **`status-copy.ts`** — string formatting. `compactStatus` (small/medium) must be
  ≤ 12 chars and never contain "Session|Weekly|resets|runs out" — enforced by a throw in
  development. `fullStatus` is for the large size. `copy.ts` holds fixed strings; `format.ts` holds time/percent helpers.
- `@deprecated` aliases (`Provider`, `ProviderId`, `getProviderStatus`, `getStatusColor`)
  remain from an earlier naming; use the `Model*` / `getWindowStatus` names.

## Design rules encoded in the code (don't "fix" these)

From the experiment README — these are intentional:

- Lead with **time** ("51m left" / "18m early"), not percent; percent is secondary.
- Effort is an in-widget lever because it changes burn rate visibly.
- The advisory is a flat statement — **no button, no CTA, no colour**.
- **No hover states** on the widget (real macOS widgets don't react to the cursor).
- The context menu includes greyed-out items (e.g. Remove Widget, Edit Widgets) for
  platform fidelity.
- The widget is dark mode only (`.desktop-stage` forces `color-scheme: dark`); animation respects `useReducedMotion` (used by `useTweenedValue`,
  `useDraggable`, `ModelRing`).

## Known discrepancy

The usage-widget README says a wallpaper dropped at `public/wallpaper/desktop.jpg`
(gitignored) is used as the background, but `components/desktop/wallpaper.tsx` is currently
CSS-only and does not load any image.
