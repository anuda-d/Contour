import type { PinnedState } from "../../product/map/pinned-positions.ts";

export type PinnedPositionRecoveryPersistencePort = Readonly<{
  recover(state: PinnedState): boolean;
}>;

export type PinnedPositionRecoveryResult = Readonly<{
  state: PinnedState;
  saved: boolean;
}>;

/**
 * Coordinates the existing normalized pinned-position startup rewrite without
 * exposing browser storage to application callers.
 */
export function recoverPinnedPositions(
  state: PinnedState,
  persistence: PinnedPositionRecoveryPersistencePort,
): PinnedPositionRecoveryResult {
  return { state, saved: persistence.recover(state) };
}
