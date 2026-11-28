/**
 * Draft review: the script and the pure rules behind the screen.
 * Everything here is made up. No model is called and nothing is sent.
 */

export interface Option {
  id: string;
  /** What the choice is, in a few words. Shown when the person changes a decision. */
  label: string;
  /** The words this choice puts in the draft. Empty when the choice leaves words out. */
  text: string;
  /** Shown in place of the words when the choice leaves the draft empty there. */
  placeholder?: string;
}

export interface Decision {
  id: string;
  title: string;
  /** What the assistant decided for the person, in one sentence. */
  summary: string;
  /** The option the assistant wrote into the draft. */
  drafted: string;
  options: Option[];
  /** Answer to "why?": what the choice rests on. */
  why: string;
  /** Present when the assistant is not sure about its own choice. */
  doubt?: string;
}

export type Status = "open" | "accepted" | "changed";

export interface Entry {
  choice: string;
  status: Status;
}

export type Review = Record<string, Entry>;

/** A piece of the draft: fixed words, or the words a decision put there. */
export type Part = string | { decision: string };

export const INCOMING = {
  from: "Tomas",
  lines: [
    "Hi Mira, a few things.",
    "Could the report come on Friday the 14th instead of the 21st? We present to the board on the 17th.",
    "What would a second workshop for the other team cost?",
    "Can Lena join the weekly call?",
    "And could we get the interview recordings?",
    "Thanks, Tomas",
  ],
} as const;

export const DECISIONS: Decision[] = [
  {
    id: "copy",
    title: "Who is in copy",
    summary: "I put Jonas in copy.",
    drafted: "jonas",
    options: [
      { id: "jonas", label: "Jonas in copy", text: "Jonas" },
      { id: "nobody", label: "Nobody in copy", text: "", placeholder: "nobody" },
    ],
    why: "Jonas is in copy on every thread with Tomas that mentions a price.",
  },
  {
    id: "date",
    title: "The date",
    summary: "I offered Wednesday the 19th, not the 14th he asked for.",
    drafted: "wed-19",
    options: [
      {
        id: "wed-19",
        label: "Offer Wednesday 19 March",
        text: "Friday the 14th is too early for us, but I can send the report on Wednesday 19 March, two days ahead of the plan.",
      },
      {
        id: "fri-14",
        label: "Agree to Friday 14 March",
        text: "Yes, you will have the report on Friday 14 March.",
      },
      {
        id: "fri-21",
        label: "Keep Friday 21 March",
        text: "We need to keep Friday 21 March for the report. An earlier date would mean sending it before our own review.",
      },
    ],
    why: "Your calendar has the internal review of the report on Tuesday 18 March. The 14th is before it. The 19th is the first day after it.",
    doubt: "The review on the 18th is marked tentative. If it moves, the 19th is wrong.",
  },
  {
    id: "price",
    title: "The price",
    summary: "I gave the second workshop the same price as the first.",
    drafted: "same",
    options: [
      {
        id: "same",
        label: "Same price, €2,400",
        text: "A second workshop for the other team costs the same as the first, €2,400.",
      },
      {
        id: "separate",
        label: "Send the price separately",
        text: "I will send you a price for a second workshop in a separate message.",
      },
      {
        id: "less",
        label: "10% less, €2,160",
        text: "A second workshop for the other team is €2,160, 10% less than the first, since the preparation is already done.",
      },
    ],
    why: "The offer from January lists one workshop at €2,400. I used that price for the second one.",
    doubt: "No document gives a price for a second workshop. The same price is my assumption.",
  },
  {
    id: "lena",
    title: "Lena on the call",
    summary: "I said yes to Lena joining the weekly call.",
    drafted: "yes",
    options: [
      {
        id: "yes",
        label: "Say yes",
        text: "Lena is welcome on the weekly call. She will get the invitation today.",
      },
      {
        id: "ask",
        label: "Ask what she needs first",
        text: "Happy to bring Lena in. What does she need from the weekly call, so I can point her to the right part?",
      },
    ],
    why: "On the last two projects you added a colleague from the client side to the weekly call when asked.",
  },
  {
    id: "recordings",
    title: "The recordings",
    summary: "I left his question about the interview recordings unanswered.",
    drafted: "skip",
    options: [
      {
        id: "skip",
        label: "Say nothing",
        text: "",
        placeholder: "Nothing here about the interview recordings he asked for.",
      },
      {
        id: "internal",
        label: "Say they stay with us",
        text: "The interview recordings stay with us. Participants agreed to be recorded for analysis only.",
      },
      {
        id: "later",
        label: "Say you will come back on it",
        text: "On the interview recordings: I need to check what participants agreed to, and will come back to you.",
      },
    ],
    why: "The contract does not mention recordings. I did not want to promise or refuse for you, so the draft says nothing.",
    doubt: "He asked directly. A reply that skips the question may read as a no.",
  },
  {
    id: "call",
    title: "A call",
    summary: "I offered a call on Thursday at 10:00.",
    drafted: "thursday",
    options: [
      {
        id: "thursday",
        label: "Offer Thursday 10:00",
        text: "If it helps to talk it through, I am free on Thursday at 10:00.",
      },
      {
        id: "his-time",
        label: "Let him pick a time",
        text: "If it helps to talk it through, tell me a time that suits you this week.",
      },
      {
        id: "none",
        label: "Offer no call",
        text: "",
        placeholder: "No call offered.",
      },
    ],
    why: "Thursday 10:00 is free in your calendar and inside the hours Tomas usually writes in.",
  },
];

/** The decision that fills the Cc line. It has no words in the body. */
export const COPY_DECISION = "copy";

