import test from "node:test";
import assert from "node:assert/strict";
import { layoutGraph } from "../src/layout.js";
import { getSeedGraph } from "../src/seed.js";

test("the generated layout is deterministic and finite", () => {
  const graph = getSeedGraph();
  const first = layoutGraph(graph.nodes, graph.edges);
  const second = layoutGraph(graph.nodes, graph.edges);

  assert.deepEqual(first, second);
  Object.values(first).forEach((point) => {
    assert.ok(Number.isFinite(point.x));
    assert.ok(Number.isFinite(point.y));
  });
});

test("the owner remains the stable centre", () => {
  const graph = getSeedGraph();
  const positions = layoutGraph(graph.nodes, graph.edges);
  assert.deepEqual(positions.mira, { x: 0, y: 0 });
});

test("authored relationships affect the generated shape", () => {
  const graph = getSeedGraph();
  const connected = layoutGraph(graph.nodes, graph.edges);
  const withoutOneAnchor = layoutGraph(
    graph.nodes,
    graph.edges.filter((edge) => edge.id !== "anchor-thought-language-left-hand"),
  );

  assert.notDeepEqual(connected["left-hand"], withoutOneAnchor["left-hand"]);
  assert.notDeepEqual(connected["thought-language"], withoutOneAnchor["thought-language"]);
});

test("the generated starting shape keeps node centres visibly separated", () => {
  const graph = getSeedGraph();
  const positions = layoutGraph(graph.nodes, graph.edges);

  graph.nodes.forEach((node, index) => {
    graph.nodes.slice(index + 1).forEach((other) => {
      const distance = Math.hypot(
        positions[node.id].x - positions[other.id].x,
        positions[node.id].y - positions[other.id].y,
      );
      assert.ok(distance >= 150, `${node.id} and ${other.id} are only ${distance}px apart`);
    });
  });
});
