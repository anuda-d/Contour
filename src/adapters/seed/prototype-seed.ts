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

export function getSeedGraph(): SeedGraph {
  return {
    profile: { ...profile, featuredMediaIds: [...profile.featuredMediaIds] },
    nodes: nodes.map((node): SeedNode => {
      if (node.type === "thought") return { ...node, anchors: [...node.anchors] };
      return { ...node };
    }),
    edges: edges.map((edge) => ({ ...edge })),
  };
}
