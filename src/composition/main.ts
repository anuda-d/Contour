import { getCatalogue, type CatalogueWork } from "../product/catalogue/catalogue.ts";
import {
  composeGraphWithDrafts,
  connectDraft,
  createDraft,
  editDraft,
  publishDraft,
  type Thought,
  type ThoughtMutation,
} from "../product/authorship/draft-state.ts";
import {
  createAuthoredThoughtReloadPort,
  loadDraftState,
  persistDraftState,
  THOUGHT_STORAGE_KEY,
} from "../adapters/browser/authored-local-storage.ts";
import { reloadAuthoredThoughts } from "../application/authorship/reload-authored-thoughts.ts";
import type { KeyValueStoragePort } from "../kernel/key-value-storage.ts";
import type { ClockPort } from "../kernel/clock.ts";
import type { IdentifierPort } from "../kernel/identifier.ts";
import type { StorageChangePort } from "../kernel/storage-change.ts";
import type { ResizeEventPort } from "../kernel/resize-event.ts";
import {
  loadFeaturedState,
  saveFeaturedState,
} from "../adapters/browser/featured-local-storage.ts";
import { getPublicMediaIds } from "../graph-projection.ts";
import { ThoughtMap } from "../ui/map.dom.ts";
import {
  loadPinnedState,
  savePinnedState,
} from "../adapters/browser/pinned-local-storage.ts";
import { pinPosition, unpinPosition } from "../product/map/pinned-positions.ts";
import {
  loadSelection,
  saveSelection,
} from "../adapters/browser/selection-local-storage.ts";
import {
  confirmSelection,
  toggleMediaSelection,
} from "../product/taste/selection.ts";
import { toggleFeaturedMedia } from "../product/taste/featured.ts";
import { getSeedGraph } from "../adapters/seed/prototype-seed.ts";
import { createMapPresentation } from "./map-presentation.ts";
import { ThoughtCapture } from "../ui/thought-capture.dom.ts";
import { WorkChooser } from "../ui/work-chooser.dom.ts";
import { browserClock } from "../adapters/browser/browser-clock.ts";
import { browserIdentifier } from "../adapters/browser/browser-identifier.ts";
import { createBrowserStorageChangePort } from "../adapters/browser/browser-storage-change.ts";
import { createBrowserResizeEventPort } from "../adapters/browser/browser-resize-event.ts";
import { getBrowserKeyValueStorage } from "../adapters/browser/browser-local-storage.ts";
import { getBrowserRoot } from "../adapters/browser/browser-root.ts";
import { publishBrowserThoughtMap } from "../adapters/browser/browser-map-global.ts";

type SavedThought = {
  saved: true;
  draft: Thought;
  message: string;
};

const root = getBrowserRoot(document);
const mapPresentation = createMapPresentation();
const clock: ClockPort = browserClock;
const identifier: IdentifierPort = browserIdentifier;
const storageChanges: StorageChangePort = createBrowserStorageChangePort(window);
const resizeEvents: ResizeEventPort = createBrowserResizeEventPort(window);

