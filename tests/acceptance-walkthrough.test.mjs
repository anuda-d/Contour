import test from "node:test";
import assert from "node:assert/strict";
import { getCatalogue } from "../src/product/catalogue/catalogue.ts";
import {
  composeGraphWithDrafts,
  connectDraft,
  createDraft,
  emptyDraftState,
  loadDraftState,
  persistDraftState,
  publishDraft,
} from "../src/draft-state.js";
import {
  loadFeaturedState,
  saveFeaturedState,
} from "../src/adapters/browser/featured-local-storage.ts";
import {
  getModeCapabilities,
  getPublicMediaIds,
  projectGraphForMode,
} from "../src/graph-projection.js";
import {
  emptyPinnedState,
  loadPinnedState,
  pinPosition,
  savePinnedState,
} from "../src/pinned-state.js";
import {
  loadSelection,
  saveSelection,
} from "../src/adapters/browser/selection-local-storage.ts";
import {
  confirmSelection,
  emptySelection,
  toggleMediaSelection,
} from "../src/product/taste/selection.ts";
import { toggleFeaturedMedia } from "../src/product/taste/featured.ts";
import { getSeedGraph } from "../src/seed.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("the complete three-work walkthrough survives reload as one private-to-public Map", () => {
  const storage = memoryStorage();
  const baseGraph = getSeedGraph();
  const catalogueIds = new Set(getCatalogue().map((item) => item.id));
  const selectedIds = ["left-hand", "arrival", "bluets"];

  let selection = emptySelection();
  selectedIds.forEach((id) => {
    selection = toggleMediaSelection(selection, id, catalogueIds).state;
  });
  selection = confirmSelection(selection).state;
  assert.equal(saveSelection(storage, selection), true);
  assert.deepEqual(loadSelection(storage, catalogueIds).state, {
    version: 1,
    selectedMediaIds: selectedIds,
    confirmed: true,
  });

  const authoredInputs = [
    {
      id: "draft-walkthrough-language",
      primaryMediaId: "left-hand",
      statement: "Language changes which freedoms a person can imagine.",
      createdAt: "2026-08-24T14:00:00.000Z",
    },
    {
      id: "draft-walkthrough-arrival",
      primaryMediaId: "arrival",
      statement: "Memory can feel less like an archive than a choice.",
      createdAt: "2026-08-24T14:01:00.000Z",
    },
    {
      id: "draft-walkthrough-bluets",
      primaryMediaId: "bluets",
      statement: "Attention makes loss visible without making it smaller.",
      createdAt: "2026-08-24T14:02:00.000Z",
    },
  ];

  let authored = emptyDraftState();
  authoredInputs.forEach((input) => {
    const created = createDraft(authored, input, new Set(selectedIds));
    assert.equal(created.changed, true);
    authored = persistDraftState(storage, created.state, catalogueIds, {
      id: input.id,
      fields: [],
    }).state;
  });

  const bridged = connectDraft(
    authored,
    authoredInputs[0].id,
    {
      secondaryMediaId: "arrival",
      statement: "Language and memory change which freedoms a person can imagine.",
    },
    catalogueIds,
  );
  assert.equal(bridged.changed, true);
  authored = persistDraftState(storage, bridged.state, catalogueIds, {
    id: authoredInputs[0].id,
    fields: ["secondaryMediaId", "statement"],
  }).state;

  const privateGraph = composeGraphWithDrafts(baseGraph, authored);
  const privateVisitor = projectGraphForMode(privateGraph, "visitor");
  assert.equal(authored.thoughts.filter((thought) => thought.status === "draft").length, 3);
  assert.equal(
    privateVisitor.nodes.some((node) => node.id.startsWith("draft-walkthrough-")),
    false,
  );

  let pinned = pinPosition(
    emptyPinnedState(),
    authoredInputs[0].id,
    { x: 186, y: -94 },
    new Set(privateGraph.nodes.map((node) => node.id)),
  ).state;
  assert.equal(savePinnedState(storage, pinned), true);

  authoredInputs.forEach((input, index) => {
    const published = publishDraft(
      authored,
      input.id,
      `2026-08-24T15:0${index}:00.000Z`,
      catalogueIds,
    );
    assert.equal(published.changed, true);
    authored = persistDraftState(storage, published.state, catalogueIds, {
      id: input.id,
      fields: ["status", "publishedAt"],
    }).state;
  });

  const publishedGraph = composeGraphWithDrafts(baseGraph, authored);
  const publicMediaIds = getPublicMediaIds(publishedGraph);
  let featured = loadFeaturedState(
    storage,
    publicMediaIds,
    baseGraph.profile.featuredMediaIds,
  ).state;
  featured = toggleFeaturedMedia(
    featured,
    "aftersun",
    publicMediaIds,
    "Aftersun",
  ).state;
  featured = toggleFeaturedMedia(
    featured,
    "left-hand",
    publicMediaIds,
    "The Left Hand of Darkness",
  ).state;
  assert.equal(saveFeaturedState(storage, featured), true);

  selection = loadSelection(storage, catalogueIds).state;
  authored = loadDraftState(storage, catalogueIds).state;
  const reloadedGraph = composeGraphWithDrafts(baseGraph, authored);
  const reloadedNodeIds = new Set(reloadedGraph.nodes.map((node) => node.id));
  pinned = loadPinnedState(storage, reloadedNodeIds).state;
  featured = loadFeaturedState(storage, getPublicMediaIds(reloadedGraph)).state;
  const visitor = projectGraphForMode(reloadedGraph, "visitor");

  assert.equal(selection.confirmed, true);
  assert.equal(authored.thoughts.length, 3);
  assert.equal(authored.thoughts.every((thought) => thought.status === "published"), true);
  assert.deepEqual(authored.thoughts[0].secondaryMediaId, "arrival");
  assert.deepEqual(pinned.pinnedPositions[authoredInputs[0].id], { x: 186, y: -94 });
  assert.deepEqual(featured.featuredMediaIds, [
    "dispossessed",
    "mood-for-love",
    "left-hand",
  ]);
  assert.equal(visitor.nodes.filter((node) => node.type === "thought").length, 7);
  assert.equal(visitor.nodes.some((node) => node.status === "draft"), false);
  assert.equal(
    visitor.edges.some(
      (edge) =>
        edge.id === "anchor-draft-walkthrough-language-arrival" &&
        edge.kind === "additional-anchor",
    ),
    true,
  );
  assert.deepEqual(getModeCapabilities("visitor"), {
    mode: "visitor",
    canChooseWorks: false,
    canCaptureThoughts: false,
    canFeatureMedia: false,
    canShapeNodes: false,
    canResetPositions: false,
  });
});
