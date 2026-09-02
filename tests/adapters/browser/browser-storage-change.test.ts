import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserStorageChangePort } from "../../../src/adapters/browser/browser-storage-change.ts";

test("browser storage-change adapter forwards only its requested key without browser event data", () => {
  const captured = { storageListener: null as ((event: StorageEvent) => void) | null };
  const eventTarget = {
    addEventListener: (type: "storage", listener: (event: StorageEvent) => void) => {
      assert.equal(type, "storage");
      captured.storageListener = listener;
    },
  };
  const storageChanges = createBrowserStorageChangePort(eventTarget);
  let calls = 0;

  storageChanges.onChange("thought-map.prototype.authored-thoughts.v2", () => {
    calls += 1;
  });

  assert.ok(captured.storageListener);
  captured.storageListener({ key: "another-key" } as StorageEvent);
  captured.storageListener({ key: null } as StorageEvent);
  assert.equal(calls, 0);
  captured.storageListener({ key: "thought-map.prototype.authored-thoughts.v2" } as StorageEvent);
  assert.equal(calls, 1);
});
