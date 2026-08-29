import {
  createFeaturedState,
  normalizeFeaturedState,
  type FeaturedState,
} from "../../product/taste/featured.ts";

export const FEATURED_STORAGE_KEY = "thought-map.prototype.featured-media.v1";

export type FeaturedStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type FeaturedLoadResult = {
  state: FeaturedState;
  persistent: boolean;
  recovered: boolean;
  storageError: boolean;
};

export function loadFeaturedState(
  storage: FeaturedStorage | null | undefined,
  eligibleIds: Iterable<string> | ReadonlySet<string>,
  defaultIds: string[] = [],
): FeaturedLoadResult {
  const defaultState = createFeaturedState(defaultIds, eligibleIds);
  if (!storage) {
    return {
      state: defaultState,
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  let stored: string | null;
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
    const normalized = normalizeFeaturedState(JSON.parse(stored) as unknown, eligibleIds);
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

export function saveFeaturedState(
  storage: FeaturedStorage | null | undefined,
  state: FeaturedState,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
