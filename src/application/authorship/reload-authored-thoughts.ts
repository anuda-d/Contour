import {
  type ThoughtState,
} from "../../product/authorship/draft-state.ts";
import { buildMapGraph, type MapGraph, type MapProjectionFacts } from "../../product/map/map-graph.ts";

export type AuthoredThoughtReloadPort = Readonly<{
  load():
    | Readonly<{ kind: "loaded"; state: ThoughtState }>
    | Readonly<{ kind: "storage-unavailable" }>;
}>;

export type ReloadAuthoredThoughtsResult =
  | Readonly<{ kind: "storage-unavailable" }>
  | Readonly<{
      kind: "reloaded";
      state: ThoughtState;
      graph: MapGraph;
      message: "Authored Thoughts updated from another tab.";
    }>;

/**
 * Rebuilds the current authored-Thought projection after a matching browser
 * storage-change notification. Persistence parsing and browser events remain
 * outward concerns, while this use case owns the resulting product outcome.
 */
export function reloadAuthoredThoughts(
  mapFacts: MapProjectionFacts,
  authoredThoughts: AuthoredThoughtReloadPort,
): ReloadAuthoredThoughtsResult {
  const loaded = authoredThoughts.load();
  if (loaded.kind === "storage-unavailable") return loaded;

  return {
    kind: "reloaded",
    state: loaded.state,
    graph: buildMapGraph(mapFacts, loaded.state),
    message: "Authored Thoughts updated from another tab.",
  };
}
