import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const chooserSource = await readFile(
  new URL("../../src/ui/work-chooser.dom.ts", import.meta.url),
  "utf8",
);

test("private chooser source contract keeps selected-work, search, and escaped catalogue rendering", () => {
  assert.match(chooserSource, /Your choices stay private until you write and publish a Thought\./);
  assert.match(chooserSource, /this\.state\.selectedMediaIds/);
  assert.match(chooserSource, /this\.query\.trim\(\)\.toLowerCase\(\)/);
  assert.match(chooserSource, /No matching work in this prototype catalogue\./);
  assert.match(chooserSource, /aria-label="Selected works"/);
  assert.match(chooserSource, /escapeHtml\(item\.title\)/);
  assert.match(chooserSource, /escapeHtml\(this\.message \|\| defaultMessage\)/);
});

test("chooser source contract delegates selection and confirmation policy through opaque callbacks", () => {
  assert.match(chooserSource, /type WorkChooserOptions =/);
  assert.match(chooserSource, /onToggle: \(id: string\) => ToggleResult/);
  assert.match(chooserSource, /onConfirm: \(\) => ConfirmResult/);
  assert.match(chooserSource, /const result = this\.options\.onToggle\(id\)/);
  assert.match(chooserSource, /this\.state = result\.state/);
  assert.match(chooserSource, /this\.message = result\.message/);
  assert.match(chooserSource, /if \(result\.confirmed\) this\.close\(\)/);
  assert.doesNotMatch(chooserSource, /from "\.\.\/product\//);
  assert.doesNotMatch(chooserSource, /from "\.\.\/adapters\//);
});

test("chooser source contract preserves modal inertness, keyboard trapping, and restored focus", () => {
  assert.match(chooserSource, /requiredShellElement\("\.topbar"\)\.inert = true/);
  assert.match(chooserSource, /requiredShellElement\("\.map-page"\)\.inert = true/);
  assert.match(chooserSource, /input\.setSelectionRange\(input\.value\.length, input\.value\.length\)/);
  assert.match(chooserSource, /event\.key === "Escape"/);
  assert.match(chooserSource, /event\.key !== "Tab"/);
  assert.match(chooserSource, /button:not\(\[disabled\]\), input/);
  assert.match(chooserSource, /this\.options\.restoreFocus\(\)/);
  assert.match(chooserSource, /requiredShellElement\("\.topbar"\)\.inert = false/);
  assert.match(chooserSource, /requiredShellElement\("\.map-page"\)\.inert = false/);
});
