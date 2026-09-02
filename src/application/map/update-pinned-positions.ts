import {
  pinPosition as pinPositionProduct,
  unpinPosition as unpinPositionProduct,
  type MapPoint,
  type PinnedChange,
  type PinnedState,
} from "../../product/map/pinned-positions.ts";

export type PinnedPositionPersistencePort = Readonly<{
  save(state: PinnedState): boolean;
}>;

type PinnedPersistenceOutcome = Readonly<{
  saved: boolean | null;
}>;

export type PinPositionResult = PinnedChange & PinnedPersistenceOutcome;
export type UnpinPositionResult = PinnedChange & PinnedPersistenceOutcome;

/**
 * Coordinates the current spatial pin command with persistence while leaving
 * eligibility, position validation, and pin policy in the Map product module.
 */
export function pinPosition(
  state: PinnedState,
  id: string,
  position: MapPoint,
  validIds: Iterable<string> | ReadonlySet<string>,
  persistence: PinnedPositionPersistencePort,
): PinPositionResult {
  const result = pinPositionProduct(state, id, position, validIds);
  if (!result.changed) return { ...result, saved: null };

  const saved = persistence.save(result.state);
  return {
    ...result,
    saved,
    message: saved ? result.message : "Position pinned for this visit.",
  };
}

/**
 * Coordinates the current spatial unpin command with persistence while
 * preserving the product module's no-op and generated-layout behavior.
 */
export function unpinPosition(
  state: PinnedState,
  id: string,
  persistence: PinnedPositionPersistencePort,
): UnpinPositionResult {
  const result = unpinPositionProduct(state, id);
  if (!result.changed) return { ...result, saved: null };

  const saved = persistence.save(result.state);
  return {
    ...result,
    saved,
    message: saved
      ? result.message
      : "Position returned for this visit. The saved pin could not be changed.",
  };
}
