import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthoredThoughtPersistencePort,
  persistDraftState,
} from "../../../src/adapters/browser/authored-local-storage.ts";
import type { AuthoredThoughtPersistencePort } from "../../../src/application/authorship/authored-thought-persistence.ts";
import {
  saveAuthoredDraft,
  type SaveAuthoredDraftCommand,
} from "../../../src/application/authorship/save-authored-draft.ts";
import type { ClockPort } from "../../../src/kernel/clock.ts";
import type { IdentifierPort } from "../../../src/kernel/identifier.ts";
import type { KeyValueStoragePort } from "../../../src/kernel/key-value-storage.ts";
import {
  createDraft,
  emptyDraftState,
  type ThoughtMutation,
  type ThoughtState,
} from "../../../src/product/authorship/draft-state.ts";

const validIds = new Set(["left-hand", "arrival", "moonlight"]);
const createdAt = "2026-09-02T23:10:00.000Z";
const clock: ClockPort = { now: () => createdAt, nowMilliseconds: () => 0 };
const identifier: IdentifierPort = { randomUuid: () => "fixed-uuid" };

const initial = () =>
  createDraft(
    emptyDraftState(),
    {
      id: "draft-one",
      primaryMediaId: "left-hand",
      statement: "A private thought.",
      createdAt,
    },
    validIds,
  ).state;

function persistence(saved = true): AuthoredThoughtPersistencePort & {
  writes: Array<{ state: ThoughtState; mutation: ThoughtMutation }>;
} {
  const writes: Array<{ state: ThoughtState; mutation: ThoughtMutation }> = [];
  return {
    writes,
    save: (state, mutation) => {
      writes.push({ state, mutation });
      return { saved, state };
    },
  };
}

