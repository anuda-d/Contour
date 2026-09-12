import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const inventoryPath = resolve("docs/architecture/QUALITY_GATE_INVENTORY.md");
const criteriaIds = Array.from({ length: 8 }, (_, index) => `AF-${index + 1}`);
const invariantIds = Array.from({ length: 12 }, (_, index) => `INV-${String(index + 1).padStart(2, "0")}`);
const namedProofs = new Set([
  "npm run check:architecture",
  "npm run typecheck",
  "npm run build",
  "./scripts/check.sh",
]);
const requiredLayers = new Set([
  "product",
  "application",
  "adapter",
  "DOM",
  "architecture",
  "strict-build",
  "rendered",
  "repository",
]);

type InventoryRow = {
  id: string;
  claim: string;
  layers: string[];
  proofs: string[];
};

function parseRows(document: string): InventoryRow[] {
  const rows: InventoryRow[] = [];
  for (const line of document.split("\n")) {
    if (!line.startsWith("| ") || line.startsWith("| ---") || line.startsWith("| ID |")) {
      continue;
    }
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 4 || cells.some((cell) => cell.length === 0)) {
      throw new Error(`Malformed inventory row: ${line}`);
    }
    const [id = "", claim = "", layerText = "", proofText = ""] = cells;
    const proofs = [...proofText.matchAll(/`([^`]+)`/g)].map((match) => match[1] ?? "");
    if (proofs.length === 0 || proofText.replace(/`[^`]+`/g, "").replace(/[;\s]/g, "") !== "") {
      throw new Error(`Malformed proof list for ${id}`);
    }
    rows.push({
      id,
      claim,
      layers: layerText.split(",").map((layer) => layer.trim()),
      proofs,
    });
  }
  return rows;
}

function validateRows(rows: InventoryRow[], root: string): void {
  const expectedIds = [...criteriaIds, ...invariantIds];
  assert.deepEqual(rows.map((row) => row.id).sort(), expectedIds.sort(), "inventory IDs must be complete and unique");

  const observedLayers = new Set<string>();
  for (const row of rows) {
    assert.match(row.claim, /\S/, `${row.id} must name a protected claim`);
    assert.ok(row.layers.length > 0 && row.layers.every((layer) => layer.length > 0), `${row.id} has malformed layers`);
    for (const layer of row.layers) {
      observedLayers.add(layer);
    }
    for (const proof of row.proofs) {
      const proofPath = resolve(root, proof);
      if (proof.startsWith("tests/")) {
        assert.ok(existsSync(proofPath), `${row.id} references a missing test: ${proof}`);
        continue;
      }
      assert.ok(namedProofs.has(proof) || existsSync(proofPath), `${row.id} has an unresolvable proof: ${proof}`);
    }
  }
  for (const layer of requiredLayers) {
    assert.ok(observedLayers.has(layer), `inventory is missing the ${layer} proof layer`);
  }
}

test("quality-gate inventory covers every architecture criterion and protected invariant", () => {
  validateRows(parseRows(readFileSync(inventoryPath, "utf8")), process.cwd());
});

test("quality-gate inventory rejects malformed, duplicate, missing, and unresolvable evidence", () => {
  const validRow = "| AF-1 | Enforced ownership. | architecture, repository | `tests/architecture-boundaries.test.ts`; `./scripts/check.sh` |";
  assert.throws(() => parseRows("| AF-1 | Only three cells | architecture |\n"), /Malformed inventory row/);
  assert.throws(
    () => validateRows(parseRows(`${validRow}\n${validRow}`), process.cwd()),
    /complete and unique/,
  );
  assert.throws(
    () => validateRows(parseRows(validRow), process.cwd()),
    /complete and unique/,
  );
  const fullRows = [...criteriaIds, ...invariantIds].map((id) =>
    `| ${id} | Protected claim. | architecture, repository | \`tests/missing-proof.test.ts\`; \`./scripts/check.sh\` |`,
  );
  assert.throws(() => validateRows(parseRows(fullRows.join("\n")), process.cwd()), /missing test/);
});
