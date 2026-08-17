import {
  createConnection,
  createPrototypeState,
  getBookGraph,
  getCollection,
  getConnection,
  getCurrentUser,
  getProfileGraph,
  reactToBook,
  setDefiningBooks,
  summarizeReactionForBook,
} from "./domain.js";

const STORAGE_KEY = "book-platform-mvp-state-v1";
const app = document.querySelector("#app");
let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : createPrototypeState();
  } catch {
    return createPrototypeState();
  }
}

function saveState(nextState) {
  state = nextState;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  saveState(createPrototypeState());
  navigate("#/");
}

function route() {
  const hash = window.location.hash || "#/";
  const [path] = hash.slice(1).split("?");
  return path || "/";
}

function navigate(hash) {
  window.location.hash = hash;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function bookById(bookId) {
  return state.books.find((book) => book.id === bookId);
}

function userById(userId) {
  return state.users.find((user) => user.id === userId);
}

function collectionById(collectionId) {
  return state.collections.find((collection) => collection.id === collectionId);
}

function connectionById(connectionId) {
  return state.connections.find((connection) => connection.id === connectionId);
}

function activeClass(target) {
  const current = route();
  if (target === "/" && current === "/") return "active";
  if (target !== "/" && current.startsWith(target)) return "active";
  return "";
}

function shell(content) {
  const currentUser = getCurrentUser(state);
  return `
    <header class="topbar">
      <a class="brand" href="#/" aria-label="Margin home">
        <span class="brand-mark">M</span>
        <span>
          <strong>Margin</strong>
          <small>books as identity</small>
        </span>
      </a>
      <nav class="nav" aria-label="Primary">
        <a class="${activeClass("/books")}" href="#/books">Books</a>
        <a class="${activeClass("/people")}" href="#/people">People</a>
        <a class="${activeClass("/profile")}" href="#/profile">Profile</a>
      </nav>
      <div class="top-actions">
        <a class="button quiet" href="#/onboarding">Build profile</a>
        <button class="icon-button" type="button" data-action="reset" title="Reset prototype state">Reset</button>
      </div>
    </header>
    <main>
      ${content}
    </main>
    <footer class="footer">
      <span>Prototype user: @${escapeHtml(currentUser.handle)}</span>
      <span>No feed. No leaderboard. No homework.</span>
    </footer>
  `;
}

function cover(book, size = "") {
  return `
    <div class="book-cover tone-${escapeHtml(book.coverTone)} ${size}" aria-label="${escapeHtml(book.title)} cover">
      <span>${escapeHtml(book.author.split(" ").at(-1))}</span>
      <strong>${escapeHtml(book.title)}</strong>
    </div>
  `;
}

function reactionPills(reactions) {
  if (!reactions.length) return `<span class="muted">No reactions yet</span>`;
  return reactions
    .slice(0, 4)
    .map((reaction) => `<span class="pill">${escapeHtml(reaction.label)}</span>`)
    .join("");
}

function ideaPills(ideas) {
  return ideas.map((idea) => `<span class="idea">${escapeHtml(idea)}</span>`).join("");
}

function bookCard(book) {
  const summary = summarizeReactionForBook(state, book.id);
  const connections = state.connections.filter(
    (connection) => connection.sourceBookId === book.id || connection.targetBookId === book.id,
  );
  return `
    <article class="card book-card">
      <a href="#/books/${book.id}" class="cover-link">${cover(book)}</a>
      <div class="card-body">
        <a class="card-title" href="#/books/${book.id}">${escapeHtml(book.title)}</a>
        <p class="byline">${escapeHtml(book.author)}</p>
        <p>${escapeHtml(book.description)}</p>
        <div class="pill-row">
          ${summary.length ? summary.map((item) => `<span class="pill">${escapeHtml(item.label)} (${item.count})</span>`).join("") : `<span class="muted">Waiting for a first reaction</span>`}
        </div>
        <p class="micro">${plural(connections.length, "connection")} · ${plural(book.readerIds.length, "reader")}</p>
      </div>
    </article>
  `;
}

function personCard(user) {
  const graph = getProfileGraph(state, user.id);
  const leadingConnection = graph.connections[0];
  return `
    <article class="card person-card">
      <a class="avatar" style="--avatar-color: ${escapeHtml(user.avatarColor)}" href="#/people/${user.id}">
        ${escapeHtml(user.displayName.slice(0, 1))}
      </a>
      <div class="card-body">
        <a class="card-title" href="#/people/${user.id}">${escapeHtml(user.displayName)}</a>
        <p class="byline">@${escapeHtml(user.handle)}</p>
        <p>${escapeHtml(user.identityLine)}</p>
        <div class="mini-covers">
          ${graph.definingBooks.map((book) => `<a href="#/books/${book.id}">${cover(book, "tiny")}</a>`).join("")}
        </div>
        <div class="pill-row">${ideaPills(user.recurringIdeas.slice(0, 3))}</div>
        ${
          leadingConnection
            ? `<a class="micro-link" href="#/connections/${leadingConnection.id}">${escapeHtml(leadingConnection.ideaLabel)}</a>`
            : ""
        }
      </div>
    </article>
  `;
}

function collectionCard(collection) {
  const owner = userById(collection.ownerUserId);
  return `
    <article class="card collection-card">
      <div>
        <a class="card-title" href="#/collections/${collection.id}">${escapeHtml(collection.title)}</a>
        <p>${escapeHtml(collection.thesis)}</p>
        <p class="micro">Curated by @${escapeHtml(owner.handle)} · ${plural(collection.bookEntries.length, "book")}</p>
      </div>
      <div class="mini-covers">
        ${collection.bookEntries.slice(0, 4).map((entry) => `<a href="#/books/${entry.bookId}">${cover(bookById(entry.bookId), "tiny")}</a>`).join("")}
      </div>
    </article>
  `;
}

function connectionCard(connection) {
  const source = bookById(connection.sourceBookId);
  const target = bookById(connection.targetBookId);
  const author = userById(connection.authorUserId);
  return `
    <article class="card connection-card">
      <div class="connection-books">
        ${cover(source, "tiny")}
        <span class="arrow">to</span>
        ${cover(target, "tiny")}
      </div>
      <a class="card-title" href="#/connections/${connection.id}">${escapeHtml(connection.ideaLabel)}</a>
      <p>${escapeHtml(connection.explanation)}</p>
      <p class="micro">@${escapeHtml(author.handle)} connected ${escapeHtml(source.title)} and ${escapeHtml(target.title)}</p>
    </article>
  `;
}

function renderHome() {
  const currentUser = getCurrentUser(state);
  const profile = getProfileGraph(state, currentUser.id);
  return shell(`
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">MVP identity loop</p>
        <h1>Your reading profile should feel like a portrait, not inventory.</h1>
        <p>
          React to books by what they reveal, connect books through ideas, and let the profile become the reward.
        </p>
        <div class="hero-actions">
          <a class="button primary" href="#/onboarding">Build your profile</a>
          <a class="button" href="#/people">Browse taste</a>
        </div>
      </div>
      <aside class="profile-snapshot">
        <p class="eyebrow">Current profile</p>
        <h2>@${escapeHtml(currentUser.handle)}</h2>
        <p>${escapeHtml(currentUser.identityLine)}</p>
        <div class="mini-covers large">
          ${profile.definingBooks.map((book) => `<a href="#/books/${book.id}">${cover(book, "small")}</a>`).join("")}
        </div>
        <div class="pill-row">${ideaPills(currentUser.recurringIdeas)}</div>
      </aside>
    </section>
    <section class="section-grid">
      <div>
        <div class="section-heading">
          <p class="eyebrow">Seeded discovery</p>
          <h2>Profiles with taste pressure</h2>
        </div>
        <div class="grid two">${state.users.filter((user) => !user.isCurrent).slice(0, 4).map(personCard).join("")}</div>
      </div>
      <aside class="prompt-panel">
        <p class="eyebrow">Rotating prompts</p>
        ${state.prompts.map((prompt) => `<div class="prompt"><strong>${escapeHtml(prompt.action)}</strong><span>${escapeHtml(prompt.text)}</span></div>`).join("")}
      </aside>
    </section>
    <section>
      <div class="section-heading">
        <p class="eyebrow">Thought Collections</p>
        <h2>Worldview artifacts, not lists</h2>
      </div>
      <div class="grid three">${state.collections.slice(0, 6).map(collectionCard).join("")}</div>
    </section>
  `);
}

function renderBooks() {
  return shell(`
    <section>
      <div class="section-heading compact">
        <p class="eyebrow">Books</p>
        <h1>Socially alive book objects</h1>
        <p>Books show reactions, readers, connections, and collections instead of sitting as isolated review pages.</p>
      </div>
      <div class="grid three">${state.books.map(bookCard).join("")}</div>
    </section>
  `);
}

function renderBookDetail(bookId) {
  const graph = getBookGraph(state, bookId);
  const currentUser = getCurrentUser(state);
  const ownReaction = state.reactions.find((reaction) => reaction.userId === currentUser.id && reaction.bookId === bookId);
  return shell(`
    <section class="detail-layout">
      <aside class="detail-aside">
        ${cover(graph.book, "feature")}
        <button class="button primary full" type="button" data-action="open-react" data-book-id="${graph.book.id}">
          ${ownReaction ? "Update reaction" : "React to book"}
        </button>
      </aside>
      <div class="detail-main">
        <p class="eyebrow">Book</p>
        <h1>${escapeHtml(graph.book.title)}</h1>
        <p class="byline">${escapeHtml(graph.book.author)}</p>
        <p class="lead">${escapeHtml(graph.book.description)}</p>
        ${
          ownReaction
            ? `<div class="notice"><strong>Your reaction:</strong> ${escapeHtml(ownReaction.label)}${ownReaction.note ? ` · ${escapeHtml(ownReaction.note)}` : ""}</div>`
            : ""
        }
        <div class="section-heading inline">
          <h2>Reader reactions</h2>
        </div>
        <div class="stack">
          ${
            graph.reactions.length
              ? graph.reactions
                  .map((reaction) => {
                    const user = userById(reaction.userId);
                    return `<article class="soft-row"><a href="#/people/${user.id}">@${escapeHtml(user.handle)}</a><span class="pill">${escapeHtml(reaction.label)}</span><span>${escapeHtml(reaction.note)}</span></article>`;
                  })
                  .join("")
              : `<p class="muted">No one has reacted yet.</p>`
          }
        </div>
        <div class="split-block">
          <div>
            <div class="section-heading inline"><h2>Connected books</h2></div>
            <div class="stack">${graph.connections.map(connectionCard).join("") || `<p class="muted">No connections yet.</p>`}</div>
          </div>
          <div>
            <div class="section-heading inline"><h2>Collections containing it</h2></div>
            <div class="stack">${graph.collections.map(collectionCard).join("") || `<p class="muted">No collections yet.</p>`}</div>
          </div>
        </div>
      </div>
    </section>
    ${reactionDialog(graph.book, ownReaction)}
  `);
}

function reactionDialog(book, reaction) {
  return `
    <dialog id="reaction-dialog-${escapeHtml(book.id)}" class="modal">
      <form method="dialog" class="modal-card" data-form="reaction">
        <div class="modal-head">
          <div>
            <p class="eyebrow">Reaction</p>
            <h2>${escapeHtml(book.title)}</h2>
          </div>
          <button class="icon-button" type="button" data-action="close-dialog">Close</button>
        </div>
        <input type="hidden" name="bookId" value="${escapeHtml(book.id)}">
        <label>
          Identity label
          <select name="label" required>
            ${state.reactionLabels.map((label) => `<option value="${escapeHtml(label)}" ${reaction?.label === label ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
          </select>
        </label>
        <label>
          Rating, optional
          <select name="rating">
            <option value="">No rating</option>
            ${[5, 4, 3, 2, 1].map((rating) => `<option value="${rating}" ${reaction?.rating === rating ? "selected" : ""}>${rating}</option>`).join("")}
          </select>
        </label>
        <label>
          Compact note
          <textarea name="note" maxlength="160" rows="3" placeholder="One sentence that can live on a profile.">${escapeHtml(reaction?.note || "")}</textarea>
        </label>
        <button class="button primary" type="submit">Save reaction</button>
      </form>
    </dialog>
  `;
}

function renderPeople() {
  return shell(`
    <section>
      <div class="section-heading compact">
        <p class="eyebrow">People</p>
        <h1>Reader identity first</h1>
        <p>Browse readers by defining books, reactions, recurring ideas, and the connections they make.</p>
      </div>
      <div class="grid two">${state.users.map(personCard).join("")}</div>
    </section>
  `);
}

function renderPerson(userId, isProfile = false) {
  const graph = getProfileGraph(state, userId);
  return shell(profileMarkup(graph, isProfile));
}

function profileMarkup(graph, isProfile) {
  const unfinished = graph.unfinishedEntries.map((entry) => ({ ...entry, book: bookById(entry.bookId) }));
  const incompleteMessages = [];
  if (graph.definingBooks.length < 3) incompleteMessages.push("Choose exactly three defining books.");
  if (graph.reactions.length < 3) incompleteMessages.push("React to at least three books so the profile has taste signals.");
  return `
    <section class="profile-hero">
      <div class="avatar large-avatar" style="--avatar-color: ${escapeHtml(graph.user.avatarColor)}">${escapeHtml(graph.user.displayName.slice(0, 1))}</div>
      <div>
        <p class="eyebrow">${isProfile ? "Your profile" : "Reader profile"}</p>
        <h1>${escapeHtml(graph.user.displayName)}</h1>
        <p class="byline">@${escapeHtml(graph.user.handle)}</p>
        <p class="lead">${escapeHtml(graph.user.identityLine)}</p>
        <div class="pill-row">${ideaPills(graph.user.recurringIdeas)}</div>
        ${isProfile ? `<div class="hero-actions"><a class="button primary" href="#/onboarding">Edit defining books</a><a class="button" href="#/connect">Create connection</a></div>` : ""}
      </div>
    </section>
    ${
      incompleteMessages.length
        ? `<section class="notice"><strong>Next tiny step:</strong> ${incompleteMessages.map(escapeHtml).join(" ")}</section>`
        : ""
    }
    <section>
      <div class="section-heading inline"><h2>Three defining books</h2></div>
      <div class="grid three">${graph.definingBooks.map(bookCard).join("")}</div>
    </section>
    <section class="split-block">
      <div>
        <div class="section-heading inline"><h2>Reactions</h2></div>
        <div class="stack">
          ${graph.reactions
            .map((reaction) => {
              const book = bookById(reaction.bookId);
              return `<article class="soft-row"><a href="#/books/${book.id}">${escapeHtml(book.title)}</a><span class="pill">${escapeHtml(reaction.label)}</span><span>${escapeHtml(reaction.note)}</span></article>`;
            })
            .join("")}
        </div>
      </div>
      <div>
        <div class="section-heading inline"><h2>Unfinished shelf</h2></div>
        <div class="stack">
          ${unfinished.length
            ? unfinished
                .map((entry) => `<article class="soft-row"><a href="#/books/${entry.book.id}">${escapeHtml(entry.book.title)}</a><span class="pill">${escapeHtml(entry.reason)}</span><span>${escapeHtml(entry.note)}</span></article>`)
                .join("")
            : `<p class="muted">No unfinished books yet.</p>`}
        </div>
      </div>
    </section>
    <section class="split-block">
      <div>
        <div class="section-heading inline"><h2>Thought Collections</h2></div>
        <div class="stack">${graph.collections.map(collectionCard).join("") || `<p class="muted">No collections yet.</p>`}</div>
      </div>
      <div>
        <div class="section-heading inline"><h2>Book connections</h2></div>
        <div class="stack">${graph.connections.map(connectionCard).join("") || `<p class="muted">No connections yet.</p>`}</div>
      </div>
    </section>
  `;
}

function renderOnboarding() {
  const currentUser = getCurrentUser(state);
  const graph = getProfileGraph(state, currentUser.id);
  return shell(`
    <section class="section-heading compact">
      <p class="eyebrow">Onboarding</p>
      <h1>Discovery before labor</h1>
      <p>Start by noticing a taste world, then choose three books and add expressive reactions.</p>
    </section>
    <section class="split-block">
      <div>
        <div class="section-heading inline"><h2>1. Pick a profile that feels aspirational</h2></div>
        <div class="stack">${state.users.filter((user) => !user.isCurrent).slice(0, 4).map(personCard).join("")}</div>
      </div>
      <div>
        <div class="section-heading inline"><h2>2. Pick exactly three defining books</h2></div>
        <form class="builder" data-form="defining-books">
          <div class="book-picker">
            ${state.books
              .map(
                (book) => `
                  <label class="pick-card">
                    <input type="checkbox" name="bookId" value="${book.id}" ${currentUser.definingBookIds.includes(book.id) ? "checked" : ""}>
                    ${cover(book, "tiny")}
                    <span>${escapeHtml(book.title)}</span>
                  </label>
                `,
              )
              .join("")}
          </div>
          <button class="button primary" type="submit">Save three books</button>
        </form>
      </div>
    </section>
    <section class="split-block">
      <div>
        <div class="section-heading inline"><h2>3. React to those books</h2></div>
        <div class="stack">
          ${graph.definingBooks
            .map((book) => {
              const reaction = graph.reactions.find((item) => item.bookId === book.id);
              return `<article class="soft-row"><a href="#/books/${book.id}">${escapeHtml(book.title)}</a><span>${reaction ? escapeHtml(reaction.label) : "No reaction yet"}</span><button class="button small" type="button" data-action="open-react" data-book-id="${book.id}">React</button></article>`;
            })
            .join("")}
        </div>
      </div>
      <div>
        <div class="section-heading inline"><h2>4. Create one connection</h2></div>
        ${connectionForm(currentUser.id, graph.definingBooks)}
      </div>
    </section>
    ${graph.definingBooks.map((book) => reactionDialog(book, graph.reactions.find((reaction) => reaction.bookId === book.id))).join("")}
  `);
}

function connectionForm(userId, preferredBooks = state.books.slice(0, 3)) {
  const sourceOptions = preferredBooks.length >= 2 ? preferredBooks : state.books;
  const targetOptions = state.books;
  return `
    <form class="builder" data-form="connection">
      <input type="hidden" name="authorUserId" value="${escapeHtml(userId)}">
      <label>
        Source book
        <select name="sourceBookId" required>
          ${sourceOptions.map((book) => `<option value="${book.id}">${escapeHtml(book.title)}</option>`).join("")}
        </select>
      </label>
      <label>
        Target book
        <select name="targetBookId" required>
          ${targetOptions.map((book, index) => `<option value="${book.id}" ${index === 1 ? "selected" : ""}>${escapeHtml(book.title)}</option>`).join("")}
        </select>
      </label>
      <label>
        Idea label
        <input name="ideaLabel" maxlength="60" required placeholder="self-destruction as control">
      </label>
      <label>
        One-sentence explanation
        <textarea name="explanation" maxlength="220" rows="4" required placeholder="Both books belong near each other because..."></textarea>
      </label>
      <button class="button primary" type="submit">Save connection</button>
    </form>
  `;
}

function renderConnect() {
  const currentUser = getCurrentUser(state);
  const graph = getProfileGraph(state, currentUser.id);
  return shell(`
    <section class="narrow">
      <div class="section-heading compact">
        <p class="eyebrow">Create connection</p>
        <h1>These books belong near each other in my mind.</h1>
        <p>Connections are the MVP's atomic insight layer: two books, one idea, one sentence.</p>
      </div>
      ${connectionForm(currentUser.id, graph.definingBooks)}
    </section>
  `);
}

function renderConnection(connectionId) {
  const connection = getConnection(state, connectionId);
  const source = bookById(connection.sourceBookId);
  const target = bookById(connection.targetBookId);
  const author = userById(connection.authorUserId);
  return shell(`
    <section class="share-object">
      <p class="eyebrow">Connection</p>
      <h1>${escapeHtml(connection.ideaLabel)}</h1>
      <p class="lead">${escapeHtml(connection.explanation)}</p>
      <div class="connection-stage">
        <a href="#/books/${source.id}">${cover(source, "feature")}</a>
        <span>to</span>
        <a href="#/books/${target.id}">${cover(target, "feature")}</a>
      </div>
      <p class="byline">Created by <a href="#/people/${author.id}">@${escapeHtml(author.handle)}</a></p>
    </section>
  `);
}

function renderCollection(collectionId) {
  const collection = getCollection(state, collectionId);
  const owner = userById(collection.ownerUserId);
  return shell(`
    <section class="share-object collection-share">
      <p class="eyebrow">Thought Collection</p>
      <h1>${escapeHtml(collection.title)}</h1>
      <p class="lead">${escapeHtml(collection.thesis)}</p>
      <p class="byline">Curated by <a href="#/people/${owner.id}">@${escapeHtml(owner.handle)}</a></p>
      <div class="collection-books">
        ${collection.bookEntries
          .map((entry) => {
            const book = bookById(entry.bookId);
            return `<article class="collection-book"><a href="#/books/${book.id}">${cover(book, "small")}</a><div><h2>${escapeHtml(book.title)}</h2><p>${escapeHtml(entry.note)}</p></div></article>`;
          })
          .join("")}
      </div>
      <div class="section-heading inline"><h2>Connections inside this collection</h2></div>
      <div class="grid two">${collection.connectionIds.map((id) => connectionCard(connectionById(id))).join("")}</div>
    </section>
  `);
}

function notFound(title = "Page not found", message = "This prototype route does not exist.", href = "#/") {
  return shell(`
    <section class="narrow">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <a class="button primary" href="${escapeHtml(href)}">Return to browse</a>
    </section>
  `);
}

function render() {
  const path = route();
  const parts = path.split("/").filter(Boolean);

  try {
    if (path === "/") app.innerHTML = renderHome();
    else if (path === "/books") app.innerHTML = renderBooks();
    else if (parts[0] === "books" && parts[1]) {
      app.innerHTML = bookById(parts[1])
        ? renderBookDetail(parts[1])
        : notFound("Book not found", "That book is not in the MVP seed set yet.", "#/books");
    }
    else if (path === "/people") app.innerHTML = renderPeople();
    else if (parts[0] === "people" && parts[1]) {
      app.innerHTML = userById(parts[1])
        ? renderPerson(parts[1])
        : notFound("Profile not found", "That reader profile is unavailable in this prototype.", "#/people");
    }
    else if (path === "/profile") app.innerHTML = renderPerson(getCurrentUser(state).id, true);
    else if (path === "/onboarding") app.innerHTML = renderOnboarding();
    else if (path === "/connect") app.innerHTML = renderConnect();
    else if (parts[0] === "connections" && parts[1]) {
      app.innerHTML = connectionById(parts[1])
        ? renderConnection(parts[1])
        : notFound("Connection not found", "That book-to-book connection is not available.", "#/books");
    }
    else if (parts[0] === "collections" && parts[1]) {
      app.innerHTML = collectionById(parts[1])
        ? renderCollection(parts[1])
        : notFound("Collection not found", "That Thought Collection is not available.", "#/");
    }
    else app.innerHTML = notFound();
  } catch (error) {
    app.innerHTML = shell(`<section class="narrow"><h1>Something broke</h1><p>${escapeHtml(error.message)}</p></section>`);
  }
}

document.addEventListener("click", (event) => {
  const resetButton = event.target.closest("[data-action='reset']");
  if (resetButton) resetState();

  const reactButton = event.target.closest("[data-action='open-react']");
  if (reactButton) {
    const dialog = document.querySelector(`#reaction-dialog-${CSS.escape(reactButton.dataset.bookId)}`);
    if (dialog) dialog.showModal();
  }

  const closeButton = event.target.closest("[data-action='close-dialog']");
  if (closeButton) {
    closeButton.closest("dialog")?.close();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.dataset.form === "reaction") {
    event.preventDefault();
    const currentUser = getCurrentUser(state);
    const formData = new FormData(form);
    const rating = formData.get("rating");
    const next = reactToBook(state, currentUser.id, formData.get("bookId"), {
      label: formData.get("label"),
      rating: rating ? Number(rating) : null,
      note: formData.get("note"),
      visibility: "public",
    });
    saveState(next);
    form.closest("dialog")?.close();
    render();
  }

  if (form.dataset.form === "defining-books") {
    event.preventDefault();
    const currentUser = getCurrentUser(state);
    const formData = new FormData(form);
    const bookIds = formData.getAll("bookId");
    try {
      saveState(setDefiningBooks(state, currentUser.id, bookIds));
      navigate("#/profile");
    } catch (error) {
      form.querySelector(".form-error")?.remove();
      form.insertAdjacentHTML("afterbegin", `<p class="form-error">${escapeHtml(error.message)}</p>`);
    }
  }

  if (form.dataset.form === "connection") {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const next = createConnection(state, {
        authorUserId: formData.get("authorUserId"),
        sourceBookId: formData.get("sourceBookId"),
        targetBookId: formData.get("targetBookId"),
        ideaLabel: formData.get("ideaLabel"),
        explanation: formData.get("explanation"),
        visibility: "public",
      });
      const newConnection = next.connections.at(-1);
      saveState(next);
      navigate(`#/connections/${newConnection.id}`);
    } catch (error) {
      form.querySelector(".form-error")?.remove();
      form.insertAdjacentHTML("afterbegin", `<p class="form-error">${escapeHtml(error.message)}</p>`);
    }
  }
});

window.addEventListener("hashchange", render);
render();
