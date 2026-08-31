import {
  emptyPinnedState,
  normalizePinnedState,
  type PinnedState,
} from "../../product/map/pinned-positions.ts";

export const PINNED_STORAGE_KEY = "thought-map.prototype.pinned-positions.v1";

export type PinnedStorage = Readonly<{
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}>;

export type PinnedLoadResult = Readonly<{
  state: PinnedState;
  persistent: boolean;
  recovered: boolean;
  storageError: boolean;
}>;

export function loadPinnedState(
  storage: PinnedStorage | null | undefined,
  validIds: Iterable<string>,
): PinnedLoadResult {
  if (!storage) {
    return {
      state: emptyPinnedState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  let stored: string | null;
  try {
    stored = storage.getItem(PINNED_STORAGE_KEY);
  } catch {
    return {
      state: emptyPinnedState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  if (!stored) {
    return {
      state: emptyPinnedState(),
      persistent: true,
      recovered: false,
      storageError: false,
    };
  }

  try {
    const normalized = normalizePinnedState(JSON.parse(stored) as unknown, validIds);
    return { ...normalized, persistent: true, storageError: false };
  } catch {
    return {
      state: emptyPinnedState(),
      persistent: true,
      recovered: true,
      storageError: false,
    };
  }
}

export function savePinnedState(
  storage: PinnedStorage | null | undefined,
  state: PinnedState,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(PINNED_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
