import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_STORAGE_KEY,
  composeGraphWithDrafts,
  createDraft,
  editDraft,
  emptyDraftState,
  loadDraftState,
  normalizeDraftState,
  saveDraftState,
} from "../src/draft-state.js";
import { projectGraphForMode } from "../src/graph-projection.js";
import { getSeedGraph } from "../src/seed.js";

const validIds = new Set(["left-hand", "arrival"]);
const draftInput = {
  id: "draft-one",
  mediaId: "left-hand",
  statement: "  A border can become visible only after someone crosses it.  ",
  createdAt: "2026-08-23T12:00:00.000Z",
};

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test("a valid capture creates a private anchored Draft without mutating prior state", () => {
  const state = emptyDraftState();
  const result = createDraft(state, draftInput, validIds);
  assert.equal(result.changed, true);
  assert.deepEqual(state.drafts, []);
  assert.deepEqual(result.draft, {
    ...draftInput,
    status: "draft",
    statement: "A border can become visible only after someone crosses it.",
  });
});

test("capture requires a confirmed work and a non-empty authored statement", () => {
  const state = emptyDraftState();
  assert.equal(createDraft(state, { ...draftInput, mediaId: "missing" }, validIds).changed, false);
  assert.equal(createDraft(state, { ...draftInput, statement: "   " }, validIds).changed, false);
  assert.deepEqual(state, emptyDraftState());
});

test("editing changes only the private statement and keeps its anchor and timestamp", () => {
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const result = editDraft(created, "draft-one", "A changed private statement.");
  assert.equal(result.changed, true);
  assert.deepEqual(result.draft, {
    id: "draft-one",
    status: "draft",
    statement: "A changed private statement.",
    mediaId: "left-hand",
    createdAt: draftInput.createdAt,
  });
  assert.equal(created.drafts[0].statement, draftInput.statement.trim());
});

test("normalization drops corrupt, duplicate, unknown, and empty Draft records", () => {
  const value = {
    version: 0,
    drafts: [
      { ...draftInput, status: "published" },
      { ...draftInput, statement: "duplicate" },
      { ...draftInput, id: "draft-unknown", mediaId: "missing" },
      { ...draftInput, id: "draft-empty", statement: " " },
    ],
  };
  const result = normalizeDraftState(value, validIds);
  assert.equal(result.recovered, true);
  assert.deepEqual(result.state.drafts, [
    {
      ...draftInput,
      status: "draft",
      statement: draftInput.statement.trim(),
    },
  ]);
});

test("Draft state survives storage and reports an unavailable storage fallback", () => {
  const storage = memoryStorage();
  const state = createDraft(emptyDraftState(), draftInput, validIds).state;
  assert.equal(saveDraftState(storage, state), true);
  assert.match(storage.getItem(DRAFT_STORAGE_KEY), /draft-one/);
  assert.deepEqual(loadDraftState(storage, validIds).state, state);
  assert.equal(loadDraftState(null, validIds).storageError, true);
  assert.equal(saveDraftState(null, state), false);
});

test("composed owner graph adds authored Draft meaning while visitor projection omits it", () => {
  const baseGraph = getSeedGraph();
  const state = createDraft(emptyDraftState(), draftInput, validIds).state;
  const graph = composeGraphWithDrafts(baseGraph, state);
  const draft = graph.nodes.find((node) => node.id === "draft-one");
  assert.deepEqual(draft, {
    id: "draft-one",
    type: "thought",
    status: "draft",
    statement: draftInput.statement.trim(),
    anchors: ["left-hand"],
    createdAt: draftInput.createdAt,
  });
  assert.ok(graph.edges.some((edge) => edge.id === "authored-draft-one"));
  assert.ok(graph.edges.some((edge) => edge.id === "anchor-draft-one-left-hand"));
  assert.equal(baseGraph.nodes.some((node) => node.id === "draft-one"), false);
  assert.equal(
    projectGraphForMode(graph, "visitor").nodes.some((node) => node.id === "draft-one"),
    false,
  );
});
