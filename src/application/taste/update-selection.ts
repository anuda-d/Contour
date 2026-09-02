import {
  confirmSelection as confirmSelectionProduct,
  toggleMediaSelection,
  type SelectionChange,
  type SelectionConfirmation,
  type SelectionState,
} from "../../product/taste/selection.ts";

export type SelectionPersistencePort = Readonly<{
  save(state: SelectionState): boolean;
}>;

type SelectionPersistenceOutcome = Readonly<{
  saved: boolean | null;
}>;

export type ToggleSelectionResult = SelectionChange & SelectionPersistenceOutcome;
export type ConfirmSelectionResult = SelectionConfirmation & SelectionPersistenceOutcome;

/**
 * Coordinates the current deliberate-selection command with its persistence
 * effect, leaving the exact selection policy in the taste product module.
 */
export function toggleSelection(
  state: SelectionState,
  id: string,
  validIds: Iterable<string> | ReadonlySet<string>,
  persistence: SelectionPersistencePort,
): ToggleSelectionResult {
  const result = toggleMediaSelection(state, id, validIds);
  if (!result.changed) return { ...result, saved: null };

  const saved = persistence.save(result.state);
  return {
    ...result,
    saved,
    message: saved ? result.message : "Selection saved for this visit only.",
  };
}

/**
 * Confirms exactly three deliberate selections and persists only that valid
 * confirmation, preserving the visit-only fallback when storage is unavailable.
 */
export function confirmSelection(
  state: SelectionState,
  persistence: SelectionPersistencePort,
): ConfirmSelectionResult {
  const result = confirmSelectionProduct(state);
  if (!result.confirmed) return { ...result, saved: null };

  const saved = persistence.save(result.state);
  return {
    ...result,
    saved,
    message: saved ? result.message : "Three works are ready for this visit.",
  };
}
