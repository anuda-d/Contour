import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("the native browser entrypoint loads the strict TypeScript composition root", () => {
  const entrypoint = readFileSync(resolve("index.html"), "utf8");

  assert.equal(existsSync(resolve("src/composition/main.ts")), true);
  assert.equal(existsSync(resolve("src/app.js")), false);
  assert.match(
    entrypoint,
    /<script type="module" src="\.\/src\/composition\/main\.ts\?v=editorial-constellation-15"><\/script>/,
  );
  assert.doesNotMatch(entrypoint, /src\/app\.js/);
});

test("the composition root wires authored capture effects through browser ports", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(source, /import type \{ ClockPort \} from "\.\.\/kernel\/clock\.ts"/);
  assert.match(source, /import type \{ IdentifierPort \} from "\.\.\/kernel\/identifier\.ts"/);
  assert.match(source, /import \{ browserClock \} from "\.\.\/adapters\/browser\/browser-clock\.ts"/);
  assert.match(source, /import \{ browserIdentifier \} from "\.\.\/adapters\/browser\/browser-identifier\.ts"/);
  assert.match(source, /const clock: ClockPort = browserClock;/);
  assert.match(source, /const identifier: IdentifierPort = browserIdentifier;/);
  assert.match(source, /import \{ saveAuthoredDraft \} from "\.\.\/application\/authorship\/save-authored-draft\.ts"/);
  assert.match(source, /kind: "create",[\s\S]*?clock,[\s\S]*?identifier,/);
  assert.match(source, /map = new ThoughtMap\(root, graph, \{[\s\S]*?clock,/);
  assert.match(source, /publishAuthoredThought\(\s*\n\s*draftState,\s*\n\s*id,\s*\n\s*validCatalogueIds,\s*\n\s*clock,/);
  assert.doesNotMatch(source, /crypto\.randomUUID\(\)/);
  assert.doesNotMatch(source, /new Date\(\)\.toISOString\(\)/);
});

test("the composition root delegates authored capture mutation and persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(source, /const authoredThoughtPersistence = createAuthoredThoughtPersistencePort\(storage, validCatalogueIds\);/);
  assert.match(source, /const result = saveAuthoredDraft\([\s\S]*?kind: "create"/);
  assert.match(source, /kind: "edit", id: editingId, statement/);
  assert.match(source, /kind: "bridge",[\s\S]*?statementAtOpen: draft\.statement,/);
  assert.match(source, /activeMap\(\)\.updateGraph\(graph, \{ focusId: result\.draft\.id, message: result\.message \}\);/);
  assert.match(source, /activeMap\(\)\.updateGraph\(graph, \{ selectId: result\.draft\.id, message: result\.message \}\);/);

  const captureCallbacks = source.match(
    /const openCapture =[\s\S]*?\n  const openBridge =[\s\S]*?\n  if \(!graph\.nodes\.length\)/,
  )?.[0] ?? "";
  assert.doesNotMatch(captureCallbacks, /createDraft\(/);
  assert.doesNotMatch(captureCallbacks, /editDraft\(/);
  assert.doesNotMatch(captureCallbacks, /connectDraft\(/);
  assert.doesNotMatch(captureCallbacks, /persistDraftState\(/);
  assert.doesNotMatch(captureCallbacks, /clock\.now\(/);
  assert.doesNotMatch(captureCallbacks, /identifier\.randomUuid\(/);
});

test("the composition root acquires browser storage through its outward adapter", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ getBrowserKeyValueStorage \} from "\.\.\/adapters\/browser\/browser-local-storage\.ts"/,
  );
  assert.match(source, /const storage: KeyValueStoragePort \| null = getBrowserKeyValueStorage\(window\);/);
  assert.doesNotMatch(source, /window\.localStorage/);
});

test("the composition root acquires the browser root through its outward adapter", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ getBrowserRoot \} from "\.\.\/adapters\/browser\/browser-root\.ts"/,
  );
  assert.match(source, /const root = getBrowserRoot\(document\);/);
  assert.doesNotMatch(source, /document\.querySelector/);
});

test("the composition root publishes its Map debug handle through a browser adapter", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ publishBrowserThoughtMap \} from "\.\.\/adapters\/browser\/browser-map-global\.ts"/,
  );
  assert.match(source, /publishBrowserThoughtMap\(window, map\);/);
  assert.doesNotMatch(source, /window\.thoughtMap\s*=/);

  const construction = source.indexOf("map = new ThoughtMap(");
  const publication = source.indexOf("publishBrowserThoughtMap(window, map);");
  const storageSubscription = source.indexOf("storageChanges.onChange(THOUGHT_STORAGE_KEY, () => {");

  assert.ok(construction >= 0);
  assert.ok(publication > construction);
  assert.ok(storageSubscription > publication);
});

