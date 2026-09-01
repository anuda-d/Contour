import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const storageAdapters = [
  "authored-local-storage.ts",
  "featured-local-storage.ts",
  "pinned-local-storage.ts",
  "selection-local-storage.ts",
];

test("current browser-storage adapters depend on the shared kernel storage port", () => {
  storageAdapters.forEach((adapter) => {
    const source = readFileSync(resolve("src/adapters/browser", adapter), "utf8");

    assert.match(source, /import type \{ KeyValueStoragePort \} from "\.\.\/\.\.\/kernel\/key-value-storage\.ts"/);
    assert.match(source, /storage:\s*KeyValueStoragePort\s*[|,)]/);
    assert.doesNotMatch(source, /Pick<Storage/);
    assert.doesNotMatch(source, /(?:export\s+)?type\s+(?:Browser|Selection|Featured|Pinned)Storage\b/);
  });
});
