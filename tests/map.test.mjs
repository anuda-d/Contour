import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DRAG_THRESHOLD,
  ThoughtMap,
  getZoomBand,
  hasExceededDragThreshold,
  mergeGraphPositions,
  positionFromDrag,
} from "../src/map.js";

const mapSource = await readFile(new URL("../src/map.js", import.meta.url), "utf8");

test("semantic zoom reveals content through stable bands", () => {
  assert.equal(getZoomBand(0.3), "far");
  assert.equal(getZoomBand(0.68), "far");
  assert.equal(getZoomBand(0.69), "middle");
  assert.equal(getZoomBand(1.04), "middle");
  assert.equal(getZoomBand(1.05), "close");
});

test("a press stays inert until the screen-space drag threshold is crossed", () => {
  const start = { x: 120, y: 80 };
  assert.equal(DRAG_THRESHOLD, 6);
  assert.equal(hasExceededDragThreshold(start, { x: 124, y: 83 }), false);
  assert.equal(hasExceededDragThreshold(start, { x: 126, y: 80 }), true);
});

test("drag displacement follows the pointer at the current camera scale", () => {
  assert.deepEqual(
    positionFromDrag({ x: 10, y: -20 }, { x: 24, y: -12 }, 0.5),
    { x: 58, y: -44 },
  );
});

test("dragged positions remain inside the Map bounds", () => {
  assert.deepEqual(
    positionFromDrag({ x: 0, y: 0 }, { x: 5000, y: -5000 }, 1),
    { x: 490, y: -310 },
  );
});

test("graph growth preserves existing placement and adds generated positions for new nodes", () => {
  assert.deepEqual(
    mergeGraphPositions(
      [{ id: "existing" }, { id: "draft-new" }],
      { existing: { x: 12, y: -8 }, removed: { x: 4, y: 4 } },
      { existing: { x: 99, y: 99 }, "draft-new": { x: 42, y: 18 } },
    ),
    { existing: { x: 12, y: -8 }, "draft-new": { x: 42, y: 18 } },
  );
});

test("pinning remains explicit, owner-only editing while Reset retains durable positions", () => {
  assert.match(
    mapSource,
    /this\.capabilities\.canShapeNodes && \(this\.isPinned\(id\) \|\| this\.movedNodes\.has\(id\)\)/,
  );
  assert.match(
    mapSource,
    /const exposesPinnedState = pinned && this\.capabilities\.canShapeNodes/,
  );
  assert.match(
    mapSource,
    /if \(!this\.capabilities\.canShapeNodes \|\| this\.isPinned\(id\)\) return/,
  );
  assert.match(
    mapSource,
    /this\.options\.pinnedState\?\.pinnedPositions \?\? \{\}/,
  );
});

test("a new temporary move clears stale pin and unpin feedback", () => {
  const context = {
    capabilities: { canShapeNodes: true },
    movedNodes: new Set(["thought-a"]),
    options: {
      pinnedMessage: "Position returned to the generated layout.",
      pinnedMessageId: "thought-a",
      pinnedState: { pinnedPositions: {} },
    },
    isPinned: ThoughtMap.prototype.isPinned,
  };

  ThoughtMap.prototype.clearPinnedMessage.call(context, "thought-a");
  const detail = ThoughtMap.prototype.placementDetail.call(context, "thought-a");
  assert.match(detail, /Temporary position\. Pin it to keep this placement\./);
  assert.doesNotMatch(detail, /returned to the generated layout/);
});
