import type { ClockPort } from "../../kernel/clock.ts";
import {
  publishDraft,
  type ThoughtState,
} from "../../product/authorship/draft-state.ts";
import type { AuthoredThoughtPersistencePort } from "./authored-thought-persistence.ts";

export type { AuthoredThoughtPersistencePort } from "./authored-thought-persistence.ts";

/**
 * Coordinates irreversible authored-Thought publication with durable
 * read-merge-write persistence while leaving projection and rendering outward.
 */
export function publishAuthoredThought(
  state: ThoughtState,
  id: string,
  validMediaIds: Iterable<string> | ReadonlySet<string>,
  clock: ClockPort,
  persistence: AuthoredThoughtPersistencePort,
) {
  const result = publishDraft(state, id, clock.now(), validMediaIds);
  if (!result.changed || !("message" in result)) return { ...result, saved: null };

  const persisted = persistence.save(result.state, {
    id,
    fields: ["status", "publishedAt"],
  });
  return {
    ...result,
    state: persisted.state,
    saved: persisted.saved,
    message: persisted.saved
      ? result.message
      : "Thought published for this visit. The saved Draft was not changed.",
  };
}
