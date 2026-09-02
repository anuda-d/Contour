export const MAP_MODES = Object.freeze({
  owner: "owner",
  visitor: "visitor",
} as const);

export type MapMode = (typeof MAP_MODES)[keyof typeof MAP_MODES];

export type GraphProfile = Readonly<{
  featuredMediaIds?: readonly string[];
  [key: string]: unknown;
}>;

export type GraphNode = Readonly<{
  id: string;
  type: string;
  status?: string;
  anchors?: readonly string[];
  [key: string]: unknown;
}>;

export type GraphEdge = Readonly<{
  id: string;
  source: string;
  target: string;
  [key: string]: unknown;
}>;

export type GraphInput = Readonly<{
  profile: GraphProfile;
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
}>;

export type PublicMediaSource = Readonly<{
  nodes: readonly Readonly<{
    id: string;
    type: string;
    status?: string;
    anchors?: readonly string[];
  }>[];
}>;

export type ProjectedGraph = {
  profile: {
    featuredMediaIds?: string[];
    [key: string]: unknown;
  };
  nodes: Array<{
    id: string;
    type: string;
    status?: string;
    anchors?: string[];
    [key: string]: unknown;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    [key: string]: unknown;
  }>;
};

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

function copyProfile(profile: GraphProfile): ProjectedGraph["profile"] {
  const { featuredMediaIds, ...rest } = profile;
  return featuredMediaIds ? { ...rest, featuredMediaIds: [...featuredMediaIds] } : { ...rest };
}

function copyNode(node: GraphNode): ProjectedGraph["nodes"][number] {
  const { anchors, ...rest } = node;
  return anchors ? { ...rest, anchors: [...anchors] } : { ...rest };
}

function copyGraph(
  graph: GraphInput,
  nodes: readonly GraphNode[] = graph.nodes,
  edges: readonly GraphEdge[] = graph.edges,
): ProjectedGraph {
  return {
    profile: copyProfile(graph.profile),
    nodes: nodes.map(copyNode),
    edges: edges.map((edge) => ({ ...edge })),
  };
}

export function getPublicMediaIds(graph: PublicMediaSource): Set<string> {
  const visibleIds = new Set(
    graph.nodes.filter((node) => node.type === "user").map((node) => node.id),
  );
  graph.nodes
    .filter((node) => node.type === "thought" && node.status === "published")
    .forEach((thought) => {
      visibleIds.add(thought.id);
      thought.anchors?.forEach((id) => visibleIds.add(id));
    });
  return new Set(
    graph.nodes
      .filter((node) => node.type === "media" && visibleIds.has(node.id))
      .map((node) => node.id),
  );
}

export function projectGraphForMode(graph: GraphInput, mode: unknown): ProjectedGraph {
  if (normalizeMapMode(mode) === MAP_MODES.owner) return copyGraph(graph);

  const publishedThoughts = graph.nodes.filter(
    (node) => node.type === "thought" && node.status === "published",
  );
  const visibleIds = new Set(
    graph.nodes.filter((node) => node.type === "user").map((node) => node.id),
  );

  publishedThoughts.forEach((thought) => {
    visibleIds.add(thought.id);
    thought.anchors?.forEach((id) => visibleIds.add(id));
  });

  const nodes = graph.nodes.filter((node) => visibleIds.has(node.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  return copyGraph(graph, nodes, edges);
}
