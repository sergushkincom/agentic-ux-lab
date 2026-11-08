# Translation trust

**The question:** when a system rewrites what you say, how do you know what it changed?

Route: `/experiments/translation-trust`

## What it is

One note, already rewritten, on one screen. The sender reads the words the other person
would see, with three marks a person can scan without a diff: softened, left out, and
unsure. The original is one control away. Each mark can be restored or corrected before
a send that never leaves the prototype.

The note is scripted. There is no model and no recipient.

## Four decisions I'd defend

**1. The rewrite is the page.**
The sender's job is to notice a shift in a sentence, not to learn a review tool. The
outgoing words are the page. A mark sits on the phrase. A count above says how many
are still open.

**2. The original stays one click away, and the draft stays put.**
Showing the original does not swap the draft. Hiding it does not put the rewrite back
over a correction. The two texts can be on screen together, and only an explicit
control changes the words that would go.

**3. A correction is owned by the person who made it.**
Restore and Correct write the person's choice. Use the rewrite is also explicit.
Nothing in the screen runs the script again over a restored or edited phrase.

**4. Send is a stop, not a delivery.**
The button is labelled Send because that is the moment of trust. The result says
Not sent, quotes the exact words that would have gone, and leaves the corrections in
the draft.

## Deliberately not built

A model call · a language picker · a thread of messages · mail, chat, or any send ·
a second automatic rewrite after an edit · accounts · real people or companies.

Each of those is a real feature. None of them is required to see whether a sender can
catch a softened line, a missing cause, and an unsure sentence before the note lands.

## Running it

```bash
npm run dev
# → http://localhost:3000/experiments/translation-trust

npm run check:translation
```
