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

const readVariable = (block, name) =>
  block.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];

const relativeLuminance = (hex) => {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (first, second) => {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  );
  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
};

test("primary coral actions retain readable text in both themes", () => {
  const lightRoot = styles.match(/:root\s*{([^}]*)}/s)?.[1] ?? "";
  const darkRoot =
    styles.match(/@media \(prefers-color-scheme: dark\)\s*{\s*:root\s*{([^}]*)}/s)?.[1] ?? "";
  const chooserRule = styles.match(/\.chooser-continue\s*{([^}]*)}/s)?.[1] ?? "";

  assert.match(chooserRule, /color:\s*var\(--accent-contrast\)/);
  assert.ok(
    contrastRatio(readVariable(lightRoot, "accent"), readVariable(lightRoot, "accent-contrast")) >=
      4.5,
  );
  assert.ok(
    contrastRatio(readVariable(darkRoot, "accent"), readVariable(darkRoot, "accent-contrast")) >=
      4.5,
  );
});
