/**
 * Minimal wall-clock capability required by current authored Thought workflows
 * and Map interaction timing.
 * Concrete clock access remains an outward composition concern.
 */
export type ClockPort = Readonly<{
  now(): string;
  nowMilliseconds(): number;
}>;
