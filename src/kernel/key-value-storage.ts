/**
 * Minimal persistence capability required by the current browser-storage adapters.
 * Concrete browser storage remains an outward composition concern.
 */
export type KeyValueStoragePort = Readonly<{
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}>;
