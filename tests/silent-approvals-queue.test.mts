import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONSEQUENCES,
  CONSEQUENCE_IDS,
  ITEMS,
  actionLabel,
  byArrival,
  canUndo,
  decideGroup,
  decideItem,
  decisionsLeft,
  formatEuro,
  formatWaiting,
  groupsFor,
  initialState,
  pullOut,
  putBack,
  receiptLine,
  singleActionLabel,
  statusOf,
  undo,
  waitingCount,
} from "../src/app/experiments/silent-approvals/queue.ts";

const group = (state: ReturnType<typeof initialState>, id: (typeof CONSEQUENCE_IDS)[number]) => {
  const found = groupsFor(state).find((entry) => entry.consequence.id === id);
  assert.ok(found, id);
  return found;
};

describe("the scripted queue", () => {
  it("has forty items with unique ids and unique waiting times", () => {
    assert.equal(ITEMS.length, 40);
    assert.equal(new Set(ITEMS.map((item) => item.id)).size, 40);
    assert.equal(new Set(ITEMS.map((item) => item.waitingMin)).size, 40);
  });

  it("splits into four effects, hardest to take back first", () => {
    const groups = groupsFor(initialState());
    assert.deepEqual(
      groups.map((entry) => [entry.consequence.id, entry.together.length, entry.exceptions.length]),
      [
        ["delete", 4, 2],
        ["pay", 12, 2],
        ["notify", 10, 1],
        ["reschedule", 9, 0],
      ],
    );
  });

  it("matches the shared reason: every payment is over the 2,000 limit", () => {
    for (const item of ITEMS.filter((entry) => entry.consequence === "pay")) {
      assert.ok((item.amount ?? 0) > 2000, item.subject);
    }
    for (const item of ITEMS.filter((entry) => entry.consequence !== "pay")) {
      assert.equal(item.amount, undefined, item.subject);
    }
  });

  it("mixes the four effects in arrival order", () => {
    const firstEight = byArrival().slice(0, 8);
    assert.ok(new Set(firstEight.map((item) => item.consequence)).size >= 3);
    const waits = byArrival().map((item) => item.waitingMin);
    assert.deepEqual(waits, [...waits].sort((a, b) => b - a));
  });
});

