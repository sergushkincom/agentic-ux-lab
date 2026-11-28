import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BODY,
  COPY_DECISION,
  DECISIONS,
  accept,
  acceptSure,
  canSend,
  choose,
  counts,
  currentOption,
  decisionNumber,
  getDecision,
  headline,
  initialReview,
  orderedDecisions,
  receipt,
  reopen,
  replyText,
  sendBlocker,
  statusLabel,
  unreviewedNote,
} from "../src/app/experiments/draft-review/review.ts";

const doubted = DECISIONS.filter((decision) => decision.doubt).map((decision) => decision.id);

describe("the script", () => {
  it("has unique ids for decisions and for the options of each one", () => {
    const unique = (ids: string[]) => assert.equal(new Set(ids).size, ids.length, ids.join(","));
    unique(DECISIONS.map((decision) => decision.id));
    for (const decision of DECISIONS) unique(decision.options.map((option) => option.id));
  });

  it("gives every decision a drafted option, a reason and something to change to", () => {
    for (const decision of DECISIONS) {
      assert.ok(decision.options.some((option) => option.id === decision.drafted), decision.id);
      assert.ok(decision.options.length >= 2, decision.id);
      assert.ok(decision.why.length > 0, decision.id);
    }
  });

  it("says something in place of an option that leaves words out", () => {
    for (const decision of DECISIONS) {
      for (const option of decision.options) {
        if (option.text === "") assert.ok(option.placeholder, `${decision.id}/${option.id}`);
      }
    }
  });

  it("places every decision in the draft once, in the order of its number", () => {
    const placed = [
      COPY_DECISION,
      ...BODY.flat().flatMap((part) => (typeof part === "string" ? [] : [part.decision])),
    ];
    assert.deepEqual(placed, DECISIONS.map((decision) => decision.id));
  });

  it("has doubts and decisions the assistant is sure about", () => {
    assert.equal(doubted.length, 3);
    assert.equal(DECISIONS.length, 6);
  });

  it("lists a decision that left no words in the draft", () => {
    assert.equal(currentOption(initialReview(), "recordings").text, "");
  });

  it("numbers decisions from 1 in draft order", () => {
    assert.equal(decisionNumber(DECISIONS[0].id), 1);
    assert.equal(decisionNumber(DECISIONS[5].id), 6);
  });
});

describe("reviewing", () => {
  it("starts with nothing looked at", () => {
    const review = initialReview();
    assert.equal(
      headline(review),
      "I made 6 decisions for you. I'm not sure about 3. You have looked at 0 of 6.",
    );
    assert.deepEqual(counts(review), {
      total: 6,
      doubts: 3,
      open: 6,
      openDoubts: 3,
      openSure: 3,
      accepted: 0,
      changed: 0,
    });
  });

  it("lists the doubts first", () => {
    const order = orderedDecisions().map((decision) => decision.id);
    assert.deepEqual(order.slice(0, 3), doubted);
    assert.equal(order.length, DECISIONS.length);
  });

  it("keeps the drafted words on accept", () => {
    const review = accept(initialReview(), "date");
    assert.deepEqual(review.date, { choice: "wed-19", status: "accepted" });
    assert.equal(statusLabel(review, "date"), "Kept by you");
  });

  it("treats another option as a change and the drafted one as a keep", () => {
    let review = choose(initialReview(), "date", "fri-14");
    assert.equal(review.date.status, "changed");
    assert.equal(statusLabel(review, "date"), "Changed by you");
    assert.match(replyText(review), /you will have the report on Friday 14 March/);

    review = choose(review, "date", "wed-19");
    assert.equal(review.date.status, "accepted");
  });

  it("goes back to the draft from a change", () => {
    const changed = choose(initialReview(), "price", "less");
    assert.deepEqual(accept(changed, "price"), {
      ...changed,
      price: { choice: "same", status: "accepted" },
    });
    assert.deepEqual(reopen(changed, "price").price, { choice: "same", status: "open" });
  });

  it("refuses an option that is not in the script", () => {
    assert.throws(() => choose(initialReview(), "date", "tomorrow"));
    assert.throws(() => getDecision("signature"));
  });

  it("does not change the review it was given", () => {
    const review = initialReview();
    choose(review, "date", "fri-14");
    acceptSure(review);
    assert.deepEqual(review, initialReview());
  });

  it("says in words when a doubt has not been looked at", () => {
    const review = initialReview();
    assert.equal(statusLabel(review, "price"), "Not looked at · not sure");
    assert.equal(statusLabel(review, "lena"), "Not looked at");
  });
});

describe("keeping in bulk", () => {
  it("keeps only what the assistant is sure about", () => {
    const review = acceptSure(initialReview());
    for (const decision of DECISIONS) {
      assert.equal(review[decision.id].status, decision.doubt ? "open" : "accepted", decision.id);
    }
  });

  it("leaves a change the person already made", () => {
    const review = acceptSure(choose(initialReview(), "call", "none"));
    assert.deepEqual(review.call, { choice: "none", status: "changed" });
  });
});

describe("sending", () => {
  it("waits for every doubt", () => {
    let review = acceptSure(initialReview());
    assert.equal(canSend(review), false);
    assert.equal(
      sendBlocker(review),
      "3 decisions I'm not sure about are still open. Look at them before this goes.",
    );
    assert.equal(unreviewedNote(review), null);

    review = accept(review, "date");
    review = accept(review, "price");
    assert.equal(
      sendBlocker(review),
      "1 decision I'm not sure about is still open. Look at it before this goes.",
    );

    review = choose(review, "recordings", "later");
    assert.equal(canSend(review), true);
    assert.equal(sendBlocker(review), null);
  });

  it("can go with sure decisions unopened, and says so", () => {
    let review = initialReview();
    for (const id of doubted) review = accept(review, id);
    assert.equal(canSend(review), true);
    assert.equal(
      unreviewedNote(review),
      "3 decisions go as I wrote them. You have not looked at them.",
    );
    assert.equal(
      receipt(review),
      "You decided 3 of 6: 0 changed, 3 kept. 3 went as the assistant wrote them.",
    );

    review = accept(accept(review, "lena"), "call");
    assert.equal(unreviewedNote(review), "1 decision goes as I wrote it. You have not looked at it.");
    assert.equal(
      receipt(review),
      "You decided 5 of 6: 0 changed, 5 kept. 1 went as the assistant wrote it.",
    );
  });

  it("says who decided what when everything was looked at", () => {
    let review = acceptSure(initialReview());
    review = accept(review, "date");
    review = choose(review, "price", "separate");
    review = choose(review, "recordings", "internal");
    assert.equal(unreviewedNote(review), null);
    assert.equal(receipt(review), "You decided 6 of 6: 2 changed, 4 kept.");
  });
});

describe("the reply as it would go", () => {
  it("has no placeholder words and no empty paragraph", () => {
    const text = replyText(initialReview());
    assert.doesNotMatch(text, /Nothing here about/);
    assert.doesNotMatch(text, /\n\n\n/);
    assert.ok(text.startsWith("Hi Tomas,\n\nThanks for the questions. Friday the 14th is too early"));
    assert.ok(text.endsWith("Best,\nMira"));
  });

  it("adds the sentence a change brings in and drops the one it takes out", () => {
    let review = choose(initialReview(), "recordings", "internal");
    review = choose(review, "call", "none");
    const text = replyText(review);
    assert.match(text, /The interview recordings stay with us\./);
    assert.doesNotMatch(text, /Thursday/);
    assert.doesNotMatch(text, /No call offered/);
  });
});
