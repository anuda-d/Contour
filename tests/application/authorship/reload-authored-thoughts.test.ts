import assert from "node:assert/strict";
import test from "node:test";
import {
  reloadAuthoredThoughts,
  type AuthoredThoughtReloadPort,
} from "../../../src/application/authorship/reload-authored-thoughts.ts";
import { getSeedGraph } from "../../../src/adapters/seed/prototype-seed.ts";
import { projectGraphForMode } from "../../../src/graph-projection.ts";
import {
  createDraft,
  emptyDraftState,
  publishDraft,
} from "../../../src/product/authorship/draft-state.ts";

const validMediaIds = new Set(["left-hand", "arrival"]);

test("reloading authored Thoughts returns a rebuilt graph with the existing update message", () => {
  const state = createDraft(
    emptyDraftState(),
    {
      id: "draft-reloaded",
      primaryMediaId: "left-hand",
      statement: "A private thought from another tab.",
      createdAt: "2026-09-01T18:00:00.000Z",
    },
    validMediaIds,
  ).state;
  const authoredThoughts: AuthoredThoughtReloadPort = {
    load: () => ({ kind: "loaded", state }),
  };

  const result = reloadAuthoredThoughts(getSeedGraph(), authoredThoughts);

  assert.equal(result.kind, "reloaded");
  if (result.kind !== "reloaded") return;
  assert.equal(result.state, state);
  assert.equal(result.message, "Authored Thoughts updated from another tab.");
  assert.equal(result.graph.nodes.some((node) => node.id === "draft-reloaded"), true);
  assert.equal(
    projectGraphForMode(result.graph, "visitor").nodes.some((node) => node.id === "draft-reloaded"),
    false,
  );
});

test("unavailable authored storage produces no reload outcome", () => {
  const authoredThoughts: AuthoredThoughtReloadPort = {
    load: () => ({ kind: "storage-unavailable" }),
  };

  assert.deepEqual(reloadAuthoredThoughts(getSeedGraph(), authoredThoughts), {
    kind: "storage-unavailable",
  });
});

test("reloading a published Thought preserves its public projection", () => {
  const drafted = createDraft(
    emptyDraftState(),
    {
      id: "draft-published-remotely",
      primaryMediaId: "arrival",
      statement: "A published thought from another tab.",
      createdAt: "2026-09-01T18:05:00.000Z",
    },
    validMediaIds,
  ).state;
  const state = publishDraft(
    drafted,
    "draft-published-remotely",
    "2026-09-01T18:06:00.000Z",
    validMediaIds,
  ).state;

  const result = reloadAuthoredThoughts(getSeedGraph(), {
    load: () => ({ kind: "loaded", state }),
  });

  assert.equal(result.kind, "reloaded");
  if (result.kind !== "reloaded") return;
  assert.equal(
    projectGraphForMode(result.graph, "visitor").nodes.some(
      (node) => node.id === "draft-published-remotely",
    ),
    true,
  );
});
