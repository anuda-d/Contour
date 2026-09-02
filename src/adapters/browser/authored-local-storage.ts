import {
  emptyDraftState,
  mergeDraftStates,
  migrateLegacyDraftState,
  normalizeDraftState,
  type ThoughtMutation,
  type ThoughtState,
} from "../../product/authorship/draft-state.ts";
import type { KeyValueStoragePort } from "../../kernel/key-value-storage.ts";
import type { AuthoredThoughtReloadPort } from "../../application/authorship/reload-authored-thoughts.ts";
import type { AuthoredThoughtPersistencePort } from "../../application/authorship/authored-thought-persistence.ts";

export const THOUGHT_STORAGE_KEY = "thought-map.prototype.authored-thoughts.v2";
export const THOUGHT_V1_STORAGE_KEY = "thought-map.prototype.authored-thoughts.v1";
export const DRAFT_VERSION = 1;
export const DRAFT_STORAGE_KEY = "thought-map.prototype.drafts.v1";

type MediaIds = ReadonlySet<string> | Iterable<string>;
export type AuthoredThoughtLoadResult = {
  state: ThoughtState;
  persistent: boolean;
  recovered: boolean;
  storageError: boolean;
  migrated?: boolean;
  recoveryNotice?: boolean;
};

export function loadDraftState(
  storage: KeyValueStoragePort | null,
  validMediaIds: MediaIds,
): AuthoredThoughtLoadResult {
  if (!storage) return { state: emptyDraftState(), persistent: false, recovered: false, storageError: true };
  try {
    const stored = storage.getItem(THOUGHT_STORAGE_KEY);
    if (stored !== null) {
      try {
        const normalized = normalizeDraftState(JSON.parse(stored), validMediaIds);
        return { ...normalized, persistent: true, storageError: false, migrated: false };
      } catch {
        return { state: emptyDraftState(), persistent: true, recovered: true, storageError: false, migrated: false, recoveryNotice: true };
      }
    }
    const priorLifecycle = storage.getItem(THOUGHT_V1_STORAGE_KEY);
    if (priorLifecycle !== null) {
      try {
        const normalized = normalizeDraftState(JSON.parse(priorLifecycle), validMediaIds);
        return { ...normalized, persistent: true, storageError: false, migrated: true };
      } catch {
        return { state: emptyDraftState(), persistent: true, recovered: true, storageError: false, migrated: true, recoveryNotice: true };
      }
    }
    const legacy = storage.getItem(DRAFT_STORAGE_KEY);
    if (legacy === null) return { state: emptyDraftState(), persistent: true, recovered: false, storageError: false, migrated: false, recoveryNotice: false };
    try {
      return { ...migrateLegacyDraftState(JSON.parse(legacy), validMediaIds), persistent: true, storageError: false };
    } catch {
      return { state: emptyDraftState(), persistent: true, recovered: true, storageError: false, migrated: true, recoveryNotice: true };
    }
  } catch {
    return { state: emptyDraftState(), persistent: false, recovered: false, storageError: true };
  }
}

/**
 * Adapts browser-backed authored Thought storage to the narrowly scoped reload
 * use case without exposing localStorage or persistence recovery details inward.
 */
export function createAuthoredThoughtReloadPort(
  storage: KeyValueStoragePort | null,
  validMediaIds: MediaIds,
): AuthoredThoughtReloadPort {
  return {
    load: () => {
      const loaded = loadDraftState(storage, validMediaIds);
      return loaded.storageError
        ? { kind: "storage-unavailable" }
        : { kind: "loaded", state: loaded.state };
    },
  };
}

/**
 * Adapts authored Thought read-merge-write storage to the publication use case
 * without exposing browser storage inward.
 */
export function createAuthoredThoughtPersistencePort(
  storage: KeyValueStoragePort | null,
  validMediaIds: MediaIds,
): AuthoredThoughtPersistencePort {
  return {
    save: (state, mutation) => persistDraftState(storage, state, validMediaIds, mutation),
  };
}

export function persistDraftState(
  storage: KeyValueStoragePort | null,
  state: ThoughtState,
  validMediaIds: MediaIds,
  mutation: ThoughtMutation | null = null,
) {
  if (!storage) return { saved: false, state };
  try {
    const stored = storage.getItem(THOUGHT_STORAGE_KEY);
    let current = emptyDraftState();
    if (stored !== null) {
      try { current = normalizeDraftState(JSON.parse(stored), validMediaIds).state; } catch { current = emptyDraftState(); }
    }
    const merged = mergeDraftStates(current, state, mutation);
    storage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify(merged));
    return { saved: true, state: merged };
  } catch {
    return { saved: false, state };
  }
}
