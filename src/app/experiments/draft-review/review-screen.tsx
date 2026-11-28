"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BODY,
  COPY_DECISION,
  INCOMING,
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
  sendBlocker,
  statusLabel,
  unreviewedNote,
  type Decision,
  type Review,
} from "./review";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const card = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5";
const quiet = `rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm ${focus}`;

type Mark = "doubt" | "open" | "kept" | "changed";

function markOf(review: Review, id: string): Mark {
  const { status } = review[id];
  if (status === "accepted") return "kept";
  if (status === "changed") return "changed";
  return getDecision(id).doubt ? "doubt" : "open";
}

/** The mark is a line under the words. The words for it are in the key and on every decision. */
const UNDERLINE: Record<Mark, string> = {
  doubt: "underline decoration-dotted decoration-2 decoration-[var(--fg)] underline-offset-4",
  open: "underline decoration-dashed decoration-1 decoration-[var(--fg-muted)] underline-offset-4",
  kept: "",
  changed: "underline decoration-solid decoration-2 decoration-[var(--accent)] underline-offset-4",
};

const KEY: { mark: Mark; label: string }[] = [
  { mark: "doubt", label: "I'm not sure" },
  { mark: "open", label: "Not looked at" },
  { mark: "changed", label: "Changed by you" },
];

export function ReviewScreen() {
  const [review, setReview] = useState<Review>(initialReview);
  const [sent, setSent] = useState(false);
  const [jumpTo, setJumpTo] = useState<string | null>(null);
  const headings = useRef(new Map<string, HTMLHeadingElement>());

  const count = counts(review);
  const blocker = sendBlocker(review);
  const note = unreviewedNote(review);

  // A marked part of the draft points at its decision: move focus there.
  useEffect(() => {
    if (!jumpTo) return;
    const heading = headings.current.get(jumpTo);
    if (heading) {
      heading.focus();
      heading.scrollIntoView({ block: "center" });
    }
    setJumpTo(null);
  }, [jumpTo]);

  function update(next: Review) {
    setReview(next);
    setSent(false);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
          An assistant drafted a reply for you. You review the decisions it made, not the
          paragraphs. The people and the message are made up, the behaviour is scripted, no
          model is called and nothing is sent.
        </p>

        <section aria-labelledby="incoming-heading" className="flex flex-col gap-2">
          <h2 id="incoming-heading" className="text-sm font-medium">
            {INCOMING.from} wrote
          </h2>
          <blockquote className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm leading-relaxed text-[var(--fg-muted)]">
            {INCOMING.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </blockquote>
        </section>

        <section aria-labelledby="draft-heading" className={card}>
          <h2 id="draft-heading" className="text-sm font-medium">
            Draft reply
          </h2>
          <p data-testid="headline" className="mt-2 text-base leading-snug font-medium">
            {headline(review)}
          </p>

          <ul
            aria-label="How to read the marks"
            className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--fg-muted)]"
          >
            {KEY.map((entry) => (
              <li key={entry.mark}>
                <span className={UNDERLINE[entry.mark]}>{entry.label}</span>
              </li>
            ))}
            <li>No line: kept by you, or not a decision</li>
          </ul>

          <div
            data-testid="draft"
            className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 leading-relaxed"
          >
            <p className="text-sm text-[var(--fg-muted)]">
              To: Tomas · Cc:{" "}
              <DraftPart review={review} id={COPY_DECISION} onOpen={setJumpTo} />
            </p>
            {BODY.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph.map((part, partIndex) =>
                  typeof part === "string" ? (
                    <span key={partIndex}>{part}</span>
                  ) : (
                    <DraftPart key={partIndex} review={review} id={part.decision} onOpen={setJumpTo} />
                  ),
                )}
              </p>
            ))}
          </div>
        </section>

        <section aria-labelledby="decisions-heading" className="flex flex-col gap-3">
          <div>
            <h2 id="decisions-heading" className="text-sm font-medium">
              Decisions I made for you
            </h2>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              The ones I&apos;m not sure about come first.
            </p>
          </div>

          <ol className="flex flex-col gap-3">
            {orderedDecisions().map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                review={review}
                onReview={update}
                headingRef={(node) => {
                  if (node) headings.current.set(decision.id, node);
                  else headings.current.delete(decision.id);
                }}
              />
            ))}
          </ol>

          {count.openSure > 0 && (
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => update(acceptSure(review))}
                className={`${quiet} self-start bg-[var(--surface)]`}
              >
                Keep the {count.openSure} I&apos;m sure about
              </button>
              <p className="text-xs text-[var(--fg-muted)]">
                This does not touch the ones I&apos;m not sure about.
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="send-heading" className={card}>
          <h2 id="send-heading" className="text-sm font-medium">
            Send
          </h2>
          <p data-testid="send-note" className="mt-2 text-sm leading-relaxed">
            {blocker ?? note ?? "You have looked at every decision."}
          </p>
          <button
            type="button"
            disabled={!canSend(review) || sent}
            onClick={() => setSent(true)}
            className={`mt-3 rounded-lg bg-[var(--fg)] px-4 py-2 text-sm font-medium text-[var(--bg)] disabled:opacity-40 ${focus}`}
          >
            Send as mine (simulated)
          </button>
          <p role="status" data-testid="receipt" className="mt-3 text-sm leading-relaxed">
            {sent && <>Sent in this demo only. Nothing left the page. {receipt(review)}</>}
          </p>
        </section>
      </div>
    </div>
  );
}

