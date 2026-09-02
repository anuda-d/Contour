/**
 * Publishes the existing browser debug handle without exposing the mutable
 * browser global to composition.
 */
export function publishBrowserThoughtMap<T>(browser: object, map: T): void {
  Object.assign(browser, { thoughtMap: map });
}
