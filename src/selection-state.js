export const SELECTION_VERSION = 1;
export const SELECTION_LIMIT = 3;
export const SELECTION_STORAGE_KEY = "thought-map.prototype.media-selection.v1";

export function emptySelection() {
  return {
    version: SELECTION_VERSION,
    selectedMediaIds: [],
    confirmed: false,
  };
}

export function normalizeSelection(value, validIds) {
  const validIdSet = validIds instanceof Set ? validIds : new Set(validIds);
  const sourceIds = Array.isArray(value?.selectedMediaIds) ? value.selectedMediaIds : [];
  const selectedMediaIds = [];

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

  const confirmed = value?.confirmed === true && selectedMediaIds.length === SELECTION_LIMIT;
  const recovered =
    value?.version !== SELECTION_VERSION ||
    sourceIds.length !== selectedMediaIds.length ||
    sourceIds.some((id, index) => id !== selectedMediaIds[index]) ||
    value?.confirmed === true && !confirmed;

  return {
    state: { version: SELECTION_VERSION, selectedMediaIds, confirmed },
    recovered,
  };
}

export function loadSelection(storage, validIds) {
  if (!storage) {
    return {
      state: emptySelection(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  try {
    const stored = storage.getItem(SELECTION_STORAGE_KEY);
    if (!stored) {
      return {
        state: emptySelection(),
        persistent: true,
        recovered: false,
        storageError: false,
      };
    }
    const normalized = normalizeSelection(JSON.parse(stored), validIds);
    return { ...normalized, persistent: true, storageError: false };
  } catch {
    return {
      state: emptySelection(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }
}

export function saveSelection(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function toggleMediaSelection(state, id, validIds) {
  const validIdSet = validIds instanceof Set ? validIds : new Set(validIds);
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

export function confirmSelection(state) {
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
