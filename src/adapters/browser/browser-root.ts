type BrowserDocument = Pick<Document, "querySelector">;

/**
 * Acquires the native application root without exposing document lookup to
 * composition. The missing-root error remains a startup failure by design.
 */
export function getBrowserRoot(browser: BrowserDocument): HTMLElement {
  const root = browser.querySelector<HTMLElement>("#app");
  if (!root) throw new Error("Expected application root.");
  return root;
}
