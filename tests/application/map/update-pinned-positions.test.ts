import assert from "node:assert/strict";
import test from "node:test";
import {
  pinPosition,
  unpinPosition,
  type PinnedPositionPersistencePort,
} from "../../../src/application/map/update-pinned-positions.ts";
import { emptyPinnedState, type PinnedState } from "../../../src/product/map/pinned-positions.ts";

const validIds = new Set(["thought-a", "book-a"]);

function persistence(saved: boolean): PinnedPositionPersistencePort & { writes: PinnedState[] } {
  const writes: PinnedState[] = [];
  return {
    writes,
    save: (state) => {
      writes.push(state);
      return saved;
    },
  };
}

test("changed pins and unpins persist through the application port with product messages", () => {
  const port = persistence(true);
  const pinned = pinPosition(emptyPinnedState(), "thought-a", { x: 48, y: -24 }, validIds, port);

  assert.deepEqual(pinned.state.pinnedPositions["thought-a"], { x: 48, y: -24 });
  assert.equal(pinned.message, "Position pinned.");
  assert.equal(pinned.saved, true);
  assert.deepEqual(port.writes, [pinned.state]);

  const unpinned = unpinPosition(pinned.state, "thought-a", port);
  assert.deepEqual(unpinned.state, emptyPinnedState());
  assert.equal(unpinned.message, "Position returned to the generated layout.");
  assert.equal(unpinned.saved, true);
  assert.deepEqual(port.writes, [pinned.state, unpinned.state]);
});

test("unchanged pinned-position commands do not persist or replace product messages", () => {
  const port = persistence(true);
  const state = pinPosition(emptyPinnedState(), "thought-a", { x: 48, y: -24 }, validIds, port).state;
  port.writes.length = 0;

  const rejected = pinPosition(state, "missing", { x: 1, y: 1 }, validIds, port);
  const duplicate = pinPosition(state, "thought-a", { x: 48, y: -24 }, validIds, port);
  const absent = unpinPosition(emptyPinnedState(), "thought-a", port);

  assert.equal(rejected.message, "That position cannot be pinned.");
  assert.equal(duplicate.message, "Position already pinned.");
  assert.equal(absent.message, "Position is not pinned.");
  assert.equal(rejected.saved, null);
  assert.equal(duplicate.saved, null);
  assert.equal(absent.saved, null);
  assert.deepEqual(port.writes, []);
});

test("changed pins and unpins retain their state with existing visit-only fallback copy", () => {
  const pin = pinPosition(emptyPinnedState(), "thought-a", { x: 48, y: -24 }, validIds, persistence(false));
  const unpin = unpinPosition(pin.state, "thought-a", persistence(false));

  assert.deepEqual(pin.state.pinnedPositions["thought-a"], { x: 48, y: -24 });
  assert.equal(pin.saved, false);
  assert.equal(pin.message, "Position pinned for this visit.");
  assert.deepEqual(unpin.state, emptyPinnedState());
  assert.equal(unpin.saved, false);
  assert.equal(
    unpin.message,
    "Position returned for this visit. The saved pin could not be changed.",
  );
});
