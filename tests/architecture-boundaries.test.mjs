import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

const checker = resolve("scripts/check-import-boundaries.mjs");

function createFixture(files) {
  const root = mkdtempSync(resolve(tmpdir(), "contour-boundaries-"));
  for (const [file, source] of Object.entries(files)) {
    const path = resolve(root, file);
    mkdirSync(resolve(path, ".."), { recursive: true });
    writeFileSync(path, source);
  }
  return root;
}

function runChecker(root) {
  const result = spawnSync(process.execPath, [checker, "--root", root], { encoding: "utf8" });
  return { status: result.status, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

test("architecture boundary check passes the current transition source tree", () => {
  const result = runChecker(process.cwd());
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /Architecture import-boundary check passed/);
});

test("architecture boundary check rejects a product import of a browser adapter", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import { read } from "../../adapters/browser/local-storage.ts";\nexport { read };\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects a template-literal product import of a browser adapter", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": "export const load = () => import(`../../adapters/browser/local-storage.ts`);\n",
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects a dynamic import with options across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'export const load = () => import("../../adapters/browser/local-storage.ts", { with: { type: "json" } });\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects a comment-separated dynamic import across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'export const load = () => import /* deliberate boundary probe */ ("../../adapters/browser/local-storage.ts");\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects an unresolved relative import", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import "../../adapters/browser/missing.ts";\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /imports unresolved source/);
});

test("architecture boundary check rejects a computed dynamic import", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": "const path = \"../../adapters/browser/local-storage.ts\";\nexport const load = () => import(path);\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /dynamic import must use a plain literal specifier/);
});

test("architecture boundary check rejects compact static import and export forms across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import{from as value}from"../../adapters/browser/local-storage.ts";\nimport"../../adapters/browser/local-storage.ts";\nexport{from}from"../../adapters/browser/local-storage.ts";\nexport*from"../../adapters/browser/local-storage.ts";\nexport { value };\n',
    "src/adapters/browser/local-storage.ts": "export const from = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects a Vite root source import across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import { read } from "/src/adapters/browser/local-storage.ts";\nexport { read };\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects TypeScript triple-slash path references across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": '/// <reference path="../../adapters/browser/local-storage.ts" />\nexport const catalogue = true;\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects TypeScript module augmentations across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'export {};\ndeclare module "../../adapters/browser/local-storage.ts" { export interface StoragePort { extra: true } }\n',
    "src/adapters/browser/local-storage.ts": "export type StoragePort = { get: () => string | null };\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check ignores import-like prose inside a string", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const loader = { import: (path) => path };\nconst pattern = /import(path)/;\nexport const label = "call import(path) lazily";\nexport const path = loader.import(pattern);\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 0, result.output);
});

test("architecture boundary check rejects escaped and template-interpolated source imports", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import "\\u002e\\u002e/\\u002e\\u002e/adapters/browser/local-storage.ts";\nexport const load = () => `${import("../../adapters/browser/local-storage.ts")}`;\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects CommonJS source files and scans JSX TypeScript", () => {
  const root = createFixture({
    "src/product/catalog/catalog.cts": 'const storage = require("../../adapters/browser/local-storage.ts");\nexport = storage;\n',
    "src/product/taste/view.tsx": 'import { read } from "../../adapters/browser/local-storage.ts";\nexport { read };\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /CommonJS source files are not permitted/);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects TypeScript type-only module dependencies", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'export type { StoragePort } from "../../adapters/browser/local-storage.ts";\nexport type * from "../../adapters/browser/local-storage.ts";\ntype DeferredPort = import("../../adapters/browser/local-storage.ts").StoragePort;\nexport type { DeferredPort };\n',
    "src/adapters/browser/local-storage.ts": "export type StoragePort = { get: () => string | null };\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects TypeScript import-equals dependencies", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import StoragePort = require("../../adapters/browser/local-storage.ts");\nexport = StoragePort;\n',
    "src/adapters/browser/local-storage.ts": "export type StoragePort = { get: () => string | null };\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check permits TypeScript assertions and locally shadowed require calls", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const value = <string>unknown;\nfunction localVar() { if (value) { var require = (path) => path; } return require(value); }\nfor (const require = (path) => path; value; ) { require(value); break; }\nexport const local = localVar();\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 0, result.output);
});

