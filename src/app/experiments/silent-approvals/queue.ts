/**
 * Forty flows that stopped and are waiting for one person.
 * Scripted: no model, no real companies, nothing is paid, sent, moved or deleted.
 */

/** Order is display order: what is hardest to take back comes first. */
export const CONSEQUENCE_IDS = ["delete", "pay", "notify", "reschedule"] as const;

export type ConsequenceId = (typeof CONSEQUENCE_IDS)[number];

export type Consequence = {
  id: ConsequenceId;
  /** What approving does, as a class of effect. */
  title: string;
  /** One of these, in a sentence: "{n} {noun} would be …". */
  noun: [singular: string, plural: string];
  wouldBe: string;
  /** Why every flow in the group stopped. */
  sharedReason: string;
  /** What taking it back looks like, in words. */
  takeBack: string;
  /** Whether the prototype offers Undo after an approval. */
  undoable: boolean;
};

export const CONSEQUENCES: Record<ConsequenceId, Consequence> = {
  delete: {
    id: "delete",
    title: "Something is deleted for good",
    noun: ["supplier record", "supplier records"],
    wouldBe: "deleted as a duplicate",
    sharedReason: "A flow may not delete a record without a person.",
    takeBack: "Cannot be undone.",
    undoable: false,
  },
  pay: {
    id: "pay",
    title: "Money leaves the company",
    noun: ["invoice", "invoices"],
    wouldBe: "paid",
    sharedReason: "The amount is over the €2,000 limit for paying without a person.",
    takeBack: "Can be stopped until the bank run at 16:00.",
    undoable: true,
  },
  notify: {
    id: "notify",
    title: "A customer gets a message",
    noun: ["delay notice", "delay notices"],
    wouldBe: "sent to customers",
    sharedReason: "A flow may not write to a customer without a person.",
    takeBack: "Cannot be unsent.",
    undoable: false,
  },
  reschedule: {
    id: "reschedule",
    title: "A date in an order changes",
    noun: ["delivery date", "delivery dates"],
    wouldBe: "moved later",
    sharedReason: "The new date is more than three days after the old one.",
    takeBack: "Can be changed back at any time.",
    undoable: true,
  },
};

export type WaitingItem = {
  id: string;
  consequence: ConsequenceId;
  /** What the flow is about. */
  subject: string;
  /** The one fact a person needs about this item inside its group. */
  detail: string;
  /** Euros, for payments only. */
  amount?: number;
  /** Minutes since the flow stopped. */
  waitingMin: number;
  /** Set when this item is not like the rest of its group. Scripted. */
  unlike?: string;
};

type Row = [subject: string, detail: string, amount?: number, unlike?: string];

const PAY: Row[] = [
  ["Invoice 2207 · Halvorn Metals", "Steel sheet, order 5518", 4310],
  ["Invoice 2211 · Ollund Freight", "Road freight, week 46", 2840],
  ["Invoice 2214 · Meridale Packaging", "Cartons, order 5530", 2190],
  [
    "Invoice 2215 · Quenby Tools",
    "Drill heads, order 5533",
    18600,
    "Six times what this supplier usually bills. The last five invoices were about €3,100 each.",
  ],
  ["Invoice 2219 · Sarnwick Bearings", "Bearings, order 5541", 5275],
  ["Invoice 2220 · Tolmere Plastics", "Granulate, order 5542", 3960],
  ["Invoice 2224 · Halvorn Metals", "Steel sheet, order 5547", 4480],
  [
    "Invoice 2226 · Brisk and Tarn",
    "Fasteners, order 5549",
    6120,
    "The supplier's bank details were changed two days ago.",
  ],
  ["Invoice 2229 · Ollund Freight", "Road freight, week 47", 3015],
  ["Invoice 2231 · Meridale Packaging", "Cartons, order 5556", 2365],
  ["Invoice 2234 · Sarnwick Bearings", "Bearings, order 5560", 4890],
  ["Invoice 2236 · Tolmere Plastics", "Granulate, order 5561", 3720],
  ["Invoice 2240 · Wexholt Coatings", "Primer, order 5566", 2655],
  ["Invoice 2243 · Wexholt Coatings", "Top coat, order 5570", 7430],
];

const NOTIFY: Row[] = [
  ["Order 8102 · Arlby Garden Tools", "Two days late"],
  ["Order 8107 · Penmoor Kitchens", "Three days late"],
  ["Order 8110 · Castelow Bikes", "Two days late"],
  ["Order 8113 · Dunmere Lighting", "Four days late"],
  [
    "Order 8118 · Fennick Doors",
    "Three days late",
    undefined,
    "This customer has an open complaint about the last late delivery.",
  ],
  ["Order 8121 · Glaisby Furniture", "Two days late"],
  ["Order 8125 · Hartwell Pumps", "Five days late"],
  ["Order 8129 · Ivermoor Tiles", "Two days late"],
  ["Order 8133 · Jessel Windows", "Three days late"],
  ["Order 8136 · Kelbrook Heating", "Two days late"],
  ["Order 8140 · Lorwick Stairs", "Four days late"],
];

