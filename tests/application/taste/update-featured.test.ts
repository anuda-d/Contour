import assert from "node:assert/strict";
import test from "node:test";
import {
  toggleFeatured,
  type FeaturedPersistencePort,
} from "../../../src/application/taste/update-featured.ts";
import { createFeaturedState, type FeaturedState } from "../../../src/product/taste/featured.ts";

const eligibleIds = new Set(["book-a", "film-a", "book-b", "film-b"]);

function persistence(saved: boolean): FeaturedPersistencePort & { writes: FeaturedState[] } {
  const writes: FeaturedState[] = [];
  return {
    writes,
    save: (state) => {
      writes.push(state);
      return saved;
    },
  };
}

test("featured changes persist through the application port with their product result", () => {
  const port = persistence(true);
  const result = toggleFeatured(createFeaturedState([], eligibleIds), "book-a", eligibleIds, "Book A", port);

  assert.deepEqual(result.state.featuredMediaIds, ["book-a"]);
  assert.equal(result.message, "Book A is now featured.");
  assert.equal(result.saved, true);
  assert.deepEqual(port.writes, [result.state]);
});

test("rejected featured changes do not persist or replace their product messages", () => {
  const port = persistence(true);
  const fullState = createFeaturedState(["book-a", "film-a", "book-b"], eligibleIds);

  const unavailable = toggleFeatured(fullState, "private", eligibleIds, "Private", port);
  const full = toggleFeatured(fullState, "film-b", eligibleIds, "Film B", port);

  assert.equal(unavailable.message, "That work cannot be featured.");
  assert.equal(full.message, "Remove a featured work first.");
  assert.equal(unavailable.saved, null);
  assert.equal(full.saved, null);
  assert.deepEqual(port.writes, []);
});

test("a changed feature keeps its state but reports the visit-only fallback when persistence fails", () => {
  const result = toggleFeatured(
    createFeaturedState([], eligibleIds),
    "book-a",
    eligibleIds,
    "Book A",
    persistence(false),
  );

  assert.deepEqual(result.state.featuredMediaIds, ["book-a"]);
  assert.equal(result.saved, false);
  assert.equal(result.message, "Book A is now featured. This change will last for this visit.");
});
