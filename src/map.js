import { layoutGraph } from "./layout.js";

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

export class ThoughtMap {
  constructor(root, graph, options = {}) {
    this.root = root;
    this.graph = graph;
    this.options = options;
    this.nodeById = new Map(graph.nodes.map((node) => [node.id, node]));
    this.generatedPositions = layoutGraph(graph.nodes, graph.edges, WORLD);
    this.positions = structuredClone(this.generatedPositions);
    this.view = { x: 0, y: 0, scale: 0.8 };
    this.selectedId = null;
    this.movedNodes = new Set();
    this.activePointers = new Map();
    this.panGesture = null;
    this.pinchGesture = null;
    this.suppressedClick = null;
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => this.resetView());
  }

  render() {
    this.root.innerHTML = `
      <div class="app-shell">
        <header class="topbar">
          <a class="brand" href="#map" aria-label="Thought Map home">
            <span class="brand-mark" aria-hidden="true">T</span>
            <span>Thought Map</span>
          </a>
          <div class="identity" aria-label="Map owner">
            <span class="identity-copy">
              <strong>${escapeHtml(this.graph.profile.displayName)}</strong>
              <small>${escapeHtml(this.graph.profile.handle)}</small>
            </span>
            <span class="avatar" aria-hidden="true">${escapeHtml(this.graph.profile.initials)}</span>
          </div>
        </header>

        <main class="map-page" id="map">
          <section class="map-intro" aria-labelledby="map-title">
            <h1 id="map-title">Mira's map</h1>
            <p>${escapeHtml(this.graph.profile.identityLine)}</p>
            <button class="chooser-entry" type="button" data-open-chooser>
              ${escapeHtml(this.selectionEntryLabel())}
            </button>
          </section>

          <section class="map-frame" aria-label="Interactive identity Map">
            <div
              class="map-canvas"
              data-zoom-band="middle"
              tabindex="0"
              role="application"
              aria-label="Mira's Map. Drag open space to move through it, scroll or pinch to zoom, select an item for context, and drag an item to temporarily reshape the Map."
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
                <button class="reset-control" type="button" data-control="reset">Reset</button>
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
        const moved = this.movedNodes.has(node.id) ? ' data-moved="true"' : "";
        const className =
          node.type === "media" ? `node-media node-${node.format}` : "node-thought";
        let content;
        let ariaLabel;

        if (node.type === "thought") {
          const fragment = node.statement.split(" ").slice(0, 6).join(" ");
          content = `
            <span class="thought-mark" aria-hidden="true"></span>
            <span class="thought-fragment" aria-hidden="true">${escapeHtml(fragment)}</span>
            <strong class="thought-statement">${escapeHtml(node.statement)}</strong>
          `;
          ariaLabel = `Thought: ${node.statement}`;
        } else {
          content = `
            <span class="media-format">${escapeHtml(node.format)}</span>
            <strong class="media-title">${escapeHtml(node.title)}</strong>
            <small class="media-meta">${escapeHtml(node.creator)}, ${escapeHtml(node.year)}</small>
          `;
          ariaLabel = `${node.format}: ${node.title} by ${node.creator}`;
        }

        return `
          <button
            type="button"
            class="map-node ${className}${selected}"
            data-node-id="${escapeHtml(node.id)}"
            style="--node-x: ${point.x}px; --node-y: ${point.y}px"
            aria-label="${escapeHtml(ariaLabel)}"
            aria-pressed="${node.id === this.selectedId}"
            aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
            ${moved}
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
        <p class="detail-label">Mira's Thought</p>
        <h2>${escapeHtml(node.statement)}</h2>
        <p>${escapeHtml(connectionCopy)}</p>
        ${this.detailActions(node.id)}
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
        ${this.detailActions(node.id)}
      `;
    }
    this.bindDetailEvents();
  }

  detailActions(id) {
    return `
      <div class="detail-actions">
        <button type="button" data-detail-focus="${escapeHtml(id)}">Focus</button>
        <button type="button" data-detail-close>Close</button>
      </div>
    `;
  }

  bindDetailEvents() {
    this.detailPanel.querySelector("[data-detail-focus]")?.addEventListener("click", (event) => {
      this.focusNode(event.currentTarget.dataset.detailFocus);
    });
    this.detailPanel.querySelector("[data-detail-close]")?.addEventListener("click", () => {
      this.selectNode(null);
    });
  }

  bindEvents() {
    this.rebindNodeEvents();
    this.root.querySelector("[data-open-chooser]").addEventListener("click", () => {
      this.options.onOpenChooser?.();
    });
    this.root.querySelector('[data-control="zoom-in"]').addEventListener("click", () => this.zoomBy(1.18));
    this.root.querySelector('[data-control="zoom-out"]').addEventListener("click", () => this.zoomBy(0.84));
    this.root.querySelector('[data-control="reset"]').addEventListener("click", () => {
      this.positions = structuredClone(this.generatedPositions);
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
    window.addEventListener("resize", () => this.applyTransform(), { passive: true });
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
    const entry = this.root.querySelector("[data-open-chooser]");
    if (!entry) return;
    entry.textContent = this.selectionEntryLabel();
    entry.classList.toggle("is-ready", state.confirmed);
    entry.setAttribute(
      "aria-label",
      state.confirmed ? "Three works ready. Edit selection" : `${entry.textContent}. Open chooser`,
    );
  }

  focusChooserEntry() {
    this.root.querySelector("[data-open-chooser]")?.focus();
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
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.stopPropagation();
    const id = element.dataset.nodeId;
    const pointerStart = { x: event.clientX, y: event.clientY };
    const positionStart = { ...this.positions[id] };
    let crossed = false;
    element.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const current = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (!crossed) {
        if (!hasExceededDragThreshold(pointerStart, current)) return;
        crossed = true;
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
      }
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerup", onEnd);
    element.addEventListener("pointercancel", onEnd);
  }

  moveNodeByKeyboard(event, element) {
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
    const id = element.dataset.nodeId;
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
