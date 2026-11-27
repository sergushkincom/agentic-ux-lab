/**
 * Sourced answers: fake documents, three scripted questions, and the pure rules that
 * decide what the screen says about each sentence. No model, no search, no network.
 */

export type Doc = {
  id: string;
  title: string;
  /** Fixed in the script, so the screen never depends on today's date. */
  editedMonthsAgo: number;
};

export type Passage = {
  id: string;
  docId: string;
  section: string;
  text: string;
};

/**
 * stated   — one passage says the same thing.
 * combined — put together from more than one passage; no document says it in one place.
 * none     — nothing in the documents says it. A guess.
 */
export type Grounding = "stated" | "combined" | "none";

export type Support = {
  passageId: string;
  /** The exact words in the passage the sentence rests on. */
  phrase: string;
};

export type Conflict = {
  topic: string;
  passageId: string;
  used: string;
  other: string;
};

export type Sentence = {
  id: string;
  text: string;
  grounding: Grounding;
  rests: Support[];
  /** combined: how the passages were put together. */
  how?: string;
  /** none: why there is a sentence here at all. */
  why?: string;
  /** Another document says something else about the same thing. */
  conflict?: Conflict;
};

export type Gap = {
  what: string;
  lookedIn: string[];
  closest?: { passageId: string; whyNot: string };
};

export type ReadAs = {
  phrase: string;
  as: string;
  note: string;
};

export type Answer = {
  id: string;
  question: string;
  sentences: Sentence[];
  gaps: Gap[];
  readAs?: ReadAs;
};

export type ConcernKind = "disagree" | "guess" | "combined" | "old" | "read-as" | "gap";

export type Concern = {
  id: string;
  kind: ConcernKind;
  text: string;
  /** The sentence to look at, when the concern is about one. */
  sentenceId?: string;
};

/** A document nobody has edited for this long is flagged, even when it is the only source. */
export const STALE_AFTER_MONTHS = 12;

export const DOCS: Doc[] = [
  { id: "travel", title: "Travel and expenses policy", editedMonthsAgo: 2 },
  { id: "faq", title: "Expenses FAQ", editedMonthsAgo: 19 },
  { id: "abroad", title: "Working from abroad guideline", editedMonthsAgo: 14 },
  { id: "handbook", title: "Team handbook", editedMonthsAgo: 5 },
];

export const PASSAGES: Passage[] = [
  {
    id: "travel-1.1",
    docId: "travel",
    section: "1.1",
    text: "This policy covers client visits, conferences and training.",
  },
  {
    id: "travel-3.2",
    docId: "travel",
    section: "3.2",
    text: "Hotels are reimbursed up to €160 per night, breakfast included.",
  },
  {
    id: "travel-3.4",
    docId: "travel",
    section: "3.4",
    text: "If no hotel within the limit is free within 30 minutes of the venue, your line manager can approve up to 25% above the limit.",
  },
  {
    id: "travel-5.1",
    docId: "travel",
    section: "5.1",
    text: "Meals while travelling are reimbursed up to €45 per day.",
  },
  {
    id: "faq-hotels",
    docId: "faq",
    section: "Hotels",
    text: "The hotel limit is €140 per night.",
  },
  {
    id: "abroad-2",
    docId: "abroad",
    section: "2",
    text: "You may work from another country for up to 20 working days per year. The days can be split across several stays.",
  },
  {
    id: "abroad-4",
    docId: "abroad",
    section: "4",
    text: "Tell People Ops at least 10 working days before you leave.",
  },
];

