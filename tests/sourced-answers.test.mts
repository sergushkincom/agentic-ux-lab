import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANSWERS,
  DOCS,
  PASSAGES,
  STALE_AFTER_MONTHS,
  concerns,
  countByGrounding,
  getAnswer,
  getDoc,
  getPassage,
  headline,
  hiddenCount,
  passageRef,
  sourceLine,
  splitAround,
  visibleSentences,
} from "../src/app/experiments/sourced-answers/answers.ts";

const kinds = (id: string) => concerns(getAnswer(id)).map((concern) => concern.kind);

describe("the script", () => {
  it("has unique ids for documents, passages, answers and sentences", () => {
    const unique = (ids: string[]) => assert.equal(new Set(ids).size, ids.length, ids.join(","));
    unique(DOCS.map((doc) => doc.id));
    unique(PASSAGES.map((passage) => passage.id));
    unique(ANSWERS.map((answer) => answer.id));
    unique(ANSWERS.flatMap((answer) => answer.sentences.map((sentence) => sentence.id)));
  });

  it("points every passage at a document that exists", () => {
    for (const passage of PASSAGES) assert.ok(getDoc(passage.docId), passage.id);
  });

  it("matches each sentence's passages to its mark", () => {
    for (const answer of ANSWERS) {
      for (const sentence of answer.sentences) {
        if (sentence.grounding === "stated") {
          assert.equal(sentence.rests.length, 1, sentence.id);
        } else if (sentence.grounding === "combined") {
          assert.ok(sentence.rests.length >= 2, sentence.id);
          assert.ok(sentence.how, `${sentence.id} must say how it was worked out`);
        } else {
          assert.equal(sentence.rests.length, 0, sentence.id);
          assert.ok(sentence.why, `${sentence.id} must say why it is there`);
        }
      }
    }
  });

  it("rests every sentence on words that are really in the passage", () => {
    for (const answer of ANSWERS) {
      for (const sentence of answer.sentences) {
        for (const support of sentence.rests) {
          assert.ok(
            getPassage(support.passageId).text.includes(support.phrase),
            `${sentence.id}: "${support.phrase}" is not in ${support.passageId}`,
          );
        }
        if (sentence.conflict) {
          assert.ok(
            getPassage(sentence.conflict.passageId).text.includes(sentence.conflict.other),
            sentence.id,
          );
          assert.ok(
            getPassage(sentence.rests[0].passageId).text.includes(sentence.conflict.used),
            sentence.id,
          );
        }
      }
    }
  });

  it("gives every gap documents it looked in and a closest passage that exists", () => {
    for (const answer of ANSWERS) {
      for (const gap of answer.gaps) {
        assert.ok(gap.lookedIn.length > 0, answer.id);
        for (const docId of gap.lookedIn) assert.ok(getDoc(docId));
        if (gap.closest) assert.ok(getPassage(gap.closest.passageId));
      }
    }
  });

  it("throws on an id that is not in the script", () => {
    assert.throws(() => getDoc("nope"), /unknown document/);
    assert.throws(() => getPassage("nope"), /unknown passage/);
    assert.throws(() => getAnswer("nope"), /unknown answer/);
  });
});

describe("the line above the answer", () => {
  it("counts every mark and the part that was not found", () => {
    assert.deepEqual(countByGrounding(getAnswer("hotel")), { stated: 2, combined: 1, none: 1 });
    assert.equal(
      headline(getAnswer("hotel")),
      "4 sentences: 2 say what a document says, 1 is worked out, 1 has no source. 1 part of your question I couldn't find.",
    );
  });

  it("leaves out a mark that no sentence has", () => {
    assert.equal(
      headline(getAnswer("abroad")),
      "4 sentences: 3 say what a document says, 1 has no source.",
    );
  });

  it("says nothing was found when there is no sentence", () => {
    assert.equal(
      headline(getAnswer("dinner")),
      "I couldn't find this. Nothing below is an answer.",
    );
  });
});

