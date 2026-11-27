"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  SEEDED_COMMENTS,
  readStoredComments,
  writeStoredComments,
  type PrototypeComment,
} from "./comments-store";
import styles from "./comments-motion.module.css";
import {
  DEFAULT_STATE,
  FRAME_WIDTH_VALUES,
  STEP_VALUES,
  formatStateChip,
  normalizeState,
  parseStateFromSearch,
  serializeStateToSearch,
  type PrototypeFrameWidth,
  type PrototypeState,
  type PrototypeStep,
} from "./url-state";

const PEOPLE = ["Ava Patel", "Maya Chen", "Noah Rivera"];
const TIME_SLOTS = ["09:30", "10:30", "11:00", "14:30", "16:00"];

function createCommentId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StateCommentsScreen() {
  const reducedMotion = useReducedMotion();
  const [prototypeState, setPrototypeState] = useState<PrototypeState>(DEFAULT_STATE);
  const [comments, setComments] = useState<PrototypeComment[]>(SEEDED_COMMENTS);
  const [draftComment, setDraftComment] = useState("");
  const [hideResolved, setHideResolved] = useState(false);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState(PEOPLE[0]);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);
  const [urlStateReady, setUrlStateReady] = useState(false);
  const [commentsStoreReady, setCommentsStoreReady] = useState(false);

  useEffect(() => {
    const restored = parseStateFromSearch(window.location.search);
    setPrototypeState(restored);
    setUrlStateReady(true);
  }, []);

  useEffect(() => {
    if (!urlStateReady) {
      return;
    }

    const nextSearch = `?${serializeStateToSearch(prototypeState)}`;
    if (window.location.search !== nextSearch) {
      window.history.replaceState({}, "", `${window.location.pathname}${nextSearch}`);
    }
  }, [prototypeState, urlStateReady]);

  useEffect(() => {
    const stored = readStoredComments(window.localStorage);
    if (stored) {
      setComments(stored);
    }
    setCommentsStoreReady(true);
  }, []);

  useEffect(() => {
    if (!commentsStoreReady) {
      return;
    }
    writeStoredComments(window.localStorage, comments);
  }, [comments, commentsStoreReady]);

  useEffect(() => {
    if (prototypeState.picker !== "open") {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      setPrototypeState((prev) => ({ ...prev, picker: "closed" }));
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [prototypeState.picker]);

  useEffect(() => {
    if (!copyFeedbackId) {
      return;
    }
    const timeout = window.setTimeout(() => setCopyFeedbackId(null), 1_500);
    return () => window.clearTimeout(timeout);
  }, [copyFeedbackId]);

  useEffect(() => {
    if (!freshId) {
      return;
    }
    const timeout = window.setTimeout(() => setFreshId(null), 2_500);
    return () => window.clearTimeout(timeout);
  }, [freshId]);

  const visibleComments = useMemo(
    () => (hideResolved ? comments.filter((comment) => !comment.resolved) : comments),
    [comments, hideResolved],
  );

  const frameTransition = reducedMotion ? "" : "transition-[width] duration-300 ease-out";

  const setStep = (step: PrototypeStep) => {
    setPrototypeState((prev) => ({
      ...prev,
      step,
      picker: step === 2 ? prev.picker : "closed",
    }));
  };

  const setWidth = (width: PrototypeFrameWidth) => {
    setPrototypeState((prev) => ({ ...prev, width }));
  };

  const setPicker = (picker: PrototypeState["picker"]) => {
    setPrototypeState((prev) => ({ ...prev, picker }));
  };

  const handleAddComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draftComment.trim();
    if (!text) {
      return;
    }

    const snapshot = normalizeState(prototypeState);
    const nextComment: PrototypeComment = {
      id: createCommentId(),
      text,
      state: snapshot,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    setFreshId(nextComment.id);
    setComments((prev) => [nextComment, ...prev]);
    setDraftComment("");
  };

  const toggleResolved = (id: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id ? { ...comment, resolved: !comment.resolved } : comment,
      ),
    );
  };

  const restoreCommentState = (state: PrototypeState) => {
    setPrototypeState(normalizeState(state));
  };

  const copyCommentLink = async (state: PrototypeState, commentId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?${serializeStateToSearch(state)}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopyFeedbackId(commentId);
        return;
      }
    } catch {
      // Fall back to a temporary textarea when clipboard API is unavailable or denied.
    }

    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    setCopyFeedbackId(commentId);
  };

  return (
    <div className="h-full overflow-auto bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 p-4 lg:flex-row lg:items-start">
        <section className="min-w-0 flex-1 space-y-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
              State controls
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs text-[var(--fg-muted)]">Step</p>
                <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-1">
                  {STEP_VALUES.map((step) => (
                    <button
                      key={step}
                      type="button"
                      className={`rounded-md px-3 py-1.5 text-sm ${
                        prototypeState.step === step
                          ? "bg-[var(--surface)] font-medium text-[var(--fg)] shadow-sm"
                          : "text-[var(--fg-muted)]"
                      }`}
                      onClick={() => setStep(step)}
                      aria-pressed={prototypeState.step === step}
                    >
                      Step {step}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs text-[var(--fg-muted)]">Frame width</p>
                <div className="inline-flex flex-wrap rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-1">
                  {FRAME_WIDTH_VALUES.map((width) => (
                    <button
                      key={width}
                      type="button"
                      className={`rounded-md px-3 py-1.5 text-sm ${
                        prototypeState.width === width
                          ? "bg-[var(--surface)] font-medium text-[var(--fg)] shadow-sm"
                          : "text-[var(--fg-muted)]"
                      }`}
                      onClick={() => setWidth(width)}
                      aria-pressed={prototypeState.width === width}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--fg-muted)]">
              Prototype frame
            </p>
            <div className="overflow-x-auto pb-1">
              <div
                className={`mx-auto w-fit rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] ${frameTransition}`}
                style={{ width: prototypeState.width }}
              >
                <div className="overflow-hidden rounded-[20px]">
                  <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">Book a meeting</p>
                    <p className="mt-1 text-sm font-medium">Step {prototypeState.step} of 3</p>
                  </div>
                  <div className="bg-[var(--surface)] p-4">
                    {prototypeState.step === 1 ? (
                      <StepOne selectedPerson={selectedPerson} onSelect={setSelectedPerson} />
                    ) : null}
                    {prototypeState.step === 2 ? (
                      <StepTwo
                        selectedTime={selectedTime}
                        onSelectTime={setSelectedTime}
                        picker={prototypeState.picker}
                        width={prototypeState.width}
                        onSetPicker={setPicker}
                        reducedMotion={reducedMotion}
                      />
                    ) : null}
                    {prototypeState.step === 3 ? (
                      <StepThree person={selectedPerson} time={selectedTime} />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--fg-muted)]">
              URL state: <code>?{serializeStateToSearch(prototypeState)}</code>
            </p>
          </div>
        </section>

        <aside className="w-full shrink-0 lg:max-w-md">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Comments</h2>
              <label className="inline-flex items-center gap-2 text-xs text-[var(--fg-muted)]">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-[var(--accent)]"
                  checked={hideResolved}
                  onChange={(event) => setHideResolved(event.target.checked)}
                />
                Hide resolved
              </label>
            </div>

            <form className="mt-3 space-y-2" onSubmit={handleAddComment}>
              <label htmlFor="new-comment" className="text-xs text-[var(--fg-muted)]">
                Add comment (captures current step, picker, and width)
              </label>
              <textarea
                id="new-comment"
                value={draftComment}
                onChange={(event) => setDraftComment(event.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--fg)]"
                placeholder="Describe what feels off in this exact state…"
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                disabled={!draftComment.trim()}
              >
                Add comment
              </button>
            </form>

            <ul className="mt-4">
              {visibleComments.length === 0 ? (
                <EmptyFilter
                  filtered={hideResolved}
                  onShowResolved={() => setHideResolved(false)}
                />
              ) : null}

              {visibleComments.map((comment, index) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  arriving={comment.id === freshId}
                  reducedMotion={reducedMotion}
                  spaced={index < visibleComments.length - 1}
                  copied={copyFeedbackId === comment.id}
                  onRestore={restoreCommentState}
                  onToggleResolved={toggleResolved}
                  onCopyLink={copyCommentLink}
                />
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <p className="sr-only" aria-live="polite">
        {copyFeedbackId ? "State link copied to clipboard." : ""}
      </p>
    </div>
  );
}

function useArriveOpen(arriving: boolean, reduced: boolean): boolean {
  const [open, setOpen] = useState(!arriving || reduced);

  useEffect(() => {
    if (!arriving || reduced) {
      setOpen(true);
      return;
    }

    setOpen(false);
    let followUp = 0;
    const first = window.requestAnimationFrame(() => {
      followUp = window.requestAnimationFrame(() => setOpen(true));
    });

    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(followUp);
    };
  }, [arriving, reduced]);

  return open;
}

function EmptyFilter({
  filtered,
  onShowResolved,
}: {
  filtered: boolean;
  onShowResolved: () => void;
}) {
  return (
    <li
      role="status"
      className="rounded-lg border border-dashed border-[var(--border)] px-4 py-6 text-center"
    >
      <EmptyCommentsIcon />
      <p className="mt-2 text-sm text-[var(--fg-muted)]">
        {filtered ? "No open comments." : "No comments yet."}
      </p>
      {filtered ? (
        <button
          type="button"
          className="mt-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-medium text-[var(--fg)]"
          onClick={onShowResolved}
        >
          Show resolved
        </button>
      ) : null}
    </li>
  );
}

function EmptyCommentsIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden="true"
      className="mx-auto text-[var(--fg-muted)]"
      fill="none"
    >
      <rect
        x="5.5"
        y="6.5"
        width="21"
        height="14"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 26.5 14.8 20.5H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CommentItem({
  comment,
  arriving,
  reducedMotion,
  spaced,
  copied,
  onRestore,
  onToggleResolved,
  onCopyLink,
}: {
  comment: PrototypeComment;
  arriving: boolean;
  reducedMotion: boolean;
  spaced: boolean;
  copied: boolean;
  onRestore: (state: PrototypeState) => void;
  onToggleResolved: (id: string) => void;
  onCopyLink: (state: PrototypeState, commentId: string) => void;
}) {
  const open = useArriveOpen(arriving, reducedMotion);
  const highlight = arriving && !reducedMotion;

  return (
    <li
      data-comment-id={comment.id}
      data-open={open ? "true" : "false"}
      className={arriving ? `${styles.row} ${styles.live}` : styles.row}
    >
      <div className={styles.clip}>
        <div className={spaced ? "pb-2" : undefined}>
          <div
            data-highlight={highlight ? "on" : "off"}
            className={`rounded-lg border border-[var(--border)] p-2 ${
              comment.resolved
                ? "bg-[var(--surface-strong)] text-[var(--fg-muted)]"
                : "bg-[var(--surface)]"
            } ${highlight ? styles.wash : ""}`}
          >
            <button
              type="button"
              className="w-full rounded-md px-2 py-1 text-left"
              onClick={() => onRestore(comment.state)}
            >
              <p className="text-sm">{comment.text}</p>
              <p className="mt-1 text-xs">
                <span className="rounded-md bg-[var(--surface-strong)] px-2 py-0.5">
                  {formatStateChip(comment.state)}
                </span>
              </p>
            </button>
            <div className="mt-2 flex flex-wrap gap-2 px-2 pb-1">
              <button
                type="button"
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
                onClick={() => onToggleResolved(comment.id)}
              >
                {comment.resolved ? "Mark unresolved" : "Mark resolved"}
              </button>
              <button
                type="button"
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
                onClick={() => onCopyLink(comment.state, comment.id)}
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function StepOne({
  selectedPerson,
  onSelect,
}: {
  selectedPerson: string;
  onSelect: (person: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--fg-muted)]">Choose who this meeting is with.</p>
      <ul className="space-y-2">
        {PEOPLE.map((person) => (
          <li key={person}>
            <button
              type="button"
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                selectedPerson === person
                  ? "border-[var(--accent)] bg-[var(--surface-strong)]"
                  : "border-[var(--border)] bg-[var(--surface)]"
              }`}
              onClick={() => onSelect(person)}
            >
              {person}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepTwo({
  selectedTime,
  onSelectTime,
  picker,
  width,
  onSetPicker,
  reducedMotion,
}: {
  selectedTime: string;
  onSelectTime: (slot: string) => void;
  picker: PrototypeState["picker"];
  width: PrototypeFrameWidth;
  onSetPicker: (picker: PrototypeState["picker"]) => void;
  reducedMotion: boolean;
}) {
  const popoverTransition = reducedMotion ? "" : "transition-[opacity,transform] duration-180 ease-out";

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--fg-muted)]">Pick a time slot.</p>
      <div className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--fg-muted)]">Selected slot</p>
            <p className="text-sm font-medium">{selectedTime}</p>
          </div>
          <div className="relative">
            <button
              type="button"
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm"
              onClick={() => onSetPicker(picker === "open" ? "closed" : "open")}
              aria-expanded={picker === "open"}
              aria-haspopup="listbox"
            >
              {picker === "open" ? "Close picker" : "Open picker"}
            </button>
            {picker === "open" ? (
              <div
                className={`absolute top-[calc(100%+0.5rem)] z-10 w-52 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg ${popoverTransition}`}
                style={{ right: width === 360 ? -56 : 0 }}
              >
                <ul className="space-y-1" role="listbox" aria-label="Time slots">
                  {TIME_SLOTS.map((slot) => (
                    <li key={slot}>
                      <button
                        type="button"
                        className={`w-full rounded-md px-2 py-1 text-left text-sm ${
                          slot === selectedTime ? "bg-[var(--surface-strong)] font-medium" : ""
                        }`}
                        onClick={() => {
                          onSelectTime(slot);
                          onSetPicker("closed");
                        }}
                      >
                        {slot}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <p className="text-xs text-[var(--fg-muted)]">
        At 360 px with the picker open, this intentionally clips to reproduce the referenced bug.
      </p>
    </div>
  );
}

function StepThree({ person, time }: { person: string; time: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--fg-muted)]">Review before confirm.</p>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3 text-sm">
        <p>
          <span className="text-[var(--fg-muted)]">With:</span> {person}
        </p>
        <p className="mt-1">
          <span className="text-[var(--fg-muted)]">Time:</span> {time}
        </p>
      </div>
      <button
        type="button"
        className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
      >
        Confirm meeting
      </button>
    </div>
  );
}
