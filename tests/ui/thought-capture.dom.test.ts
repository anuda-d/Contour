import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const captureSource = await readFile(
  new URL("../../src/ui/thought-capture.dom.ts", import.meta.url),
  "utf8",
);

test("bridge refinement keeps the primary work fixed and labels the second-work choice", () => {
  assert.match(captureSource, /this\.draft\?\.primaryMediaId/);
  assert.match(captureSource, /Choose another work to connect/);
  assert.match(captureSource, /name="secondary-media"/);
  assert.match(captureSource, /work\.id !== this\.selectedMediaId/);
  assert.match(captureSource, /What do these works make visible together\?/);
});

test("bridge refinement submits human-authored meaning and one secondary anchor", () => {
  assert.match(captureSource, /secondaryMediaId: this\.options\.bridgeMode \? this\.selectedSecondaryMediaId : null/);
  assert.match(captureSource, /statement: this\.statement/);
  assert.match(captureSource, /Save private bridge/);
  assert.match(captureSource, /The bridge stays private until you publish it\./);
});

test("later private text editing keeps both bridge works visible and the shared-meaning prompt", () => {
  assert.match(captureSource, /this\.hasBridge = Boolean\(this\.draft\?\.secondaryMediaId\)/);
  assert.match(captureSource, /Refine what connects them\./);
  assert.match(captureSource, /Connected with/);
  assert.match(captureSource, /this\.options\.bridgeMode \|\| this\.hasBridge/);
});

test("the existing dialog focus trap and cancel restoration remain shared", () => {
  assert.match(captureSource, /event\.key === "Escape"/);
  assert.match(captureSource, /event\.key !== "Tab"/);
  assert.match(captureSource, /this\.options\.restoreFocus\(\)/);
});
