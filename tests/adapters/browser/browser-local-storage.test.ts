import assert from "node:assert/strict";
import test from "node:test";
import { getBrowserKeyValueStorage } from "../../../src/adapters/browser/browser-local-storage.ts";
import type { KeyValueStoragePort } from "../../../src/kernel/key-value-storage.ts";

test("browser storage acquisition returns the native storage port unchanged", () => {
  const storage: KeyValueStoragePort = {
    getItem: () => null,
    setItem: () => {},
  };

  const acquired = getBrowserKeyValueStorage({
    localStorage: storage as Storage,
  });

  assert.strictEqual(acquired, storage);
});

test("browser storage acquisition falls back safely when the localStorage getter fails", () => {
  const browser: Pick<Window, "localStorage"> = {
    get localStorage(): Storage {
      throw new Error("storage blocked");
    },
  };

  assert.equal(getBrowserKeyValueStorage(browser), null);
});
