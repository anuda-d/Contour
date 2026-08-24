import test from "node:test";
import assert from "node:assert/strict";
import { getSeedGraph } from "../src/seed.js";

test("the seed contains only owner, Thought, Book, and Film node semantics", () => {
  const graph = getSeedGraph();
  const media = graph.nodes.filter((node) => node.type === "media");
  const thoughts = graph.nodes.filter((node) => node.type === "thought");

  assert.equal(graph.nodes.filter((node) => node.type === "user").length, 1);
  assert.ok(media.some((node) => node.format === "book"));
  assert.ok(media.some((node) => node.format === "film"));
  assert.ok(thoughts.length >= 3);
  assert.ok(graph.nodes.every((node) => !["theme", "rating", "review"].includes(node.type)));
});

test("every published Thought is media-grounded and every edge resolves", () => {
  const graph = getSeedGraph();
  const ids = new Set(graph.nodes.map((node) => node.id));
  const thoughts = graph.nodes.filter((node) => node.type === "thought");

  thoughts.forEach((thought) => {
    assert.equal(thought.status, "published");
    assert.ok(thought.anchors.length >= 1);
    thought.anchors.forEach((anchor) => assert.ok(ids.has(anchor)));
  });
  graph.edges.forEach((edge) => {
    assert.ok(ids.has(edge.source));
    assert.ok(ids.has(edge.target));
  });
  assert.ok(thoughts.some((thought) => thought.anchors.length > 1));
});

test("the seed graph is returned as a fresh editable copy", () => {
  const first = getSeedGraph();
  const second = getSeedGraph();
  first.profile.displayName = "Changed locally";
  first.profile.featuredMediaIds.push("local-only");
  first.nodes[0].label = "Changed locally";
  first.nodes.find((node) => node.type === "thought").anchors.push("local-only");
  assert.notEqual(first.profile.displayName, second.profile.displayName);
  assert.ok(!second.profile.featuredMediaIds.includes("local-only"));
  assert.notEqual(first.nodes[0].label, second.nodes[0].label);
  assert.ok(
    second.nodes
      .filter((node) => node.type === "thought")
      .every((node) => !node.anchors.includes("local-only")),
  );
});

test("seed featured Media are deliberate, unique, and public Map works", () => {
  const graph = getSeedGraph();
  const ids = new Set(graph.profile.featuredMediaIds);
  const mediaIds = new Set(
    graph.nodes.filter((node) => node.type === "media").map((node) => node.id),
  );

  assert.equal(ids.size, 3);
  ids.forEach((id) => assert.ok(mediaIds.has(id)));
  assert.ok(
    [...ids].every((id) =>
      graph.nodes.some(
        (thought) => thought.type === "thought" && thought.status === "published" && thought.anchors.includes(id),
      ),
    ),
  );
});
