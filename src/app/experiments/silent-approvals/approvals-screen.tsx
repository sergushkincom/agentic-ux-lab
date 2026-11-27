"use client";

import { useId, useState } from "react";
import {
  ITEMS,
  actionLabel,
  byArrival,
  canUndo,
  countNoun,
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
  totalAmount,
  undo,
  waitingCount,
  type Group,
  type QueueState,
  type Receipt,
  type WaitingItem,
} from "./queue";

type View = "consequence" | "arrival";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const primary = `rounded-full bg-[var(--fg)] px-4 py-2 text-sm font-medium text-[var(--bg)] ${focus}`;
const secondary = `rounded-full border border-[var(--border)] px-3 py-1.5 text-sm ${focus}`;
const link = `text-sm text-[var(--accent)] ${focus}`;

export function ApprovalsScreen() {
  const [state, setState] = useState<QueueState>(initialState);
  const [view, setView] = useState<View>("consequence");

  const waiting = waitingCount(state);
  const lastReceipt = state.receipts.at(-1);

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
          Forty flows stopped and are waiting for you. Each one asks the same thing: please
          confirm. Nothing here is real, and nothing is paid, sent, moved or deleted.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="How the queue is arranged"
            className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-sm"
          >
            <ViewButton current={view} value="consequence" onSelect={setView}>
              By what would happen
            </ViewButton>
            <ViewButton current={view} value="arrival" onSelect={setView}>
              By arrival
            </ViewButton>
          </div>
          <button type="button" className={link} onClick={() => setState(initialState())}>
            Start over
          </button>
        </div>

        <p className="text-sm" data-testid="tally">
          <span className="font-medium">{waiting}</span>{" "}
          <span className="text-[var(--fg-muted)]">of {ITEMS.length} waiting ·</span>{" "}
          <span className="font-medium">{decisionsLeft(state, view)}</span>{" "}
          <span className="text-[var(--fg-muted)]">
            {decisionsLeft(state, view) === 1 ? "decision" : "decisions"} left in this view
          </span>
        </p>

        <p className="sr-only" aria-live="polite">
          {lastReceipt ? receiptLine(lastReceipt) : ""}
        </p>

        {view === "consequence" ? (
          <div className="flex flex-col gap-4">
            {groupsFor(state).map((group) => (
              <GroupCard key={group.consequence.id} group={group} setState={setState} />
            ))}
          </div>
        ) : (
          <ArrivalList state={state} setState={setState} />
        )}
      </div>
    </div>
  );
}

