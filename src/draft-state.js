export const DRAFT_VERSION = 1;
export const DRAFT_STORAGE_KEY = "thought-map.prototype.drafts.v1";

export function emptyDraftState() {
  return { version: DRAFT_VERSION, drafts: [] };
}

const cleanStatement = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizeDraftState(value, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  const sourceDrafts = Array.isArray(value?.drafts) ? value.drafts : [];
  const seenIds = new Set();
  const drafts = [];

  sourceDrafts.forEach((draft) => {
    const statement = cleanStatement(draft?.statement);
    const valid =
      typeof draft?.id === "string" &&
      draft.id.startsWith("draft-") &&
      !seenIds.has(draft.id) &&
      statement.length > 0 &&
      typeof draft?.mediaId === "string" &&
      validIds.has(draft.mediaId) &&
      typeof draft?.createdAt === "string" &&
      !Number.isNaN(Date.parse(draft.createdAt));
    if (!valid) return;
    seenIds.add(draft.id);
    drafts.push({
      id: draft.id,
      status: "draft",
      statement,
      mediaId: draft.mediaId,
      createdAt: draft.createdAt,
    });
  });

  return {
    state: { version: DRAFT_VERSION, drafts },
    recovered:
      value?.version !== DRAFT_VERSION ||
      drafts.length !== sourceDrafts.length ||
      drafts.some((draft, index) => {
        const source = sourceDrafts[index];
        return (
          source?.id !== draft.id ||
          source?.status !== "draft" ||
          source?.statement !== draft.statement ||
          source?.mediaId !== draft.mediaId ||
          source?.createdAt !== draft.createdAt
        );
      }),
  };
}

export function loadDraftState(storage, validMediaIds) {
  if (!storage) {
    return {
      state: emptyDraftState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }
  try {
    const stored = storage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) {
      return {
        state: emptyDraftState(),
        persistent: true,
        recovered: false,
        storageError: false,
      };
    }
    const normalized = normalizeDraftState(JSON.parse(stored), validMediaIds);
    return { ...normalized, persistent: true, storageError: false };
  } catch {
    return {
      state: emptyDraftState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }
}

export function saveDraftState(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function createDraft(state, input, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  const statement = cleanStatement(input?.statement);
  if (!validIds.has(input?.mediaId)) {
    return { state, changed: false, error: "Choose one of your three works." };
  }
  if (!statement) {
    return { state, changed: false, error: "Write the thought you want to keep." };
  }
  if (
    typeof input?.id !== "string" ||
    !input.id.startsWith("draft-") ||
    state.drafts.some((draft) => draft.id === input.id)
  ) {
    return { state, changed: false, error: "This Draft could not be created. Try again." };
  }
  const createdAt = input.createdAt ?? new Date().toISOString();
  if (Number.isNaN(Date.parse(createdAt))) {
    return { state, changed: false, error: "This Draft could not be created. Try again." };
  }
  const draft = {
    id: input.id,
    status: "draft",
    statement,
    mediaId: input.mediaId,
    createdAt,
  };
  return {
    state: { ...state, drafts: [...state.drafts, draft] },
    draft,
    changed: true,
    message: "Private Draft added to your Map.",
  };
}

export function editDraft(state, id, statement) {
  const nextStatement = cleanStatement(statement);
  if (!nextStatement) {
    return { state, changed: false, error: "Write the thought you want to keep." };
  }
  const index = state.drafts.findIndex((draft) => draft.id === id);
  if (index < 0) {
    return { state, changed: false, error: "That Draft is no longer available." };
  }
  if (state.drafts[index].statement === nextStatement) {
    return {
      state,
      draft: state.drafts[index],
      changed: false,
      message: "Draft unchanged.",
    };
  }
  const draft = { ...state.drafts[index], statement: nextStatement };
  const drafts = [...state.drafts];
  drafts[index] = draft;
  return {
    state: { ...state, drafts },
    draft,
    changed: true,
    message: "Private Draft updated.",
  };
}

export function composeGraphWithDrafts(baseGraph, state) {
  const graph = {
    profile: {
      ...baseGraph.profile,
      ...(baseGraph.profile.featuredMediaIds
        ? { featuredMediaIds: [...baseGraph.profile.featuredMediaIds] }
        : {}),
    },
    nodes: baseGraph.nodes.map((node) => ({
      ...node,
      ...(node.anchors ? { anchors: [...node.anchors] } : {}),
    })),
    edges: baseGraph.edges.map((edge) => ({ ...edge })),
  };
  const existingIds = new Set(graph.nodes.map((node) => node.id));
  const authorId = graph.nodes.find((node) => node.type === "user")?.id;

  state.drafts.forEach((draft) => {
    if (existingIds.has(draft.id)) return;
    existingIds.add(draft.id);
    graph.nodes.push({
      id: draft.id,
      type: "thought",
      status: "draft",
      statement: draft.statement,
      anchors: [draft.mediaId],
      createdAt: draft.createdAt,
    });
    if (authorId) {
      graph.edges.push({
        id: `authored-${draft.id}`,
        source: authorId,
        target: draft.id,
        kind: "authored",
      });
    }
    graph.edges.push({
      id: `anchor-${draft.id}-${draft.mediaId}`,
      source: draft.id,
      target: draft.mediaId,
      kind: "primary-anchor",
    });
  });

  return graph;
}
