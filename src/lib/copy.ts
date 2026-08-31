export type WindowLabel = "Session" | "Weekly";

export const WINDOW_SHORT = {
  session: "5h",
  weekly: "7d",
} as const;

export const copy = {
  advisory: "Medium effort would last past the reset.",
  effortLabel: "Effort",
  windowShort: WINDOW_SHORT,
} as const;
