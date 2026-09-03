import type { SelectionState } from "../../product/taste/selection.ts";

export type SelectionRecoveryPersistencePort = Readonly<{
  recover(state: SelectionState): boolean;
}>;

export type SelectionRecoveryResult = Readonly<{
  state: SelectionState;
  saved: boolean;
}>;

/**
 * Coordinates the existing normalized deliberate-selection startup rewrite
 * without exposing browser storage to application callers.
 */
export function recoverSelection(
  state: SelectionState,
  persistence: SelectionRecoveryPersistencePort,
): SelectionRecoveryResult {
  return { state, saved: persistence.recover(state) };
}
