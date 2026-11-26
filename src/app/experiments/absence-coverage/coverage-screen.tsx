"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  CAPABILITIES,
  CAPABILITY_HINT,
  CAPABILITY_LABEL,
  DEFAULT_PLAN,
  ESCALATE_LABEL,
  ESCALATE_OPTIONS,
  EVENTS,
  FIXED_RULE,
  MEETING_SIZES,
  MEETING_SIZE_LABEL,
  STOPPED_BY_LABEL,
  buildReport,
  planSentences,
  type Capability,
  type Outcome,
  type Plan,
} from "./coverage";

type View = "friday" | "monday";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
const card = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5";
const input = "mt-1 size-4 shrink-0 accent-[var(--accent)]";

export function CoverageScreen() {
  const [plan, setPlan] = useState<Plan>(DEFAULT_PLAN);
  const [view, setView] = useState<View>("friday");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // After a switch the next thing read is the new screen's heading, not the old button.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [view]);

  function show(next: View) {
    moved.current = true;
    setView(next);
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
          You are out for a week. An assistant covers your inbox and calendar. The week is
          scripted: the same fourteen requests come in whatever you choose, and nothing is
          sent anywhere.
        </p>

        <div
          role="group"
          aria-label="Which day"
          className="grid grid-cols-2 gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] p-1 text-sm"
        >
          <DayButton
            label="Friday"
            hint="before you leave"
            active={view === "friday"}
            onClick={() => show("friday")}
          />
          <DayButton
            label="Monday"
            hint="when you are back"
            active={view === "monday"}
            onClick={() => show("monday")}
          />
        </div>

        {view === "friday" ? (
          <Friday
            plan={plan}
            onPlan={setPlan}
            onLeave={() => show("monday")}
            headingRef={headingRef}
          />
        ) : (
          <Monday plan={plan} onBack={() => show("friday")} headingRef={headingRef} />
        )}
      </div>
    </div>
  );
}

