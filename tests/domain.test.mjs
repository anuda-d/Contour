import test from "node:test";
import assert from "node:assert/strict";

import {
  createConnection,
  createPrototypeState,
  getProfileGraph,
  loadMvpSeedContent,
  reactToBook,
  setDefiningBooks,
  validateMvpGraph,
} from "../src/domain.js";

test("loadMvpSeedContent returns internally consistent seeded MVP content", () => {
  const seed = loadMvpSeedContent();
  const result = validateMvpGraph(seed);

  assert.deepEqual(result, { ok: true, errors: [] });
  assert.ok(seed.users.length >= 6);
  assert.ok(seed.books.length >= 18);
  assert.ok(seed.collections.length >= 8);
  assert.ok(seed.connections.length >= 12);
  assert.ok(seed.prompts.length >= 6);
});

test("validates a complete profile graph with defining books, reactions, collections, connections, and unfinished entries", () => {
  const state = createPrototypeState();
  const currentUser = state.users.find((user) => user.isCurrent);
  const graph = getProfileGraph(state, currentUser.id);

  assert.equal(graph.user.definingBookIds.length, 3);
  assert.ok(graph.definingBooks.length >= 3);
  assert.ok(graph.reactions.length >= 3);
  assert.ok(graph.collections.length >= 1);
  assert.ok(graph.connections.length >= 1);
  assert.ok(graph.unfinishedEntries.length >= 1);
});

test("rejects invalid Thought Collection sizes", () => {
  const seed = loadMvpSeedContent();
  const tooSmall = {
    ...seed,
    collections: [
      {
        ...seed.collections[0],
        id: "bad-small",
        bookEntries: seed.collections[0].bookEntries.slice(0, 2),
      },
    ],
  };
  const tooLarge = {
    ...seed,
    collections: [
      {
        ...seed.collections[0],
        id: "bad-large",
        bookEntries: [
          ...seed.collections[0].bookEntries,
          { bookId: seed.books[5].id, note: "Extra book that breaks the MVP shape." },
          { bookId: seed.books[6].id, note: "Another extra book that breaks the MVP shape." },
        ],
      },
    ],
  };

  assert.equal(validateMvpGraph(tooSmall).ok, false);
  assert.ok(validateMvpGraph(tooSmall).errors.some((error) => /3 to 5 books/.test(error)));
  assert.equal(validateMvpGraph(tooLarge).ok, false);
  assert.ok(validateMvpGraph(tooLarge).errors.some((error) => /3 to 5 books/.test(error)));
});

test("reactToBook saves one expressive reaction per user-book pair and keeps rating optional", () => {
  const state = createPrototypeState();
  const user = state.users.find((candidate) => candidate.isCurrent);
  const book = state.books.find((candidate) => !user.definingBookIds.includes(candidate.id));

  const next = reactToBook(state, user.id, book.id, {
    label: "Respected, not loved",
    note: "Admired the severity more than I enjoyed reading it.",
    visibility: "public",
  });

  const saved = next.reactions.find((reaction) => reaction.userId === user.id && reaction.bookId === book.id);
  assert.equal(saved.label, "Respected, not loved");
  assert.equal(saved.rating, null);
  assert.equal(saved.note, "Admired the severity more than I enjoyed reading it.");
});

test("reactToBook rejects unknown reaction labels", () => {
  const state = createPrototypeState();
  const user = state.users.find((candidate) => candidate.isCurrent);

  assert.throws(
    () => reactToBook(state, user.id, state.books[0].id, { label: "Pretty okay", visibility: "public" }),
    /Unknown reaction label/,
  );
});

test("setDefiningBooks requires exactly three valid books", () => {
  const state = createPrototypeState();
  const user = state.users.find((candidate) => candidate.isCurrent);

  assert.throws(() => setDefiningBooks(state, user.id, state.books.slice(0, 2).map((book) => book.id)), /exactly three/);

  const next = setDefiningBooks(state, user.id, state.books.slice(3, 6).map((book) => book.id));
  assert.deepEqual(next.users.find((candidate) => candidate.id === user.id).definingBookIds, [
    state.books[3].id,
    state.books[4].id,
    state.books[5].id,
  ]);
});

test("createConnection rejects self-connections and saves a valid book-to-book idea", () => {
  const state = createPrototypeState();
  const user = state.users.find((candidate) => candidate.isCurrent);

  assert.throws(
    () =>
      createConnection(state, {
        authorUserId: user.id,
        sourceBookId: state.books[0].id,
        targetBookId: state.books[0].id,
        ideaLabel: "recursive collapse",
        explanation: "The same book cannot reveal a relationship to itself.",
        visibility: "public",
      }),
    /different books/,
  );

  const next = createConnection(state, {
    authorUserId: user.id,
    sourceBookId: state.books[0].id,
    targetBookId: state.books[1].id,
    ideaLabel: "performance as survival",
    explanation: "Both books treat self-presentation as a strategy for staying intact.",
    visibility: "public",
  });

  assert.ok(next.connections.some((connection) => connection.ideaLabel === "performance as survival"));
});
