import assert from "node:assert/strict";
import test from "node:test";
import {
  recoverSelection,
  type SelectionRecoveryPersistencePort,
} from "../../../src/application/taste/recover-selection.ts";
import { emptySelection, type SelectionState } from "../../../src/product/taste/selection.ts";

function persistence(saved: boolean): SelectionRecoveryPersistencePort & { writes: SelectionState[] } {
  const writes: SelectionState[] = [];
  return {
    writes,
    recover: (state) => {
      writes.push(state);
      return saved;
    },
  };
}

test("selection startup recovery writes the normalized state through its narrow port", () => {
  const state: SelectionState = {
    ...emptySelection(),
    selectedMediaIds: ["a", "b", "c"],
    confirmed: true,
  };
  const port = persistence(true);

  const result = recoverSelection(state, port);

  assert.deepEqual(result, { state, saved: true });
  assert.deepEqual(port.writes, [state]);
});

test("selection startup recovery preserves the normalized visit state when its write fails", () => {
  const state: SelectionState = { ...emptySelection(), selectedMediaIds: ["a"] };
  const port = persistence(false);

  const result = recoverSelection(state, port);

  assert.deepEqual(result, { state, saved: false });
  assert.deepEqual(port.writes, [state]);
});
