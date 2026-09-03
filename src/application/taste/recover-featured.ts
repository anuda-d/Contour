import type { FeaturedState } from "../../product/taste/featured.ts";

export type FeaturedRecoveryPersistencePort = Readonly<{
  recover(state: FeaturedState): boolean;
}>;

export type FeaturedRecoveryResult = Readonly<{
  state: FeaturedState;
  saved: boolean;
}>;

/**
 * Coordinates the existing normalized featured-Media startup rewrite without
 * exposing browser storage to application callers.
 */
export function recoverFeatured(
  state: FeaturedState,
  persistence: FeaturedRecoveryPersistencePort,
): FeaturedRecoveryResult {
  return { state, saved: persistence.recover(state) };
}
