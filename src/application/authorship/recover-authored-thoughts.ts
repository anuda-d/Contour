import type { ThoughtState } from "../../product/authorship/draft-state.ts";

export type AuthoredThoughtRecoveryPersistenceResult = Readonly<{
  saved: boolean;
  state: ThoughtState;
}>;

/**
 * Persists a normalized authored-Thought recovery snapshot without exposing
 * browser storage or its read-merge-write behavior to application callers.
 */
export type AuthoredThoughtRecoveryPersistencePort = Readonly<{
  recover(state: ThoughtState): AuthoredThoughtRecoveryPersistenceResult;
}>;

/**
 * Coordinates the startup recovery rewrite after the browser adapter has
 * recognized a recoverable authored-Thought payload. Projection, copy, and
 * rendering remain outward concerns.
 */
export function recoverAuthoredThoughts(
  state: ThoughtState,
  persistence: AuthoredThoughtRecoveryPersistencePort,
): AuthoredThoughtRecoveryPersistenceResult {
  return persistence.recover(state);
}