const RESCHEDULE: Row[] = [
  ["Order 8102 · Arlby Garden Tools", "12 Mar → 16 Mar"],
  ["Order 8107 · Penmoor Kitchens", "12 Mar → 17 Mar"],
  ["Order 8110 · Castelow Bikes", "13 Mar → 17 Mar"],
  ["Order 8113 · Dunmere Lighting", "13 Mar → 19 Mar"],
  ["Order 8121 · Glaisby Furniture", "14 Mar → 18 Mar"],
  ["Order 8125 · Hartwell Pumps", "14 Mar → 21 Mar"],
  ["Order 8129 · Ivermoor Tiles", "17 Mar → 21 Mar"],
  ["Order 8133 · Jessel Windows", "17 Mar → 24 Mar"],
  ["Order 8136 · Kelbrook Heating", "18 Mar → 24 Mar"],
];

const DELETE: Row[] = [
  ["Supplier record · Halvorn Metal", "Same address and tax number as Halvorn Metals"],
  [
    "Supplier record · Ollund Frieght",
    "Same address as Ollund Freight",
    undefined,
    "Three open orders still point to this record.",
  ],
  ["Supplier record · Meridale Pack.", "Same address and tax number as Meridale Packaging"],
  ["Supplier record · Quenby Tools (old)", "Same address and tax number as Quenby Tools"],
  [
    "Supplier record · Sarnwick Bearings North",
    "Same name as Sarnwick Bearings",
    undefined,
    "The tax number differs from the record it would be merged into.",
  ],
  ["Supplier record · Tolmere Plastic", "Same address and tax number as Tolmere Plastics"],
];

const SOURCE: [ConsequenceId, Row[]][] = [
  ["pay", PAY],
  ["notify", NOTIFY],
  ["reschedule", RESCHEDULE],
  ["delete", DELETE],
];

/**
 * Waiting time is spread so that arrival order mixes the four kinds.
 * 37 and 40 share no factor, so every item gets a different slot.
 */
function waitingFor(index: number): number {
  return ((index * 37) % 40) * 71 + 6;
}

export const ITEMS: readonly WaitingItem[] = SOURCE.flatMap(([consequence, rows]) =>
  rows.map(([subject, detail, amount, unlike], row) => ({ consequence, subject, detail, amount, unlike, row })),
).map(({ consequence, subject, detail, amount, unlike, row }, index) => ({
  id: `${consequence}-${row + 1}`,
  consequence,
  subject,
  detail,
  ...(amount === undefined ? {} : { amount }),
  waitingMin: waitingFor(index),
  ...(unlike === undefined ? {} : { unlike }),
}));

export type Status = "waiting" | "approved" | "returned";

export type Receipt = {
  kind: Exclude<Status, "waiting">;
  consequence: ConsequenceId;
  itemIds: string[];
  /** A group decision, or one item decided on its own. */
  scope: "group" | "single";
};

export type QueueState = {
  status: Readonly<Record<string, Status>>;
  /** Items the person took out of a group, on top of the scripted ones. */
  pulled: readonly string[];
  /** Oldest first. */
  receipts: readonly Receipt[];
};

export function initialState(): QueueState {
  return { status: {}, pulled: [], receipts: [] };
}

export function statusOf(state: QueueState, id: string): Status {
  return state.status[id] ?? "waiting";
}

export function isException(state: QueueState, item: WaitingItem): boolean {
  return item.unlike !== undefined || state.pulled.includes(item.id);
}

export type Group = {
  consequence: Consequence;
  /** Every item with this consequence, decided or not. */
  all: WaitingItem[];
  /** Waiting, and like the rest: one decision covers these. */
  together: WaitingItem[];
  /** Waiting, and not like the rest: each needs its own decision. */
  exceptions: WaitingItem[];
  receipts: Receipt[];
};

export function groupsFor(state: QueueState, items: readonly WaitingItem[] = ITEMS): Group[] {
  return CONSEQUENCE_IDS.map((id) => {
    const all = items.filter((item) => item.consequence === id);
    const waiting = all.filter((item) => statusOf(state, item.id) === "waiting");
    return {
      consequence: CONSEQUENCES[id],
      all,
      together: waiting.filter((item) => !isException(state, item)),
      exceptions: waiting.filter((item) => isException(state, item)),
      receipts: state.receipts.filter((receipt) => receipt.consequence === id),
    };
  });
}

/** Longest wait first: the queue as it arrived. */
export function byArrival(items: readonly WaitingItem[] = ITEMS): WaitingItem[] {
  return [...items].sort((a, b) => b.waitingMin - a.waitingMin);
}

export function waitingCount(state: QueueState, items: readonly WaitingItem[] = ITEMS): number {
  return items.filter((item) => statusOf(state, item.id) === "waiting").length;
}

