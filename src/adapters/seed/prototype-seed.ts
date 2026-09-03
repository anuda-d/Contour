import {
  mediaCatalogue,
  type CatalogueWork,
} from "../../product/catalogue/catalogue.ts";

export interface SeedProfile {
  id: string;
  displayName: string;
  handle: string;
  initials: string;
  identityLine: string;
  featuredMediaIds: string[];
}

type SeedProfileTemplate = Omit<SeedProfile, "featuredMediaIds"> & {
  featuredMediaIds: readonly string[];
};

export interface SeedUserNode {
  id: string;
  type: "user";
  label: string;
  note: string;
}

export interface SeedMediaNode extends CatalogueWork {
  type: "media";
}

export interface SeedThoughtNode {
  id: string;
  type: "thought";
  status: "published";
  statement: string;
  anchors: string[];
}

export type SeedNode = SeedUserNode | SeedMediaNode | SeedThoughtNode;

type SeedThoughtTemplate = Omit<SeedThoughtNode, "anchors"> & {
  anchors: readonly string[];
};

type SeedNodeTemplate = SeedUserNode | SeedMediaNode | SeedThoughtTemplate;

export interface SeedEdge {
  id: string;
  source: string;
  target: string;
  kind: "authored" | "primary-anchor" | "additional-anchor";
}

export interface SeedGraph {
  profile: SeedProfile;
  nodes: SeedNode[];
  edges: SeedEdge[];
}

export const profile: Readonly<SeedProfileTemplate> = Object.freeze({
  id: "mira-vale",
  displayName: "Mira Vale",
  handle: "@miravale",
  initials: "MV",
  identityLine: "Films, books, and the ideas I keep returning to.",
  featuredMediaIds: Object.freeze(["dispossessed", "mood-for-love", "aftersun"]),
});

export const nodes: ReadonlyArray<Readonly<SeedNodeTemplate>> = Object.freeze([
  Object.freeze({
    id: "mira",
    type: "user" as const,
    label: "Mira Vale",
    note: "A map of what stayed with me",
  }),
  ...mediaCatalogue.map((item) => Object.freeze({ ...item, type: "media" as const })),
  Object.freeze({
    id: "thought-language",
    type: "thought" as const,
    status: "published" as const,
    statement:
      "The future changes when language gives us another way to hold time.",
    anchors: Object.freeze(["arrival", "left-hand"]),
  }),
  Object.freeze({
    id: "thought-silence",
    type: "thought" as const,
    status: "published" as const,
    statement:
      "Intimacy becomes clearest in what two people choose not to say.",
    anchors: Object.freeze(["mood-for-love", "bluets"]),
  }),
  Object.freeze({
    id: "thought-memory",
    type: "thought" as const,
    status: "published" as const,
    statement: "Memory edits love until absence starts to feel like a place.",
    anchors: Object.freeze(["aftersun", "bluets"]),
  }),
  Object.freeze({
    id: "thought-freedom",
    type: "thought" as const,
    status: "published" as const,
    statement: "A home can be both shelter and a rehearsal for freedom.",
    anchors: Object.freeze(["dispossessed", "left-hand"]),
  }),
]);

export const edges: ReadonlyArray<Readonly<SeedEdge>> = Object.freeze([
  ...nodes
    .filter((node): node is Readonly<SeedThoughtTemplate> => node.type === "thought")
    .map((node) => ({
      id: `authored-${node.id}`,
      source: "mira",
      target: node.id,
      kind: "authored" as const,
    })),
  ...nodes
    .filter((node): node is Readonly<SeedThoughtTemplate> => node.type === "thought")
    .flatMap((node) =>
      node.anchors.map((anchor, index) => ({
        id: `anchor-${node.id}-${anchor}`,
        source: node.id,
        target: anchor,
        kind: index === 0 ? "primary-anchor" as const : "additional-anchor" as const,
      })),
  ),
]);

type SeedRecord = Record<string, unknown>;

function seedError(reason: string): never {
  throw new Error(`Prototype seed is invalid: ${reason}`);
}

function asRecord(value: unknown, label: string): SeedRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return seedError(`${label} must be an object.`);
  }
  return value as SeedRecord;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) return seedError(`${label} must be a non-empty string.`);
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) return seedError(`${label} must be an array.`);
  return value.map((item, index) => nonEmptyString(item, `${label}[${index}]`));
}

function unique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) seedError(`${label} must not contain duplicates.`);
}

function parseProfile(value: unknown): SeedProfile {
  const record = asRecord(value, "profile");
  const featuredMediaIds = stringArray(record.featuredMediaIds, "profile.featuredMediaIds");
  unique(featuredMediaIds, "profile.featuredMediaIds");
  if (featuredMediaIds.length !== 3) seedError("profile.featuredMediaIds must contain exactly three works.");
  return {
    id: nonEmptyString(record.id, "profile.id"),
    displayName: nonEmptyString(record.displayName, "profile.displayName"),
    handle: nonEmptyString(record.handle, "profile.handle"),
    initials: nonEmptyString(record.initials, "profile.initials"),
    identityLine: nonEmptyString(record.identityLine, "profile.identityLine"),
    featuredMediaIds,
  };
}

