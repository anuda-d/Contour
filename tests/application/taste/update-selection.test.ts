import assert from "node:assert/strict";
import test from "node:test";
import {
  confirmSelection,
  toggleSelection,
  type SelectionPersistencePort,
} from "../../../src/application/taste/update-selection.ts";
import { emptySelection, type SelectionState } from "../../../src/product/taste/selection.ts";

const validIds = new Set(["a", "b", "c", "d"]);

function persistence(saved: boolean): SelectionPersistencePort & { writes: SelectionState[] } {
  const writes: SelectionState[] = [];
  return {
    writes,
    save: (state) => {
      writes.push(state);
      return saved;
    },
  };
}

test("selection changes persist through the application port with their product result", () => {
  const port = persistence(true);
  const result = toggleSelection(emptySelection(), "a", validIds, port);

  assert.deepEqual(result.state.selectedMediaIds, ["a"]);
  assert.equal(result.message, "1 of 3 selected.");
  assert.equal(result.saved, true);
  assert.deepEqual(port.writes, [result.state]);
});

test("rejected selection changes do not persist or replace their product messages", () => {
  const port = persistence(true);
  const selected: SelectionState = { ...emptySelection(), selectedMediaIds: ["a", "b", "c"] };

  const unavailable = toggleSelection(selected, "missing", validIds, port);
  const full = toggleSelection(selected, "d", validIds, port);

  assert.equal(unavailable.message, "That work is not available.");
  assert.equal(full.message, "Three works are already selected. Remove one to choose another.");
  assert.equal(unavailable.saved, null);
  assert.equal(full.saved, null);
  assert.deepEqual(port.writes, []);
});

test("a changed selection keeps its state but reports the visit-only fallback when persistence fails", () => {
  const result = toggleSelection(emptySelection(), "a", validIds, persistence(false));

  assert.deepEqual(result.state.selectedMediaIds, ["a"]);
  assert.equal(result.saved, false);
  assert.equal(result.message, "Selection saved for this visit only.");
});

test("incomplete confirmation does not persist or replace the exact product result", () => {
  const port = persistence(true);
  const result = confirmSelection(
    { ...emptySelection(), selectedMediaIds: ["a", "b"] },
    port,
  );

  assert.equal(result.confirmed, false);
  assert.equal(result.message, "Choose 1 more before continuing.");
  assert.equal(result.saved, null);
  assert.deepEqual(port.writes, []);
});

test("a complete confirmation persists the exact ready state and visit-only fallback", () => {
  const state: SelectionState = { ...emptySelection(), selectedMediaIds: ["a", "b", "c"] };
  const saved = confirmSelection(state, persistence(true));
  const unavailable = confirmSelection(state, persistence(false));

  assert.equal(saved.confirmed, true);
  assert.equal(saved.state.confirmed, true);
  assert.equal(saved.message, "Three works are ready for Thoughts.");
  assert.equal(saved.saved, true);
  assert.equal(unavailable.state.confirmed, true);
  assert.equal(unavailable.message, "Three works are ready for this visit.");
  assert.equal(unavailable.saved, false);
});
