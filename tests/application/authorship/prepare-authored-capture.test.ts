import assert from "node:assert/strict";
import test from "node:test";
import {
  prepareAuthoredCapture,
  type AuthoredCaptureIntent,
} from "../../../src/application/authorship/prepare-authored-capture.ts";
import type { DraftThought, ThoughtState } from "../../../src/product/authorship/draft-state.ts";
import { getCatalogue } from "../../../src/product/catalogue/catalogue.ts";
import type { SelectionState } from "../../../src/product/taste/selection.ts";

const draft: DraftThought = {
  id: "draft-one",
  status: "draft",
  primaryMediaId: "left-hand",
  statement: "Language changes what we can recognize.",
  createdAt: "2026-09-06T23:00:00.000Z",
};
const state: ThoughtState = { version: 2, thoughts: [draft] };
const selection: SelectionState = {
  version: 1,
  confirmed: true,
  selectedMediaIds: ["arrival", "left-hand", "bluets"],
};
const catalogue = getCatalogue();

test("creation offers confirmed private selections in their chosen order", () => {
  const result = prepareAuthoredCapture(state, selection, catalogue, { kind: "create" });

  assert.equal(result.kind, "create");
  if (result.kind !== "create") return;
  assert.equal(result.draft, null);
  assert.deepEqual(result.works.map((work) => work.id), ["arrival", "left-hand", "bluets"]);
  assert.deepEqual(result.works, [catalogue[3], catalogue[0], catalogue[2]]);
});

test("creation stays unavailable without confirmation or any resolvable selected work", () => {
  for (const selected of [
    { ...selection, confirmed: false },
    { ...selection, selectedMediaIds: [] },
    { ...selection, selectedMediaIds: ["missing"] },
  ]) {
    assert.deepEqual(
      prepareAuthoredCapture(state, selected, catalogue, { kind: "create" }),
      { kind: "unavailable" },
    );
  }
});

test("editing uses the existing anchors even when selection is unconfirmed or unrelated", () => {
  for (const existing of [draft, { ...draft, secondaryMediaId: "arrival" }]) {
    const result = prepareAuthoredCapture(
      { version: 2, thoughts: [existing] },
      { ...selection, confirmed: false, selectedMediaIds: ["bluets"] },
      catalogue,
      { kind: "edit", id: draft.id },
    );

    assert.equal(result.kind, "edit");
    if (result.kind !== "edit") continue;
    assert.deepEqual(result.draft, existing);
    assert.deepEqual(
      result.works.map((work) => work.id),
      "secondaryMediaId" in existing ? ["left-hand", "arrival"] : ["left-hand"],
    );
  }
});

test("missing or published Thoughts cannot prepare private editing or a bridge", () => {
  const published: ThoughtState = {
    version: 2,
    thoughts: [{ ...draft, status: "published", publishedAt: "2026-09-06T23:01:00.000Z" }],
  };
  for (const kind of ["edit", "bridge"] as const) {
    for (const current of [published, { version: 2 as const, thoughts: [] }]) {
      assert.deepEqual(
        prepareAuthoredCapture(current, selection, catalogue, { kind, id: draft.id }),
        { kind: "unavailable" },
      );
    }
    assert.deepEqual(
      prepareAuthoredCapture(state, selection, catalogue, { kind, id: "missing" }),
      { kind: "unavailable" },
    );
  }
});

test("bridge preparation fixes the primary first and offers selected alternatives in order", () => {
  for (const selectedMediaIds of [
    ["arrival", "left-hand", "bluets"],
    ["arrival", "bluets", "aftersun"],
  ]) {
    const result = prepareAuthoredCapture(
      state,
      { ...selection, selectedMediaIds },
      catalogue,
      { kind: "bridge", id: draft.id },
    );

    assert.equal(result.kind, "bridge");
    if (result.kind !== "bridge") continue;
    assert.deepEqual(result.draft, draft);
    assert.deepEqual(
      result.works.map((work) => work.id),
      selectedMediaIds.includes("left-hand")
        ? ["left-hand", "arrival", "bluets"]
        : ["left-hand", "arrival", "bluets", "aftersun"],
    );
  }
});

test("bridge preparation requires confirmation, one existing anchor, and a usable alternative", () => {
  const intent: AuthoredCaptureIntent = { kind: "bridge", id: draft.id };
  const unavailable = { kind: "unavailable" };

  assert.deepEqual(
    prepareAuthoredCapture(state, { ...selection, confirmed: false }, catalogue, intent),
    unavailable,
  );
  assert.deepEqual(
    prepareAuthoredCapture(
      { version: 2, thoughts: [{ ...draft, secondaryMediaId: "arrival" }] },
      selection,
      catalogue,
      intent,
    ),
    unavailable,
  );
  for (const selectedMediaIds of [[], ["left-hand"], ["missing", "left-hand"]]) {
    assert.deepEqual(
      prepareAuthoredCapture(state, { ...selection, selectedMediaIds }, catalogue, intent),
      unavailable,
    );
  }
  assert.deepEqual(
    prepareAuthoredCapture(state, selection, catalogue.filter((work) => work.id !== "left-hand"), intent),
    unavailable,
  );
});

test("all capture entries preserve filtering of unavailable catalogue records", () => {
  const partialCatalogue = catalogue.filter((work) => work.id !== "arrival");
  const cases: Array<{ intent: AuthoredCaptureIntent; current: ThoughtState; ids: string[] }> = [
    { intent: { kind: "create" }, current: state, ids: ["left-hand", "bluets"] },
    { intent: { kind: "edit", id: draft.id }, current: state, ids: ["left-hand"] },
    {
      intent: { kind: "edit", id: draft.id },
      current: { version: 2, thoughts: [{ ...draft, primaryMediaId: "arrival", secondaryMediaId: "bluets" }] },
      ids: ["bluets"],
    },
    { intent: { kind: "bridge", id: draft.id }, current: state, ids: ["left-hand", "bluets"] },
  ];
  for (const { intent, current, ids } of cases) {
    const result = prepareAuthoredCapture(current, selection, partialCatalogue, intent);
    assert.equal(result.kind, intent.kind);
    assert.deepEqual(result.works.map((work) => work.id), ids);
  }
  for (const intent of [
    { kind: "create" },
    { kind: "edit", id: draft.id },
    { kind: "bridge", id: draft.id },
  ] satisfies AuthoredCaptureIntent[]) {
    assert.deepEqual(prepareAuthoredCapture(state, selection, [], intent), { kind: "unavailable" });
  }
});

test("capture preparation returns isolated opening snapshots without mutating its inputs", () => {
  for (const kind of ["create", "edit", "bridge"] as const) {
    const current = structuredClone(state);
    const selected = structuredClone(selection);
    const works = getCatalogue();
    const result = prepareAuthoredCapture(current, selected, works, { kind, id: draft.id });

    assert.deepEqual(current, state);
    assert.deepEqual(selected, selection);
    assert.deepEqual(works, catalogue);
    assert.equal(result.kind, kind);
    const snapshot = structuredClone(result);
    current.thoughts[0]!.statement = "Changed after opening.";
    current.thoughts[0]!.secondaryMediaId = "aftersun";
    selected.selectedMediaIds.reverse();
    works.forEach((work) => { work.title = "Changed catalogue."; });
    assert.deepEqual(result, snapshot);
  }
});
