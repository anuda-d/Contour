import {
  REACTION_LABELS,
  seedBooks,
  seedCollections,
  seedConnections,
  seedPrompts,
  seedReactions,
  seedUnfinishedEntries,
  seedUsers,
} from "./data.js";

const VISIBILITY_VALUES = new Set(["public", "private"]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function byId(records) {
  return new Map(records.map((record) => [record.id, record]));
}

function assertExists(map, id, kind) {
  if (!map.has(id)) {
    throw new Error(`Missing ${kind}: ${id}`);
  }
}

function assertVisibility(visibility) {
  if (!VISIBILITY_VALUES.has(visibility)) {
    throw new Error(`Unknown visibility value: ${visibility}`);
  }
}

function nextId(prefix, records) {
  return `${prefix}-${String(records.length + 1).padStart(3, "0")}`;
}

function normalizeState(state) {
  const next = clone(state);

  for (const user of next.users) {
    user.reactionIds = [];
    user.collectionIds = [];
    user.connectionIds = [];
    user.unfinishedEntryIds = [];
  }

  for (const book of next.books) {
    book.commonReactionIds = [];
    book.readerIds = [];
    book.connectionIds = [];
    book.collectionIds = [];
  }

  const users = byId(next.users);
  const books = byId(next.books);

  for (const reaction of next.reactions) {
    const user = users.get(reaction.userId);
    const book = books.get(reaction.bookId);
    if (user && !user.reactionIds.includes(reaction.id)) user.reactionIds.push(reaction.id);
    if (book && !book.commonReactionIds.includes(reaction.id)) book.commonReactionIds.push(reaction.id);
    if (book && !book.readerIds.includes(reaction.userId)) book.readerIds.push(reaction.userId);
  }

  for (const connection of next.connections) {
    const user = users.get(connection.authorUserId);
    const source = books.get(connection.sourceBookId);
    const target = books.get(connection.targetBookId);
    if (user && !user.connectionIds.includes(connection.id)) user.connectionIds.push(connection.id);
    if (source && !source.connectionIds.includes(connection.id)) source.connectionIds.push(connection.id);
    if (target && !target.connectionIds.includes(connection.id)) target.connectionIds.push(connection.id);
  }

  for (const collection of next.collections) {
    const user = users.get(collection.ownerUserId);
    if (user && !user.collectionIds.includes(collection.id)) user.collectionIds.push(collection.id);
    for (const entry of collection.bookEntries) {
      const book = books.get(entry.bookId);
      if (book && !book.collectionIds.includes(collection.id)) book.collectionIds.push(collection.id);
    }
  }

  for (const entry of next.unfinishedEntries) {
    const user = users.get(entry.userId);
    if (user && !user.unfinishedEntryIds.includes(entry.id)) user.unfinishedEntryIds.push(entry.id);
    const book = books.get(entry.bookId);
    if (book && !book.readerIds.includes(entry.userId)) book.readerIds.push(entry.userId);
  }

  return next;
}

export function loadMvpSeedContent() {
  return normalizeState({
    users: seedUsers,
    books: seedBooks,
    reactions: seedReactions,
    connections: seedConnections,
    collections: seedCollections,
    unfinishedEntries: seedUnfinishedEntries,
    prompts: seedPrompts,
    reactionLabels: REACTION_LABELS,
  });
}

export function createPrototypeState() {
  return loadMvpSeedContent();
}

export function validateMvpGraph(state) {
  const errors = [];
  const users = byId(state.users || []);
  const books = byId(state.books || []);
  const reactions = byId(state.reactions || []);
  const connections = byId(state.connections || []);
  const collections = byId(state.collections || []);
  const unfinishedEntries = byId(state.unfinishedEntries || []);
  const reactionLabels = new Set(state.reactionLabels || []);

  for (const user of state.users || []) {
    if (!user.handle || !user.displayName || !user.identityLine) {
      errors.push(`User ${user.id} is missing public identity fields.`);
    }
    for (const bookId of user.definingBookIds || []) {
      if (!books.has(bookId)) errors.push(`User ${user.id} references missing defining book ${bookId}.`);
    }
    for (const reactionId of user.reactionIds || []) {
      if (!reactions.has(reactionId)) errors.push(`User ${user.id} references missing reaction ${reactionId}.`);
    }
    for (const collectionId of user.collectionIds || []) {
      if (!collections.has(collectionId)) errors.push(`User ${user.id} references missing collection ${collectionId}.`);
    }
    for (const connectionId of user.connectionIds || []) {
      if (!connections.has(connectionId)) errors.push(`User ${user.id} references missing connection ${connectionId}.`);
    }
    for (const entryId of user.unfinishedEntryIds || []) {
      if (!unfinishedEntries.has(entryId)) errors.push(`User ${user.id} references missing unfinished entry ${entryId}.`);
    }
  }

  for (const reaction of state.reactions || []) {
    if (!users.has(reaction.userId)) errors.push(`Reaction ${reaction.id} references missing user ${reaction.userId}.`);
    if (!books.has(reaction.bookId)) errors.push(`Reaction ${reaction.id} references missing book ${reaction.bookId}.`);
    if (!reactionLabels.has(reaction.label)) errors.push(`Reaction ${reaction.id} uses unknown label ${reaction.label}.`);
    if (!VISIBILITY_VALUES.has(reaction.visibility)) errors.push(`Reaction ${reaction.id} has invalid visibility.`);
  }

  for (const connection of state.connections || []) {
    if (!users.has(connection.authorUserId)) errors.push(`Connection ${connection.id} references missing user ${connection.authorUserId}.`);
    if (!books.has(connection.sourceBookId)) errors.push(`Connection ${connection.id} references missing source book ${connection.sourceBookId}.`);
    if (!books.has(connection.targetBookId)) errors.push(`Connection ${connection.id} references missing target book ${connection.targetBookId}.`);
    if (connection.sourceBookId === connection.targetBookId) errors.push(`Connection ${connection.id} must connect different books.`);
    if (!connection.ideaLabel || !connection.explanation) errors.push(`Connection ${connection.id} is missing idea or explanation.`);
    if (!VISIBILITY_VALUES.has(connection.visibility)) errors.push(`Connection ${connection.id} has invalid visibility.`);
  }

  for (const collection of state.collections || []) {
    if (!users.has(collection.ownerUserId)) errors.push(`Collection ${collection.id} references missing owner ${collection.ownerUserId}.`);
    if (!collection.bookEntries || collection.bookEntries.length < 3 || collection.bookEntries.length > 5) {
      errors.push(`Collection ${collection.id} must include 3 to 5 books.`);
    }
    for (const entry of collection.bookEntries || []) {
      if (!books.has(entry.bookId)) errors.push(`Collection ${collection.id} references missing book ${entry.bookId}.`);
    }
    for (const connectionId of collection.connectionIds || []) {
      if (!connections.has(connectionId)) errors.push(`Collection ${collection.id} references missing connection ${connectionId}.`);
    }
    if (!VISIBILITY_VALUES.has(collection.visibility)) errors.push(`Collection ${collection.id} has invalid visibility.`);
  }

  for (const entry of state.unfinishedEntries || []) {
    if (!users.has(entry.userId)) errors.push(`Unfinished entry ${entry.id} references missing user ${entry.userId}.`);
    if (!books.has(entry.bookId)) errors.push(`Unfinished entry ${entry.id} references missing book ${entry.bookId}.`);
    if (!VISIBILITY_VALUES.has(entry.visibility)) errors.push(`Unfinished entry ${entry.id} has invalid visibility.`);
  }

  return { ok: errors.length === 0, errors };
}

export function getCurrentUser(state) {
  return state.users.find((user) => user.isCurrent) || state.users[0];
}

export function getBook(state, bookId) {
  const book = state.books.find((candidate) => candidate.id === bookId);
  if (!book) throw new Error(`Missing book: ${bookId}`);
  return book;
}

export function getUser(state, userId) {
  const user = state.users.find((candidate) => candidate.id === userId);
  if (!user) throw new Error(`Missing user: ${userId}`);
  return user;
}

export function getCollection(state, collectionId) {
  const collection = state.collections.find((candidate) => candidate.id === collectionId);
  if (!collection) throw new Error(`Missing collection: ${collectionId}`);
  return collection;
}

export function getConnection(state, connectionId) {
  const connection = state.connections.find((candidate) => candidate.id === connectionId);
  if (!connection) throw new Error(`Missing connection: ${connectionId}`);
  return connection;
}

export function getProfileGraph(state, userId) {
  const user = getUser(state, userId);
  return {
    user,
    definingBooks: user.definingBookIds.map((bookId) => getBook(state, bookId)),
    reactions: state.reactions.filter((reaction) => reaction.userId === userId),
    collections: state.collections.filter((collection) => collection.ownerUserId === userId),
    connections: state.connections.filter((connection) => connection.authorUserId === userId),
    unfinishedEntries: state.unfinishedEntries.filter((entry) => entry.userId === userId),
  };
}

export function getBookGraph(state, bookId) {
  const book = getBook(state, bookId);
  return {
    book,
    reactions: state.reactions.filter((reaction) => reaction.bookId === bookId),
    readers: state.users.filter((user) => book.readerIds.includes(user.id)),
    connections: state.connections.filter((connection) => connection.sourceBookId === bookId || connection.targetBookId === bookId),
    collections: state.collections.filter((collection) => collection.bookEntries.some((entry) => entry.bookId === bookId)),
  };
}

export function reactToBook(state, userId, bookId, input) {
  const users = byId(state.users);
  const books = byId(state.books);
  assertExists(users, userId, "user");
  assertExists(books, bookId, "book");
  assertVisibility(input.visibility || "public");
  if (!state.reactionLabels.includes(input.label)) {
    throw new Error(`Unknown reaction label: ${input.label}`);
  }
  if (input.note && input.note.length > 160) {
    throw new Error("Reaction note must be 160 characters or fewer.");
  }

  const next = clone(state);
  const existingIndex = next.reactions.findIndex((reaction) => reaction.userId === userId && reaction.bookId === bookId);
  const existing = existingIndex >= 0 ? next.reactions[existingIndex] : null;
  const saved = {
    id: existing?.id || nextId("reaction-custom", next.reactions),
    userId,
    bookId,
    label: input.label,
    rating: input.rating ?? null,
    note: input.note?.trim() || "",
    visibility: input.visibility || "public",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    next.reactions[existingIndex] = saved;
  } else {
    next.reactions.push(saved);
  }

  return normalizeState(next);
}

export function setDefiningBooks(state, userId, bookIds) {
  const users = byId(state.users);
  const books = byId(state.books);
  assertExists(users, userId, "user");
  if (bookIds.length !== 3 || new Set(bookIds).size !== 3) {
    throw new Error("A profile needs exactly three defining books.");
  }
  for (const bookId of bookIds) {
    assertExists(books, bookId, "book");
  }

  const next = clone(state);
  const user = next.users.find((candidate) => candidate.id === userId);
  user.definingBookIds = [...bookIds];
  return normalizeState(next);
}

export function createConnection(state, input) {
  const users = byId(state.users);
  const books = byId(state.books);
  assertExists(users, input.authorUserId, "user");
  assertExists(books, input.sourceBookId, "source book");
  assertExists(books, input.targetBookId, "target book");
  assertVisibility(input.visibility || "public");

  if (input.sourceBookId === input.targetBookId) {
    throw new Error("A connection must link two different books.");
  }
  if (!input.ideaLabel?.trim()) {
    throw new Error("A connection needs an idea label.");
  }
  if (!input.explanation?.trim()) {
    throw new Error("A connection needs a one-sentence explanation.");
  }
  if (input.ideaLabel.length > 60) {
    throw new Error("Idea labels must be 60 characters or fewer.");
  }
  if (input.explanation.length > 220) {
    throw new Error("Connection explanations must be 220 characters or fewer.");
  }

  const next = clone(state);
  next.connections.push({
    id: nextId("connection-custom", next.connections),
    authorUserId: input.authorUserId,
    sourceBookId: input.sourceBookId,
    targetBookId: input.targetBookId,
    ideaLabel: input.ideaLabel.trim(),
    explanation: input.explanation.trim(),
    visibility: input.visibility || "public",
    createdAt: new Date().toISOString(),
  });

  return normalizeState(next);
}

export function listCollectionsForUser(state, userId) {
  return state.collections.filter((collection) => collection.ownerUserId === userId);
}

export function summarizeReactionForBook(state, bookId) {
  const reactions = state.reactions.filter((reaction) => reaction.bookId === bookId);
  const counts = new Map();
  for (const reaction of reactions) {
    counts.set(reaction.label, (counts.get(reaction.label) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .slice(0, 3)
    .map(([label, count]) => ({ label, count }));
}
