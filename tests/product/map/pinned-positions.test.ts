import assert from "node:assert/strict";
import test from "node:test";
import {
  PINNED_VERSION,
  emptyPinnedState,
  normalizePinnedState,
  pinPosition,
  resolvePositions,
  unpinPosition,
} from "../../../src/product/map/pinned-positions.ts";

const validIds = new Set(["thought-a", "book-a", "draft-a"]);

test("pinned positions keep known finite coordinates and clamp them to the Map", () => {
  const normalized = normalizePinnedState(
    {
      version: 0,
      pinnedPositions: {
        "thought-a": { x: 34, y: -18 },
        "book-a": { x: 900, y: -900 },
        missing: { x: 2, y: 4 },
        "draft-a": { x: Number.NaN, y: 7 },
      },
    },
    validIds,
  );

  assert.deepEqual(normalized.state, {
    version: PINNED_VERSION,
    pinnedPositions: {
      "thought-a": { x: 34, y: -18 },
      "book-a": { x: 490, y: -310 },
    },
  });
  assert.equal(normalized.recovered, true);
});

test("pinned positions recover malformed containers, including a current-version envelope", () => {
  for (const pinnedPositions of [undefined, null, [], "invalid"]) {
    const normalized = normalizePinnedState(
      { version: PINNED_VERSION, pinnedPositions },
      validIds,
    );
    assert.deepEqual(normalized.state, emptyPinnedState());
    assert.equal(normalized.recovered, true);
  }
});

test("pin and unpin are immutable and reject unknown nodes", () => {
  const initial = emptyPinnedState();
  const pinned = pinPosition(initial, "thought-a", { x: 48, y: -24 }, validIds);
  assert.equal(pinned.changed, true);
  assert.deepEqual(initial, emptyPinnedState());
  assert.deepEqual(pinned.state.pinnedPositions["thought-a"], { x: 48, y: -24 });

  const rejected = pinPosition(pinned.state, "missing", { x: 1, y: 1 }, validIds);
  assert.strictEqual(rejected.state, pinned.state);
  assert.equal(rejected.changed, false);

  const unpinned = unpinPosition(pinned.state, "thought-a");
  assert.equal(unpinned.changed, true);
  assert.deepEqual(unpinned.state, emptyPinnedState());
  assert.deepEqual(pinned.state.pinnedPositions["thought-a"], { x: 48, y: -24 });
});

test("resolved positions prefer pins, then temporary movement, then generated layout", () => {
  const nodes = [{ id: "thought-a" }, { id: "book-a" }, { id: "draft-a" }];
  assert.deepEqual(
    resolvePositions(
      nodes,
      {
        "thought-a": { x: 1, y: 1 },
        "book-a": { x: 2, y: 2 },
        "draft-a": { x: 3, y: 3 },
      },
      {
        "thought-a": { x: 10, y: 10 },
        "book-a": { x: 20, y: 20 },
      },
      { "thought-a": { x: 100, y: 100 } },
    ),
    {
      "thought-a": { x: 100, y: 100 },
      "book-a": { x: 20, y: 20 },
      "draft-a": { x: 3, y: 3 },
    },
  );
});
