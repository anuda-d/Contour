import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_STORAGE_KEY,
  THOUGHT_STORAGE_KEY,
  composeGraphWithDrafts,
  createDraft,
  editDraft,
  emptyDraftState,
  loadDraftState,
  mergeDraftStates,
  normalizeDraftState,
  persistDraftState,
  publishDraft,
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
  assert.deepEqual(state.thoughts, []);
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
  assert.equal(created.thoughts[0].statement, draftInput.statement.trim());
});

test("publishing changes exactly one anchored Draft without changing its identity", () => {
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const publishedAt = "2026-08-24T09:30:00.000Z";
  const result = publishDraft(created, "draft-one", publishedAt);

  assert.equal(result.changed, true);
  assert.deepEqual(created.thoughts[0], {
    ...draftInput,
    status: "draft",
    statement: draftInput.statement.trim(),
  });
  assert.deepEqual(result.thought, {
    ...created.thoughts[0],
    status: "published",
    publishedAt,
  });
  assert.equal(result.state.thoughts.length, 1);
});

test("publishing rejects a missing, already published, unanchored, or invalidly timed Draft", () => {
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const published = publishDraft(created, "draft-one", "2026-08-24T09:30:00.000Z").state;
  const unanchored = {
    ...created,
    thoughts: [{ ...created.thoughts[0], mediaId: "" }],
  };

  assert.equal(publishDraft(created, "missing", "2026-08-24T09:30:00.000Z").changed, false);
  assert.equal(publishDraft(published, "draft-one", "2026-08-24T10:00:00.000Z").changed, false);
  assert.equal(publishDraft(unanchored, "draft-one", "2026-08-24T10:00:00.000Z").changed, false);
  assert.equal(publishDraft(created, "draft-one", "not-a-date").changed, false);
  assert.equal(publishDraft(created, "draft-one", "1").changed, false);
  assert.equal(created.thoughts[0].status, "draft");
});

test("normalization drops corrupt records and never infers public visibility", () => {
  const value = {
    version: 0,
    thoughts: [
      { ...draftInput, status: "published", publishedAt: "1" },
      { ...draftInput, statement: "duplicate" },
      { ...draftInput, id: "draft-unknown", mediaId: "missing" },
      { ...draftInput, id: "draft-empty", statement: " " },
      {
        ...draftInput,
        id: "draft-public",
        status: "published",
        publishedAt: "2026-08-24T09:30:00.000Z",
      },
    ],
  };
  const result = normalizeDraftState(value, validIds);
  assert.equal(result.recovered, true);
  assert.deepEqual(result.state.thoughts, [
    {
      ...draftInput,
      status: "draft",
      statement: draftInput.statement.trim(),
    },
    {
      ...draftInput,
      id: "draft-public",
      status: "published",
      statement: draftInput.statement.trim(),
      publishedAt: "2026-08-24T09:30:00.000Z",
    },
  ]);
});

test("authored Thought state survives storage and reports an unavailable storage fallback", () => {
  const storage = memoryStorage();
  const state = createDraft(emptyDraftState(), draftInput, validIds).state;
  assert.equal(persistDraftState(storage, state, validIds, "draft-one").saved, true);
  assert.match(storage.getItem(THOUGHT_STORAGE_KEY), /draft-one/);
  assert.equal(storage.getItem(DRAFT_STORAGE_KEY), null);
  assert.deepEqual(loadDraftState(storage, validIds).state, state);
  assert.equal(loadDraftState(null, validIds).storageError, true);
  assert.equal(persistDraftState(null, state, validIds).saved, false);
});

test("legacy Drafts migrate once and the lifecycle store always takes precedence", () => {
  const storage = memoryStorage();
  storage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      drafts: [{ ...draftInput, status: "draft", statement: draftInput.statement.trim() }],
    }),
  );
  const migrated = loadDraftState(storage, validIds);
  assert.equal(migrated.migrated, true);
  assert.equal(migrated.recoveryNotice, false);
  assert.equal(migrated.state.thoughts[0].status, "draft");

  const published = publishDraft(
    migrated.state,
    "draft-one",
    "2026-08-24T09:30:00.000Z",
  ).state;
  assert.equal(persistDraftState(storage, published, validIds, "draft-one").saved, true);
  assert.equal(loadDraftState(storage, validIds).state.thoughts[0].status, "published");

  storage.setItem(THOUGHT_STORAGE_KEY, "corrupt");
  const recovered = loadDraftState(storage, validIds);
  assert.equal(recovered.recovered, true);
  assert.deepEqual(recovered.state.thoughts, []);
});

