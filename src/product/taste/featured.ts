export const FEATURED_VERSION = 1;
export const FEATURED_LIMIT = 3;

export type FeaturedState = {
  version: typeof FEATURED_VERSION;
  featuredMediaIds: string[];
};

export type FeaturedNormalization = {
  state: FeaturedState;
  recovered: boolean;
};

export type FeaturedChange = {
  state: FeaturedState;
  changed: boolean;
  message: string;
};

type EligibleIds = Iterable<string> | ReadonlySet<string>;

function toEligibleIdSet(eligibleIds: EligibleIds): ReadonlySet<string> {
  return eligibleIds instanceof Set ? eligibleIds : new Set(eligibleIds);
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function createFeaturedState(
  featuredMediaIds: string[] = [],
  eligibleIds: EligibleIds = featuredMediaIds,
): FeaturedState {
  return normalizeFeaturedState(
    { version: FEATURED_VERSION, featuredMediaIds },
    eligibleIds,
  ).state;
}

export function normalizeFeaturedState(
  value: unknown,
  eligibleIds: EligibleIds,
): FeaturedNormalization {
  const source = recordValue(value);
  const eligible = toEligibleIdSet(eligibleIds);
  const sourceIds: unknown[] = Array.isArray(source?.featuredMediaIds)
    ? source.featuredMediaIds
    : [];
  const featuredMediaIds: string[] = [];

  sourceIds.forEach((id) => {
    if (
      typeof id === "string" &&
      eligible.has(id) &&
      !featuredMediaIds.includes(id) &&
      featuredMediaIds.length < FEATURED_LIMIT
    ) {
      featuredMediaIds.push(id);
    }
  });

  return {
    state: { version: FEATURED_VERSION, featuredMediaIds },
    recovered:
      source?.version !== FEATURED_VERSION ||
      sourceIds.length !== featuredMediaIds.length ||
      sourceIds.some((id, index) => id !== featuredMediaIds[index]),
  };
}

export function toggleFeaturedMedia(
  state: FeaturedState,
  id: string,
  eligibleIds: EligibleIds,
  title = "This work",
): FeaturedChange {
  const eligible = toEligibleIdSet(eligibleIds);
  if (!eligible.has(id)) {
    return { state, changed: false, message: "That work cannot be featured." };
  }

  if (state.featuredMediaIds.includes(id)) {
    return {
      state: {
        ...state,
        featuredMediaIds: state.featuredMediaIds.filter((featuredId) => featuredId !== id),
      },
      changed: true,
      message: `${title} was removed from the orbit.`,
    };
  }

  if (state.featuredMediaIds.length >= FEATURED_LIMIT) {
    return {
      state,
      changed: false,
      message: "Remove a featured work first.",
    };
  }

  return {
    state: {
      ...state,
      featuredMediaIds: [...state.featuredMediaIds, id],
    },
    changed: true,
    message: `${title} is now featured.`,
  };
}