export const ANSWERS: Answer[] = [
  {
    id: "hotel",
    question: "Can I book a hotel over the nightly limit for the offsite, and who approves it?",
    sentences: [
      {
        id: "hotel-limit",
        text: "The limit is €160 a night.",
        grounding: "stated",
        rests: [{ passageId: "travel-3.2", phrase: "up to €160 per night" }],
        conflict: {
          topic: "the hotel limit",
          passageId: "faq-hotels",
          used: "€160",
          other: "€140",
        },
      },
      {
        id: "hotel-exception",
        text: "You can go over it when no hotel within the limit is free within 30 minutes of the venue.",
        grounding: "stated",
        rests: [
          {
            passageId: "travel-3.4",
            phrase: "If no hotel within the limit is free within 30 minutes of the venue",
          },
        ],
      },
      {
        id: "hotel-ceiling",
        text: "Your line manager can approve up to €200 a night.",
        grounding: "combined",
        rests: [
          { passageId: "travel-3.2", phrase: "€160" },
          { passageId: "travel-3.4", phrase: "up to 25% above the limit" },
        ],
        how: "€160 plus 25% is €200. No document gives the €200 figure.",
      },
      {
        id: "hotel-timing",
        text: "Approval usually takes a day or two.",
        grounding: "none",
        rests: [],
        why: "No document says how long approval takes. This is how such approvals usually go, not something I read.",
      },
    ],
    gaps: [
      {
        what: "Whether a team offsite counts as travel under this policy.",
        lookedIn: ["travel", "faq", "handbook"],
        closest: {
          passageId: "travel-1.1",
          whyNot:
            "It lists what the policy covers. Offsites are not on the list, and not ruled out either.",
        },
      },
    ],
  },
  {
    id: "abroad",
    question: "How many days can I work from abroad this year?",
    sentences: [
      {
        id: "abroad-days",
        text: "You can work from another country for up to 20 working days a year.",
        grounding: "stated",
        rests: [{ passageId: "abroad-2", phrase: "up to 20 working days per year" }],
      },
      {
        id: "abroad-split",
        text: "You can split the days across several stays.",
        grounding: "stated",
        rests: [{ passageId: "abroad-2", phrase: "can be split across several stays" }],
      },
      {
        id: "abroad-notice",
        text: "Tell People Ops at least 10 working days before you leave.",
        grounding: "stated",
        rests: [{ passageId: "abroad-4", phrase: "at least 10 working days before you leave" }],
      },
      {
        id: "abroad-carry",
        text: "Days you don't use carry over to next year.",
        grounding: "none",
        rests: [],
        why: "The guideline says nothing about unused days. I filled the gap with what many leave policies do.",
      },
    ],
    gaps: [],
    readAs: {
      phrase: "this year",
      as: "the calendar year",
      note: "The guideline says “per year”. It does not say whether that is the calendar year or twelve months from your first trip.",
    },
  },
  {
    id: "dinner",
    question: "What is the budget per person for a team dinner?",
    sentences: [],
    gaps: [
      {
        what: "A budget for team dinners.",
        lookedIn: ["travel", "faq", "handbook"],
        closest: {
          passageId: "travel-5.1",
          whyNot: "It is about meals while travelling, not team events. I have not answered from it.",
        },
      },
    ],
  },
];

export const GROUNDING_LABEL: Record<Grounding, string> = {
  stated: "A document says this",
  combined: "Worked out",
  none: "No source",
};

export const GROUNDINGS: Grounding[] = ["stated", "combined", "none"];

export function getDoc(id: string): Doc {
  const doc = DOCS.find((entry) => entry.id === id);
  if (!doc) throw new Error(`unknown document ${id}`);
  return doc;
}

export function getPassage(id: string): Passage {
  const passage = PASSAGES.find((entry) => entry.id === id);
  if (!passage) throw new Error(`unknown passage ${id}`);
  return passage;
}

export function getAnswer(id: string): Answer {
  const answer = ANSWERS.find((entry) => entry.id === id);
  if (!answer) throw new Error(`unknown answer ${id}`);
  return answer;
}

/** "Travel and expenses policy · 3.2" */
export function passageRef(passageId: string): string {
  const passage = getPassage(passageId);
  return `${getDoc(passage.docId).title} · ${passage.section}`;
}

export function countByGrounding(answer: Answer): Record<Grounding, number> {
  const counts: Record<Grounding, number> = { stated: 0, combined: 0, none: 0 };
  for (const sentence of answer.sentences) counts[sentence.grounding] += 1;
  return counts;
}

/** The one line a person reads before any sentence. */
export function headline(answer: Answer): string {
  const total = answer.sentences.length;
  if (total === 0) return "I couldn't find this. Nothing below is an answer.";

  const counts = countByGrounding(answer);
  const parts: string[] = [];
  if (counts.stated) {
    parts.push(`${counts.stated} ${counts.stated === 1 ? "says" : "say"} what a document says`);
  }
  if (counts.combined) {
    parts.push(`${counts.combined} ${counts.combined === 1 ? "is" : "are"} worked out`);
  }
  if (counts.none) {
    parts.push(`${counts.none} ${counts.none === 1 ? "has" : "have"} no source`);
  }

  let line = `${total} ${total === 1 ? "sentence" : "sentences"}: ${parts.join(", ")}.`;
  if (answer.gaps.length) {
    line += ` ${answer.gaps.length} ${
      answer.gaps.length === 1 ? "part" : "parts"
    } of your question I couldn't find.`;
  }
  return line;
}

