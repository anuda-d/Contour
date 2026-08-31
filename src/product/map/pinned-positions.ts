export const PINNED_VERSION = 1;

export type MapPoint = Readonly<{ x: number; y: number }>;

export type PinnedState = Readonly<{
  version: typeof PINNED_VERSION;
  pinnedPositions: Readonly<Record<string, MapPoint>>;
}>;

export type PinnedNormalization = Readonly<{
  state: PinnedState;
  recovered: boolean;
}>;

export type PinnedChange = Readonly<{
  state: PinnedState;
  changed: boolean;
  message: string;
}>;

const POSITION_LIMITS = Object.freeze({ x: 490, y: 310 });

function validIdSet(validIds: Iterable<string>): Set<string> {
  return validIds instanceof Set ? validIds : new Set(validIds);
}

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizePoint(value: unknown): MapPoint | null {
  if (!isRecord(value) || !isFiniteNumber(value.x) || !isFiniteNumber(value.y)) return null;
  return {
    x: clamp(value.x, POSITION_LIMITS.x),
    y: clamp(value.y, POSITION_LIMITS.y),
  };
}

function hasSameCoordinates(value: unknown, point: MapPoint): boolean {
  return isRecord(value) && value.x === point.x && value.y === point.y;
}

export function emptyPinnedState(): PinnedState {
  return { version: PINNED_VERSION, pinnedPositions: {} };
}

export function normalizePinnedState(
  value: unknown,
  validIds: Iterable<string>,
): PinnedNormalization {
  const eligible = validIdSet(validIds);
  const sourceValue = isRecord(value) ? value.pinnedPositions : undefined;
  const hasValidSource = isRecord(sourceValue);
  const source = hasValidSource ? sourceValue : {};
  const pinnedPositions: Record<string, MapPoint> = {};

  Object.entries(source).forEach(([id, valuePoint]) => {
    const point = normalizePoint(valuePoint);
    if (!eligible.has(id) || !point) return;
    pinnedPositions[id] = point;
  });

  const sourceEntries = Object.entries(source);
  const normalizedEntries = Object.entries(pinnedPositions);
  const recovered =
    !isRecord(value) ||
    value.version !== PINNED_VERSION ||
    !hasValidSource ||
    sourceEntries.length !== normalizedEntries.length ||
    normalizedEntries.some(([id, point]) => !hasSameCoordinates(source[id], point));

  return {
    state: { version: PINNED_VERSION, pinnedPositions },
    recovered,
  };
}

export function pinPosition(
  state: PinnedState,
  id: string,
  position: unknown,
  validIds: Iterable<string>,
): PinnedChange {
  const eligible = validIdSet(validIds);
  const point = normalizePoint(position);
  if (!eligible.has(id) || !point) {
    return { state, changed: false, message: "That position cannot be pinned." };
  }
  const current = state.pinnedPositions[id];
  if (current?.x === point.x && current.y === point.y) {
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

export function unpinPosition(state: PinnedState, id: string): PinnedChange {
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

export function resolvePositions(
  nodes: ReadonlyArray<Readonly<{ id: string }>>,
  generatedPositions: Readonly<Record<string, MapPoint>>,
  currentPositions: Readonly<Record<string, MapPoint>>,
  pinnedPositions: Readonly<Record<string, MapPoint>>,
): Record<string, MapPoint | undefined> {
  return Object.fromEntries(
    nodes.map((node) => [
      node.id,
      pinnedPositions[node.id] ?? currentPositions[node.id] ?? generatedPositions[node.id],
    ]),
  );
}
