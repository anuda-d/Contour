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
    this.selectedMediaId = this.draft?.mediaId ?? works[0]?.id ?? "";
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
    this.overlay.innerHTML = `
      <section class="thought-capture" role="dialog" aria-modal="true" aria-labelledby="capture-title">
        <button class="capture-back" type="button" data-capture-close>Back to map</button>
        <header class="capture-heading">
          <p class="capture-kicker">Private capture</p>
          <h2 id="capture-title">${editing ? "Refine what stayed with you." : "Write what stayed with you."}</h2>
          <p>What did this work make you notice, feel, question, connect, or believe?</p>
          <small>No summary, score, or verdict. Keep the part that feels like yours.</small>
        </header>

        <form class="capture-form" novalidate>
          ${
            editing
              ? `<div class="capture-anchor" aria-label="Thought anchor">
                  <span>Anchored to</span>
                  <strong>${escapeHtml(selectedWork?.title ?? "Selected work")}</strong>
                  <small>${escapeHtml(selectedWork?.creator ?? "")}</small>
                </div>`
              : `<fieldset class="capture-works">
                  <legend>Choose the work this Thought begins with</legend>
                  ${this.works.map((work) => this.renderWorkChoice(work)).join("")}
                </fieldset>`
          }

          <label class="capture-label" for="thought-statement">Your Thought</label>
          <textarea
            id="thought-statement"
            name="statement"
            rows="6"
            aria-describedby="capture-guidance capture-status"
            placeholder="A compact idea you want to see in your Map"
          >${escapeHtml(this.statement)}</textarea>
          <p id="capture-guidance" class="capture-guidance">One clear statement is enough. You can refine it while it is private.</p>
          <p id="capture-status" class="capture-status" role="status" aria-live="polite">${escapeHtml(this.message)}</p>

          <div class="capture-actions">
            <button class="capture-cancel" type="button" data-capture-close>Cancel</button>
            <button class="capture-save" type="submit">${editing ? "Save changes" : "Save private Draft"}</button>
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
        mediaId: this.selectedMediaId,
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
