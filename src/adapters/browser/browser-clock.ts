import type { ClockPort } from "../../kernel/clock.ts";

export const browserClock: ClockPort = {
  now: () => new Date().toISOString(),
};
