import assert from "node:assert/strict";
import test from "node:test";
import {
  createAuthoredThoughtRecoveryPersistencePort,
  createAuthoredThoughtReloadPort,
  DRAFT_STORAGE_KEY,
  loadDraftState,
  THOUGHT_STORAGE_KEY,
  THOUGHT_V1_STORAGE_KEY,
} from "../../../src/adapters/browser/authored-local-storage.ts";
import {
  createFeaturedRecoveryPersistencePort,
  FEATURED_STORAGE_KEY,
  loadFeaturedState,
} from "../../../src/adapters/browser/featured-local-storage.ts";
import { createBrowserStorageChangePort } from "../../../src/adapters/browser/browser-storage-change.ts";
import { getPrototypeFacts } from "../../../src/adapters/seed/prototype-seed.ts";
import { getCatalogue } from "../../../src/product/catalogue/catalogue.ts";
import { reloadAuthoredThoughts } from "../../../src/application/authorship/reload-authored-thoughts.ts";
import { recoverAuthoredThoughts } from "../../../src/application/authorship/recover-authored-thoughts.ts";
import { recoverPinnedPositions } from "../../../src/application/map/recover-pinned-positions.ts";
import { recoverFeatured } from "../../../src/application/taste/recover-featured.ts";
import { recoverSelection } from "../../../src/application/taste/recover-selection.ts";
import type { KeyValueStoragePort } from "../../../src/kernel/key-value-storage.ts";
import {
  createPinnedPositionRecoveryPersistencePort,
  loadPinnedState,
  PINNED_STORAGE_KEY,
} from "../../../src/adapters/browser/pinned-local-storage.ts";
import {
  createSelectionRecoveryPersistencePort,
  loadSelection,
  SELECTION_STORAGE_KEY,
} from "../../../src/adapters/browser/selection-local-storage.ts";

class MemoryStorage implements KeyValueStoragePort {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

test("current browser-storage representations normalize together without discarding valid legacy state", () => {
  const storage = new MemoryStorage();
  const catalogueIds = new Set(["left-hand", "arrival", "bluets"]);
  const publicMediaIds = new Set(["left-hand", "arrival"]);
  const legacyDrafts = JSON.stringify({
    version: 1,
    drafts: [
      {
        id: "draft-legacy",
        statement: "A lower-precedence legacy Draft.",
        mediaId: "arrival",
        createdAt: "2026-08-24T09:00:00.000Z",
      },
    ],
  });

  storage.setItem(
    SELECTION_STORAGE_KEY,
    JSON.stringify({
      version: 0,
      selectedMediaIds: ["left-hand", "missing", "left-hand", "arrival", "bluets"],
      confirmed: true,
    }),
  );
  const v1Thoughts = JSON.stringify({
    version: 1,
    thoughts: [
      {
        id: "draft-v1",
        status: "published",
        statement: "A valid V1 Thought remains authoritative over legacy Drafts.",
        mediaId: "left-hand",
        createdAt: "2026-08-24T09:30:00.000Z",
        publishedAt: "2026-08-24T10:00:00.000Z",
      },
    ],
  });
  storage.setItem(THOUGHT_V1_STORAGE_KEY, v1Thoughts);
  storage.setItem(DRAFT_STORAGE_KEY, legacyDrafts);
  storage.setItem(FEATURED_STORAGE_KEY, "not json");
  storage.setItem(
    PINNED_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      pinnedPositions: { "left-hand": { x: 900, y: -999 } },
    }),
  );

  const selection = loadSelection(storage, catalogueIds);
  const authored = loadDraftState(storage, catalogueIds);
  const featured = loadFeaturedState(storage, publicMediaIds, ["arrival"]);
  const pinned = loadPinnedState(storage, catalogueIds);

