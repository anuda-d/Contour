import test from "node:test";
import assert from "node:assert/strict";
import {
  SELECTION_STORAGE_KEY,
  createSelectionPersistencePort,
  createSelectionRecoveryPersistencePort,
  loadSelection,
  saveSelection,
} from "../../../src/adapters/browser/selection-local-storage.ts";
import type { KeyValueStoragePort } from "../../../src/kernel/key-value-storage.ts";
import { emptySelection, type SelectionState } from "../../../src/product/taste/selection.ts";

const validIds = new Set(["a", "b", "c", "d"]);

class MemoryStorage implements KeyValueStoragePort {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("selection persistence round-trips a confirmed set", () => {
  const storage = new MemoryStorage();
  const state: SelectionState = {
    ...emptySelection(),
    selectedMediaIds: ["a", "b", "c"],
    confirmed: true,
  };
  assert.equal(saveSelection(storage, state), true);
  assert.equal(storage.values.has(SELECTION_STORAGE_KEY), true);
  assert.deepEqual(loadSelection(storage, validIds), {
    state,
    persistent: true,
    recovered: false,
    storageError: false,
  });
});

test("missing and malformed storage retain their distinct selection recovery behavior", () => {
  const storage = new MemoryStorage();
  assert.deepEqual(loadSelection(storage, validIds), {
    state: emptySelection(),
    persistent: true,
    recovered: false,
    storageError: false,
  });

  storage.setItem(SELECTION_STORAGE_KEY, "not json");
  assert.deepEqual(loadSelection(storage, validIds), {
    state: emptySelection(),
    persistent: false,
    recovered: false,
    storageError: true,
  });
});

test("unavailable storage falls back to a safe session state", () => {
  const storage: KeyValueStoragePort = {
    getItem() {
      throw new Error("unavailable");
    },
    setItem() {
      throw new Error("unavailable");
    },
  };
  assert.deepEqual(loadSelection(storage, validIds), {
    state: emptySelection(),
    persistent: false,
    recovered: false,
    storageError: true,
  });
  assert.equal(saveSelection(storage, emptySelection()), false);
});

test("selection persistence port preserves the adapter write outcome", () => {
  const storage = new MemoryStorage();
  const state = { ...emptySelection(), selectedMediaIds: ["a"] };

  assert.equal(createSelectionPersistencePort(storage).save(state), true);
  assert.equal(storage.values.get(SELECTION_STORAGE_KEY), JSON.stringify(state));
  assert.equal(createSelectionPersistencePort(null).save(state), false);
});

test("selection recovery persistence rewrites normalized state through the existing key", () => {
  const storage = new MemoryStorage();
  storage.setItem(
    SELECTION_STORAGE_KEY,
    JSON.stringify({
      version: 0,
      selectedMediaIds: ["a", "missing", "a", "b", "c", "d"],
      confirmed: true,
    }),
  );
  const loaded = loadSelection(storage, validIds);

  assert.equal(loaded.recovered, true);
  assert.deepEqual(loaded.state, {
    ...emptySelection(),
    selectedMediaIds: ["a", "b", "c"],
    confirmed: true,
  });
  assert.equal(createSelectionRecoveryPersistencePort(storage).recover(loaded.state), true);
  assert.equal(storage.values.get(SELECTION_STORAGE_KEY), JSON.stringify(loaded.state));
  assert.deepEqual(loadSelection(storage, validIds), {
    state: loaded.state,
    persistent: true,
    recovered: false,
    storageError: false,
  });
  assert.equal(createSelectionRecoveryPersistencePort(null).recover(loaded.state), false);
});