describe("the line under a sentence", () => {
  const sentence = (answerId: string, id: string) => {
    const found = getAnswer(answerId).sentences.find((entry) => entry.id === id);
    assert.ok(found, id);
    return found;
  };

  it("names the document and section for a stated sentence", () => {
    assert.equal(passageRef("travel-3.2"), "Travel and expenses policy · 3.2");
    assert.equal(sourceLine(sentence("hotel", "hotel-limit")), "Travel and expenses policy · 3.2");
  });

  it("says a worked-out sentence is in no single document", () => {
    assert.equal(
      sourceLine(sentence("hotel", "hotel-ceiling")),
      "Worked out from 2 passages. No document says it in one place.",
    );
  });

  it("calls a sentence with no source a guess", () => {
    assert.equal(sourceLine(sentence("hotel", "hotel-timing")), "No source. This is a guess.");
  });
});

describe("only what rests on a document", () => {
  it("takes the guesses out and counts them", () => {
    const answer = getAnswer("hotel");
    assert.equal(visibleSentences(answer, false).length, 4);
    assert.deepEqual(
      visibleSentences(answer, true).map((sentence) => sentence.id),
      ["hotel-limit", "hotel-exception", "hotel-ceiling"],
    );
    assert.equal(hiddenCount(answer, true), 1);
    assert.equal(hiddenCount(answer, false), 0);
  });
});

describe("before you act on this", () => {
  it("puts documents that disagree first and what was not found last", () => {
    assert.deepEqual(kinds("hotel"), ["disagree", "guess", "combined", "gap"]);
  });

  it("says which document was used when two disagree, and why", () => {
    const [disagree] = concerns(getAnswer("hotel"));
    assert.equal(disagree.sentenceId, "hotel-limit");
    assert.equal(
      disagree.text,
      "Two documents disagree on the hotel limit. “Travel and expenses policy” says €160, “Expenses FAQ” says €140. I used the one edited more recently (2 months ago against 19 months).",
    );
  });

  it("flags an old document once, with the number of sentences on it", () => {
    assert.ok(getDoc("abroad").editedMonthsAgo >= STALE_AFTER_MONTHS);
    assert.deepEqual(kinds("abroad"), ["guess", "old", "read-as"]);
    const old = concerns(getAnswer("abroad")).find((concern) => concern.kind === "old");
    assert.equal(
      old?.text,
      "“Working from abroad guideline” was last edited 14 months ago. 3 sentences rest on it.",
    );
    assert.equal(old?.sentenceId, "abroad-days");
  });

  it("does not flag a document that is only the losing side of a disagreement", () => {
    assert.equal(kinds("hotel").includes("old"), false);
  });

  it("says how the question was read", () => {
    const readAs = concerns(getAnswer("abroad")).find((concern) => concern.kind === "read-as");
    assert.match(readAs?.text ?? "", /^I read “this year” as the calendar year\./);
    assert.equal(readAs?.sentenceId, undefined);
  });

  it("lists only the gap when nothing was found", () => {
    const list = concerns(getAnswer("dinner"));
    assert.deepEqual(
      list.map((concern) => concern.text),
      ["Not found: a budget for team dinners."],
    );
  });

  it("points every sentence concern at a sentence in the same answer", () => {
    for (const answer of ANSWERS) {
      const ids = new Set(answer.sentences.map((sentence) => sentence.id));
      for (const concern of concerns(answer)) {
        if (concern.sentenceId) assert.ok(ids.has(concern.sentenceId), concern.id);
      }
    }
  });
});

describe("the highlight", () => {
  it("splits a passage around the words a sentence rests on", () => {
    assert.deepEqual(splitAround("Hotels up to €160 per night.", "€160"), [
      "Hotels up to ",
      "€160",
      " per night.",
    ]);
  });

  it("keeps the passage whole when the words are not in it", () => {
    assert.deepEqual(splitAround("Hotels.", "meals"), ["Hotels.", "", ""]);
  });
});
