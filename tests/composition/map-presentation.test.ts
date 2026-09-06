import assert from "node:assert/strict";
import test from "node:test";
import { createMapPresentation } from "../../src/composition/map-presentation.ts";
import { getSeedGraph } from "../../src/adapters/seed/prototype-seed.ts";

test("Map presentation factory validates supplied structural graph read models", () => {
  const presentation = createMapPresentation();
  const baseGraph = getSeedGraph();
  const graph = presentation.readGraph(baseGraph);
  assert.equal(graph.profile.displayName, baseGraph.profile.displayName);
  assert.deepEqual(graph.nodes.map((node) => node.id), baseGraph.nodes.map((node) => node.id));
});

test("Map presentation factory resolves supplied visible positions", () => {
  const presentation = createMapPresentation();
  const graph = getSeedGraph();
  const visibleGraph = presentation.readGraph(graph);
  const positions = Object.fromEntries(visibleGraph.nodes.map((node, index) => [node.id, { x: index, y: -index }]));
  const resolved = presentation.resolvePositions(graph, positions, {}, {});

  assert.deepEqual(Object.keys(resolved).sort(), graph.nodes.map((node) => node.id).sort());
});
