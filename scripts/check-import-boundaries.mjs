import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, relative, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const sourceExtensions = new Set([".js", ".mjs", ".cjs", ".jsx", ".ts", ".mts", ".cts", ".tsx"]);
const layers = new Set(["kernel", "product", "application", "adapters", "ui", "composition"]);
const legacyLayers = new Map([
  ["app.js", "composition"],
  ["map.js", "ui"],
  ["thought-capture.js", "ui"],
  ["work-chooser.js", "ui"],
  ["seed.js", "product"],
  ["draft-state.js", "product"],
  ["selection-state.js", "product"],
  ["featured-state.js", "product"],
  ["pinned-state.js", "product"],
  ["graph-projection.js", "product"],
  ["layout.js", "product"],
]);
const permittedTargets = {
  kernel: new Set(["kernel"]),
  product: new Set(["kernel", "product"]),
  application: new Set(["kernel", "product", "application"]),
  adapters: new Set(["kernel", "product", "application", "adapters"]),
  ui: new Set(["kernel", "application", "ui"]),
  composition: layers,
};

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(entryPath);
    return sourceExtensions.has(extname(entry.name)) ? [entryPath] : [];
  });
}

function sourceLayer(sourceRoot, filePath) {
  const sourceRelativePath = relative(sourceRoot, filePath);
  const [firstSegment] = sourceRelativePath.split("/");
  if (layers.has(firstSegment)) return { layer: firstSegment, legacy: false };
  if (sourceRelativePath.includes("/")) return null;
  const legacyLayer = legacyLayers.get(basename(filePath));
  return legacyLayer ? { layer: legacyLayer, legacy: true } : null;
}

function resolveSourceImport(repositoryRoot, importerPath, specifier) {
  const withoutQuery = specifier.split("?")[0];
  const relativeSpecifier = withoutQuery.startsWith(".");
  const rootSourceSpecifier = withoutQuery.startsWith("/src/");
  if (!relativeSpecifier && !rootSourceSpecifier) return { sourceSpecifier: false, path: null };
  const candidate = relativeSpecifier
    ? resolve(dirname(importerPath), withoutQuery)
    : resolve(repositoryRoot, withoutQuery.slice(1));
  const candidates = [
    candidate,
    ...[...sourceExtensions].map((extension) => `${candidate}${extension}`),
    ...[...sourceExtensions].map((extension) => resolve(candidate, `index${extension}`)),
  ];
  return {
    sourceSpecifier: true,
    path: candidates.find((path) => existsSync(path) && statSync(path).isFile()) ?? null,
  };
}

function literalSpecifier(node) {
  if (node?.type === "StringLiteral") return node.value;
  if (node?.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("");
  }
  return null;
}

function hasRuntimeBinding(path, name) {
  const binding = path.scope.getBinding(name);
  if (!binding) return false;
  const declaration = binding.path.parentPath;
  if (declaration?.isVariableDeclaration() && declaration.node.declare) return false;
  if (binding.path.isImportSpecifier() || binding.path.isImportDefaultSpecifier() || binding.path.isImportNamespaceSpecifier()) {
    const importDeclaration = declaration;
    return importDeclaration?.node.importKind !== "type" && binding.path.node.importKind !== "type";
  }
  return true;
}

function isNamedMember(node, objectName, propertyName) {
  if (node?.type !== "MemberExpression" && node?.type !== "OptionalMemberExpression") return false;
  const propertyMatches = node.computed
    ? node.property?.type === "StringLiteral" && node.property.value === propertyName
    : node.property?.type === "Identifier" && node.property.name === propertyName;
  return node.object?.type === "Identifier" && node.object.name === objectName && propertyMatches;
}

function isExportsProperty(node) {
  return (node?.type === "MemberExpression" || node?.type === "OptionalMemberExpression") && (
    node.computed
      ? node.property?.type === "StringLiteral" && node.property.value === "exports"
      : node.property?.type === "Identifier" && node.property.name === "exports"
  );
}

function isCommonJsExportTarget(node, path) {
  if (node?.type === "Identifier") return node.name === "exports" && !hasRuntimeBinding(path, "exports");
  if (node?.type !== "MemberExpression" && node?.type !== "OptionalMemberExpression") return false;
  if (node.object?.type === "Identifier" && node.object.name === "exports" && !hasRuntimeBinding(path, "exports")) return true;
  if (isExportsProperty(node) && node.object?.type === "Identifier" && node.object.name === "module" && !hasRuntimeBinding(path, "module")) return true;
  return isCommonJsExportTarget(node.object, path);
}

