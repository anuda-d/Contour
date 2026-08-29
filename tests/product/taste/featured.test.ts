import test from "node:test";
import assert from "node:assert/strict";
import {
  FEATURED_LIMIT,
  FEATURED_VERSION,
  createFeaturedState,
  normalizeFeaturedState,
  toggleFeaturedMedia,
} from "../../../src/product/taste/featured.ts";

const eligibleIds = new Set(["book-a", "film-a", "book-b", "film-b"]);

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

test("a current-version envelope without an id array remains an empty deliberate choice", () => {
  assert.deepEqual(normalizeFeaturedState({ version: 1, featuredMediaIds: null }, eligibleIds), {
    state: createFeaturedState([], eligibleIds),
    recovered: false,
  });
});
