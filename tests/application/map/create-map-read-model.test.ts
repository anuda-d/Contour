import assert from "node:assert/strict";
import test from "node:test";
import { getPrototypeFacts } from "../../../src/adapters/seed/prototype-seed.ts";
import { getCatalogue } from "../../../src/product/catalogue/catalogue.ts";
import { createMapReadModel } from "../../../src/application/map/create-map-read-model.ts";
import {
  createDraft,
  emptyDraftState,
} from "../../../src/product/authorship/draft-state.ts";
import { buildMapGraph } from "../../../src/product/map/map-graph.ts";
import { emptyPinnedState } from "../../../src/product/map/pinned-positions.ts";
import { createMapPresentation } from "../../../src/composition/map-presentation.ts";
import { resolveTemporaryMovedNodes } from "../../../src/ui/map.dom.ts";

function graphWithPrivateDraft() {
  const created = createDraft(
    emptyDraftState(),
    {
      id: "draft-read-model-boundary",
      primaryMediaId: "left-hand",
      statement: "A private thought remains absent from visitor data.",
      createdAt: "2026-09-06T18:00:00.000Z",
    },
    new Set(["left-hand"]),
  );
  assert.equal(created.changed, true);
  return buildMapGraph({ prototype: getPrototypeFacts(), catalogue: getCatalogue() }, created.state);
}

test("Map read models separate owner and visitor graph data without changing visible layout inputs", () => {
  const graph = graphWithPrivateDraft();
  const pinnedState = {
    ...emptyPinnedState(),
    pinnedPositions: {
      "thought-language": { x: 120, y: -40 },
      "draft-read-model-boundary": { x: -130, y: 70 },
    },
  };

  const owner = createMapReadModel(graph, "owner", pinnedState);
  const visitor = createMapReadModel(graph, "visitor", pinnedState);

  assert.equal(owner.graph.nodes.some((node) => node.id === "draft-read-model-boundary"), true);
  assert.equal(visitor.graph.nodes.some((node) => node.id === "draft-read-model-boundary"), false);
  assert.equal(visitor.graph.nodes.some((node) => node.type === "thought" && node.status === "draft"), false);
  assert.equal(Object.hasOwn(visitor.generatedPositions, "draft-read-model-boundary"), false);
  assert.equal(Object.hasOwn(visitor.pinnedPositions, "draft-read-model-boundary"), false);
  assert.deepEqual(visitor.generatedPositions["thought-language"], owner.generatedPositions["thought-language"]);
  assert.deepEqual(visitor.pinnedPositions, { "thought-language": { x: 120, y: -40 } });
  assert.equal(visitor.capabilities.canCaptureThoughts, false);
  assert.equal(owner.capabilities.canCaptureThoughts, true);
});

test("visitor read models remove private temporary positions and owner read models restore them", () => {
  const graph = graphWithPrivateDraft();
  const owner = createMapReadModel(graph, "owner", emptyPinnedState());
  const visitor = createMapReadModel(graph, "visitor", emptyPinnedState());
  const presentation = createMapPresentation();
  const ownerPositions = {
    ...owner.generatedPositions,
    "draft-read-model-boundary": { x: -211, y: 133 },
  };

  const visitorPositions = presentation.resolvePositions(
    visitor.graph,
    visitor.generatedPositions,
    ownerPositions,
    visitor.pinnedPositions,
  );
  const restoredOwnerPositions = presentation.resolvePositions(
    owner.graph,
    owner.generatedPositions,
    ownerPositions,
    owner.pinnedPositions,
  );

  assert.equal(Object.hasOwn(visitorPositions, "draft-read-model-boundary"), false);
  assert.deepEqual(restoredOwnerPositions["draft-read-model-boundary"], { x: -211, y: 133 });
  assert.deepEqual(
    [...resolveTemporaryMovedNodes(["draft-read-model-boundary"], visitorPositions, visitor.pinnedPositions)],
    [],
  );
  assert.deepEqual(
    [...resolveTemporaryMovedNodes(["draft-read-model-boundary"], restoredOwnerPositions, owner.pinnedPositions)],
    ["draft-read-model-boundary"],
  );
});

test("Map read models are isolated from later caller mutation", () => {
  const graph = graphWithPrivateDraft();
  const readModel = createMapReadModel(graph, "visitor", emptyPinnedState());
  const published = readModel.graph.nodes.find(
    (node): node is Extract<typeof node, { type: "thought" }> => node.type === "thought" && node.status === "published",
  );
  assert.ok(published);
  published.anchors.push("changed-in-renderer");

  assert.equal(
    graph.nodes.some(
      (node) => node.type === "thought" && node.status === "published" && node.anchors?.includes("changed-in-renderer"),
    ),
    false,
  );
});
