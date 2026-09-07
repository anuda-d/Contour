import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DRAG_THRESHOLD,
  ThoughtMap,
  parseConnectDraftId,
  getZoomBand,
  hasExceededDragThreshold,
  parseEditDraftId,
  parseFeatureToggleId,
  parseOrbitFocusId,
  parsePositionActionId,
  mergeGraphPositions,
  resolveTemporaryMovedNodes,
  parseNodeEventTargetId,
  parsePublishDraftId,
  positionFromDrag,
  submitFeatureToggle,
  submitConnectDraft,
  submitDetailFocus,
  submitEditDraft,
  submitOrbitFocus,
  submitPositionAction,
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

test("temporary placement remains only for visible unpinned nodes", () => {
  assert.deepEqual(
    [...resolveTemporaryMovedNodes(
      ["visible", "pinned", "missing"],
      { visible: { x: 1, y: 2 }, pinned: { x: 3, y: 4 } },
      { pinned: { x: 3, y: 4 } },
    )],
    ["visible"],
  );
});

const eventTargetNodes = [
  { id: "book-a", type: "media" as const, format: "book", title: "Book", creator: "Writer", year: 2020 },
  { id: "draft-b", type: "thought" as const, status: "draft" as const, statement: "Private.", anchors: ["book-a"] },
  { id: "user-c", type: "user" as const },
];

test("Map validates mutable node-event IDs against active projected non-user nodes", () => {
  assert.equal(parseNodeEventTargetId("book-a", eventTargetNodes), "book-a");
  assert.equal(parseNodeEventTargetId("draft-b", eventTargetNodes), "draft-b");
  assert.equal(parseNodeEventTargetId("user-c", eventTargetNodes), null);
  assert.equal(parseNodeEventTargetId("unknown", eventTargetNodes), null);
  assert.equal(parseNodeEventTargetId(undefined, eventTargetNodes), null);
  assert.equal(parseNodeEventTargetId(42, eventTargetNodes), null);
  assert.equal(
    mapSource.match(/parseNodeEventTargetId\(element\.dataset\.nodeId, this\.graph\.nodes\)/g)?.length,
    5,
  );
});

test("invalid Map node-event targets stay inert before selection or position access", () => {
  let selections = 0;
  let pointerCaptures = 0;
  let preventedKeys = 0;
  let stoppedKeys = 0;
  let mapTransforms = 0;
  const context = {
    graph: { nodes: eventTargetNodes },
    capabilities: { canShapeNodes: true },
    suppressedClick: null,
    options: { clock: { nowMilliseconds: () => 0 } },
    positions: {},
    view: { x: 0, y: 0, scale: 1 },
    isPinned: () => false,
    selectNode: () => {
      selections += 1;
    },
    applyTransform: () => {
      mapTransforms += 1;
    },
  };
  for (const nodeId of ["stale", "user-c", undefined]) {
    const invalidElement = {
      dataset: { nodeId },
      setPointerCapture: () => {
        pointerCaptures += 1;
      },
    } as unknown as HTMLElement;

    ThoughtMap.prototype.handleNodeClick.call(
      context,
      { preventDefault: () => undefined } as unknown as MouseEvent,
      invalidElement,
    );
    ThoughtMap.prototype.startNodeDrag.call(
      context,
      { pointerType: "mouse", button: 0 } as PointerEvent,
      invalidElement,
    );
    let propagationStopped = false;
    const keyboardEvent = {
      key: "ArrowRight",
      preventDefault: () => {
        preventedKeys += 1;
      },
      stopPropagation: () => {
        propagationStopped = true;
        stoppedKeys += 1;
      },
    } as unknown as KeyboardEvent;
    ThoughtMap.prototype.moveNodeByKeyboard.call(context, keyboardEvent, invalidElement);
    if (!propagationStopped) ThoughtMap.prototype.handleKeyboard.call(context, keyboardEvent);
  }

  assert.equal(selections, 0);
  assert.equal(pointerCaptures, 0);
  assert.equal(preventedKeys, 0);
  assert.equal(stoppedKeys, 3);
  assert.equal(mapTransforms, 0);
  assert.deepEqual(context.view, { x: 0, y: 0, scale: 1 });
});

