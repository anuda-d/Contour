import test from "node:test";
import assert from "node:assert/strict";
import {
  SELECTION_STORAGE_KEY,
  confirmSelection,
  emptySelection,
  loadSelection,
  normalizeSelection,
  saveSelection,
  toggleMediaSelection,
} from "../src/selection-state.js";

const validIds = new Set(["a", "b", "c", "d"]);

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

test("selection toggles, deduplicates, and refuses a fourth work", () => {
  let state = emptySelection();
  for (const id of ["a", "b", "c"]) {
    state = toggleMediaSelection(state, id, validIds).state;
  }

  assert.deepEqual(state.selectedMediaIds, ["a", "b", "c"]);
  const blocked = toggleMediaSelection(state, "d", validIds);
  assert.equal(blocked.changed, false);
  assert.deepEqual(blocked.state, state);
  assert.match(blocked.message, /Remove one/);

  const removed = toggleMediaSelection(state, "b", validIds);
  assert.deepEqual(removed.state.selectedMediaIds, ["a", "c"]);
});

test("confirmation requires exactly three selected works", () => {
  const incomplete = confirmSelection({ ...emptySelection(), selectedMediaIds: ["a", "b"] });
  assert.equal(incomplete.confirmed, false);
  assert.equal(incomplete.state.confirmed, false);

  const ready = confirmSelection({ ...emptySelection(), selectedMediaIds: ["a", "b", "c"] });
  assert.equal(ready.confirmed, true);
  assert.equal(ready.state.confirmed, true);
});

test("normalization removes unknown, duplicate, and excess ids", () => {
  const normalized = normalizeSelection(
    {
      version: 0,
      selectedMediaIds: ["a", "unknown", "a", "b", "c", "d"],
      confirmed: true,
    },
    validIds,
  );
  assert.deepEqual(normalized.state.selectedMediaIds, ["a", "b", "c"]);
  assert.equal(normalized.state.confirmed, true);
  assert.equal(normalized.recovered, true);
});

test("selection persistence round-trips a confirmed set", () => {
  const storage = new MemoryStorage();
  const state = { ...emptySelection(), selectedMediaIds: ["a", "b", "c"], confirmed: true };
  assert.equal(saveSelection(storage, state), true);
  assert.equal(storage.values.has(SELECTION_STORAGE_KEY), true);
  assert.deepEqual(loadSelection(storage, validIds), {
    state,
    persistent: true,
    recovered: false,
    storageError: false,
  });
});

test("unavailable storage falls back to a safe session state", () => {
  const storage = {
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
