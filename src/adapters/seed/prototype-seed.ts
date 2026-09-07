import { mediaCatalogue } from "../../product/catalogue/catalogue.ts";
import type { OwnerIdentity } from "../../product/identity/owner-profile.ts";
import type { SeededPublishedThought } from "../../product/authorship/draft-state.ts";
import type { PrototypeFacts } from "../../product/map/map-graph.ts";

type SeedRecord = Record<string, unknown>;
type RawNode = SeedRecord;

const prototypeSeed = Object.freeze({
  profile: Object.freeze({
    id: "mira-vale",
    displayName: "Mira Vale",
    handle: "@miravale",
    initials: "MV",
    identityLine: "Films, books, and the ideas I keep returning to.",
    featuredMediaIds: Object.freeze(["dispossessed", "mood-for-love", "aftersun"]),
  }),
  nodes: Object.freeze([
    Object.freeze({ id: "mira", type: "user", label: "Mira Vale", note: "A map of what stayed with me" }),
    ...mediaCatalogue.map((item) => Object.freeze({ ...item, type: "media" as const })),
    Object.freeze({ id: "thought-language", type: "thought", status: "published", statement: "The future changes when language gives us another way to hold time.", anchors: Object.freeze(["arrival", "left-hand"]) }),
    Object.freeze({ id: "thought-silence", type: "thought", status: "published", statement: "Intimacy becomes clearest in what two people choose not to say.", anchors: Object.freeze(["mood-for-love", "bluets"]) }),
    Object.freeze({ id: "thought-memory", type: "thought", status: "published", statement: "Memory edits love until absence starts to feel like a place.", anchors: Object.freeze(["aftersun", "bluets"]) }),
    Object.freeze({ id: "thought-freedom", type: "thought", status: "published", statement: "A home can be both shelter and a rehearsal for freedom.", anchors: Object.freeze(["dispossessed", "left-hand"]) }),
  ]),
  edges: Object.freeze([
    Object.freeze({ id: "authored-thought-language", source: "mira", target: "thought-language", kind: "authored" }),
    Object.freeze({ id: "authored-thought-silence", source: "mira", target: "thought-silence", kind: "authored" }),
    Object.freeze({ id: "authored-thought-memory", source: "mira", target: "thought-memory", kind: "authored" }),
    Object.freeze({ id: "authored-thought-freedom", source: "mira", target: "thought-freedom", kind: "authored" }),
    Object.freeze({ id: "anchor-thought-language-arrival", source: "thought-language", target: "arrival", kind: "primary-anchor" }),
    Object.freeze({ id: "anchor-thought-language-left-hand", source: "thought-language", target: "left-hand", kind: "additional-anchor" }),
    Object.freeze({ id: "anchor-thought-silence-mood-for-love", source: "thought-silence", target: "mood-for-love", kind: "primary-anchor" }),
    Object.freeze({ id: "anchor-thought-silence-bluets", source: "thought-silence", target: "bluets", kind: "additional-anchor" }),
    Object.freeze({ id: "anchor-thought-memory-aftersun", source: "thought-memory", target: "aftersun", kind: "primary-anchor" }),
    Object.freeze({ id: "anchor-thought-memory-bluets", source: "thought-memory", target: "bluets", kind: "additional-anchor" }),
    Object.freeze({ id: "anchor-thought-freedom-dispossessed", source: "thought-freedom", target: "dispossessed", kind: "primary-anchor" }),
    Object.freeze({ id: "anchor-thought-freedom-left-hand", source: "thought-freedom", target: "left-hand", kind: "additional-anchor" }),
  ]),
});

function seedError(reason: string): never {
  throw new Error(`Prototype seed is invalid: ${reason}`);
}

function asRecord(value: unknown, label: string): SeedRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) seedError(`${label} must be an object.`);
  return value as SeedRecord;
}

function nonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) seedError(`${label} must be a non-empty string.`);
  return value;
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) seedError(`${label} must be an array.`);
  return value.map((item, index) => nonEmptyString(item, `${label}[${index}]`));
}

function unique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) seedError(`${label} must not contain duplicates.`);
}

function validateNodeEnvelope(nodesValue: unknown): void {
  if (!Array.isArray(nodesValue)) seedError("nodes must be an array.");
  const ids = new Set<string>();
  nodesValue.forEach((node, index) => {
    const record = asRecord(node, `nodes[${index}]`);
    const id = nonEmptyString(record.id, `nodes[${index}].id`);
    if (ids.has(id)) seedError(`nodes[${index}].id duplicates ${id}.`);
    ids.add(id);
    if (record.type !== "user" && record.type !== "media" && record.type !== "thought") {
      seedError(`nodes[${index}].type is unsupported.`);
    }
  });
}

