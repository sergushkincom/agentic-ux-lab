"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ANSWERS,
  GROUNDINGS,
  GROUNDING_LABEL,
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
  type Answer,
  type Gap,
  type Grounding,
  type Sentence,
} from "./answers";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const card = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5";

/** The mark is a line style, and every sentence also carries its label in words. */
const EDGE: Record<Grounding, string> = {
  stated: "border-l-[3px] border-solid border-[var(--fg)]",
  combined: "border-l-[3px] border-dashed border-[var(--fg-muted)]",
  none: "border-l-[3px] border-dotted border-[var(--fg-muted)]",
};

export function AnswerScreen() {
  const [answerId, setAnswerId] = useState(ANSWERS[0].id);
  const [openId, setOpenId] = useState<string | null>(null);
  const [documentsOnly, setDocumentsOnly] = useState(false);
  const [jumpTo, setJumpTo] = useState<string | null>(null);
  const sentenceButtons = useRef(new Map<string, HTMLButtonElement>());

  const answer = getAnswer(answerId);
  const shown = visibleSentences(answer, documentsOnly);
  const hidden = hiddenCount(answer, documentsOnly);
  const unsure = concerns(answer);

  // A concern points at a sentence: open it and move focus there once it is on the page.
  useEffect(() => {
    if (!jumpTo) return;
    const button = sentenceButtons.current.get(jumpTo);
    if (button) {
      button.focus();
      button.scrollIntoView({ block: "center" });
    }
    setJumpTo(null);
  }, [jumpTo]);

  function ask(id: string) {
    setAnswerId(id);
    setOpenId(null);
  }

  function showSentence(id: string) {
    const sentence = answer.sentences.find((entry) => entry.id === id);
    if (sentence?.grounding === "none") setDocumentsOnly(false);
    setOpenId(id);
    setJumpTo(id);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
          An assistant answers from four internal documents. Each sentence says what it rests
          on. The questions and answers are scripted, the documents are made up, and no model
          is called.
        </p>

        <section aria-labelledby="ask-heading" className="flex flex-col gap-2">
          <h2 id="ask-heading" className="text-sm font-medium">
            Ask
          </h2>
          <ul className="flex flex-col gap-2">
            {ANSWERS.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  aria-pressed={entry.id === answerId}
                  onClick={() => ask(entry.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${focus} ${
                    entry.id === answerId
                      ? "border-[var(--fg)] bg-[var(--surface)] font-medium"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)]"
                  }`}
                >
                  {entry.question}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="answer-heading" className={card}>
          <h2 id="answer-heading" className="text-sm font-medium">
            Answer
          </h2>
          <p data-testid="headline" className="mt-2 text-base leading-snug font-medium">
            {headline(answer)}
          </p>

          {answer.sentences.length > 0 && (
            <>
              <Key answer={answer} />

              <ol className="mt-4 flex flex-col gap-3">
                {shown.map((sentence) => (
                  <SentenceRow
                    key={sentence.id}
                    sentence={sentence}
                    open={openId === sentence.id}
                    onToggle={() => setOpenId(openId === sentence.id ? null : sentence.id)}
                    buttonRef={(node) => {
                      if (node) sentenceButtons.current.set(sentence.id, node);
                      else sentenceButtons.current.delete(sentence.id);
                    }}
                  />
                ))}
              </ol>

              {hidden > 0 && (
                <p role="status" className="mt-3 text-sm text-[var(--fg-muted)]">
                  {hidden} {hidden === 1 ? "sentence" : "sentences"} with no source hidden.
                </p>
              )}

              <label className="mt-4 flex gap-3 border-t border-[var(--border)] pt-4 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
                  checked={documentsOnly}
                  onChange={(event) => setDocumentsOnly(event.target.checked)}
                />
                <span>
                  Only what rests on a document
                  <span className="block text-[var(--fg-muted)]">
                    Takes the guesses out of the answer. They stay in the list below.
                  </span>
                </span>
              </label>
            </>
          )}

          {answer.gaps.map((gap, index) => (
            <NotFound key={index} gap={gap} whole={answer.sentences.length === 0} />
          ))}
        </section>

        <section aria-labelledby="unsure-heading" className={card}>
          <h2 id="unsure-heading" className="text-sm font-medium">
            Before you act on this
          </h2>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            What I was not sure about, most serious first.
          </p>
          <ul data-testid="concerns" className="mt-3 flex flex-col gap-3">
            {unsure.map((concern) => (
              <li
                key={concern.id}
                data-kind={concern.kind}
                className="border-t border-[var(--border)] pt-3 text-sm leading-relaxed first:border-t-0 first:pt-0"
              >
                {concern.text}
                {concern.sentenceId && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={() => showSentence(concern.sentenceId!)}
                      className={`rounded text-[var(--accent)] underline underline-offset-2 ${focus}`}
                    >
                      Show the sentence
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Key({ answer }: { answer: Answer }) {
  const counts = countByGrounding(answer);
  return (
    <ul
      aria-label="How to read the marks"
      className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--fg-muted)]"
    >
      {GROUNDINGS.map((grounding) => (
        <li key={grounding} className="flex items-center gap-2">
          <span aria-hidden className={`inline-block h-4 ${EDGE[grounding]}`} />
          {GROUNDING_LABEL[grounding]} · {counts[grounding]}
        </li>
      ))}
    </ul>
  );
}

function SentenceRow({
  sentence,
  open,
  onToggle,
  buttonRef,
}: {
  sentence: Sentence;
  open: boolean;
  onToggle: () => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}) {
  const panelId = useId();
  const guess = sentence.grounding === "none";

  return (
    <li data-grounding={sentence.grounding} className={`pl-3 ${EDGE[sentence.grounding]}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className={`block w-full rounded text-left ${focus}`}
      >
        <span className={`block leading-snug ${guess ? "text-[var(--fg-muted)] italic" : ""}`}>
          {sentence.text}
        </span>
        <span className="mt-1 flex items-baseline justify-between gap-3 text-xs text-[var(--fg-muted)]">
          <span>{sourceLine(sentence)}</span>
          <span aria-hidden className="shrink-0 text-[var(--accent)]">
            {open ? "Hide" : "Show"}
          </span>
        </span>
      </button>

      <div id={panelId} hidden={!open} className="mt-2 flex flex-col gap-2 text-sm">
        {sentence.rests.map((support) => (
          <PassageQuote key={support.passageId} passageId={support.passageId} phrase={support.phrase} />
        ))}
        {sentence.how && <p className="leading-relaxed">{sentence.how}</p>}
        {sentence.why && <p className="leading-relaxed">{sentence.why}</p>}
        {sentence.conflict && (
          <>
            <p className="leading-relaxed">
              Another document says {sentence.conflict.other}. I used {sentence.conflict.used},
              from the one edited more recently.
            </p>
            <PassageQuote passageId={sentence.conflict.passageId} phrase={sentence.conflict.other} />
          </>
        )}
      </div>
    </li>
  );
}

function PassageQuote({ passageId, phrase }: { passageId: string; phrase: string }) {
  const passage = getPassage(passageId);
  const doc = getDoc(passage.docId);
  const [before, marked, after] = splitAround(passage.text, phrase);

  return (
    <figure className="rounded-xl bg-[var(--bg)] p-3">
      <blockquote className="leading-relaxed text-[var(--fg-muted)]">
        {before}
        {marked && (
          <mark className="bg-transparent font-medium text-[var(--fg)] underline decoration-[var(--accent)] decoration-2 underline-offset-2">
            {marked}
          </mark>
        )}
        {after}
      </blockquote>
      <figcaption className="mt-2 text-xs text-[var(--fg-muted)]">
        {passageRef(passageId)} · edited {doc.editedMonthsAgo}{" "}
        {doc.editedMonthsAgo === 1 ? "month" : "months"} ago
      </figcaption>
    </figure>
  );
}

function NotFound({ gap, whole }: { gap: Gap; whole: boolean }) {
  return (
    <div
      data-testid="not-found"
      className={`rounded-xl border border-dashed border-[var(--fg-muted)] p-3 text-sm leading-relaxed ${
        whole ? "mt-3" : "mt-4"
      }`}
    >
      <h3 className="font-medium">I couldn&apos;t find this</h3>
      <p className="mt-1">{gap.what}</p>
      <p className="mt-2 text-[var(--fg-muted)]">
        Where I looked: {gap.lookedIn.map((id) => getDoc(id).title).join(", ")}.
      </p>
      {gap.closest && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-[var(--fg-muted)]">The closest passage:</p>
          <PassageQuote passageId={gap.closest.passageId} phrase="" />
          <p>{gap.closest.whyNot}</p>
        </div>
      )}
    </div>
  );
}
