import assert from "node:assert/strict";
import test from "node:test";
import {
  recoverAuthoredThoughts,
  type AuthoredThoughtRecoveryPersistencePort,
} from "../../../src/application/authorship/recover-authored-thoughts.ts";
import {
  createDraft,
  emptyDraftState,
  type ThoughtState,
} from "../../../src/product/authorship/draft-state.ts";

const validIds = new Set(["left-hand", "arrival"]);
const state = createDraft(
  emptyDraftState(),
  {
    id: "draft-recovered",
    primaryMediaId: "left-hand",
    statement: "A recovered private thought.",
    createdAt: "2026-09-02T23:30:00.000Z",
  },
  validIds,
).state;

function recoveryPort(saved: boolean, returned: ThoughtState = state): AuthoredThoughtRecoveryPersistencePort & {
  writes: ThoughtState[];
} {
  const writes: ThoughtState[] = [];
  return {
    writes,
    recover: (recovered) => {
      writes.push(recovered);
      return { saved, state: returned };
    },
  };
}

test("authored startup recovery persists the normalized state through its narrow port", () => {
  const port = recoveryPort(true);

  assert.deepEqual(recoverAuthoredThoughts(state, port), { saved: true, state });
  assert.deepEqual(port.writes, [state]);
});

test("authored startup recovery adopts the authoritative merged persistence state", () => {
  const merged: ThoughtState = {
    version: 2,
    thoughts: [
      ...state.thoughts,
      {
        id: "draft-concurrent",
        primaryMediaId: "arrival",
        statement: "A concurrent private thought.",
        createdAt: "2026-09-02T23:31:00.000Z",
        status: "draft",
      },
    ],
  };
  const port = recoveryPort(true, merged);

  assert.deepEqual(recoverAuthoredThoughts(state, port), { saved: true, state: merged });
  assert.deepEqual(port.writes, [state]);
});

test("authored startup recovery preserves a visit-only write failure", () => {
  const port = recoveryPort(false);

  assert.deepEqual(recoverAuthoredThoughts(state, port), { saved: false, state });
  assert.deepEqual(port.writes, [state]);
});
