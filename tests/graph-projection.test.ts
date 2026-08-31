import test from "node:test";
import assert from "node:assert/strict";
import {
  getModeCapabilities,
  getPublicMediaIds,
  normalizeMapMode,
  projectGraphForMode,
  type GraphInput,
} from "../src/graph-projection.ts";

const graphWithDraft: GraphInput = {
  profile: { id: "person", displayName: "Person", featuredMediaIds: ["shared"] },
  nodes: [
    { id: "person", type: "user" },
    { id: "shared", type: "media", format: "book", title: "Shared" },
    { id: "second-public", type: "media", format: "film", title: "Second public" },
    { id: "private-work", type: "media", format: "film", title: "Private" },
    {
      id: "published",
      type: "thought",
      status: "published",
      statement: "Public",
      anchors: ["shared", "second-public"],
    },
    {
      id: "draft",
      type: "thought",
      status: "draft",
      statement: "Private",
      anchors: ["shared", "private-work"],
    },
    { id: "unexpected", type: "thought", status: "queued", statement: "Not public" },
  ],
  edges: [
    { id: "author-published", source: "person", target: "published", kind: "authored" },
    { id: "anchor-published", source: "published", target: "shared", kind: "primary-anchor" },
    { id: "anchor-published-second", source: "published", target: "second-public", kind: "additional-anchor" },
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

const fullyPublishedGraph: GraphInput = {
  profile: { id: "person", displayName: "Person" },
  nodes: [
    { id: "person", type: "user" },
    { id: "work", type: "media", format: "book", title: "Public work" },
    {
      id: "thought",
      type: "thought",
      status: "published",
      statement: "Public thought",
      anchors: ["work"],
    },
  ],
  edges: [
    { id: "author", source: "person", target: "thought", kind: "authored" },
    { id: "anchor", source: "thought", target: "work", kind: "primary-anchor" },
  ],
};

test("owner projection is complete and isolated from its source", () => {
  const projection = projectGraphForMode(graphWithDraft, "owner");
  assert.deepEqual(projection, graphWithDraft);
  const draft = projection.nodes.find((node) => node.id === "draft");
  assert.ok(draft?.anchors);
  draft.anchors.push("changed");
  projection.profile.featuredMediaIds?.push("changed-featured");
  assert.deepEqual(
    graphWithDraft.nodes.find((node) => node.id === "draft")?.anchors,
    ["shared", "private-work"],
  );
  assert.deepEqual(graphWithDraft.profile.featuredMediaIds, ["shared"]);
});

test("visitor projection excludes non-published content, draft-only media, and dangling edges", () => {
  const projection = projectGraphForMode(graphWithDraft, "visitor");
  assert.deepEqual(
    projection.nodes.map((node) => node.id),
    ["person", "shared", "second-public", "published"],
  );
  assert.deepEqual(
    projection.edges.map((edge) => edge.id),
    ["author-published", "anchor-published", "anchor-published-second"],
  );
  assert.deepEqual(projection.profile, graphWithDraft.profile);
  projection.profile.displayName = "Changed visitor copy";
  assert.equal(graphWithDraft.profile.displayName, "Person");
});

test("a fully published graph projects without losing graph content", () => {
  const projection = projectGraphForMode(fullyPublishedGraph, "visitor");
  assert.deepEqual(
    projection.nodes.map((node) => node.id),
    fullyPublishedGraph.nodes.map((node) => node.id),
  );
  assert.deepEqual(
    projection.edges.map((edge) => edge.id),
    fullyPublishedGraph.edges.map((edge) => edge.id),
  );
});

test("public Media eligibility comes only from published visitor anchors", () => {
  assert.deepEqual([...getPublicMediaIds(graphWithDraft)], ["shared", "second-public"]);
});

test("unknown modes keep the complete owner projection", () => {
  assert.equal(normalizeMapMode("unexpected"), "owner");
  assert.deepEqual(projectGraphForMode(graphWithDraft, "unexpected"), graphWithDraft);
});

test("visitor capabilities preserve exploration and remove owner mutation", () => {
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
