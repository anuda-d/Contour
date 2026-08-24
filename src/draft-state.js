export const THOUGHT_VERSION = 2;
export const THOUGHT_STORAGE_KEY = "thought-map.prototype.authored-thoughts.v2";
export const THOUGHT_V1_STORAGE_KEY = "thought-map.prototype.authored-thoughts.v1";
// Kept as read-only migration input for existing prototype Drafts.
export const DRAFT_VERSION = 1;
export const DRAFT_STORAGE_KEY = "thought-map.prototype.drafts.v1";

export function emptyDraftState() {
  return { version: THOUGHT_VERSION, thoughts: [] };
}

const cleanStatement = (value) => (typeof value === "string" ? value.trim() : "");
const isTimestamp = (value) => {
  if (typeof value !== "string" || !value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
};

function normalizeThoughts(sourceThoughts, validMediaIds, { allowLegacyMediaId = false } = {}) {
  const seenIds = new Set();
  const thoughts = [];
  let recovered = false;

  sourceThoughts.forEach((thought) => {
    const statement = cleanStatement(thought?.statement);
    const primaryMediaId =
      typeof thought?.primaryMediaId === "string"
        ? thought.primaryMediaId
        : allowLegacyMediaId
          ? thought?.mediaId
          : null;
    const valid =
      typeof thought?.id === "string" &&
      thought.id.startsWith("draft-") &&
      !seenIds.has(thought.id) &&
      statement.length > 0 &&
      typeof primaryMediaId === "string" &&
      validMediaIds.has(primaryMediaId) &&
      isTimestamp(thought?.createdAt);
    if (!valid) {
      recovered = true;
      return;
    }

    seenIds.add(thought.id);
    const published = thought.status === "published" && isTimestamp(thought.publishedAt);
    const hasSecondary =
      typeof thought.secondaryMediaId === "string" &&
      thought.secondaryMediaId !== primaryMediaId &&
      validMediaIds.has(thought.secondaryMediaId);
    const normalized = {
      id: thought.id,
      status: published ? "published" : "draft",
      statement,
      primaryMediaId,
      ...(hasSecondary ? { secondaryMediaId: thought.secondaryMediaId } : {}),
      createdAt: thought.createdAt,
      ...(published ? { publishedAt: thought.publishedAt } : {}),
    };
    thoughts.push(normalized);
    if (
      thought.status !== normalized.status ||
      thought.statement !== normalized.statement ||
      thought.publishedAt !== normalized.publishedAt ||
      thought.primaryMediaId !== normalized.primaryMediaId ||
      thought.secondaryMediaId !== normalized.secondaryMediaId ||
      thought.mediaId !== undefined
    ) {
      recovered = true;
    }
  });

  return { thoughts, recovered };
}

export function normalizeDraftState(value, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  const sourceThoughts = Array.isArray(value?.thoughts) ? value.thoughts : [];
  const normalized = normalizeThoughts(sourceThoughts, validIds, {
    allowLegacyMediaId: value?.version === 1,
  });

  return {
    state: { version: THOUGHT_VERSION, thoughts: normalized.thoughts },
    recovered: value?.version !== THOUGHT_VERSION || normalized.recovered,
    recoveryNotice: normalized.recovered,
  };
}

function migrateLegacyDraftState(value, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  const sourceDrafts = Array.isArray(value?.drafts) ? value.drafts : [];
  const normalized = normalizeThoughts(
    sourceDrafts.map((draft) => ({
      id: draft?.id,
      status: "draft",
      statement: draft?.statement,
      primaryMediaId: draft?.mediaId,
      createdAt: draft?.createdAt,
    })),
    validIds,
  );
  return {
    state: { version: THOUGHT_VERSION, thoughts: normalized.thoughts },
    recovered: true,
    migrated: true,
    recoveryNotice: normalized.recovered,
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
    const stored = storage.getItem(THOUGHT_STORAGE_KEY);
    if (stored !== null) {
      try {
        const normalized = normalizeDraftState(JSON.parse(stored), validMediaIds);
        return { ...normalized, persistent: true, storageError: false, migrated: false };
      } catch {
        return {
          state: emptyDraftState(),
          persistent: true,
          recovered: true,
          storageError: false,
          migrated: false,
          recoveryNotice: true,
        };
      }
    }

    const priorLifecycle = storage.getItem(THOUGHT_V1_STORAGE_KEY);
    if (priorLifecycle !== null) {
      try {
        const normalized = normalizeDraftState(JSON.parse(priorLifecycle), validMediaIds);
        return {
          ...normalized,
          persistent: true,
          storageError: false,
          migrated: true,
        };
      } catch {
        return {
          state: emptyDraftState(),
          persistent: true,
          recovered: true,
          storageError: false,
          migrated: true,
          recoveryNotice: true,
        };
      }
    }

    const legacy = storage.getItem(DRAFT_STORAGE_KEY);
    if (legacy === null) {
      return {
        state: emptyDraftState(),
        persistent: true,
        recovered: false,
        storageError: false,
        migrated: false,
        recoveryNotice: false,
      };
    }
    try {
      return {
        ...migrateLegacyDraftState(JSON.parse(legacy), validMediaIds),
        persistent: true,
        storageError: false,
      };
    } catch {
      return {
        state: emptyDraftState(),
        persistent: true,
        recovered: true,
        storageError: false,
        migrated: true,
        recoveryNotice: true,
      };
    }
  } catch {
    return {
      state: emptyDraftState(),
      persistent: false,
      recovered: false,
      storageError: true,
    };
  }
}

export function mergeDraftStates(storedState, incomingState, mutation = null) {
  const thoughts = storedState.thoughts.map((thought) => ({ ...thought }));
  const indexById = new Map(thoughts.map((thought, index) => [thought.id, index]));

  incomingState.thoughts.forEach((thought) => {
    const index = indexById.get(thought.id);
    if (index === undefined) {
      indexById.set(thought.id, thoughts.length);
      thoughts.push({ ...thought });
      return;
    }
    if (thoughts[index].status === "published") return;
    if (thought.status === "published") {
      thoughts[index] = {
        ...thoughts[index],
        status: "published",
        publishedAt: thought.publishedAt,
      };
      return;
    }
    if (thought.id !== mutation?.id) return;
    mutation.fields.forEach((field) => {
      if (!["statement", "secondaryMediaId"].includes(field)) return;
      if (field === "secondaryMediaId" && !Object.hasOwn(thought, field)) {
        delete thoughts[index][field];
      } else {
        thoughts[index][field] = thought[field];
      }
    });
    if (thoughts[index].status !== "draft") {
      thoughts[index].status = "draft";
    }
  });

  return { version: THOUGHT_VERSION, thoughts };
}

export function persistDraftState(storage, state, validMediaIds, mutation = null) {
  if (!storage) return { saved: false, state };
  try {
    const stored = storage.getItem(THOUGHT_STORAGE_KEY);
    let current = emptyDraftState();
    if (stored !== null) {
      try {
        current = normalizeDraftState(JSON.parse(stored), validMediaIds).state;
      } catch {
        current = emptyDraftState();
      }
    }
    const merged = mergeDraftStates(current, state, mutation);
    storage.setItem(THOUGHT_STORAGE_KEY, JSON.stringify(merged));
    return { saved: true, state: merged };
  } catch {
    return { saved: false, state };
  }
}

export function createDraft(state, input, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  const statement = cleanStatement(input?.statement);
  if (!validIds.has(input?.primaryMediaId)) {
    return { state, changed: false, error: "Choose one of your three works." };
  }
  if (!statement) {
    return { state, changed: false, error: "Write the thought you want to keep." };
  }
  if (
    typeof input?.id !== "string" ||
    !input.id.startsWith("draft-") ||
    state.thoughts.some((thought) => thought.id === input.id)
  ) {
    return { state, changed: false, error: "This Draft could not be created. Try again." };
  }
  const createdAt = input.createdAt ?? new Date().toISOString();
  if (!isTimestamp(createdAt)) {
    return { state, changed: false, error: "This Draft could not be created. Try again." };
  }
  const draft = {
    id: input.id,
    status: "draft",
    statement,
    primaryMediaId: input.primaryMediaId,
    createdAt,
  };
  return {
    state: { ...state, thoughts: [...state.thoughts, draft] },
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
  const index = state.thoughts.findIndex(
    (thought) => thought.id === id && thought.status === "draft",
  );
  if (index < 0) {
    return { state, changed: false, error: "That Draft is no longer available." };
  }
  if (state.thoughts[index].statement === nextStatement) {
    return {
      state,
      draft: state.thoughts[index],
      changed: false,
      message: "Draft unchanged.",
    };
  }
  const draft = { ...state.thoughts[index], statement: nextStatement };
  const thoughts = [...state.thoughts];
  thoughts[index] = draft;
  return {
    state: { ...state, thoughts },
    draft,
    changed: true,
    message: "Private Draft updated.",
  };
}

export function connectDraft(state, id, input, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  const statement = cleanStatement(input?.statement);
  if (!statement) {
    return { state, changed: false, error: "Write the thought you want to keep." };
  }
  const index = state.thoughts.findIndex(
    (thought) => thought.id === id && thought.status === "draft",
  );
  const current = state.thoughts[index];
  if (!current) {
    return { state, changed: false, error: "That Draft is no longer available." };
  }
  if (
    !validIds.has(input?.secondaryMediaId) ||
    input.secondaryMediaId === current.primaryMediaId
  ) {
    return { state, changed: false, error: "Choose a different work to make this bridge." };
  }
  const draft = {
    ...current,
    statement,
    secondaryMediaId: input.secondaryMediaId,
  };
  if (
    current.statement === draft.statement &&
    current.secondaryMediaId === draft.secondaryMediaId
  ) {
    return { state, draft: current, changed: false, message: "Bridge Draft unchanged." };
  }
  const thoughts = [...state.thoughts];
  thoughts[index] = draft;
  return {
    state: { ...state, thoughts },
    draft,
    changed: true,
    message: "Private bridge added to your Map.",
  };
}

export function publishDraft(state, id, publishedAt, validMediaIds) {
  const validIds = validMediaIds instanceof Set ? validMediaIds : new Set(validMediaIds);
  if (!isTimestamp(publishedAt)) {
    return { state, changed: false, error: "This Thought could not be published. Try again." };
  }
  const index = state.thoughts.findIndex(
    (thought) => thought.id === id && thought.status === "draft",
  );
  const draft = state.thoughts[index];
  if (!draft) {
    return { state, changed: false, error: "That Draft is no longer available." };
  }
  const anchorsValid =
    validIds.has(draft.primaryMediaId) &&
    (!draft.secondaryMediaId ||
      (draft.secondaryMediaId !== draft.primaryMediaId && validIds.has(draft.secondaryMediaId)));
  if (!anchorsValid) {
    return {
      state,
      changed: false,
      error: "Choose a Book or Film before publishing this Thought.",
    };
  }

  const thought = { ...draft, status: "published", publishedAt };
  const thoughts = [...state.thoughts];
  thoughts[index] = thought;
  return {
    state: { ...state, thoughts },
    thought,
    changed: true,
    message: "Thought published. Visitor preview now shows it.",
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

  state.thoughts.forEach((thought) => {
    if (existingIds.has(thought.id)) return;
    existingIds.add(thought.id);
    graph.nodes.push({
      id: thought.id,
      type: "thought",
      status: thought.status,
      statement: thought.statement,
      anchors: [
        thought.primaryMediaId,
        ...(thought.secondaryMediaId ? [thought.secondaryMediaId] : []),
      ],
      createdAt: thought.createdAt,
      ...(thought.status === "published" ? { publishedAt: thought.publishedAt } : {}),
    });
    if (authorId) {
      graph.edges.push({
        id: `authored-${thought.id}`,
        source: authorId,
        target: thought.id,
        kind: "authored",
      });
    }
    graph.edges.push({
      id: `anchor-${thought.id}-${thought.primaryMediaId}`,
      source: thought.id,
      target: thought.primaryMediaId,
      kind: "primary-anchor",
    });
    if (thought.secondaryMediaId) {
      graph.edges.push({
        id: `anchor-${thought.id}-${thought.secondaryMediaId}`,
        source: thought.id,
        target: thought.secondaryMediaId,
        kind: "additional-anchor",
      });
    }
  });

  return graph;
}
