/**
 * Absence coverage: one scripted week of requests, and the plan a person
 * leaves behind. Everything here is pure, so the Monday report can be tested
 * without the screen. People are first names only and do not exist.
 */

export type Capability = "answer" | "reschedule" | "forward";
export type MeetingSize = "one" | "small" | "any";
export type EscalateTo = "cover" | "lead" | "hold";
export type PromiseKind = "price" | "date" | "yes";
export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

/** What the person sets on Friday. */
export type Plan = {
  may: Record<Capability, boolean>;
  /** May it act for people outside the company at all. */
  outside: boolean;
  /** The largest meeting it may move. */
  meetingSize: MeetingSize;
  /** Who gets what it does not do. */
  escalateTo: EscalateTo;
};

export type AbsenceEvent = {
  id: string;
  day: Day;
  from: string;
  outside?: boolean;
  request: string;
  needs: Capability;
  /** Answering would commit the person to a price, a date or a yes. */
  promise?: PromiseKind;
  /** Other people in the meeting, for a reschedule. */
  others?: number;
  /** What it does when the plan lets it. */
  action: string;
  /** Set when it would stop by itself even with permission. */
  ownCall?: string;
  /** Whether the person who got the escalation could close it. */
  coverCloses: boolean;
  /** How they closed it. "{who}" is replaced by their name. */
  closeNote?: string;
  /** Why it is still open after they looked. */
  openNote?: string;
};

/** Who made the decision to stop. */
export type StoppedBy = "scope" | "limit" | "fixed" | "own";

export type Outcome = {
  event: AbsenceEvent;
  /** done: the assistant did it. closed: it stopped, someone else finished. waiting: nobody did. */
  status: "done" | "closed" | "waiting";
  stoppedBy?: StoppedBy;
  /** One sentence: the permission it used, or the reason it stopped. */
  why: string;
  /** What the sender heard. Only for a stop. */
  told?: string;
  /** What happened after the stop. */
  after?: string;
};

export type Report = {
  total: number;
  waiting: Outcome[];
  closed: Outcome[];
  done: Outcome[];
  headline: string;
};

export const CAPABILITIES: Capability[] = ["answer", "reschedule", "forward"];

export const CAPABILITY_LABEL: Record<Capability, string> = {
  answer: "Answer from your notes",
  reschedule: "Move your meetings",
  forward: "Pass a message to its owner",
};

export const CAPABILITY_HINT: Record<Capability, string> = {
  answer: "Only what your notes already say. It quotes them and links the page.",
  reschedule: "A meeting that needs you moves to the week you are back.",
  forward: "A question that was never yours goes to the team that owns it.",
};

export const MEETING_SIZES: MeetingSize[] = ["one", "small", "any"];

export const MEETING_SIZE_LABEL: Record<MeetingSize, string> = {
  one: "1:1s only",
  small: "Up to 4 people",
  any: "Any size",
};

/** Other people allowed in a meeting it moves. */
const MAX_OTHERS: Record<MeetingSize, number> = {
  one: 1,
  small: 3,
  any: Number.POSITIVE_INFINITY,
};

export const ESCALATE_OPTIONS: EscalateTo[] = ["cover", "lead", "hold"];

export const ESCALATE_LABEL: Record<EscalateTo, string> = {
  cover: "Mara, who covers for you",
  lead: "Jonas, your lead",
  hold: "Nobody. It waits for you",
};

const ESCALATE_NAME: Record<Exclude<EscalateTo, "hold">, string> = {
  cover: "Mara",
  lead: "Jonas",
};

export const STOPPED_BY_LABEL: Record<StoppedBy, string> = {
  scope: "You turned this off",
  limit: "Your limit",
  fixed: "Never allowed",
  own: "Its own call",
};

const PROMISE_NOUN: Record<PromiseKind, string> = {
  price: "a price",
  date: "a date",
  yes: "a yes",
};

export const FIXED_RULE = "It never promises a price, a date or a yes in your name.";

export const DEFAULT_PLAN: Plan = {
  may: { answer: true, reschedule: true, forward: true },
  outside: false,
  meetingSize: "small",
  escalateTo: "cover",
};

