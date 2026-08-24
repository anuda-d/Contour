import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_STORAGE_KEY,
  THOUGHT_STORAGE_KEY,
  THOUGHT_V1_STORAGE_KEY,
  THOUGHT_VERSION,
  composeGraphWithDrafts,
  connectDraft,
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
  primaryMediaId: "left-hand",
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
  assert.equal(
    createDraft(state, { ...draftInput, primaryMediaId: "missing" }, validIds).changed,
    false,
  );
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
    primaryMediaId: "left-hand",
    createdAt: draftInput.createdAt,
  });
  assert.equal(created.thoughts[0].statement, draftInput.statement.trim());
});

test("connecting a Draft adds exactly one distinct secondary anchor", () => {
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const result = connectDraft(
    created,
    "draft-one",
    {
      secondaryMediaId: "arrival",
      statement: "Borders and language both change who can belong.",
    },
    validIds,
  );

  assert.equal(result.changed, true);
  assert.equal(created.thoughts[0].secondaryMediaId, undefined);
  assert.deepEqual(result.draft, {
    id: "draft-one",
    status: "draft",
    statement: "Borders and language both change who can belong.",
    primaryMediaId: "left-hand",
    secondaryMediaId: "arrival",
    createdAt: draftInput.createdAt,
  });
  assert.equal(
    connectDraft(created, "draft-one", { secondaryMediaId: "left-hand", statement: "x" }, validIds)
      .changed,
    false,
  );
  assert.equal(
    connectDraft(created, "draft-one", { secondaryMediaId: "missing", statement: "x" }, validIds)
      .changed,
    false,
  );
  const published = publishDraft(
    created,
    "draft-one",
    "2026-08-24T09:30:00.000Z",
    validIds,
  ).state;
  assert.equal(
    connectDraft(
      published,
      "draft-one",
      { secondaryMediaId: "arrival", statement: "x" },
      validIds,
    ).changed,
    false,
  );
});

test("publishing changes exactly one anchored Draft without changing its identity", () => {
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const publishedAt = "2026-08-24T09:30:00.000Z";
  const result = publishDraft(created, "draft-one", publishedAt, validIds);

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
  const published = publishDraft(
    created,
    "draft-one",
    "2026-08-24T09:30:00.000Z",
    validIds,
  ).state;
  const unanchored = {
    ...created,
    thoughts: [{ ...created.thoughts[0], primaryMediaId: "" }],
  };

  assert.equal(
    publishDraft(created, "missing", "2026-08-24T09:30:00.000Z", validIds).changed,
    false,
  );
  assert.equal(
    publishDraft(published, "draft-one", "2026-08-24T10:00:00.000Z", validIds).changed,
    false,
  );
  assert.equal(
    publishDraft(unanchored, "draft-one", "2026-08-24T10:00:00.000Z", validIds).changed,
    false,
  );
  assert.equal(publishDraft(created, "draft-one", "not-a-date", validIds).changed, false);
  assert.equal(publishDraft(created, "draft-one", "1", validIds).changed, false);
  assert.equal(created.thoughts[0].status, "draft");
});

