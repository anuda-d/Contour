import test from "node:test";
import assert from "node:assert/strict";
import {
  FEATURED_STORAGE_KEY,
  createFeaturedPersistencePort,
  createFeaturedRecoveryPersistencePort,
  loadFeaturedState,
  saveFeaturedState,
} from "../../../src/adapters/browser/featured-local-storage.ts";
import type { KeyValueStoragePort } from "../../../src/kernel/key-value-storage.ts";
import {
  FEATURED_VERSION,
  createFeaturedState,
  type FeaturedState,
} from "../../../src/product/taste/featured.ts";

const eligibleIds = new Set(["book-a", "film-a", "book-b", "film-b"]);

class MemoryStorage implements KeyValueStoragePort {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("missing storage starts from seed defaults while an explicit empty list remains empty", () => {
  const storage = new MemoryStorage();
  const defaults = loadFeaturedState(storage, eligibleIds, ["book-a", "film-a"]);
  assert.deepEqual(defaults.state.featuredMediaIds, ["book-a", "film-a"]);
  assert.deepEqual(defaults, {
    state: createFeaturedState(["book-a", "film-a"], eligibleIds),
    persistent: true,
    recovered: false,
    storageError: false,
  });

  storage.setItem(
    FEATURED_STORAGE_KEY,
    JSON.stringify({ version: FEATURED_VERSION, featuredMediaIds: [] }),
  );
  assert.deepEqual(loadFeaturedState(storage, eligibleIds, ["book-a", "film-a"]).state, {
    version: FEATURED_VERSION,
    featuredMediaIds: [],
  });
});

test("featured state round-trips and corrupted data recovers to valid defaults", () => {
  const storage = new MemoryStorage();
  const state: FeaturedState = createFeaturedState(["film-a", "book-a"], eligibleIds);
  assert.equal(saveFeaturedState(storage, state), true);
  assert.deepEqual(loadFeaturedState(storage, eligibleIds).state, state);

  storage.setItem(FEATURED_STORAGE_KEY, "not json");
  assert.deepEqual(loadFeaturedState(storage, eligibleIds, ["book-b"]), {
    state: createFeaturedState(["book-b"], eligibleIds),
    persistent: true,
    recovered: true,
    storageError: false,
  });
});

test("unavailable storage falls back to visit-only defaults", () => {
  const storage: KeyValueStoragePort = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };
  const expected = createFeaturedState(["book-a"], eligibleIds);
  assert.deepEqual(loadFeaturedState(storage, eligibleIds, ["book-a"]), {
    state: expected,
    persistent: false,
    recovered: false,
    storageError: true,
  });
  assert.equal(saveFeaturedState(null, expected), false);
  assert.equal(saveFeaturedState(storage, expected), false);
});

test("featured persistence port preserves adapter write outcomes", () => {
  const state = createFeaturedState(["book-a"], eligibleIds);
  const storage = new MemoryStorage();

  assert.equal(createFeaturedPersistencePort(storage).save(state), true);
  assert.equal(createFeaturedPersistencePort(null).save(state), false);
  assert.equal(storage.values.get(FEATURED_STORAGE_KEY), JSON.stringify(state));
});

test("featured recovery persistence port performs the canonical same-key rewrite", () => {
  const state = createFeaturedState(["film-a", "book-a"], eligibleIds);
  const storage = new MemoryStorage();

  assert.equal(createFeaturedRecoveryPersistencePort(storage).recover(state), true);
  assert.equal(createFeaturedRecoveryPersistencePort(null).recover(state), false);
  assert.equal(storage.values.size, 1);
  assert.equal(storage.values.get(FEATURED_STORAGE_KEY), JSON.stringify(state));
});

test("featured recovery persistence port preserves write failure as a false outcome", () => {
  const state = createFeaturedState(["book-a"], eligibleIds);
  const storage: KeyValueStoragePort = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error("blocked");
    },
  };

  assert.equal(createFeaturedRecoveryPersistencePort(storage).recover(state), false);
});
