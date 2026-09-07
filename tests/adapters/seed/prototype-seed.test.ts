import assert from "node:assert/strict";
import test from "node:test";
import { getPrototypeFacts, parsePrototypeSeed } from "../../../src/adapters/seed/prototype-seed.ts";
import { getCatalogue } from "../../../src/product/catalogue/catalogue.ts";
import { emptyDraftState } from "../../../src/product/authorship/draft-state.ts";
import { buildMapGraph } from "../../../src/product/map/map-graph.ts";

function rawSeed() {
  const facts = getPrototypeFacts();
  const graph = buildMapGraph({ prototype: facts, catalogue: getCatalogue() }, emptyDraftState());
  return structuredClone(graph);
}

test("the seed boundary returns typed owner and authored facts, not a graph authority", () => {
  const facts = getPrototypeFacts();
  assert.equal(facts.owner.profile.id, "mira-vale");
  assert.equal(facts.owner.mapIdentity.id, "mira");
  assert.ok(facts.seededThoughts.length >= 3);
  assert.ok(facts.seededThoughts.every((thought) => thought.status === "published"));
  assert.equal("nodes" in facts, false);
  assert.equal("edges" in facts, false);
});

test("fresh facts rebuild the accepted editable Map output", () => {
  const first = buildMapGraph({ prototype: getPrototypeFacts(), catalogue: getCatalogue() }, emptyDraftState());
  const second = buildMapGraph({ prototype: getPrototypeFacts(), catalogue: getCatalogue() }, emptyDraftState());
  first.profile.displayName = "Changed locally";
  first.nodes.find((node) => node.type === "thought")?.anchors.push("local-only");
  assert.notEqual(first.profile.displayName, second.profile.displayName);
  assert.ok(second.nodes.filter((node) => node.type === "thought").every((thought) => !thought.anchors.includes("local-only")));
});

test("the seed parser rejects malformed product facts and redundant relationship input", () => {
  const invalidProfile = rawSeed();
  invalidProfile.profile.featuredMediaIds = ["arrival", "arrival", "aftersun"];
  assert.throws(() => parsePrototypeSeed(invalidProfile), /featuredMediaIds must not contain duplicates/);

  const invalidThought = rawSeed();
  const thought = invalidThought.nodes.find((node) => node.type === "thought");
  assert.ok(thought && thought.type === "thought");
  thought.anchors = ["unavailable-work"];
  assert.throws(() => parsePrototypeSeed(invalidThought), /anchors an unavailable Media work/);

  const tooManyAnchors = rawSeed();
  const bridgedThought = tooManyAnchors.nodes.find((node) => node.type === "thought");
  assert.ok(bridgedThought && bridgedThought.type === "thought");
  bridgedThought.anchors = ["arrival", "left-hand", "bluets"];
  assert.throws(() => parsePrototypeSeed(tooManyAnchors), /must not contain more than two works/);

  const invalidNode = rawSeed();
  (invalidNode.nodes as unknown[]).push({ id: "mira", type: "theme" });
  assert.throws(() => parsePrototypeSeed(invalidNode), /id duplicates mira/);

  const invalidEdge = rawSeed();
  invalidEdge.edges[0] = { ...invalidEdge.edges[0]!, target: "arrival" };
  assert.throws(() => parsePrototypeSeed(invalidEdge), /canonical order/);
});
