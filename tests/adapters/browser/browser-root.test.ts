import assert from "node:assert/strict";
import test from "node:test";
import { getBrowserRoot } from "../../../src/adapters/browser/browser-root.ts";

test("browser root acquisition returns the matching root unchanged", () => {
  const root = {} as HTMLElement;
  const browser = {
    querySelector: (selector: string) => {
      assert.equal(selector, "#app");
      return root;
    },
  } as Pick<Document, "querySelector">;

  assert.strictEqual(getBrowserRoot(browser), root);
});

test("browser root acquisition preserves the missing-root startup failure", () => {
  const browser = {
    querySelector: () => null,
  } as Pick<Document, "querySelector">;

  assert.throws(
    () => getBrowserRoot(browser),
    new Error("Expected application root."),
  );
});
