import { getCatalogue, type CatalogueWork } from "../product/catalogue/catalogue.ts";
import {
  composeGraphWithDrafts,
  type Thought,
} from "../product/authorship/draft-state.ts";
import {
  createAuthoredThoughtPersistencePort,
  createAuthoredThoughtRecoveryPersistencePort,
  createAuthoredThoughtReloadPort,
  loadDraftState,
  THOUGHT_STORAGE_KEY,
} from "../adapters/browser/authored-local-storage.ts";
import { reloadAuthoredThoughts } from "../application/authorship/reload-authored-thoughts.ts";
import { recoverAuthoredThoughts } from "../application/authorship/recover-authored-thoughts.ts";
import { publishAuthoredThought } from "../application/authorship/publish-authored-thought.ts";
import { saveAuthoredDraft } from "../application/authorship/save-authored-draft.ts";
import type { KeyValueStoragePort } from "../kernel/key-value-storage.ts";
import type { ClockPort } from "../kernel/clock.ts";
import type { IdentifierPort } from "../kernel/identifier.ts";
import type { StorageChangePort } from "../kernel/storage-change.ts";
import type { ResizeEventPort } from "../kernel/resize-event.ts";
import {
  createFeaturedPersistencePort,
  loadFeaturedState,
} from "../adapters/browser/featured-local-storage.ts";
import { getPublicMediaIds } from "../graph-projection.ts";
import { ThoughtMap } from "../ui/map.dom.ts";
import {
  createPinnedPositionPersistencePort,
  loadPinnedState,
} from "../adapters/browser/pinned-local-storage.ts";
import {
  pinPosition,
  unpinPosition,
} from "../application/map/update-pinned-positions.ts";
import {
  createSelectionPersistencePort,
  loadSelection,
} from "../adapters/browser/selection-local-storage.ts";
import {
  confirmSelection,
  toggleSelection,
} from "../application/taste/update-selection.ts";
import { toggleFeatured } from "../application/taste/update-featured.ts";
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
  const authoredThoughtPersistence = createAuthoredThoughtPersistencePort(storage, validCatalogueIds);
  const authoredThoughtRecoveryPersistence = createAuthoredThoughtRecoveryPersistencePort(
    storage,
    validCatalogueIds,
  );
  const selectionPersistence = createSelectionPersistencePort(storage);
  const featuredPersistence = createFeaturedPersistencePort(storage);
  const pinnedPersistence = createPinnedPositionPersistencePort(storage);

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
    persistent = selectionPersistence.save(selectionState);
  }
  if (loadedFeatured.recovered && loadedFeatured.persistent) {
    if (!featuredPersistence.save(featuredState)) {
      featuredMessage = "Unavailable featured works were removed. Changes will last for this visit.";
    }
  }
  if (loadedDrafts.recovered && loadedDrafts.persistent) {
    const persistedDrafts = recoverAuthoredThoughts(
      draftState,
      authoredThoughtRecoveryPersistence,
    );
    draftState = persistedDrafts.state;
    graph = composeGraphWithDrafts(baseGraph, draftState);
    if (!persistedDrafts.saved) {
      initialDraftMessage =
        "Saved authored Thoughts were recovered safely. Changes will last for this visit.";
      draftMessage = initialDraftMessage;
    }
  }
  if (loadedPinned.recovered && loadedPinned.persistent) {
    pinnedPersistence.save(pinnedState);
  }

  const openChooser = () => {
    if (chooser || capture || mapMode !== "owner") return;
    chooser = new WorkChooser(appShell(), catalogue, selectionState, {
      persistent,
      initialMessage: initialChooserMessage,
      onToggle: (id) => {
        const result = toggleSelection(selectionState, id, validCatalogueIds, selectionPersistence);
        selectionState = result.state;
        if (result.saved !== null) {
          persistent = result.saved;
          map?.updateSelectionState(selectionState);
        }
        return result;
      },
      onConfirm: () => {
        const result = confirmSelection(selectionState, selectionPersistence);
        selectionState = result.state;
        if (result.saved !== null) {
          persistent = result.saved;
          map?.updateSelectionState(selectionState);
        }
        return result;
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
        const result = saveAuthoredDraft(
          draftState,
          editingId
            ? { kind: "edit", id: editingId, statement }
            : {
                kind: "create",
                primaryMediaId,
                statement,
                selectedMediaIds: new Set(selectionState.selectedMediaIds),
                clock,
                identifier,
              },
          validCatalogueIds,
          authoredThoughtPersistence,
        );
        if ("error" in result) return { saved: false, message: result.error };

        draftState = result.state;
        draftMessage = result.message;
        return {
          saved: true,
          draft: result.thought,
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
        const result = saveAuthoredDraft(
          draftState,
          {
            kind: "bridge",
            id: draft.id,
            secondaryMediaId,
            statement,
            statementAtOpen: draft.statement,
          },
          validCatalogueIds,
          authoredThoughtPersistence,
        );
        if ("error" in result) return { saved: false, message: result.error };
        draftState = result.state;
        draftMessage = result.message;
        return {
          saved: true,
          draft: result.thought,
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
      clock,
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
        const result = publishAuthoredThought(
          draftState,
          id,
          validCatalogueIds,
          clock,
          authoredThoughtPersistence,
        );
        if (!result.changed || !("message" in result)) return result;
        draftState = result.state;
        draftMessage = result.message;
        graph = composeGraphWithDrafts(baseGraph, draftState);
        activeMap().updateGraph(graph, { selectId: id, message: draftMessage });
        return result;
      },
      onToggleFeatured: (id) => {
        const media = graph.nodes.find((node) => node.id === id && node.type === "media");
        const result = toggleFeatured(
          featuredState,
          id,
          publicMediaIds,
          typeof media?.title === "string" ? media.title : "This work",
          featuredPersistence,
        );
        featuredState = result.state;
        featuredMessage = result.message;
        return result;
      },
      onPinPosition: (id, position) => {
        const result = pinPosition(pinnedState, id, position, pinnableIds(), pinnedPersistence);
        pinnedState = result.state;
        return result;
      },
      onUnpinPosition: (id) => {
        const result = unpinPosition(pinnedState, id, pinnedPersistence);
        pinnedState = result.state;
        return result;
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
