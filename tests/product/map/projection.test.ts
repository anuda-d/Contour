import assert from "node:assert/strict";
import test from "node:test";
import { createDraft, emptyDraftState, publishDraft } from "../../../src/product/authorship/draft-state.ts";
import { buildMapGraph } from "../../../src/product/map/map-graph.ts";
import { getModeCapabilities, normalizeMapMode, projectGraphForMode } from "../../../src/product/map/projection.ts";
import { getPrototypeFacts } from "../../../src/adapters/seed/prototype-seed.ts";
import { getCatalogue } from "../../../src/product/catalogue/catalogue.ts";

const facts = { prototype: getPrototypeFacts(), catalogue: getCatalogue() };

test("owner projection is complete and isolated from the supplied Map representation", () => {
  const source = buildMapGraph(facts, emptyDraftState());
  const projection = projectGraphForMode(source, "owner");
  assert.deepEqual(projection, source);
  projection.nodes.find((node) => node.type === "thought")?.anchors.push("changed");
  projection.profile.featuredMediaIds.push("changed-featured");
  assert.equal(source.nodes.some((node) => node.type === "thought" && node.anchors.includes("changed")), false);
  assert.equal(source.profile.featuredMediaIds.includes("changed-featured"), false);
});

test("visitor projection excludes Drafts and draft-only Media without treating the graph as fact authority", () => {
  const draftState = createDraft(emptyDraftState(), {
    id: "draft-private", primaryMediaId: "left-hand", statement: "Private", createdAt: "2026-09-06T18:00:00.000Z",
  }, new Set(["left-hand"])).state;
  const source = buildMapGraph(facts, draftState);
  const visitor = projectGraphForMode(source, "visitor");
  assert.equal(visitor.nodes.some((node) => node.id === "draft-private"), false);
  assert.equal(visitor.nodes.some((node) => node.type === "thought" && node.status === "draft"), false);
  assert.equal(visitor.edges.some((edge) => edge.source === "draft-private"), false);
});

test("visitor projection excludes a Media work anchored only by a private Draft", () => {
  const privateFacts = {
    catalogue: [
      { id: "public-work", format: "book" as const, title: "Public", creator: "Author", year: 2001 },
      { id: "private-work", format: "film" as const, title: "Private", creator: "Director", year: 2002 },
    ],
    prototype: {
      owner: {
        profile: { id: "owner", displayName: "Owner", handle: "@owner", initials: "O", identityLine: "Private Map" },
        mapIdentity: { id: "owner-node", label: "Owner", note: "Private Map" },
      },
      seededThoughts: [{ id: "published-seed", status: "published" as const, statement: "Public", primaryMediaId: "public-work" }],
      defaultFeaturedMediaIds: ["public-work"],
    },
  };
  const draft = createDraft(emptyDraftState(), {
    id: "draft-private-media", primaryMediaId: "private-work", statement: "Private", createdAt: "2026-09-06T20:30:00.000Z",
  }, new Set(["private-work"])).state;
  const visitor = projectGraphForMode(buildMapGraph(privateFacts, draft), "visitor");
  assert.equal(visitor.nodes.some((node) => node.id === "private-work"), false);
  assert.equal(visitor.nodes.some((node) => node.id === "draft-private-media"), false);
});

test("published persisted Thoughts become visible through the projection", () => {
  const drafted = createDraft(emptyDraftState(), {
    id: "draft-public", primaryMediaId: "arrival", statement: "Public", createdAt: "2026-09-06T18:00:00.000Z",
  }, new Set(["arrival"])).state;
  const published = publishDraft(drafted, "draft-public", "2026-09-06T18:01:00.000Z", new Set(["arrival"])).state;
  const visitor = projectGraphForMode(buildMapGraph(facts, published), "visitor");
  assert.equal(visitor.nodes.some((node) => node.id === "draft-public"), true);
});

test("unknown modes remain owner projections and visitor capabilities remove mutation", () => {
  const source = buildMapGraph(facts, emptyDraftState());
  assert.equal(normalizeMapMode("unexpected"), "owner");
  assert.deepEqual(projectGraphForMode(source, "unexpected"), source);
  assert.deepEqual(getModeCapabilities("visitor"), {
    mode: "visitor", canChooseWorks: false, canCaptureThoughts: false,
    canFeatureMedia: false, canShapeNodes: false, canResetPositions: false,
  });
});