test("normalization drops corrupt records and never infers public visibility", () => {
  const value = {
    version: 1,
    thoughts: [
      { ...draftInput, mediaId: "left-hand", primaryMediaId: undefined, status: "published", publishedAt: "1" },
      { ...draftInput, mediaId: "left-hand", primaryMediaId: undefined, statement: "duplicate" },
      { ...draftInput, id: "draft-unknown", mediaId: "missing", primaryMediaId: undefined },
      { ...draftInput, id: "draft-empty", mediaId: "left-hand", primaryMediaId: undefined, statement: " " },
      {
        ...draftInput,
        mediaId: "left-hand",
        primaryMediaId: undefined,
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

test("current lifecycle v1 migrates its sole anchor to version 2", () => {
  const result = normalizeDraftState(
    {
      version: 1,
      thoughts: [
        {
          id: "draft-one",
          status: "published",
          statement: draftInput.statement.trim(),
          mediaId: "left-hand",
          createdAt: draftInput.createdAt,
          publishedAt: "2026-08-24T09:30:00.000Z",
        },
      ],
    },
    validIds,
  );

  assert.equal(result.recovered, true);
  assert.equal(result.state.version, THOUGHT_VERSION);
  assert.deepEqual(result.state.thoughts[0], {
    id: "draft-one",
    status: "published",
    statement: draftInput.statement.trim(),
    primaryMediaId: "left-hand",
    createdAt: draftInput.createdAt,
    publishedAt: "2026-08-24T09:30:00.000Z",
  });
});

test("the v2 lifecycle key remains authoritative after an old client rewrites v1", () => {
  const storage = memoryStorage();
  storage.setItem(
    THOUGHT_V1_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      thoughts: [
        {
          id: "draft-one",
          status: "draft",
          statement: draftInput.statement.trim(),
          mediaId: "left-hand",
          createdAt: draftInput.createdAt,
        },
      ],
    }),
  );
  const migrated = loadDraftState(storage, validIds);
  const bridged = connectDraft(
    migrated.state,
    "draft-one",
    { secondaryMediaId: "arrival", statement: draftInput.statement },
    validIds,
  ).state;
  const published = publishDraft(
    bridged,
    "draft-one",
    "2026-08-24T10:00:00.000Z",
    validIds,
  ).state;
  persistDraftState(storage, published, validIds, {
    id: "draft-one",
    fields: ["status", "publishedAt"],
  });

  storage.setItem(
    THOUGHT_V1_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      thoughts: [
        {
          id: "draft-one",
          status: "draft",
          statement: "Stale v1 text.",
          mediaId: "left-hand",
          createdAt: draftInput.createdAt,
        },
      ],
    }),
  );
  const reloaded = loadDraftState(storage, validIds).state.thoughts[0];
  assert.equal(reloaded.status, "published");
  assert.equal(reloaded.secondaryMediaId, "arrival");
  assert.equal(reloaded.statement, draftInput.statement.trim());
});

test("recovery strips only an invalid secondary anchor and keeps the private Thought", () => {
  const result = normalizeDraftState(
    {
      version: THOUGHT_VERSION,
      thoughts: [
        {
          ...draftInput,
          status: "draft",
          statement: draftInput.statement.trim(),
          secondaryMediaId: "left-hand",
        },
      ],
    },
    validIds,
  );

  assert.equal(result.recovered, true);
  assert.equal(result.state.thoughts.length, 1);
  assert.equal(result.state.thoughts[0].secondaryMediaId, undefined);
});

test("authored Thought state survives storage and reports an unavailable storage fallback", () => {
  const storage = memoryStorage();
  const state = createDraft(emptyDraftState(), draftInput, validIds).state;
  assert.equal(
    persistDraftState(storage, state, validIds, { id: "draft-one", fields: [] }).saved,
    true,
  );
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
      drafts: [{ ...draftInput, mediaId: "left-hand", status: "draft", statement: draftInput.statement.trim() }],
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
    validIds,
  ).state;
  assert.equal(
    persistDraftState(storage, published, validIds, {
      id: "draft-one",
      fields: ["status", "publishedAt"],
    }).saved,
    true,
  );
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
      drafts: [{ ...draftInput, mediaId: "left-hand", statement: draftInput.statement.trim() }],
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

  const published = publishDraft(
    tabA,
    "draft-one",
    "2026-08-24T09:30:00.000Z",
    validIds,
  ).state;
  assert.equal(
    persistDraftState(storage, published, validIds, {
      id: "draft-one",
      fields: ["status", "publishedAt"],
    }).saved,
    true,
  );
  const withSecondDraft = createDraft(
    tabB,
    {
      id: "draft-two",
      primaryMediaId: "arrival",
      statement: "A second tab keeps its new Thought.",
      createdAt: "2026-08-24T09:31:00.000Z",
    },
    validIds,
  ).state;
  const merged = persistDraftState(storage, withSecondDraft, validIds, {
    id: "draft-two",
    fields: [],
  });

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
  const published = publishDraft(
    draft,
    "draft-one",
    "2026-08-24T09:30:00.000Z",
    validIds,
  ).state;
  const merged = mergeDraftStates(
    published,
    {
      ...draft,
      thoughts: [{ ...draft.thoughts[0], statement: "A stale private edit." }],
    },
    { id: "draft-one", fields: ["statement"] },
  );

  assert.deepEqual(merged, published);
  assert.notEqual(merged, published);
  assert.notEqual(merged.thoughts[0], published.thoughts[0]);
});