function DayButton({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 ${focus} ${
        active
          ? "bg-[var(--surface)] font-medium text-[var(--fg)] shadow-[var(--card-rest)]"
          : "text-[var(--fg-muted)]"
      }`}
    >
      {label}
      <span className="hidden text-[var(--fg-muted)] sm:inline"> · {hint}</span>
    </button>
  );
}

function Friday({
  plan,
  onPlan,
  onLeave,
  headingRef,
}: {
  plan: Plan;
  onPlan: (plan: Plan) => void;
  onLeave: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const baseId = useId();
  const sentences = planSentences(plan);

  function toggle(capability: Capability) {
    onPlan({ ...plan, may: { ...plan.may, [capability]: !plan.may[capability] } });
  }

  return (
    <>
      <h2 ref={headingRef} tabIndex={-1} className="text-lg font-medium outline-none">
        Before you leave
      </h2>

      <fieldset className={card}>
        <legend className="float-left mb-3 w-full text-sm font-medium">What it may do</legend>
        <ul className="clear-both flex flex-col gap-3">
          {CAPABILITIES.map((capability) => (
            <li key={capability}>
              <label className="flex gap-3">
                <input
                  type="checkbox"
                  className={input}
                  checked={plan.may[capability]}
                  onChange={() => toggle(capability)}
                  aria-describedby={`${baseId}-${capability}`}
                />
                <span>
                  <span className="block">{CAPABILITY_LABEL[capability]}</span>
                  <span
                    id={`${baseId}-${capability}`}
                    className="block text-sm text-[var(--fg-muted)]"
                  >
                    {CAPABILITY_HINT[capability]}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className={card}>
        <h3 className="text-sm font-medium">Where it stops</h3>

        <label className="mt-3 flex gap-3">
          <input
            type="checkbox"
            className={input}
            checked={plan.outside}
            onChange={() => onPlan({ ...plan, outside: !plan.outside })}
          />
          <span>
            <span className="block">Also for people outside the company</span>
            <span className="block text-sm text-[var(--fg-muted)]">
              Off: suppliers, clients and recruiters only hear when you are back.
            </span>
          </span>
        </label>

        <fieldset className="mt-4" disabled={!plan.may.reschedule}>
          <legend className="text-sm text-[var(--fg-muted)]">
            The largest meeting it may move
            {plan.may.reschedule ? "" : " (moving meetings is off)"}
          </legend>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
            {MEETING_SIZES.map((size) => (
              <label key={size} className="flex items-start gap-2">
                <input
                  type="radio"
                  name={`${baseId}-size`}
                  className={input}
                  checked={plan.meetingSize === size}
                  onChange={() => onPlan({ ...plan, meetingSize: size })}
                />
                <span className={plan.may.reschedule ? "" : "text-[var(--fg-muted)]"}>
                  {MEETING_SIZE_LABEL[size]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm leading-relaxed">
          <span className="font-medium">Not a setting.</span>{" "}
          <span className="text-[var(--fg-muted)]">{FIXED_RULE}</span>
        </p>
      </div>

      <fieldset className={card}>
        <legend className="float-left mb-3 w-full text-sm font-medium">
          Who gets what it does not do
        </legend>
        <div className="clear-both flex flex-col gap-2">
          {ESCALATE_OPTIONS.map((option) => (
            <label key={option} className="flex items-start gap-3">
              <input
                type="radio"
                name={`${baseId}-escalate`}
                className={input}
                checked={plan.escalateTo === option}
                onChange={() => onPlan({ ...plan, escalateTo: option })}
              />
              <span>{ESCALATE_LABEL[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <section aria-labelledby={`${baseId}-plan`} className="flex flex-col gap-3">
        <h3 id={`${baseId}-plan`} className="text-sm font-medium">
          The plan, read back
        </h3>
        <p className="leading-relaxed" aria-live="polite" data-testid="plan-sentences">
          {sentences.join(" ")}
        </p>
        <div>
          <button
            type="button"
            onClick={onLeave}
            className={`w-full rounded-full bg-[var(--fg)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] sm:w-auto ${focus}`}
          >
            Leave for the week
          </button>
        </div>
      </section>
    </>
  );
}

function Monday({
  plan,
  onBack,
  headingRef,
}: {
  plan: Plan;
  onBack: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const report = buildReport(EVENTS, plan);
  const closedBy = plan.escalateTo === "lead" ? "Jonas" : "Mara";

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-lg font-medium outline-none">
          When you are back
        </h2>
        <p className="leading-relaxed" data-testid="headline">
          {report.headline}
        </p>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="waiting-title">
        <h3 id="waiting-title" className="text-sm font-medium">
          Waiting for you
          <Count value={report.waiting.length} />
        </h3>
        {report.waiting.length === 0 ? (
          <p className="text-sm text-[var(--fg-muted)]">Nothing is waiting for you.</p>
        ) : (
          <OutcomeList outcomes={report.waiting} />
        )}
      </section>

      {report.closed.length > 0 ? (
        <Fold
          title={`It did not do these. ${closedBy} closed them`}
          count={report.closed.length}
          outcomes={report.closed}
          open
        />
      ) : null}

      {report.done.length > 0 ? (
        <Fold title="Done by the assistant" count={report.done.length} outcomes={report.done} />
      ) : (
        <p className="text-sm text-[var(--fg-muted)]">
          The assistant did nothing in your name this week.
        </p>
      )}

      <div>
        <button type="button" onClick={onBack} className={`text-sm text-[var(--accent)] ${focus}`}>
          ← Back to Friday and change the plan
        </button>
      </div>
    </>
  );
}

function Fold({
  title,
  count,
  outcomes,
  open = false,
}: {
  title: string;
  count: number;
  outcomes: Outcome[];
  open?: boolean;
}) {
  return (
    <details open={open} className="group">
      <summary className={`cursor-pointer text-sm font-medium ${focus}`}>
        {title}
        <Count value={count} />
      </summary>
      <div className="mt-3">
        <OutcomeList outcomes={outcomes} />
      </div>
    </details>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="ml-2 font-mono text-xs tabular-nums text-[var(--fg-muted)]">{value}</span>
  );
}

function OutcomeList({ outcomes }: { outcomes: Outcome[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {outcomes.map((outcome) => (
        <li key={outcome.event.id} className={card} data-status={outcome.status}>
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[var(--fg-muted)]">
            <span className="font-mono">{outcome.event.day}</span>
            <span>{outcome.event.from}</span>
            {outcome.event.outside ? <span>· outside the company</span> : null}
            {outcome.stoppedBy ? (
              <span className="ml-auto rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--fg)]">
                {STOPPED_BY_LABEL[outcome.stoppedBy]}
              </span>
            ) : null}
          </p>
          <p className="mt-2 leading-relaxed">“{outcome.event.request}”</p>
          <dl className="mt-3 flex flex-col gap-1.5 border-t border-[var(--border)] pt-3 text-sm leading-relaxed">
            {outcome.status === "done" ? (
              <>
                <Row term="It did" detail={outcome.event.action} />
                <Row term="Why" detail={outcome.why} muted />
              </>
            ) : (
              <>
                <Row term="It stopped" detail={outcome.why} />
                {outcome.told ? <Row term="They heard" detail={outcome.told} muted /> : null}
                {outcome.after ? (
                  <Row
                    term={outcome.status === "waiting" ? "Still open" : "Then"}
                    detail={outcome.after}
                    muted={outcome.status !== "waiting"}
                  />
                ) : null}
              </>
            )}
          </dl>
        </li>
      ))}
    </ul>
  );
}

function Row({ term, detail, muted = false }: { term: string; detail: string; muted?: boolean }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-x-3">
      <dt className="text-[var(--fg-muted)]">{term}</dt>
      <dd className={muted ? "text-[var(--fg-muted)]" : ""}>{detail}</dd>
    </div>
  );
}
