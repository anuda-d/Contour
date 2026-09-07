import assert from "node:assert/strict";
import test from "node:test";
import { getPrototypeFacts } from "../../../src/adapters/seed/prototype-seed.ts";
import { getCatalogue } from "../../../src/product/catalogue/catalogue.ts";
import { createDraft, emptyDraftState, publishDraft } from "../../../src/product/authorship/draft-state.ts";
import { buildMapGraph } from "../../../src/product/map/map-graph.ts";

const mapFacts = { prototype: getPrototypeFacts(), catalogue: getCatalogue() };

test("Map graph assembly derives the accepted seeded relationship order from typed facts", () => {
  const graph = buildMapGraph(mapFacts, emptyDraftState());
  assert.deepEqual(graph.edges.map((edge) => edge.id), [
    "authored-thought-language",
    "authored-thought-silence",
    "authored-thought-memory",
    "authored-thought-freedom",
    "anchor-thought-language-arrival",
    "anchor-thought-language-left-hand",
    "anchor-thought-silence-mood-for-love",
    "anchor-thought-silence-bluets",
    "anchor-thought-memory-aftersun",
    "anchor-thought-memory-bluets",
    "anchor-thought-freedom-dispossessed",
    "anchor-thought-freedom-left-hand",
  ]);
});

test("Map graph assembly derives persisted authorship without mutating product facts", () => {
  const draft = createDraft(emptyDraftState(), {
    id: "draft-map-assembly",
    primaryMediaId: "arrival",
    statement: "A private Map projection.",
    createdAt: "2026-09-06T20:30:00.000Z",
  }, new Set(["arrival", "left-hand"])).state;
  const graph = buildMapGraph(mapFacts, draft);
  assert.deepEqual(graph.nodes.find((node) => node.id === "draft-map-assembly"), {
    id: "draft-map-assembly",
    type: "thought",
    status: "draft",
    statement: "A private Map projection.",
    anchors: ["arrival"],
    createdAt: "2026-09-06T20:30:00.000Z",
  });
  assert.deepEqual(graph.edges.slice(-2), [
    { id: "authored-draft-map-assembly", source: "mira", target: "draft-map-assembly", kind: "authored" },
    { id: "anchor-draft-map-assembly-arrival", source: "draft-map-assembly", target: "arrival", kind: "primary-anchor" },
  ]);
  assert.equal(mapFacts.prototype.seededThoughts.some((thought) => thought.id === "draft-map-assembly"), false);
});

test("published persisted facts retain their publication metadata in the rebuildable output", () => {
  const draft = createDraft(emptyDraftState(), {
    id: "draft-published-assembly",
    primaryMediaId: "arrival",
    statement: "A public Map projection.",
    createdAt: "2026-09-06T20:30:00.000Z",
  }, new Set(["arrival"])).state;
  const published = publishDraft(draft, "draft-published-assembly", "2026-09-06T20:31:00.000Z", new Set(["arrival"])).state;
  const thought = buildMapGraph(mapFacts, published).nodes.find((node) => node.id === "draft-published-assembly");
  assert.equal(thought?.type, "thought");
  assert.equal(thought?.type === "thought" ? thought.publishedAt : null, "2026-09-06T20:31:00.000Z");
});
