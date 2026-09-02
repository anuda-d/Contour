import type {
  ThoughtMutation,
  ThoughtState,
} from "../../product/authorship/draft-state.ts";

export type AuthoredThoughtPersistenceResult = Readonly<{
  saved: boolean;
  state: ThoughtState;
}>;

/**
 * Persists one scoped authored-Thought mutation through the authoritative
 * read-merge-write adapter without exposing storage details to use cases.
 */
export type AuthoredThoughtPersistencePort = Readonly<{
  save(state: ThoughtState, mutation: ThoughtMutation): AuthoredThoughtPersistenceResult;
}>;
