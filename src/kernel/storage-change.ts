/**
 * Minimal browser storage-change capability needed by the current authored
 * Thought synchronization workflow. Concrete browser events stay outward.
 */
export type StorageChangePort = Readonly<{
  onChange(key: string, listener: () => void): void;
}>;
