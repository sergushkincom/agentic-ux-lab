export const STEP_VALUES = [1, 2, 3] as const;
export const FRAME_WIDTH_VALUES = [320, 360, 768, 1280] as const;
export const PICKER_VALUES = ["open", "closed"] as const;

export type PrototypeStep = (typeof STEP_VALUES)[number];
export type PrototypeFrameWidth = (typeof FRAME_WIDTH_VALUES)[number];
export type PrototypePickerState = (typeof PICKER_VALUES)[number];

export type PrototypeState = {
  step: PrototypeStep;
  picker: PrototypePickerState;
  width: PrototypeFrameWidth;
};

export const DEFAULT_STATE: PrototypeState = {
  step: 1,
  picker: "closed",
  width: 360,
};

type NormalizableStateInput = {
  step?: number;
  picker?: string;
  width?: number;
};

function isStep(value: number): value is PrototypeStep {
  return STEP_VALUES.includes(value as PrototypeStep);
}

function isPickerState(value: string): value is PrototypePickerState {
  return PICKER_VALUES.includes(value as PrototypePickerState);
}

function isFrameWidth(value: number): value is PrototypeFrameWidth {
  return FRAME_WIDTH_VALUES.includes(value as PrototypeFrameWidth);
}

export function normalizeState(input: NormalizableStateInput): PrototypeState {
  const step = input.step ?? DEFAULT_STATE.step;
  const picker = input.picker ?? DEFAULT_STATE.picker;
  const width = input.width ?? DEFAULT_STATE.width;

  return {
    step: isStep(step) ? step : DEFAULT_STATE.step,
    picker: isPickerState(picker) ? picker : DEFAULT_STATE.picker,
    width: isFrameWidth(width) ? width : DEFAULT_STATE.width,
  };
}

export function parseStateFromSearch(search: string | URLSearchParams): PrototypeState {
  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const stepParam = Number(params.get("step"));
  const pickerParam = params.get("picker") ?? "";
  const widthParam = Number(params.get("w"));

  return normalizeState({
    step: Number.isInteger(stepParam) ? stepParam : undefined,
    picker: pickerParam,
    width: Number.isInteger(widthParam) ? widthParam : undefined,
  });
}

export function serializeStateToSearch(state: PrototypeState): string {
  const normalized = normalizeState(state);
  const params = new URLSearchParams();
  params.set("step", String(normalized.step));
  params.set("picker", normalized.picker);
  params.set("w", String(normalized.width));
  return params.toString();
}

export function formatStateChip(state: PrototypeState): string {
  const normalized = normalizeState(state);
  return `Step ${normalized.step} · picker ${normalized.picker} · ${normalized.width} px`;
}
