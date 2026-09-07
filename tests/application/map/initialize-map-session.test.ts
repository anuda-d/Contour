import assert from "node:assert/strict";
import test from "node:test";
import {
  initializeMapSession,
  type AuthoredStartupLoadResult,
  type AuthoredThoughtStartupPort,
  type FeaturedStartupPort,
  type PinnedPositionStartupPort,
  type SelectionStartupPort,
} from "../../../src/application/map/initialize-map-session.ts";
import type { PinnedPositionRecoveryPersistencePort } from "../../../src/application/map/recover-pinned-positions.ts";
import type { FeaturedRecoveryPersistencePort } from "../../../src/application/taste/recover-featured.ts";
import type { SelectionRecoveryPersistencePort } from "../../../src/application/taste/recover-selection.ts";
import { emptyPinnedState } from "../../../src/product/map/pinned-positions.ts";
import { emptySelection } from "../../../src/product/taste/selection.ts";
import { createFeaturedState } from "../../../src/product/taste/featured.ts";

const catalogue = [
  { id: "book-a", format: "book" as const, title: "Book A", creator: "Author A", year: 2001 },
  { id: "film-b", format: "film" as const, title: "Film B", creator: "Director B", year: 2002 },
];

const mapFacts = {
  catalogue,
  prototype: {
    owner: {
      profile: { id: "owner-profile", displayName: "Owner", handle: "@owner", initials: "O", identityLine: "Owner Map" },
      mapIdentity: { id: "owner", label: "Owner", note: "Owner Map" },
    },
    seededThoughts: [{ id: "published-seed", status: "published" as const, statement: "A published seed thought.", primaryMediaId: "book-a" }],
    defaultFeaturedMediaIds: ["book-a"],
  },
};

function recoveredDraft(id: string) {
  return {
    id,
    status: "draft" as const,
    statement: `Private ${id}.`,
    primaryMediaId: "film-b",
    createdAt: "2026-09-06T18:00:00.000Z",
  };
}

test("Map session startup coordinates complete recovery in the existing load order", () => {
  const calls: string[] = [];
  const selection: SelectionStartupPort = {
    load: (ids) => {
      calls.push(`selection:${[...ids].join(",")}`);
      return { state: { ...emptySelection(), selectedMediaIds: ["book-a"] }, persistent: true, recovered: true, storageError: false };
    },
  };
  const featured: FeaturedStartupPort = {
    load: (eligibleIds, defaults) => {
      calls.push(`featured:${[...eligibleIds].join(",")}:${defaults.join(",")}`);
      return { state: createFeaturedState([], eligibleIds), persistent: true, recovered: true, storageError: false };
    },
  };
  const authoredThoughts: AuthoredThoughtStartupPort = {
    load: (ids): AuthoredStartupLoadResult => {
      calls.push(`authored:${[...ids].join(",")}`);
      return {
        state: { version: 2, thoughts: [recoveredDraft("draft-loaded")] },
        persistent: true,
        recovered: true,
        storageError: false,
      };
    },
    recover: (state) => {
      calls.push(`recover-authored:${state.thoughts.map((thought) => thought.id).join(",")}`);
      return {
        saved: false,
        state: { version: 2, thoughts: [...state.thoughts, recoveredDraft("draft-concurrent")] },
      };
    },
  };
  const pinnedPositions: PinnedPositionStartupPort = {
    load: (ids) => {
      calls.push(`pinned:${[...ids].join(",")}`);
      return { state: emptyPinnedState(), persistent: true, recovered: true, storageError: false };
    },
  };
  const selectionRecovery: SelectionRecoveryPersistencePort = {
    recover: (state) => {
      calls.push(`recover-selection:${state.selectedMediaIds.join(",")}`);
      return false;
    },
  };
  const featuredRecovery: FeaturedRecoveryPersistencePort = {
    recover: (state) => {
      calls.push(`recover-featured:${state.featuredMediaIds.join(",")}`);
      return false;
    },
  };
  const pinnedPositionRecovery: PinnedPositionRecoveryPersistencePort = {
    recover: (state) => {
      calls.push(`recover-pinned:${Object.keys(state.pinnedPositions).join(",")}`);
      return false;
    },
  };

  const session = initializeMapSession({
    mapFacts,
    selection,
    featured,
    authoredThoughts,
    pinnedPositions,
    selectionRecovery,
    featuredRecovery,
    pinnedPositionRecovery,
  });

  assert.deepEqual(calls, [
    "selection:book-a,film-b",
    "featured:book-a:book-a",
    "authored:book-a,film-b",
    "pinned:book-a,film-b,published-seed,draft-loaded",
    "recover-selection:book-a",
    "recover-featured:",
    "recover-authored:draft-loaded",
    "recover-pinned:",
  ]);
  assert.equal(session.persistent, false);
  assert.equal(session.initialChooserMessage, "Unavailable saved works were removed.");
  assert.equal(
    session.featuredMessage,
    "Unavailable featured works were removed. Changes will last for this visit.",
  );
  assert.equal(
    session.initialDraftMessage,
    "Saved authored Thoughts were recovered safely. Changes will last for this visit.",
  );
  assert.deepEqual([...session.publicMediaIds], ["book-a"]);
  assert.equal(session.graph.nodes.some((node) => node.id === "draft-concurrent"), true);
});

