# Sourced answers

**The question:** when an assistant answers from your documents, how do you tell a
sentence that rests on a source from a confident guess, without reading every source?

Route: `/experiments/sourced-answers`

## What it is

One answer, read sentence by sentence. Every sentence carries one of three marks: a
document says this, it was worked out from more than one passage, or it has no source.
The mark is a line on the left and a line of words under the sentence. Open a sentence
and the passage is there, with the exact words it rests on underlined.

Above the answer is one line that counts the marks. Below it is a list called "Before you
act on this": documents that disagree, guesses, old sources, how the question was read,
and what was not found.

There are three scripted questions over four made-up documents. One answer mixes all
three marks. One rests on an old guideline and adds a guess. One finds nothing and says
so. There is no model, no search and no real company.

## Four decisions I'd defend

**1. The mark sits on the sentence, not at the bottom.**
A list of sources under an answer says the answer has sources. It does not say which
sentence has none. Here a guess looks different before you open anything.

**2. "Worked out" is its own mark.**
"€160 plus 25% is €200" is not a quote and not a guess. No document gives the figure, the
assistant did the sum. That is the sentence a person most often takes for a citation, so
it gets its own line style and shows both passages and the step between them.

**3. Not finding something is an answer.**
"I couldn't find this" names what is missing, where it looked, and the closest passage
with the reason it was not used. The dinner question has a passage about meals right
there. The screen shows it and does not answer from it.

**4. Doubts come before the action, in order.**
The list starts with documents that disagree and ends with what was not found. Each
doubt that is about a sentence opens that sentence. A person who reads only this list
still knows what to check.

## Deliberately not built

A model call · real search or retrieval · confidence as a number or percentage · opening
the full document · asking your own question · follow-up questions · fixing a wrong
source · permissions on documents · an answer history · real companies, people or
policies.

Each of those is a real feature. None of them is required to see whether a person can
tell, at a glance, which sentence to trust and which to check.

## Running it

```bash
npm run dev
# → http://localhost:3000/experiments/sourced-answers

npm test
```