export const EVENTS: AbsenceEvent[] = [
  {
    id: "checklist",
    day: "Mon",
    from: "Ilse",
    request: "Where is the latest onboarding checklist?",
    needs: "answer",
    action: "Sent Ilse the checklist page from your notes.",
    coverCloses: true,
    closeNote: "{who} sent Ilse the page.",
  },
  {
    id: "one-to-one",
    day: "Mon",
    from: "Tomas",
    request: "Can we move our 1:1 on Tuesday, since you are out?",
    needs: "reschedule",
    others: 1,
    action: "Moved the 1:1 with Tomas to Tuesday next week, same time.",
    coverCloses: true,
    closeNote: "{who} moved it to Tuesday next week.",
  },
  {
    id: "discount",
    day: "Mon",
    from: "A supplier contact",
    outside: true,
    request: "Can you confirm the 12% discount for next quarter?",
    needs: "answer",
    promise: "price",
    action: "",
    coverCloses: false,
    openNote: "{who} would not confirm a price for you either.",
  },
  {
    id: "invoice",
    day: "Tue",
    from: "Petra",
    request: "Invoice 0417 shows the wrong cost centre. Who fixes that?",
    needs: "forward",
    action: "Passed it to the finance desk and told Petra where it went.",
    coverCloses: true,
    closeNote: "{who} passed it to the finance desk.",
  },
  {
    id: "planning-review",
    day: "Tue",
    from: "Noor",
    request: "Thursday's planning review needs you. Move it to next week?",
    needs: "reschedule",
    others: 5,
    action: "Moved the planning review for six people to Thursday next week.",
    coverCloses: true,
    closeNote: "{who} asked the group and moved it to Thursday next week.",
  },
  {
    id: "handover-template",
    day: "Tue",
    from: "Tomas",
    request: "Which template do we use for the handover note?",
    needs: "answer",
    action: "Sent Tomas the handover template your notes name.",
    coverCloses: true,
    closeNote: "{who} sent Tomas the template.",
  },
  {
    id: "release-date",
    day: "Wed",
    from: "Ilse",
    request: "Is the release still planned for the 14th?",
    needs: "answer",
    action: "",
    ownCall: "Your notes give two dates, the 14th and the 21st. It did not pick one.",
    coverCloses: true,
    closeNote: "{who} checked with the release owner. It is the 21st.",
  },
  {
    id: "call-notes",
    day: "Wed",
    from: "A client contact",
    outside: true,
    request: "Could you send the notes from last week's call?",
    needs: "answer",
    action: "Sent the client contact the shared notes page from last week's call.",
    coverCloses: true,
    closeNote: "{who} sent the shared notes page.",
  },
  {
    id: "day-off",
    day: "Wed",
    from: "Noor",
    request: "Can I take this Friday off?",
    needs: "answer",
    promise: "yes",
    action: "",
    coverCloses: true,
    closeNote: "{who} said yes on Wednesday.",
  },
  {
    id: "weekly-sync",
    day: "Thu",
    from: "Petra",
    request: "Shall we skip the weekly sync or move it?",
    needs: "reschedule",
    others: 2,
    action: "Moved the weekly sync for three people to Thursday next week.",
    coverCloses: true,
    closeNote: "{who} moved it to Thursday next week.",
  },
  {
    id: "interview",
    day: "Thu",
    from: "A recruiter",
    outside: true,
    request: "The candidate can't make Friday. Is Monday at 10:00 fine?",
    needs: "reschedule",
    others: 1,
    action: "Moved the interview to Monday 10:00, which was free in your calendar.",
    coverCloses: false,
    openNote: "{who} could not see which Monday slots you keep free.",
  },
  {
    id: "focus-block",
    day: "Thu",
    from: "Ilse",
    request: "Can our 1:1 move to the week you are back?",
    needs: "reschedule",
    others: 1,
    action: "",
    ownCall:
      "The only shared slot next week is over Ilse's lunch. It did not book that for her.",
    coverCloses: false,
    openNote: "{who} left the choice of slot to you and Ilse.",
  },
  {
    id: "contract-question",
    day: "Fri",
    from: "Emil",
    request: "Who signs off the wording of the new contractor agreement?",
    needs: "forward",
    action: "Passed it to the legal desk and told Emil where it went.",
    coverCloses: true,
    closeNote: "{who} passed it to the legal desk.",
  },
  {
    id: "meeting-room",
    day: "Fri",
    from: "Tomas",
    request: "Which room is the workshop in on the day you are back?",
    needs: "answer",
    action: "Told Tomas the room from the workshop page in your notes.",
    coverCloses: true,
    closeNote: "{who} told Tomas the room.",
  },
];

