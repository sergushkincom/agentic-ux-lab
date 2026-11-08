export const CHANGE_KINDS = ["softened", "lost", "unsure"] as const;

export type ChangeKind = (typeof CHANGE_KINDS)[number];

export type Segment = {
  id: string;
  kind: ChangeKind;
  original: string;
  rewritten: string;
  note: string;
};

export type Choice =
  | { kind: "script" }
  | { kind: "restored" }
  | { kind: "edited"; text: string };

export const KIND_LABEL: Record<ChangeKind, string> = {
  softened: "Softened",
  lost: "Left out",
  unsure: "Unsure",
};

/** One scripted note. Not a model, not a real message. */
export const SEGMENTS: readonly Segment[] = [
  {
    id: "late",
    kind: "softened",
    original: "The parts will be late.",
    rewritten: "The parts are expected a little later than planned.",
    note: "“Will be late” was softened to “a little later than planned.”",
  },
  {
    id: "cause",
    kind: "lost",
    original: "We missed the cutoff because the warehouse count was wrong.",
    rewritten: "",
    note: "The cause was left out: the missed cutoff, and the wrong warehouse count.",
  },
  {
    id: "friday",
    kind: "unsure",
    original: "If you need them Friday, call me — do not wait.",
    rewritten: "Please contact us if Friday is essential.",
    note: "Unsure. “Call me — do not wait” may have turned into a general “contact us.”",
  },
];

export function choiceFor(
  choices: Readonly<Record<string, Choice>>,
  id: string,
): Choice {
  return choices[id] ?? { kind: "script" };
}

export function isCorrection(choice: Choice): boolean {
  return choice.kind === "restored" || choice.kind === "edited";
}

/** Drop script-owned rows. Restored and edited wording stays as the person left it. */
export function preserveCorrections(
  choices: Readonly<Record<string, Choice>>,
): Record<string, Choice> {
  const kept: Record<string, Choice> = {};
  for (const [id, choice] of Object.entries(choices)) {
    if (choice.kind === "restored") kept[id] = { kind: "restored" };
    if (choice.kind === "edited") kept[id] = { kind: "edited", text: choice.text };
  }
  return kept;
}

export function segmentText(segment: Segment, choice: Choice): string {
  if (choice.kind === "edited") return choice.text;
  if (choice.kind === "restored") return segment.original;
  return segment.rewritten;
}

export function joinNote(parts: readonly string[]): string {
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}

export function originalText(segments: readonly Segment[]): string {
  return joinNote(segments.map((segment) => segment.original));
}

export function outgoingText(
  segments: readonly Segment[],
  choices: Readonly<Record<string, Choice>>,
): string {
  return joinNote(
    segments.map((segment) => segmentText(segment, choiceFor(choices, segment.id))),
  );
}

export function openChanges(
  segments: readonly Segment[],
  choices: Readonly<Record<string, Choice>>,
): Segment[] {
  return segments.filter((segment) => choiceFor(choices, segment.id).kind === "script");
}

/** A simulated send. Nothing is delivered, and the text is the current draft. */
export function simulateSend(text: string): { delivered: false; text: string } {
  return { delivered: false, text };
}
