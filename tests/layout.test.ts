import assert from "node:assert/strict";
import test from "node:test";
import { layoutGraph } from "../src/layout.ts";
import { getSeedGraph } from "../src/adapters/seed/prototype-seed.ts";

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

test("the accepted seed keeps its generated coordinates", () => {
  const graph = getSeedGraph();

  assert.deepEqual(layoutGraph(graph.nodes, graph.edges), {
    mira: { x: 0, y: 0 },
    "left-hand": { x: 125.86, y: 256.15 },
    dispossessed: { x: 376.68, y: 178.83 },
    bluets: { x: -165.21, y: 16.2 },
    arrival: { x: -277.34, y: 254.15 },
    "mood-for-love": { x: -394.75, y: -62.98 },
    aftersun: { x: -62.18, y: -311.27 },
    "thought-language": { x: -75.59, y: 223.96 },
    "thought-silence": { x: -226.09, y: -178.51 },
    "thought-memory": { x: 87.8, y: -172.99 },
    "thought-freedom": { x: 205.37, y: 68.07 },
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
      const point = positions[node.id];
      const otherPoint = positions[other.id];
      assert.ok(point && otherPoint, "each seeded node has a generated position");
      const distance = Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);
      assert.ok(distance >= 150, `${node.id} and ${other.id} are only ${distance}px apart`);
    });
  });
});
