# Agentic UX Lab

Interaction problems in AI and enterprise software, built rather than described.

I'm a product designer working on complex B2B systems — ERP, workflow tooling,
AI-enabled platforms. When a design question is about latency, streaming, autonomy or
trust, a static comp cannot answer it. So I build the answer first, feel where it
breaks, and take it back into Figma once the interaction is settled.

This repo is where those questions get built. One experiment at a time.

![The usage widget in use: switching effort from Medium to High turns Opus from "44m left" to "5m early", then the large size shows the same flip with the advisory "Medium effort would last past the reset."](./docs/usage-widget.gif)

*Effort is a lever: Medium → High flips Opus from "44m left" to "5m early". Right-click switches the size, as on a real widget.*

[![Translation trust: the rewrite marks a softened line, a left-out cause, and an unsure sentence. Show original, open the softened line, and Restore puts "The parts will be late." back.](./docs/translation-trust.gif)](https://agentic-ux-lab.vercel.app/experiments/translation-trust)

*[Translation trust](https://agentic-ux-lab.vercel.app/experiments/translation-trust): the original stays one click away, and Restore puts "The parts will be late." back in the note.*

![A macOS desktop widget showing Opus will run out about 18 minutes before its limit resets](./preview.png)

*The widget reports the window that runs out first, and says so in time — not percent.*

![The widget's context menu, with Remove Widget and Edit Widgets greyed out](./preview-menu.png)

*A real widget's menu has these items. Their absence is what would give the prototype away.*

## Experiments

| # | Experiment | The question it answers | Demo |
|---|------------|-------------------------|------|
| 01 | Workflow canvas | What does an interface look like when a system is honest about not knowing, and hands the decision back to a person? | [Live →](https://denys-workflow-canvas.vercel.app/experiments/workflow-canvas) |
| 02 | [Usage widget](src/app/experiments/usage-widget) | When you're spending a finite allowance, what number do you actually need to see? | [Live →](https://agentic-ux-lab.vercel.app/experiments/usage-widget) |
| | [Translation trust](src/app/experiments/translation-trust) | When a system rewrites what you say, how do you know what it changed? | [Live →](https://agentic-ux-lab.vercel.app/experiments/translation-trust) |
| | [State comments](src/app/experiments/state-comments) | When someone leaves feedback on a running prototype, how does the next person land on exactly the moment it was about: the step, the open picker and the screen width, not just the page? | Route `/experiments/state-comments` |
| | [Draft review](src/app/experiments/draft-review) | When an assistant writes a draft for you, how do you review it in less time than writing it, change what matters, and still own the result? | Route `/experiments/draft-review` |
| | Knowledge Atlas | What if the way an AI sorted your notes were something you could see, question and overrule, and the AI then left your correction alone? | [Live →](https://denys-knowledge-atlas.vercel.app) |
| | Keyword Tracker | A keyword rank tracker where the table is the chart — a clickable prototype in React and TypeScript. | [Live →](https://denys-keyword-tracker.vercel.app) |
| | Permission rings | When a scheduling agent can take other people's time, how does a person say how far it may go — without a settings page nobody reads, and without turning every booking into a request? | [Live →](https://permission-rings.vercel.app) |

## Stack

Next.js · TypeScript · Tailwind CSS. Fake data throughout — no backend, no model calls.
Install with npm from `package-lock.json` (`npm ci`).

## Checks

Pull requests and pushes to `main` run on the Node version pinned in `.nvmrc`
(22, also declared as `22.x` in `package.json` `engines`) in GitHub Actions
(`.github/workflows/ci.yml`):

```bash
npm ci
npm run typecheck
npm run check:registry
npm run check:translation
npm test
npm run lint
npm run build
npm run test:smoke
```

`npm run test:smoke` is a Playwright pass over the site index and every internal
experiment route. Run `npm run build` first; it uses that production build.

## What this is not

Production code. Each experiment is scoped to one question and deliberately stops at
the edge of it. The list of things I chose *not* to build is part of every experiment
README.

## About

Denys Sergushkin — Principal Product Designer, 14 years in ERP and AI-enabled B2B
software.

[sergushkin.com](https://sergushkin.com) · [LinkedIn](https://linkedin.com/in/sergushkincom) · [Dribbble](https://dribbble.com/sergushkincom)
