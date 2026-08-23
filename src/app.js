import { getCatalogue } from "./catalog.js";
import { ThoughtMap } from "./map.js?v=editorial-constellation-9";
import {
  confirmSelection,
  loadSelection,
  saveSelection,
  toggleMediaSelection,
} from "./selection-state.js";
import { getSeedGraph } from "./seed.js";
import { WorkChooser } from "./work-chooser.js";

const root = document.querySelector("#app");

try {
  const graph = getSeedGraph();
  const catalogue = getCatalogue();
  const validCatalogueIds = new Set(catalogue.map((item) => item.id));
  let storage = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }

  const loaded = loadSelection(storage, validCatalogueIds);
  let selectionState = loaded.state;
  let persistent = loaded.persistent;
  let initialChooserMessage = loaded.storageError
    ? "Selections will last for this visit."
    : loaded.recovered
      ? "Unavailable saved works were removed."
      : "";
  let chooser = null;
  let map = null;
  let mapMode = "owner";

  if (loaded.recovered && loaded.persistent) {
    persistent = saveSelection(storage, selectionState);
  }

  const persistSelection = () => {
    persistent = saveSelection(storage, selectionState);
    map?.updateSelectionState(selectionState);
    return persistent;
  };

  const openChooser = () => {
    if (chooser || mapMode !== "owner") return;
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
      onOpenChooser: openChooser,
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
