import assert from "node:assert/strict";
import test from "node:test";
import { browserIdentifier } from "../../../src/adapters/browser/browser-identifier.ts";

test("the browser identifier produces UUID values", () => {
  const identifier = browserIdentifier.randomUuid();

  assert.match(identifier, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
