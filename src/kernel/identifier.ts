/**
 * Minimal opaque identifier capability required by current authored Thought workflows.
 * Concrete UUID generation remains an outward composition concern.
 */
export type IdentifierPort = Readonly<{
  randomUuid(): string;
}>;
