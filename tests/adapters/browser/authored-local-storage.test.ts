import test from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_STORAGE_KEY,
  loadDraftState,
  persistDraftState,
  THOUGHT_STORAGE_KEY,
  THOUGHT_V1_STORAGE_KEY,
  type BrowserStorage,
} from "../../../src/adapters/browser/authored-local-storage.ts";
import { createDraft, emptyDraftState, publishDraft } from "../../../src/product/authorship/draft-state.ts";

const validIds = new Set(["left-hand", "arrival"]);
const input = { id: "draft-one", primaryMediaId: "left-hand", statement: "A private thought.", createdAt: "2026-08-23T12:00:00.000Z" };
function memoryStorage(): BrowserStorage {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}

test("authored storage round-trips v2 state and leaves legacy keys untouched", () => {
  const storage = memoryStorage();
  const state = createDraft(emptyDraftState(), input, validIds).state;
  assert.equal(persistDraftState(storage, state, validIds).saved, true);
  assert.match(storage.getItem(THOUGHT_STORAGE_KEY) ?? "", /draft-one/);
  assert.equal(storage.getItem(DRAFT_STORAGE_KEY), null);
  assert.deepEqual(loadDraftState(storage, validIds).state, state);
});

test("v2 is authoritative over V1 and legacy Draft representations", () => {
  const storage = memoryStorage();
  storage.setItem(THOUGHT_V1_STORAGE_KEY, JSON.stringify({ version: 1, thoughts: [{ ...input, mediaId: "left-hand", status: "draft" }] }));
  storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ version: 1, drafts: [{ ...input, mediaId: "arrival" }] }));
  assert.equal(loadDraftState(storage, validIds).migrated, true);
  storage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify({ version: 2, thoughts: [] }));
  assert.deepEqual(loadDraftState(storage, validIds).state.thoughts, []);
});

test("a corrupt present V2 is recovered empty without falling through", () => {
  const storage = memoryStorage();
  storage.setItem(THOUGHT_STORAGE_KEY, "corrupt");
  storage.setItem(THOUGHT_V1_STORAGE_KEY, JSON.stringify({ version: 1, thoughts: [{ ...input, mediaId: "left-hand", status: "draft" }] }));
  const loaded = loadDraftState(storage, validIds);
  assert.equal(loaded.recovered, true);
  assert.deepEqual(loaded.state.thoughts, []);
});

test("read-merge-write retains new Thoughts and prevents stale unpublication", () => {
  const storage = memoryStorage();
  const initial = createDraft(emptyDraftState(), input, validIds).state;
  persistDraftState(storage, initial, validIds);
  const published = publishDraft(initial, input.id, "2026-08-24T09:30:00.000Z", validIds).state;
  persistDraftState(storage, published, validIds, { id: input.id, fields: ["status", "publishedAt"] });
  const staleWithNew = createDraft(initial, { id: "draft-two", primaryMediaId: "arrival", statement: "Another private thought.", createdAt: "2026-08-24T09:31:00.000Z" }, validIds).state;
  const saved = persistDraftState(storage, staleWithNew, validIds, { id: "draft-two", fields: [] });
  assert.deepEqual(saved.state.thoughts.map((thought) => ({ id: thought.id, status: thought.status })), [{ id: "draft-one", status: "published" }, { id: "draft-two", status: "draft" }]);
});

test("unavailable storage degrades to the current visit", () => {
  const state = createDraft(emptyDraftState(), input, validIds).state;
  assert.equal(loadDraftState(null, validIds).storageError, true);
  assert.equal(persistDraftState(null, state, validIds).saved, false);
});

test("legacy Drafts migrate to authored V2 without immediately overwriting their key", () => {
  const storage = memoryStorage();
  const legacy = JSON.stringify({ version: 1, drafts: [{ ...input, mediaId: "left-hand" }] });
  storage.setItem(DRAFT_STORAGE_KEY, legacy);
  const loaded = loadDraftState(storage, ["left-hand", "arrival"]);
  assert.equal(loaded.migrated, true);
  assert.equal(loaded.state.thoughts[0]!.status, "draft");
  assert.equal(storage.getItem(DRAFT_STORAGE_KEY), legacy);
});

test("a current envelope without Thoughts stays empty without a recovery notice", () => {
  const storage = memoryStorage();
  storage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify({ version: 2 }));
  const loaded = loadDraftState(storage, validIds);
  assert.equal(loaded.recovered, false);
  assert.equal(loaded.recoveryNotice, false);
  assert.deepEqual(loaded.state.thoughts, []);
});

test("read and write errors return safe visit-only outcomes", () => {
  const state = createDraft(emptyDraftState(), input, validIds).state;
  const readFailure: BrowserStorage = { getItem: () => { throw new Error("read"); }, setItem: () => {} };
  const writeFailure: BrowserStorage = { getItem: () => null, setItem: () => { throw new Error("write"); } };
  assert.equal(loadDraftState(readFailure, validIds).storageError, true);
  assert.equal(persistDraftState(writeFailure, state, validIds).saved, false);
});

test("V1 authoring migration retains valid published metadata", () => {
  const storage = memoryStorage();
  storage.setItem(THOUGHT_V1_STORAGE_KEY, JSON.stringify({ version: 1, thoughts: [{ ...input, mediaId: "left-hand", status: "published", publishedAt: "2026-08-24T09:30:00.000Z" }] }));
  const thought = loadDraftState(storage, validIds).state.thoughts[0]!;
  assert.equal(thought.status, "published");
  assert.equal(thought.status === "published" ? thought.publishedAt : null, "2026-08-24T09:30:00.000Z");
});
