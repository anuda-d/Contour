import type { ResizeEventPort } from "../../kernel/resize-event.ts";

type BrowserResizeEventTarget = Pick<Window, "addEventListener" | "removeEventListener">;

/**
 * Replaces the current Map resize listener with the exact native listener
 * ordering used by the frozen prototype.
 */
export function createBrowserResizeEventPort(
  eventTarget: BrowserResizeEventTarget,
): ResizeEventPort {
  return {
    replaceListener: (listener) => {
      eventTarget.removeEventListener("resize", listener);
      eventTarget.addEventListener("resize", listener, { passive: true });
    },
  };
}
