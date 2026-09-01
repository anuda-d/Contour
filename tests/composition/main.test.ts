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
