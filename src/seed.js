import { mediaCatalogue } from "./product/catalogue/catalogue.ts";

export const profile = Object.freeze({
  id: "mira-vale",
  displayName: "Mira Vale",
  handle: "@miravale",
  initials: "MV",
  identityLine: "Films, books, and the ideas I keep returning to.",
  featuredMediaIds: Object.freeze(["dispossessed", "mood-for-love", "aftersun"]),
});

export const nodes = Object.freeze([
  {
    id: "mira",
    type: "user",
    label: "Mira Vale",
    note: "A map of what stayed with me",
  },
  ...mediaCatalogue.map((item) => Object.freeze({ ...item, type: "media" })),
  {
    id: "thought-language",
    type: "thought",
    status: "published",
    statement:
      "The future changes when language gives us another way to hold time.",
    anchors: ["arrival", "left-hand"],
  },
  {
    id: "thought-silence",
    type: "thought",
    status: "published",
    statement:
      "Intimacy becomes clearest in what two people choose not to say.",
    anchors: ["mood-for-love", "bluets"],
  },
  {
    id: "thought-memory",
    type: "thought",
    status: "published",
    statement: "Memory edits love until absence starts to feel like a place.",
    anchors: ["aftersun", "bluets"],
  },
  {
    id: "thought-freedom",
    type: "thought",
    status: "published",
    statement: "A home can be both shelter and a rehearsal for freedom.",
    anchors: ["dispossessed", "left-hand"],
  },
]);

export const edges = Object.freeze([
  ...nodes
    .filter((node) => node.type === "thought")
    .map((node) => ({
      id: `authored-${node.id}`,
      source: "mira",
      target: node.id,
      kind: "authored",
    })),
  ...nodes
    .filter((node) => node.type === "thought")
    .flatMap((node) =>
      node.anchors.map((anchor, index) => ({
        id: `anchor-${node.id}-${anchor}`,
        source: node.id,
        target: anchor,
        kind: index === 0 ? "primary-anchor" : "additional-anchor",
      })),
    ),
]);

export function getSeedGraph() {
  return {
    profile: { ...profile, featuredMediaIds: [...profile.featuredMediaIds] },
    nodes: nodes.map((node) => ({
      ...node,
      ...(node.anchors ? { anchors: [...node.anchors] } : {}),
    })),
    edges: edges.map((edge) => ({ ...edge })),
  };
}
