import test from "node:test";
import assert from "node:assert/strict";
import {
  getModeCapabilities,
  getPublicMediaIds,
  normalizeMapMode,
  projectGraphForMode,
} from "../src/graph-projection.js";
import { getSeedGraph } from "../src/seed.js";

const graphWithDraft = {
  profile: { id: "person", displayName: "Person" },
  nodes: [
    { id: "person", type: "user" },
    { id: "shared", type: "media", format: "book", title: "Shared" },
    { id: "private-work", type: "media", format: "film", title: "Private" },
    {
      id: "published",
      type: "thought",
      status: "published",
      statement: "Public",
      anchors: ["shared"],
    },
    {
      id: "draft",
      type: "thought",
      status: "draft",
      statement: "Private",
      anchors: ["shared", "private-work"],
    },
  ],
  edges: [
    { id: "author-published", source: "person", target: "published", kind: "authored" },
    { id: "anchor-published", source: "published", target: "shared", kind: "primary-anchor" },
    { id: "author-draft", source: "person", target: "draft", kind: "authored" },
    { id: "anchor-draft-shared", source: "draft", target: "shared", kind: "primary-anchor" },
    {
      id: "anchor-draft-private",
      source: "draft",
      target: "private-work",
      kind: "additional-anchor",
    },
  ],
};

test("owner projection is complete and isolated from its source", () => {
  const projection = projectGraphForMode(graphWithDraft, "owner");
  assert.deepEqual(projection, graphWithDraft);
  projection.nodes.find((node) => node.id === "draft").anchors.push("changed");
  assert.deepEqual(
    graphWithDraft.nodes.find((node) => node.id === "draft").anchors,
    ["shared", "private-work"],
  );
});

test("visitor projection excludes drafts, draft-only media, and dangling edges", () => {
  const projection = projectGraphForMode(graphWithDraft, "visitor");
  assert.deepEqual(
    projection.nodes.map((node) => node.id),
    ["person", "shared", "published"],
  );
  assert.deepEqual(
    projection.edges.map((edge) => edge.id),
    ["author-published", "anchor-published"],
  );
  assert.deepEqual(projection.profile, graphWithDraft.profile);
  projection.profile.displayName = "Changed visitor copy";
  assert.equal(graphWithDraft.profile.displayName, "Person");
});

test("the fully published seed projects without losing graph content", () => {
  const graph = getSeedGraph();
  const projection = projectGraphForMode(graph, "visitor");
  assert.deepEqual(
    projection.nodes.map((node) => node.id),
    graph.nodes.map((node) => node.id),
  );
  assert.deepEqual(
    projection.edges.map((edge) => edge.id),
    graph.edges.map((edge) => edge.id),
  );
});

test("public Media eligibility comes only from the visitor projection", () => {
  assert.deepEqual([...getPublicMediaIds(graphWithDraft)], ["shared"]);
});

test("visitor capabilities preserve exploration and remove owner mutation", () => {
  assert.equal(normalizeMapMode("unexpected"), "owner");
  assert.deepEqual(getModeCapabilities("visitor"), {
    mode: "visitor",
    canChooseWorks: false,
    canCaptureThoughts: false,
    canFeatureMedia: false,
    canShapeNodes: false,
    canResetPositions: false,
  });
  assert.deepEqual(getModeCapabilities("owner"), {
    mode: "owner",
    canChooseWorks: true,
    canCaptureThoughts: true,
    canFeatureMedia: true,
    canShapeNodes: true,
    canResetPositions: true,
  });
});
