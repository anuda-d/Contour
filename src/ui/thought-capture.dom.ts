type CapturableWork = {
  id: string;
  format: string;
  title: string;
  creator: string;
};

type CapturableDraft = {
  id: string;
  primaryMediaId: string;
  secondaryMediaId?: string | null;
  statement?: string;
};

type SaveInput = {
  draftId: string | null;
  primaryMediaId: string;
  secondaryMediaId: string | null;
  statement: string;
};

type ThoughtCaptureFormSnapshot = {
  primaryMediaId: unknown;
  secondaryMediaId: unknown;
  statement: unknown;
};

type KnownWorkIds = {
  has(value: string): boolean;
};

type SaveFailure = {
  saved: false;
  message: string;
};

type SaveSuccess = {
  saved: true;
};

type ThoughtCaptureOptions<Success extends SaveSuccess> = {
  draft?: CapturableDraft | null;
  bridgeMode?: boolean;
  initialMessage?: string;
  onSave: (input: SaveInput) => SaveFailure | Success;
  onSaved: (result: Success) => void;
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

export const parseThoughtCaptureFormSnapshot = (
  snapshot: ThoughtCaptureFormSnapshot,
  workIds: KnownWorkIds,
  bridgeMode: boolean,
): Omit<SaveInput, "draftId"> | null => {
  if (typeof snapshot.primaryMediaId !== "string" || !workIds.has(snapshot.primaryMediaId)) {
    return null;
  }
  if (typeof snapshot.statement !== "string") return null;

  if (!bridgeMode) {
    if (snapshot.secondaryMediaId !== null) return null;
    return {
      primaryMediaId: snapshot.primaryMediaId,
      secondaryMediaId: null,
      statement: snapshot.statement,
    };
  }

  if (
    typeof snapshot.secondaryMediaId !== "string" ||
    !workIds.has(snapshot.secondaryMediaId) ||
    snapshot.secondaryMediaId === snapshot.primaryMediaId
  ) {
    return null;
  }
  return {
    primaryMediaId: snapshot.primaryMediaId,
    secondaryMediaId: snapshot.secondaryMediaId,
    statement: snapshot.statement,
  };
};

export const submitThoughtCaptureFormSnapshot = <Success extends SaveSuccess>(
  snapshot: ThoughtCaptureFormSnapshot,
  workIds: KnownWorkIds,
  bridgeMode: boolean,
  draftId: string | null,
  onSave: (input: SaveInput) => SaveFailure | Success,
): SaveFailure | Success | null => {
  const input = parseThoughtCaptureFormSnapshot(snapshot, workIds, bridgeMode);
  if (!input) return null;
  return onSave({ draftId, ...input });
};

export class ThoughtCapture<Success extends SaveSuccess = SaveSuccess> {
  private readonly catalogueById: Map<string, CapturableWork>;
  private readonly draft: CapturableDraft | null;
  private hasBridge: boolean;
  private message: string;
  private readonly overlay: HTMLDivElement;
  private selectedMediaId: string;
  private selectedSecondaryMediaId: string;
  private statement: string;

  constructor(
    private readonly shell: HTMLElement,
    private readonly works: readonly CapturableWork[],
    private readonly options: ThoughtCaptureOptions<Success>,
  ) {
    this.catalogueById = new Map(works.map((work) => [work.id, work]));
    this.draft = options.draft ?? null;
    this.hasBridge = Boolean(this.draft?.secondaryMediaId);
    this.selectedMediaId = this.draft?.primaryMediaId ?? works[0]?.id ?? "";
    this.selectedSecondaryMediaId =
      this.draft?.secondaryMediaId ??
      works.find((work) => work.id !== this.selectedMediaId)?.id ??
      "";
    this.statement = this.draft?.statement ?? "";
    this.message = options.initialMessage ?? "";
    this.overlay = document.createElement("div");
    this.overlay.className = "capture-overlay";
    this.shell.append(this.overlay);
    this.requiredShellElement(".topbar").inert = true;
    this.requiredShellElement(".map-page").inert = true;
    this.render();
  }

  render() {
    const editing = Boolean(this.draft);
    const selectedWork = this.catalogueById.get(this.selectedMediaId);
    const secondaryWork = this.draft?.secondaryMediaId
      ? this.catalogueById.get(this.draft.secondaryMediaId)
      : undefined;
    this.overlay.innerHTML = `
      <section class="thought-capture" role="dialog" aria-modal="true" aria-labelledby="capture-title">
        <button class="capture-back" type="button" data-capture-close>Back to map</button>
        <header class="capture-heading">
          <p class="capture-kicker">Private capture</p>
          <h2 id="capture-title">${this.options.bridgeMode ? "Connect what stayed with you." : this.hasBridge ? "Refine what connects them." : editing ? "Refine what stayed with you." : "Write what stayed with you."}</h2>
          <p>${this.options.bridgeMode || this.hasBridge ? "What do these works make visible together?" : "What did this work make you notice, feel, question, connect, or believe?"}</p>
          <small>No summary, score, or verdict. Keep the part that feels like yours.</small>
        </header>

        <form class="capture-form" novalidate>
          ${
            editing
              ? `<div class="capture-anchor" aria-label="Thought anchor">
                  <span>${this.options.bridgeMode ? "Begins with" : "Anchored to"}</span>
                  <strong>${escapeHtml(selectedWork?.title ?? "Selected work")}</strong>
                  <small>${escapeHtml(selectedWork?.creator ?? "")}</small>
                </div>`
              : `<fieldset class="capture-works">
                  <legend>Choose the work this Thought begins with</legend>
                  ${this.works.map((work) => this.renderWorkChoice(work)).join("")}
                </fieldset>`
          }

          ${
            this.options.bridgeMode
              ? `<fieldset class="capture-works bridge-works">
                  <legend>Choose another work to connect</legend>
                  ${this.works
                    .filter((work) => work.id !== this.selectedMediaId)
                    .map((work) => this.renderBridgeChoice(work))
                    .join("")}
                </fieldset>`
              : secondaryWork
                ? `<div class="capture-anchor capture-secondary" aria-label="Second Thought anchor">
                    <span>Connected with</span>
                    <strong>${escapeHtml(secondaryWork.title)}</strong>
                    <small>${escapeHtml(secondaryWork.creator)}</small>
                  </div>`
                : ""
          }

          <label class="capture-label" for="thought-statement">Your Thought</label>
          <textarea
            id="thought-statement"
            name="statement"
            rows="6"
            aria-describedby="capture-guidance capture-status"
            placeholder="A compact idea you want to see in your Map"
          >${escapeHtml(this.statement)}</textarea>
          <p id="capture-guidance" class="capture-guidance">${this.options.bridgeMode || this.hasBridge ? "Keep the shared meaning in your own words. The bridge stays private until you publish it." : "One clear statement is enough. You can refine it while it is private."}</p>
          <p id="capture-status" class="capture-status" role="status" aria-live="polite">${escapeHtml(this.message)}</p>

          <div class="capture-actions">
            <button class="capture-cancel" type="button" data-capture-close>Cancel</button>
            <button class="capture-save" type="submit">${this.options.bridgeMode ? "Save private bridge" : editing ? "Save changes" : "Save private Draft"}</button>
          </div>
        </form>
      </section>
    `;
    this.bindEvents();
    requestAnimationFrame(() => this.overlay.querySelector<HTMLTextAreaElement>("#thought-statement")?.focus());
  }

  private renderWorkChoice(work: CapturableWork) {
    const checked = work.id === this.selectedMediaId;
    return `
      <label class="capture-work capture-${escapeHtml(work.format)}${checked ? " is-selected" : ""}">
        <input type="radio" name="media" value="${escapeHtml(work.id)}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(work.format)}</span>
        <strong>${escapeHtml(work.title)}</strong>
        <small>${escapeHtml(work.creator)}</small>
      </label>
    `;
  }

  private renderBridgeChoice(work: CapturableWork) {
    const checked = work.id === this.selectedSecondaryMediaId;
    return `
      <label class="capture-work capture-${escapeHtml(work.format)}${checked ? " is-selected" : ""}">
        <input type="radio" name="secondary-media" value="${escapeHtml(work.id)}" ${checked ? "checked" : ""} />
        <span>${escapeHtml(work.format)}</span>
        <strong>${escapeHtml(work.title)}</strong>
        <small>${escapeHtml(work.creator)}</small>
      </label>
    `;
  }

  private bindEvents() {
    this.overlay.querySelectorAll<HTMLElement>("[data-capture-close]").forEach((button) => {
      button.addEventListener("click", () => this.close());
    });
    this.overlay.querySelectorAll<HTMLInputElement>('input[name="media"]').forEach((input) => {
      input.addEventListener("change", () => {
        this.selectedMediaId = input.value;
        this.overlay.querySelectorAll<HTMLElement>(".capture-work").forEach((label) => {
          label.classList.toggle("is-selected", label.contains(input));
        });
      });
    });
    this.overlay.querySelectorAll<HTMLInputElement>('input[name="secondary-media"]').forEach((input) => {
      input.addEventListener("change", () => {
        this.selectedSecondaryMediaId = input.value;
        this.overlay.querySelectorAll<HTMLElement>(".bridge-works .capture-work").forEach((label) => {
          label.classList.toggle("is-selected", label.contains(input));
        });
      });
    });
    const statement = this.requiredOverlayElement<HTMLTextAreaElement>("#thought-statement");
    statement.addEventListener("input", () => {
      this.statement = statement.value;
      if (this.message) {
        this.message = "";
        this.requiredOverlayElement<HTMLElement>(".capture-status").textContent = "";
      }
    });
    this.requiredOverlayElement<HTMLFormElement>(".capture-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const result = submitThoughtCaptureFormSnapshot(
        {
          primaryMediaId: this.selectedMediaId,
          secondaryMediaId: this.options.bridgeMode ? this.selectedSecondaryMediaId : null,
          statement: this.statement,
        },
        this.catalogueById,
        Boolean(this.options.bridgeMode),
        this.draft?.id ?? null,
        this.options.onSave,
      );
      if (!result) return;
      if (result.saved) {
        this.close(false);
        this.options.onSaved(result);
        return;
      }
      {
        this.message = result.message;
        this.requiredOverlayElement<HTMLElement>(".capture-status").textContent = this.message;
        this.requiredOverlayElement<HTMLTextAreaElement>("#thought-statement").focus();
      }
    });
    this.requiredOverlayElement<HTMLElement>(".thought-capture").addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...this.overlay.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea"),
      ];
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
    if (!element) throw new Error(`Thought Capture is missing ${selector}.`);
    return element;
  }

  private requiredShellElement(selector: string): HTMLElement {
    const element = this.shell.querySelector<HTMLElement>(selector);
    if (!element) throw new Error(`Thought Capture shell is missing ${selector}.`);
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