  assert.deepEqual(selection, {
    state: { version: 1, selectedMediaIds: ["left-hand", "arrival", "bluets"], confirmed: true },
    persistent: true,
    recovered: true,
    storageError: false,
  });
  assert.equal(authored.migrated, true);
  assert.deepEqual(authored.state, {
    version: 2,
    thoughts: [
      {
        id: "draft-v1",
        status: "published",
        statement: "A valid V1 Thought remains authoritative over legacy Drafts.",
        primaryMediaId: "left-hand",
        createdAt: "2026-08-24T09:30:00.000Z",
        publishedAt: "2026-08-24T10:00:00.000Z",
      },
    ],
  });
  assert.equal(storage.getItem(THOUGHT_V1_STORAGE_KEY), v1Thoughts);
  assert.equal(storage.getItem(DRAFT_STORAGE_KEY), legacyDrafts);
  assert.deepEqual(featured, {
    state: { version: 1, featuredMediaIds: ["arrival"] },
    persistent: true,
    recovered: true,
    storageError: false,
  });
  assert.deepEqual(pinned, {
    state: { version: 1, pinnedPositions: { "left-hand": { x: 490, y: -310 } } },
    persistent: true,
    recovered: true,
    storageError: false,
  });

  assert.equal(
    recoverSelection(selection.state, createSelectionRecoveryPersistencePort(storage)).saved,
    true,
  );
  assert.equal(
    recoverAuthoredThoughts(
      authored.state,
      createAuthoredThoughtRecoveryPersistencePort(storage, catalogueIds),
    ).saved,
    true,
  );
  assert.equal(
    recoverFeatured(featured.state, createFeaturedRecoveryPersistencePort(storage)).saved,
    true,
  );
  assert.equal(
    recoverPinnedPositions(pinned.state, createPinnedPositionRecoveryPersistencePort(storage)).saved,
    true,
  );
  assert.equal(storage.getItem(SELECTION_STORAGE_KEY), JSON.stringify(selection.state));
  assert.equal(storage.getItem(FEATURED_STORAGE_KEY), JSON.stringify(featured.state));
  assert.equal(storage.getItem(PINNED_STORAGE_KEY), JSON.stringify(pinned.state));
  assert.equal(storage.getItem(THOUGHT_V1_STORAGE_KEY), v1Thoughts);
  assert.equal(storage.getItem(DRAFT_STORAGE_KEY), legacyDrafts);
  assert.deepEqual(loadDraftState(storage, catalogueIds).state, authored.state);
});

test("authored V2 is authoritative, while V1 and legacy Drafts each remain valid fallback paths", () => {
  const catalogueIds = new Set(["left-hand", "arrival"]);
  const v2 = JSON.stringify({
    version: 2,
    thoughts: [
      {
        id: "draft-v2",
        status: "draft",
        statement: "The V2 state wins when it exists.",
        primaryMediaId: "arrival",
        createdAt: "2026-08-24T10:30:00.000Z",
      },
    ],
  });
  const v1 = JSON.stringify({
    version: 1,
    thoughts: [
      {
        id: "draft-v1",
        status: "draft",
        statement: "V1 remains a fallback.",
        mediaId: "left-hand",
        createdAt: "2026-08-24T10:00:00.000Z",
      },
    ],
  });
  const legacy = JSON.stringify({
    version: 1,
    drafts: [
      {
        id: "draft-legacy",
        statement: "Legacy Drafts remain the final fallback.",
        mediaId: "arrival",
        createdAt: "2026-08-24T09:00:00.000Z",
      },
    ],
  });

  const withV2 = new MemoryStorage();
  withV2.setItem(THOUGHT_STORAGE_KEY, v2);
  withV2.setItem(THOUGHT_V1_STORAGE_KEY, v1);
  withV2.setItem(DRAFT_STORAGE_KEY, legacy);
  assert.deepEqual(loadDraftState(withV2, catalogueIds).state, {
    version: 2,
    thoughts: [
      {
        id: "draft-v2",
        status: "draft",
        statement: "The V2 state wins when it exists.",
        primaryMediaId: "arrival",
        createdAt: "2026-08-24T10:30:00.000Z",
      },
    ],
  });

  const withV1 = new MemoryStorage();
  withV1.setItem(THOUGHT_V1_STORAGE_KEY, v1);
  withV1.setItem(DRAFT_STORAGE_KEY, legacy);
  const loadedV1 = loadDraftState(withV1, catalogueIds);
  assert.deepEqual(loadedV1.state, {
    version: 2,
    thoughts: [
      {
        id: "draft-v1",
        status: "draft",
        statement: "V1 remains a fallback.",
        primaryMediaId: "left-hand",
        createdAt: "2026-08-24T10:00:00.000Z",
      },
    ],
  });
  assert.equal(
    recoverAuthoredThoughts(
      loadedV1.state,
      createAuthoredThoughtRecoveryPersistencePort(withV1, catalogueIds),
    ).saved,
    true,
  );
  assert.equal(withV1.getItem(THOUGHT_V1_STORAGE_KEY), v1);
  assert.equal(withV1.getItem(DRAFT_STORAGE_KEY), legacy);

  const withLegacy = new MemoryStorage();
  withLegacy.setItem(DRAFT_STORAGE_KEY, legacy);
  const loadedLegacy = loadDraftState(withLegacy, catalogueIds);
  assert.equal(loadedLegacy.migrated, true);
  assert.deepEqual(loadedLegacy.state, {
    version: 2,
    thoughts: [
      {
        id: "draft-legacy",
        status: "draft",
        statement: "Legacy Drafts remain the final fallback.",
        primaryMediaId: "arrival",
        createdAt: "2026-08-24T09:00:00.000Z",
      },
    ],
  });
  assert.equal(withLegacy.getItem(DRAFT_STORAGE_KEY), legacy);
});

