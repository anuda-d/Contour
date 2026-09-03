type ChoosableWork = {
  id: string;
  format: string;
  title: string;
  creator: string;
  year: number;
};

type ChooserSelectionState = {
  selectedMediaIds: readonly string[];
};

type ToggleResult = {
  state: ChooserSelectionState;
  message: string;
};

type ConfirmResult = ToggleResult & {
  confirmed: boolean;
};

type KnownChoosableWorkIds = {
  has(value: string): boolean;
};

type WorkChooserOptions = {
  persistent: boolean;
  initialMessage?: string;
  onToggle: (id: string) => ToggleResult;
  onConfirm: () => ConfirmResult;
  onClose: () => void;
  restoreFocus: () => void;
};

const escapeHtml = (value: unknown) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const parseWorkChooserToggleId = (
  value: unknown,
  workIds: KnownChoosableWorkIds,
): string | null => {
  if (typeof value !== "string" || !workIds.has(value)) return null;
  return value;
};

export const submitWorkChooserToggle = (
  value: unknown,
  workIds: KnownChoosableWorkIds,
  onToggle: (id: string) => ToggleResult,
): Readonly<{ id: string; result: ToggleResult }> | null => {
  const id = parseWorkChooserToggleId(value, workIds);
  if (!id) return null;
  return { id, result: onToggle(id) };
};

export class WorkChooser {
  private readonly catalogueById: Map<string, ChoosableWork>;
  private message: string;
  private readonly overlay: HTMLDivElement;
  private query: string;
  private state: ChooserSelectionState;

  constructor(
    private readonly shell: HTMLElement,
    private readonly catalogue: readonly ChoosableWork[],
    state: ChooserSelectionState,
    private readonly options: WorkChooserOptions,
  ) {
    this.catalogueById = new Map(catalogue.map((item) => [item.id, item]));
    this.state = state;
    this.query = "";
    this.message = options.initialMessage ?? "";
    this.overlay = document.createElement("div");
    this.overlay.className = "chooser-overlay";
    this.shell.append(this.overlay);
    this.requiredShellElement(".topbar").inert = true;
    this.requiredShellElement(".map-page").inert = true;
    this.render({ focusSearch: true });
  }

