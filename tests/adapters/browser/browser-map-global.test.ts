import assert from "node:assert/strict";
import test from "node:test";
import { publishBrowserThoughtMap } from "../../../src/adapters/browser/browser-map-global.ts";

test("browser Map global publication exposes the exact current Map", () => {
  const priorMap = { version: "prior" };
  const currentMap = { version: "current" };
  const browser = { thoughtMap: priorMap };

  publishBrowserThoughtMap(browser, currentMap);

  assert.strictEqual(browser.thoughtMap, currentMap);
});