function parseNodes(value: unknown): SeedNode[] {
  if (!Array.isArray(value)) seedError("nodes must be an array.");
  const catalogueById = new Map(mediaCatalogue.map((work) => [work.id, work]));
  const ids = new Set<string>();
  let userCount = 0;
  const mediaIds = new Set<string>();

  const parsed = value.map((candidate, index): SeedNode => {
    const record = asRecord(candidate, `nodes[${index}]`);
    const id = nonEmptyString(record.id, `nodes[${index}].id`);
    if (ids.has(id)) seedError(`nodes[${index}].id duplicates ${id}.`);
    ids.add(id);

    if (record.type === "user") {
      userCount += 1;
      return {
        id,
        type: "user",
        label: nonEmptyString(record.label, `nodes[${index}].label`),
        note: nonEmptyString(record.note, `nodes[${index}].note`),
      };
    }

    if (record.type === "media") {
      const catalogueWork = catalogueById.get(id);
      if (!catalogueWork) seedError(`nodes[${index}].id must name a supported catalogue work.`);
      if (
        record.format !== catalogueWork.format ||
        record.title !== catalogueWork.title ||
        record.creator !== catalogueWork.creator ||
        record.year !== catalogueWork.year
      ) {
        seedError(`nodes[${index}] must match its supported catalogue work.`);
      }
      mediaIds.add(id);
      return { ...catalogueWork, type: "media" };
    }

    if (record.type === "thought") {
      if (record.status !== "published") seedError(`nodes[${index}].status must be published.`);
      const anchors = stringArray(record.anchors, `nodes[${index}].anchors`);
      unique(anchors, `nodes[${index}].anchors`);
      if (!anchors.length) seedError(`nodes[${index}].anchors must not be empty.`);
      return {
        id,
        type: "thought",
        status: "published",
        statement: nonEmptyString(record.statement, `nodes[${index}].statement`),
        anchors,
      };
    }

    return seedError(`nodes[${index}].type is unsupported.`);
  });

  if (userCount !== 1) seedError("nodes must contain exactly one user.");
  if (mediaIds.size !== mediaCatalogue.length) seedError("nodes must contain every supported catalogue work.");

  const validMediaIds = new Set(mediaCatalogue.map((work) => work.id));
  parsed.forEach((node) => {
    if (node.type !== "thought") return;
    node.anchors.forEach((anchor) => {
      if (!validMediaIds.has(anchor)) seedError(`Thought ${node.id} anchors an unavailable Media work.`);
    });
  });
  return parsed;
}

function parseEdges(value: unknown, nodes: readonly SeedNode[]): SeedEdge[] {
  if (!Array.isArray(value)) seedError("edges must be an array.");
  const ids = new Set(nodes.map((node) => node.id));
  const user = nodes.find((node): node is SeedUserNode => node.type === "user");
  if (!user) return seedError("nodes must contain a user.");
  const thoughts = nodes.filter((node): node is SeedThoughtNode => node.type === "thought");
  const expected = new Set<string>();
  thoughts.forEach((thought) => {
    expected.add(`authored:${user.id}:${thought.id}`);
    thought.anchors.forEach((anchor, index) => {
      expected.add(`${index === 0 ? "primary-anchor" : "additional-anchor"}:${thought.id}:${anchor}`);
    });
  });
  const edgeIds = new Set<string>();
  const actual = new Set<string>();
  const allowedKinds = new Set<SeedEdge["kind"]>(["authored", "primary-anchor", "additional-anchor"]);

  const parsed = value.map((candidate, index): SeedEdge => {
    const record = asRecord(candidate, `edges[${index}]`);
    const id = nonEmptyString(record.id, `edges[${index}].id`);
    const source = nonEmptyString(record.source, `edges[${index}].source`);
    const target = nonEmptyString(record.target, `edges[${index}].target`);
    if (!ids.has(source) || !ids.has(target)) seedError(`edges[${index}] must connect known nodes.`);
    if (edgeIds.has(id)) seedError(`edges[${index}].id duplicates ${id}.`);
    edgeIds.add(id);
    if (typeof record.kind !== "string" || !allowedKinds.has(record.kind as SeedEdge["kind"])) {
      return seedError(`edges[${index}].kind is unsupported.`);
    }
    const kind = record.kind as SeedEdge["kind"];
    const signature = `${kind}:${source}:${target}`;
    if (!expected.has(signature) || actual.has(signature)) {
      return seedError(`edges[${index}] does not match an authored or anchored Thought relationship.`);
    }
    actual.add(signature);
    return { id, source, target, kind };
  });

  if (actual.size !== expected.size || [...expected].some((signature) => !actual.has(signature))) {
    seedError("edges must represent every authored and anchored Thought relationship.");
  }
  return parsed;
}

/**
 * Validates the complete prototype-seed boundary before trusted graph data
 * reaches composition. The parser intentionally preserves the current fixed
 * seed facts and returns fresh mutable data for the existing prototype flow.
 */
export function parsePrototypeSeed(value: unknown): SeedGraph {
  const record = asRecord(value, "seed");
  const profile = parseProfile(record.profile);
  const nodes = parseNodes(record.nodes);
  const mediaIds = new Set(nodes.filter((node): node is SeedMediaNode => node.type === "media").map((node) => node.id));
  const publicMediaIds = new Set(
    nodes
      .filter((node): node is SeedThoughtNode => node.type === "thought")
      .flatMap((thought) => thought.anchors),
  );
  profile.featuredMediaIds.forEach((id) => {
    if (!mediaIds.has(id) || !publicMediaIds.has(id)) {
      seedError("profile.featuredMediaIds must name public Media works.");
    }
  });
  return { profile, nodes, edges: parseEdges(record.edges, nodes) };
}

export function getSeedGraph(): SeedGraph {
  return parsePrototypeSeed({ profile, nodes, edges });
}
