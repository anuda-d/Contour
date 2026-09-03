import type { ClockPort } from "../../kernel/clock.ts";
import type { IdentifierPort } from "../../kernel/identifier.ts";
import {
  connectDraft,
  createDraft,
  editDraft,
  type Thought,
  type ThoughtMutation,
  type ThoughtState,
} from "../../product/authorship/draft-state.ts";
import type { AuthoredThoughtPersistencePort } from "./authored-thought-persistence.ts";

type MediaIds = ReadonlySet<string> | Iterable<string>;

export type SaveAuthoredDraftCommand =
  | Readonly<{
      kind: "create";
      primaryMediaId: string;
      statement: string;
      selectedMediaIds: MediaIds;
      clock: ClockPort;
      identifier: IdentifierPort;
    }>
  | Readonly<{
      kind: "edit";
      id: string;
      statement: string;
    }>
  | Readonly<{
      kind: "bridge";
      id: string;
      secondaryMediaId: string | null;
      statement: string;
      statementAtOpen: string;
    }>;

type SaveAuthoredDraftSuccess = Readonly<{
  changed: boolean;
  persistenceSaved: boolean | null;
  state: ThoughtState;
  thought: Thought;
  message: string;
}>;

type SaveAuthoredDraftFailure = Readonly<{
  changed: false;
  error: string;
}>;

export type SaveAuthoredDraftResult = SaveAuthoredDraftSuccess | SaveAuthoredDraftFailure;

const visitOnlyMessage = (kind: SaveAuthoredDraftCommand["kind"], message: string) =>
  kind === "bridge"
    ? `${message} This bridge will last for this visit.`
    : `${message} This Draft will last for this visit.`;

const changedMutation = (
  command: SaveAuthoredDraftCommand,
  thought: Thought,
): ThoughtMutation => {
  if (command.kind === "create") return { id: thought.id, fields: [] };
  if (command.kind === "edit") return { id: command.id, fields: ["statement"] };
  return {
    id: command.id,
    fields:
      thought.statement === command.statementAtOpen
        ? ["secondaryMediaId"]
        : ["secondaryMediaId", "statement"],
  };
};

/**
 * Coordinates one private authored-Thought capture command and its scoped
 * persistence, while leaving dialog flow, graph projection, and rendering outwards.
 */
export function saveAuthoredDraft(
  state: ThoughtState,
  command: SaveAuthoredDraftCommand,
  validMediaIds: MediaIds,
  persistence: AuthoredThoughtPersistencePort,
): SaveAuthoredDraftResult {
  const result =
    command.kind === "create"
      ? createDraft(
          state,
          {
            id: `draft-${command.identifier.randomUuid()}`,
            primaryMediaId: command.primaryMediaId,
            statement: command.statement,
            createdAt: command.clock.now(),
          },
          command.selectedMediaIds,
        )
      : command.kind === "edit"
        ? editDraft(state, command.id, command.statement)
        : connectDraft(
            state,
            command.id,
            { secondaryMediaId: command.secondaryMediaId, statement: command.statement },
            validMediaIds,
          );

  if ("error" in result) return { changed: false, error: result.error };

  if (!result.changed) {
    return {
      changed: false,
      persistenceSaved: null,
      state: result.state,
      thought: result.draft,
      message: result.message,
    };
  }

  const persisted = persistence.save(result.state, changedMutation(command, result.draft));
  const thought = persisted.state.thoughts.find((item) => item.id === result.draft.id) ?? result.draft;
  const publishedElsewhere = command.kind !== "create" && thought.status === "published";
  const message = publishedElsewhere
    ? command.kind === "edit"
      ? "This Thought was already published in another tab. The private edit was not saved."
      : "This Thought was already published in another tab. The bridge was not saved."
    : persisted.saved
      ? result.message
      : visitOnlyMessage(command.kind, result.message);

  return {
    changed: true,
    persistenceSaved: persisted.saved,
    state: persisted.state,
    thought,
    message,
  };
}
