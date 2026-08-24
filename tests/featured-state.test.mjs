import test from "node:test";
import assert from "node:assert/strict";
import {
  FEATURED_LIMIT,
  FEATURED_STORAGE_KEY,
  FEATURED_VERSION,
  createFeaturedState,
  loadFeaturedState,
  normalizeFeaturedState,
  saveFeaturedState,
  toggleFeaturedMedia,
} from "../src/featured-state.js";

const eligibleIds = new Set(["book-a", "film-a", "book-b", "film-b"]);

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

test("featured state keeps ordered unique public Media and caps the prototype at three", () => {
  const normalized = normalizeFeaturedState(
    {
      version: FEATURED_VERSION,
      featuredMediaIds: ["book-a", "private", "book-a", "film-a", "book-b", "film-b"],
    },
    eligibleIds,
  );

  assert.deepEqual(normalized.state.featuredMediaIds, ["book-a", "film-a", "book-b"]);
  assert.equal(normalized.state.featuredMediaIds.length, FEATURED_LIMIT);
  assert.equal(normalized.recovered, true);
});

test("feature and remove preserve order and refuse a fourth work", () => {
  let state = createFeaturedState([], eligibleIds);
  for (const id of ["book-a", "film-a", "book-b"]) {
    const result = toggleFeaturedMedia(state, id, eligibleIds, id);
    assert.equal(result.changed, true);
    state = result.state;
  }

  const full = toggleFeaturedMedia(state, "film-b", eligibleIds, "Film B");
  assert.equal(full.changed, false);
  assert.equal(full.message, "Remove a featured work first.");
  assert.deepEqual(full.state.featuredMediaIds, ["book-a", "film-a", "book-b"]);

  const removed = toggleFeaturedMedia(state, "film-a", eligibleIds, "Film A");
  assert.equal(removed.changed, true);
  assert.deepEqual(removed.state.featuredMediaIds, ["book-a", "book-b"]);

  const replacement = toggleFeaturedMedia(removed.state, "film-b", eligibleIds, "Film B");
  assert.deepEqual(replacement.state.featuredMediaIds, ["book-a", "book-b", "film-b"]);
});

test("non-public Media cannot enter featured state", () => {
  const state = createFeaturedState(["book-a"], eligibleIds);
  const result = toggleFeaturedMedia(state, "private", eligibleIds);
  assert.equal(result.changed, false);
  assert.strictEqual(result.state, state);
});

test("missing storage starts from deliberate seed defaults while stored empty remains empty", () => {
  const storage = memoryStorage();
  const defaults = loadFeaturedState(storage, eligibleIds, ["book-a", "film-a"]);
  assert.deepEqual(defaults.state.featuredMediaIds, ["book-a", "film-a"]);
  assert.equal(defaults.persistent, true);

  storage.setItem(
    FEATURED_STORAGE_KEY,
    JSON.stringify({ version: FEATURED_VERSION, featuredMediaIds: [] }),
  );
  const empty = loadFeaturedState(storage, eligibleIds, ["book-a", "film-a"]);
  assert.deepEqual(empty.state.featuredMediaIds, []);
});

test("featured state round trips and corrupted data recovers to valid defaults", () => {
  const storage = memoryStorage();
  const state = createFeaturedState(["film-a", "book-a"], eligibleIds);
  assert.equal(saveFeaturedState(storage, state), true);
  assert.deepEqual(loadFeaturedState(storage, eligibleIds).state, state);

  storage.setItem(FEATURED_STORAGE_KEY, "not json");
  const recovered = loadFeaturedState(storage, eligibleIds, ["book-b"]);
  assert.deepEqual(recovered.state.featuredMediaIds, ["book-b"]);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.storageError, false);
});

test("unavailable storage falls back to visit-only defaults", () => {
  const broken = {
    getItem() {
      throw new Error("blocked");
    },
  };
  const loaded = loadFeaturedState(broken, eligibleIds, ["book-a"]);
  assert.deepEqual(loaded.state.featuredMediaIds, ["book-a"]);
  assert.equal(loaded.persistent, false);
  assert.equal(loaded.storageError, true);
  assert.equal(saveFeaturedState(null, loaded.state), false);
});