test("the authored storage event reloads the V2 representation without syncing other keys", () => {
  const storage = new MemoryStorage();
  const catalogueIds = new Set(["left-hand", "arrival"]);
  storage.setItem(
    THOUGHT_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      thoughts: [
        {
          id: "draft-reloaded",
          status: "draft",
          statement: "A private Thought from another tab.",
          primaryMediaId: "left-hand",
          createdAt: "2026-09-01T18:00:00.000Z",
        },
      ],
    }),
  );
  const captured = {
    listener: null as ((event: StorageEvent) => void) | null,
    result: null as ReturnType<typeof reloadAuthoredThoughts> | null,
  };
  const storageChanges = createBrowserStorageChangePort({
    addEventListener: (_type, registered) => {
      captured.listener = registered;
    },
  });
  storageChanges.onChange(THOUGHT_STORAGE_KEY, () => {
    captured.result = reloadAuthoredThoughts(
      { prototype: getPrototypeFacts(), catalogue: getCatalogue() },
      createAuthoredThoughtReloadPort(storage, catalogueIds),
    );
  });

  assert.ok(captured.listener);
  captured.listener({ key: SELECTION_STORAGE_KEY } as StorageEvent);
  assert.equal(captured.result, null);
  captured.listener({ key: THOUGHT_STORAGE_KEY } as StorageEvent);
  const result = captured.result as ReturnType<typeof reloadAuthoredThoughts> | null;
  assert.equal(result?.kind, "reloaded");
  if (result?.kind !== "reloaded") return;
  assert.equal(result.state.thoughts[0]?.id, "draft-reloaded");
  assert.equal(result.graph.nodes.some((node) => node.id === "draft-reloaded"), true);
});

test("all browser-storage representations degrade to visit-only state when storage is unavailable", () => {
  const catalogueIds = new Set(["left-hand", "arrival", "bluets"]);
  const publicMediaIds = new Set(["left-hand", "arrival"]);

  assert.equal(loadSelection(null, catalogueIds).storageError, true);
  assert.equal(loadDraftState(null, catalogueIds).storageError, true);
  assert.equal(loadFeaturedState(null, publicMediaIds, ["arrival"]).storageError, true);
  assert.equal(loadPinnedState(null, catalogueIds).storageError, true);
  assert.equal(loadSelection(null, catalogueIds).persistent, false);
  assert.equal(loadDraftState(null, catalogueIds).persistent, false);
  assert.equal(loadFeaturedState(null, publicMediaIds, ["arrival"]).persistent, false);
  assert.equal(loadPinnedState(null, catalogueIds).persistent, false);
});
