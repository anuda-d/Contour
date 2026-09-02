import assert from "node:assert/strict";
import test from "node:test";
import { browserClock } from "../../../src/adapters/browser/browser-clock.ts";

test("the browser clock produces canonical ISO timestamps", () => {
  const timestamp = browserClock.now();

  assert.equal(new Date(timestamp).toISOString(), timestamp);
});

test("the browser clock produces a finite current millisecond value", () => {
  assert.ok(Number.isFinite(browserClock.nowMilliseconds()));
});
