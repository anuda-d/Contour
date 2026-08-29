import {
  emptySelection,
  normalizeSelection,
  type SelectionState,
} from "../../product/taste/selection.ts";

export const SELECTION_STORAGE_KEY = "thought-map.prototype.media-selection.v1";

export type SelectionStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type SelectionLoadResult = {
  state: SelectionState;
  persistent: boolean;
  recovered: boolean;
  storageError: boolean;
};

export function loadSelection(
  storage: SelectionStorage | null | undefined,
  validIds: Iterable<string> | ReadonlySet<string>,
): SelectionLoadResult {
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
    const normalized = normalizeSelection(JSON.parse(stored) as unknown, validIds);
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

export function saveSelection(
  storage: SelectionStorage | null | undefined,
  state: SelectionState,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