function memoryStorage(): KeyValueStoragePort {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

test("create uses effect ports and persists the exact new-Draft mutation", () => {
  const port = persistence();
  const command: SaveAuthoredDraftCommand = {
    kind: "create",
    primaryMediaId: "left-hand",
    statement: "A new private thought.",
    selectedMediaIds: new Set(["left-hand", "arrival"]),
    clock,
    identifier,
  };

  const result = saveAuthoredDraft(emptyDraftState(), command, validIds, port);

  assert.equal("error" in result, false);
  if ("error" in result) return;
  assert.equal(result.message, "Private Draft added to your Map.");
  assert.equal(result.thought.id, "draft-fixed-uuid");
  assert.equal(result.thought.createdAt, createdAt);
  assert.deepEqual(port.writes.map((write) => write.mutation), [
    { id: "draft-fixed-uuid", fields: [] },
  ]);
});

test("rejected capture commands do not persist product failures", () => {
  const port = persistence();
  const state = initial();

  const unselected = saveAuthoredDraft(
    emptyDraftState(),
    {
      kind: "create",
      primaryMediaId: "moonlight",
      statement: "Not among the confirmed works.",
      selectedMediaIds: new Set(["left-hand"]),
      clock,
      identifier,
    },
    validIds,
    port,
  );
  const unavailable = saveAuthoredDraft(
    state,
    { kind: "edit", id: "missing", statement: "A revision." },
    validIds,
    port,
  );
  const invalidBridge = saveAuthoredDraft(
    state,
    {
      kind: "bridge",
      id: "draft-one",
      secondaryMediaId: "left-hand",
      statement: "A bridge.",
      statementAtOpen: "A private thought.",
    },
    validIds,
    port,
  );

  assert.equal("error" in unselected ? unselected.error : null, "Choose one of your three works.");
  assert.equal("error" in unavailable ? unavailable.error : null, "That Draft is no longer available.");
  assert.equal("error" in invalidBridge ? invalidBridge.error : null, "Choose a different work to make this bridge.");
  assert.deepEqual(port.writes, []);
});

test("edit preserves its successful no-op dialog behavior without persistence", () => {
  const port = persistence();
  const result = saveAuthoredDraft(
    initial(),
    { kind: "edit", id: "draft-one", statement: "A private thought." },
    validIds,
    port,
  );

  assert.equal("error" in result, false);
  if ("error" in result) return;
  assert.equal(result.changed, false);
  assert.equal(result.persistenceSaved, null);
  assert.equal(result.message, "Draft unchanged.");
  assert.deepEqual(port.writes, []);
});

test("bridge preserves its opening statement when concurrent state changes", () => {
  const port = persistence();
  const result = saveAuthoredDraft(
    initial(),
    {
      kind: "bridge",
      id: "draft-one",
      secondaryMediaId: "arrival",
      statement: "A private thought.",
      statementAtOpen: "A private thought.",
    },
    validIds,
    port,
  );

  assert.equal("error" in result, false);
  if ("error" in result) return;
  assert.equal(result.message, "Private bridge added to your Map.");
  assert.deepEqual(port.writes.map((write) => write.mutation), [
    { id: "draft-one", fields: ["secondaryMediaId"] },
  ]);
});

test("changed edit and bridge commands persist their exact field scopes", () => {
  const editPort = persistence();
  const bridgePort = persistence();

  saveAuthoredDraft(
    initial(),
    { kind: "edit", id: "draft-one", statement: "An edited thought." },
    validIds,
    editPort,
  );
  saveAuthoredDraft(
    initial(),
    {
      kind: "bridge",
      id: "draft-one",
      secondaryMediaId: "arrival",
      statement: "A changed bridge thought.",
      statementAtOpen: "A private thought.",
    },
    validIds,
    bridgePort,
  );

  assert.deepEqual(editPort.writes.map((write) => write.mutation), [
    { id: "draft-one", fields: ["statement"] },
  ]);
  assert.deepEqual(bridgePort.writes.map((write) => write.mutation), [
    { id: "draft-one", fields: ["secondaryMediaId", "statement"] },
  ]);
});

test("whitespace-only bridge edits preserve a remote statement through the real adapter", () => {
  const storage = memoryStorage();
  const state = initial();
  persistDraftState(storage, state, validIds);
  const remote: ThoughtState = {
    version: 2,
    thoughts: [{ ...state.thoughts[0]!, statement: "Remote concurrent edit." }],
  };
  persistDraftState(storage, remote, validIds, { id: "draft-one", fields: ["statement"] });

  const result = saveAuthoredDraft(
    state,
    {
      kind: "bridge",
      id: "draft-one",
      secondaryMediaId: "arrival",
      statement: " A private thought. ",
      statementAtOpen: "A private thought.",
    },
    validIds,
    createAuthoredThoughtPersistencePort(storage, validIds),
  );

  assert.equal("error" in result, false);
  if ("error" in result) return;
  assert.equal(result.thought.statement, "Remote concurrent edit.");
  assert.equal(result.thought.secondaryMediaId, "arrival");
});

test("changed edits and bridges return merged publication state with exact protection copy", () => {
  const state = initial();
  const published: ThoughtState = {
    version: 2,
    thoughts: [
      {
        ...state.thoughts[0]!,
        status: "published",
        publishedAt: "2026-09-02T23:12:00.000Z",
      },
    ],
  };
  const port: AuthoredThoughtPersistencePort = { save: () => ({ saved: true, state: published }) };

  const edit = saveAuthoredDraft(
    state,
    { kind: "edit", id: "draft-one", statement: "A stale private revision." },
    validIds,
    port,
  );
  const bridge = saveAuthoredDraft(
    state,
    {
      kind: "bridge",
      id: "draft-one",
      secondaryMediaId: "arrival",
      statement: "A stale private bridge.",
      statementAtOpen: "A private thought.",
    },
    validIds,
    port,
  );

  assert.equal("error" in edit ? null : edit.message, "This Thought was already published in another tab. The private edit was not saved.");
  assert.equal("error" in bridge ? null : bridge.message, "This Thought was already published in another tab. The bridge was not saved.");
  assert.equal("error" in bridge ? null : bridge.thought.status, "published");
});

test("failed capture persistence retains visit-only state and exact operation copy", () => {
  const edit = saveAuthoredDraft(
    initial(),
    { kind: "edit", id: "draft-one", statement: "A locally retained revision." },
    validIds,
    persistence(false),
  );

  const create = saveAuthoredDraft(
    emptyDraftState(),
    {
      kind: "create",
      primaryMediaId: "left-hand",
      statement: "A local first Draft.",
      selectedMediaIds: validIds,
      clock,
      identifier,
    },
    validIds,
    persistence(false),
  );
  const bridge = saveAuthoredDraft(
    initial(),
    {
      kind: "bridge",
      id: "draft-one",
      secondaryMediaId: "arrival",
      statement: "A local bridge.",
      statementAtOpen: "A private thought.",
    },
    validIds,
    persistence(false),
  );

  assert.equal("error" in edit, false);
  assert.equal("error" in create, false);
  assert.equal("error" in bridge, false);
  if ("error" in edit || "error" in create || "error" in bridge) return;
  assert.equal(edit.persistenceSaved, false);
  assert.equal(edit.thought.statement, "A locally retained revision.");
  assert.equal(
    edit.message,
    "Private Draft updated. This Draft will last for this visit.",
  );
  assert.equal(
    create.message,
    "Private Draft added to your Map. This Draft will last for this visit.",
  );
  assert.equal(
    bridge.message,
    "Private bridge added to your Map. This bridge will last for this visit.",
  );
});
