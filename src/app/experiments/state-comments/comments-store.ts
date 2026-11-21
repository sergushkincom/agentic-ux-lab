import { normalizeState, type PrototypeState } from "./url-state";

export type PrototypeComment = {
  id: string;
  text: string;
  state: PrototypeState;
  resolved: boolean;
  createdAt: string;
};

export const COMMENTS_STORAGE_KEY = "agentic-ux-lab/state-comments/comments-v1";

export const SEEDED_COMMENTS: PrototypeComment[] = [
  {
    id: "seed-picker-clip-360",
    text: "The picker clipped while open at 360 px.",
    state: { step: 2, picker: "open", width: 360 },
    resolved: false,
    createdAt: "2026-11-01T09:00:00.000Z",
  },
  {
    id: "seed-confirm-copy",
    text: "On confirm, show the timezone next to the selected slot.",
    state: { step: 3, picker: "closed", width: 768 },
    resolved: false,
    createdAt: "2026-11-01T09:07:00.000Z",
  },
  {
    id: "seed-person-filter",
    text: "Person list feels long at 320 px — maybe add a quick filter.",
    state: { step: 1, picker: "closed", width: 320 },
    resolved: true,
    createdAt: "2026-11-01T09:12:00.000Z",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseComment(input: unknown): PrototypeComment | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = typeof input.id === "string" ? input.id : "";
  const text = typeof input.text === "string" ? input.text.trim() : "";
  const resolved = typeof input.resolved === "boolean" ? input.resolved : false;
  const createdAt = typeof input.createdAt === "string" ? input.createdAt : "";
  const stateInput = isRecord(input.state) ? input.state : {};

  if (!id || !text || !createdAt) {
    return null;
  }

  const state = normalizeState({
    step: typeof stateInput.step === "number" ? stateInput.step : undefined,
    picker: typeof stateInput.picker === "string" ? stateInput.picker : undefined,
    width: typeof stateInput.width === "number" ? stateInput.width : undefined,
  });

  return { id, text, state, resolved, createdAt };
}

export function readStoredComments(storage: Storage): PrototypeComment[] | null {
  const raw = storage.getItem(COMMENTS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }

    const comments = parsed
      .map((item) => parseComment(item))
      .filter((item): item is PrototypeComment => item !== null);

    return comments.length > 0 ? comments : null;
  } catch {
    return null;
  }
}

export function writeStoredComments(storage: Storage, comments: PrototypeComment[]): void {
  storage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
}
