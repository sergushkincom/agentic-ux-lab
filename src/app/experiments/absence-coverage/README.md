# Absence coverage

**The question:** when an assistant covers for you for a week, what was it allowed to do,
who decided, and what do you read first on Monday morning?

Route: `/experiments/absence-coverage`

## What it is

Two screens around one week away. On Friday you set what the assistant may do in your
name (answer from your notes, move your meetings, pass a message to its owner), where it
stops, and who gets the rest. The plan is read back as plain sentences before you leave.
On Monday the same plan has run over fourteen requests, and the report starts with what
still waits for you.

The week is scripted. The same fourteen requests come in whatever you choose, so a change
on Friday shows up as a different Monday. There is no model, no mailbox and no calendar.

## Four decisions I'd defend

**1. Monday starts with what waits, not with a log.**
The first line is three counts: waiting for you, closed by someone else, done by the
assistant. The waiting items are open on the page. What it did is folded away, because
that is the part you can read later.

**2. Every stop says who decided.**
A request it did not handle carries one of four marks: you turned this off, your limit,
never allowed, its own call. "It was not permitted" and "it was permitted and chose not
to" are different facts, and only the second one tells you something about the assistant.

**3. One limit is not a setting.**
It never promises a price, a date or a yes in your name. That line sits in the Friday
screen without a switch. A setting invites the one tired Friday when it gets turned on.

**4. A stop says what the other person heard.**
"Told Ilse: you are back on Monday, and Mara has this." On Monday you do not have to
guess whether someone has been waiting in silence for five days.

## Deliberately not built

A model call · a real mailbox or calendar · editing the assistant's replies · undo for a
moved meeting · rules per person or per project · working hours and time zones · urgent
requests that reach you on holiday · a second covering person · accounts · real people or
companies.

Each of those is a real feature. None of them is required to see whether a person can set
a plan in a minute on Friday and trust the first screen on Monday.

## Running it

```bash
npm run dev
# → http://localhost:3000/experiments/absence-coverage

npm test
```
