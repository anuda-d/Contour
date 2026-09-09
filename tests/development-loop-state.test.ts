import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

const stateScript = resolve("scripts/development_loop_state.py");

type Result = { status: number | null; stdout: string; stderr: string };
type LoopState = {
  revision: number;
  phase: string;
  authorization: string;
  completion_audit_count: number;
  ui_checkpoint_count: number;
  generation: {
    id: string;
    orchestrator_claim_id: string | null;
    orchestrator_task_id: string | null;
    dispatch_ticket: string;
    accepted_slices: Array<{ slice_id: string; commit: string }>;
  } | null;
  active_slice: {
    slice_id: string;
    contract: Record<string, unknown>;
    contract_hash: string;
    dispatch_ticket: string;
    writer_claim_id: string | null;
    writer_task_id: string | null;
    phase: string;
    repair_attempts: number;
  } | null;
};

type Fixture = {
  root: string;
  repository: string;
  statePath: string;
  contractPath: string;
  terminalEvidencePath: string;
  automationPath: string;
};

function run(fixture: Fixture, ...args: string[]): Result {
  return runAs(fixture, actorFor(fixture, args), ...args);
}

function runAs(fixture: Fixture, actor: string, ...args: string[]): Result {
  const result = spawnSync(
    "python3",
    [stateScript, "--path", fixture.statePath, "--repository", fixture.repository, ...args],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        CODEX_HOME: resolve(fixture.root, "codex-home"),
        CODEX_THREAD_ID: actor,
      },
    },
  );
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function command(fixture: Fixture, ...args: string[]): Promise<Result> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(
      "python3",
      [stateScript, "--path", fixture.statePath, "--repository", fixture.repository, ...args],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          CODEX_HOME: resolve(fixture.root, "codex-home"),
          CODEX_THREAD_ID: actorFor(fixture, args),
        },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (value: string) => (stdout += value));
    child.stderr.on("data", (value: string) => (stderr += value));
    child.on("error", reject);
    child.on("close", (status) => resolveResult({ status, stdout, stderr }));
  });
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function actorFor(fixture: Fixture, args: string[]): string {
  const commandName = args[0];
  if (commandName === "claim-generation") return option(args, "--orchestrator-task-id") ?? "missing";
  if (commandName === "claim-writer") return option(args, "--writer-task-id") ?? "missing";
  if (commandName === "record-review") return option(args, "--reviewer-task-id") ?? "missing";
  if (commandName === "record-goal-review") return option(args, "--reviewer-task-id") ?? "missing";
  if (commandName === "recover-orchestrator" || commandName === "recover-writer") {
    return option(args, "--new-task-id") ?? "missing";
  }
  if (commandName === "migrate" || commandName === "reserve-generation" || commandName === "status") {
    return "test-control";
  }
  try {
    const current = state(fixture);
    if (
      commandName === "begin-slice" ||
      commandName === "request-alignment" ||
      commandName === "begin-alignment" ||
      commandName === "complete-alignment" ||
      commandName === "record-completion-audit" ||
      commandName === "record-ui-checkpoint" ||
      commandName === "mark-writer-incomplete" ||
      commandName === "set-generation-state" ||
      commandName === "resume-generation"
    ) {
      return current.generation?.orchestrator_task_id ?? "missing";
    }
    return current.active_slice?.writer_task_id ?? "missing";
  } catch {
    return "test-control";
  }
}

function state(fixture: Fixture): LoopState {
  return JSON.parse(readFileSync(fixture.statePath, "utf8")) as LoopState;
}

