import assert from "node:assert/strict";
import test from "node:test";
import {
  recoverFeatured,
  type FeaturedRecoveryPersistencePort,
} from "../../../src/application/taste/recover-featured.ts";
import { createFeaturedState, type FeaturedState } from "../../../src/product/taste/featured.ts";

function persistence(saved: boolean): FeaturedRecoveryPersistencePort & { writes: FeaturedState[] } {
  const writes: FeaturedState[] = [];
  return {
    writes,
    recover: (state) => {
      writes.push(state);
      return saved;
    },
  };
}

test("featured-Media startup recovery writes the normalized state through its narrow port", () => {
  const state = createFeaturedState(["book-a", "film-a"], ["book-a", "film-a"]);
  const port = persistence(true);

  const result = recoverFeatured(state, port);

  assert.deepEqual(result, { state, saved: true });
  assert.deepEqual(port.writes, [state]);
});

test("featured-Media startup recovery preserves the normalized visit state when its write fails", () => {
  const state = createFeaturedState(["book-a"], ["book-a"]);
  const port = persistence(false);

  const result = recoverFeatured(state, port);

  assert.deepEqual(result, { state, saved: false });
  assert.deepEqual(port.writes, [state]);
});
