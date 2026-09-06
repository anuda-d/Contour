import type { CatalogueWork } from "../../product/catalogue/catalogue.ts";
import {
  composeGraphWithDrafts,
  type ThoughtGraph,
  type ThoughtState,
} from "../../product/authorship/draft-state.ts";
import type { FeaturedState } from "../../product/taste/featured.ts";
import type { SelectionState } from "../../product/taste/selection.ts";
import { getPublicMediaIds } from "../../product/map/projection.ts";
import type { PinnedState } from "../../product/map/pinned-positions.ts";
import {
  recoverAuthoredThoughts,
} from "../authorship/recover-authored-thoughts.ts";
import {
  recoverSelection,
  type SelectionRecoveryPersistencePort,
} from "../taste/recover-selection.ts";
import {
  recoverFeatured,
  type FeaturedRecoveryPersistencePort,
} from "../taste/recover-featured.ts";
import {
  recoverPinnedPositions,
  type PinnedPositionRecoveryPersistencePort,
} from "./recover-pinned-positions.ts";

export type StartupLoadResult<TState> = Readonly<{
  state: TState;
  persistent: boolean;
  recovered: boolean;
  storageError: boolean;
}>;

export type AuthoredStartupLoadResult = StartupLoadResult<ThoughtState> & Readonly<{
  migrated?: boolean;
  recoveryNotice?: boolean;
}>;

type MapFactGraph = Parameters<typeof composeGraphWithDrafts>[0];

export type SelectionStartupPort = Readonly<{
  load(validIds: ReadonlySet<string>): StartupLoadResult<SelectionState>;
}>;

export type FeaturedStartupPort = Readonly<{
  load(
    eligibleIds: ReadonlySet<string>,
    defaultIds: readonly string[],
  ): StartupLoadResult<FeaturedState>;
}>;

export type AuthoredThoughtStartupPort = Readonly<{
  load(validMediaIds: ReadonlySet<string>): AuthoredStartupLoadResult;
  recover(
    state: ThoughtState,
    validMediaIds: ReadonlySet<string>,
  ): Readonly<{ saved: boolean; state: ThoughtState }>;
}>;

export type PinnedPositionStartupPort = Readonly<{
  load(validIds: ReadonlySet<string>): StartupLoadResult<PinnedState>;
}>;

export type InitializeMapSessionDependencies = Readonly<{
  baseGraph: MapFactGraph;
  catalogue: readonly CatalogueWork[];
  selection: SelectionStartupPort;
  featured: FeaturedStartupPort;
  authoredThoughts: AuthoredThoughtStartupPort;
  pinnedPositions: PinnedPositionStartupPort;
  selectionRecovery: SelectionRecoveryPersistencePort;
  featuredRecovery: FeaturedRecoveryPersistencePort;
  pinnedPositionRecovery: PinnedPositionRecoveryPersistencePort;
}>;

export type MapSession = Readonly<{
  validCatalogueIds: ReadonlySet<string>;
  publicMediaIds: ReadonlySet<string>;
  selectionState: SelectionState;
  featuredState: FeaturedState;
  draftState: ThoughtState;
  pinnedState: PinnedState;
  graph: ThoughtGraph;
  persistent: boolean;
  initialChooserMessage: string;
  featuredMessage: string;
  initialDraftMessage: string;
}>;

/**
 * Coordinates the current Map startup sequence through narrow application
 * ports. The result is screen-neutral while preserving existing recovery
 * order, storage semantics, and user-facing outcomes.
 */
export function initializeMapSession(
  dependencies: InitializeMapSessionDependencies,
): MapSession {
  const validCatalogueIds = new Set(dependencies.catalogue.map((item) => item.id));
  const publicMediaIds = getPublicMediaIds(dependencies.baseGraph);
  const loadedSelection = dependencies.selection.load(validCatalogueIds);
  const loadedFeatured = dependencies.featured.load(
    publicMediaIds,
    dependencies.baseGraph.profile.featuredMediaIds ?? [],
  );
  const loadedDrafts = dependencies.authoredThoughts.load(validCatalogueIds);

  let selectionState = loadedSelection.state;
  let featuredState = loadedFeatured.state;
  let draftState = loadedDrafts.state;
  let graph = composeGraphWithDrafts(dependencies.baseGraph, draftState);
  const pinnableIds = new Set(
    graph.nodes.filter((node) => node.type !== "user").map((node) => node.id),
  );
  const loadedPinned = dependencies.pinnedPositions.load(pinnableIds);
  let pinnedState = loadedPinned.state;
  let persistent = loadedSelection.persistent;
  let initialChooserMessage = loadedSelection.storageError
    ? "Selections will last for this visit."
    : loadedSelection.recovered
      ? "Unavailable saved works were removed."
      : "";
  let featuredMessage = loadedFeatured.storageError
    ? "Featured Media will last for this visit."
    : loadedFeatured.recovered
      ? "Unavailable featured works were removed."
      : "";
  let initialDraftMessage = loadedDrafts.storageError
    ? "Private Drafts will last for this visit."
    : (loadedDrafts.recoveryNotice ?? (loadedDrafts.recovered && !loadedDrafts.migrated))
      ? "Saved authored Thoughts were recovered safely."
      : "";

  if (loadedSelection.recovered && loadedSelection.persistent) {
    const recoveredSelection = recoverSelection(selectionState, dependencies.selectionRecovery);
    selectionState = recoveredSelection.state;
    persistent = recoveredSelection.saved;
  }
  if (loadedFeatured.recovered && loadedFeatured.persistent) {
    const recoveredFeatured = recoverFeatured(featuredState, dependencies.featuredRecovery);
    featuredState = recoveredFeatured.state;
    if (!recoveredFeatured.saved) {
      featuredMessage = "Unavailable featured works were removed. Changes will last for this visit.";
    }
  }
  if (loadedDrafts.recovered && loadedDrafts.persistent) {
    const persistedDrafts = recoverAuthoredThoughts(
      draftState,
      {
        recover: (state) => dependencies.authoredThoughts.recover(state, validCatalogueIds),
      },
    );
    draftState = persistedDrafts.state;
    graph = composeGraphWithDrafts(dependencies.baseGraph, draftState);
    if (!persistedDrafts.saved) {
      initialDraftMessage =
        "Saved authored Thoughts were recovered safely. Changes will last for this visit.";
    }
  }
  if (loadedPinned.recovered && loadedPinned.persistent) {
    const recoveredPinned = recoverPinnedPositions(
      pinnedState,
      dependencies.pinnedPositionRecovery,
    );
    pinnedState = recoveredPinned.state;
  }

  return {
    validCatalogueIds,
    publicMediaIds,
    selectionState,
    featuredState,
    draftState,
    pinnedState,
    graph,
    persistent,
    initialChooserMessage,
    featuredMessage,
    initialDraftMessage,
  };
}
