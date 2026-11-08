"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";
import {
  CHANGE_KINDS,
  KIND_LABEL,
  SEGMENTS,
  choiceFor,
  openChanges,
  originalText,
  outgoingText,
  preserveCorrections,
  segmentText,
  simulateSend,
  type Choice,
  type Segment,
} from "./draft";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function DraftScreen() {
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const baseId = useId();

  const open = SEGMENTS.find((segment) => segment.id === openId) ?? null;
  const openChoice = open ? choiceFor(choices, open.id) : null;
  const stillOpen = openChanges(SEGMENTS, choices);
  const outgoing = outgoingText(SEGMENTS, choices);

  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (editing) {
        setEditing(false);
        return;
      }
      setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, openId]);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing, openId]);

  function select(segment: Segment) {
    setEditing(false);
    setOpenId((current) => (current === segment.id ? null : segment.id));
  }

  function restore(id: string) {
    setChoices((prev) => preserveCorrections({ ...prev, [id]: { kind: "restored" } }));
    setEditing(false);
    setReceipt(null);
  }

  function chooseRewrite(id: string) {
    setChoices((prev) => {
      const next = { ...prev };
      delete next[id];
      return preserveCorrections(next);
    });
    setEditing(false);
    setReceipt(null);
  }

  function startEdit(segment: Segment) {
    setDraft(segmentText(segment, choiceFor(choices, segment.id)));
    setEditing(true);
    setReceipt(null);
  }

  function keepWording(id: string) {
    setChoices((prev) =>
      preserveCorrections({ ...prev, [id]: { kind: "edited", text: draft } }),
    );
    setEditing(false);
    setReceipt(null);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
          You wrote a note to a buyer. An assistant rewrote it. This screen is what they
          would read. Nothing is sent until you say so, and a send here does not leave.
        </p>

        <ChangeSummary segments={stillOpen} />

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-sm font-medium">What they would read</h2>
            <button
              type="button"
              aria-pressed={showOriginal}
              aria-controls={`${baseId}-original`}
              onClick={() => setShowOriginal((value) => !value)}
              className={`text-sm text-[var(--accent)] ${focus}`}
            >
              {showOriginal ? "Hide original" : "Show original"}
            </button>
          </div>

          <p className="mt-4 text-lg leading-relaxed">
            {SEGMENTS.map((segment, index) => (
              <span key={segment.id}>
                {index > 0 ? " " : null}
                <MarkButton
                  segment={segment}
                  choice={choiceFor(choices, segment.id)}
                  expanded={openId === segment.id}
                  controls={`${baseId}-detail`}
                  onSelect={() => select(segment)}
                />
              </span>
            ))}
          </p>

          {showOriginal ? (
            <div id={`${baseId}-original`} className="mt-4 border-t border-[var(--border)] pt-4">
              <h3 className="text-xs font-medium tracking-wide text-[var(--fg-muted)]">
                Original
              </h3>
              <p className="mt-2 leading-relaxed">{originalText(SEGMENTS)}</p>
            </div>
          ) : null}

          {open && openChoice ? (
            <MarkDetail
              id={`${baseId}-detail`}
              segment={open}
              choice={openChoice}
              editing={editing}
              draft={draft}
              editRef={editRef}
              onDraft={setDraft}
              onRestore={() => restore(open.id)}
              onUseRewrite={() => chooseRewrite(open.id)}
              onStartEdit={() => startEdit(open)}
              onKeep={() => keepWording(open.id)}
              onCancelEdit={() => setEditing(false)}
            />
          ) : null}
        </article>

        {receipt === null ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setReceipt(simulateSend(outgoing).text)}
              className={`w-full rounded-full bg-[var(--fg)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] sm:w-auto ${focus}`}
            >
              Send
            </button>
            <p className="text-xs text-[var(--fg-muted)]">
              Send stops on this screen. No message is delivered.
            </p>
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
          >
            <h2 className="text-sm font-medium">Not sent</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
              This is a scripted prototype. Nothing left the screen. The words below are
              the ones that would have gone, including anything you restored or corrected.
            </p>
            <blockquote className="mt-3 border-l-2 border-[var(--border)] pl-3 leading-relaxed">
              {receipt}
            </blockquote>
            <button
              type="button"
              onClick={() => setReceipt(null)}
              className={`mt-4 text-sm text-[var(--accent)] ${focus}`}
            >
              Back to the draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ChangeSummary({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) {
    return (
      <p className="text-sm text-[var(--fg-muted)]" aria-live="polite">
        No open changes. What they would read is your wording.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-live="polite">
      {CHANGE_KINDS.map((kind) => {
        const count = segments.filter((segment) => segment.kind === kind).length;
        if (count === 0) return null;
        return (
          <li key={kind} className="text-[var(--fg-muted)]">
            <span className="font-medium text-[var(--fg)]">{count}</span> {KIND_LABEL[kind]}
          </li>
        );
      })}
    </ul>
  );
}

function MarkButton({
  segment,
  choice,
  expanded,
  controls,
  onSelect,
}: {
  segment: Segment;
  choice: Choice;
  expanded: boolean;
  controls: string;
  onSelect: () => void;
}) {
  const script = choice.kind === "script";
  const label = KIND_LABEL[segment.kind];
  const shown = segmentText(segment, choice);
  const className = [
    "inline rounded-md px-0.5 text-left",
    focus,
    script && segment.kind === "softened" ? "underline decoration-dotted underline-offset-4" : "",
    script && segment.kind === "unsure" ? "underline decoration-[var(--accent)] underline-offset-4" : "",
    script && segment.kind === "lost"
      ? "border border-dashed border-[var(--fg-muted)] px-1.5 py-0.5 text-sm text-[var(--fg-muted)]"
      : "",
    !script ? "bg-[var(--bg)]" : "",
    expanded ? "ring-2 ring-[var(--accent)]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onSelect}
      className={className}
    >
      <span className="sr-only">
        {script ? `${label}. ` : choice.kind === "restored" ? "Restored. " : "Your wording. "}
      </span>
      {script && segment.kind === "lost" ? "Left out" : shown}
      {script && segment.kind === "lost" ? (
        <span className="sr-only">: {segment.original}</span>
      ) : null}
    </button>
  );
}

function MarkDetail({
  id,
  segment,
  choice,
  editing,
  draft,
  editRef,
  onDraft,
  onRestore,
  onUseRewrite,
  onStartEdit,
  onKeep,
  onCancelEdit,
}: {
  id: string;
  segment: Segment;
  choice: Choice;
  editing: boolean;
  draft: string;
  editRef: RefObject<HTMLTextAreaElement | null>;
  onDraft: (value: string) => void;
  onRestore: () => void;
  onUseRewrite: () => void;
  onStartEdit: () => void;
  onKeep: () => void;
  onCancelEdit: () => void;
}) {
  const fieldId = `${id}-wording`;
  const owned = choice.kind !== "script";

  return (
    <div id={id} className="mt-4 border-t border-[var(--border)] pt-4" role="region" aria-label={KIND_LABEL[segment.kind]}>
      <p className="text-xs font-medium tracking-wide text-[var(--fg-muted)]">
        {owned ? (choice.kind === "restored" ? "Restored" : "Your wording") : KIND_LABEL[segment.kind]}
      </p>
      <p className="mt-2 text-sm leading-relaxed">{segment.note}</p>
      <p className="mt-3 text-sm leading-relaxed">
        <span className="text-[var(--fg-muted)]">Original. </span>
        {segment.original}
      </p>
      {segment.rewritten ? (
        <p className="mt-1 text-sm leading-relaxed">
          <span className="text-[var(--fg-muted)]">Rewrite. </span>
          {segment.rewritten}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRestore}
          className={`rounded-full border border-[var(--border)] px-3 py-1.5 text-sm ${focus}`}
        >
          Restore original
        </button>
        <button
          type="button"
          onClick={onStartEdit}
          className={`rounded-full border border-[var(--border)] px-3 py-1.5 text-sm ${focus}`}
        >
          Correct
        </button>
        {owned ? (
          <button
            type="button"
            onClick={onUseRewrite}
            className={`rounded-full border border-[var(--border)] px-3 py-1.5 text-sm ${focus}`}
          >
            Use the rewrite
          </button>
        ) : null}
      </div>

      {editing ? (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            onKeep();
          }}
        >
          <label htmlFor={fieldId} className="text-sm font-medium">
            Your wording
          </label>
          <textarea
            ref={editRef}
            id={fieldId}
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            rows={3}
            className={`mt-2 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm leading-relaxed ${focus}`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className={`rounded-full bg-[var(--fg)] px-3 py-1.5 text-sm text-[var(--bg)] ${focus}`}
            >
              Keep this wording
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className={`rounded-full border border-[var(--border)] px-3 py-1.5 text-sm ${focus}`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
