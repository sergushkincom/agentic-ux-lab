# 02 · Usage widget

**The question:** when you're spending a finite allowance, what number do you actually
need to see?

Live demo → _coming after deploy_

## What it is

A macOS-style desktop widget for AI usage limits, in three sizes, with a right-click
menu that switches size and demo scenario the way a real widget's menu does.

Today this information is buried in a settings screen you have to go looking for. The
widget puts it where you already look — and changes what it puts there.

## Four decisions I'd defend

**1. Time, not percent.**
Every tool in this space leads with "73% used". That number cannot answer the only
question anyone actually has: will I run out before this resets? So the widget
computes time-to-empty at the current burn rate, compares it to the reset clock, and
leads with whichever is binding — "51m left" or "18m early". The percentage is
demoted to secondary. It's the honest hierarchy, and it's the opposite of what
everyone ships.

**2. Effort is a lever, not a label.**
Reasoning effort multiplies burn rate, so it belongs inside the widget rather than in
a settings screen three clicks away. Switching Medium → High visibly flips a model
from healthy to running-out. You can see what the setting costs you before you pay
for it.

**3. The advisory states, it does not nudge.**
When a lower effort level would keep you under the limit, the widget says so in one
flat sentence: "Medium effort would last past the reset." No button, no "Switch now",
no colour. The moment it gains a call to action it stops being an instrument and
starts being a nudge that optimises someone else's costs at the expense of your work.

**4. No hover state, deliberately.**
Real macOS widgets do not respond to the cursor at all — no highlight, no tooltip,
nothing until a click. Reproducing that felt like a bug while building it and reads
as correct on the desktop. Platform fidelity means copying the restraint, not just
the corner radius.

## Two limit windows

Real allowances run two clocks at once: a rolling session window and a weekly one.
The interesting case is when they disagree — everything looks fine hour to hour, then
the weekly wall arrives and you're locked out for days. The widget always reports the
window that binds first and names which one it is.

## Prior art

This space already has working tools, and it's worth being precise about what they
solved and what they didn't.

**Codenotch** ships the credential model I'd have wanted to design: it never signs
in, and borrows each reading from the tool that already holds the account. No API
keys, nothing to steal. It also solves presence properly — always-visible,
show-on-hover, or hidden, on any screen edge.

**llmquota** proves the data is genuinely available on disk, reading local config and
credential stores across five coding CLIs.

Both lead with percent used and a reset date. Neither computes time-to-empty at the
current burn rate, and neither treats reasoning effort as a lever you can pull and see
the cost of. That gap is what this prototype is about.

## Deliberately not built

Real API integration · notifications · a settings panel · light mode · more than three
models · usage history beyond 24 hours · a menu-bar variant.

The data this needs is genuinely available on disk. This prototype fakes it, because
the question above is a design question, not a plumbing one.

## What I'd do next

- **Presence.** A desktop widget is only visible when the desktop is, which is rarely.
  Codenotch answers this with an edge pill and three visibility modes. My prototype
  dodges the question entirely — and it's the first thing a real version would have to
  solve.
- **Who sets the threshold?** The widget assumes you want to know. A real product has
  to let a team decide where "decide alone" ends and "ask me" begins, per workflow.
- **Drift.** My guess is people set effort once and never revisit it. If that's true,
  the interface has to surface the drift on its own.
- **The weekly wall.** Nobody designs for the state where you're fine all day and then
  locked out until Tuesday.

## Running it

```bash
npm install
npm run dev
# → http://localhost:3000/experiments/usage-widget
```

Right-click the widget to switch size and scenario.

Drop any wallpaper into `public/wallpaper/desktop.jpg` to use it as the background —
that folder is gitignored, and the prototype falls back to a generated CSS wallpaper
when no file is present.

Built in my own time. Fake data throughout, no production code and nothing
proprietary — just enough to feel the interaction.
