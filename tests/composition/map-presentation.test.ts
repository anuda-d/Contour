import assert from "node:assert/strict";
import test from "node:test";
import { getSeedGraph } from "../../src/adapters/seed/prototype-seed.ts";
import { createMapPresentation } from "../../src/composition/map-presentation.ts";
import {
  composeGraphWithDrafts,
  createDraft,
  emptyDraftState,
  type ThoughtGraph,
} from "../../src/product/authorship/draft-state.ts";

test("Map presentation factory accepts current owner and visitor projections", () => {
  const presentation = createMapPresentation();
  const baseGraph = getSeedGraph();
  const draft = createDraft(
    emptyDraftState(),
    {
      id: "draft-presentation-boundary",
      primaryMediaId: "left-hand",
      statement: "A private thought stays out of the visitor projection.",
      createdAt: "2026-08-30T20:00:00.000Z",
    },
    new Set(["left-hand"]),
  );
  assert.equal(draft.changed, true);
  const source: ThoughtGraph = {
    profile: { ...baseGraph.profile },
    nodes: baseGraph.nodes.map((node) => ({ ...node })),
    edges: baseGraph.edges.map((edge) => ({ ...edge })),
  };
  const graph = composeGraphWithDrafts(source, draft.state);

  const owner = presentation.projectGraphForMode(graph, presentation.modes.owner);
  const visitor = presentation.projectGraphForMode(graph, presentation.modes.visitor);

  assert.equal(owner.profile.displayName, baseGraph.profile.displayName);
  assert.equal(owner.nodes.some((node) => node.id === "draft-presentation-boundary"), true);
  assert.equal(visitor.nodes.some((node) => node.type === "thought" && node.status === "draft"), false);
});

test("Map presentation factory preserves generated positions for every current node", () => {
  const presentation = createMapPresentation();
  const graph = getSeedGraph();
  const positions = presentation.layoutGraph(graph, { width: 1080, height: 720 });
  const resolved = presentation.resolvePositions(graph, positions, {}, {});

  assert.deepEqual(Object.keys(resolved).sort(), graph.nodes.map((node) => node.id).sort());
});
