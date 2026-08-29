export const SELECTION_VERSION = 1;
export const SELECTION_LIMIT = 3;

export type SelectionState = {
  version: typeof SELECTION_VERSION;
  selectedMediaIds: string[];
  confirmed: boolean;
};

export type SelectionNormalization = {
  state: SelectionState;
  recovered: boolean;
};

export type SelectionChange = {
  state: SelectionState;
  changed: boolean;
  message: string;
};

export type SelectionConfirmation = {
  state: SelectionState;
  confirmed: boolean;
  message: string;
};

type ValidIds = Iterable<string> | ReadonlySet<string>;

function toValidIdSet(validIds: ValidIds): ReadonlySet<string> {
  return validIds instanceof Set ? validIds : new Set(validIds);
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function emptySelection(): SelectionState {
  return {
    version: SELECTION_VERSION,
    selectedMediaIds: [],
    confirmed: false,
  };
}

export function normalizeSelection(value: unknown, validIds: ValidIds): SelectionNormalization {
  const source = recordValue(value);
  const validIdSet = toValidIdSet(validIds);
  const sourceIds: unknown[] = Array.isArray(source?.selectedMediaIds)
    ? source.selectedMediaIds
    : [];
  const selectedMediaIds: string[] = [];

  sourceIds.forEach((id) => {
    if (
      typeof id === "string" &&
      validIdSet.has(id) &&
      !selectedMediaIds.includes(id) &&
      selectedMediaIds.length < SELECTION_LIMIT
    ) {
      selectedMediaIds.push(id);
    }
  });

  const confirmed = source?.confirmed === true && selectedMediaIds.length === SELECTION_LIMIT;
  const recovered =
    source?.version !== SELECTION_VERSION ||
    sourceIds.length !== selectedMediaIds.length ||
    sourceIds.some((id, index) => id !== selectedMediaIds[index]) ||
    source?.confirmed === true && !confirmed;

  return {
    state: { version: SELECTION_VERSION, selectedMediaIds, confirmed },
    recovered,
  };
}

export function toggleMediaSelection(
  state: SelectionState,
  id: string,
  validIds: ValidIds,
): SelectionChange {
  const validIdSet = toValidIdSet(validIds);
  if (!validIdSet.has(id)) {
    return { state, changed: false, message: "That work is not available." };
  }

  if (state.selectedMediaIds.includes(id)) {
    return {
      state: {
        ...state,
        selectedMediaIds: state.selectedMediaIds.filter((selectedId) => selectedId !== id),
        confirmed: false,
      },
      changed: true,
      message: "Work removed.",
    };
  }

  if (state.selectedMediaIds.length >= SELECTION_LIMIT) {
    return {
      state,
      changed: false,
      message: "Three works are already selected. Remove one to choose another.",
    };
  }

  const selectedMediaIds = [...state.selectedMediaIds, id];
  return {
    state: { ...state, selectedMediaIds, confirmed: false },
    changed: true,
    message:
      selectedMediaIds.length === SELECTION_LIMIT
        ? "Three works selected. Continue when this set feels right."
        : `${selectedMediaIds.length} of ${SELECTION_LIMIT} selected.`,
  };
}

export function confirmSelection(state: SelectionState): SelectionConfirmation {
  if (state.selectedMediaIds.length !== SELECTION_LIMIT) {
    return {
      state,
      confirmed: false,
      message: `Choose ${SELECTION_LIMIT - state.selectedMediaIds.length} more before continuing.`,
    };
  }

  return {
    state: { ...state, confirmed: true },
    confirmed: true,
    message: "Three works are ready for Thoughts.",
  };
}