function DraftPart({
  review,
  id,
  onOpen,
}: {
  review: Review;
  id: string;
  onOpen: (id: string) => void;
}) {
  const decision = getDecision(id);
  const option = currentOption(review, id);
  const mark = markOf(review, id);
  const number = decisionNumber(id);
  const empty = option.text === "";

  return (
    <button
      type="button"
      data-part={id}
      data-mark={mark}
      onClick={() => onOpen(id)}
      className={`inline rounded text-left ${focus}`}
    >
      <span
        className={`${UNDERLINE[mark]} ${empty ? "text-sm text-[var(--fg-muted)] italic" : ""}`}
      >
        {empty ? option.placeholder : option.text}
      </span>
      <sup aria-hidden className="ml-0.5 font-mono text-[0.65rem] text-[var(--accent)]">
        {number}
      </sup>
      <span className="sr-only">
        {" "}
        Decision {number}, {decision.title}: {statusLabel(review, id)}.
        {empty ? " These words are not part of the reply." : ""}
      </span>
    </button>
  );
}

function DecisionCard({
  decision,
  review,
  onReview,
  headingRef,
}: {
  decision: Decision;
  review: Review;
  onReview: (next: Review) => void;
  headingRef: (node: HTMLHeadingElement | null) => void;
}) {
  const [changing, setChanging] = useState(false);
  const [asking, setAsking] = useState(false);
  const changeId = useId();
  const whyId = useId();
  const { choice, status } = review[decision.id];
  const option = currentOption(review, decision.id);
  const mark = markOf(review, decision.id);

  return (
    <li
      data-decision={decision.id}
      data-status={status}
      data-doubt={decision.doubt ? "yes" : "no"}
      className={`${card} ${mark === "doubt" ? "border-dotted border-[var(--fg)]" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 ref={headingRef} tabIndex={-1} className={`rounded font-medium ${focus}`}>
          <span className="font-mono text-xs text-[var(--accent)]">{decisionNumber(decision.id)}</span>{" "}
          {decision.title}
        </h3>
        <span data-testid="status" className="shrink-0 text-xs text-[var(--fg-muted)]">
          {statusLabel(review, decision.id)}
        </span>
      </div>

      <p className="mt-1 text-sm leading-relaxed">{decision.summary}</p>
      {decision.doubt && (
        <p className="mt-1 text-sm leading-relaxed">
          <span className="font-medium">I&apos;m not sure: </span>
          {decision.doubt}
        </p>
      )}

      <p className="mt-2 rounded-xl bg-[var(--bg)] p-3 text-sm leading-relaxed text-[var(--fg-muted)]">
        <span className="block text-xs">
          {status === "changed" ? `Your change: ${option.label}` : "In the draft now"}
        </span>
        {option.text === "" ? <em>{option.placeholder}</em> : <>“{option.text}”</>}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={status === "accepted"}
          onClick={() =>
            onReview(status === "accepted" ? reopen(review, decision.id) : accept(review, decision.id))
          }
          className={`${quiet} ${
            status === "accepted" ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : ""
          }`}
        >
          {status === "changed" ? "Back to the draft" : "Keep"}
        </button>
        <button
          type="button"
          aria-expanded={changing}
          aria-controls={changeId}
          onClick={() => setChanging(!changing)}
          className={quiet}
        >
          Change
        </button>
        <button
          type="button"
          aria-expanded={asking}
          aria-controls={whyId}
          onClick={() => setAsking(!asking)}
          className={quiet}
        >
          Why?
        </button>
      </div>

      <div id={whyId} hidden={!asking} className="mt-3 text-sm leading-relaxed">
        {decision.why}
      </div>

      <fieldset id={changeId} hidden={!changing} className="mt-3 flex flex-col gap-2 text-sm">
        <legend className="mb-2 text-xs text-[var(--fg-muted)]">
          Pick what the reply should say. The draft changes at once.
        </legend>
        {decision.options.map((entry) => (
          <label key={entry.id} className="flex gap-3">
            <input
              type="radio"
              name={`${decision.id}-option`}
              className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
              checked={status !== "open" && choice === entry.id}
              onChange={() => onReview(choose(review, decision.id, entry.id))}
            />
            <span>
              {entry.label}
              {entry.id === decision.drafted && (
                <span className="text-[var(--fg-muted)]"> · as drafted</span>
              )}
            </span>
          </label>
        ))}
      </fieldset>
    </li>
  );
}
