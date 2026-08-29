import test from "node:test";
import assert from "node:assert/strict";
import {
  THOUGHT_VERSION,
  composeGraphWithDrafts,
  connectDraft,
  createDraft,
  editDraft,
  emptyDraftState,
  mergeDraftStates,
  normalizeDraftState,
  publishDraft,
  type ThoughtGraph,
} from "../../../src/product/authorship/draft-state.ts";

const validIds = new Set(["left-hand", "arrival"]);
const input = { id: "draft-one", primaryMediaId: "left-hand", statement: "  A border becomes visible after someone crosses it.  ", createdAt: "2026-08-23T12:00:00.000Z" };

test("creating a Draft validates its anchor and preserves prior state", () => {
  const empty = emptyDraftState();
  const result = createDraft(empty, input, validIds);
  assert.equal(result.changed, true);
  assert.deepEqual(empty, emptyDraftState());
  assert.deepEqual(result.state.thoughts[0]!, { ...input, status: "draft", statement: input.statement.trim() });
  assert.equal(createDraft(empty, { ...input, primaryMediaId: "missing" }, validIds).changed, false);
  assert.equal(createDraft(empty, { ...input, statement: " " }, validIds).changed, false);
  assert.equal(createDraft(empty, { ...input, createdAt: undefined }, validIds).changed, false);
});

test("only a private Draft can be edited, bridged, and published", () => {
  const created = createDraft(emptyDraftState(), input, validIds).state;
  const edited = editDraft(created, input.id, "A changed private statement.");
  const bridged = connectDraft(edited.state, input.id, { secondaryMediaId: "arrival", statement: "A bridge keeps authorship explicit." }, validIds);
  const published = publishDraft(bridged.state, input.id, "2026-08-24T09:30:00.000Z", validIds);
  assert.equal(edited.changed, true);
  assert.equal(bridged.changed, true);
  assert.equal(published.changed, true);
  assert.equal(published.state.thoughts[0]!.status, "published");
  assert.equal(editDraft(published.state, input.id, "stale").changed, false);
  assert.equal(connectDraft(published.state, input.id, { secondaryMediaId: "arrival", statement: "stale" }, validIds).changed, false);
});

test("normalization migrates V1 and refuses to infer public visibility", () => {
  const normalized = normalizeDraftState({
    version: 1,
    thoughts: [
      { ...input, mediaId: "left-hand", status: "published", publishedAt: "not-a-date" },
      { ...input, id: "draft-public", mediaId: "left-hand", status: "published", publishedAt: "2026-08-24T09:30:00.000Z" },
      { ...input, id: "invalid", mediaId: "left-hand" },
    ],
  }, validIds);
  assert.equal(normalized.recovered, true);
  assert.equal(normalized.state.version, THOUGHT_VERSION);
  assert.deepEqual(normalized.state.thoughts.map((thought) => thought.status), ["draft", "published"]);
});

test("normalization keeps a Thought while stripping an invalid secondary anchor", () => {
  const normalized = normalizeDraftState({ version: THOUGHT_VERSION, thoughts: [{ ...input, status: "draft", statement: input.statement.trim(), secondaryMediaId: "left-hand" }] }, validIds);
  assert.equal(normalized.recovered, true);
  assert.equal(normalized.state.thoughts[0]!.secondaryMediaId, undefined);
});

test("merge is immutable, preserves independent fields, and makes publication irreversible", () => {
  const initial = createDraft(emptyDraftState(), input, validIds).state;
  const edited = editDraft(initial, input.id, "A newer private statement.").state;
  const bridged = connectDraft(initial, input.id, { secondaryMediaId: "arrival", statement: initial.thoughts[0]!.statement }, validIds).state;
  const withEdit = mergeDraftStates(initial, edited, { id: input.id, fields: ["statement"] });
  const merged = mergeDraftStates(withEdit, bridged, { id: input.id, fields: ["secondaryMediaId"] });
  assert.equal(merged.thoughts[0]!.statement, "A newer private statement.");
  assert.equal(merged.thoughts[0]!.secondaryMediaId, "arrival");
  const published = publishDraft(merged, input.id, "2026-08-24T09:30:00.000Z", validIds).state;
  const stale = mergeDraftStates(published, initial, { id: input.id, fields: ["statement"] });
  assert.deepEqual(stale, published);
  assert.notEqual(stale, published);
});

test("graph composition is rebuildable output with authored anchor meaning", () => {
  const baseGraph: ThoughtGraph = { profile: { id: "person" }, nodes: [{ id: "person", type: "user" }, { id: "left-hand", type: "media" }], edges: [] };
  const state = createDraft(emptyDraftState(), input, validIds).state;
  const graph = composeGraphWithDrafts(baseGraph, state);
  assert.equal(baseGraph.nodes.some((node) => node.id === input.id), false);
  assert.deepEqual(graph.nodes.find((node) => node.id === input.id)?.anchors, ["left-hand"]);
  assert.ok(graph.edges.some((edge) => edge.id === `authored-${input.id}`));
});

test("editing preserves its anchor and timestamp without mutating the prior Draft", () => {
  const created = createDraft(emptyDraftState(), input, validIds).state;
  const edited = editDraft(created, input.id, "A changed private statement.");
  assert.equal(created.thoughts[0]!.statement, input.statement.trim());
  assert.equal(edited.state.thoughts[0]!.primaryMediaId, input.primaryMediaId);
  assert.equal(edited.state.thoughts[0]!.createdAt, input.createdAt);
});

test("publication rejects an invalid timestamp or an invalid current anchor", () => {
  const created = createDraft(emptyDraftState(), input, validIds).state;
  const invalidAnchor = { ...created, thoughts: [{ ...created.thoughts[0]!, primaryMediaId: "missing" }] };
  assert.equal(publishDraft(created, input.id, "not-a-date", validIds).changed, false);
  assert.equal(publishDraft(invalidAnchor, input.id, "2026-08-24T09:30:00.000Z", validIds).changed, false);
});

test("a canonical empty current envelope does not claim recovery", () => {
  const normalized = normalizeDraftState({ version: THOUGHT_VERSION }, validIds);
  assert.equal(normalized.recovered, false);
  assert.equal(normalized.recoveryNotice, false);
  assert.deepEqual(normalized.state, emptyDraftState());
});

test("field-scoped merge removes only a deliberately cleared bridge anchor", () => {
  const initial = connectDraft(
    createDraft(emptyDraftState(), input, validIds).state,
    input.id,
    { secondaryMediaId: "arrival", statement: input.statement },
    validIds,
  ).state;
  const withoutBridge = { ...initial, thoughts: [{ ...initial.thoughts[0]! }] };
  delete withoutBridge.thoughts[0]!.secondaryMediaId;
  const merged = mergeDraftStates(initial, withoutBridge, { id: input.id, fields: ["secondaryMediaId"] });
  assert.equal(merged.thoughts[0]!.secondaryMediaId, undefined);
  assert.equal(merged.thoughts[0]!.statement, input.statement.trim());
});

test("published composition preserves Thought identity and publication metadata", () => {
  const published = publishDraft(
    createDraft(emptyDraftState(), input, validIds).state,
    input.id,
    "2026-08-24T09:30:00.000Z",
    validIds,
  ).state;
  const graph = composeGraphWithDrafts({ profile: {}, nodes: [], edges: [] }, published);
  const thought = graph.nodes.find((node) => node.id === input.id);
  assert.equal(thought?.status, "published");
  assert.equal(thought?.publishedAt, "2026-08-24T09:30:00.000Z");
});
