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

test("publishing is an owner-only Draft action that preserves the current camera", () => {
  assert.match(mapSource, /data-publish-draft="\$\{escapeHtml\(id\)\}"/);
  assert.match(
    mapSource,
    /node\.status === "draft" && this\.capabilities\.canCaptureThoughts/,
  );
  assert.match(mapSource, /this\.options\.onPublishDraft\?\./);
  assert.match(mapSource, /updateGraph\(graph, \{ focusId = null, selectId = null, message = "" \} = \{\}\)/);
  assert.match(mapSource, /if \(selectId && this\.nodeById\.has\(selectId\)\) this\.selectedId = selectId/);
  assert.doesNotMatch(
    mapSource,
    /else if \(selectId && this\.nodeById\.has\(selectId\)\)[\s\S]{0,240}this\.focusNode/,
  );
});

test("a private single-anchor Draft exposes one owner-only bridge action", () => {
  assert.match(mapSource, /data-connect-draft="\$\{escapeHtml\(id\)\}"/);
  assert.match(mapSource, /node\.anchors\.length === 1/);
  assert.match(mapSource, /this\.options\.selectionState\?\.confirmed/);
  assert.match(mapSource, /this\.options\.onConnectDraft\?\./);
  assert.match(mapSource, /focusDraftConnect\(id\)/);
});

test("selection changes refresh open detail so an unavailable bridge action disappears", () => {
  let detailRenders = 0;
  const context = {
    options: { selectionState: { confirmed: true } },
    detailPanel: {},
    root: { querySelector: () => null },
    renderDetails: () => {
      detailRenders += 1;
    },
  };

  ThoughtMap.prototype.updateSelectionState.call(context, {
    confirmed: false,
    selectedMediaIds: ["left-hand", "arrival"],
  });
  assert.equal(detailRenders, 1);
  assert.equal(context.options.selectionState.confirmed, false);
});
