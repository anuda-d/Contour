export const MAP_MODES = Object.freeze({
  owner: "owner",
  visitor: "visitor",
});

export function normalizeMapMode(mode) {
  return mode === MAP_MODES.visitor ? MAP_MODES.visitor : MAP_MODES.owner;
}

export function getModeCapabilities(mode) {
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

function copyGraph(graph, nodes = graph.nodes, edges = graph.edges) {
  return {
    profile: {
      ...graph.profile,
      ...(graph.profile.featuredMediaIds
        ? { featuredMediaIds: [...graph.profile.featuredMediaIds] }
        : {}),
    },
    nodes: nodes.map((node) => ({
      ...node,
      ...(node.anchors ? { anchors: [...node.anchors] } : {}),
    })),
    edges: edges.map((edge) => ({ ...edge })),
  };
}

export function getPublicMediaIds(graph) {
  return new Set(
    projectGraphForMode(graph, MAP_MODES.visitor)
      .nodes.filter((node) => node.type === "media")
      .map((node) => node.id),
  );
}

export function projectGraphForMode(graph, mode) {
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
