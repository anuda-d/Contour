/**
 * Minimal wall-clock capability required by current authored Thought workflows.
 * Concrete clock access remains an outward composition concern.
 */
export type ClockPort = Readonly<{
  now(): string;
}>;
