import test from "node:test";
import assert from "node:assert/strict";
import {
  SELECTION_LIMIT,
  confirmSelection,
  emptySelection,
  normalizeSelection,
  toggleMediaSelection,
} from "../../../src/product/taste/selection.ts";

const validIds = new Set(["a", "b", "c", "d"]);

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
  assert.equal(SELECTION_LIMIT, 3);
});

test("a current-version envelope without an id array stays canonical without recovery", () => {
  assert.deepEqual(normalizeSelection({ version: 1, selectedMediaIds: null }, validIds), {
    state: emptySelection(),
    recovered: false,
  });
});
