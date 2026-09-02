import {
  emptySelection,
  normalizeSelection,
  type SelectionState,
} from "../../product/taste/selection.ts";
import type { SelectionPersistencePort } from "../../application/taste/update-selection.ts";
import type { SelectionRecoveryPersistencePort } from "../../application/taste/recover-selection.ts";
import type { KeyValueStoragePort } from "../../kernel/key-value-storage.ts";

export const SELECTION_STORAGE_KEY = "thought-map.prototype.media-selection.v1";

export type SelectionLoadResult = {
  state: SelectionState;
  persistent: boolean;
  recovered: boolean;
  storageError: boolean;
};

export function loadSelection(
  storage: KeyValueStoragePort | null | undefined,
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
  storage: KeyValueStoragePort | null | undefined,
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

export function createSelectionPersistencePort(
  storage: KeyValueStoragePort | null | undefined,
): SelectionPersistencePort {
  return {
    save: (state) => saveSelection(storage, state),
  };
}

/**
 * Adapts the existing same-key normalized selection rewrite to the narrowly
 * scoped startup recovery use case without exposing browser storage inward.
 */
export function createSelectionRecoveryPersistencePort(
  storage: KeyValueStoragePort | null | undefined,
): SelectionRecoveryPersistencePort {
  return {
    recover: (state) => saveSelection(storage, state),
  };
}
