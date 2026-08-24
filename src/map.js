import { layoutGraph } from "./layout.js";
import {
  MAP_MODES,
  getModeCapabilities,
  normalizeMapMode,
  projectGraphForMode,
} from "./graph-projection.js";
import { resolvePositions } from "./pinned-state.js";

const WORLD = { width: 1080, height: 720 };
const MIN_SCALE = 0.3;
const MAX_SCALE = 1.65;
export const DRAG_THRESHOLD = 6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function getZoomBand(scale) {
  if (scale <= 0.68) return "far";
  if (scale <= 1.04) return "middle";
  return "close";
}

export function hasExceededDragThreshold(start, current, threshold = DRAG_THRESHOLD) {
  return Math.hypot(current.x - start.x, current.y - start.y) >= threshold;
}

export function positionFromDrag(start, screenDelta, scale, world = WORLD) {
  const safeScale = Math.max(scale, 0.01);
  return {
    x: clamp(start.x + screenDelta.x / safeScale, -world.width / 2 + 50, world.width / 2 - 50),
    y: clamp(start.y + screenDelta.y / safeScale, -world.height / 2 + 50, world.height / 2 - 50),
  };
}

export function mergeGraphPositions(nodes, currentPositions, generatedPositions) {
  return Object.fromEntries(
    nodes.map((node) => [
      node.id,
      currentPositions[node.id] ?? generatedPositions[node.id],
    ]),
  );
}

