import type {
  MapGraph,
  MapGraphEdge,
  MapGraphNode,
  MapGraphProfile,
} from "./map-graph.ts";

export const MAP_MODES = Object.freeze({
  owner: "owner",
  visitor: "visitor",
} as const);

export type MapMode = (typeof MAP_MODES)[keyof typeof MAP_MODES];
export type ProjectedGraph = MapGraph;

export type ModeCapabilities = Readonly<{
  mode: MapMode;
  canChooseWorks: boolean;
  canCaptureThoughts: boolean;
  canFeatureMedia: boolean;
  canShapeNodes: boolean;
  canResetPositions: boolean;
}>;

export function normalizeMapMode(mode: unknown): MapMode {
  return mode === MAP_MODES.visitor ? MAP_MODES.visitor : MAP_MODES.owner;
}

export function getModeCapabilities(mode: unknown): ModeCapabilities {
  const normalizedMode = normalizeMapMode(mode);
  const owner = normalizedMode === MAP_MODES.owner;
  return Object.freeze({
    mode: normalizedMode,
    canChooseWorks: owner,
    canCaptureThoughts: owner,
    canFeatureMedia: owner,
    canShapeNodes: owner,
    canResetPositions: owner,
  });
}

function copyProfile(profile: MapGraphProfile): MapGraphProfile {
  return { ...profile, featuredMediaIds: [...profile.featuredMediaIds] };
}

function copyNode(node: MapGraphNode): MapGraphNode {
  if (node.type === "thought") return { ...node, anchors: [...node.anchors] };
  return { ...node };
}

function copyGraph(
  graph: MapGraph,
  nodes: readonly MapGraphNode[] = graph.nodes,
  edges: readonly MapGraphEdge[] = graph.edges,
): ProjectedGraph {
  return {
    profile: copyProfile(graph.profile),
    nodes: nodes.map(copyNode),
    edges: edges.map((edge) => ({ ...edge })),
  };
}

/** Produces a display projection from the Map representation, never product facts. */
export function projectGraphForMode(graph: MapGraph, mode: unknown): ProjectedGraph {
  if (normalizeMapMode(mode) === MAP_MODES.owner) return copyGraph(graph);

  const publishedThoughts = graph.nodes.filter(
    (node): node is Extract<MapGraphNode, { type: "thought" }> =>
      node.type === "thought" && node.status === "published",
  );
  const visibleIds = new Set(
    graph.nodes.filter((node) => node.type === "user").map((node) => node.id),
  );
  publishedThoughts.forEach((thought) => {
    visibleIds.add(thought.id);
    thought.anchors.forEach((id) => visibleIds.add(id));
  });
  const nodes = graph.nodes.filter((node) => visibleIds.has(node.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  return copyGraph(graph, nodes, edges);
}
