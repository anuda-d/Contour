export const profile = Object.freeze({
  id: "mira-vale",
  displayName: "Mira Vale",
  handle: "@miravale",
  initials: "MV",
  identityLine: "Films, books, and the ideas I keep returning to.",
});

export const nodes = Object.freeze([
  {
    id: "mira",
    type: "user",
    label: "Mira Vale",
    note: "A map of what stayed with me",
  },
  {
    id: "left-hand",
    type: "media",
    format: "book",
    title: "The Left Hand of Darkness",
    creator: "Ursula K. Le Guin",
    year: 1969,
  },
  {
    id: "dispossessed",
    type: "media",
    format: "book",
    title: "The Dispossessed",
    creator: "Ursula K. Le Guin",
    year: 1974,
  },
  {
    id: "bluets",
    type: "media",
    format: "book",
    title: "Bluets",
    creator: "Maggie Nelson",
    year: 2009,
  },
  {
    id: "arrival",
    type: "media",
    format: "film",
    title: "Arrival",
    creator: "Denis Villeneuve",
    year: 2016,
  },
  {
    id: "mood-for-love",
    type: "media",
    format: "film",
    title: "In the Mood for Love",
    creator: "Wong Kar-wai",
    year: 2000,
  },
  {
    id: "aftersun",
    type: "media",
    format: "film",
    title: "Aftersun",
    creator: "Charlotte Wells",
    year: 2022,
  },
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
    profile: { ...profile },
    nodes: nodes.map((node) => ({
      ...node,
      ...(node.anchors ? { anchors: [...node.anchors] } : {}),
    })),
    edges: edges.map((edge) => ({ ...edge })),
  };
}