/** How many times the person still has to decide in each view. */
export function decisionsLeft(
  state: QueueState,
  view: "arrival" | "consequence",
  items: readonly WaitingItem[] = ITEMS,
): number {
  if (view === "arrival") return waitingCount(state, items);
  return groupsFor(state, items).reduce(
    (sum, group) => sum + (group.together.length > 0 ? 1 : 0) + group.exceptions.length,
    0,
  );
}

function decide(
  state: QueueState,
  targets: readonly WaitingItem[],
  kind: Receipt["kind"],
  scope: Receipt["scope"],
): QueueState {
  const waiting = targets.filter((item) => statusOf(state, item.id) === "waiting");
  if (waiting.length === 0) return state;
  const status = { ...state.status };
  for (const item of waiting) status[item.id] = kind;
  return {
    ...state,
    status,
    receipts: [
      ...state.receipts,
      { kind, consequence: waiting[0].consequence, itemIds: waiting.map((item) => item.id), scope },
    ],
  };
}

/** One decision for the group. Exceptions are never part of it. */
export function decideGroup(
  state: QueueState,
  consequence: ConsequenceId,
  kind: Receipt["kind"],
  items: readonly WaitingItem[] = ITEMS,
): QueueState {
  const group = groupsFor(state, items).find((entry) => entry.consequence.id === consequence);
  return group ? decide(state, group.together, kind, "group") : state;
}

export function decideItem(
  state: QueueState,
  id: string,
  kind: Receipt["kind"],
  items: readonly WaitingItem[] = ITEMS,
): QueueState {
  const item = items.find((entry) => entry.id === id);
  return item ? decide(state, [item], kind, "single") : state;
}

/** The person says: this one is not like the rest. */
export function pullOut(state: QueueState, id: string, items: readonly WaitingItem[] = ITEMS): QueueState {
  const item = items.find((entry) => entry.id === id);
  if (!item || isException(state, item) || statusOf(state, id) !== "waiting") return state;
  return { ...state, pulled: [...state.pulled, id] };
}

/** Only for items the person took out. A scripted exception stays out. */
export function putBack(state: QueueState, id: string): QueueState {
  if (!state.pulled.includes(id)) return state;
  return { ...state, pulled: state.pulled.filter((entry) => entry !== id) };
}

/** Sending back can always be undone. An approval only where the effect can be taken back. */
export function canUndo(receipt: Receipt): boolean {
  return receipt.kind === "returned" || CONSEQUENCES[receipt.consequence].undoable;
}

export function undo(state: QueueState, receipt: Receipt): QueueState {
  if (!state.receipts.includes(receipt) || !canUndo(receipt)) return state;
  const status = { ...state.status };
  for (const id of receipt.itemIds) delete status[id];
  return { ...state, status, receipts: state.receipts.filter((entry) => entry !== receipt) };
}

export function totalAmount(items: readonly WaitingItem[]): number {
  return items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
}

export function formatEuro(amount: number): string {
  return `€${String(Math.round(amount)).replace(/\B(?=(\d{3})+$)/g, ",")}`;
}

export function formatWaiting(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function countNoun(consequence: Consequence, count: number): string {
  return `${count} ${consequence.noun[count === 1 ? 0 : 1]}`;
}

const VERB: Record<ConsequenceId, string> = {
  delete: "Delete",
  pay: "Pay",
  notify: "Send",
  reschedule: "Move",
};

/** The button says what will happen, not "Approve". */
export function actionLabel(consequence: Consequence, items: readonly WaitingItem[]): string {
  const base = `${VERB[consequence.id]} ${countNoun(consequence, items.length)}`;
  if (consequence.id === "pay") return `${base} · ${formatEuro(totalAmount(items))}`;
  if (consequence.id === "delete") return `${base} for good`;
  return base;
}

/** For one item decided on its own: "Pay this invoice · €6,120". */
export function singleActionLabel(consequence: Consequence, item: WaitingItem): string {
  const base = `${VERB[consequence.id]} this ${consequence.noun[0]}`;
  if (item.amount !== undefined) return `${base} · ${formatEuro(item.amount)}`;
  if (consequence.id === "delete") return `${base} for good`;
  return base;
}

const DONE: Record<ConsequenceId, string> = {
  delete: "deleted",
  pay: "approved for payment",
  notify: "sent",
  reschedule: "moved",
};

export function receiptLine(receipt: Receipt, items: readonly WaitingItem[] = ITEMS): string {
  const consequence = CONSEQUENCES[receipt.consequence];
  const covered = items.filter((item) => receipt.itemIds.includes(item.id));
  const what =
    receipt.scope === "single" && covered.length === 1
      ? covered[0].subject
      : countNoun(consequence, covered.length);
  const money = consequence.id === "pay" ? ` · ${formatEuro(totalAmount(covered))}` : "";
  if (receipt.kind === "returned") return `${what}${money}: sent back to the flow, nothing done.`;
  return `${what}${money}: ${DONE[consequence.id]}.`;
}
