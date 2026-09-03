import assert from "node:assert/strict";
import test from "node:test";
import {
  recoverPinnedPositions,
  type PinnedPositionRecoveryPersistencePort,
} from "../../../src/application/map/recover-pinned-positions.ts";
import { emptyPinnedState, type PinnedState } from "../../../src/product/map/pinned-positions.ts";

function persistence(
  saved: boolean,
): PinnedPositionRecoveryPersistencePort & { writes: PinnedState[] } {
  const writes: PinnedState[] = [];
  return {
    writes,
    recover: (state) => {
      writes.push(state);
      return saved;
    },
  };
}

test("pinned-position recovery persists the supplied normalized state through its dedicated port", () => {
  const state = {
    ...emptyPinnedState(),
    pinnedPositions: { "thought-a": { x: 48, y: -24 } },
  };
  const port = persistence(true);

  const result = recoverPinnedPositions(state, port);

  assert.deepEqual(result, { state, saved: true });
  assert.deepEqual(port.writes, [state]);
});

test("pinned-position recovery retains the supplied state when its rewrite cannot persist", () => {
  const state = emptyPinnedState();
  const port = persistence(false);

  const result = recoverPinnedPositions(state, port);

  assert.deepEqual(result, { state, saved: false });
  assert.deepEqual(port.writes, [state]);
});