test("legacy migration accepts an iterable catalogue id collection", () => {
  const storage = memoryStorage();
  storage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      drafts: [{ ...draftInput, statement: draftInput.statement.trim() }],
    }),
  );

  const migrated = loadDraftState(storage, ["left-hand", "arrival"]);
  assert.equal(migrated.state.thoughts.length, 1);
  assert.equal(migrated.state.thoughts[0].id, "draft-one");
});

test("a stale tab cannot undo publication or lose a newly created Draft", () => {
  const storage = memoryStorage();
  const initial = createDraft(emptyDraftState(), draftInput, validIds).state;
  assert.equal(persistDraftState(storage, initial, validIds).saved, true);
  const tabA = loadDraftState(storage, validIds).state;
  const tabB = loadDraftState(storage, validIds).state;

  const published = publishDraft(tabA, "draft-one", "2026-08-24T09:30:00.000Z").state;
  assert.equal(persistDraftState(storage, published, validIds, "draft-one").saved, true);
  const withSecondDraft = createDraft(
    tabB,
    {
      id: "draft-two",
      mediaId: "arrival",
      statement: "A second tab keeps its new Thought.",
      createdAt: "2026-08-24T09:31:00.000Z",
    },
    validIds,
  ).state;
  const merged = persistDraftState(storage, withSecondDraft, validIds, "draft-two");

  assert.equal(merged.saved, true);
  assert.deepEqual(
    merged.state.thoughts.map(({ id, status }) => ({ id, status })),
    [
      { id: "draft-one", status: "published" },
      { id: "draft-two", status: "draft" },
    ],
  );
  assert.equal(merged.state.thoughts[0].publishedAt, "2026-08-24T09:30:00.000Z");
  assert.deepEqual(loadDraftState(storage, validIds).state, merged.state);
});

test("lifecycle merging is immutable and Published state wins over stale Draft state", () => {
  const draft = createDraft(emptyDraftState(), draftInput, validIds).state;
  const published = publishDraft(draft, "draft-one", "2026-08-24T09:30:00.000Z").state;
  const merged = mergeDraftStates(
    published,
    {
      ...draft,
      thoughts: [{ ...draft.thoughts[0], statement: "A stale private edit." }],
    },
    "draft-one",
  );

  assert.deepEqual(merged, published);
  assert.notEqual(merged, published);
  assert.notEqual(merged.thoughts[0], published.thoughts[0]);
});

test("saving a new Draft from a stale tab preserves unrelated private edits", () => {
  const storage = memoryStorage();
  const initial = createDraft(emptyDraftState(), draftInput, validIds).state;
  persistDraftState(storage, initial, validIds, "draft-one");
  const staleTab = loadDraftState(storage, validIds).state;
  const edited = editDraft(initial, "draft-one", "The current private edit.").state;
  persistDraftState(storage, edited, validIds, "draft-one");

  const withSecondDraft = createDraft(
    staleTab,
    {
      id: "draft-two",
      mediaId: "arrival",
      statement: "A second tab keeps its new Thought.",
      createdAt: "2026-08-24T09:31:00.000Z",
    },
    validIds,
  ).state;
  const merged = persistDraftState(storage, withSecondDraft, validIds, "draft-two").state;

  assert.equal(
    merged.thoughts.find((thought) => thought.id === "draft-one").statement,
    "The current private edit.",
  );
  assert.ok(merged.thoughts.some((thought) => thought.id === "draft-two"));
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

test("publication keeps the same graph identity and reveals exactly that Thought to visitors", () => {
  const baseGraph = getSeedGraph();
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const state = publishDraft(created, "draft-one", "2026-08-24T09:30:00.000Z").state;
  const graph = composeGraphWithDrafts(baseGraph, state);
  const thought = graph.nodes.find((node) => node.id === "draft-one");
  const visitor = projectGraphForMode(graph, "visitor");

  assert.deepEqual(thought, {
    id: "draft-one",
    type: "thought",
    status: "published",
    statement: draftInput.statement.trim(),
    anchors: ["left-hand"],
    createdAt: draftInput.createdAt,
    publishedAt: "2026-08-24T09:30:00.000Z",
  });
  assert.equal(graph.nodes.filter((node) => node.id === "draft-one").length, 1);
  assert.ok(visitor.nodes.some((node) => node.id === "draft-one"));
  assert.ok(visitor.nodes.some((node) => node.id === "left-hand"));
  assert.ok(visitor.edges.some((edge) => edge.id === "authored-draft-one"));
  assert.ok(visitor.edges.some((edge) => edge.id === "anchor-draft-one-left-hand"));
});
