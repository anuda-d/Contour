import type { DraftThought, ThoughtState } from "../../product/authorship/draft-state.ts";
import type { CatalogueWork } from "../../product/catalogue/catalogue.ts";
import type { SelectionState } from "../../product/taste/selection.ts";

export type AuthoredCaptureIntent =
  | Readonly<{ kind: "create" }>
  | Readonly<{ kind: "edit" | "bridge"; id: string }>;

export type AuthoredCapturePreparation =
  | Readonly<{ kind: "unavailable" }>
  | Readonly<{
      kind: "create";
      draft: null;
      works: readonly CatalogueWork[];
    }>
  | Readonly<{
      kind: "edit" | "bridge";
      draft: Readonly<DraftThought>;
      works: readonly CatalogueWork[];
    }>;

/**
 * Joins current authorship, private selection, and catalogue facts for capture.
 * Returned opening snapshots leave dialog lifecycle and owner-mode UI gating
 * outwards; save-time validation and persistence remain in the save use case.
 */
export function prepareAuthoredCapture(
  state: ThoughtState,
  selection: SelectionState,
  catalogue: readonly CatalogueWork[],
  intent: AuthoredCaptureIntent,
): AuthoredCapturePreparation {
  const worksFor = (ids: readonly string[]): CatalogueWork[] => ids
    .map((id) => catalogue.find((work) => work.id === id))
    .filter((work): work is CatalogueWork => work !== undefined)
    .map((work) => ({ ...work }));

  if (intent.kind === "create") {
    if (!selection.confirmed) return { kind: "unavailable" };
    const works = worksFor(selection.selectedMediaIds);
    return works.length
      ? { kind: "create", draft: null, works }
      : { kind: "unavailable" };
  }

  const draft = state.thoughts.find(
    (thought): thought is DraftThought => thought.id === intent.id && thought.status === "draft",
  );
  if (!draft) return { kind: "unavailable" };

  if (intent.kind === "edit") {
    const works = worksFor([
      draft.primaryMediaId,
      ...(draft.secondaryMediaId ? [draft.secondaryMediaId] : []),
    ]);
    return works.length
      ? { kind: "edit", draft: { ...draft }, works }
      : { kind: "unavailable" };
  }

  if (!selection.confirmed || draft.secondaryMediaId) return { kind: "unavailable" };
  const primaryWork = catalogue.find((work) => work.id === draft.primaryMediaId);
  const otherWorks = worksFor(
    selection.selectedMediaIds.filter((id) => id !== draft.primaryMediaId),
  );
  if (!primaryWork || !otherWorks.length) return { kind: "unavailable" };
  return {
    kind: "bridge",
    draft: { ...draft },
    works: [{ ...primaryWork }, ...otherWorks],
  };
}