/** The body of the reply, paragraph by paragraph. */
export const BODY: Part[][] = [
  ["Hi Tomas,"],
  ["Thanks for the questions. ", { decision: "date" }],
  [{ decision: "price" }],
  [{ decision: "lena" }],
  [{ decision: "recordings" }],
  [{ decision: "call" }],
  ["Best,\nMira"],
];

export function getDecision(id: string): Decision {
  const decision = DECISIONS.find((entry) => entry.id === id);
  if (!decision) throw new Error(`No decision "${id}"`);
  return decision;
}

export function getOption(decision: Decision, optionId: string): Option {
  const option = decision.options.find((entry) => entry.id === optionId);
  if (!option) throw new Error(`No option "${optionId}" in "${decision.id}"`);
  return option;
}

/** The number a decision carries in the draft and in the list. Starts at 1. */
export function decisionNumber(id: string): number {
  return DECISIONS.findIndex((entry) => entry.id === id) + 1;
}

/** Every decision starts as the assistant wrote it, and not reviewed. */
export function initialReview(): Review {
  return Object.fromEntries(
    DECISIONS.map((decision) => [decision.id, { choice: decision.drafted, status: "open" }]),
  );
}

/** Accept means: keep what the assistant wrote. It also undoes a change. */
export function accept(review: Review, id: string): Review {
  return { ...review, [id]: { choice: getDecision(id).drafted, status: "accepted" } };
}

/** Back to what the assistant wrote, and not reviewed. */
export function reopen(review: Review, id: string): Review {
  return { ...review, [id]: { choice: getDecision(id).drafted, status: "open" } };
}

/** Picking the drafted option is an accept. Picking another one is a change. */
export function choose(review: Review, id: string, optionId: string): Review {
  const decision = getDecision(id);
  getOption(decision, optionId);
  return {
    ...review,
    [id]: { choice: optionId, status: optionId === decision.drafted ? "accepted" : "changed" },
  };
}

/** Accepts every open decision the assistant is sure about. Doubts are never accepted in bulk. */
export function acceptSure(review: Review): Review {
  let next = review;
  for (const decision of DECISIONS) {
    if (!decision.doubt && review[decision.id].status === "open") {
      next = accept(next, decision.id);
    }
  }
  return next;
}

export function currentOption(review: Review, id: string): Option {
  return getOption(getDecision(id), review[id].choice);
}

export interface Counts {
  total: number;
  doubts: number;
  open: number;
  openDoubts: number;
  openSure: number;
  accepted: number;
  changed: number;
}

export function counts(review: Review): Counts {
  const result: Counts = {
    total: DECISIONS.length,
    doubts: 0,
    open: 0,
    openDoubts: 0,
    openSure: 0,
    accepted: 0,
    changed: 0,
  };
  for (const decision of DECISIONS) {
    const { status } = review[decision.id];
    if (decision.doubt) result.doubts += 1;
    if (status === "accepted") result.accepted += 1;
    if (status === "changed") result.changed += 1;
    if (status === "open") {
      result.open += 1;
      if (decision.doubt) result.openDoubts += 1;
      else result.openSure += 1;
    }
  }
  return result;
}

/** The one line above the draft. */
export function headline(review: Review): string {
  const count = counts(review);
  const reviewed = count.total - count.open;
  return `I made ${count.total} decisions for you. I'm not sure about ${count.doubts}. You have looked at ${reviewed} of ${count.total}.`;
}

/** Doubts first, each group in draft order. */
export function orderedDecisions(): Decision[] {
  return [
    ...DECISIONS.filter((decision) => decision.doubt),
    ...DECISIONS.filter((decision) => !decision.doubt),
  ];
}

/** A doubt has to be looked at by a person before the reply can go. */
export function canSend(review: Review): boolean {
  return counts(review).openDoubts === 0;
}

/** Why the reply cannot go yet. Null when it can. */
export function sendBlocker(review: Review): string | null {
  const { openDoubts } = counts(review);
  if (openDoubts === 0) return null;
  return openDoubts === 1
    ? "1 decision I'm not sure about is still open. Look at it before this goes."
    : `${openDoubts} decisions I'm not sure about are still open. Look at them before this goes.`;
}

/** What the person is told before sending about the decisions they did not open. */
export function unreviewedNote(review: Review): string | null {
  const { openSure } = counts(review);
  if (openSure === 0 || !canSend(review)) return null;
  return openSure === 1
    ? "1 decision goes as I wrote it. You have not looked at it."
    : `${openSure} decisions go as I wrote them. You have not looked at them.`;
}

/** Who decided what, said once the reply has gone. */
export function receipt(review: Review): string {
  const count = counts(review);
  const yours = count.accepted + count.changed;
  const parts = [`You decided ${yours} of ${count.total}: ${count.changed} changed, ${count.accepted} kept.`];
  if (count.open > 0) {
    parts.push(
      count.open === 1
        ? "1 went as the assistant wrote it."
        : `${count.open} went as the assistant wrote them.`,
    );
  }
  return parts.join(" ");
}

/** Short label for the state of one decision, in words. */
export function statusLabel(review: Review, id: string): string {
  const { status } = review[id];
  if (status === "accepted") return "Kept by you";
  if (status === "changed") return "Changed by you";
  return getDecision(id).doubt ? "Not looked at · not sure" : "Not looked at";
}

/** The reply as plain text, exactly as it would go. Placeholders are not part of it. */
export function replyText(review: Review): string {
  return BODY.map((paragraph) =>
    paragraph
      .map((part) => (typeof part === "string" ? part : currentOption(review, part.decision).text))
      .join("")
      .trim(),
  )
    .filter((paragraph) => paragraph.length > 0)
    .join("\n\n");
}