/** Why the plan stops this event, or null when the plan lets it through. */
function stopReason(event: AbsenceEvent, plan: Plan): { by: StoppedBy; why: string } | null {
  if (event.promise) {
    return {
      by: "fixed",
      why: `Not a setting: it never promises ${PROMISE_NOUN[event.promise]} in your name.`,
    };
  }
  if (!plan.may[event.needs]) {
    return {
      by: "scope",
      why: `On Friday you turned off "${CAPABILITY_LABEL[event.needs]}".`,
    };
  }
  if (event.outside && !plan.outside) {
    return { by: "limit", why: "Your limit: nothing for people outside the company." };
  }
  if (event.needs === "reschedule" && (event.others ?? 0) > MAX_OTHERS[plan.meetingSize]) {
    const people = (event.others ?? 0) + 1;
    return {
      by: "limit",
      why: `Your limit: ${MEETING_SIZE_LABEL[plan.meetingSize].toLowerCase()}. This meeting has ${people}.`,
    };
  }
  if (event.ownCall) {
    return { by: "own", why: event.ownCall };
  }
  return null;
}

/** Its sentence in the Monday report: the permission it used. */
function allowedBy(event: AbsenceEvent): string {
  return `Allowed by you on Friday: ${CAPABILITY_LABEL[event.needs].toLowerCase()}.`;
}

export function resolve(event: AbsenceEvent, plan: Plan): Outcome {
  const stop = stopReason(event, plan);
  if (!stop) {
    return { event, status: "done", why: allowedBy(event) };
  }

  if (plan.escalateTo === "hold") {
    return {
      event,
      status: "waiting",
      stoppedBy: stop.by,
      why: stop.why,
      told: `Told ${lowerFirst(event.from)}: you are back on Monday. Nobody else has this.`,
      after: "Nobody has looked at it.",
    };
  }

  const who = ESCALATE_NAME[plan.escalateTo];
  const told = `Told ${lowerFirst(event.from)}: you are back on Monday, and ${who} has this.`;
  if (event.coverCloses) {
    return {
      event,
      status: "closed",
      stoppedBy: stop.by,
      why: stop.why,
      told,
      after: fill(event.closeNote ?? "{who} closed it.", who),
    };
  }
  return {
    event,
    status: "waiting",
    stoppedBy: stop.by,
    why: stop.why,
    told,
    after: fill(event.openNote ?? "{who} could not close it.", who),
  };
}

export function buildReport(events: AbsenceEvent[], plan: Plan): Report {
  const outcomes = events.map((event) => resolve(event, plan));
  const waiting = outcomes.filter((outcome) => outcome.status === "waiting");
  const closed = outcomes.filter((outcome) => outcome.status === "closed");
  const done = outcomes.filter((outcome) => outcome.status === "done");
  return {
    total: outcomes.length,
    waiting,
    closed,
    done,
    headline: headline(outcomes.length, waiting.length, closed.length, done.length, plan),
  };
}

function headline(
  total: number,
  waiting: number,
  closed: number,
  done: number,
  plan: Plan,
): string {
  const parts = [`${count(waiting, "waits", "wait")} for you`];
  if (plan.escalateTo !== "hold") {
    parts.push(`${closed} closed by ${ESCALATE_NAME[plan.escalateTo]}`);
  }
  parts.push(`${done} done by the assistant`);
  return `${total} things came in. ${parts.join(", ")}.`;
}

/** The plan as the sentences a person can read back before leaving. */
export function planSentences(plan: Plan): string[] {
  const allowed = CAPABILITIES.filter((capability) => plan.may[capability]);
  const sentences: string[] = [];

  if (allowed.length === 0) {
    sentences.push("It does nothing in your name. It only says when you are back.");
  } else {
    const phrases = allowed.map((capability) => {
      if (capability === "answer") return "answer from your notes";
      if (capability === "forward") return "pass a message to its owner";
      return plan.meetingSize === "any"
        ? "move your meetings of any size"
        : plan.meetingSize === "one"
          ? "move your 1:1s"
          : "move your meetings of up to 4 people";
    });
    sentences.push(`It may ${joinList(phrases)}.`);
    sentences.push(
      plan.outside
        ? "It does this for people outside the company too."
        : "It does none of this for people outside the company.",
    );
  }

  sentences.push(FIXED_RULE);
  sentences.push(
    plan.escalateTo === "hold"
      ? "What it does not do waits for you until Monday."
      : `What it does not do goes to ${ESCALATE_NAME[plan.escalateTo]}.`,
  );
  return sentences;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function count(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function fill(template: string, who: string): string {
  return template.replaceAll("{who}", who);
}

/** "A supplier contact" reads as "a supplier contact" mid-sentence. Names stay. */
function lowerFirst(from: string): string {
  return from.startsWith("A ") ? `a ${from.slice(2)}` : from;
}
