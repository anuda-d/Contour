import {
  MAP_MODES,
  getModeCapabilities,
  normalizeMapMode,
  projectGraphForMode,
} from "../graph-projection.ts";
import { layoutGraph } from "../layout.ts";
import { resolvePositions } from "../product/map/pinned-positions.ts";
import type {
  MapEdge,
  MapGraph,
  MapNode,
  MapPresentation,
  MapProfile,
  MediaNode,
  ThoughtNode,
} from "../ui/map.dom.ts";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function stringList(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? [...value]
    : null;
}

function mapProfile(value: unknown): MapProfile {
  const record = asRecord(value);
  const displayName = record && stringValue(record, "displayName");
  const handle = record && stringValue(record, "handle");
  const initials = record && stringValue(record, "initials");
  const identityLine = record && stringValue(record, "identityLine");
  if (!displayName || !handle || !initials || !identityLine) {
    throw new Error("Map presentation received an invalid profile projection.");
  }
  return { displayName, handle, initials, identityLine };
}

function mapNode(value: unknown): MapNode {
  const record = asRecord(value);
  const id = record && stringValue(record, "id");
  const type = record && stringValue(record, "type");
  if (!id || !type) throw new Error("Map presentation received an invalid node projection.");
  if (type === "user") return { id, type };
  if (type === "media") {
    const format = stringValue(record, "format");
    const title = stringValue(record, "title");
    const creator = stringValue(record, "creator");
    const year = record.year;
    if (!format || !title || !creator || typeof year !== "number") {
      throw new Error("Map presentation received an invalid Media projection.");
    }
    return { id, type, format, title, creator, year } satisfies MediaNode;
  }
  if (type === "thought") {
    const status = stringValue(record, "status");
    const statement = stringValue(record, "statement");
    const anchors = stringList(record.anchors);
    if ((status !== "draft" && status !== "published") || !statement || !anchors) {
      throw new Error("Map presentation received an invalid Thought projection.");
    }
    return {
      id,
      type,
      status,
      statement,
      anchors,
    } satisfies ThoughtNode;
  }
  throw new Error("Map presentation received an unsupported node projection.");
}

function mapGraph(value: unknown): MapGraph {
  const record = asRecord(value);
  if (!record || !Array.isArray(record.nodes) || !Array.isArray(record.edges)) {
    throw new Error("Map presentation received an invalid graph projection.");
  }
  const edges = record.edges.map((value): MapEdge => {
    const edge = asRecord(value);
    const id = edge && stringValue(edge, "id");
    const source = edge && stringValue(edge, "source");
    const target = edge && stringValue(edge, "target");
    const kind = edge && stringValue(edge, "kind");
    if (!id || !source || !target || !kind) throw new Error("Map presentation received an invalid edge projection.");
    return { id, source, target, kind };
  });
  return { profile: mapProfile(record.profile), nodes: record.nodes.map(mapNode), edges };
}

export function createMapPresentation(): MapPresentation {
  return {
    modes: MAP_MODES,
    normalizeMode: normalizeMapMode,
    getModeCapabilities,
    projectGraphForMode: (graph, mode) => mapGraph(projectGraphForMode(mapGraph(graph), mode)),
    layoutGraph: (graph, world) => {
      const map = mapGraph(graph);
      return layoutGraph(map.nodes, map.edges, world);
    },
    resolvePositions: (graph, generatedPositions, currentPositions, pinnedPositions = {}) => {
      const map = mapGraph(graph);
      const resolved = resolvePositions(map.nodes, generatedPositions, currentPositions, pinnedPositions);
      return Object.fromEntries(map.nodes.map((node) => {
        const point = resolved[node.id];
        if (!point) throw new Error(`Map presentation has no position for ${node.id}.`);
        return [node.id, { x: point.x, y: point.y }];
      }));
    },
  };
}