  render({ focusId = null, focusSearch = false }: { focusId?: string | null; focusSearch?: boolean } = {}) {
    const selectedItems = this.state.selectedMediaIds
      .map((id) => this.catalogueById.get(id))
      .filter((item): item is ChoosableWork => Boolean(item));
    const selectedIds = new Set(this.state.selectedMediaIds);
    const isFull = selectedItems.length === 3;
    const normalizedQuery = this.query.trim().toLowerCase();
    const visibleItems = this.catalogue.filter((item) =>
      `${item.title} ${item.creator} ${item.format}`.toLowerCase().includes(normalizedQuery),
    );
    const defaultMessage = this.options.persistent
      ? `${selectedItems.length} of 3 selected.`
      : "Selections will last for this visit.";

    this.overlay.innerHTML = `
      <section class="work-chooser" role="dialog" aria-modal="true" aria-labelledby="chooser-title">
        <button class="chooser-back" type="button" data-chooser-close>Back to map</button>

        <div class="chooser-summary">
          <div class="chooser-heading">
            <h2 id="chooser-title">Choose three works that already matter to you.</h2>
            <p>Your choices stay private until you write and publish a Thought.</p>
          </div>

          <p class="chooser-progress"><strong>${selectedItems.length}</strong> of 3</p>
          <div class="selected-shelf" aria-label="Selected works">
            ${[0, 1, 2]
              .map((index) => this.renderSelectedItem(selectedItems[index], index))
              .join("")}
          </div>

          <p class="chooser-status" role="status" aria-live="polite">${escapeHtml(this.message || defaultMessage)}</p>
          <button class="chooser-continue" type="button" data-chooser-confirm ${isFull ? "" : "disabled"}>
            Continue to my Map
          </button>
        </div>

        <div class="catalogue-browser">
          <div class="catalogue-heading">
            <h3>Curated works</h3>
            <label for="catalogue-search">Find a Book or Film</label>
            <input
              id="catalogue-search"
              type="search"
              value="${escapeHtml(this.query)}"
              placeholder="Search title or creator"
              autocomplete="off"
            />
          </div>
          <div class="catalogue-wall">
            ${
              visibleItems.length
                ? visibleItems
                    .map((item) => this.renderCatalogueItem(item, selectedIds, isFull))
                    .join("")
                : '<p class="catalogue-empty">No matching work in this prototype catalogue.</p>'
            }
          </div>
        </div>
      </section>
    `;

    this.bindEvents();
    if (focusSearch) {
      const input = this.requiredOverlayElement<HTMLInputElement>("#catalogue-search");
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (focusId) {
      const matchingWork = [...this.overlay.querySelectorAll<HTMLElement>("[data-media-id]")].find(
        (element) => element.dataset.mediaId === focusId,
      );
      (matchingWork ?? this.requiredOverlayElement<HTMLInputElement>("#catalogue-search")).focus();
    }
  }

  private renderSelectedItem(item: ChoosableWork | undefined, index: number) {
    if (!item) {
      return `
        <span class="selected-slot" aria-label="Selection ${index + 1} is empty">
          <span>${index + 1}</span>
        </span>
      `;
    }
    return `
      <button
        class="selected-work selected-${escapeHtml(item.format)}"
        type="button"
        data-remove-id="${escapeHtml(item.id)}"
        aria-label="Remove ${escapeHtml(item.title)}"
      >
        <span>${escapeHtml(item.format)}</span>
        <strong>${escapeHtml(item.title)}</strong>
      </button>
    `;
  }

  private renderCatalogueItem(item: ChoosableWork, selectedIds: ReadonlySet<string>, isFull: boolean) {
    const selected = selectedIds.has(item.id);
    const unavailable = isFull && !selected;
    return `
      <button
        class="catalogue-work catalogue-${escapeHtml(item.format)}${selected ? " is-selected" : ""}${unavailable ? " is-unavailable" : ""}"
        type="button"
        data-media-id="${escapeHtml(item.id)}"
        aria-pressed="${selected}"
        aria-disabled="${unavailable}"
      >
        <span class="catalogue-format">${escapeHtml(item.format)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.creator)}, ${escapeHtml(item.year)}</small>
      </button>
    `;
  }

  private bindEvents() {
    this.requiredOverlayElement<HTMLElement>("[data-chooser-close]").addEventListener("click", () => this.close());
    this.requiredOverlayElement<HTMLElement>("[data-chooser-confirm]").addEventListener("click", () => {
      const result = this.options.onConfirm();
      this.state = result.state;
      this.message = result.message;
      if (result.confirmed) this.close();
      else this.render();
    });
    this.overlay.querySelectorAll<HTMLElement>("[data-media-id], [data-remove-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const submission = submitWorkChooserToggle(
          button.dataset.mediaId ?? button.dataset.removeId,
          this.catalogueById,
          this.options.onToggle,
        );
        if (!submission) return;
        this.state = submission.result.state;
        this.message = submission.result.message;
        this.render({ focusId: submission.id });
      });
    });
    const search = this.requiredOverlayElement<HTMLInputElement>("#catalogue-search");
    search.addEventListener("input", () => {
      this.query = search.value;
      this.render({ focusSearch: true });
    });
    this.requiredOverlayElement<HTMLElement>(".work-chooser").addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...this.overlay.querySelectorAll<HTMLElement>("button:not([disabled]), input")];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  private requiredOverlayElement<T extends Element>(selector: string): T {
    const element = this.overlay.querySelector<T>(selector);
    if (!element) throw new Error(`Work Chooser is missing ${selector}.`);
    return element;
  }

  private requiredShellElement(selector: string): HTMLElement {
    const element = this.shell.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Work Chooser shell is missing ${selector}.`);
    return element;
  }

  close(restoreFocus = true) {
    this.requiredShellElement(".topbar").inert = false;
    this.requiredShellElement(".map-page").inert = false;
    this.overlay.remove();
    this.options.onClose();
    if (restoreFocus) this.options.restoreFocus();
  }
}