describe("decisions", () => {
  it("needs 40 decisions by arrival and 9 by what would happen", () => {
    const state = initialState();
    assert.equal(decisionsLeft(state, "arrival"), 40);
    assert.equal(decisionsLeft(state, "consequence"), 9);
  });

  it("a group decision never covers an exception", () => {
    const state = decideGroup(initialState(), "pay", "approved");
    const pay = group(state, "pay");
    assert.equal(pay.together.length, 0);
    assert.equal(pay.exceptions.length, 2);
    for (const item of pay.exceptions) {
      assert.equal(statusOf(state, item.id), "waiting");
    }
    assert.equal(waitingCount(state), 28);
    assert.equal(state.receipts.length, 1);
    assert.equal(state.receipts[0].itemIds.length, 12);
    assert.equal(receiptLine(state.receipts[0]), "12 invoices · €47,130: approved for payment.");
  });

  it("an item the person takes out leaves the group decision and the button", () => {
    const before = group(initialState(), "pay");
    assert.equal(actionLabel(before.consequence, before.together), "Pay 12 invoices · €47,130");

    const taken = before.together[0];
    let state = pullOut(initialState(), taken.id);
    const after = group(state, "pay");
    assert.equal(after.together.length, 11);
    assert.equal(after.exceptions.length, 3);
    assert.equal(
      actionLabel(after.consequence, after.together),
      `Pay 11 invoices · ${formatEuro(47130 - (taken.amount ?? 0))}`,
    );
    assert.equal(decisionsLeft(state, "consequence"), 10);

    state = decideGroup(state, "pay", "approved");
    assert.equal(statusOf(state, taken.id), "waiting");

    state = decideItem(state, taken.id, "returned");
    assert.equal(statusOf(state, taken.id), "returned");
    assert.match(receiptLine(state.receipts[1]), /sent back to the flow, nothing done\.$/);
  });

  it("puts back only what the person took out", () => {
    const pay = group(initialState(), "pay");
    const scripted = pay.exceptions[0];
    const taken = pay.together[0];

    const state = pullOut(initialState(), taken.id);
    assert.equal(group(putBack(state, taken.id), "pay").together.length, 12);
    assert.equal(putBack(state, scripted.id), state);
    assert.equal(group(putBack(state, scripted.id), "pay").exceptions.length, 3);
    assert.equal(pullOut(state, scripted.id), state);
  });

  it("names the effect on the button", () => {
    const state = initialState();
    assert.deepEqual(
      CONSEQUENCE_IDS.map((id) => actionLabel(CONSEQUENCES[id], group(state, id).together)),
      [
        "Delete 4 supplier records for good",
        "Pay 12 invoices · €47,130",
        "Send 10 delay notices",
        "Move 9 delivery dates",
      ],
    );
    assert.equal(
      singleActionLabel(CONSEQUENCES.delete, group(state, "delete").exceptions[0]),
      "Delete this supplier record for good",
    );
    assert.equal(
      singleActionLabel(CONSEQUENCES.pay, group(state, "pay").exceptions[0]),
      "Pay this invoice · €18,600",
    );
    assert.equal(
      singleActionLabel(CONSEQUENCES.notify, group(state, "notify").exceptions[0]),
      "Send this delay notice",
    );
  });

  it("clears the queue in nine decisions", () => {
    let state = initialState();
    let decisions = 0;
    for (const id of CONSEQUENCE_IDS) {
      state = decideGroup(state, id, "approved");
      decisions += 1;
    }
    for (const entry of groupsFor(state)) {
      for (const item of entry.exceptions) {
        state = decideItem(state, item.id, "returned");
        decisions += 1;
      }
    }
    assert.equal(decisions, 9);
    assert.equal(waitingCount(state), 0);
    assert.equal(decisionsLeft(state, "consequence"), 0);
    assert.equal(decisionsLeft(state, "arrival"), 0);
  });

  it("does nothing when a group has nothing left to decide together", () => {
    const once = decideGroup(initialState(), "reschedule", "approved");
    assert.equal(decideGroup(once, "reschedule", "approved"), once);
    assert.equal(decideItem(once, "no-such-item", "approved"), once);
  });
});

describe("undo", () => {
  it("is offered for a payment and a moved date, not for a sent notice or a deletion", () => {
    for (const id of CONSEQUENCE_IDS) {
      const state = decideGroup(initialState(), id, "approved");
      assert.equal(canUndo(state.receipts[0]), id === "pay" || id === "reschedule", id);
    }
  });

  it("is always offered after sending back", () => {
    for (const id of CONSEQUENCE_IDS) {
      const state = decideGroup(initialState(), id, "returned");
      assert.equal(canUndo(state.receipts[0]), true, id);
    }
  });

  it("returns the items to waiting and removes the receipt", () => {
    const paid = decideGroup(initialState(), "pay", "approved");
    const back = undo(paid, paid.receipts[0]);
    assert.equal(waitingCount(back), 40);
    assert.equal(back.receipts.length, 0);
    assert.equal(group(back, "pay").together.length, 12);
  });

  it("leaves a deletion as it is", () => {
    const deleted = decideGroup(initialState(), "delete", "approved");
    assert.equal(undo(deleted, deleted.receipts[0]), deleted);
    assert.equal(waitingCount(deleted), 36);
  });
});

describe("formatting", () => {
  it("formats euros with thousands separators", () => {
    assert.equal(formatEuro(0), "€0");
    assert.equal(formatEuro(950), "€950");
    assert.equal(formatEuro(2190), "€2,190");
    assert.equal(formatEuro(1234567), "€1,234,567");
  });

  it("formats waiting time in minutes, hours and days", () => {
    assert.equal(formatWaiting(6), "6m");
    assert.equal(formatWaiting(77), "1h 17m");
    assert.equal(formatWaiting(1440), "1d 0h");
    assert.equal(formatWaiting(2775), "1d 22h");
  });
});