function ViewButton({
  current,
  value,
  onSelect,
  children,
}: {
  current: View;
  value: View;
  onSelect: (view: View) => void;
  children: React.ReactNode;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={`rounded-full px-3 py-1.5 ${focus} ${
        selected ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

type CardProps = {
  group: Group;
  setState: React.Dispatch<React.SetStateAction<QueueState>>;
};

function GroupCard({ group, setState }: CardProps) {
  const { consequence, together, exceptions, receipts, all } = group;
  const [open, setOpen] = useState(false);
  const listId = useId();
  const headingId = useId();
  const paying = consequence.id === "pay";
  const settled = together.length === 0 && exceptions.length === 0;

  return (
    <section
      aria-labelledby={headingId}
      data-testid={`group-${consequence.id}`}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={headingId} className="text-base font-medium">
          {consequence.title}
        </h2>
        <p className="text-xs text-[var(--fg-muted)]">{consequence.takeBack}</p>
      </div>

      {settled ? (
        <p className="mt-2 text-sm text-[var(--fg-muted)]">
          Nothing left to decide here. {countNoun(consequence, all.length)} in total.
        </p>
      ) : null}

      {together.length > 0 ? (
        <>
          <p className="mt-2 text-sm leading-relaxed">
            {countNoun(consequence, together.length)} would be {consequence.wouldBe}
            {paying ? `, ${formatEuro(totalAmount(together))} in total` : ""}.{" "}
            <span className="text-[var(--fg-muted)]">
              {together.length === 1 ? "It stopped" : "All stopped"} for the same reason:{" "}
              {lowerFirst(consequence.sharedReason)}
            </span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={primary}
              onClick={() => setState((prev) => decideGroup(prev, consequence.id, "approved"))}
            >
              {actionLabel(consequence, together)}
            </button>
            <button
              type="button"
              className={secondary}
              onClick={() => setState((prev) => decideGroup(prev, consequence.id, "returned"))}
            >
              Send {together.length === 1 ? "it" : `all ${together.length}`} back
            </button>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              className={`${link} ml-auto`}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Hide the list" : `Show the ${together.length}`}
            </button>
          </div>

          {open ? (
            <ul id={listId} className="mt-4 divide-y divide-[var(--border)] border-t border-[var(--border)]">
              {together.map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    {item.subject}
                    <span className="text-[var(--fg-muted)]"> · {item.detail}</span>
                  </span>
                  {item.amount !== undefined ? (
                    <span className="font-mono tabular-nums">{formatEuro(item.amount)}</span>
                  ) : null}
                  <button
                    type="button"
                    className={link}
                    aria-label={`Take ${item.subject} out of the group`}
                    onClick={() => setState((prev) => pullOut(prev, item.id))}
                  >
                    Take out
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      {exceptions.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-xs font-medium tracking-wide text-[var(--fg-muted)]">
            Not like the rest · {exceptions.length} · not part of the group decision
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {exceptions.map((item) => (
              <ExceptionRow key={item.id} item={item} group={group} setState={setState} />
            ))}
          </ul>
        </div>
      ) : null}

      {receipts.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-1 border-t border-[var(--border)] pt-3 text-sm">
          {receipts.map((receipt, index) => (
            <ReceiptRow key={`${receipt.itemIds[0]}-${index}`} receipt={receipt} setState={setState} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ExceptionRow({
  item,
  group,
  setState,
}: {
  item: WaitingItem;
  group: Group;
  setState: CardProps["setState"];
}) {
  const byPerson = item.unlike === undefined;
  return (
    <li
      data-testid={`exception-${item.id}`}
      className="rounded-xl border border-dashed border-[var(--fg-muted)] p-3 text-sm"
    >
      <p>
        {item.subject}
        <span className="text-[var(--fg-muted)]"> · {item.detail}</span>
        {item.amount !== undefined ? (
          <span className="font-mono tabular-nums"> · {formatEuro(item.amount)}</span>
        ) : null}
      </p>
      <p className="mt-1 leading-relaxed">
        {byPerson ? (
          <span className="text-[var(--fg-muted)]">You took this one out of the group.</span>
        ) : (
          item.unlike
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={secondary}
          onClick={() => setState((prev) => decideItem(prev, item.id, "approved"))}
        >
          {singleActionLabel(group.consequence, item)}
        </button>
        <button
          type="button"
          className={secondary}
          onClick={() => setState((prev) => decideItem(prev, item.id, "returned"))}
        >
          Send it back
        </button>
        {byPerson ? (
          <button
            type="button"
            className={`${link} ml-auto`}
            onClick={() => setState((prev) => putBack(prev, item.id))}
          >
            Put back in the group
          </button>
        ) : null}
      </div>
    </li>
  );
}

function ReceiptRow({ receipt, setState }: { receipt: Receipt; setState: CardProps["setState"] }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3">
      <span className="text-[var(--fg-muted)]">{receiptLine(receipt)}</span>
      {canUndo(receipt) ? (
        <button type="button" className={link} onClick={() => setState((prev) => undo(prev, receipt))}>
          Undo
        </button>
      ) : (
        <span className="text-xs text-[var(--fg-muted)]">No undo</span>
      )}
    </li>
  );
}

function ArrivalList({
  state,
  setState,
}: {
  state: QueueState;
  setState: CardProps["setState"];
}) {
  const waiting = byArrival().filter((item) => statusOf(state, item.id) === "waiting");

  if (waiting.length === 0) {
    return <p className="text-sm text-[var(--fg-muted)]">Nothing is waiting.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {waiting.map((item) => (
        <li
          key={item.id}
          data-testid="arrival-card"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium">{item.subject}</p>
            <p className="text-[var(--fg-muted)]">
              Waiting for you · {formatWaiting(item.waitingMin)} · Please confirm.
            </p>
          </div>
          <button
            type="button"
            className={secondary}
            aria-label={`Approve ${item.subject}`}
            onClick={() => setState((prev) => decideItem(prev, item.id, "approved"))}
          >
            Approve
          </button>
          <button
            type="button"
            className={secondary}
            aria-label={`Send back ${item.subject}`}
            onClick={() => setState((prev) => decideItem(prev, item.id, "returned"))}
          >
            Send back
          </button>
        </li>
      ))}
    </ul>
  );
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