test("Map session startup retains visit-only outcomes when storage is unavailable", () => {
  const noRecovery = () => {
    throw new Error("Storage recovery must not run after unavailable loads.");
  };
  const session = initializeMapSession({
    mapFacts,
    selection: { load: () => ({ state: emptySelection(), persistent: false, recovered: false, storageError: true }) },
    featured: { load: (eligibleIds) => ({ state: createFeaturedState([], eligibleIds), persistent: false, recovered: false, storageError: true }) },
    authoredThoughts: {
      load: () => ({ state: { version: 2, thoughts: [] }, persistent: false, recovered: false, storageError: true }),
      recover: noRecovery,
    },
    pinnedPositions: { load: () => ({ state: emptyPinnedState(), persistent: false, recovered: false, storageError: true }) },
    selectionRecovery: { recover: noRecovery },
    featuredRecovery: { recover: noRecovery },
    pinnedPositionRecovery: { recover: noRecovery },
  });

  assert.equal(session.persistent, false);
  assert.equal(session.initialChooserMessage, "Selections will last for this visit.");
  assert.equal(session.featuredMessage, "Featured Media will last for this visit.");
  assert.equal(session.initialDraftMessage, "Private Drafts will last for this visit.");
  assert.deepEqual(session.draftState.thoughts, []);
});

test("Map session startup preserves persistent outcomes after successful recovery writes", () => {
  const calls: string[] = [];
  const session = initializeMapSession({
    mapFacts,
    selection: {
      load: () => ({ state: emptySelection(), persistent: true, recovered: true, storageError: false }),
    },
    featured: {
      load: (eligibleIds) => ({
        state: createFeaturedState([], eligibleIds),
        persistent: true,
        recovered: true,
        storageError: false,
      }),
    },
    authoredThoughts: {
      load: () => ({
        state: { version: 2, thoughts: [] },
        persistent: true,
        recovered: true,
        storageError: false,
        recoveryNotice: false,
      }),
      recover: (state) => {
        calls.push("authored");
        return { saved: true, state };
      },
    },
    pinnedPositions: {
      load: () => ({ state: emptyPinnedState(), persistent: true, recovered: true, storageError: false }),
    },
    selectionRecovery: {
      recover: () => {
        calls.push("selection");
        return true;
      },
    },
    featuredRecovery: {
      recover: () => {
        calls.push("featured");
        return true;
      },
    },
    pinnedPositionRecovery: {
      recover: () => {
        calls.push("pinned");
        return true;
      },
    },
  });

  assert.deepEqual(calls, ["selection", "featured", "authored", "pinned"]);
  assert.equal(session.persistent, true);
  assert.equal(session.initialChooserMessage, "Unavailable saved works were removed.");
  assert.equal(session.featuredMessage, "Unavailable featured works were removed.");
  assert.equal(session.initialDraftMessage, "");
});
