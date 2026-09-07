import { getCatalogue } from "../product/catalogue/catalogue.ts";
import {
  type Thought,
} from "../product/authorship/draft-state.ts";
import {
  createAuthoredThoughtPersistencePort,
  createAuthoredThoughtReloadPort,
  createAuthoredThoughtStartupPort,
  THOUGHT_STORAGE_KEY,
} from "../adapters/browser/authored-local-storage.ts";
import { reloadAuthoredThoughts } from "../application/authorship/reload-authored-thoughts.ts";
import { publishAuthoredThought } from "../application/authorship/publish-authored-thought.ts";
import { saveAuthoredDraft } from "../application/authorship/save-authored-draft.ts";
import { prepareAuthoredCapture } from "../application/authorship/prepare-authored-capture.ts";
import { initializeMapSession } from "../application/map/initialize-map-session.ts";
import type { KeyValueStoragePort } from "../kernel/key-value-storage.ts";
import type { ClockPort } from "../kernel/clock.ts";
import type { IdentifierPort } from "../kernel/identifier.ts";
import type { StorageChangePort } from "../kernel/storage-change.ts";
import type { ResizeEventPort } from "../kernel/resize-event.ts";
import {
  createFeaturedPersistencePort,
  createFeaturedRecoveryPersistencePort,
  createFeaturedStartupPort,
} from "../adapters/browser/featured-local-storage.ts";
import { createMapReadModel } from "../application/map/create-map-read-model.ts";
import { ThoughtMap } from "../ui/map.dom.ts";
import {
  createPinnedPositionPersistencePort,
  createPinnedPositionRecoveryPersistencePort,
  createPinnedPositionStartupPort,
} from "../adapters/browser/pinned-local-storage.ts";
import {
  pinPosition,
  unpinPosition,
} from "../application/map/update-pinned-positions.ts";
import {
  createSelectionPersistencePort,
  createSelectionRecoveryPersistencePort,
  createSelectionStartupPort,
} from "../adapters/browser/selection-local-storage.ts";
import {
  confirmSelection,
  toggleSelection,
} from "../application/taste/update-selection.ts";
import { toggleFeatured } from "../application/taste/update-featured.ts";
import { getPrototypeFacts } from "../adapters/seed/prototype-seed.ts";
import type { MapGraph } from "../product/map/map-graph.ts";
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
  graph: MapGraph;
  message: string;
};

const root = getBrowserRoot(document);
const mapPresentation = createMapPresentation();
const clock: ClockPort = browserClock;
const identifier: IdentifierPort = browserIdentifier;
const storageChanges: StorageChangePort = createBrowserStorageChangePort(window);
const resizeEvents: ResizeEventPort = createBrowserResizeEventPort(window);

