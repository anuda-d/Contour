import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  parseThoughtCaptureFormSnapshot,
  submitThoughtCaptureFormSnapshot,
} from "../../src/ui/thought-capture.dom.ts";

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

test("Thought Capture validates the form snapshot before its opaque save callback", () => {
  assert.match(captureSource, /submitThoughtCaptureFormSnapshot\(/);
  assert.match(captureSource, /this\.options\.onSave,/);
  assert.match(captureSource, /if \(!result\) return/);
  assert.match(captureSource, /Save private bridge/);
  assert.match(captureSource, /The bridge stays private until you publish it\./);
});

const workIds = new Set(["book-a", "film-b", "book-c"]);

test("valid create, edit, and bridge snapshots retain the existing callback input shape", () => {
  assert.deepEqual(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: null, statement: "A private thought." },
      workIds,
      false,
    ),
    { primaryMediaId: "book-a", secondaryMediaId: null, statement: "A private thought." },
  );
  assert.deepEqual(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "film-b", secondaryMediaId: "book-c", statement: "A bridge." },
      workIds,
      true,
    ),
    { primaryMediaId: "film-b", secondaryMediaId: "book-c", statement: "A bridge." },
  );
});

test("malformed form snapshots cannot cross the Thought Capture adapter boundary", () => {
  assert.equal(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "unknown", secondaryMediaId: null, statement: "A private thought." },
      workIds,
      false,
    ),
    null,
  );
  assert.equal(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: "unknown", statement: "A bridge." },
      workIds,
      true,
    ),
    null,
  );
  assert.equal(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: "book-a", statement: "A bridge." },
      workIds,
      true,
    ),
    null,
  );
  assert.equal(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: "film-b", statement: "Not a bridge." },
      workIds,
      false,
    ),
    null,
  );
  assert.equal(
    parseThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: null, statement: null },
      workIds,
      false,
    ),
    null,
  );
});

test("the submit boundary forwards valid input exactly once and rejects malformed input before onSave", () => {
  const savedInputs: unknown[] = [];
  const onSave = (input: {
    draftId: string | null;
    primaryMediaId: string;
    secondaryMediaId: string | null;
    statement: string;
  }) => {
    savedInputs.push(input);
    return { saved: true as const };
  };

  assert.deepEqual(
    submitThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: null, statement: "A private thought." },
      workIds,
      false,
      null,
      onSave,
    ),
    { saved: true },
  );
  assert.deepEqual(
    submitThoughtCaptureFormSnapshot(
      { primaryMediaId: "film-b", secondaryMediaId: "book-c", statement: "A bridge." },
      workIds,
      true,
      "draft-1",
      onSave,
    ),
    { saved: true },
  );
  assert.deepEqual(savedInputs, [
    {
      draftId: null,
      primaryMediaId: "book-a",
      secondaryMediaId: null,
      statement: "A private thought.",
    },
    {
      draftId: "draft-1",
      primaryMediaId: "film-b",
      secondaryMediaId: "book-c",
      statement: "A bridge.",
    },
  ]);

  assert.equal(
    submitThoughtCaptureFormSnapshot(
      { primaryMediaId: "book-a", secondaryMediaId: "book-a", statement: "Tampered bridge." },
      workIds,
      true,
      "draft-1",
      onSave,
    ),
    null,
  );
  assert.equal(savedInputs.length, 2);
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