test("valid projected Media and Thought retain click, drag-start, and keyboard behavior", () => {
  for (const id of ["book-a", "draft-b"]) {
    const selections: string[] = [];
    ThoughtMap.prototype.handleNodeClick.call(
      {
        graph: { nodes: eventTargetNodes },
        suppressedClick: null,
        options: { clock: { nowMilliseconds: () => 0 } },
        selectNode: (selectedId: string) => selections.push(selectedId),
      },
      { preventDefault: () => undefined } as unknown as MouseEvent,
      { dataset: { nodeId: id } } as unknown as HTMLElement,
    );

    let pointerCaptures = 0;
    let pointerStops = 0;
    const pointerListeners: string[] = [];
    ThoughtMap.prototype.startNodeDrag.call(
      {
        graph: { nodes: eventTargetNodes },
        capabilities: { canShapeNodes: true },
        positions: { [id]: { x: 10, y: 20 } },
        isPinned: () => false,
      },
      {
        pointerType: "mouse",
        button: 0,
        pointerId: 1,
        clientX: 40,
        clientY: 50,
        stopPropagation: () => {
          pointerStops += 1;
        },
      } as unknown as PointerEvent,
      {
        dataset: { nodeId: id },
        setPointerCapture: () => {
          pointerCaptures += 1;
        },
        addEventListener: (type: string) => pointerListeners.push(type),
      } as unknown as HTMLElement,
    );

    let preventedKeys = 0;
    let stoppedKeys = 0;
    const movedNodes = new Set<string>();
    const positions = { [id]: { x: 10, y: 20 } };
    const styleUpdates: string[] = [];
    ThoughtMap.prototype.moveNodeByKeyboard.call(
      {
        graph: { nodes: eventTargetNodes },
        capabilities: { canShapeNodes: true },
        positions,
        view: { scale: 2 },
        movedNodes,
        isPinned: () => false,
        clearPinnedMessage: () => undefined,
        selectNode: (selectedId: string) => selections.push(selectedId),
        renderRegions: () => undefined,
      },
      {
        key: "ArrowRight",
        shiftKey: false,
        preventDefault: () => {
          preventedKeys += 1;
        },
        stopPropagation: () => {
          stoppedKeys += 1;
        },
      } as unknown as KeyboardEvent,
      {
        dataset: { nodeId: id },
        style: { setProperty: (name: string, value: string) => styleUpdates.push(`${name}:${value}`) },
      } as unknown as HTMLElement,
    );

    assert.deepEqual(selections, [id, id]);
    assert.equal(pointerCaptures, 1);
    assert.equal(pointerStops, 1);
    assert.deepEqual(pointerListeners, ["pointermove", "pointerup", "pointercancel"]);
    assert.deepEqual(positions[id], { x: 22, y: 20 });
    assert.deepEqual([...movedNodes], [id]);
    assert.deepEqual(styleUpdates, ["--node-x:22px", "--node-y:20px"]);
    assert.equal(preventedKeys, 1);
    assert.equal(stoppedKeys, 1);
  }
});

test("Map edge rendering ignores malformed DOM node IDs while preserving valid connection state", () => {
  const toggles = new Map<unknown, Array<[string, boolean]>>();
  const unconnectedNode = {
    id: "film-d",
    type: "media" as const,
    format: "film",
    title: "Film",
    creator: "Director",
    year: 2021,
  };
  const elementFor = (nodeId: unknown) => ({
    dataset: { nodeId },
    classList: {
      toggle: (className: string, enabled: boolean) => {
        const entries = toggles.get(nodeId) ?? [];
        entries.push([className, enabled]);
        toggles.set(nodeId, entries);
      },
    },
  });
  const elements = [
    elementFor("book-a"),
    elementFor("draft-b"),
    elementFor("film-d"),
    elementFor("user-c"),
    elementFor("stale"),
    elementFor(undefined),
    elementFor(42),
  ];
  const context = {
    graph: {
      nodes: [...eventTargetNodes, unconnectedNode],
      edges: [{ id: "anchor-a", source: "draft-b", target: "book-a", kind: "anchor" }],
    },
    positions: { "book-a": { x: 10, y: 20 }, "draft-b": { x: 30, y: 40 } },
    selectedId: "book-a",
    edgeLayer: { innerHTML: "" },
    root: { querySelectorAll: () => elements },
  };

  assert.doesNotThrow(() => ThoughtMap.prototype.renderEdges.call(context));
  assert.deepEqual(toggles.get("book-a"), [
    ["is-connected", false],
    ["is-muted", false],
  ]);
  assert.deepEqual(toggles.get("draft-b"), [
    ["is-connected", true],
    ["is-muted", false],
  ]);
  assert.deepEqual(toggles.get("film-d"), [
    ["is-connected", false],
    ["is-muted", true],
  ]);
  assert.equal(toggles.has("user-c"), false);
  assert.equal(toggles.has("stale"), false);
  assert.equal(toggles.has(undefined), false);
  assert.equal(toggles.has(42), false);
});