try {
  const prototype = getPrototypeFacts();
  const catalogue = getCatalogue();
  const mapFacts = { prototype, catalogue };
  const storage: KeyValueStoragePort | null = getBrowserKeyValueStorage(window);
  const session = initializeMapSession({
    mapFacts,
    selection: createSelectionStartupPort(storage),
    featured: createFeaturedStartupPort(storage),
    authoredThoughts: createAuthoredThoughtStartupPort(storage),
    pinnedPositions: createPinnedPositionStartupPort(storage),
    selectionRecovery: createSelectionRecoveryPersistencePort(storage),
    featuredRecovery: createFeaturedRecoveryPersistencePort(storage),
    pinnedPositionRecovery: createPinnedPositionRecoveryPersistencePort(storage),
  });
  const validCatalogueIds = session.validCatalogueIds;
  const publicMediaIds = session.publicMediaIds;
  const authoredThoughts = createAuthoredThoughtReloadPort(storage, validCatalogueIds);
  const authoredThoughtPersistence = createAuthoredThoughtPersistencePort(storage, validCatalogueIds);
  const selectionPersistence = createSelectionPersistencePort(storage);
  const featuredPersistence = createFeaturedPersistencePort(storage);
  const pinnedPersistence = createPinnedPositionPersistencePort(storage);
  let selectionState = session.selectionState;
  let featuredState = session.featuredState;
  let draftState = session.draftState;
  let graph = session.graph;
  const pinnableIds = () =>
    new Set(graph.nodes.filter((node) => node.type !== "user").map((node) => node.id));
  let pinnedState = session.pinnedState;
  let persistent = session.persistent;
  let initialChooserMessage = session.initialChooserMessage;
  let featuredMessage = session.featuredMessage;
  let initialDraftMessage = session.initialDraftMessage;
  let draftMessage = initialDraftMessage;
  let chooser: WorkChooser | null = null;
  let capture: ThoughtCapture<SavedThought> | null = null;
  let map: ThoughtMap | null = null;
  let mapMode: "owner" | "visitor" = "owner";
  let ownerModeInteraction: {
    positions: Record<string, { x: number; y: number }>;
    movedNodeIds: readonly string[];
  } | null = null;

  const activeMap = (): ThoughtMap => {
    if (!map) throw new Error("Expected initialized Map.");
    return map;
  };
  const appShell = (): HTMLElement => {
    const shell = root.querySelector<HTMLElement>(".app-shell");
    if (!shell) throw new Error("Expected application shell.");
    return shell;
  };
  const currentMapReadModel = () => createMapReadModel(graph, mapMode, pinnedState);

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
    const prepared = prepareAuthoredCapture(
      draftState,
      selectionState,
      catalogue,
      draftId ? { kind: "edit", id: draftId } : { kind: "create" },
    );
    if (prepared.kind === "unavailable") return;
    const { draft, works } = prepared;

    capture = new ThoughtCapture<SavedThought>(appShell(), works, {
      draft,
      initialMessage: draft ? "" : initialDraftMessage,
      onSave: ({ draftId: editingId, primaryMediaId, statement }) => {
        const result = saveAuthoredDraft(
          mapFacts,
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
          graph: result.graph,
          message: draftMessage,
        };
      },
      onSaved: (result) => {
        graph = result.graph;
        activeMap().updateReadModel(currentMapReadModel(), {
          focusId: result.draft.id,
          message: result.message,
        });
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
    if (capture || chooser || mapMode !== "owner") return;
    const prepared = prepareAuthoredCapture(
      draftState,
      selectionState,
      catalogue,
      { kind: "bridge", id: draftId },
    );
    if (prepared.kind !== "bridge") return;
    const { draft, works } = prepared;

    capture = new ThoughtCapture<SavedThought>(appShell(), works, {
      draft,
      bridgeMode: true,
      onSave: ({ secondaryMediaId, statement }) => {
        const result = saveAuthoredDraft(
          mapFacts,
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
          graph: result.graph,
          message: draftMessage,
        };
      },
      onSaved: (result) => {
        graph = result.graph;
        activeMap().updateReadModel(currentMapReadModel(), {
          selectId: result.draft.id,
          message: result.message,
        });
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
    map = new ThoughtMap(root, currentMapReadModel(), {
      presentation: mapPresentation,
      clock,
      resizeEvents,
      selectionState,
      featuredState,
      featuredMessage,
      draftMessage,
      onOpenChooser: openChooser,
      onOpenCapture: () => openCapture(),
      onEditDraft: (id) => openCapture(id),
      onConnectDraft: (id) => openBridge(id),
      onPublishDraft: (id) => {
        const result = publishAuthoredThought(
          mapFacts,
          draftState,
          id,
          validCatalogueIds,
          clock,
          authoredThoughtPersistence,
        );
        if (!result.changed || !("graph" in result) || !("message" in result)) return result;
        draftState = result.state;
        draftMessage = result.message;
        graph = result.graph;
        activeMap().updateReadModel(currentMapReadModel(), { selectId: id, message: draftMessage });
        return result;
      },
      onToggleFeatured: (id) => {
        const media = graph.nodes.find(
          (node): node is Extract<typeof node, { type: "media" }> => node.id === id && node.type === "media",
        );
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
      onModeChange: (nextMode, currentPositions, currentMovedNodeIds) => {
        if (nextMode === "visitor") {
          ownerModeInteraction = { positions: currentPositions, movedNodeIds: currentMovedNodeIds };
        }
        mapMode = nextMode;
        activeMap().updateReadModel(currentMapReadModel(), {
          ...(nextMode === "owner" && ownerModeInteraction
            ? {
                currentPositions: ownerModeInteraction.positions,
                currentMovedNodeIds: ownerModeInteraction.movedNodeIds,
              }
            : {}),
        });
        if (nextMode === "owner") ownerModeInteraction = null;
      },
    });
    publishBrowserThoughtMap(window, map);
    storageChanges.onChange(THOUGHT_STORAGE_KEY, () => {
      const synced = reloadAuthoredThoughts(mapFacts, authoredThoughts);
      if (synced.kind === "storage-unavailable") return;
      draftState = synced.state;
      graph = synced.graph;
      activeMap().updateReadModel(currentMapReadModel(), { message: synced.message });
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
