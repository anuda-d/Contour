import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

test("pressing a node cannot replace its spatial placement transform", () => {
  const rules = [...styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const activeNodeRules = rules.filter(([, selectors]) =>
    selectors
      .split(",")
      .map((selector) => selector.trim())
      .includes(".map-node:active"),
  );

  assert.ok(activeNodeRules.length > 0, "expected an explicit pressed state for Map nodes");
  activeNodeRules.forEach(([, , declarations]) => {
    assert.doesNotMatch(
      declarations,
      /(^|;)\s*transform\s*:/,
      "the pressed state must not override the transform that positions the node",
    );
  });
});