test("saving a new Draft from a stale tab preserves unrelated private edits", () => {
  const storage = memoryStorage();
  const initial = createDraft(emptyDraftState(), draftInput, validIds).state;
  persistDraftState(storage, initial, validIds, { id: "draft-one", fields: [] });
  const staleTab = loadDraftState(storage, validIds).state;
  const edited = editDraft(initial, "draft-one", "The current private edit.").state;
  persistDraftState(storage, edited, validIds, {
    id: "draft-one",
    fields: ["statement"],
  });

  const withSecondDraft = createDraft(
    staleTab,
    {
      id: "draft-two",
      primaryMediaId: "arrival",
      statement: "A second tab keeps its new Thought.",
      createdAt: "2026-08-24T09:31:00.000Z",
    },
    validIds,
  ).state;
  const merged = persistDraftState(storage, withSecondDraft, validIds, {
    id: "draft-two",
    fields: [],
  }).state;

  assert.equal(
    merged.thoughts.find((thought) => thought.id === "draft-one").statement,
    "The current private edit.",
  );
  assert.ok(merged.thoughts.some((thought) => thought.id === "draft-two"));
});

test("field-scoped merging retains a concurrent statement edit and bridge anchor", () => {
  const initial = createDraft(emptyDraftState(), draftInput, validIds).state;
  const edited = editDraft(initial, "draft-one", "A newer private statement.").state;
  const bridged = connectDraft(
    initial,
    "draft-one",
    { secondaryMediaId: "arrival", statement: initial.thoughts[0].statement },
    validIds,
  ).state;
  const withEdit = mergeDraftStates(initial, edited, {
    id: "draft-one",
    fields: ["statement"],
  });
  const merged = mergeDraftStates(withEdit, bridged, {
    id: "draft-one",
    fields: ["secondaryMediaId"],
  });

  assert.equal(merged.thoughts[0].statement, "A newer private statement.");
  assert.equal(merged.thoughts[0].secondaryMediaId, "arrival");
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
  const state = publishDraft(
    created,
    "draft-one",
    "2026-08-24T09:30:00.000Z",
    validIds,
  ).state;
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

test("a bridge composes two stable anchor edges and becomes comprehensible after publication", () => {
  const baseGraph = getSeedGraph();
  const created = createDraft(emptyDraftState(), draftInput, validIds).state;
  const bridged = connectDraft(
    created,
    "draft-one",
    {
      secondaryMediaId: "arrival",
      statement: "Borders and language both change who can belong.",
    },
    validIds,
  ).state;
  const privateGraph = composeGraphWithDrafts(baseGraph, bridged);
  assert.equal(
    projectGraphForMode(privateGraph, "visitor").nodes.some((node) => node.id === "draft-one"),
    false,
  );

  const published = publishDraft(
    bridged,
    "draft-one",
    "2026-08-24T10:00:00.000Z",
    validIds,
  ).state;
  const graph = composeGraphWithDrafts(baseGraph, published);
  const thought = graph.nodes.find((node) => node.id === "draft-one");
  const visitor = projectGraphForMode(graph, "visitor");

  assert.deepEqual(thought.anchors, ["left-hand", "arrival"]);
  assert.equal(graph.edges.filter((edge) => edge.source === "draft-one").length, 2);
  assert.ok(graph.edges.some((edge) => edge.id === "anchor-draft-one-left-hand"));
  assert.ok(graph.edges.some((edge) => edge.id === "anchor-draft-one-arrival"));
  assert.ok(visitor.nodes.some((node) => node.id === "draft-one"));
  assert.ok(visitor.nodes.some((node) => node.id === "arrival"));
});
