import type { KeyValueStoragePort } from "../../kernel/key-value-storage.ts";

type BrowserStorageHost = Pick<Window, "localStorage">;

/**
 * Acquires the browser storage capability without exposing the global boundary
 * to composition. Access itself can fail in privacy-restricted browser modes.
 */
export function getBrowserKeyValueStorage(
  browser: BrowserStorageHost,
): KeyValueStoragePort | null {
  try {
    return browser.localStorage;
  } catch {
    return null;
  }
}