test("architecture boundary check rejects an unshadowed CommonJS require across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const storage = require("../../adapters/browser/local-storage.ts");\nexport { storage };\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /unshadowed CommonJS require calls are not permitted/);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects module.require and ambient TypeScript require dependencies", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'declare const require: (path: string) => unknown;\nconst storage = require("../../adapters/browser/local-storage.ts");\nconst moduleStorage = module.require("../../adapters/browser/local-storage.ts");\nexport { storage, moduleStorage };\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /unshadowed CommonJS require calls are not permitted/);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check rejects an unshadowed CommonJS require even when its layer target is allowed", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const kernel = require("../../kernel/index.ts");\nexport { kernel };\n',
    "src/kernel/index.ts": "export const result = true;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /unshadowed CommonJS require calls are not permitted/);
});

test("architecture boundary check rejects CommonJS export assignments", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": "module.exports = {};\nexports.value = true;\nmodule[\"exports\"] = {};\nmodule.exports.value = true;\nObject.assign(exports, { value: true });\nObject.defineProperty(exports, \"value\", { value: true });\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /CommonJS export assignments are not permitted/);
});

test("architecture boundary check permits locally shadowed CommonJS names in runtime calls", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const exports = {};\nconst module = { require: (path) => path };\nconst require = (path) => path;\nObject.defineProperty(exports, "value", { value: true });\nexport const storage = module.require(require("local-storage"));\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 0, result.output);
});

test("architecture boundary check keeps method-local CommonJS names out of outer scopes", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'class LocalNames { method() { var require = (path) => path; var module = {}; var exports = {}; return [require, module, exports]; } }\nconst kernel = require("../../kernel/index.ts");\nmodule.exports = { kernel, LocalNames };\n',
    "src/kernel/index.ts": "export const result = true;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /unshadowed CommonJS require calls are not permitted/);
  assert.match(result.output, /CommonJS export assignments are not permitted/);
});

test("architecture boundary check keeps catch-block var require in its function scope", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const value = <string>unknown;\nfunction localCatch() { try { throw value; } catch { var require = (path) => path; } return require(value); }\nexport const local = localCatch();\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 0, result.output);
});

test("architecture boundary check respects lexical CommonJS-name bindings in advanced scopes", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const value = <string>unknown;\nswitch (value) { default: { const require = (path) => path; require(value); } }\nclass StaticBlock { static { const require = (path) => path; require(value); } }\nclass ParameterProperty { constructor(private require: (path: string) => string) { require(value); } }\nconst Named = class require { static value = require; };\nexport const require = (path) => path;\nexport const local = require(value);\nexport { StaticBlock, ParameterProperty, Named };\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 0, result.output);
});

test("architecture boundary check rejects optional CommonJS require calls", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'const kernel = require?.("../../kernel/index.ts");\nexport { kernel };\n',
    "src/kernel/index.ts": "export const result = true;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /unshadowed CommonJS require calls are not permitted/);
});

test("architecture boundary check rejects Vite import-meta glob loading", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'export const adapters = import.meta.glob("../../adapters/browser/*.ts", { eager: true });\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /import.meta.glob is not permitted/);
});

test("architecture boundary check rejects Vite worker URL dependencies across a boundary", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'export const worker = new Worker(new URL("../../adapters/browser/local-storage.ts", import.meta.url), { type: "module" });\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /product -> adapters import is forbidden/);
});

test("architecture boundary check validates legacy import resolution before exempting direction", () => {
  const root = createFixture({
    "src/app.js": 'import "./missing.js";\n',
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /imports unresolved source/);
});

test("architecture boundary check rejects the migrated top-level Draft-state path", () => {
  const root = createFixture({
    "src/draft-state.js": "export const stale = true;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /source file is not assigned to a permitted layer/);
});

test("architecture boundary check rejects a directory import without an index source file", () => {
  const root = createFixture({
    "src/product/catalog/catalog.ts": 'import "../../adapters/browser";\n',
    "src/adapters/browser/local-storage.ts": "export const read = () => null;\n",
  });
  const result = runChecker(root);
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /imports unresolved source/);
});
