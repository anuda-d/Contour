export const PINNED_VERSION = 1;
export const PINNED_STORAGE_KEY = "thought-map.prototype.pinned-positions.v1";

const POSITION_LIMITS = Object.freeze({ x: 490, y: 310 });

const validIdSet = (validIds) =>
  validIds instanceof Set ? validIds : new Set(validIds);

const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

function normalizePoint(value) {
  if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) return null;
  return {
    x: clamp(value.x, POSITION_LIMITS.x),
    y: clamp(value.y, POSITION_LIMITS.y),
  };
}

export function emptyPinnedState() {
  return { version: PINNED_VERSION, pinnedPositions: {} };
}

export function normalizePinnedState(value, validIds) {
  const eligible = validIdSet(validIds);
  const hasValidSource =
    value?.pinnedPositions &&
    typeof value.pinnedPositions === "object" &&
    !Array.isArray(value.pinnedPositions);
  const source = hasValidSource ? value.pinnedPositions : {};
  const pinnedPositions = {};

  Object.entries(source).forEach(([id, valuePoint]) => {
    const point = normalizePoint(valuePoint);
    if (!eligible.has(id) || !point) return;
    pinnedPositions[id] = point;
  });

  const sourceEntries = Object.entries(source);
  const normalizedEntries = Object.entries(pinnedPositions);
  const recovered =
    value?.version !== PINNED_VERSION ||
    !hasValidSource ||
    sourceEntries.length !== normalizedEntries.length ||
    normalizedEntries.some(([id, point]) => {
      const sourcePoint = source[id];
      return sourcePoint?.x !== point.x || sourcePoint?.y !== point.y;
    });

  return {
    state: { version: PINNED_VERSION, pinnedPositions },
    recovered,
  };
}

export function loadPinnedState(storage, validIds) {
  if (!storage) {
    return {
      state: emptyPinnedState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  let stored;
  try {
    stored = storage.getItem(PINNED_STORAGE_KEY);
  } catch {
    return {
      state: emptyPinnedState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }

  if (!stored) {
    return {
      state: emptyPinnedState(),
      persistent: true,
      recovered: false,
      storageError: false,
    };
  }

  try {
    const normalized = normalizePinnedState(JSON.parse(stored), validIds);
    return { ...normalized, persistent: true, storageError: false };
  } catch {
    return {
      state: emptyPinnedState(),
      persistent: true,
      recovered: true,
      storageError: false,
    };
  }
}

export function savePinnedState(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(PINNED_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function pinPosition(state, id, position, validIds) {
  const eligible = validIdSet(validIds);
  const point = normalizePoint(position);
  if (!eligible.has(id) || !point) {
    return { state, changed: false, message: "That position cannot be pinned." };
  }
  const current = state.pinnedPositions[id];
  if (current?.x === point.x && current?.y === point.y) {
    return { state, changed: false, message: "Position already pinned." };
  }
  return {
    state: {
      ...state,
      pinnedPositions: { ...state.pinnedPositions, [id]: point },
    },
    changed: true,
    message: "Position pinned.",
  };
}

export function unpinPosition(state, id) {
  if (!Object.hasOwn(state.pinnedPositions, id)) {
    return { state, changed: false, message: "Position is not pinned." };
  }
  const pinnedPositions = { ...state.pinnedPositions };
  delete pinnedPositions[id];
  return {
    state: { ...state, pinnedPositions },
    changed: true,
    message: "Position returned to the generated layout.",
  };
}

export function resolvePositions(nodes, generatedPositions, currentPositions, pinnedPositions) {
  return Object.fromEntries(
    nodes.map((node) => [
      node.id,
      pinnedPositions[node.id] ?? currentPositions[node.id] ?? generatedPositions[node.id],
    ]),
  );
}