export class ThoughtMap {
  constructor(root, graph, options = {}) {
    this.root = root;
    this.fullGraph = graph;
    this.options = options;
    this.mode = normalizeMapMode(options.mode);
    this.capabilities = getModeCapabilities(this.mode);
    this.graph = projectGraphForMode(this.fullGraph, this.mode);
    this.nodeById = new Map(this.graph.nodes.map((node) => [node.id, node]));
    this.generatedPositions = layoutGraph(graph.nodes, graph.edges, WORLD);
    this.positions = resolvePositions(
      graph.nodes,
      this.generatedPositions,
      {},
      options.pinnedState?.pinnedPositions ?? {},
    );
    this.view = { x: 0, y: 0, scale: 0.8 };
    this.selectedId = null;
    this.movedNodes = new Set();
    this.activePointers = new Map();
    this.panGesture = null;
    this.pinchGesture = null;
    this.suppressedClick = null;
    this.onWindowResize = () => this.applyTransform();
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => this.resetView());
  }

  render() {
    this.root.innerHTML = `
      <div class="app-shell" data-map-mode="${this.mode}">
        <header class="topbar">
          <a class="brand" href="#map" aria-label="Thought Map home">
            <span class="brand-mark" aria-hidden="true">T</span>
            <span>Thought Map</span>
          </a>
          <div class="topbar-actions">
            ${this.modeControl()}
            <div class="identity" aria-label="Map owner">
              <span class="identity-copy">
                <strong>${escapeHtml(this.graph.profile.displayName)}</strong>
                <small>${escapeHtml(this.graph.profile.handle)}</small>
              </span>
              <span class="avatar" aria-hidden="true">${escapeHtml(this.graph.profile.initials)}</span>
            </div>
          </div>
        </header>

        <main class="map-page" id="map">
          <section class="map-intro" aria-labelledby="map-title">
            <h1 id="map-title">Mira's map</h1>
            <p>${escapeHtml(this.graph.profile.identityLine)}</p>
            ${
              this.capabilities.canChooseWorks
                ? `<div class="owner-map-actions">
                    <button class="chooser-entry" type="button" data-open-chooser>
                      ${escapeHtml(this.selectionEntryLabel())}
                    </button>
                    <button
                      class="capture-entry"
                      type="button"
                      data-open-capture
                      ${this.options.selectionState?.confirmed ? "" : "hidden"}
                    >Write a Thought</button>
                  </div>
                  <p class="draft-status" role="status" data-draft-status>${escapeHtml(this.options.draftMessage ?? "")}</p>`
                : ""
            }
            <div class="orbit-root" data-orbit-root>
              ${this.profileOrbit()}
            </div>
          </section>

          <section class="map-frame" aria-label="Interactive identity Map">
            <div
              class="map-canvas"
              data-zoom-band="middle"
              tabindex="0"
              role="application"
              aria-label="${escapeHtml(this.canvasInstructions())}"
            >
              <div class="map-world" style="width: ${WORLD.width}px; height: ${WORLD.height}px">
                <div class="region-layer" aria-hidden="true"></div>
                <svg class="edge-layer" viewBox="${-WORLD.width / 2} ${-WORLD.height / 2} ${WORLD.width} ${WORLD.height}" aria-hidden="true">
                  <g class="edges"></g>
                </svg>
                <div class="node-layer"></div>
              </div>

              <aside class="detail-panel" aria-live="polite" hidden></aside>

              <div class="map-controls" aria-label="Map controls">
                <button type="button" data-control="zoom-out" aria-label="Zoom out">−</button>
                <button type="button" data-control="zoom-in" aria-label="Zoom in">+</button>
                ${
                  this.capabilities.canResetPositions
                    ? '<button class="reset-control" type="button" data-control="reset">Reset</button>'
                    : ""
                }
              </div>
            </div>
          </section>
        </main>
      </div>
    `;

    this.updateSelectionState(this.options.selectionState);
    this.canvas = this.root.querySelector(".map-canvas");
    this.world = this.root.querySelector(".map-world");
    this.regionLayer = this.root.querySelector(".region-layer");
    this.nodeLayer = this.root.querySelector(".node-layer");
    this.edgeLayer = this.root.querySelector(".edges");
    this.detailPanel = this.root.querySelector(".detail-panel");
    this.renderRegions();
    this.renderNodes();
    this.renderEdges();
    this.renderDetails();
    this.bindOrbitEvents();
  }

  modeControl() {
    if (this.mode === MAP_MODES.visitor) {
      return `
        <span class="mode-state" role="status">Visitor preview</span>
        <button class="mode-action" type="button" data-mode-exit>Back to my Map</button>
      `;
    }
    return '<button class="mode-action" type="button" data-mode-enter>Preview as visitor</button>';
  }

  canvasInstructions() {
    if (this.mode === MAP_MODES.visitor) {
      return "Mira's public Map preview. Drag open space to move through it, scroll or pinch to zoom, and select an item for context.";
    }
    return "Mira's Map. Drag open space to move through it, scroll or pinch to zoom, select an item for context, and drag an item to temporarily reshape the Map.";
  }

  featuredIds() {
    return this.options.featuredState?.featuredMediaIds ?? [];
  }

  isFeatured(id) {
    return this.featuredIds().includes(id);
  }

  profileOrbit() {
    const media = this.featuredIds()
      .map((id) => this.nodeById.get(id))
      .filter((node) => node?.type === "media");

    if (!media.length && this.mode === MAP_MODES.visitor) return "";

    const works = media.length
      ? `<ul class="orbit-works">
          ${media
            .map(
              (node) => `<li>
                <button
                  class="orbit-work orbit-${escapeHtml(node.format)}"
                  type="button"
                  data-orbit-focus="${escapeHtml(node.id)}"
                  aria-label="${escapeHtml(`${node.format}, ${node.title} by ${node.creator}. Focus in Mira's Map`)}"
                >
                  <span>${escapeHtml(node.format)}</span>
                  <strong>${escapeHtml(node.title)}</strong>
                </button>
              </li>`,
            )
            .join("")}
        </ul>`
      : '<p class="orbit-empty">Feature Media from a work\'s detail.</p>';
    const status =
      this.mode === MAP_MODES.owner && this.options.featuredMessage
        ? `<p class="orbit-status" role="status">${escapeHtml(this.options.featuredMessage)}</p>`
        : "";

    return `
      <section class="profile-orbit" aria-labelledby="orbit-title">
        <h2 id="orbit-title">Media in Mira's orbit</h2>
        ${works}
        ${status}
      </section>
    `;
  }

  renderOrbit() {
    const root = this.root.querySelector("[data-orbit-root]");
    if (!root) return;
    root.innerHTML = this.profileOrbit();
    this.bindOrbitEvents();
  }

  bindOrbitEvents() {
    this.root.querySelectorAll("[data-orbit-focus]").forEach((element) => {
      element.addEventListener("click", () => this.focusNode(element.dataset.orbitFocus));
    });
  }

  renderRegions() {
    const thoughts = this.graph.nodes.filter((node) => node.type === "thought").slice(0, 3);
    this.regionLayer.innerHTML = thoughts
      .map((thought, index) => {
        const related = [thought.id, ...(thought.anchors ?? [])]
          .map((id) => this.positions[id])
          .filter(Boolean);
        const center = related.reduce(
          (result, point) => ({ x: result.x + point.x, y: result.y + point.y }),
          { x: 0, y: 0 },
        );
        const count = Math.max(related.length, 1);
        return `<span class="region-field region-${index + 1}" style="--region-x: ${center.x / count}px; --region-y: ${center.y / count}px"></span>`;
      })
      .join("");
  }

  renderNodes() {
    this.nodeLayer.innerHTML = this.graph.nodes
      .filter((node) => node.type !== "user")
      .map((node) => {
        const point = this.positions[node.id];
        const selected = node.id === this.selectedId ? " is-selected" : "";
        const pinned = this.isPinned(node.id);
        const exposesPinnedState = pinned && this.capabilities.canShapeNodes;
        const pinnedClass = exposesPinnedState ? " is-pinned" : "";
        const moved = this.movedNodes.has(node.id) ? ' data-moved="true"' : "";
        const pinnedAttribute = exposesPinnedState ? ' data-pinned="true"' : "";
        const className =
          node.type === "media"
            ? `node-media node-${node.format}`
            : `node-thought${node.status === "draft" ? " is-draft" : ""}`;
        let content;
        let ariaLabel;

        if (node.type === "thought") {
          const fragment = node.statement.split(" ").slice(0, 6).join(" ");
          content = `
            <span class="thought-mark" aria-hidden="true"></span>
            <span class="thought-fragment" aria-hidden="true">${escapeHtml(fragment)}</span>
            ${node.status === "draft" ? '<span class="draft-note" aria-hidden="true">Draft</span>' : ""}
            <strong class="thought-statement">${escapeHtml(node.statement)}</strong>
          `;
          ariaLabel = `${node.status === "draft" ? "Private draft" : "Thought"}: ${node.statement}${exposesPinnedState ? ", pinned position" : ""}`;
        } else {
          content = `
            <span class="media-format">${escapeHtml(node.format)}</span>
            <strong class="media-title">${escapeHtml(node.title)}</strong>
            <small class="media-meta">${escapeHtml(node.creator)}, ${escapeHtml(node.year)}</small>
          `;
          ariaLabel = `${node.format}: ${node.title} by ${node.creator}${exposesPinnedState ? ", pinned position" : ""}`;
        }

        return `
          <button
            type="button"
            class="map-node ${className}${selected}${pinnedClass}"
            data-node-id="${escapeHtml(node.id)}"
            style="--node-x: ${point.x}px; --node-y: ${point.y}px"
            aria-label="${escapeHtml(ariaLabel)}"
            aria-pressed="${node.id === this.selectedId}"
            ${
              this.capabilities.canShapeNodes && !pinned
                ? 'aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"'
                : ""
            }
            ${moved}
            ${pinnedAttribute}
          >
            ${content}
          </button>
        `;
      })
      .join("");
  }

  renderEdges() {
    this.edgeLayer.innerHTML = this.graph.edges
      .filter((edge) => edge.kind !== "authored")
      .map((edge) => {
        const source = this.positions[edge.source];
        const target = this.positions[edge.target];
        const selected = edge.source === this.selectedId || edge.target === this.selectedId;
        const midpointX = (source.x + target.x) / 2;
        const midpointY = (source.y + target.y) / 2;
        const bend = edge.kind === "additional-anchor" ? (edge.id.length % 2 === 0 ? 18 : -18) : 0;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const length = Math.max(Math.hypot(dx, dy), 1);
        const controlX = midpointX + (-dy / length) * bend;
        const controlY = midpointY + (dx / length) * bend;
        return `
          <path
            class="map-edge edge-${edge.kind}${selected ? " is-connected" : ""}"
            data-edge-id="${escapeHtml(edge.id)}"
            d="M ${source.x} ${source.y} Q ${controlX} ${controlY} ${target.x} ${target.y}"
          />
        `;
      })
      .join("");

    this.root.querySelectorAll(".map-node").forEach((element) => {
      const id = element.dataset.nodeId;
      const connected = this.graph.edges.some(
        (edge) =>
          (edge.source === this.selectedId && edge.target === id) ||
          (edge.target === this.selectedId && edge.source === id),
      );
      element.classList.toggle("is-connected", connected);
      element.classList.toggle("is-muted", Boolean(this.selectedId) && !connected && id !== this.selectedId);
    });
  }

  renderDetails() {
    const node = this.nodeById.get(this.selectedId);
    if (!node || node.type === "user") {
      this.detailPanel.hidden = true;
      this.detailPanel.innerHTML = "";
      return;
    }

    this.detailPanel.hidden = false;
    if (node.type === "thought") {
      const anchors = node.anchors.map((id) => this.nodeById.get(id)).filter(Boolean);
      const connectionCopy =
        anchors.length > 1
          ? `Connected through ${anchors.map((anchor) => anchor.title).join(" and ")}.`
          : `Connected through ${anchors[0]?.title ?? "one work"}.`;
      this.detailPanel.innerHTML = `
        <p class="detail-label">${node.status === "draft" ? "Private draft" : "Mira's Thought"}</p>
        <h2>${escapeHtml(node.statement)}</h2>
        <p>${escapeHtml(connectionCopy)}</p>
        ${this.placementDetail(node.id)}
        ${this.detailActions(node.id, node)}
      `;
    } else {
      const related = this.graph.edges
        .filter((edge) => edge.target === node.id && edge.kind.includes("anchor"))
        .map((edge) => this.nodeById.get(edge.source))
        .filter(Boolean);
      const relatedCopy = related.length === 1 ? "1 connected Thought" : `${related.length} connected Thoughts`;
      this.detailPanel.innerHTML = `
        <p class="detail-label">${escapeHtml(node.format)}</p>
        <h2>${escapeHtml(node.title)}</h2>
        <p>${escapeHtml(node.creator)}, ${escapeHtml(node.year)}. ${escapeHtml(relatedCopy)}.</p>
        ${this.placementDetail(node.id)}
        ${this.detailActions(node.id, node)}
      `;
    }
    this.bindDetailEvents();
  }

  detailActions(id, node) {
    const publishAction =
      node.type === "thought" && node.status === "draft" && this.capabilities.canCaptureThoughts
        ? `<button type="button" data-publish-draft="${escapeHtml(id)}">Publish Thought</button>`
        : "";
    const editAction =
      node.type === "thought" && node.status === "draft" && this.capabilities.canCaptureThoughts
        ? `<button type="button" data-edit-draft="${escapeHtml(id)}">Edit Draft</button>`
        : "";
    const connectAction =
      node.type === "thought" &&
      node.status === "draft" &&
      node.anchors.length === 1 &&
      this.options.selectionState?.confirmed &&
      this.capabilities.canCaptureThoughts
        ? `<button type="button" data-connect-draft="${escapeHtml(id)}">Connect another work</button>`
        : "";
    const featureAction =
      node.type === "media" && this.capabilities.canFeatureMedia
        ? `<button type="button" data-feature-toggle="${escapeHtml(id)}">
            ${this.isFeatured(id) ? "Remove from orbit" : "Feature in orbit"}
          </button>`
        : "";
    const placementAction =
      this.capabilities.canShapeNodes && (this.isPinned(id) || this.movedNodes.has(id))
        ? `<button type="button" data-position-action="${escapeHtml(id)}">
            ${this.isPinned(id) ? "Unpin position" : "Pin position"}
          </button>`
        : "";
    return `
      <div class="detail-actions">
        ${publishAction}
        ${connectAction}
        ${editAction}
        ${featureAction}
        ${placementAction}
        <button type="button" data-detail-focus="${escapeHtml(id)}">Focus</button>
        <button type="button" data-detail-close>Close</button>
      </div>
    `;
  }

  placementDetail(id) {
    if (!this.capabilities.canShapeNodes) return "";
    const message = this.options.pinnedMessageId === id ? this.options.pinnedMessage : "";
    if (this.isPinned(id)) {
      return `<p class="detail-placement" role="status">${escapeHtml(message || "Pinned position. Unpin it before moving this item again.")}</p>`;
    }
    if (this.movedNodes.has(id)) {
      return `<p class="detail-placement" role="status">${escapeHtml(message || "Temporary position. Pin it to keep this placement.")}</p>`;
    }
    return "";
  }

  isPinned(id) {
    return Object.hasOwn(this.options.pinnedState?.pinnedPositions ?? {}, id);
  }

  clearPinnedMessage(id) {
    if (this.options.pinnedMessageId !== id) return;
    this.options.pinnedMessage = "";
    this.options.pinnedMessageId = null;
  }

  bindDetailEvents() {
    this.detailPanel.querySelector("[data-publish-draft]")?.addEventListener("click", (event) => {
      this.options.onPublishDraft?.(event.currentTarget.dataset.publishDraft);
    });
    this.detailPanel.querySelector("[data-edit-draft]")?.addEventListener("click", (event) => {
      this.options.onEditDraft?.(event.currentTarget.dataset.editDraft);
    });
    this.detailPanel.querySelector("[data-connect-draft]")?.addEventListener("click", (event) => {
      this.options.onConnectDraft?.(event.currentTarget.dataset.connectDraft);
    });
    this.detailPanel.querySelector("[data-feature-toggle]")?.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.featureToggle;
      const result = this.options.onToggleFeatured?.(id);
      if (!result) return;
      this.updateFeaturedState(result.state, result.message, id);
    });
    this.detailPanel.querySelector("[data-position-action]")?.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.positionAction;
      const result = this.isPinned(id)
        ? this.options.onUnpinPosition?.(id)
        : this.options.onPinPosition?.(id, this.positions[id]);
      if (!result) return;
      this.updatePinnedState(result.state, result.message, id);
    });
    this.detailPanel.querySelector("[data-detail-focus]")?.addEventListener("click", (event) => {
      this.focusNode(event.currentTarget.dataset.detailFocus);
    });
    this.detailPanel.querySelector("[data-detail-close]")?.addEventListener("click", () => {
      this.selectNode(null);
    });
  }

  bindEvents() {
    this.rebindNodeEvents();
    this.root.querySelector("[data-open-chooser]")?.addEventListener("click", () => {
      this.options.onOpenChooser?.();
    });
    this.root.querySelector("[data-open-capture]")?.addEventListener("click", () => {
      this.options.onOpenCapture?.();
    });
    this.root.querySelector("[data-mode-enter]")?.addEventListener("click", () => {
      this.requestMode(MAP_MODES.visitor);
    });
    this.root.querySelector("[data-mode-exit]")?.addEventListener("click", () => {
      this.requestMode(MAP_MODES.owner);
    });
    this.root.querySelector('[data-control="zoom-in"]').addEventListener("click", () => this.zoomBy(1.18));
    this.root.querySelector('[data-control="zoom-out"]').addEventListener("click", () => this.zoomBy(0.84));
    this.root.querySelector('[data-control="reset"]')?.addEventListener("click", () => {
      this.positions = resolvePositions(
        this.fullGraph.nodes,
        this.generatedPositions,
        {},
        this.options.pinnedState?.pinnedPositions ?? {},
      );
      this.movedNodes.clear();
      this.renderRegions();
      this.renderNodes();
      this.renderEdges();
      this.renderDetails();
      this.rebindNodeEvents();
      this.resetView();
    });

    this.canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.zoomAt(event.clientX, event.clientY, event.deltaY > 0 ? 0.9 : 1.1);
      },
      { passive: false },
    );
    this.canvas.addEventListener("pointerdown", (event) => this.startCanvasGesture(event));
    this.canvas.addEventListener("pointermove", (event) => this.moveCanvasGesture(event));
    this.canvas.addEventListener("pointerup", (event) => this.endCanvasGesture(event));
    this.canvas.addEventListener("pointercancel", (event) => this.endCanvasGesture(event));
    this.canvas.addEventListener("keydown", (event) => this.handleKeyboard(event));
    window.removeEventListener("resize", this.onWindowResize);
    window.addEventListener("resize", this.onWindowResize, { passive: true });
  }

  rebindNodeEvents() {
    this.root.querySelectorAll(".map-node").forEach((element) => {
      element.addEventListener("click", (event) => this.handleNodeClick(event, element));
      element.addEventListener("pointerdown", (event) => this.startNodeDrag(event, element));
      element.addEventListener("keydown", (event) => this.moveNodeByKeyboard(event, element));
    });
  }

  selectionEntryLabel() {
    const state = this.options.selectionState;
    if (state?.confirmed) return "3 works ready";
    const count = state?.selectedMediaIds?.length ?? 0;
    return count > 0 ? `${count} of 3 chosen` : "Choose 3 works";
  }

  updateSelectionState(state) {
    this.options.selectionState = state;
    if (this.detailPanel) this.renderDetails();
    const entry = this.root.querySelector("[data-open-chooser]");
    if (!entry) return;
    entry.textContent = this.selectionEntryLabel();
    entry.classList.toggle("is-ready", state.confirmed);
    entry.setAttribute(
      "aria-label",
      state.confirmed ? "Three works ready. Edit selection" : `${entry.textContent}. Open chooser`,
    );
    const captureEntry = this.root.querySelector("[data-open-capture]");
    if (captureEntry) captureEntry.hidden = !state.confirmed;
  }

  updateFeaturedState(state, message = "", focusId = null) {
    this.options.featuredState = state;
    this.options.featuredMessage = message;
    this.renderOrbit();
    this.renderDetails();
    if (focusId) {
      requestAnimationFrame(() => {
        this.detailPanel.querySelector(`[data-feature-toggle="${CSS.escape(focusId)}"]`)?.focus();
      });
    }
  }

  updatePinnedState(state, message = "", focusId = null) {
    this.options.pinnedState = state;
    this.options.pinnedMessage = message;
    this.options.pinnedMessageId = focusId;
    const pinnedPosition = state.pinnedPositions[focusId];
    this.positions[focusId] = pinnedPosition
      ? { ...pinnedPosition }
      : { ...this.generatedPositions[focusId] };
    this.movedNodes.delete(focusId);
    this.renderRegions();
    this.renderNodes();
    this.renderEdges();
    this.renderDetails();
    this.rebindNodeEvents();
    requestAnimationFrame(() => {
      const action = this.detailPanel.querySelector(
        `[data-position-action="${CSS.escape(focusId)}"]`,
      );
      if (action) action.focus();
      else this.root.querySelector(`[data-node-id="${CSS.escape(focusId)}"]`)?.focus();
    });
  }

  focusChooserEntry() {
    this.root.querySelector("[data-open-chooser]")?.focus();
  }

  focusCaptureEntry() {
    this.root.querySelector("[data-open-capture]")?.focus();
  }

  focusDraftEdit(id) {
    if (this.selectedId !== id) this.selectNode(id);
    this.detailPanel.querySelector("[data-edit-draft]")?.focus();
  }

  focusDraftConnect(id) {
    if (this.selectedId !== id) this.selectNode(id);
    this.detailPanel.querySelector("[data-connect-draft]")?.focus();
  }

  updateGraph(graph, { focusId = null, selectId = null, message = "" } = {}) {
    const generatedPositions = layoutGraph(graph.nodes, graph.edges, WORLD);
    const positions = resolvePositions(
      graph.nodes,
      generatedPositions,
      this.positions,
      this.options.pinnedState?.pinnedPositions ?? {},
    );
    this.fullGraph = graph;
    this.generatedPositions = generatedPositions;
    this.positions = positions;
    this.options.draftMessage = message;
    this.graph = projectGraphForMode(this.fullGraph, this.mode);
    this.nodeById = new Map(this.graph.nodes.map((node) => [node.id, node]));
    this.movedNodes = new Set(
      [...this.movedNodes].filter((id) => positions[id] && !this.isPinned(id)),
    );
    if (selectId && this.nodeById.has(selectId)) this.selectedId = selectId;
    if (!this.nodeById.has(this.selectedId)) this.selectedId = null;
    this.render();
    this.bindEvents();
    this.applyTransform();
    if (focusId && this.nodeById.has(focusId)) {
      requestAnimationFrame(() => {
        this.focusNode(focusId);
        this.root.querySelector(`[data-node-id="${CSS.escape(focusId)}"]`)?.focus();
      });
    } else if (selectId && this.nodeById.has(selectId)) {
      requestAnimationFrame(() => {
        this.root.querySelector(`[data-node-id="${CSS.escape(selectId)}"]`)?.focus();
      });
    }
  }

  requestMode(mode) {
    if (this.options.onModeChange) this.options.onModeChange(mode);
    else this.setMode(mode);
  }

  setMode(mode) {
    const nextMode = normalizeMapMode(mode);
    if (nextMode === this.mode) return;
    this.mode = nextMode;
    this.capabilities = getModeCapabilities(nextMode);
    this.graph = projectGraphForMode(this.fullGraph, nextMode);
    this.nodeById = new Map(this.graph.nodes.map((node) => [node.id, node]));
    if (!this.nodeById.has(this.selectedId)) this.selectedId = null;
    this.activePointers.clear();
    this.panGesture = null;
    this.pinchGesture = null;
    this.render();
    this.bindEvents();
    this.applyTransform();
    requestAnimationFrame(() => {
      this.root
        .querySelector(nextMode === MAP_MODES.visitor ? "[data-mode-exit]" : "[data-mode-enter]")
        ?.focus();
    });
  }

  handleNodeClick(event, element) {
    const id = element.dataset.nodeId;
    if (this.suppressedClick?.id === id && Date.now() <= this.suppressedClick.until) {
      event.preventDefault();
      this.suppressedClick = null;
      return;
    }
    this.suppressedClick = null;
    this.selectNode(id);
  }

  selectNode(id) {
    this.selectedId = id;
    this.root.querySelectorAll(".map-node").forEach((element) => {
      const selected = element.dataset.nodeId === id;
      element.classList.toggle("is-selected", selected);
      element.setAttribute("aria-pressed", String(selected));
    });
    this.renderEdges();
    this.renderDetails();
  }

  focusNode(id) {
    this.selectNode(id);
    const node = this.nodeById.get(id);
    if (!node) return;
    const neighborIds = node.type === "thought"
      ? node.anchors
      : this.graph.edges
          .filter((edge) => edge.target === id && edge.kind.includes("anchor"))
          .map((edge) => edge.source);
    const points = [id, ...neighborIds].map((nodeId) => this.positions[nodeId]).filter(Boolean);
    const center = points.reduce(
      (result, point) => ({ x: result.x + point.x, y: result.y + point.y }),
      { x: 0, y: 0 },
    );
    center.x /= Math.max(points.length, 1);
    center.y /= Math.max(points.length, 1);
    const mobile = this.canvas.clientWidth < 720;
    this.view.scale = mobile ? 0.7 : 1.18;
    this.view.x = -center.x * this.view.scale + (mobile ? 0 : -60);
    this.view.y = -center.y * this.view.scale + (mobile ? -76 : 0);
    this.applyTransform();
  }

  resetView() {
    const mobile = this.canvas.clientWidth < 720;
    const overviewScale = clamp((this.canvas.clientWidth - 28) / WORLD.width, MIN_SCALE, 0.48);
    this.view = { x: 0, y: mobile ? -10 : 0, scale: mobile ? overviewScale : 0.82 };
    this.applyTransform();
  }

  applyTransform() {
    this.world.style.transform = `translate(-50%, -50%) translate(${this.view.x}px, ${this.view.y}px) scale(${this.view.scale})`;
    this.canvas.dataset.scale = this.view.scale.toFixed(2);
    this.canvas.dataset.zoomBand = getZoomBand(this.view.scale);
  }

  zoomBy(multiplier) {
    const rect = this.canvas.getBoundingClientRect();
    this.zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, multiplier);
  }

  zoomAt(clientX, clientY, multiplier) {
    const rect = this.canvas.getBoundingClientRect();
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;
    const worldX = (offsetX - this.view.x) / this.view.scale;
    const worldY = (offsetY - this.view.y) / this.view.scale;
    const nextScale = clamp(this.view.scale * multiplier, MIN_SCALE, MAX_SCALE);
    this.view.x = offsetX - worldX * nextScale;
    this.view.y = offsetY - worldY * nextScale;
    this.view.scale = nextScale;
    this.applyTransform();
  }

  startCanvasGesture(event) {
    if (
      event.target.closest(".map-node") ||
      event.target.closest(".map-controls") ||
      event.target.closest(".detail-panel")
    ) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    this.canvas.setPointerCapture(event.pointerId);
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.activePointers.size === 1) {
      this.panGesture = {
        pointerId: event.pointerId,
        start: { x: event.clientX, y: event.clientY },
        view: { x: this.view.x, y: this.view.y },
        crossed: false,
      };
      return;
    }
    if (this.activePointers.size === 2) this.beginPinch();
  }

  beginPinch() {
    const [a, b] = [...this.activePointers.values()];
    const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const rect = this.canvas.getBoundingClientRect();
    const offset = {
      x: midpoint.x - rect.left - rect.width / 2,
      y: midpoint.y - rect.top - rect.height / 2,
    };
    this.pinchGesture = {
      distance: Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1),
      scale: this.view.scale,
      world: {
        x: (offset.x - this.view.x) / this.view.scale,
        y: (offset.y - this.view.y) / this.view.scale,
      },
    };
    this.panGesture = null;
    this.canvas.classList.add("is-panning");
  }

  moveCanvasGesture(event) {
    if (!this.activePointers.has(event.pointerId)) return;
    this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.activePointers.size === 2 && this.pinchGesture) {
      const [a, b] = [...this.activePointers.values()];
      const distance = Math.max(Math.hypot(a.x - b.x, a.y - b.y), 1);
      const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const rect = this.canvas.getBoundingClientRect();
      const offset = {
        x: midpoint.x - rect.left - rect.width / 2,
        y: midpoint.y - rect.top - rect.height / 2,
      };
      const nextScale = clamp(
        this.pinchGesture.scale * (distance / this.pinchGesture.distance),
        MIN_SCALE,
        MAX_SCALE,
      );
      this.view.scale = nextScale;
      this.view.x = offset.x - this.pinchGesture.world.x * nextScale;
      this.view.y = offset.y - this.pinchGesture.world.y * nextScale;
      this.applyTransform();
      return;
    }

    if (this.panGesture?.pointerId !== event.pointerId) return;
    const current = { x: event.clientX, y: event.clientY };
    if (!this.panGesture.crossed) {
      if (!hasExceededDragThreshold(this.panGesture.start, current)) return;
      this.panGesture.crossed = true;
      this.canvas.classList.add("is-panning");
    }
    this.view.x = this.panGesture.view.x + current.x - this.panGesture.start.x;
    this.view.y = this.panGesture.view.y + current.y - this.panGesture.start.y;
    this.applyTransform();
  }

  endCanvasGesture(event) {
    this.activePointers.delete(event.pointerId);
    if (this.activePointers.size === 1 && this.pinchGesture) {
      const [pointerId, point] = [...this.activePointers.entries()][0];
      this.pinchGesture = null;
      this.panGesture = {
        pointerId,
        start: { ...point },
        view: { x: this.view.x, y: this.view.y },
        crossed: false,
      };
      this.canvas.classList.remove("is-panning");
      return;
    }
    if (this.activePointers.size === 0) {
      this.canvas.classList.remove("is-panning");
      this.panGesture = null;
      this.pinchGesture = null;
    }
  }

  startNodeDrag(event, element) {
    const id = element.dataset.nodeId;
    if (!this.capabilities.canShapeNodes || this.isPinned(id)) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.stopPropagation();
    const pointerStart = { x: event.clientX, y: event.clientY };
    const positionStart = { ...this.positions[id] };
    let crossed = false;
    element.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const current = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (!crossed) {
        if (!hasExceededDragThreshold(pointerStart, current)) return;
        crossed = true;
        this.clearPinnedMessage(id);
        this.selectNode(id);
        element.classList.add("is-dragging");
      }
      moveEvent.preventDefault();
      this.positions[id] = positionFromDrag(
        positionStart,
        { x: current.x - pointerStart.x, y: current.y - pointerStart.y },
        this.view.scale,
      );
      element.style.setProperty("--node-x", `${this.positions[id].x}px`);
      element.style.setProperty("--node-y", `${this.positions[id].y}px`);
      this.renderRegions();
      this.renderEdges();
    };

    const onEnd = () => {
      element.classList.remove("is-dragging");
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerup", onEnd);
      element.removeEventListener("pointercancel", onEnd);
      if (crossed) {
        this.movedNodes.add(id);
        element.dataset.moved = "true";
        this.suppressedClick = { id, until: Date.now() + 500 };
        this.renderDetails();
      }
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onEnd);
    element.addEventListener("pointercancel", onEnd);
  }

  moveNodeByKeyboard(event, element) {
    const id = element.dataset.nodeId;
    if (!this.capabilities.canShapeNodes || this.isPinned(id)) return;
    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    event.stopPropagation();
    const distance = event.shiftKey ? 24 : 12;
    this.clearPinnedMessage(id);
    this.positions[id] = positionFromDrag(
      this.positions[id],
      { x: direction[0] * distance * this.view.scale, y: direction[1] * distance * this.view.scale },
      this.view.scale,
    );
    element.style.setProperty("--node-x", `${this.positions[id].x}px`);
    element.style.setProperty("--node-y", `${this.positions[id].y}px`);
    element.dataset.moved = "true";
    this.movedNodes.add(id);
    this.selectNode(id);
    this.renderRegions();
  }

  handleKeyboard(event) {
    const distance = 38;
    if (event.key === "ArrowLeft") this.view.x += distance;
    else if (event.key === "ArrowRight") this.view.x -= distance;
    else if (event.key === "ArrowUp") this.view.y += distance;
    else if (event.key === "ArrowDown") this.view.y -= distance;
    else if (event.key === "+" || event.key === "=") this.zoomBy(1.12);
    else if (event.key === "-" || event.key === "_") this.zoomBy(0.88);
    else if (event.key === "0") this.resetView();
    else return;
    event.preventDefault();
    this.applyTransform();
  }
}
