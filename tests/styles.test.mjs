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

const compositeHex = (foreground, background, opacity) => {
  const channels = [foreground, background].map((hex) =>
    hex
      .slice(1)
      .match(/.{2}/g)
      .map((channel) => Number.parseInt(channel, 16)),
  );
  return `#${channels[0]
    .map((channel, index) =>
      Math.round(channel * opacity + channels[1][index] * (1 - opacity))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

test("primary coral actions retain readable text in both themes", () => {
  const lightRoot = styles.match(/:root\s*{([^}]*)}/s)?.[1] ?? "";
  const darkRoot =
    styles.match(/@media \(prefers-color-scheme: dark\)\s*{\s*:root\s*{([^}]*)}/s)?.[1] ?? "";
  const chooserRule = styles.match(/\.chooser-continue\s*{([^}]*)}/s)?.[1] ?? "";
  const detailPrimaryRule =
    styles.match(/\.detail-actions button:first-child\s*{([^}]*)}/s)?.[1] ?? "";
  const orbitFormatRule = styles.match(/\.orbit-work span\s*{([^}]*)}/s)?.[1] ?? "";
  const orbitFormatOpacity = Number.parseFloat(
    orbitFormatRule.match(/opacity:\s*([\d.]+)/)?.[1] ?? "0",
  );

  assert.match(chooserRule, /color:\s*var\(--accent-contrast\)/);
  assert.match(detailPrimaryRule, /color:\s*var\(--accent-contrast\)/);
  assert.ok(orbitFormatOpacity >= 0.72);
  assert.ok(
    contrastRatio(readVariable(lightRoot, "accent"), readVariable(lightRoot, "accent-contrast")) >=
      4.5,
  );
  assert.ok(
    contrastRatio(readVariable(darkRoot, "accent"), readVariable(darkRoot, "accent-contrast")) >=
      4.5,
  );
  for (const theme of [lightRoot, darkRoot]) {
    for (const format of ["book", "film"]) {
      const background = readVariable(theme, format);
      const ink = readVariable(theme, `${format}-ink`);
      assert.ok(contrastRatio(background, compositeHex(ink, background, orbitFormatOpacity)) >= 4.5);
    }
  }
});

test("the Map canvas clips without becoming a focus-scroll container", () => {
  const canvasRule = styles.match(/\.map-canvas\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(canvasRule, /overflow:\s*clip/);
});

test("mobile contextual actions keep full-size touch targets", () => {
  const mobileBlock = styles.match(/@media \(max-width: 760px\)\s*{([\s\S]*)\n}/)?.[1] ?? "";
  const detailActionRule =
    mobileBlock.match(/\.detail-actions button\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(detailActionRule, /min-height:\s*44px/);
});

test("orbit titles wrap inside their Media silhouettes", () => {
  const titleRule = styles.match(/\.orbit-work strong\s*{([^}]*)}/)?.[1] ?? "";
  const bookRule = styles.match(/\.orbit-book\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(titleRule, /max-width:\s*100%/);
  assert.match(titleRule, /overflow-wrap:\s*break-word/);
  assert.match(bookRule, /width:\s*64px/);
  assert.match(bookRule, /height:\s*86px/);
});
