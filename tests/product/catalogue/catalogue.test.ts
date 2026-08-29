import assert from "node:assert/strict";
import test from "node:test";
import {
  getCatalogue,
  mediaCatalogue,
} from "../../../src/product/catalogue/catalogue.ts";

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
  const firstItem = first[0];
  const secondItem = second[0];
  assert.ok(firstItem);
  assert.ok(secondItem);
  firstItem.title = "Changed locally";
  assert.notEqual(firstItem.title, secondItem.title);
  assert.notStrictEqual(firstItem, secondItem);
});