try {
  const baseGraph = getSeedGraph();
  const catalogue = getCatalogue();
  const validCatalogueIds = new Set(catalogue.map((item) => item.id));
  const publicMediaIds = getPublicMediaIds(baseGraph);
  const storage: KeyValueStoragePort | null = getBrowserKeyValueStorage(window);
  const authoredThoughts = createAuthoredThoughtReloadPort(storage, validCatalogueIds);

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
    : (loadedDrafts.recoveryNotice ?? (loadedDrafts.recovered && !loadedDrafts.migrated))
      ? "Saved authored Thoughts were recovered safely."
      : "";
  let draftMessage = initialDraftMessage;
  let chooser: WorkChooser | null = null;
  let capture: ThoughtCapture<SavedThought> | null = null;
  let map: ThoughtMap | null = null;
  let mapMode: "owner" | "visitor" = "owner";

  const activeMap = (): ThoughtMap => {
    if (!map) throw new Error("Expected initialized Map.");
    return map;
  };
  const appShell = (): HTMLElement => {
    const shell = root.querySelector<HTMLElement>(".app-shell");
    if (!shell) throw new Error("Expected application shell.");
    return shell;
  };

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
    const persistedDrafts = persistDraftState(storage, draftState, validCatalogueIds);
    draftState = persistedDrafts.state;
    graph = composeGraphWithDrafts(baseGraph, draftState);
    if (!persistedDrafts.saved) {
      initialDraftMessage =
        "Saved authored Thoughts were recovered safely. Changes will last for this visit.";
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
    chooser = new WorkChooser(appShell(), catalogue, selectionState, {
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
        activeMap().updateSelectionState(selectionState);
      },
      restoreFocus: () => activeMap().focusChooserEntry(),
    });
    initialChooserMessage = "";
  };

  const openCapture = (draftId: string | null = null) => {
    if (capture || chooser || mapMode !== "owner") return;
    const draft = (draftId
      ? draftState.thoughts.find((item) => item.id === draftId && item.status === "draft")
      : null) ?? null;
    if (draftId && !draft) return;
    if (!draft && !selectionState.confirmed) return;

    const workIds = draft
      ? [
          draft.primaryMediaId,
          ...(draft.secondaryMediaId ? [draft.secondaryMediaId] : []),
        ]
      : selectionState.selectedMediaIds;
    const works = workIds
      .map((id) => catalogue.find((item) => item.id === id))
      .filter((item): item is CatalogueWork => item !== undefined);
    if (!works.length) return;

    capture = new ThoughtCapture<SavedThought>(appShell(), works, {
      draft,
      initialMessage: draft ? "" : initialDraftMessage,
      onSave: ({ draftId: editingId, primaryMediaId, statement }) => {
        const result = editingId
          ? editDraft(draftState, editingId, statement)
          : createDraft(
              draftState,
              {
                id: `draft-${identifier.randomUuid()}`,
                primaryMediaId,
                statement,
                createdAt: clock.now(),
              },
              new Set(selectionState.selectedMediaIds),
            );
        if ("error" in result) return { saved: false, message: result.error };

        draftState = result.state;
        const persisted = result.changed
          ? persistDraftState(storage, draftState, validCatalogueIds, {
              id: result.draft.id,
              fields: editingId ? ["statement"] : [],
            })
          : { saved: true, state: draftState };
        draftState = persisted.state;
        const currentThought = draftState.thoughts.find((thought) => thought.id === result.draft.id);
        const publishedElsewhere = editingId && currentThought?.status === "published";
        draftMessage = publishedElsewhere
          ? "This Thought was already published in another tab. The private edit was not saved."
          : persisted.saved
            ? result.message
            : `${result.message} This Draft will last for this visit.`;
        return {
          saved: true,
          draft: currentThought ?? result.draft,
          message: draftMessage,
        };
      },
      onSaved: (result) => {
        graph = composeGraphWithDrafts(baseGraph, draftState);
        activeMap().updateGraph(graph, { focusId: result.draft.id, message: result.message });
      },
      onClose: () => {
        capture = null;
      },
      restoreFocus: () => {
        if (draft) activeMap().focusDraftEdit(draft.id);
        else activeMap().focusCaptureEntry();
      },
    });
    initialDraftMessage = "";
  };

  const openBridge = (draftId: string) => {
    if (capture || chooser || mapMode !== "owner" || !selectionState.confirmed) return;
    const draft = draftState.thoughts.find(
      (thought) =>
        thought.id === draftId && thought.status === "draft" && !thought.secondaryMediaId,
    );
    if (!draft) return;
    const primaryWork = catalogue.find((item) => item.id === draft.primaryMediaId);
    const otherWorks = selectionState.selectedMediaIds
      .filter((id) => id !== draft.primaryMediaId)
      .map((id) => catalogue.find((item) => item.id === id))
      .filter((item): item is CatalogueWork => item !== undefined);
    if (!primaryWork || !otherWorks.length) return;
    const works = [primaryWork, ...otherWorks];

    capture = new ThoughtCapture<SavedThought>(appShell(), works, {
      draft,
      bridgeMode: true,
      onSave: ({ secondaryMediaId, statement }) => {
        const result = connectDraft(
          draftState,
          draft.id,
          { secondaryMediaId, statement },
          validCatalogueIds,
        );
        if ("error" in result) return { saved: false, message: result.error };
        draftState = result.state;
        const bridgeMutationFields: ThoughtMutation["fields"] =
          result.draft.statement === draft.statement
            ? ["secondaryMediaId"]
            : ["secondaryMediaId", "statement"];
        const persisted = result.changed
          ? persistDraftState(storage, draftState, validCatalogueIds, {
              id: draft.id,
              fields: bridgeMutationFields,
            })
          : { saved: true, state: draftState };
        draftState = persisted.state;
        const currentThought = draftState.thoughts.find((thought) => thought.id === draft.id);
        const publishedElsewhere = currentThought?.status === "published";
        draftMessage = publishedElsewhere
          ? "This Thought was already published in another tab. The bridge was not saved."
          : persisted.saved
            ? result.message
            : `${result.message} This bridge will last for this visit.`;
        return {
          saved: true,
          draft: currentThought ?? result.draft,
          message: draftMessage,
        };
      },
      onSaved: (result) => {
        graph = composeGraphWithDrafts(baseGraph, draftState);
        activeMap().updateGraph(graph, { selectId: result.draft.id, message: result.message });
      },
      onClose: () => {
        capture = null;
      },
      restoreFocus: () => activeMap().focusDraftConnect(draft.id),
    });
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
      presentation: mapPresentation,
      resizeEvents,
      mode: mapMode,
      selectionState,
      featuredState,
      featuredMessage,
      draftMessage,
      pinnedState,
      onOpenChooser: openChooser,
      onOpenCapture: () => openCapture(),
      onEditDraft: (id) => openCapture(id),
      onConnectDraft: (id) => openBridge(id),
      onPublishDraft: (id) => {
        const result = publishDraft(
          draftState,
          id,
          clock.now(),
          validCatalogueIds,
        );
        if (!result.changed || !("message" in result)) return result;
        draftState = result.state;
        const persisted = persistDraftState(storage, draftState, validCatalogueIds, {
          id,
          fields: ["status", "publishedAt"],
        });
        draftState = persisted.state;
        draftMessage = persisted.saved
          ? result.message
          : "Thought published for this visit. The saved Draft was not changed.";
        graph = composeGraphWithDrafts(baseGraph, draftState);
        activeMap().updateGraph(graph, { selectId: id, message: draftMessage });
        return { ...result, state: draftState, message: draftMessage };
      },
      onToggleFeatured: (id) => {
        const media = graph.nodes.find((node) => node.id === id && node.type === "media");
        const result = toggleFeaturedMedia(
          featuredState,
          id,
          publicMediaIds,
          typeof media?.title === "string" ? media.title : "This work",
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
        activeMap().setMode(nextMode);
      },
    });
    publishBrowserThoughtMap(window, map);
    storageChanges.onChange(THOUGHT_STORAGE_KEY, () => {
      const synced = reloadAuthoredThoughts(baseGraph, authoredThoughts);
      if (synced.kind === "storage-unavailable") return;
      draftState = synced.state;
      graph = synced.graph;
      activeMap().updateGraph(graph, { message: synced.message });
    });
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
