const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export class ThoughtCapture {
  constructor(shell, works, options) {
    this.shell = shell;
    this.works = works;
    this.options = options;
    this.draft = options.draft ?? null;
    this.bridgeMode = Boolean(options.bridgeMode);
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
    this.shell.querySelector(".topbar").inert = true;
    this.shell.querySelector(".map-page").inert = true;
    this.render();
  }

  render() {
    const editing = Boolean(this.draft);
    const selectedWork = this.works.find((work) => work.id === this.selectedMediaId);
    const secondaryWork = this.works.find(
      (work) => work.id === this.draft?.secondaryMediaId,
    );
    this.overlay.innerHTML = `
      <section class="thought-capture" role="dialog" aria-modal="true" aria-labelledby="capture-title">
        <button class="capture-back" type="button" data-capture-close>Back to map</button>
        <header class="capture-heading">
          <p class="capture-kicker">Private capture</p>
          <h2 id="capture-title">${this.bridgeMode ? "Connect what stayed with you." : this.hasBridge ? "Refine what connects them." : editing ? "Refine what stayed with you." : "Write what stayed with you."}</h2>
          <p>${this.bridgeMode || this.hasBridge ? "What do these works make visible together?" : "What did this work make you notice, feel, question, connect, or believe?"}</p>
          <small>No summary, score, or verdict. Keep the part that feels like yours.</small>
        </header>

        <form class="capture-form" novalidate>
          ${
            editing
              ? `<div class="capture-anchor" aria-label="Thought anchor">
                  <span>${this.bridgeMode ? "Begins with" : "Anchored to"}</span>
                  <strong>${escapeHtml(selectedWork?.title ?? "Selected work")}</strong>
                  <small>${escapeHtml(selectedWork?.creator ?? "")}</small>
                </div>`
              : `<fieldset class="capture-works">
                  <legend>Choose the work this Thought begins with</legend>
                  ${this.works.map((work) => this.renderWorkChoice(work)).join("")}
                </fieldset>`
          }

          ${
            this.bridgeMode
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
          <p id="capture-guidance" class="capture-guidance">${this.bridgeMode || this.hasBridge ? "Keep the shared meaning in your own words. The bridge stays private until you publish it." : "One clear statement is enough. You can refine it while it is private."}</p>
          <p id="capture-status" class="capture-status" role="status" aria-live="polite">${escapeHtml(this.message)}</p>

          <div class="capture-actions">
            <button class="capture-cancel" type="button" data-capture-close>Cancel</button>
            <button class="capture-save" type="submit">${this.bridgeMode ? "Save private bridge" : editing ? "Save changes" : "Save private Draft"}</button>
          </div>
        </form>
      </section>
    `;
    this.bindEvents();
    requestAnimationFrame(() => this.overlay.querySelector("#thought-statement")?.focus());
  }

  renderWorkChoice(work) {
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

  renderBridgeChoice(work) {
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

  bindEvents() {
    this.overlay.querySelectorAll("[data-capture-close]").forEach((button) => {
      button.addEventListener("click", () => this.close());
    });
    this.overlay.querySelectorAll('input[name="media"]').forEach((input) => {
      input.addEventListener("change", () => {
        this.selectedMediaId = input.value;
        this.overlay.querySelectorAll(".capture-work").forEach((label) => {
          label.classList.toggle("is-selected", label.contains(input));
        });
      });
    });
    this.overlay.querySelectorAll('input[name="secondary-media"]').forEach((input) => {
      input.addEventListener("change", () => {
        this.selectedSecondaryMediaId = input.value;
        this.overlay.querySelectorAll(".bridge-works .capture-work").forEach((label) => {
          label.classList.toggle("is-selected", label.contains(input));
        });
      });
    });
    this.overlay.querySelector("#thought-statement").addEventListener("input", (event) => {
      this.statement = event.currentTarget.value;
      if (this.message) {
        this.message = "";
        this.overlay.querySelector(".capture-status").textContent = "";
      }
    });
    this.overlay.querySelector(".capture-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const result = this.options.onSave({
        draftId: this.draft?.id ?? null,
        primaryMediaId: this.selectedMediaId,
        secondaryMediaId: this.bridgeMode ? this.selectedSecondaryMediaId : null,
        statement: this.statement,
      });
      if (!result.saved) {
        this.message = result.message;
        const status = this.overlay.querySelector(".capture-status");
        status.textContent = this.message;
        this.overlay.querySelector("#thought-statement")?.focus();
        return;
      }
      this.close(false);
      this.options.onSaved(result);
    });
    this.overlay.querySelector(".thought-capture").addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...this.overlay.querySelectorAll("button:not([disabled]), input:not([disabled]), textarea"),
      ];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  close(restoreFocus = true) {
    this.shell.querySelector(".topbar").inert = false;
    this.shell.querySelector(".map-page").inert = false;
    this.overlay.remove();
    this.options.onClose();
    if (restoreFocus) this.options.restoreFocus();
  }
}
