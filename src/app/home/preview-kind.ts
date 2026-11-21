/**
 * Drawings that live on the home cards. A registry row without one still
 * gets a plain plate, so a new experiment does not break the grid.
 */
export const DEDICATED_PREVIEWS = [
  "workflow-canvas",
  "usage-widget",
  "translation-trust",
  "knowledge-atlas",
  "keyword-tracker",
  "permission-rings",
] as const;

export type DedicatedPreview = (typeof DEDICATED_PREVIEWS)[number];

const dedicated = new Set<string>(DEDICATED_PREVIEWS);

export function previewKind(slug: string): "dedicated" | "fallback" {
  return dedicated.has(slug) ? "dedicated" : "fallback";
}

export function isDedicatedPreview(slug: string): slug is DedicatedPreview {
  return dedicated.has(slug);
}
