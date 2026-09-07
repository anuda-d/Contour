import { getPrototypeFacts } from "../../src/adapters/seed/prototype-seed.ts";
import { getCatalogue } from "../../src/product/catalogue/catalogue.ts";
import { emptyDraftState, type ThoughtState } from "../../src/product/authorship/draft-state.ts";
import { buildMapGraph } from "../../src/product/map/map-graph.ts";

export function getPrototypeMapGraph(state: ThoughtState = emptyDraftState()) {
  return buildMapGraph({ prototype: getPrototypeFacts(), catalogue: getCatalogue() }, state);
}

export { getPrototypeFacts };
