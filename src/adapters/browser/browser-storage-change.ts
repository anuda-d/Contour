import type { StorageChangePort } from "../../kernel/storage-change.ts";

type BrowserStorageEventTarget = Readonly<{
  addEventListener(type: "storage", listener: (event: StorageEvent) => void): void;
}>;

export function createBrowserStorageChangePort(
  eventTarget: BrowserStorageEventTarget,
): StorageChangePort {
  return {
    onChange: (key, listener) => {
      eventTarget.addEventListener("storage", (event) => {
        if (event.key === key) listener();
      });
    },
  };
}
