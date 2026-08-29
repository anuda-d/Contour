export const THOUGHT_VERSION: 2 = 2;

export type DraftThought = {
  id: string;
  status: "draft";
  statement: string;
  primaryMediaId: string;
  secondaryMediaId?: string;
  createdAt: string;
};

export type PublishedThought = Omit<DraftThought, "status"> & {
  status: "published";
  publishedAt: string;
};

export type Thought = DraftThought | PublishedThought;
export type ThoughtState = { version: typeof THOUGHT_VERSION; thoughts: Thought[] };
export type ThoughtMutation = {
  id: string;
  fields: readonly ("status" | "publishedAt" | "statement" | "secondaryMediaId")[];
};

type RecordValue = Record<string, unknown>;
type ThoughtGraphNode = { id: string; type: string; anchors?: string[]; [key: string]: unknown };
type ThoughtGraphEdge = { id: string; source: string; target: string; kind: string; [key: string]: unknown };
export type ThoughtGraph = {
  profile: { featuredMediaIds?: string[]; [key: string]: unknown };
  nodes: ThoughtGraphNode[];
  edges: ThoughtGraphEdge[];
};

const cleanStatement = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const isRecord = (value: unknown): value is RecordValue => typeof value === "object" && value !== null;
const isTimestamp = (value: unknown) => {
  if (typeof value !== "string" || !value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
};
const validIds = (mediaIds: ReadonlySet<string> | Iterable<string>) =>
  mediaIds instanceof Set ? mediaIds : new Set(mediaIds);

export function emptyDraftState(): ThoughtState {
  return { version: THOUGHT_VERSION, thoughts: [] };
}

function normalizeThoughts(
  sourceThoughts: unknown[],
  validMediaIds: ReadonlySet<string>,
  { allowLegacyMediaId = false }: { allowLegacyMediaId?: boolean } = {},
) {
  const seenIds = new Set<string>();
  const thoughts: Thought[] = [];
  let recovered = false;

  sourceThoughts.forEach((candidate) => {
    const thought = isRecord(candidate) ? candidate : {};
    const statement = cleanStatement(thought.statement);
    const primaryMediaId =
      typeof thought.primaryMediaId === "string"
        ? thought.primaryMediaId
        : allowLegacyMediaId && typeof thought.mediaId === "string"
          ? thought.mediaId
          : null;
    const valid =
      typeof thought.id === "string" &&
      thought.id.startsWith("draft-") &&
      !seenIds.has(thought.id) &&
      statement.length > 0 &&
      typeof primaryMediaId === "string" &&
      validMediaIds.has(primaryMediaId) &&
      isTimestamp(thought.createdAt);
    if (!valid || typeof thought.id !== "string" || typeof primaryMediaId !== "string" || typeof thought.createdAt !== "string") {
      recovered = true;
      return;
    }

    seenIds.add(thought.id);
    const published = thought.status === "published" && isTimestamp(thought.publishedAt);
    const hasSecondary =
      typeof thought.secondaryMediaId === "string" &&
      thought.secondaryMediaId !== primaryMediaId &&
      validMediaIds.has(thought.secondaryMediaId);
    const normalized: Thought = published
      ? {
          id: thought.id,
          status: "published",
          statement,
          primaryMediaId,
          ...(hasSecondary ? { secondaryMediaId: thought.secondaryMediaId as string } : {}),
          createdAt: thought.createdAt,
          publishedAt: thought.publishedAt as string,
        }
      : {
          id: thought.id,
          status: "draft",
          statement,
          primaryMediaId,
          ...(hasSecondary ? { secondaryMediaId: thought.secondaryMediaId as string } : {}),
          createdAt: thought.createdAt,
        };
    thoughts.push(normalized);
    if (
      thought.status !== normalized.status ||
      thought.statement !== normalized.statement ||
      thought.publishedAt !== (normalized.status === "published" ? normalized.publishedAt : undefined) ||
      thought.primaryMediaId !== normalized.primaryMediaId ||
      thought.secondaryMediaId !== normalized.secondaryMediaId ||
      thought.mediaId !== undefined
    ) {
      recovered = true;
    }
  });

  return { thoughts, recovered };
}

export function normalizeDraftState(value: unknown, mediaIds: ReadonlySet<string> | Iterable<string>) {
  const record = isRecord(value) ? value : {};
  const sourceThoughts = Array.isArray(record.thoughts) ? record.thoughts : [];
  const normalized = normalizeThoughts(sourceThoughts, validIds(mediaIds), {
    allowLegacyMediaId: record.version === 1,
  });
  return {
    state: { version: THOUGHT_VERSION, thoughts: normalized.thoughts },
    recovered: record.version !== THOUGHT_VERSION || normalized.recovered,
    recoveryNotice: normalized.recovered,
  };
}

export function migrateLegacyDraftState(value: unknown, mediaIds: ReadonlySet<string> | Iterable<string>) {
  const record = isRecord(value) ? value : {};
  const sourceDrafts = Array.isArray(record.drafts) ? record.drafts : [];
  const normalized = normalizeThoughts(
    sourceDrafts.map((candidate) => {
      const draft = isRecord(candidate) ? candidate : {};
      return {
        id: draft.id,
        status: "draft",
        statement: draft.statement,
        primaryMediaId: draft.mediaId,
        createdAt: draft.createdAt,
      };
    }),
    validIds(mediaIds),
  );
  return {
    state: { version: THOUGHT_VERSION, thoughts: normalized.thoughts },
    recovered: true,
    migrated: true,
    recoveryNotice: normalized.recovered,
  };
}

export function mergeDraftStates(
  storedState: ThoughtState,
  incomingState: ThoughtState,
  mutation: ThoughtMutation | null = null,
): ThoughtState {
  const thoughts = storedState.thoughts.map((thought) => ({ ...thought }));
  const indexById = new Map(thoughts.map((thought, index) => [thought.id, index]));

  incomingState.thoughts.forEach((thought) => {
    const index = indexById.get(thought.id);
    if (index === undefined) {
      indexById.set(thought.id, thoughts.length);
      thoughts.push({ ...thought });
      return;
    }
    const stored = thoughts[index];
    if (!stored || stored.status === "published") return;
    if (thought.status === "published") {
      thoughts[index] = { ...stored, status: "published", publishedAt: thought.publishedAt };
      return;
    }
    if (thought.id !== mutation?.id) return;
    mutation.fields.forEach((field) => {
      if (field !== "statement" && field !== "secondaryMediaId") return;
      if (field === "secondaryMediaId" && !Object.hasOwn(thought, field)) {
        delete stored.secondaryMediaId;
      } else if (field === "statement") {
        stored.statement = thought.statement;
      } else if (typeof thought.secondaryMediaId === "string") {
        stored.secondaryMediaId = thought.secondaryMediaId;
      }
    });
  });

  return { version: THOUGHT_VERSION, thoughts };
}

export function createDraft(
  state: ThoughtState,
  input: { id?: unknown; primaryMediaId?: unknown; statement?: unknown; createdAt?: unknown },
  mediaIds: ReadonlySet<string> | Iterable<string>,
) {
  const validMediaIds = validIds(mediaIds);
  const statement = cleanStatement(input?.statement);
  if (typeof input.primaryMediaId !== "string" || !validMediaIds.has(input.primaryMediaId)) {
    return { state, changed: false, error: "Choose one of your three works." };
  }
  if (!statement) return { state, changed: false, error: "Write the thought you want to keep." };
  if (typeof input.id !== "string" || !input.id.startsWith("draft-") || state.thoughts.some((thought) => thought.id === input.id)) {
    return { state, changed: false, error: "This Draft could not be created. Try again." };
  }
  const createdAt = input.createdAt;
  if (typeof createdAt !== "string" || !isTimestamp(createdAt)) return { state, changed: false, error: "This Draft could not be created. Try again." };
  const draft: DraftThought = { id: input.id, status: "draft", statement, primaryMediaId: input.primaryMediaId, createdAt };
  return { state: { ...state, thoughts: [...state.thoughts, draft] }, draft, changed: true, message: "Private Draft added to your Map." };
}

export function editDraft(state: ThoughtState, id: string, statement: unknown) {
  const nextStatement = cleanStatement(statement);
  if (!nextStatement) return { state, changed: false, error: "Write the thought you want to keep." };
  const index = state.thoughts.findIndex((thought) => thought.id === id && thought.status === "draft");
  const current = state.thoughts[index];
  if (index < 0 || !current || current.status !== "draft") return { state, changed: false, error: "That Draft is no longer available." };
  if (current.statement === nextStatement) return { state, draft: current, changed: false, message: "Draft unchanged." };
  const draft: DraftThought = { ...current, statement: nextStatement };
  const thoughts = [...state.thoughts];
  thoughts[index] = draft;
  return { state: { ...state, thoughts }, draft, changed: true, message: "Private Draft updated." };
}

export function connectDraft(
  state: ThoughtState,
  id: string,
  input: { secondaryMediaId?: unknown; statement?: unknown },
  mediaIds: ReadonlySet<string> | Iterable<string>,
) {
  const validMediaIds = validIds(mediaIds);
  const statement = cleanStatement(input?.statement);
  if (!statement) return { state, changed: false, error: "Write the thought you want to keep." };
  const index = state.thoughts.findIndex((thought) => thought.id === id && thought.status === "draft");
  const current = state.thoughts[index];
  if (index < 0 || !current || current.status !== "draft") return { state, changed: false, error: "That Draft is no longer available." };
  if (typeof input.secondaryMediaId !== "string" || !validMediaIds.has(input.secondaryMediaId) || input.secondaryMediaId === current.primaryMediaId) {
    return { state, changed: false, error: "Choose a different work to make this bridge." };
  }
  const draft: DraftThought = { ...current, statement, secondaryMediaId: input.secondaryMediaId };
  if (current.statement === draft.statement && current.secondaryMediaId === draft.secondaryMediaId) return { state, draft: current, changed: false, message: "Bridge Draft unchanged." };
  const thoughts = [...state.thoughts];
  thoughts[index] = draft;
  return { state: { ...state, thoughts }, draft, changed: true, message: "Private bridge added to your Map." };
}

export function publishDraft(
  state: ThoughtState,
  id: string,
  publishedAt: unknown,
  mediaIds: ReadonlySet<string> | Iterable<string>,
) {
  const validMediaIds = validIds(mediaIds);
  if (typeof publishedAt !== "string" || !isTimestamp(publishedAt)) return { state, changed: false, error: "This Thought could not be published. Try again." };
  const index = state.thoughts.findIndex((thought) => thought.id === id && thought.status === "draft");
  const draft = state.thoughts[index];
  if (index < 0 || !draft || draft.status !== "draft") return { state, changed: false, error: "That Draft is no longer available." };
  const anchorsValid = validMediaIds.has(draft.primaryMediaId) && (!draft.secondaryMediaId || (draft.secondaryMediaId !== draft.primaryMediaId && validMediaIds.has(draft.secondaryMediaId)));
  if (!anchorsValid) return { state, changed: false, error: "Choose a Book or Film before publishing this Thought." };
  const thought: PublishedThought = { ...draft, status: "published", publishedAt };
  const thoughts = [...state.thoughts];
  thoughts[index] = thought;
  return { state: { ...state, thoughts }, thought, changed: true, message: "Thought published. Visitor preview now shows it." };
}

export function composeGraphWithDrafts(baseGraph: ThoughtGraph, state: ThoughtState): ThoughtGraph {
  const graph: ThoughtGraph = {
    profile: { ...baseGraph.profile, ...(baseGraph.profile.featuredMediaIds ? { featuredMediaIds: [...baseGraph.profile.featuredMediaIds] } : {}) },
    nodes: baseGraph.nodes.map((node) => ({ ...node, ...(node.anchors ? { anchors: [...node.anchors] } : {}) })),
    edges: baseGraph.edges.map((edge) => ({ ...edge })),
  };
  const existingIds = new Set(graph.nodes.map((node) => node.id));
  const authorId = graph.nodes.find((node) => node.type === "user")?.id;
  state.thoughts.forEach((thought) => {
    if (existingIds.has(thought.id)) return;
    existingIds.add(thought.id);
    graph.nodes.push({ id: thought.id, type: "thought", status: thought.status, statement: thought.statement, anchors: [thought.primaryMediaId, ...(thought.secondaryMediaId ? [thought.secondaryMediaId] : [])], createdAt: thought.createdAt, ...(thought.status === "published" ? { publishedAt: thought.publishedAt } : {}) });
    if (authorId) graph.edges.push({ id: `authored-${thought.id}`, source: authorId, target: thought.id, kind: "authored" });
    graph.edges.push({ id: `anchor-${thought.id}-${thought.primaryMediaId}`, source: thought.id, target: thought.primaryMediaId, kind: "primary-anchor" });
    if (thought.secondaryMediaId) graph.edges.push({ id: `anchor-${thought.id}-${thought.secondaryMediaId}`, source: thought.id, target: thought.secondaryMediaId, kind: "additional-anchor" });
  });
  return graph;
}