test("Map selection rendering ignores malformed DOM node IDs while preserving valid selected state", () => {
  const updates = new Map<unknown, Array<["class" | "aria", string | boolean]>>();
  const elementFor = (nodeId: unknown) => ({
    dataset: { nodeId },
    classList: {
      toggle: (className: string, enabled: boolean) => {
        const entries = updates.get(nodeId) ?? [];
        entries.push(["class", `${className}:${enabled}`]);
        updates.set(nodeId, entries);
      },
    },
    setAttribute: (name: string, value: string) => {
      const entries = updates.get(nodeId) ?? [];
      entries.push(["aria", `${name}:${value}`]);
      updates.set(nodeId, entries);
    },
  });
  const elements = [
    elementFor("book-a"),
    elementFor("draft-b"),
    elementFor("user-c"),
    elementFor("stale"),
    elementFor(undefined),
    elementFor(42),
  ];
  let edgeRenders = 0;
  let detailRenders = 0;
  const context = {
    graph: { nodes: eventTargetNodes },
    selectedId: null,
    root: { querySelectorAll: () => elements },
    renderEdges: () => {
      edgeRenders += 1;
    },
    renderDetails: () => {
      detailRenders += 1;
    },
  };

  ThoughtMap.prototype.selectNode.call(context, "book-a");
  ThoughtMap.prototype.selectNode.call(context, "draft-b");
  ThoughtMap.prototype.selectNode.call(context, null);

  assert.deepEqual(updates.get("book-a"), [
    ["class", "is-selected:true"],
    ["aria", "aria-pressed:true"],
    ["class", "is-selected:false"],
    ["aria", "aria-pressed:false"],
    ["class", "is-selected:false"],
    ["aria", "aria-pressed:false"],
  ]);
  assert.deepEqual(updates.get("draft-b"), [
    ["class", "is-selected:false"],
    ["aria", "aria-pressed:false"],
    ["class", "is-selected:true"],
    ["aria", "aria-pressed:true"],
    ["class", "is-selected:false"],
    ["aria", "aria-pressed:false"],
  ]);
  assert.equal(updates.has("user-c"), false);
  assert.equal(updates.has("stale"), false);
  assert.equal(updates.has(undefined), false);
  assert.equal(updates.has(42), false);
  assert.equal(context.selectedId, null);
  assert.equal(edgeRenders, 3);
  assert.equal(detailRenders, 3);
});

test("Map validates orbit Focus DOM IDs against active projected Media", () => {
  assert.equal(parseOrbitFocusId("book-a", eventTargetNodes), "book-a");
  assert.equal(parseOrbitFocusId("draft-b", eventTargetNodes), null);
  assert.equal(parseOrbitFocusId("user-c", eventTargetNodes), null);
  assert.equal(parseOrbitFocusId("stale", eventTargetNodes), null);
  assert.equal(parseOrbitFocusId(undefined, eventTargetNodes), null);
  assert.equal(parseOrbitFocusId(42, eventTargetNodes), null);
});

test("Map validates detail Focus DOM IDs against active projected non-user nodes", () => {
  const focusedIds: string[] = [];
  const onFocus = (id: string) => focusedIds.push(id);

  assert.equal(submitDetailFocus("book-a", eventTargetNodes, onFocus), "book-a");
  assert.equal(submitDetailFocus("draft-b", eventTargetNodes, onFocus), "draft-b");
  assert.equal(submitDetailFocus("user-c", eventTargetNodes, onFocus), null);
  assert.equal(submitDetailFocus("stale", eventTargetNodes, onFocus), null);
  assert.equal(submitDetailFocus(undefined, eventTargetNodes, onFocus), null);
  assert.equal(submitDetailFocus(42, eventTargetNodes, onFocus), null);
  assert.deepEqual(focusedIds, ["book-a", "draft-b"]);
});

