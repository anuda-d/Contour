import type { CatalogueWork } from "../catalogue/catalogue.ts";
import type { OwnerIdentity } from "../identity/owner-profile.ts";
import type { SeededPublishedThought, Thought, ThoughtState } from "../authorship/draft-state.ts";

export type MapGraphProfile = {
  id: string;
  displayName: string;
  handle: string;
  initials: string;
  identityLine: string;
  featuredMediaIds: string[];
};

export type MapGraphUserNode = {
  id: string;
  type: "user";
  label: string;
  note: string;
};

export type MapGraphMediaNode = CatalogueWork & { type: "media" };

export type MapGraphThoughtNode = {
  id: string;
  type: "thought";
  status: "draft" | "published";
  statement: string;
  anchors: string[];
  createdAt?: string;
  publishedAt?: string;
};

export type MapGraphNode = MapGraphUserNode | MapGraphMediaNode | MapGraphThoughtNode;

export type MapGraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: "authored" | "primary-anchor" | "additional-anchor";
};

export type MapGraph = {
  profile: MapGraphProfile;
  nodes: MapGraphNode[];
  edges: MapGraphEdge[];
};

export type PrototypeFacts = Readonly<{
  owner: OwnerIdentity;
  seededThoughts: readonly SeededPublishedThought[];
  defaultFeaturedMediaIds: readonly string[];
}>;

export type MapProjectionFacts = Readonly<{
  prototype: PrototypeFacts;
  catalogue: readonly CatalogueWork[];
}>;

function authoredEdges(
  ownerId: string,
  thoughts: readonly Pick<SeededPublishedThought | Thought, "id">[],
): MapGraphEdge[] {
  return thoughts.map((thought) => ({
    id: `authored-${thought.id}`,
    source: ownerId,
    target: thought.id,
    kind: "authored",
  }));
}

function anchorEdges(
  thoughts: readonly Pick<SeededPublishedThought | Thought, "id" | "primaryMediaId" | "secondaryMediaId">[],
): MapGraphEdge[] {
  return thoughts.flatMap((thought) => [
    {
      id: `anchor-${thought.id}-${thought.primaryMediaId}`,
      source: thought.id,
      target: thought.primaryMediaId,
      kind: "primary-anchor" as const,
    },
    ...(thought.secondaryMediaId
      ? [{
          id: `anchor-${thought.id}-${thought.secondaryMediaId}`,
          source: thought.id,
          target: thought.secondaryMediaId,
          kind: "additional-anchor" as const,
        }]
      : []),
  ]);
}

function seededNode(thought: SeededPublishedThought): MapGraphThoughtNode {
  return {
    id: thought.id,
    type: "thought",
    status: "published",
    statement: thought.statement,
    anchors: [thought.primaryMediaId, ...(thought.secondaryMediaId ? [thought.secondaryMediaId] : [])],
  };
}

function persistedNode(thought: Thought): MapGraphThoughtNode {
  return {
    id: thought.id,
    type: "thought",
    status: thought.status,
    statement: thought.statement,
    anchors: [thought.primaryMediaId, ...(thought.secondaryMediaId ? [thought.secondaryMediaId] : [])],
    createdAt: thought.createdAt,
    ...(thought.status === "published" ? { publishedAt: thought.publishedAt } : {}),
  };
}

/**
 * Builds the Map-only representation from product facts.
 * Authorship and anchor relationships are deliberately derived here rather
 * than stored as independently mutable graph edges.
 */
export function buildMapGraph(
  facts: MapProjectionFacts,
  draftState: ThoughtState,
  featuredMediaIds: readonly string[] = facts.prototype.defaultFeaturedMediaIds,
): MapGraph {
  const { prototype, catalogue } = facts;
  const { owner } = prototype;
  const persistedThoughts = draftState.thoughts.filter(
    (thought) => !prototype.seededThoughts.some((seeded) => seeded.id === thought.id),
  );
  const seedEdges = [
    ...authoredEdges(owner.mapIdentity.id, prototype.seededThoughts),
    ...anchorEdges(prototype.seededThoughts),
  ];
  const persistedEdges = persistedThoughts.flatMap((thought) => [
    ...authoredEdges(owner.mapIdentity.id, [thought]),
    ...anchorEdges([thought]),
  ]);

  return {
    profile: { ...owner.profile, featuredMediaIds: [...featuredMediaIds] },
    nodes: [
      { ...owner.mapIdentity, type: "user" },
      ...catalogue.map((work) => ({ ...work, type: "media" as const })),
      ...prototype.seededThoughts.map(seededNode),
      ...persistedThoughts.map(persistedNode),
    ],
    edges: [...seedEdges, ...persistedEdges],
  };
}
