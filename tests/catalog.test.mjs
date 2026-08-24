import test from "node:test";
import assert from "node:assert/strict";
import { getCatalogue, mediaCatalogue } from "../src/catalog.js";

test("the curated catalogue has unique Book and Film records", () => {
  const ids = mediaCatalogue.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(mediaCatalogue.some((item) => item.format === "book"));
  assert.ok(mediaCatalogue.some((item) => item.format === "film"));
  mediaCatalogue.forEach((item) => {
    assert.ok(item.id);
    assert.ok(item.title);
    assert.ok(item.creator);
    assert.ok(Number.isInteger(item.year));
    assert.ok(["book", "film"].includes(item.format));
  });
});

test("catalogue callers receive an editable fresh copy", () => {
  const first = getCatalogue();
  const second = getCatalogue();
  first[0].title = "Changed locally";
  assert.notEqual(first[0].title, second[0].title);
  assert.notStrictEqual(first[0], second[0]);
});