test("the composition root wires authored storage changes through a browser event port", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(source, /import type \{ StorageChangePort \} from "\.\.\/kernel\/storage-change\.ts"/);
  assert.match(source, /import \{ createBrowserStorageChangePort \} from "\.\.\/adapters\/browser\/browser-storage-change\.ts"/);
  assert.match(source, /import \{ reloadAuthoredThoughts \} from "\.\.\/application\/authorship\/reload-authored-thoughts\.ts"/);
  assert.match(source, /createAuthoredThoughtReloadPort\(storage, validCatalogueIds\)/);
  assert.match(source, /const storageChanges: StorageChangePort = createBrowserStorageChangePort\(window\);/);
  assert.match(source, /storageChanges\.onChange\(THOUGHT_STORAGE_KEY, \(\) => \{/);
  assert.match(source, /const synced = reloadAuthoredThoughts\(baseGraph, authoredThoughts\);/);
  assert.match(source, /if \(synced\.kind === "storage-unavailable"\) return;/);
  assert.match(source, /activeMap\(\)\.updateGraph\(graph, \{ message: synced\.message \}\);/);
  assert.doesNotMatch(source, /window\.addEventListener\("storage"/);
});

test("the composition root wires Map resize listening through a browser event port", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(source, /import type \{ ResizeEventPort \} from "\.\.\/kernel\/resize-event\.ts"/);
  assert.match(source, /import \{ createBrowserResizeEventPort \} from "\.\.\/adapters\/browser\/browser-resize-event\.ts"/);
  assert.match(source, /const resizeEvents: ResizeEventPort = createBrowserResizeEventPort\(window\);/);
  assert.match(source, /map = new ThoughtMap\(root, graph, \{[\s\S]*?resizeEvents,/);
});

test("the composition root delegates selection mutation and persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{\s*createSelectionPersistencePort,\s*createSelectionRecoveryPersistencePort,\s*loadSelection,\s*\} from "\.\.\/adapters\/browser\/selection-local-storage\.ts"/,
  );
  assert.match(
    source,
    /import \{\s*confirmSelection,\s*toggleSelection,\s*\} from "\.\.\/application\/taste\/update-selection\.ts"/,
  );
  assert.match(source, /const selectionPersistence = createSelectionPersistencePort\(storage\);/);
  assert.match(source, /const result = toggleSelection\(selectionState, id, validCatalogueIds, selectionPersistence\);/);
  assert.match(source, /const result = confirmSelection\(selectionState, selectionPersistence\);/);
  assert.match(source, /if \(result\.saved !== null\) \{\s*persistent = result\.saved;\s*map\?\.updateSelectionState\(selectionState\);/);
  assert.doesNotMatch(source, /toggleMediaSelection\(/);
  assert.doesNotMatch(source, /saveSelection\(/);
});

test("the composition root delegates selection startup recovery persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ recoverSelection \} from "\.\.\/application\/taste\/recover-selection\.ts"/,
  );
  assert.match(
    source,
    /createSelectionRecoveryPersistencePort,/
  );
  assert.match(source, /const selectionRecoveryPersistence = createSelectionRecoveryPersistencePort\(storage\);/);
  assert.match(
    source,
    /if \(loaded\.recovered && loaded\.persistent\) \{\s*const recoveredSelection = recoverSelection\(selectionState, selectionRecoveryPersistence\);\s*selectionState = recoveredSelection\.state;\s*persistent = recoveredSelection\.saved;\s*\}/,
  );
  assert.doesNotMatch(source, /selectionPersistence\.save\(selectionState\)/);
});

test("the composition root delegates featured mutation and persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{\s*createFeaturedPersistencePort,\s*createFeaturedRecoveryPersistencePort,\s*loadFeaturedState,\s*\} from "\.\.\/adapters\/browser\/featured-local-storage\.ts"/,
  );
  assert.match(
    source,
    /import \{ toggleFeatured \} from "\.\.\/application\/taste\/update-featured\.ts"/,
  );
  assert.match(source, /const featuredPersistence = createFeaturedPersistencePort\(storage\);/);
  assert.match(
    source,
    /const result = toggleFeatured\(\s*featuredState,\s*id,\s*publicMediaIds,\s*typeof media\?\.title === "string" \? media\.title : "This work",\s*featuredPersistence,\s*\);/,
  );
  assert.match(source, /featuredMessage = result\.message;/);
  assert.doesNotMatch(source, /toggleFeaturedMedia\(/);
  assert.doesNotMatch(source, /saveFeaturedState\(/);
});

test("the composition root delegates featured startup recovery persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ recoverFeatured \} from "\.\.\/application\/taste\/recover-featured\.ts"/,
  );
  assert.match(source, /createFeaturedRecoveryPersistencePort,/);
  assert.match(
    source,
    /const featuredRecoveryPersistence = createFeaturedRecoveryPersistencePort\(storage\);/,
  );
  assert.match(
    source,
    /if \(loadedFeatured\.recovered && loadedFeatured\.persistent\) \{\s*const recoveredFeatured = recoverFeatured\(featuredState, featuredRecoveryPersistence\);\s*featuredState = recoveredFeatured\.state;\s*if \(!recoveredFeatured\.saved\) \{\s*featuredMessage = "Unavailable featured works were removed\. Changes will last for this visit\.";/,
  );
  assert.doesNotMatch(source, /featuredPersistence\.save\(featuredState\)/);
});

test("the composition root delegates pinned-position mutation and persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{\s*createPinnedPositionPersistencePort,\s*loadPinnedState,\s*\} from "\.\.\/adapters\/browser\/pinned-local-storage\.ts"/,
  );
  assert.match(
    source,
    /import \{\s*pinPosition,\s*unpinPosition,\s*\} from "\.\.\/application\/map\/update-pinned-positions\.ts"/,
  );
  assert.match(source, /const pinnedPersistence = createPinnedPositionPersistencePort\(storage\);/);
  assert.match(source, /pinnedPersistence\.save\(pinnedState\);/);
  assert.match(
    source,
    /const result = pinPosition\(pinnedState, id, position, pinnableIds\(\), pinnedPersistence\);/,
  );
  assert.match(source, /const result = unpinPosition\(pinnedState, id, pinnedPersistence\);/);
  assert.doesNotMatch(source, /from "\.\.\/product\/map\/pinned-positions\.ts"/);
  assert.doesNotMatch(source, /savePinnedState\(/);
});

test("the composition root delegates authored publication and persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ publishAuthoredThought \} from "\.\.\/application\/authorship\/publish-authored-thought\.ts"/,
  );
  assert.match(
    source,
    /const authoredThoughtPersistence = createAuthoredThoughtPersistencePort\(storage, validCatalogueIds\);/,
  );
  assert.match(
    source,
    /onPublishDraft: \(id\) => \{\s*const result = publishAuthoredThought\(\s*draftState,\s*id,\s*validCatalogueIds,\s*clock,\s*authoredThoughtPersistence,\s*\);/,
  );
  assert.match(source, /activeMap\(\)\.updateGraph\(graph, \{ selectId: id, message: draftMessage \}\);/);

  const publishCallback = source.match(
    /onPublishDraft: \(id\) => \{([\s\S]*?)\n\s*\},\n\s*onToggleFeatured:/,
  )?.[1] ?? "";
  assert.doesNotMatch(publishCallback, /publishDraft\(/);
  assert.doesNotMatch(publishCallback, /persistDraftState\(/);
  assert.doesNotMatch(publishCallback, /clock\.now\(/);
});

test("the composition root delegates authored startup recovery persistence to the application use case", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(
    source,
    /import \{ recoverAuthoredThoughts \} from "\.\.\/application\/authorship\/recover-authored-thoughts\.ts"/,
  );
  assert.match(source, /createAuthoredThoughtRecoveryPersistencePort\(\s*storage,\s*validCatalogueIds,\s*\)/);
  assert.match(
    source,
    /const persistedDrafts = recoverAuthoredThoughts\(\s*draftState,\s*authoredThoughtRecoveryPersistence,\s*\);/,
  );
  assert.doesNotMatch(source, /persistDraftState\(/);
});
