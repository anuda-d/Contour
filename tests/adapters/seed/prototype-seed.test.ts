import test from "node:test";
import assert from "node:assert/strict";
import { getSeedGraph, parsePrototypeSeed } from "../../../src/adapters/seed/prototype-seed.ts";

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
  const firstOwner = first.nodes.find((node) => node.type === "user");
  const firstThought = first.nodes.find((node) => node.type === "thought");

  assert.ok(firstOwner);
  assert.ok(firstThought);
  first.profile.displayName = "Changed locally";
  first.profile.featuredMediaIds.push("local-only");
  firstOwner.label = "Changed locally";
  firstThought.anchors.push("local-only");
  assert.notEqual(first.profile.displayName, second.profile.displayName);
  assert.ok(!second.profile.featuredMediaIds.includes("local-only"));
  assert.notEqual(
    firstOwner.label,
    second.nodes.find((node) => node.type === "user")?.label,
  );
  assert.ok(
    second.nodes
      .filter((node) => node.type === "thought")
      .every((thought) => !thought.anchors.includes("local-only")),
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

test("the seed adapter validates complete trusted graph facts at its boundary", () => {
  const valid = getSeedGraph();
  const parsed = parsePrototypeSeed(valid);

  assert.deepEqual(parsed, valid);
  assert.notEqual(parsed, valid);
  assert.notEqual(parsed.profile, valid.profile);
  assert.notEqual(parsed.nodes, valid.nodes);
  assert.notEqual(parsed.edges, valid.edges);
});

test("the seed adapter rejects malformed profile, node, and relationship facts", () => {
  const malformed = (): ReturnType<typeof getSeedGraph> => structuredClone(getSeedGraph());

  const invalidProfile = malformed();
  invalidProfile.profile.featuredMediaIds = ["arrival", "arrival", "aftersun"];
  assert.throws(() => parsePrototypeSeed(invalidProfile), /Prototype seed is invalid: profile\.featuredMediaIds must not contain duplicates\./);

  const invalidMedia = malformed();
  const media = invalidMedia.nodes.find((node) => node.type === "media");
  assert.ok(media && media.type === "media");
  media.title = "Different title";
  assert.throws(() => parsePrototypeSeed(invalidMedia), /Prototype seed is invalid: nodes\[\d+\] must match its supported catalogue work\./);

  const invalidThought = malformed();
  const thought = invalidThought.nodes.find((node) => node.type === "thought");
  assert.ok(thought && thought.type === "thought");
  thought.anchors = ["unavailable-work"];
  assert.throws(() => parsePrototypeSeed(invalidThought), /Prototype seed is invalid: Thought .+ anchors an unavailable Media work\./);

  const invalidFeatured = malformed();
  invalidFeatured.profile.featuredMediaIds = ["arrival", "mood-for-love", "unavailable-work"];
  assert.throws(() => parsePrototypeSeed(invalidFeatured), /Prototype seed is invalid: profile\.featuredMediaIds must name public Media works\./);

  const invalidEdge = malformed();
  const firstEdge = invalidEdge.edges[0];
  assert.ok(firstEdge);
  invalidEdge.edges[0] = { ...firstEdge, target: "arrival" };
  assert.throws(() => parsePrototypeSeed(invalidEdge), /Prototype seed is invalid: edges\[0\] does not match an authored or anchored Thought relationship\./);
});
