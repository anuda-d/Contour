import assert from "node:assert/strict";
import test from "node:test";
import { browserClock } from "../../../src/adapters/browser/browser-clock.ts";

test("the browser clock produces canonical ISO timestamps", () => {
  const timestamp = browserClock.now();

  assert.equal(new Date(timestamp).toISOString(), timestamp);
});
