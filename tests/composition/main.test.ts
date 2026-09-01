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

test("the composition root wires authored timestamps and UUIDs through browser effect ports", () => {
  const source = readFileSync(resolve("src/composition/main.ts"), "utf8");

  assert.match(source, /import type \{ ClockPort \} from "\.\.\/kernel\/clock\.ts"/);
  assert.match(source, /import type \{ IdentifierPort \} from "\.\.\/kernel\/identifier\.ts"/);
  assert.match(source, /import \{ browserClock \} from "\.\.\/adapters\/browser\/browser-clock\.ts"/);
  assert.match(source, /import \{ browserIdentifier \} from "\.\.\/adapters\/browser\/browser-identifier\.ts"/);
  assert.match(source, /const clock: ClockPort = browserClock;/);
  assert.match(source, /const identifier: IdentifierPort = browserIdentifier;/);
  assert.match(source, /id: `draft-\$\{identifier\.randomUuid\(\)\}`/);
  assert.match(source, /createdAt: clock\.now\(\),/);
  assert.match(source, /publishDraft\(\s*\n\s*draftState,\s*\n\s*id,\s*\n\s*clock\.now\(\),/);
  assert.doesNotMatch(source, /crypto\.randomUUID\(\)/);
  assert.doesNotMatch(source, /new Date\(\)\.toISOString\(\)/);
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
