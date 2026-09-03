import assert from "node:assert/strict";
import test from "node:test";
import {
  publishAuthoredThought,
  type AuthoredThoughtPersistencePort,
} from "../../../src/application/authorship/publish-authored-thought.ts";
import type { ClockPort } from "../../../src/kernel/clock.ts";
import {
  createDraft,
  emptyDraftState,
  type ThoughtMutation,
  type ThoughtState,
} from "../../../src/product/authorship/draft-state.ts";

const validIds = new Set(["left-hand", "arrival"]);
const publishedAt = "2026-09-02T22:45:00.000Z";
const clock: ClockPort = { now: () => publishedAt, nowMilliseconds: () => 0 };
const input = {
  id: "draft-one",
  primaryMediaId: "left-hand",
  statement: "A private thought.",
  createdAt: "2026-09-02T22:40:00.000Z",
};

function persistence(saved: boolean): AuthoredThoughtPersistencePort & {
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

test("publication persists the exact lifecycle mutation through the application port", () => {
  const state = createDraft(emptyDraftState(), input, validIds).state;
  const port = persistence(true);

  const result = publishAuthoredThought(state, input.id, validIds, clock, port);

  assert.equal(result.changed, true);
  assert.equal(result.saved, true);
  assert.equal(result.message, "Thought published. Visitor preview now shows it.");
  assert.equal(result.state.thoughts[0]!.status, "published");
  assert.equal(
    result.state.thoughts[0]!.status === "published"
      ? result.state.thoughts[0]!.publishedAt
      : null,
    publishedAt,
  );
  assert.deepEqual(port.writes, [
    {
      state: result.state,
      mutation: { id: input.id, fields: ["status", "publishedAt"] },
    },
  ]);
});

test("rejected publication does not persist and preserves each product error", () => {
  const state = createDraft(emptyDraftState(), input, validIds).state;
  const port = persistence(true);
  const invalidClock: ClockPort = { now: () => "not-a-timestamp", nowMilliseconds: () => 0 };
  const invalidAnchor = {
    ...state,
    thoughts: [{ ...state.thoughts[0]!, primaryMediaId: "missing" }],
  };

  const invalidTime = publishAuthoredThought(state, input.id, validIds, invalidClock, port);
  const unavailable = publishAuthoredThought(state, "missing", validIds, clock, port);
  const missingAnchor = publishAuthoredThought(invalidAnchor, input.id, validIds, clock, port);

  assert.equal(invalidTime.error, "This Thought could not be published. Try again.");
  assert.equal(unavailable.error, "That Draft is no longer available.");
  assert.equal(missingAnchor.error, "Choose a Book or Film before publishing this Thought.");
  assert.equal(invalidTime.saved, null);
  assert.equal(unavailable.saved, null);
  assert.equal(missingAnchor.saved, null);
  assert.deepEqual(port.writes, []);
});

test("failed persistence keeps publication for the visit with the exact fallback", () => {
  const state = createDraft(emptyDraftState(), input, validIds).state;

  const result = publishAuthoredThought(state, input.id, validIds, clock, persistence(false));

  assert.equal(result.changed, true);
  assert.equal(result.saved, false);
  assert.equal(result.state.thoughts[0]!.status, "published");
  assert.equal(
    result.message,
    "Thought published for this visit. The saved Draft was not changed.",
  );
});

test("the persistence port's merged state is the authoritative application result", () => {
  const state = createDraft(emptyDraftState(), input, validIds).state;
  const remote = createDraft(
    emptyDraftState(),
    {
      id: "draft-remote",
      primaryMediaId: "arrival",
      statement: "Another tab added this Thought.",
      createdAt: "2026-09-02T22:41:00.000Z",
    },
    validIds,
  ).state;
  const port: AuthoredThoughtPersistencePort = {
    save: (published) => ({
      saved: true,
      state: { ...published, thoughts: [...published.thoughts, ...remote.thoughts] },
    }),
  };

  const result = publishAuthoredThought(state, input.id, validIds, clock, port);

  assert.deepEqual(result.state.thoughts.map((thought) => thought.id), ["draft-one", "draft-remote"]);
});