function isImportMetaGlob(node) {
  if (node?.type !== "MemberExpression") return false;
  const propertyIsGlob = node.computed
    ? node.property?.type === "StringLiteral" && node.property.value === "glob"
    : node.property?.type === "Identifier" && node.property.name === "glob";
  return propertyIsGlob && node.object?.type === "MetaProperty" && node.object.meta.name === "import" && node.object.property.name === "meta";
}

function isImportMetaUrl(node) {
  return (node?.type === "MemberExpression" || node?.type === "OptionalMemberExpression")
    && !node.computed
    && node.object?.type === "MetaProperty"
    && node.object.meta.name === "import"
    && node.object.property.name === "meta"
    && node.property?.type === "Identifier"
    && node.property.name === "url";
}

function isViteSourceUrl(path) {
  const node = path.node;
  return node.callee?.type === "Identifier"
    && node.callee.name === "URL"
    && !hasRuntimeBinding(path, "URL")
    && isImportMetaUrl(node.arguments[1]);
}

function isRuntimeReference(path) {
  return !path.findParent((parent) => parent.isTSType());
}

function collectModuleSpecifiers(source, importerPath, importerLabel) {
  const extension = extname(importerPath);
  const ast = parse(source, {
    sourceType: "unambiguous",
    plugins: ["typescript", ...(extension === ".jsx" || extension === ".tsx" ? ["jsx"] : []), "importAttributes"],
    sourceFilename: importerLabel,
  });
  const specifiers = [];
  let commonJsExportCount = 0;
  let commonJsRequireCount = 0;
  let viteGlobCount = 0;
  const addSpecifier = (node, kind) => specifiers.push({ specifier: literalSpecifier(node), kind });
  const addCommonJsRequire = (path) => {
    const callee = path.node.callee;
    const isGlobalRequire = callee?.type === "Identifier" && callee.name === "require" && !hasRuntimeBinding(path, "require");
    const isGlobalModuleRequire = isNamedMember(callee, "module", "require") && !hasRuntimeBinding(path, "module");
    if (!isGlobalRequire && !isGlobalModuleRequire) return;
    addSpecifier(path.node.arguments[0], "CommonJS require");
    commonJsRequireCount += 1;
  };
  const addTypeScriptReferencePaths = () => {
    for (const comment of ast.comments ?? []) {
      const match = /^\s*\/\s*<reference\s+path\s*=\s*(["'])(.*?)\1\s*\/?\s*>\s*$/.exec(comment.value);
      if (match) specifiers.push({ specifier: match[2], kind: "TypeScript reference path" });
    }
  };
  traverse.default(ast, {
    ImportDeclaration(path) { addSpecifier(path.node.source, "import"); },
    ExportNamedDeclaration(path) { if (path.node.source) addSpecifier(path.node.source, "export"); },
    ExportAllDeclaration(path) { addSpecifier(path.node.source, "export"); },
    ImportExpression(path) { addSpecifier(path.node.source, "dynamic import"); },
    TSImportType(path) { addSpecifier(path.node.argument, "type import"); },
    TSImportEqualsDeclaration(path) {
      if (path.node.moduleReference?.type === "TSExternalModuleReference") {
        addSpecifier(path.node.moduleReference.expression, "type import");
        commonJsRequireCount += 1;
      }
    },
    TSModuleDeclaration(path) {
      if (path.node.id?.type === "StringLiteral") addSpecifier(path.node.id, "TypeScript module augmentation");
    },
    TSExportAssignment() { commonJsExportCount += 1; },
    CallExpression(path) {
      if (path.node.callee?.type === "Import") addSpecifier(path.node.arguments[0], "dynamic import");
      addCommonJsRequire(path);
      if (isNamedMember(path.node.callee, "Object", "assign") && isCommonJsExportTarget(path.node.arguments[0], path)) {
        commonJsExportCount += 1;
      }
      if (isImportMetaGlob(path.node.callee)) viteGlobCount += 1;
    },
    NewExpression(path) {
      if (isViteSourceUrl(path)) addSpecifier(path.node.arguments[0], "Vite URL");
    },
    OptionalCallExpression(path) { addCommonJsRequire(path); },
    AssignmentExpression(path) {
      if (isCommonJsExportTarget(path.node.left, path)) commonJsExportCount += 1;
    },
    ReferencedIdentifier(path) {
      if (!isRuntimeReference(path)) return;
      if (path.node.name === "require" && !hasRuntimeBinding(path, "require")) commonJsRequireCount += 1;
      if ((path.node.name === "exports" || path.node.name === "module") && !hasRuntimeBinding(path, path.node.name)) {
        commonJsExportCount += 1;
      }
    },
  });
  addTypeScriptReferencePaths();
  return { specifiers, commonJsExportCount, commonJsRequireCount, viteGlobCount };
}

export function validateArchitectureBoundaries(repositoryRoot) {
  const sourceRoot = resolve(repositoryRoot, "src");
  if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) {
    return [`Missing source directory: ${sourceRoot}`];
  }

  const violations = [];
  for (const importerPath of walkFiles(sourceRoot)) {
    const importer = sourceLayer(sourceRoot, importerPath);
    const importerLabel = relative(repositoryRoot, importerPath);
    if (!importer) {
      violations.push(`${importerLabel}: source file is not assigned to a permitted layer.`);
      continue;
    }

    const source = readFileSync(importerPath, "utf8");
    let checkerResult;
    try {
      checkerResult = collectModuleSpecifiers(source, importerPath, importerLabel);
    } catch (error) {
      violations.push(`${importerLabel}: source cannot be parsed for architecture boundaries (${error.message}).`);
      continue;
    }
    if ([".cjs", ".cts"].includes(extname(importerPath))) {
      violations.push(`${importerLabel}: CommonJS source files are not permitted in the Architecture Foundation target.`);
      continue;
    }
    if (checkerResult.commonJsExportCount > 0) {
      violations.push(`${importerLabel}: CommonJS export assignments are not permitted in the Architecture Foundation target.`);
    }
    if (checkerResult.commonJsRequireCount > 0) {
      violations.push(`${importerLabel}: unshadowed CommonJS require calls are not permitted in the Architecture Foundation target.`);
    }
    if (checkerResult.viteGlobCount > 0) {
      violations.push(`${importerLabel}: import.meta.glob is not permitted outside an approved composition adapter.`);
    }
    for (const moduleSpecifier of checkerResult.specifiers) {
      if (moduleSpecifier.specifier == null) {
        violations.push(`${importerLabel}: ${moduleSpecifier.kind} must use a plain literal specifier.`);
        continue;
      }
      const specifier = moduleSpecifier.specifier;
      const sourceImport = resolveSourceImport(repositoryRoot, importerPath, specifier);
      if (!sourceImport.sourceSpecifier) continue;
      if (!sourceImport.path) {
        violations.push(`${importerLabel}: imports unresolved source ${specifier}.`);
        continue;
      }
      const targetPath = sourceImport.path;
      if (!targetPath.startsWith(`${sourceRoot}/`)) {
        violations.push(`${importerLabel}: imports source outside src (${specifier}).`);
        continue;
      }
      const target = sourceLayer(sourceRoot, targetPath);
      const targetLabel = relative(repositoryRoot, targetPath);
      if (!target) {
        violations.push(`${importerLabel}: imports unclassified source ${targetLabel}.`);
        continue;
      }
      if (importer.legacy) continue;
      if (!permittedTargets[importer.layer].has(target.layer)) {
        violations.push(
          `${importerLabel}: ${importer.layer} -> ${target.layer} import is forbidden (${targetLabel}).`,
        );
      }
    }
  }
  return violations;
}

function rootFromArguments(argumentsList) {
  if (argumentsList.length === 0) return process.cwd();
  if (argumentsList.length === 2 && argumentsList[0] === "--root") return resolve(argumentsList[1]);
  throw new Error("Usage: node scripts/check-import-boundaries.mjs [--root repository-root]");
}

function run() {
  const violations = validateArchitectureBoundaries(rootFromArguments(process.argv.slice(2)));
  if (violations.length === 0) {
    console.log("Architecture import-boundary check passed.");
    return;
  }
  console.error("Architecture import-boundary check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