function git(fixture: Fixture, ...args: string[]): string {
  const result = spawnSync("git", ["-C", fixture.repository, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function withFixture(runFixture: (fixture: Fixture) => void | Promise<void>): Promise<void> | void {
  const root = mkdtempSync(resolve(tmpdir(), "contour-loop-state-"));
  const fixture = {
    root,
    repository: resolve(root, "repository"),
    statePath: resolve(root, "state.json"),
    contractPath: resolve(root, "contract.json"),
    terminalEvidencePath: resolve(root, "repository", "terminal-evidence.json"),
    automationPath: resolve(
      root,
      "codex-home/automations/bproject-autonomous-graph-loop/automation.toml",
    ),
  };
  spawnSync("mkdir", [fixture.repository]);
  spawnSync("git", ["-C", fixture.repository, "init", "-q"]);
  spawnSync("git", ["-C", fixture.repository, "config", "user.name", "Test"]);
  spawnSync("git", ["-C", fixture.repository, "config", "user.email", "test@example.test"]);
  writeFileSync(resolve(fixture.repository, "README.md"), "baseline\n", "utf8");
  const terminalDocumentRoot = resolve(
    fixture.repository,
    "docs/plans/architecture-foundation",
  );
  mkdirSync(terminalDocumentRoot, { recursive: true });
  writeFileSync(resolve(fixture.repository, "docs/plans/CURRENT.md"), "current\n", "utf8");
  writeFileSync(resolve(terminalDocumentRoot, "GOAL.md"), "goal\n", "utf8");
  writeFileSync(resolve(terminalDocumentRoot, "IMPLEMENTATION_PLAN.md"), "plan\n", "utf8");
  writeFileSync(
    fixture.terminalEvidencePath,
    `${JSON.stringify({
      schema_version: 1,
      goal_id: "architecture-foundation",
      criteria: Object.fromEntries(
        Array.from({ length: 10 }, (_, index) => [`AF-${index + 1}`, "accepted"]),
      ),
      full_validation: { status: "pass", evidence: "full repository check passed" },
      rendered_walkthrough: { status: "pass", evidence: "rendered walkthrough passed" },
      legacy_compatibility: { status: "pass", evidence: "legacy migration passed" },
      terminal_documents: [
        "docs/plans/CURRENT.md",
        "docs/plans/architecture-foundation/GOAL.md",
        "docs/plans/architecture-foundation/IMPLEMENTATION_PLAN.md",
      ],
    })}\n`,
    "utf8",
  );
  mkdirSync(resolve(fixture.root, "codex-home/automations/bproject-autonomous-graph-loop"), {
    recursive: true,
  });
  writeFileSync(
    fixture.automationPath,
    'id = "bproject-autonomous-graph-loop"\nstatus = "PAUSED"\n',
    "utf8",
  );
  git(fixture, "add", ".");
  git(fixture, "commit", "-qm", "baseline");
  writeContract(fixture, "slice-1");
  const cleanup = () => rmSync(root, { recursive: true, force: true });
  try {
    const result = runFixture(fixture);
    if (result instanceof Promise) return result.finally(cleanup);
    cleanup();
  } catch (error) {
    cleanup();
    throw error;
  }
}

function writeContract(fixture: Fixture, sliceId: string, uiChange = false): void {
  writeFileSync(
    fixture.contractPath,
    `${JSON.stringify({
      slice_id: sliceId,
      criterion: "AF-test",
      responsibility: `complete ${sliceId}`,
      acceptance_gap: `missing ${sliceId}`,
      completion_condition: `${sliceId} is proven`,
      included_paths: ["README.md"],
      preservation_boundaries: ["product behavior"],
      validation_commands: ["npm test", "./scripts/check.sh"],
      ui_change: uiChange,
    })}\n`,
    "utf8",
  );
}

function migrate(fixture: Fixture, current = "none", incomplete = "none", ...extra: string[]): Result {
  return run(
    fixture,
    "migrate",
    "--goal-id",
    "architecture-foundation",
    "--authorization",
    "standing",
    "--repository-commit",
    git(fixture, "rev-parse", "HEAD"),
    "--completion-audit-count",
    "3",
    "--ui-checkpoint-count",
    "0",
    "--legacy-current-run",
    current,
    "--legacy-incomplete-run",
    incomplete,
    ...extra,
  );
}

function startGeneration(fixture: Fixture, operationId = "start-generation"): LoopState {
  let result = run(
    fixture,
    "reserve-generation",
    "--operation-id",
    operationId,
    "--expected-revision",
    String(state(fixture).revision),
    "--repository-commit",
    git(fixture, "rev-parse", "HEAD"),
  );
  assert.equal(result.status, 0, result.stderr);
  let current = state(fixture);
  assert.ok(current.generation);
  result = run(
    fixture,
    "claim-generation",
    "--operation-id",
    `claim-${operationId}`,
    "--expected-revision",
    String(current.revision),
    "--dispatch-ticket",
    current.generation.dispatch_ticket,
    "--orchestrator-task-id",
    "orchestrator-1",
  );
  assert.equal(result.status, 0, result.stderr);
  current = state(fixture);
  assert.ok(current.generation);
  result = run(
    fixture,
    "record-completion-audit",
    "--operation-id",
    `audit-${operationId}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--orchestrator-claim-id",
    current.generation.orchestrator_claim_id!,
    "--repository-commit",
    git(fixture, "rev-parse", "HEAD"),
    "--evidence",
    "whole-goal audit complete",
  );
  assert.equal(result.status, 0, result.stderr);
  return state(fixture);
}

function reserveRecovery(
  fixture: Fixture,
  role: "orchestrator" | "writer",
  expectedTaskId: string,
  expectedClaimId: string,
  operationId: string,
): string {
  const current = state(fixture);
  assert.ok(current.generation);
  const result = runAs(
    fixture,
    "scheduler-control",
    "reserve-recovery",
    "--operation-id",
    operationId,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--role",
    role,
    "--expected-task-id",
    expectedTaskId,
    "--expected-claim-id",
    expectedClaimId,
    "--verified-terminal",
  );
  assert.equal(result.status, 0, result.stderr);
  const match = result.stdout.match(/ticket=([0-9a-f]{32})/);
  assert.ok(match);
  return match[1]!;
}

function selectAndClaim(
  fixture: Fixture,
  sliceId: string,
  writer: string,
  uiChange = false,
): LoopState {
  writeContract(fixture, sliceId, uiChange);
  let current = state(fixture);
  assert.ok(current.generation);
  let result = run(
    fixture,
    "begin-slice",
    "--operation-id",
    `select-${sliceId}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--orchestrator-claim-id",
    current.generation.orchestrator_claim_id!,
    "--contract-file",
    fixture.contractPath,
    "--base-commit",
    git(fixture, "rev-parse", "HEAD"),
  );
  assert.equal(result.status, 0, result.stderr);
  current = state(fixture);
  assert.ok(current.generation && current.active_slice);
  result = run(
    fixture,
    "claim-writer",
    "--operation-id",
    `claim-${sliceId}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--dispatch-ticket",
    current.active_slice.dispatch_ticket,
    "--writer-task-id",
    writer,
  );
  assert.equal(result.status, 0, result.stderr);
  return state(fixture);
}

function advanceToReview(fixture: Fixture): { current: LoopState; contentId: string } {
  let current = state(fixture);
  assert.ok(current.generation && current.active_slice?.writer_claim_id);
  writeFileSync(
    resolve(fixture.repository, "README.md"),
    `${readFileSync(resolve(fixture.repository, "README.md"), "utf8")}candidate-${current.active_slice.slice_id}-${current.active_slice.repair_attempts}\n`,
    "utf8",
  );
  git(fixture, "add", "README.md");
  const contentId = git(fixture, "write-tree");
  let result = run(
    fixture,
    "advance-slice",
    "--operation-id",
    `validate-${current.active_slice.slice_id}-${current.active_slice.repair_attempts}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--writer-claim-id",
    current.active_slice.writer_claim_id,
    "--to",
    "validating",
  );
  assert.equal(result.status, 0, result.stderr);
  current = state(fixture);
  assert.ok(current.generation && current.active_slice?.writer_claim_id);
  result = run(
    fixture,
    "record-validation",
    "--operation-id",
    `evidence-${current.active_slice.slice_id}-${current.active_slice.repair_attempts}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--writer-claim-id",
    current.active_slice.writer_claim_id,
    "--content-id",
    contentId,
    "--focused-evidence",
    "focused passed",
    "--full-evidence",
    "full passed",
  );
  assert.equal(result.status, 0, result.stderr);
  return { current: state(fixture), contentId };
}

function passReviewAndCommit(fixture: Fixture, contentId: string, reviewer: string): LoopState {
  let current = state(fixture);
  assert.ok(current.generation && current.active_slice?.writer_claim_id);
  let result = run(
    fixture,
    "record-review",
    "--operation-id",
    `review-${current.active_slice.slice_id}-${reviewer}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--writer-claim-id",
    current.active_slice.writer_claim_id,
    "--content-id",
    contentId,
    "--reviewer-task-id",
    reviewer,
    "--result",
    "pass",
    "--evidence",
    "clean review",
  );
  assert.equal(result.status, 0, result.stderr);
  current = state(fixture);
  assert.ok(current.generation && current.active_slice?.writer_claim_id);
  const message = `accept ${current.active_slice.slice_id}\n\nContour-Slice: ${current.active_slice.slice_id}\nContour-Contract: ${current.active_slice.contract_hash}`;
  git(fixture, "commit", "-qm", message);
  const commit = git(fixture, "rev-parse", "HEAD");
  result = run(
    fixture,
    "finalize-slice",
    "--operation-id",
    `accept-${current.active_slice.slice_id}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--writer-claim-id",
    current.active_slice.writer_claim_id,
    "--commit",
    commit,
    "--content-id",
    contentId,
  );
  assert.equal(result.status, 0, result.stderr);
  return state(fixture);
}

function passReview(fixture: Fixture, contentId: string, reviewer: string): LoopState {
  const current = state(fixture);
  assert.ok(current.generation && current.active_slice?.writer_claim_id);
  const result = run(
    fixture,
    "record-review",
    "--operation-id",
    `review-only-${current.active_slice.slice_id}-${reviewer}`,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--writer-claim-id",
    current.active_slice.writer_claim_id,
    "--content-id",
    contentId,
    "--reviewer-task-id",
    reviewer,
    "--result",
    "pass",
    "--evidence",
    "clean review",
  );
  assert.equal(result.status, 0, result.stderr);
  return state(fixture);
}

function finalize(
  fixture: Fixture,
  current: LoopState,
  commit: string,
  contentId: string,
  operationId: string,
): Result {
  assert.ok(current.generation && current.active_slice?.writer_claim_id);
  return run(
    fixture,
    "finalize-slice",
    "--operation-id",
    operationId,
    "--expected-revision",
    String(current.revision),
    "--generation-id",
    current.generation.id,
    "--writer-claim-id",
    current.active_slice.writer_claim_id,
    "--commit",
    commit,
    "--content-id",
    contentId,
  );
}

test("idle legacy state migrates once while conflicting legacy runs fail closed", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    assert.equal(state(fixture).phase, "idle");
    assert.equal(state(fixture).completion_audit_count, 3);
    assert.equal(state(fixture).ui_checkpoint_count, 0);
    assert.equal(state(fixture).completion_audit_count, 3);
    assert.equal(state(fixture).ui_checkpoint_count, 0);
    assert.match(migrate(fixture).stdout, /^STATE_EXISTS revision=0/);

    const conflictFixture = { ...fixture, statePath: resolve(fixture.root, "conflict.json") };
    const conflict = migrate(conflictFixture, "slice-a", "slice-b");
    assert.equal(conflict.status, 2);
    assert.match(conflict.stderr, /LEGACY_RUN_CONFLICT/);
  }));

test("an incomplete legacy run requires and preserves its exact frozen contract", () =>
  withFixture((fixture) => {
    const missing = migrate(fixture, "slice-1", "slice-1");
    assert.equal(missing.status, 2);
    assert.match(missing.stderr, /LEGACY_INCOMPLETE_REQUIRES_CONTRACT/);
    const migrated = migrate(
      fixture,
      "slice-1",
      "slice-1",
      "--contract-file",
      fixture.contractPath,
      "--orchestrator-task-id",
      "orchestrator-1",
    );
    assert.equal(migrated.status, 0, migrated.stderr);
    assert.equal(state(fixture).active_slice?.phase, "incomplete");
    assert.equal(state(fixture).active_slice?.contract.slice_id, "slice-1");
    let current = state(fixture);
    assert.ok(current.generation && current.active_slice);
    const claimed = run(
      fixture,
      "claim-writer",
      "--operation-id",
      "claim-migrated-incomplete",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--dispatch-ticket",
      current.active_slice.dispatch_ticket,
      "--writer-task-id",
      "writer-legacy-recovery",
    );
    assert.equal(claimed.status, 0, claimed.stderr);
    current = state(fixture);
    assert.equal(current.active_slice?.phase, "implementing");
    assert.equal(current.active_slice?.writer_task_id, "writer-legacy-recovery");
  }));

test("concurrent scheduler reservations create one generation and stale revisions fail", () =>
  withFixture(async (fixture) => {
    assert.equal(migrate(fixture).status, 0);
    const base = git(fixture, "rev-parse", "HEAD");
    const results = await Promise.all(
      ["a", "b"].map((name) =>
        command(
          fixture,
          "reserve-generation",
          "--operation-id",
          `start-${name}`,
          "--expected-revision",
          "0",
          "--repository-commit",
          base,
        ),
      ),
    );
    assert.equal(results.filter((result) => result.status === 0).length, 1);
    assert.equal(results.filter((result) => result.status === 2).length, 1);
    assert.match(results.find((result) => result.status === 2)?.stderr ?? "", /STALE_REVISION/);
    assert.equal(state(fixture).phase, "generation_pending");
    assert.equal(state(fixture).generation?.orchestrator_task_id, null);
  }));

test("operation IDs replay identical reservations but reject different input", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    const first = run(
      fixture,
      "reserve-generation",
      "--operation-id",
      "same-operation",
      "--expected-revision",
      "0",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(first.status, 0, first.stderr);
    const revision = state(fixture).revision;
    const replay = run(
      fixture,
      "reserve-generation",
      "--operation-id",
      "same-operation",
      "--expected-revision",
      "0",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(replay.status, 0, replay.stderr);
    assert.equal(state(fixture).revision, revision);
    const reused = run(
      fixture,
      "reserve-generation",
      "--operation-id",
      "same-operation",
      "--expected-revision",
      "0",
      "--repository-commit",
      "different-commit",
    );
    assert.equal(reused.status, 2);
    assert.match(reused.stderr, /OPERATION_ID_REUSED/);
  }));

test("a dispatch ticket admits one fresh writer and embeds an immutable contract", () =>
  withFixture(async (fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    writeContract(fixture, "slice-1");
    let current = state(fixture);
    assert.ok(current.generation);
    assert.equal(
      run(
        fixture,
        "begin-slice",
        "--operation-id",
        "select",
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation.id,
        "--orchestrator-claim-id",
        current.generation.orchestrator_claim_id!,
        "--contract-file",
        fixture.contractPath,
        "--base-commit",
        git(fixture, "rev-parse", "HEAD"),
      ).status,
      0,
    );
    current = state(fixture);
    assert.ok(current.generation && current.active_slice);
    const revision = current.revision;
    const results = await Promise.all(
      ["writer-a", "writer-b"].map((writer) =>
        command(
          fixture,
          "claim-writer",
          "--operation-id",
          `claim-${writer}`,
          "--expected-revision",
          String(revision),
          "--generation-id",
          current.generation!.id,
          "--dispatch-ticket",
          current.active_slice!.dispatch_ticket,
          "--writer-task-id",
          writer,
        ),
      ),
    );
    assert.equal(results.filter((result) => result.status === 0).length, 1);
    writeContract(fixture, "tampered-slice");
    assert.equal(state(fixture).active_slice?.contract.slice_id, "slice-1");
  }));

test("validation and review bind to one content identity and retries persist to incomplete", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    for (let attempt = 0; attempt < 4; attempt += 1) {
      let review = advanceToReview(fixture);
      let current = review.current;
      assert.ok(current.generation && current.active_slice?.writer_claim_id);
      const stale = run(
        fixture,
        "record-review",
        "--operation-id",
        `stale-${attempt}`,
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation.id,
        "--writer-claim-id",
        current.active_slice.writer_claim_id,
        "--content-id",
        "different-content",
        "--reviewer-task-id",
        `stale-reviewer-${attempt}`,
        "--result",
        "pass",
        "--evidence",
        "stale",
      );
      assert.equal(stale.status, 2);
      assert.match(stale.stderr, /STALE_REVIEW_CONTENT/);
      current = state(fixture);
      const blocked = run(
        fixture,
        "record-review",
        "--operation-id",
        `block-${attempt}`,
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation!.id,
        "--writer-claim-id",
        current.active_slice!.writer_claim_id!,
        "--content-id",
        review.contentId,
        "--reviewer-task-id",
        `reviewer-${attempt}`,
        "--result",
        "block",
        "--evidence",
        "blocking finding",
      );
      assert.equal(blocked.status, 0, blocked.stderr);
    }
    assert.equal(state(fixture).active_slice?.phase, "incomplete");
    assert.equal(state(fixture).active_slice?.repair_attempts, 3);
  }));

test("role claims require the recorded task and reviewers cannot be writers", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    const review = advanceToReview(fixture);
    const current = review.current;
    assert.ok(current.generation && current.active_slice?.writer_claim_id);
    const wrongCaller = runAs(
      fixture,
      "different-task",
      "record-review",
      "--operation-id",
      "wrong-caller",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--writer-claim-id",
      current.active_slice.writer_claim_id,
      "--content-id",
      review.contentId,
      "--reviewer-task-id",
      "reviewer-1",
      "--result",
      "pass",
      "--evidence",
      "invalid caller",
    );
    assert.equal(wrongCaller.status, 2);
    assert.match(wrongCaller.stderr, /CALLER_TASK_MISMATCH/);
    const orchestratorReview = runAs(
      fixture,
      "orchestrator-1",
      "record-review",
      "--operation-id",
      "orchestrator-review",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--writer-claim-id",
      current.active_slice.writer_claim_id,
      "--content-id",
      review.contentId,
      "--reviewer-task-id",
      "orchestrator-1",
      "--result",
      "pass",
      "--evidence",
      "not independent",
    );
    assert.equal(orchestratorReview.status, 2);
    assert.match(orchestratorReview.stderr, /REVIEWER_NOT_INDEPENDENT/);
    const selfReview = run(
      fixture,
      "record-review",
      "--operation-id",
      "self-review",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--writer-claim-id",
      current.active_slice.writer_claim_id,
      "--content-id",
      review.contentId,
      "--reviewer-task-id",
      "writer-1",
      "--result",
      "pass",
      "--evidence",
      "self review",
    );
    assert.equal(selfReview.status, 2);
    assert.match(selfReview.stderr, /REVIEWER_NOT_INDEPENDENT/);
  }));

test("task identities are fresh globally across every lifecycle role", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    const persisted = JSON.parse(readFileSync(fixture.statePath, "utf8")) as Record<string, unknown> & {
      task_history: { reviewers: string[] };
    };
    persisted.task_history.reviewers.push("historic-reviewer");
    writeFileSync(fixture.statePath, `${JSON.stringify(persisted)}\n`, "utf8");
    let result = run(
      fixture,
      "reserve-generation",
      "--operation-id",
      "reserve-after-reviewer",
      "--expected-revision",
      "0",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(result.status, 0, result.stderr);
    let current = state(fixture);
    result = runAs(
      fixture,
      "historic-reviewer",
      "claim-generation",
      "--operation-id",
      "reuse-reviewer-as-orchestrator",
      "--expected-revision",
      String(current.revision),
      "--dispatch-ticket",
      current.generation!.dispatch_ticket,
      "--orchestrator-task-id",
      "historic-reviewer",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /ORCHESTRATOR_NOT_FRESH/);
    result = runAs(
      fixture,
      "orchestrator-1",
      "claim-generation",
      "--operation-id",
      "fresh-orchestrator",
      "--expected-revision",
      String(current.revision),
      "--dispatch-ticket",
      current.generation!.dispatch_ticket,
      "--orchestrator-task-id",
      "orchestrator-1",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = run(
      fixture,
      "record-completion-audit",
      "--operation-id",
      "freshness-audit",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--evidence",
      "audit",
    );
    assert.equal(result.status, 0, result.stderr);
    writeContract(fixture, "slice-1");
    current = state(fixture);
    result = run(
      fixture,
      "begin-slice",
      "--operation-id",
      "freshness-select",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--contract-file",
      fixture.contractPath,
      "--base-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = runAs(
      fixture,
      "historic-reviewer",
      "claim-writer",
      "--operation-id",
      "reuse-reviewer-as-writer",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--dispatch-ticket",
      current.active_slice!.dispatch_ticket,
      "--writer-task-id",
      "historic-reviewer",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /WRITER_NOT_FRESH/);
  }));

test("only reviewed commits with exact trailers count and three slices force alignment", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    for (let number = 1; number <= 3; number += 1) {
      selectAndClaim(fixture, `slice-${number}`, `writer-${number}`);
      const review = advanceToReview(fixture);
      const accepted = passReviewAndCommit(
        fixture,
        review.contentId,
        `reviewer-${number}`,
      );
      assert.equal(accepted.generation?.accepted_slices.length, number);
      assert.equal(accepted.phase, number === 3 ? "alignment_due" : "selecting");
    }
    const current = state(fixture);
    writeContract(fixture, "slice-4");
    const fourth = run(
      fixture,
      "begin-slice",
      "--operation-id",
      "select-fourth",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--contract-file",
      fixture.contractPath,
      "--base-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(fourth.status, 2);
    assert.match(fourth.stderr, /INVALID_TRANSITION|GENERATION_SLICE_LIMIT/);
  }));

test("finalization rejects an unreviewed descendant and an unreleased checkout", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    const review = advanceToReview(fixture);
    let current = passReview(fixture, review.contentId, "reviewer-1");
    assert.ok(current.generation && current.active_slice?.writer_claim_id);
    const trailers = `Contour-Slice: ${current.active_slice.slice_id}\nContour-Contract: ${current.active_slice.contract_hash}`;
    git(
      fixture,
      "commit",
      "-qm",
      `reviewed\n\n${trailers}\nContour-Slice: conflicting-slice`,
    );
    let reviewedCommit = git(fixture, "rev-parse", "HEAD");
    const duplicateTrailer = finalize(
      fixture,
      current,
      reviewedCommit,
      review.contentId,
      "duplicate-trailer-finalize",
    );
    assert.equal(duplicateTrailer.status, 2);
    assert.match(duplicateTrailer.stderr, /COMMIT_TRAILER_MISMATCH/);
    git(fixture, "commit", "--amend", "-qm", `reviewed\n\n${trailers}`);
    reviewedCommit = git(fixture, "rev-parse", "HEAD");

    const lockDigest = createHash("sha256").update(realpathSync(fixture.repository)).digest("hex").slice(0, 16);
    const lockPath = resolve(tmpdir(), `contour-development-loop-${lockDigest}.json`);
    writeFileSync(lockPath, '{"version":2,"task_id":"writer-1","claim_id":"claim","claimed_at":1}\n');
    const held = finalize(fixture, current, reviewedCommit, review.contentId, "held-finalize");
    assert.equal(held.status, 2);
    assert.match(held.stderr, /CHECKOUT_OWNERSHIP_NOT_RELEASED/);
    rmSync(lockPath, { force: true });

    writeFileSync(resolve(fixture.repository, "README.md"), "unreviewed descendant\n", "utf8");
    git(fixture, "add", "README.md");
    git(fixture, "commit", "-qm", `unreviewed\n\n${trailers}`);
    current = state(fixture);
    const unreviewed = finalize(
      fixture,
      current,
      git(fixture, "rev-parse", "HEAD"),
      review.contentId,
      "unreviewed-finalize",
    );
    assert.equal(unreviewed.status, 2);
    assert.match(unreviewed.stderr, /COMMIT_CONTENT_MISMATCH/);
  }));

test("recovery requires exact unchanged claims and does not reset its budget", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    let current = startGeneration(fixture);
    assert.ok(current.generation);
    const stale = runAs(
      fixture,
      "scheduler-control",
      "reserve-recovery",
      "--operation-id",
      "stale-recovery",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--expected-task-id",
      current.generation.orchestrator_task_id!,
      "--expected-claim-id",
      "wrong-claim",
      "--role",
      "orchestrator",
      "--verified-terminal",
    );
    assert.equal(stale.status, 2);
    assert.match(stale.stderr, /RECOVERY_CLAIM_MISMATCH/);
    for (let recovery = 1; recovery <= 4; recovery += 1) {
      current = state(fixture);
      assert.ok(current.generation);
      const priorTask = current.generation.orchestrator_task_id!;
      const priorClaim = current.generation.orchestrator_claim_id!;
      const ticket = reserveRecovery(
        fixture,
        "orchestrator",
        priorTask,
        priorClaim,
        `reserve-recovery-${recovery}`,
      );
      current = state(fixture);
      assert.ok(current.generation);
      const next = run(
        fixture,
        "recover-orchestrator",
        "--operation-id",
        `recovery-${recovery}`,
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation.id,
        "--expected-task-id",
        priorTask,
        "--expected-claim-id",
        priorClaim,
        "--dispatch-ticket",
        ticket,
        "--new-task-id",
        `orchestrator-${recovery + 1}`,
        "--verified-terminal",
      );
      assert.equal(next.status, 0, next.stderr);
    }
    assert.equal(state(fixture).phase, "blocked");
  }));

test("an interrupted writer recovers the same slice, contract, and phase", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    let current = selectAndClaim(fixture, "slice-1", "writer-1");
    assert.ok(current.generation && current.active_slice?.writer_claim_id);
    const contractHash = current.active_slice.contract_hash;
    const interrupted = run(
      fixture,
      "mark-writer-incomplete",
      "--operation-id",
      "mark-interrupted",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--orchestrator-claim-id",
      current.generation.orchestrator_claim_id!,
      "--writer-task-id",
      "writer-1",
      "--writer-claim-id",
      current.active_slice.writer_claim_id,
      "--reason",
      "verified terminal writer",
      "--verified-terminal",
    );
    assert.equal(interrupted.status, 0, interrupted.stderr);
    current = state(fixture);
    assert.equal(current.active_slice?.phase, "incomplete");
    const ticket = reserveRecovery(
      fixture,
      "writer",
      "writer-1",
      current.active_slice!.writer_claim_id!,
      "reserve-writer-recovery",
    );
    current = state(fixture);
    const recovered = run(
      fixture,
      "recover-writer",
      "--operation-id",
      "recover-interrupted",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--expected-task-id",
      "writer-1",
      "--expected-claim-id",
      current.active_slice!.writer_claim_id!,
      "--dispatch-ticket",
      ticket,
      "--new-task-id",
      "writer-2",
      "--verified-terminal",
    );
    assert.equal(recovered.status, 0, recovered.stderr);
    current = state(fixture);
    assert.equal(current.active_slice?.phase, "implementing");
    assert.equal(current.active_slice?.contract_hash, contractHash);
    assert.equal(current.active_slice?.writer_task_id, "writer-2");
  }));

test("recovery dispatch intent is durable before task creation", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    let current = selectAndClaim(fixture, "slice-1", "writer-1");
    assert.ok(current.generation && current.active_slice?.writer_claim_id);
    let result = run(
      fixture,
      "mark-writer-incomplete",
      "--operation-id",
      "terminal-writer",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--orchestrator-claim-id",
      current.generation.orchestrator_claim_id!,
      "--writer-task-id",
      "writer-1",
      "--writer-claim-id",
      current.active_slice.writer_claim_id,
      "--reason",
      "verified terminal",
      "--verified-terminal",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    const ticket = reserveRecovery(
      fixture,
      "writer",
      "writer-1",
      current.active_slice!.writer_claim_id!,
      "reserve-once",
    );
    current = state(fixture);
    result = runAs(
      fixture,
      "scheduler-control",
      "reserve-recovery",
      "--operation-id",
      "reserve-duplicate",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--role",
      "writer",
      "--expected-task-id",
      "writer-1",
      "--expected-claim-id",
      current.active_slice!.writer_claim_id!,
      "--verified-terminal",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /RECOVERY_ALREADY_RESERVED/);
    result = runAs(
      fixture,
      "writer-2",
      "recover-writer",
      "--operation-id",
      "wrong-ticket",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--expected-task-id",
      "writer-1",
      "--expected-claim-id",
      current.active_slice!.writer_claim_id!,
      "--dispatch-ticket",
      "wrong-ticket",
      "--new-task-id",
      "writer-2",
      "--verified-terminal",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /RECOVERY_DISPATCH_MISMATCH/);
    result = runAs(
      fixture,
      "writer-2",
      "recover-writer",
      "--operation-id",
      "claim-reserved-recovery",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--expected-task-id",
      "writer-1",
      "--expected-claim-id",
      current.active_slice!.writer_claim_id!,
      "--dispatch-ticket",
      ticket,
      "--new-task-id",
      "writer-2",
      "--verified-terminal",
    );
    assert.equal(result.status, 0, result.stderr);
  }));

test("repair exhaustion is terminal and cannot be reset by writer recovery", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const review = advanceToReview(fixture);
      const current = review.current;
      const blocked = run(
        fixture,
        "record-review",
        "--operation-id",
        `terminal-block-${attempt}`,
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation!.id,
        "--writer-claim-id",
        current.active_slice!.writer_claim_id!,
        "--content-id",
        review.contentId,
        "--reviewer-task-id",
        `terminal-reviewer-${attempt}`,
        "--result",
        "block",
        "--evidence",
        "blocking",
      );
      assert.equal(blocked.status, 0, blocked.stderr);
    }
    const current = state(fixture);
    assert.equal(current.active_slice?.phase, "incomplete");
    const reserve = runAs(
      fixture,
      "scheduler-control",
      "reserve-recovery",
      "--operation-id",
      "bypass-repair-budget",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--role",
      "writer",
      "--expected-task-id",
      current.active_slice!.writer_task_id!,
      "--expected-claim-id",
      current.active_slice!.writer_claim_id!,
      "--verified-terminal",
    );
    assert.equal(reserve.status, 2);
    assert.match(reserve.stderr, /SLICE_NOT_RECOVERABLE/);
  }));

test("alignment produces a compact successor-free durable handoff", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    const review = advanceToReview(fixture);
    passReviewAndCommit(fixture, review.contentId, "reviewer-1");
    let current = state(fixture);
    assert.ok(current.generation);
    assert.equal(
      run(
        fixture,
        "request-alignment",
        "--operation-id",
        "request-alignment",
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation.id,
        "--orchestrator-claim-id",
        current.generation.orchestrator_claim_id!,
        "--reason",
        "natural goal boundary",
      ).status,
      0,
    );
    current = state(fixture);
    assert.equal(
      run(
        fixture,
        "begin-alignment",
        "--operation-id",
        "begin-alignment",
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation!.id,
        "--orchestrator-claim-id",
        current.generation!.orchestrator_claim_id!,
      ).status,
      0,
    );
    current = state(fixture);
    assert.equal(
      run(
        fixture,
        "record-completion-audit",
        "--operation-id",
        "alignment-completion-audit",
        "--expected-revision",
        String(current.revision),
        "--generation-id",
        current.generation!.id,
        "--orchestrator-claim-id",
        current.generation!.orchestrator_claim_id!,
        "--repository-commit",
        git(fixture, "rev-parse", "HEAD"),
        "--evidence",
        "whole-goal completion audit",
      ).status,
      0,
    );
    const handoff = resolve(fixture.root, "handoff.md");
    writeFileSync(handoff, "# Handoff\n\nNo next slice selected.\n", "utf8");
    current = state(fixture);
    const lockDigest = createHash("sha256")
      .update(realpathSync(fixture.repository))
      .digest("hex")
      .slice(0, 16);
    const lockPath = resolve(tmpdir(), `contour-development-loop-${lockDigest}.json`);
    writeFileSync(lockPath, '{"version":3,"task_id":"other","claim_id":"claim","generation_id":"g","writer_claim_id":"w","claimed_at":1}\n');
    const lockedAlignment = run(
      fixture,
      "complete-alignment",
      "--operation-id",
      "locked-alignment",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--handoff-file",
      handoff,
    );
    assert.equal(lockedAlignment.status, 2);
    assert.match(lockedAlignment.stderr, /ALIGNMENT_CHECKOUT_OWNED/);
    rmSync(lockPath, { force: true });
    const complete = run(
      fixture,
      "complete-alignment",
      "--operation-id",
      "complete-alignment",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--handoff-file",
      handoff,
    );
    assert.equal(complete.status, 0, complete.stderr);
    current = state(fixture);
    assert.equal(current.phase, "handoff_ready");
    const terminalCheckpoint = run(
      fixture,
      "record-ui-checkpoint",
      "--operation-id",
      "terminal-ui-checkpoint",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--evidence",
      "final rendered walkthrough",
    );
    assert.equal(terminalCheckpoint.status, 0, terminalCheckpoint.stderr);
    current = state(fixture);
    const blockedReview = run(
      fixture,
      "record-goal-review",
      "--operation-id",
      "terminal-goal-review-blocked",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--reviewer-task-id",
      "goal-reviewer-blocked",
      "--result",
      "block",
      "--evidence",
      "blocking whole-goal finding",
    );
    assert.equal(blockedReview.status, 0, blockedReview.stderr);
    current = state(fixture);
    const blockedCompletion = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "goal-complete-with-blocking-review",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "complete",
      "--reason",
      "must fail",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--terminal-evidence-file",
      fixture.terminalEvidencePath,
    );
    assert.equal(blockedCompletion.status, 2);
    assert.match(blockedCompletion.stderr, /MISSING_FINAL_REVIEW/);
    const finalReview = run(
      fixture,
      "record-goal-review",
      "--operation-id",
      "terminal-goal-review",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--reviewer-task-id",
      "goal-reviewer-final",
      "--result",
      "pass",
      "--evidence",
      "clean independent whole-goal review",
    );
    assert.equal(finalReview.status, 0, finalReview.stderr);
    current = state(fixture);
    writeFileSync(
      fixture.automationPath,
      'id = "bproject-autonomous-graph-loop"\nstatus = "ACTIVE"\n',
      "utf8",
    );
    const activeAutomation = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "goal-complete-while-automation-active",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "complete",
      "--reason",
      "must fail",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--terminal-evidence-file",
      fixture.terminalEvidencePath,
    );
    assert.equal(activeAutomation.status, 2);
    assert.match(activeAutomation.stderr, /AUTOMATION_NOT_PAUSED/);
    writeFileSync(fixture.automationPath, 'id = "wrong-automation"\nstatus = "PAUSED"\n', "utf8");
    const wrongAutomation = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "goal-complete-with-wrong-automation",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "complete",
      "--reason",
      "must fail",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--terminal-evidence-file",
      fixture.terminalEvidencePath,
    );
    assert.equal(wrongAutomation.status, 2);
    assert.match(wrongAutomation.stderr, /AUTOMATION_ID_MISMATCH/);
    writeFileSync(
      fixture.automationPath,
      'id = "bproject-autonomous-graph-loop"\nstatus = "PAUSED"\n',
      "utf8",
    );
    const goalComplete = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "goal-complete",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "complete",
      "--reason",
      "all goal gates accepted",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--terminal-evidence-file",
      fixture.terminalEvidencePath,
    );
    assert.equal(goalComplete.status, 0, goalComplete.stderr);
    assert.equal(state(fixture).phase, "complete");
    assert.equal(state(fixture).authorization, "pending");
    const completed = JSON.parse(readFileSync(fixture.statePath, "utf8")) as {
      completion_evidence: {
        repository_commit: string;
        evidence_path: string;
        evidence_schema_version: number;
      };
    };
    assert.equal(completed.completion_evidence.evidence_path, "terminal-evidence.json");
    assert.equal(completed.completion_evidence.evidence_schema_version, 1);
    completed.completion_evidence.repository_commit = "divergent-terminal-commit";
    writeFileSync(fixture.statePath, `${JSON.stringify(completed)}\n`, "utf8");
    assert.match(run(fixture, "status").stderr, /terminal commit mismatch/);
  }));

test("goal completion cannot bypass alignment handoff verification", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    const review = advanceToReview(fixture);
    passReviewAndCommit(fixture, review.contentId, "reviewer-1");
    let current = state(fixture);
    let result = run(
      fixture,
      "request-alignment",
      "--operation-id",
      "completion-request-alignment",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--reason",
      "goal completion",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = run(
      fixture,
      "begin-alignment",
      "--operation-id",
      "completion-begin-alignment",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "premature-complete",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "complete",
      "--reason",
      "attempted bypass",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /GOAL_COMPLETION_NOT_READY/);
  }));

test("accepted slices advance durable audit and UI checkpoint counters", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-ui", "writer-ui", true);
    const review = advanceToReview(fixture);
    let current = passReviewAndCommit(fixture, review.contentId, "reviewer-ui");
    assert.equal(current.completion_audit_count, 1);
    assert.equal(current.ui_checkpoint_count, 1);
    let result = run(
      fixture,
      "record-completion-audit",
      "--operation-id",
      "reset-audit-counter",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--evidence",
      "all criteria audited",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = run(
      fixture,
      "record-ui-checkpoint",
      "--operation-id",
      "reset-ui-counter",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
      "--evidence",
      "rendered checkpoint passed",
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(state(fixture).completion_audit_count, 0);
    assert.equal(state(fixture).ui_checkpoint_count, 0);
  }));

test("repository baselines are verified from clean authoritative Git state", () =>
  withFixture((fixture) => {
    const invalidMigration = run(
      fixture,
      "migrate",
      "--goal-id",
      "architecture-foundation",
      "--authorization",
      "standing",
      "--repository-commit",
      "not-head",
      "--completion-audit-count",
      "3",
      "--ui-checkpoint-count",
      "0",
      "--legacy-current-run",
      "none",
      "--legacy-incomplete-run",
      "none",
    );
    assert.equal(invalidMigration.status, 2);
    assert.match(invalidMigration.stderr, /MIGRATION_NOT_AUTHORITATIVE_HEAD/);
    assert.equal(migrate(fixture).status, 0);
    writeFileSync(resolve(fixture.repository, "README.md"), "dirty\n", "utf8");
    let result = run(
      fixture,
      "reserve-generation",
      "--operation-id",
      "dirty-reserve",
      "--expected-revision",
      "0",
      "--repository-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /GENERATION_BASELINE_CHECKOUT_NOT_CLEAN/);
    writeFileSync(resolve(fixture.repository, "README.md"), "baseline\n", "utf8");
    startGeneration(fixture, "verified-generation");
    writeFileSync(resolve(fixture.repository, "README.md"), "external commit\n", "utf8");
    git(fixture, "add", "README.md");
    git(fixture, "commit", "-qm", "external commit");
    writeContract(fixture, "slice-1");
    const current = state(fixture);
    result = run(
      fixture,
      "begin-slice",
      "--operation-id",
      "discontinuous-base",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--contract-file",
      fixture.contractPath,
      "--base-commit",
      git(fixture, "rev-parse", "HEAD"),
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /SLICE_BASE_DISCONTINUITY/);
  }));

test("pause, resume, block, and complete are explicit authorized transitions", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    let current = startGeneration(fixture);
    assert.ok(current.generation);
    let result = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "pause",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--orchestrator-claim-id",
      current.generation.orchestrator_claim_id!,
      "--to",
      "paused",
      "--reason",
      "owner pause",
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(state(fixture).authorization, "paused");
    current = state(fixture);
    result = run(
      fixture,
      "resume-generation",
      "--operation-id",
      "resume",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--owner-authorized",
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(state(fixture).phase, "selecting");
    assert.equal(state(fixture).authorization, "standing");
    current = state(fixture);
    result = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "block",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "blocked",
      "--reason",
      "explicit blocker",
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(state(fixture).phase, "blocked");
  }));

test("pause and block fence every active writer transition", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    let current = selectAndClaim(fixture, "slice-1", "writer-1");
    assert.ok(current.generation && current.active_slice?.writer_claim_id);
    const writerClaim = current.active_slice.writer_claim_id;
    let result = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "pause-active-writer",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation.id,
      "--orchestrator-claim-id",
      current.generation.orchestrator_claim_id!,
      "--to",
      "paused",
      "--reason",
      "owner pause",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = runAs(
      fixture,
      "writer-1",
      "advance-slice",
      "--operation-id",
      "writer-after-pause",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--writer-claim-id",
      writerClaim,
      "--to",
      "validating",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /WRITER_NOT_ACTIVE/);
    result = run(
      fixture,
      "resume-generation",
      "--operation-id",
      "resume-active-writer",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--owner-authorized",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    assert.equal(current.phase, "slice_active");
    result = run(
      fixture,
      "set-generation-state",
      "--operation-id",
      "block-active-writer",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--orchestrator-claim-id",
      current.generation!.orchestrator_claim_id!,
      "--to",
      "blocked",
      "--reason",
      "technical blocker",
    );
    assert.equal(result.status, 0, result.stderr);
    current = state(fixture);
    result = runAs(
      fixture,
      "writer-1",
      "advance-slice",
      "--operation-id",
      "writer-after-block",
      "--expected-revision",
      String(current.revision),
      "--generation-id",
      current.generation!.id,
      "--writer-claim-id",
      writerClaim,
      "--to",
      "validating",
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /WRITER_NOT_ACTIVE/);
  }));

test("malformed and unknown-version state records fail closed", () =>
  withFixture((fixture) => {
    writeFileSync(fixture.statePath, "not json\n", "utf8");
    assert.match(run(fixture, "status").stderr, /UNREADABLE_STATE/);
    writeFileSync(fixture.statePath, '{"schema_version":99}\n', "utf8");
    assert.match(run(fixture, "status").stderr, /UNSUPPORTED_STATE_VERSION/);
    rmSync(fixture.statePath, { force: true });
    assert.equal(migrate(fixture).status, 0);
    let malformed = JSON.parse(readFileSync(fixture.statePath, "utf8")) as Record<string, unknown>;
    malformed.operations = [{ id: "partial" }];
    writeFileSync(fixture.statePath, `${JSON.stringify(malformed)}\n`, "utf8");
    assert.match(run(fixture, "status").stderr, /INVALID_STATE missing operation.fingerprint/);
    assert.equal(rmSync(fixture.statePath, { force: true }), undefined);
    assert.equal(migrate(fixture).status, 0);
    malformed = JSON.parse(readFileSync(fixture.statePath, "utf8")) as Record<string, unknown>;
    malformed.phase = "complete";
    malformed.authorization = "pending";
    writeFileSync(fixture.statePath, `${JSON.stringify(malformed)}\n`, "utf8");
    assert.match(run(fixture, "status").stderr, /INVALID_STATE missing generation/);
  }));

test("cross-field review evidence and generated commit trailers fail closed", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    startGeneration(fixture);
    selectAndClaim(fixture, "slice-1", "writer-1");
    const review = advanceToReview(fixture);
    passReview(fixture, review.contentId, "reviewer-1");
    const valid = JSON.parse(readFileSync(fixture.statePath, "utf8")) as Record<string, unknown> & {
      active_slice: {
        review: { contract_hash: string };
        commit_intent: { trailer: string };
      };
    };
    const wrongContract = structuredClone(valid);
    wrongContract.active_slice.review.contract_hash = "wrong-contract";
    writeFileSync(fixture.statePath, `${JSON.stringify(wrongContract)}\n`, "utf8");
    assert.match(run(fixture, "status").stderr, /review contract mismatch/);
    const wrongTrailer = structuredClone(valid);
    wrongTrailer.active_slice.commit_intent.trailer = "Untrusted-Trailer: bypass";
    writeFileSync(fixture.statePath, `${JSON.stringify(wrongTrailer)}\n`, "utf8");
    assert.match(run(fixture, "status").stderr, /commit intent mismatch/);
  }));

test("structured state rejects a different checkout root", () =>
  withFixture((fixture) => {
    assert.equal(migrate(fixture).status, 0);
    const otherRepository = resolve(fixture.root, "other-repository");
    spawnSync("mkdir", [otherRepository]);
    spawnSync("git", ["-C", otherRepository, "init", "-q"]);
    const result = spawnSync(
      "python3",
      [
        stateScript,
        "--path",
        fixture.statePath,
        "--repository",
        otherRepository,
        "status",
      ],
      { encoding: "utf8", env: { ...process.env, CODEX_THREAD_ID: "test-control" } },
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /REPOSITORY_ROOT_MISMATCH/);
  }));