test("Map Focus controls delegate valid targets once and reject malformed DOM values before focus", () => {
  const orbitFocusedIds: string[] = [];
  const detailFocusedIds: string[] = [];
  const orbitFocus = (id: string) => orbitFocusedIds.push(id);
  const detailFocus = (id: string) => detailFocusedIds.push(id);

  assert.equal(submitOrbitFocus("book-a", eventTargetNodes, orbitFocus), "book-a");
  assert.equal(submitOrbitFocus("draft-b", eventTargetNodes, orbitFocus), null);
  assert.equal(submitOrbitFocus("user-c", eventTargetNodes, orbitFocus), null);
  assert.equal(submitOrbitFocus("stale", eventTargetNodes, orbitFocus), null);
  assert.equal(submitOrbitFocus(undefined, eventTargetNodes, orbitFocus), null);
  assert.equal(submitDetailFocus("user-c", eventTargetNodes, detailFocus), null);
  assert.equal(submitDetailFocus("stale", eventTargetNodes, detailFocus), null);
  assert.equal(submitDetailFocus(undefined, eventTargetNodes, detailFocus), null);
  assert.deepEqual(orbitFocusedIds, ["book-a"]);
  assert.deepEqual(detailFocusedIds, []);
  assert.match(
    mapSource,
    /submitOrbitFocus\(element\.dataset\.orbitFocus, this\.graph\.nodes, \(id\) => this\.focusNode\(id\)\)/,
  );
  assert.match(
    mapSource,
    /submitDetailFocus\(focus\.dataset\.detailFocus, this\.graph\.nodes, \(id\) => this\.focusNode\(id\)\)/,
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
    /this\.pinnedPositions/,
  );
});

