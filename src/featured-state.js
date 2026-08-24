export const FEATURED_VERSION = 1;
export const FEATURED_LIMIT = 3;
export const FEATURED_STORAGE_KEY = "thought-map.prototype.featured-media.v1";

function validIdSet(eligibleIds) {
  return eligibleIds instanceof Set ? eligibleIds : new Set(eligibleIds);
}

export function createFeaturedState(featuredMediaIds = [], eligibleIds = featuredMediaIds) {
  return normalizeFeaturedState(
    { version: FEATURED_VERSION, featuredMediaIds },
    eligibleIds,
  ).state;
}

export function normalizeFeaturedState(value, eligibleIds) {
  const eligible = validIdSet(eligibleIds);
  const sourceIds = Array.isArray(value?.featuredMediaIds) ? value.featuredMediaIds : [];
  const featuredMediaIds = [];

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
      value?.version !== FEATURED_VERSION ||
      sourceIds.length !== featuredMediaIds.length ||
      sourceIds.some((id, index) => id !== featuredMediaIds[index]),
  };
}

export function loadFeaturedState(storage, eligibleIds, defaultIds = []) {
  const defaultState = createFeaturedState(defaultIds, eligibleIds);
  if (!storage) {
    return {
      state: defaultState,
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  let stored;
  try {
    stored = storage.getItem(FEATURED_STORAGE_KEY);
  } catch {
    return {
      state: defaultState,
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  if (!stored) {
    return {
      state: defaultState,
      persistent: true,
      recovered: false,
      storageError: false,
    };
  }

  try {
    const normalized = normalizeFeaturedState(JSON.parse(stored), eligibleIds);
    return { ...normalized, persistent: true, storageError: false };
  } catch {
    return {
      state: defaultState,
      persistent: true,
      recovered: true,
      storageError: false,
    };
  }
}

export function saveFeaturedState(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function toggleFeaturedMedia(state, id, eligibleIds, title = "This work") {
  const eligible = validIdSet(eligibleIds);
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