/** The line under a sentence. It is words, so the mark never depends on colour alone. */
export function sourceLine(sentence: Sentence): string {
  if (sentence.grounding === "stated") return passageRef(sentence.rests[0].passageId);
  if (sentence.grounding === "combined") {
    return `Worked out from ${sentence.rests.length} passages. No document says it in one place.`;
  }
  return "No source. This is a guess.";
}

/** With "documents only" on, a guess is not shown as part of the answer. */
export function visibleSentences(answer: Answer, documentsOnly: boolean): Sentence[] {
  return documentsOnly
    ? answer.sentences.filter((sentence) => sentence.grounding !== "none")
    : answer.sentences;
}

export function hiddenCount(answer: Answer, documentsOnly: boolean): number {
  return answer.sentences.length - visibleSentences(answer, documentsOnly).length;
}

/**
 * What the system was unsure about, in the order a person should read it:
 * documents that disagree, guesses, its own arithmetic, old sources, how it read the
 * question, and what it did not find.
 */
export function concerns(answer: Answer): Concern[] {
  const list: Concern[] = [];

  for (const sentence of answer.sentences) {
    if (!sentence.conflict) continue;
    const usedDoc = getDoc(getPassage(sentence.rests[0].passageId).docId);
    const otherDoc = getDoc(getPassage(sentence.conflict.passageId).docId);
    list.push({
      id: `disagree-${sentence.id}`,
      kind: "disagree",
      sentenceId: sentence.id,
      text: `Two documents disagree on ${sentence.conflict.topic}. “${usedDoc.title}” says ${sentence.conflict.used}, “${otherDoc.title}” says ${sentence.conflict.other}. I used the one edited more recently (${months(usedDoc.editedMonthsAgo)} ago against ${months(otherDoc.editedMonthsAgo)}).`,
    });
  }

  for (const sentence of answer.sentences) {
    if (sentence.grounding !== "none") continue;
    list.push({
      id: `guess-${sentence.id}`,
      kind: "guess",
      sentenceId: sentence.id,
      text: `No source for “${sentence.text}” It is a guess.`,
    });
  }

  for (const sentence of answer.sentences) {
    if (sentence.grounding !== "combined") continue;
    list.push({
      id: `combined-${sentence.id}`,
      kind: "combined",
      sentenceId: sentence.id,
      text: `“${sentence.text}” is not written anywhere. I worked it out from ${sentence.rests.length} passages.`,
    });
  }

  const byDoc = new Map<string, Sentence[]>();
  for (const sentence of answer.sentences) {
    const docIds = new Set(sentence.rests.map((support) => getPassage(support.passageId).docId));
    for (const docId of docIds) {
      byDoc.set(docId, [...(byDoc.get(docId) ?? []), sentence]);
    }
  }
  for (const [docId, sentences] of byDoc) {
    const doc = getDoc(docId);
    if (doc.editedMonthsAgo < STALE_AFTER_MONTHS) continue;
    list.push({
      id: `old-${docId}`,
      kind: "old",
      sentenceId: sentences[0].id,
      text: `“${doc.title}” was last edited ${months(doc.editedMonthsAgo)} ago. ${sentences.length} ${
        sentences.length === 1 ? "sentence rests" : "sentences rest"
      } on it.`,
    });
  }

  if (answer.readAs) {
    list.push({
      id: "read-as",
      kind: "read-as",
      text: `I read “${answer.readAs.phrase}” as ${answer.readAs.as}. ${answer.readAs.note}`,
    });
  }

  answer.gaps.forEach((gap, index) => {
    list.push({ id: `gap-${index}`, kind: "gap", text: `Not found: ${lowerFirst(gap.what)}` });
  });

  return list;
}

function months(count: number): string {
  return `${count} ${count === 1 ? "month" : "months"}`;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Split a passage around the words a sentence rests on, for the highlight. */
export function splitAround(text: string, phrase: string): [string, string, string] {
  const at = text.indexOf(phrase);
  if (at === -1) return [text, "", ""];
  return [text.slice(0, at), phrase, text.slice(at + phrase.length)];
}