function parseOwner(profileValue: unknown, nodesValue: unknown): { owner: OwnerIdentity; featuredMediaIds: string[] } {
  const profile = asRecord(profileValue, "profile");
  const featuredMediaIds = stringArray(profile.featuredMediaIds, "profile.featuredMediaIds");
  unique(featuredMediaIds, "profile.featuredMediaIds");
  if (featuredMediaIds.length !== 3) seedError("profile.featuredMediaIds must contain exactly three works.");
  if (!Array.isArray(nodesValue)) seedError("nodes must be an array.");
  const users = nodesValue.filter((node): node is RawNode => asRecord(node, "nodes[]").type === "user");
  if (users.length !== 1) seedError("nodes must contain exactly one user.");
  const user = asRecord(users[0], "user");
  return {
    owner: {
      profile: {
        id: nonEmptyString(profile.id, "profile.id"),
        displayName: nonEmptyString(profile.displayName, "profile.displayName"),
        handle: nonEmptyString(profile.handle, "profile.handle"),
        initials: nonEmptyString(profile.initials, "profile.initials"),
        identityLine: nonEmptyString(profile.identityLine, "profile.identityLine"),
      },
      mapIdentity: {
        id: nonEmptyString(user.id, "user.id"),
        label: nonEmptyString(user.label, "user.label"),
        note: nonEmptyString(user.note, "user.note"),
      },
    },
    featuredMediaIds,
  };
}

function parseSeededThoughts(nodesValue: unknown): SeededPublishedThought[] {
  if (!Array.isArray(nodesValue)) seedError("nodes must be an array.");
  const catalogueById = new Map(mediaCatalogue.map((work) => [work.id, work]));
  const mediaNodes = nodesValue.filter((node): node is RawNode => asRecord(node, "nodes[]").type === "media");
  if (mediaNodes.length !== mediaCatalogue.length) seedError("nodes must contain every supported catalogue work.");
  mediaNodes.forEach((node, index) => {
    const record = asRecord(node, `media nodes[${index}]`);
    const work = catalogueById.get(nonEmptyString(record.id, `media nodes[${index}].id`));
    if (!work || record.format !== work.format || record.title !== work.title || record.creator !== work.creator || record.year !== work.year) {
      seedError(`media nodes[${index}] must match its supported catalogue work.`);
    }
  });
  const ids = new Set<string>();
  return nodesValue.flatMap((node, index): SeededPublishedThought[] => {
    const record = asRecord(node, `nodes[${index}]`);
    if (record.type !== "thought") return [];
    const id = nonEmptyString(record.id, `nodes[${index}].id`);
    if (ids.has(id)) seedError(`nodes[${index}].id duplicates ${id}.`);
    ids.add(id);
    if (record.status !== "published") seedError(`nodes[${index}].status must be published.`);
    const anchors = stringArray(record.anchors, `nodes[${index}].anchors`);
    unique(anchors, `nodes[${index}].anchors`);
    if (!anchors.length) seedError(`nodes[${index}].anchors must not be empty.`);
    if (anchors.length > 2) seedError(`nodes[${index}].anchors must not contain more than two works.`);
    if (anchors.some((anchor) => !catalogueById.has(anchor))) seedError(`Thought ${id} anchors an unavailable Media work.`);
    return [{
      id,
      status: "published",
      statement: nonEmptyString(record.statement, `nodes[${index}].statement`),
      primaryMediaId: anchors[0]!,
      ...(anchors[1] ? { secondaryMediaId: anchors[1] } : {}),
    }];
  });
}

function validateDerivedEdges(edgesValue: unknown, ownerId: string, thoughts: readonly SeededPublishedThought[]): void {
  if (!Array.isArray(edgesValue)) seedError("edges must be an array.");
  const expected = [
    ...thoughts.map((thought) => `authored:${ownerId}:${thought.id}`),
    ...thoughts.flatMap((thought) => [
      `primary-anchor:${thought.id}:${thought.primaryMediaId}`,
      ...(thought.secondaryMediaId ? [`additional-anchor:${thought.id}:${thought.secondaryMediaId}`] : []),
    ]),
  ];
  const actual = edgesValue.map((edge, index) => {
    const record = asRecord(edge, `edges[${index}]`);
    return `${nonEmptyString(record.kind, `edges[${index}].kind`)}:${nonEmptyString(record.source, `edges[${index}].source`)}:${nonEmptyString(record.target, `edges[${index}].target`)}`;
  });
  if (actual.length !== expected.length || actual.some((edge, index) => edge !== expected[index])) {
    seedError("edges must represent every authored and anchored Thought relationship in canonical order.");
  }
}

/** Validates legacy-shaped seed input and returns only typed product facts. */
export function parsePrototypeSeed(value: unknown): PrototypeFacts {
  const record = asRecord(value, "seed");
  validateNodeEnvelope(record.nodes);
  const { owner, featuredMediaIds } = parseOwner(record.profile, record.nodes);
  const seededThoughts = parseSeededThoughts(record.nodes);
  const publicMediaIds = new Set(seededThoughts.flatMap((thought) => [thought.primaryMediaId, ...(thought.secondaryMediaId ? [thought.secondaryMediaId] : [])]));
  if (featuredMediaIds.some((id) => !publicMediaIds.has(id))) seedError("profile.featuredMediaIds must name public Media works.");
  validateDerivedEdges(record.edges, owner.mapIdentity.id, seededThoughts);
  return { owner, seededThoughts, defaultFeaturedMediaIds: featuredMediaIds };
}

export function getPrototypeFacts(): PrototypeFacts {
  return parsePrototypeSeed(prototypeSeed);
}
