# State comments

**The question:** when someone leaves feedback on a running prototype, how does the next person land on *exactly* the moment it was about: the step, the open picker and the screen width, not just the page?

Route: `/experiments/state-comments`

## What it is

A small 3-step "Book a meeting" prototype with a side comments panel. Every comment stores
the exact UI state (`step`, `picker`, and frame width) in addition to text, and each comment
can restore that state on click.

The route is intentionally local-first: URL state for shareability, `localStorage` for
persistence, and no backend.

## Four decisions I'd defend

**1. The state is first-class, not metadata.**
The panel shows each comment's state as a readable chip (`Step 2 · picker open · 360 px`)
because the value of the comment is inseparable from where in the flow it was made.

**2. The URL is the transport format.**
`?step=2&picker=open&w=360` is compact enough to inspect and robust enough to restore.
The prototype updates it with `replaceState`, so state changes stay shareable without
polluting browser history.

**3. Width is explicit and reproducible on desktop.**
A segmented control (320/360/768/1280) sets the prototype frame width directly. The point is
to recreate mobile breakpoints while reviewing on a larger screen.

**4. Resolved comments stay visible until filtered.**
Resolved items are greyed out in place, so context is preserved. A hide-resolved toggle lets
reviewers narrow focus without erasing history. When that filter hides every comment, the
panel shows an empty state: an icon, one line, and Show resolved, which turns the filter off.
A comment just added opens into the list (height and opacity) and a short highlight fades.
Both stay still when reduced motion is on. The arrival and the empty state follow an idea
from [Plannotator](https://github.com/backnotprop/plannotator) (Apache-2.0). The code is written
for this lab.

## Deliberately not built

Real multi-user sync · snapshots of full form data per comment · auth · backend storage ·
design review threads · notifications · automated screenshot capture.

## Running it

```bash
npm run dev
# → http://localhost:3000/experiments/state-comments
```
