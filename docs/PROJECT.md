# Agentic UX Lab — project passport

Interaction problems in AI and enterprise software, built rather than described. Live at [https://agentic-ux-lab.vercel.app](https://agentic-ux-lab.vercel.app).

Prototype only. Fake data throughout. No backend and no model calls.

## Who it is for

A person who lands on the repo and needs to see the interaction, not only read about it. The questions are the ones a static comp cannot answer: latency, streaming, autonomy, trust, and a finite allowance.

## What runs in this repo

Four experiments are routes here. Usage widget and Translation trust are on the lab site and lead the README as a short GIF. State comments and Absence coverage are routes here and have no README GIF yet.

| Experiment | Question | Live | README |
| --- | --- | --- | --- |
| 02 · Usage widget | When you're spending a finite allowance, what number do you actually need to see? | [Live](https://agentic-ux-lab.vercel.app/experiments/usage-widget) | `docs/usage-widget.gif` |
| Translation trust | When a system rewrites what you say, how do you know what it changed? | [Live](https://agentic-ux-lab.vercel.app/experiments/translation-trust) | `docs/translation-trust.gif` |
| State comments | When someone leaves feedback on a running prototype, how does the next person land on exactly the moment it was about: the step, the open picker and the screen width, not just the page? | Route `/experiments/state-comments` | — |
| Absence coverage | When an assistant covers for you for a week, what was it allowed to do, who decided, and what do you read first on Monday morning? | Route `/experiments/absence-coverage` | — |

Translation trust, State comments and Absence coverage have no number. The source does not publish one.

The usage-widget GIF is the widget in use: effort goes from Medium to High, and the binding window flips from time left to time early. Right-click changes the size.

The Translation trust GIF is the note a sender would send. Show original puts their words under the rewrite. Opening the softened line and choosing Restore puts "The parts will be late." back. The GIF is 960×1182, 8.4 seconds, about 210 KB. It was captured with Playwright from the running app.

The index also links experiments that live in other repos: Workflow canvas (01), Knowledge Atlas, Keyword Tracker, and Permission rings. Those are not routes in this app.

The home page is a grid of cards. Each card shows a drawn preview of that prototype and lifts slightly on hover. The lift is off when the system asks for reduced motion. A new experiment without a drawing yet still gets a plain plate. Each internal experiment has its own README: the question, the decisions, and a list of what was deliberately not built.

## Stack and checks

Next.js · TypeScript · Tailwind CSS. Node 22, pinned in `.nvmrc`. Install with `npm ci`.

```bash
npm run typecheck
npm run check:registry
npm run check:translation
npm test
npm run lint
npm run build
npm run test:smoke
```

`npm run test:smoke` is Playwright over the index and every internal experiment route. Run `npm run build` first. CI is `.github/workflows/ci.yml`, on pull requests and pushes to `main`.

## Status

Shipped and live:

- Usage widget, with the README GIF and the two stills under it.
- Translation trust, with a live link in the experiments table and a README GIF beside the usage-widget GIF.
- Registry-driven index and experiment shell. The index is a card grid with a preview of each experiment.
- Home cards lift on hover, and stay still when reduced motion is on.
- Open Graph image for links to the site.
- Unit tests for the usage-widget formatters and the translation-trust script, plus the Playwright smoke.

State comments is a route on this branch. It pins feedback to the step, the open picker, and the frame width. It is not on the lab site until this branch merges.

Absence coverage is a route on this branch. A plan set on Friday decides what the Monday report says about one scripted week. It is not on the lab site until this branch merges.

## Out of scope

Each experiment README lists what that screen does not do. In short: no model calls, no accounts, no real send, and no second automatic rewrite after a person corrects a line.

## Rules

- MIT license (`LICENSE`, copyright 2026 sergushkin.com).
- Fake data only. Do not add real company names or real people.
- One experiment answers one question. Do not widen a screen past its README.
- Owner: Denys Sergushkin. He merges.

State comments: a new comment opens into the list and a short highlight fades. The empty filter shows an icon, a line, and Show resolved. Reduced motion keeps both still.
