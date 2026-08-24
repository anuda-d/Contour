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

test("pinning stays a quiet contextual action instead of permanent Map chrome", () => {
  const positionRule =
    styles.match(/\.detail-actions \[data-position-action\]\s*{([^}]*)}/)?.[1] ?? "";
  const quietPrimaryRule =
    styles.match(/\.detail-actions \[data-position-action\]:first-child\s*{([^}]*)}/)?.[1] ?? "";
  const pinnedNodeRule = styles.match(/\.map-node\.is-pinned\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(positionRule, /grid-column:\s*1 \/ -1/);
  assert.match(positionRule, /white-space:\s*nowrap/);
  assert.match(quietPrimaryRule, /border-color:\s*var\(--line-strong\)/);
  assert.match(quietPrimaryRule, /color:\s*var\(--text\)/);
  assert.match(pinnedNodeRule, /cursor:\s*pointer/);
});

test("Draft publication is a full-width contextual action", () => {
  const publishAction =
    styles.match(/\.detail-actions \[data-publish-draft\]\s*{([^}]*)}/s)?.[1] ?? "";
  assert.match(publishAction, /grid-column:\s*1 \/ -1/);
  assert.match(publishAction, /white-space:\s*nowrap/);
});

test("bridge refinement stays contextual and its choices stack on mobile", () => {
  const connectAction =
    styles.match(/\.detail-actions \[data-connect-draft\]\s*{([^}]*)}/s)?.[1] ?? "";
  const bridgeChoices =
    styles.match(/\.capture-works\.bridge-works\s*{([^}]*)}/s)?.[1] ?? "";
  const mobileBlock = styles.match(/@media \(max-width: 760px\)\s*{([\s\S]*)\n}/)?.[1] ?? "";
  const mobileBridge =
    mobileBlock.match(/\.capture-works\.bridge-works\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(connectAction, /grid-column:\s*1 \/ -1/);
  assert.match(connectAction, /white-space:\s*nowrap/);
  assert.match(bridgeChoices, /repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(mobileBridge, /grid-template-columns:\s*1fr/);
});

test("orbit titles wrap inside their Media silhouettes", () => {
  const titleRule = styles.match(/\.orbit-work strong\s*{([^}]*)}/)?.[1] ?? "";
  const bookRule = styles.match(/\.orbit-book\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(titleRule, /max-width:\s*100%/);
  assert.match(titleRule, /overflow-wrap:\s*break-word/);
  assert.match(bookRule, /width:\s*64px/);
  assert.match(bookRule, /height:\s*86px/);
});

test("visitor profile copy stays readable and return control remains touch sized", () => {
  const profileRule = styles.match(/\.visitor-profile\s*\{([^}]*)\}/)?.[1] ?? "";
  const lineRule =
    styles.match(/\.map-intro \.visitor-profile-line\s*\{([^}]*)\}/)?.[1] ?? "";
  const mobileBlock = styles.match(/@media \(max-width: 760px\)\s*\{([\s\S]*)\n}/)?.[1] ?? "";
  const mobileModeAction = mobileBlock.match(/\.mode-action\s*\{([^}]*)\}/)?.[1] ?? "";
  const mobileProfileCopy =
    mobileBlock.match(
      /\.map-intro \.visitor-profile-handle,\s*\.map-intro \.visitor-profile-line\s*\{([^}]*)\}/,
    )?.[1] ?? "";

  assert.match(profileRule, /display:\s*grid/);
  assert.match(lineRule, /line-height:\s*1\.42/);
  assert.match(mobileModeAction, /min-height:\s*44px/);
  assert.match(mobileProfileCopy, /overflow:\s*visible/);
  assert.match(mobileProfileCopy, /white-space:\s*normal/);
  assert.match(mobileProfileCopy, /text-overflow:\s*clip/);
});

test("private Drafts use the owner-selected semantic zoom treatment", () => {
  const draftMarkRule = styles.match(/\.node-thought\.is-draft \.thought-mark\s*{([^}]*)}/)?.[1] ?? "";
  const draftNoteRule = styles.match(/\.draft-note\s*{([^}]*)}/)?.[1] ?? "";
  const farDraftRule =
    styles.match(/\.map-canvas\[data-zoom-band="far"\][^{]*\.draft-note,[\s\S]*?{([^}]*)}/)?.[1] ?? "";
  const closeDraftRule =
    styles.match(/\.map-canvas\[data-zoom-band="close"\] \.draft-note\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(draftMarkRule, /border:\s*1px solid var\(--accent\)/);
  assert.match(draftMarkRule, /background:\s*transparent/);
  assert.match(draftNoteRule, /text-transform:\s*uppercase/);
  assert.match(farDraftRule, /opacity:\s*0/);
  assert.match(closeDraftRule, /opacity:\s*0/);
});

test("mobile capture and chooser controls keep full-size touch targets", () => {
  const mobileBlock = styles.match(/@media \(max-width: 760px\)\s*{([\s\S]*)\n}/)?.[1] ?? "";
  const backRule = mobileBlock.match(/\.capture-back\s*{([^}]*)}/)?.[1] ?? "";
  const chooserBackRule = mobileBlock.match(/\.chooser-back\s*{([^}]*)}/)?.[1] ?? "";
  const actionRule = mobileBlock.match(/\.capture-actions button\s*{([^}]*)}/)?.[1] ?? "";
  const entryRule = mobileBlock.match(/\.capture-entry\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(backRule, /min-height:\s*44px/);
  assert.match(chooserBackRule, /min-height:\s*44px/);
  assert.match(actionRule, /min-height:\s*44px/);
  assert.match(entryRule, /min-height:\s*44px/);
});

test("the capture sheet owns a bounded scroll viewport", () => {
  const captureRule = styles.match(/\.thought-capture\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(captureRule, /height:\s*100%/);
  assert.match(captureRule, /min-height:\s*0/);
  assert.match(captureRule, /overflow:\s*auto/);
});

test("capture placeholder copy keeps full muted-text contrast", () => {
  const placeholderRule =
    styles.match(/\.capture-form textarea::placeholder\s*{([^}]*)}/)?.[1] ?? "";
  assert.match(placeholderRule, /color:\s*var\(--muted\)/);
  assert.match(placeholderRule, /opacity:\s*1/);
});
