import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DRAG_THRESHOLD,
  ThoughtMap,
  getZoomBand,
  hasExceededDragThreshold,
  mergeGraphPositions,
  parsePublishDraftId,
  positionFromDrag,
  submitPublishDraft,
} from "../../src/ui/map.dom.ts";

const mapSource = await readFile(new URL("../../src/ui/map.dom.ts", import.meta.url), "utf8");

test("Map drag-click suppression reads time through the injected clock port", () => {
  assert.match(mapSource, /import type \{ ClockPort \} from "\.\.\/kernel\/clock\.ts"/);
  assert.match(mapSource, /clock: ClockPort;/);
  assert.match(mapSource, /this\.options\.clock\.nowMilliseconds\(\) <= this\.suppressedClick\.until/);
  assert.match(mapSource, /until: this\.options\.clock\.nowMilliseconds\(\) \+ 500/);
  assert.doesNotMatch(mapSource, /Date\.now\(\)/);
});

test("Map resize listening is injected through a typed port with frozen replacement timing", () => {
  assert.match(mapSource, /import type \{ ResizeEventPort \} from "\.\.\/kernel\/resize-event\.ts"/);
  assert.match(mapSource, /resizeEvents: ResizeEventPort;/);
  assert.match(mapSource, /this\.options\.resizeEvents\.replaceListener\(this\.onWindowResize\);/);
  assert.doesNotMatch(mapSource, /window\.(?:removeEventListener|addEventListener)\("resize"/);
});

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
  assert.match(mapSource, /submitPublishDraft\(/);
  assert.match(mapSource, /updateGraph\(\s*graph: unknown,/);
  assert.match(mapSource, /if \(selectId && this\.nodeById\.has\(selectId\)\) this\.selectedId = selectId/);
  assert.doesNotMatch(
    mapSource,
    /else if \(selectId && this\.nodeById\.has\(selectId\)\)[\s\S]{0,240}this\.focusNode/,
  );
});

const publishableNodes = [
  { id: "draft-a", type: "thought" as const, status: "draft" as const, statement: "Private.", anchors: ["book-a"] },
  { id: "published-b", type: "thought" as const, status: "published" as const, statement: "Public.", anchors: ["film-b"] },
  { id: "book-a", type: "media" as const, format: "book", title: "Book", creator: "Writer", year: 2020 },
];

test("Map validates Publish Draft DOM IDs against the active projected Draft before callback delegation", () => {
  assert.equal(parsePublishDraftId("draft-a", publishableNodes, true), "draft-a");
  assert.equal(parsePublishDraftId("published-b", publishableNodes, true), null);
  assert.equal(parsePublishDraftId("book-a", publishableNodes, true), null);
  assert.equal(parsePublishDraftId("unknown", publishableNodes, true), null);
  assert.equal(parsePublishDraftId(null, publishableNodes, true), null);
  assert.equal(parsePublishDraftId("draft-a", publishableNodes, false), null);
});

test("Map forwards a valid Publish Draft ID once and rejects malformed DOM values before its callback", () => {
  const publishedIds: string[] = [];
  const onPublishDraft = (id: string) => publishedIds.push(id);

  assert.equal(submitPublishDraft("draft-a", publishableNodes, true, onPublishDraft), "draft-a");
  assert.equal(submitPublishDraft("published-b", publishableNodes, true, onPublishDraft), null);
  assert.equal(submitPublishDraft("book-a", publishableNodes, true, onPublishDraft), null);
  assert.equal(submitPublishDraft(undefined, publishableNodes, true, onPublishDraft), null);
  assert.equal(submitPublishDraft("draft-a", publishableNodes, false, onPublishDraft), null);
  assert.deepEqual(publishedIds, ["draft-a"]);
  assert.match(mapSource, /submitPublishDraft\(\s*publish\.dataset\.publishDraft,/);
});

test("a private single-anchor Draft exposes one owner-only bridge action", () => {
  assert.match(mapSource, /data-connect-draft="\$\{escapeHtml\(id\)\}"/);
  assert.match(mapSource, /node\.anchors\.length === 1/);
  assert.match(mapSource, /this\.options\.selectionState\?\.confirmed/);
  assert.match(mapSource, /this\.options\.onConnectDraft\?\./);
  assert.match(mapSource, /focusDraftConnect\(id: string\)/);
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

test("visitor framing presents one public profile without duplicating owner chrome", () => {
  const profile = {
    displayName: "Mira Vale",
    handle: "@miravale",
    initials: "MV",
    identityLine: "Books, films, and the questions they leave behind.",
  };
  const visitor = {
    mode: "visitor",
    graph: { profile },
    presentation: { modes: { owner: "owner", visitor: "visitor" } },
  };
  const owner = {
    mode: "owner",
    graph: { profile },
    presentation: { modes: { owner: "owner", visitor: "visitor" } },
    options: { selectionState: { confirmed: true }, draftMessage: "" },
    selectionEntryLabel: () => "3 works ready",
  };

  const visitorIntro = ThoughtMap.prototype.profileIntro.call(visitor);
  assert.match(visitorIntro, /class="visitor-profile"/);
  assert.match(visitorIntro, /<h1 id="map-title">Mira Vale<\/h1>/);
  assert.match(visitorIntro, /@miravale/);
  assert.match(visitorIntro, />MV<\/span>/);
  assert.match(visitorIntro, /Books, films, and the questions they leave behind\./);
  assert.doesNotMatch(visitorIntro, /data-open-chooser|data-open-capture/);
  assert.equal(ThoughtMap.prototype.topbarIdentity.call(visitor), "");
  assert.equal(
    ThoughtMap.prototype.mapFrameLabel.call(visitor),
    "Mira Vale's interactive public Map",
  );

  const ownerIntro = ThoughtMap.prototype.profileIntro.call(owner);
  assert.match(ownerIntro, /Mira&#039;s map/);
  assert.match(ownerIntro, /data-open-chooser/);
  assert.match(ownerIntro, /data-open-capture/);
  assert.match(ThoughtMap.prototype.topbarIdentity.call(owner), /aria-label="Map owner"/);
});

test("visitor mode keeps the same camera and positions while restoring mode focus", () => {
  const setModeSource = mapSource.match(/setMode\(mode: string\): void \{([\s\S]*?)\n  \}\n\n  handleNodeClick/)?.[1] ?? "";
  assert.doesNotMatch(setModeSource, /this\.view\s*=/);
  assert.doesNotMatch(setModeSource, /this\.positions\s*=/);
  assert.match(setModeSource, /this\.render\(\)/);
  assert.match(setModeSource, /this\.applyTransform\(\)/);
  assert.match(setModeSource, /nextMode === this\.presentation\.modes\.visitor \? "\[data-mode-exit\]"/);
});

test("Published Thought detail derives authorship from the active profile", () => {
  const context = { graph: { profile: { displayName: "Avery Stone" } } };
  assert.equal(
    ThoughtMap.prototype.thoughtDetailLabel.call(context, { status: "published" }),
    "Avery's Thought",
  );
  assert.equal(
    ThoughtMap.prototype.thoughtDetailLabel.call(context, { status: "draft" }),
    "Private draft",
  );
  assert.doesNotMatch(mapSource, /"Mira's Thought"/);
});
