import type { IdentifierPort } from "../../kernel/identifier.ts";

export const browserIdentifier: IdentifierPort = {
  randomUuid: () => crypto.randomUUID(),
};
