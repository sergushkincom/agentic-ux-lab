# Draft review

**The question:** when an assistant writes a draft for you, how do you review it in less
time than writing it, change what matters, and still own the result?

Route: `/experiments/draft-review`

## What it is

A reply an assistant drafted, and the six decisions it made for you while writing it: the
date it offered, the price it quoted, the question it left unanswered, who it put in copy.
Each decision is marked in the draft with a line and a number. Three of them the assistant
is not sure about, and it says why.

You review decisions, not paragraphs. Each one has three actions: keep it, change it, or
ask why. Changing means picking another answer, and the draft rewrites that sentence at
once. One line above the draft counts the decisions, the doubts, and how many you have
looked at.

The reply cannot go while a doubt is still open. The rest can go unopened, and the screen
says how many went as the assistant wrote them. The people and the message are made up,
the behaviour is scripted, and nothing is sent.

## Four decisions I'd defend

**1. The unit of review is a decision, not a paragraph.**
A paragraph asks "is this well written?". A decision asks "is this what I want to say?".
The second question is the one only the person can answer, and it is faster to answer.

**2. A decision that left no words is still listed.**
The assistant skipped the question about the recordings. In a plain draft that is
invisible: you cannot review a sentence that is not there. Here it has a number, a place
in the draft, and a card like the others.

**3. Doubts cannot be kept in bulk.**
"Keep the ones I'm sure about" exists. "Keep all" does not. Review time goes where the
assistant said it was guessing, and Send waits for those.

**4. The screen says who decided what.**
After sending: "You decided 4 of 6: 1 changed, 3 kept. 2 went as the assistant wrote
them." Owning the result starts with knowing which parts of it you looked at.

## Deliberately not built

A model call · free text editing of the draft · writing your own option · rewriting tone
or length · more than one draft · real send, real mail or calendar · the assistant
learning from your changes · comments or a second reviewer · version history · real
companies, people or prices.

Each of those is a real feature. None of them is required to see whether a person can
review a draft by its decisions and still say "this is mine".

## Running it

```bash
npm run dev
# → http://localhost:3000/experiments/draft-review

npm test
```
