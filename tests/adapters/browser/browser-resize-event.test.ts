import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserResizeEventPort } from "../../../src/adapters/browser/browser-resize-event.ts";

test("browser resize adapter replaces the matching listener before adding it passively", () => {
  const calls: Array<readonly [string, string, (() => void), AddEventListenerOptions?]> = [];
  const listener = () => {};
  const eventTarget = {
    removeEventListener: (type: string, callback: () => void) => {
      calls.push(["remove", type, callback]);
    },
    addEventListener: (type: string, callback: () => void, options: AddEventListenerOptions) => {
      calls.push(["add", type, callback, options]);
    },
  } as Pick<Window, "addEventListener" | "removeEventListener">;

  createBrowserResizeEventPort(eventTarget).replaceListener(listener);

  assert.deepEqual(calls, [
    ["remove", "resize", listener],
    ["add", "resize", listener, { passive: true }],
  ]);
});
