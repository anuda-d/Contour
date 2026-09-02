/**
 * Minimal resize-listener capability required by the native Map UI.
 * Concrete browser event access remains outward.
 */
export type ResizeEventPort = Readonly<{
  replaceListener(listener: () => void): void;
}>;