test("a new temporary move clears stale pin and unpin feedback", () => {
  const context = {
    capabilities: { canShapeNodes: true },
    movedNodes: new Set(["thought-a"]),
    options: {
      pinnedMessage: "Position returned to the generated layout.",
      pinnedMessageId: "thought-a",
    },
    pinnedPositions: {},
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
  assert.match(mapSource, /updateReadModel\(\s*readModel: MapReadModel,/);
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

test("Map validates Edit Draft DOM IDs against the active projected Draft before callback delegation", () => {
  assert.equal(parseEditDraftId("draft-a", publishableNodes, true), "draft-a");
  assert.equal(parseEditDraftId("published-b", publishableNodes, true), null);
  assert.equal(parseEditDraftId("book-a", publishableNodes, true), null);
  assert.equal(parseEditDraftId("unknown", publishableNodes, true), null);
  assert.equal(parseEditDraftId(null, publishableNodes, true), null);
  assert.equal(parseEditDraftId("draft-a", publishableNodes, false), null);
});

test("Map forwards a valid Edit Draft ID once and rejects malformed DOM values before its callback", () => {
  const editedIds: string[] = [];
  const onEditDraft = (id: string) => editedIds.push(id);

  assert.equal(submitEditDraft("draft-a", publishableNodes, true, onEditDraft), "draft-a");
  assert.equal(submitEditDraft("published-b", publishableNodes, true, onEditDraft), null);
  assert.equal(submitEditDraft("book-a", publishableNodes, true, onEditDraft), null);
  assert.equal(submitEditDraft(undefined, publishableNodes, true, onEditDraft), null);
  assert.equal(submitEditDraft("draft-a", publishableNodes, false, onEditDraft), null);
  assert.deepEqual(editedIds, ["draft-a"]);
  assert.match(mapSource, /submitEditDraft\(\s*edit\.dataset\.editDraft,/);
});

const connectableNodes = [
  { id: "draft-a", type: "thought" as const, status: "draft" as const, statement: "Private.", anchors: ["book-a"] },
  { id: "bridged-b", type: "thought" as const, status: "draft" as const, statement: "Bridge.", anchors: ["book-a", "film-b"] },
  { id: "published-c", type: "thought" as const, status: "published" as const, statement: "Public.", anchors: ["book-a"] },
  { id: "book-a", type: "media" as const, format: "book", title: "Book", creator: "Writer", year: 2020 },
  { id: "user-a", type: "user" as const },
];

test("Map validates Connect another work DOM IDs against an active projected single-anchor Draft", () => {
  assert.equal(parseConnectDraftId("draft-a", connectableNodes, true, true), "draft-a");
  assert.equal(parseConnectDraftId("bridged-b", connectableNodes, true, true), null);
  assert.equal(parseConnectDraftId("published-c", connectableNodes, true, true), null);
  assert.equal(parseConnectDraftId("book-a", connectableNodes, true, true), null);
  assert.equal(parseConnectDraftId("user-a", connectableNodes, true, true), null);
  assert.equal(parseConnectDraftId("unknown", connectableNodes, true, true), null);
  assert.equal(parseConnectDraftId(null, connectableNodes, true, true), null);
  assert.equal(parseConnectDraftId("draft-a", connectableNodes, false, true), null);
  assert.equal(parseConnectDraftId("draft-a", connectableNodes, true, false), null);
});

test("Map forwards a valid Connect another work ID once and rejects malformed DOM values before its callback", () => {
  const connectedIds: string[] = [];
  const onConnectDraft = (id: string) => connectedIds.push(id);

  assert.equal(submitConnectDraft("draft-a", connectableNodes, true, true, onConnectDraft), "draft-a");
  assert.equal(submitConnectDraft("bridged-b", connectableNodes, true, true, onConnectDraft), null);
  assert.equal(submitConnectDraft("published-c", connectableNodes, true, true, onConnectDraft), null);
  assert.equal(submitConnectDraft("book-a", connectableNodes, true, true, onConnectDraft), null);
  assert.equal(submitConnectDraft(undefined, connectableNodes, true, true, onConnectDraft), null);
  assert.equal(submitConnectDraft("draft-a", connectableNodes, false, true, onConnectDraft), null);
  assert.equal(submitConnectDraft("draft-a", connectableNodes, true, false, onConnectDraft), null);
  assert.deepEqual(connectedIds, ["draft-a"]);
  assert.match(mapSource, /submitConnectDraft\(\s*connect\.dataset\.connectDraft,/);
});

const featureableNodes = [
  { id: "book-a", type: "media" as const, format: "book", title: "Book", creator: "Writer", year: 2020 },
  { id: "draft-b", type: "thought" as const, status: "draft" as const, statement: "Private.", anchors: ["book-a"] },
  { id: "user-c", type: "user" as const },
];

test("Map validates Featured Media DOM IDs against the active projected Media before callback delegation", () => {
  assert.equal(parseFeatureToggleId("book-a", featureableNodes, true), "book-a");
  assert.equal(parseFeatureToggleId("draft-b", featureableNodes, true), null);
  assert.equal(parseFeatureToggleId("user-c", featureableNodes, true), null);
  assert.equal(parseFeatureToggleId("unknown", featureableNodes, true), null);
  assert.equal(parseFeatureToggleId(null, featureableNodes, true), null);
  assert.equal(parseFeatureToggleId("book-a", featureableNodes, false), null);
});

test("Map forwards a valid Featured Media ID once and rejects malformed DOM values before its callback", () => {
  const featuredIds: string[] = [];
  const onToggleFeatured = (id: string) => {
    featuredIds.push(id);
    return { state: { featuredMediaIds: [id] }, message: "Added to your profile orbit." };
  };

  assert.deepEqual(submitFeatureToggle("book-a", featureableNodes, true, onToggleFeatured), {
    id: "book-a",
    result: { state: { featuredMediaIds: ["book-a"] }, message: "Added to your profile orbit." },
  });
  assert.equal(submitFeatureToggle("draft-b", featureableNodes, true, onToggleFeatured), null);
  assert.equal(submitFeatureToggle("user-c", featureableNodes, true, onToggleFeatured), null);
  assert.equal(submitFeatureToggle("unknown", featureableNodes, true, onToggleFeatured), null);
  assert.equal(submitFeatureToggle(42, featureableNodes, true, onToggleFeatured), null);
  assert.equal(submitFeatureToggle(undefined, featureableNodes, true, onToggleFeatured), null);
  assert.equal(submitFeatureToggle("book-a", featureableNodes, false, onToggleFeatured), null);
  assert.deepEqual(featuredIds, ["book-a"]);
  assert.match(mapSource, /submitFeatureToggle\(\s*feature\.dataset\.featureToggle,/);
});

const positionableNodes = [
  { id: "book-a", type: "media" as const, format: "book", title: "Book", creator: "Writer", year: 2020 },
  { id: "draft-b", type: "thought" as const, status: "draft" as const, statement: "Private.", anchors: ["book-a"] },
  { id: "user-c", type: "user" as const },
];

test("Map validates position-action DOM IDs against active owner-projected pinnable nodes", () => {
  assert.equal(parsePositionActionId("book-a", positionableNodes, true), "book-a");
  assert.equal(parsePositionActionId("draft-b", positionableNodes, true), "draft-b");
  assert.equal(parsePositionActionId("user-c", positionableNodes, true), null);
  assert.equal(parsePositionActionId("unknown", positionableNodes, true), null);
  assert.equal(parsePositionActionId(null, positionableNodes, true), null);
  assert.equal(parsePositionActionId(42, positionableNodes, true), null);
  assert.equal(parsePositionActionId("book-a", positionableNodes, false), null);
});

test("Map forwards only an actionable position target to its existing pin or unpin callback", () => {
  const pinnedIds: Array<{ id: string; position: { x: number; y: number } }> = [];
  const unpinnedIds: string[] = [];
  const pinnedResult = { state: { pinnedPositions: { "book-a": { x: 12, y: -8 } } }, message: "Position pinned." };
  const unpinnedResult = { state: { pinnedPositions: {} }, message: "Position returned to the generated layout." };
  const onPinPosition = (id: string, position: { x: number; y: number }) => {
    pinnedIds.push({ id, position });
    return pinnedResult;
  };
  const onUnpinPosition = (id: string) => {
    unpinnedIds.push(id);
    return unpinnedResult;
  };
  const isActionable = (id: string) => id === "book-a" || id === "draft-b";
  const isPinned = (id: string) => id === "draft-b";
  const positionForId = () => ({ x: 12, y: -8 });

  assert.deepEqual(
    submitPositionAction(
      "book-a",
      positionableNodes,
      true,
      isActionable,
      isPinned,
      positionForId,
      onPinPosition,
      onUnpinPosition,
    ),
    { id: "book-a", result: pinnedResult },
  );
  assert.deepEqual(
    submitPositionAction(
      "draft-b",
      positionableNodes,
      true,
      isActionable,
      isPinned,
      positionForId,
      onPinPosition,
      onUnpinPosition,
    ),
    { id: "draft-b", result: unpinnedResult },
  );
  assert.equal(
    submitPositionAction(
      "user-c",
      positionableNodes,
      true,
      isActionable,
      isPinned,
      positionForId,
      onPinPosition,
      onUnpinPosition,
    ),
    null,
  );
  assert.equal(
    submitPositionAction(
      "book-a",
      positionableNodes,
      true,
      () => false,
      isPinned,
      positionForId,
      onPinPosition,
      onUnpinPosition,
    ),
    null,
  );
  assert.equal(
    submitPositionAction(
      "book-a",
      positionableNodes,
      false,
      isActionable,
      isPinned,
      positionForId,
      onPinPosition,
      onUnpinPosition,
    ),
    null,
  );
  assert.equal(
    submitPositionAction(
      "unknown",
      positionableNodes,
      true,
      () => false,
      isPinned,
      positionForId,
      onPinPosition,
      onUnpinPosition,
    ),
    null,
  );
  assert.deepEqual(pinnedIds, [{ id: "book-a", position: { x: 12, y: -8 } }]);
  assert.deepEqual(unpinnedIds, ["draft-b"]);
  assert.match(mapSource, /submitPositionAction\(\s*position\.dataset\.positionAction,/);
});

test("a private single-anchor Draft exposes one owner-only bridge action", () => {
  assert.match(mapSource, /data-connect-draft="\$\{escapeHtml\(id\)\}"/);
  assert.match(mapSource, /node\.anchors\.length === 1/);
  assert.match(mapSource, /this\.options\.selectionState\?\.confirmed/);
  assert.match(mapSource, /submitConnectDraft\(/);
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

test("visitor read-model updates preserve camera and positions while restoring mode focus", () => {
  const updateReadModelSource = mapSource.match(/updateReadModel\([\s\S]*?\n  \}\n\n  requestMode/)?.[0] ?? "";
  assert.doesNotMatch(updateReadModelSource, /this\.view\s*=/);
  assert.match(updateReadModelSource, /this\.positions = positions/);
  assert.match(updateReadModelSource, /currentPositions \?\? this\.positions/);
  assert.match(updateReadModelSource, /currentMovedNodeIds \?\? this\.movedNodes/);
  assert.match(updateReadModelSource, /if \(message !== undefined\) this\.options\.draftMessage = message/);
  assert.match(updateReadModelSource, /this\.render\(\)/);
  assert.match(updateReadModelSource, /this\.applyTransform\(\)/);
  assert.match(updateReadModelSource, /this\.mode === "visitor" \? "\[data-mode-exit\]"/);
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
