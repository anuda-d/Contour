import { getCatalogue } from "./catalog.js";
import {
  composeGraphWithDrafts,
  createDraft,
  editDraft,
  loadDraftState,
  saveDraftState,
} from "./draft-state.js";
import {
  loadFeaturedState,
  saveFeaturedState,
  toggleFeaturedMedia,
} from "./featured-state.js";
import { getPublicMediaIds } from "./graph-projection.js";
import { ThoughtMap } from "./map.js?v=editorial-constellation-12";
import {
  loadPinnedState,
  pinPosition,
  savePinnedState,
  unpinPosition,
} from "./pinned-state.js";
import {
  confirmSelection,
  loadSelection,
  saveSelection,
  toggleMediaSelection,
} from "./selection-state.js";
import { getSeedGraph } from "./seed.js";
import { ThoughtCapture } from "./thought-capture.js";
import { WorkChooser } from "./work-chooser.js";

const root = document.querySelector("#app");

try {
  const baseGraph = getSeedGraph();
  const catalogue = getCatalogue();
  const validCatalogueIds = new Set(catalogue.map((item) => item.id));
  const publicMediaIds = getPublicMediaIds(baseGraph);
  let storage = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }

  const loaded = loadSelection(storage, validCatalogueIds);
  const loadedFeatured = loadFeaturedState(
    storage,
    publicMediaIds,
    baseGraph.profile.featuredMediaIds,
  );
  const loadedDrafts = loadDraftState(storage, validCatalogueIds);
  let selectionState = loaded.state;
  let featuredState = loadedFeatured.state;
  let draftState = loadedDrafts.state;
  let graph = composeGraphWithDrafts(baseGraph, draftState);
  const pinnableIds = () =>
    new Set(graph.nodes.filter((node) => node.type !== "user").map((node) => node.id));
  const loadedPinned = loadPinnedState(storage, pinnableIds());
  let pinnedState = loadedPinned.state;
  let persistent = loaded.persistent;
  let initialChooserMessage = loaded.storageError
    ? "Selections will last for this visit."
    : loaded.recovered
      ? "Unavailable saved works were removed."
      : "";
  let featuredPersistent = loadedFeatured.persistent;
  let featuredMessage = loadedFeatured.storageError
    ? "Featured Media will last for this visit."
    : loadedFeatured.recovered
      ? "Unavailable featured works were removed."
      : "";
  let initialDraftMessage = loadedDrafts.storageError
    ? "Private Drafts will last for this visit."
    : loadedDrafts.recovered
      ? "Unavailable private Drafts were removed."
      : "";
  let draftMessage = initialDraftMessage;
  let chooser = null;
  let capture = null;
  let map = null;
  let mapMode = "owner";

  if (loaded.recovered && loaded.persistent) {
    persistent = saveSelection(storage, selectionState);
  }
  if (loadedFeatured.recovered && loadedFeatured.persistent) {
    featuredPersistent = saveFeaturedState(storage, featuredState);
    if (!featuredPersistent) {
      featuredMessage = "Unavailable featured works were removed. Changes will last for this visit.";
    }
  }
  if (loadedDrafts.recovered && loadedDrafts.persistent) {
    if (!saveDraftState(storage, draftState)) {
      initialDraftMessage =
        "Unavailable private Drafts were removed. Drafts will last for this visit.";
      draftMessage = initialDraftMessage;
    }
  }
  if (loadedPinned.recovered && loadedPinned.persistent) {
    savePinnedState(storage, pinnedState);
  }

  const persistSelection = () => {
    persistent = saveSelection(storage, selectionState);
    map?.updateSelectionState(selectionState);
    return persistent;
  };

  const openChooser = () => {
    if (chooser || capture || mapMode !== "owner") return;
    chooser = new WorkChooser(root.querySelector(".app-shell"), catalogue, selectionState, {
      persistent,
      initialMessage: initialChooserMessage,
      onToggle: (id) => {
        const result = toggleMediaSelection(selectionState, id, validCatalogueIds);
        selectionState = result.state;
        const saved = !result.changed || persistSelection();
        return {
          ...result,
          state: selectionState,
          message: saved ? result.message : "Selection saved for this visit only.",
        };
      },
      onConfirm: () => {
        const result = confirmSelection(selectionState);
        selectionState = result.state;
        const saved = !result.confirmed || persistSelection();
        return {
          ...result,
          state: selectionState,
          message: saved ? result.message : "Three works are ready for this visit.",
        };
      },
      onClose: () => {
        chooser = null;
        map.updateSelectionState(selectionState);
      },
      restoreFocus: () => map.focusChooserEntry(),
    });
    initialChooserMessage = "";
  };

  const openCapture = (draftId = null) => {
    if (capture || chooser || mapMode !== "owner") return;
    const draft = draftId ? draftState.drafts.find((item) => item.id === draftId) : null;
    if (draftId && !draft) return;
    if (!draft && !selectionState.confirmed) return;

    const workIds = draft ? [draft.mediaId] : selectionState.selectedMediaIds;
    const works = workIds
      .map((id) => catalogue.find((item) => item.id === id))
      .filter(Boolean);
    if (!works.length) return;

    capture = new ThoughtCapture(root.querySelector(".app-shell"), works, {
      draft,
      initialMessage: draft ? "" : initialDraftMessage,
      onSave: ({ draftId: editingId, mediaId, statement }) => {
        const result = editingId
          ? editDraft(draftState, editingId, statement)
          : createDraft(
              draftState,
              {
                id: `draft-${crypto.randomUUID()}`,
                mediaId,
                statement,
                createdAt: new Date().toISOString(),
              },
              new Set(selectionState.selectedMediaIds),
            );
        if (result.error) return { saved: false, message: result.error };

        draftState = result.state;
        const persisted = !result.changed || saveDraftState(storage, draftState);
        draftMessage = persisted
          ? result.message
          : `${result.message} This Draft will last for this visit.`;
        return { saved: true, draft: result.draft, message: draftMessage };
      },
      onSaved: (result) => {
        graph = composeGraphWithDrafts(baseGraph, draftState);
        map.updateGraph(graph, { focusId: result.draft.id, message: result.message });
      },
      onClose: () => {
        capture = null;
      },
      restoreFocus: () => {
        if (draft) map.focusDraftEdit(draft.id);
        else map.focusCaptureEntry();
      },
    });
    initialDraftMessage = "";
  };

  if (!graph.nodes.length) {
    root.innerHTML = `
      <main class="empty-state">
        <h1>This Map is ready for its first Thought.</h1>
        <p>Add a Book or Film to begin shaping it.</p>
      </main>
    `;
  } else {
    map = new ThoughtMap(root, graph, {
      mode: mapMode,
      selectionState,
      featuredState,
      featuredMessage,
      draftMessage,
      pinnedState,
      onOpenChooser: openChooser,
      onOpenCapture: () => openCapture(),
      onEditDraft: (id) => openCapture(id),
      onToggleFeatured: (id) => {
        const media = graph.nodes.find((node) => node.id === id && node.type === "media");
        const result = toggleFeaturedMedia(
          featuredState,
          id,
          publicMediaIds,
          media?.title ?? "This work",
        );
        featuredState = result.state;
        const saved = !result.changed || saveFeaturedState(storage, featuredState);
        featuredPersistent = featuredPersistent && saved;
        featuredMessage = saved
          ? result.message
          : `${result.message} This change will last for this visit.`;
        return { ...result, state: featuredState, message: featuredMessage };
      },
      onPinPosition: (id, position) => {
        const result = pinPosition(pinnedState, id, position, pinnableIds());
        pinnedState = result.state;
        const saved = !result.changed || savePinnedState(storage, pinnedState);
        return {
          ...result,
          state: pinnedState,
          message: saved ? result.message : "Position pinned for this visit.",
        };
      },
      onUnpinPosition: (id) => {
        const result = unpinPosition(pinnedState, id);
        pinnedState = result.state;
        const saved = !result.changed || savePinnedState(storage, pinnedState);
        return {
          ...result,
          state: pinnedState,
          message: saved
            ? result.message
            : "Position returned for this visit. The saved pin could not be changed.",
        };
      },
      onModeChange: (nextMode) => {
        mapMode = nextMode;
        map.setMode(nextMode);
      },
    });
    window.thoughtMap = map;
  }
} catch (error) {
  console.error("The Map could not start.", error);
  root.innerHTML = `
    <main class="error-state" role="alert">
      <h1>The Map could not open.</h1>
      <p>Reload the page. If the problem continues, the local seed needs attention.</p>
    </main>
  `;
}
