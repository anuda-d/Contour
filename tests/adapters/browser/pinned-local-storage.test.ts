import assert from "node:assert/strict";
import test from "node:test";
import {
  PINNED_STORAGE_KEY,
  createPinnedPositionPersistencePort,
  loadPinnedState,
  savePinnedState,
} from "../../../src/adapters/browser/pinned-local-storage.ts";
import type { KeyValueStoragePort } from "../../../src/kernel/key-value-storage.ts";
import { emptyPinnedState, pinPosition } from "../../../src/product/map/pinned-positions.ts";

const validIds = new Set(["thought-a", "book-a", "draft-a"]);

function memoryStorage(initial: Record<string, string> = {}): KeyValueStoragePort {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

test("pinned positions round trip through their V1 browser adapter", () => {
  const storage = memoryStorage();
  const state = pinPosition(
    emptyPinnedState(),
    "book-a",
    { x: -80, y: 42 },
    validIds,
  ).state;

  assert.equal(savePinnedState(storage, state), true);
  assert.match(storage.getItem(PINNED_STORAGE_KEY) ?? "", /book-a/);
  assert.deepEqual(loadPinnedState(storage, validIds), {
    state,
    persistent: true,
    recovered: false,
    storageError: false,
  });
});

test("pinned positions distinguish missing keys, malformed payloads, and unavailable storage", () => {
  assert.deepEqual(loadPinnedState(memoryStorage(), validIds), {
    state: emptyPinnedState(),
    persistent: true,
    recovered: false,
    storageError: false,
  });

  const corrupt = memoryStorage({ [PINNED_STORAGE_KEY]: "not json" });
  assert.deepEqual(loadPinnedState(corrupt, validIds), {
    state: emptyPinnedState(),
    persistent: true,
    recovered: true,
    storageError: false,
  });

  assert.deepEqual(loadPinnedState(null, validIds), {
    state: emptyPinnedState(),
    persistent: false,
    recovered: false,
    storageError: true,
  });
});

test("pinned adapter recovers read failures and reports write failures without throwing", () => {
  const state = emptyPinnedState();
  const readFailure: KeyValueStoragePort = {
    getItem: () => {
      throw new Error("storage blocked");
    },
    setItem: () => undefined,
  };
  const writeFailure: KeyValueStoragePort = {
    getItem: () => null,
    setItem: () => {
      throw new Error("quota reached");
    },
  };

  assert.deepEqual(loadPinnedState(readFailure, validIds), {
    state,
    persistent: false,
    recovered: false,
    storageError: true,
  });
  assert.equal(savePinnedState(writeFailure, state), false);
  assert.equal(savePinnedState(null, state), false);
});

test("pinned-position persistence port preserves adapter write outcomes", () => {
  const state = emptyPinnedState();
  const storage = memoryStorage();

  assert.equal(createPinnedPositionPersistencePort(storage).save(state), true);
  assert.equal(createPinnedPositionPersistencePort(null).save(state), false);
  assert.equal(storage.getItem(PINNED_STORAGE_KEY), JSON.stringify(state));
});
