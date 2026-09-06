import { layoutGraph } from "../../product/map/layout.ts";
import type { LayoutEdge, LayoutNode } from "../../product/map/layout.ts";
import {
  getModeCapabilities,
  normalizeMapMode,
  projectGraphForMode,
  type GraphInput,
  type MapMode,
  type ModeCapabilities,
  type ProjectedGraph,
} from "../../product/map/projection.ts";
import type { MapPoint, PinnedState } from "../../product/map/pinned-positions.ts";

export type MapReadModel = Readonly<{
  mode: MapMode;
  capabilities: ModeCapabilities;
  graph: ProjectedGraph;
  generatedPositions: Readonly<Record<string, MapPoint>>;
  pinnedPositions: Readonly<Record<string, MapPoint>>;
}>;

function projectedPositions(
  graph: ProjectedGraph,
  positions: Readonly<Record<string, MapPoint>>,
): Record<string, MapPoint> {
  return Object.fromEntries(
    graph.nodes.map((node) => {
      const point = positions[node.id];
      if (!point) throw new Error(`Map read model has no generated position for ${node.id}.`);
      return [node.id, { x: point.x, y: point.y }];
    }),
  );
}

function projectedPins(
  graph: ProjectedGraph,
  pinnedPositions: Readonly<Record<string, MapPoint>>,
): Record<string, MapPoint> {
  const visibleIds = new Set(graph.nodes.map((node) => node.id));
  return Object.fromEntries(
    Object.entries(pinnedPositions)
      .filter(([id]) => visibleIds.has(id))
      .map(([id, point]) => [id, { x: point.x, y: point.y }]),
  );
}

function layoutNodes(graph: GraphInput): LayoutNode[] {
  return graph.nodes.map((node) => {
    if (node.type !== "user" && node.type !== "media" && node.type !== "thought") {
      throw new Error(`Map read model received an unsupported node type for ${node.id}.`);
    }
    return { id: node.id, type: node.type };
  });
}

function layoutEdges(graph: GraphInput): LayoutEdge[] {
  return graph.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    ...(typeof edge.kind === "string" ? { kind: edge.kind } : {}),
  }));
}

export function createMapReadModel(
  graph: GraphInput,
  mode: unknown,
  pinnedState: PinnedState,
): MapReadModel {
  const normalizedMode = normalizeMapMode(mode);
  const projectedGraph = projectGraphForMode(graph, normalizedMode);
  const allPositions = layoutGraph(layoutNodes(graph), layoutEdges(graph));

  return {
    mode: normalizedMode,
    capabilities: getModeCapabilities(normalizedMode),
    graph: projectedGraph,
    generatedPositions: projectedPositions(projectedGraph, allPositions),
    pinnedPositions: projectedPins(projectedGraph, pinnedState.pinnedPositions),
  };
}
