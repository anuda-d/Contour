import {
  toggleFeaturedMedia,
  type FeaturedChange,
  type FeaturedState,
} from "../../product/taste/featured.ts";

export type FeaturedPersistencePort = Readonly<{
  save(state: FeaturedState): boolean;
}>;

type FeaturedPersistenceOutcome = Readonly<{
  saved: boolean | null;
}>;

export type ToggleFeaturedResult = FeaturedChange & FeaturedPersistenceOutcome;

/**
 * Coordinates the current public-Media feature toggle with persistence while
 * leaving eligibility, ordering, and the three-work limit in the taste module.
 */
export function toggleFeatured(
  state: FeaturedState,
  id: string,
  eligibleIds: Iterable<string> | ReadonlySet<string>,
  title: string,
  persistence: FeaturedPersistencePort,
): ToggleFeaturedResult {
  const result = toggleFeaturedMedia(state, id, eligibleIds, title);
  if (!result.changed) return { ...result, saved: null };

  const saved = persistence.save(result.state);
  return {
    ...result,
    saved,
    message: saved ? result.message : `${result.message} This change will last for this visit.`,
  };
}
