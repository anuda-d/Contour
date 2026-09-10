import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";

const lockScript = resolve("scripts/development_loop_lock.py");

type LockResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

function withLockFixture(run: (lockPath: string) => void): void {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "contour-loop-lock-"));
  try {
    run(resolve(fixtureRoot, "owner.json"));
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function runLock(lockPath: string, ...args: string[]): LockResult {
  const taskIndex = args.indexOf("--task-id");
  const taskId = taskIndex >= 0 ? args[taskIndex + 1] : undefined;
  if (args[0] === "acquire" && taskId && !existsSync(lockPath)) setActiveWriter(lockPath, taskId);
  const result = spawnSync("python3", [
    lockScript,
    "--path",
    lockPath,
    "--state-path",
    statePath(lockPath),
    "--repository",
    dirname(lockPath),
    ...args,
  ], {
    encoding: "utf8",
    env: taskId ? { ...process.env, CODEX_THREAD_ID: taskId } : process.env,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function statePath(lockPath: string): string {
  return resolve(dirname(lockPath), "state.json");
}

function setActiveWriter(
  lockPath: string,
  taskId: string,
  phase = "slice_active",
  authorization = "standing",
): void {
  const contract = {
    slice_id: "slice-1",
    criterion: "AF-test",
    responsibility: "test ownership",
    acceptance_gap: "ownership unproven",
    completion_condition: "ownership is bound",
    included_paths: ["README.md"],
    preservation_boundaries: ["product behavior"],
    validation_commands: ["./scripts/check.sh"],
    ui_change: false,
  };
  const contractHash = createHash("sha256")
    .update(JSON.stringify(contract, Object.keys(contract).sort()))
    .digest("hex");
  writeFileSync(
    statePath(lockPath),
    `${JSON.stringify({
      schema_version: 1,
      revision: 1,
      goal_id: "architecture-foundation",
      repository_root: dirname(lockPath),
      authorization,
      completion_audit_count: 0,
      ui_checkpoint_count: 0,
      phase,
      generation: {
        id: "generation-1",
        baseline_commit: "baseline",
        dispatch_ticket: "generation-ticket",
        orchestrator_task_id: "orchestrator-1",
        orchestrator_claim_id: "orchestrator-claim-1",
        accepted_slices: [],
        used_writer_task_ids: [taskId],
        orchestrator_recoveries: 0,
        recovery_dispatch: null,
        started_at: 1,
      },
      active_slice: {
        slice_id: "slice-1",
        contract,
        contract_hash: contractHash,
        base_commit: "baseline",
        dispatch_ticket: "writer-ticket",
        dispatch_status: "claimed",
        writer_task_id: taskId,
        writer_claim_id: `writer-claim-${taskId}`,
        phase: "implementing",
        writer_recoveries: 0,
        repair_attempts: 0,
        reviewer_task_ids: [],
        validation: null,
        review: null,
        commit_intent: null,
        recoverable: true,
      },
      last_handoff: null,
      last_completion_audit: null,
      last_ui_checkpoint: null,
      completion_evidence: null,
      goal_completion_review: null,
      operations: [],
      task_history: { orchestrators: ["orchestrator-1"], writers: [taskId], reviewers: [] },
      migrated_from: {
        current_run: "none",
        incomplete_run: "none",
        repository_commit: "baseline",
      },
      updated_at: 1,
    })}\n`,
    "utf8",
  );
}

function claimId(lockPath: string): string {
  return (JSON.parse(readFileSync(lockPath, "utf8")) as { claim_id: string }).claim_id;
}

function runLockFromEnvironment(lockPath: string, taskId: string): LockResult {
  setActiveWriter(lockPath, taskId);
  const result = spawnSync("python3", [
    lockScript,
    "--path",
    lockPath,
      "--state-path",
      statePath(lockPath),
      "--repository",
      dirname(lockPath),
      "acquire",
  ], {
    encoding: "utf8",
    env: { ...process.env, CODEX_THREAD_ID: taskId },
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function acquireConcurrently(lockPath: string, taskId: string): Promise<LockResult> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(
      "python3",
      [
        lockScript,
        "--path",
        lockPath,
        "--state-path",
        statePath(lockPath),
        "--repository",
        dirname(lockPath),
        "acquire",
        "--task-id",
        taskId,
      ],
      { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, CODEX_THREAD_ID: taskId } },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) => {
      resolveResult({ status, stdout, stderr });
    });
  });
}

test("a recovery task can claim an idle checkout without task-list input", () => {
  withLockFixture((lockPath) => {
    const result = runLock(lockPath, "acquire", "--task-id", "task-a");

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^ACQUIRED task-a CLAIM [0-9a-f]{32}\n$/);
    const record = JSON.parse(readFileSync(lockPath, "utf8")) as {
      version: unknown;
      claim_id: unknown;
      claimed_at: unknown;
      task_id: unknown;
    };
    assert.equal(record.version, 3);
    assert.equal(record.task_id, "task-a");
    assert.match(String(record.claim_id), /^[0-9a-f]{32}$/);
    assert.equal(typeof record.claimed_at, "number");
    assert.deepEqual(
      JSON.parse(runLock(lockPath, "status", "--json").stdout),
      record,
    );
  });
});

test("the current Codex task ID supplies ownership without a listing lookup", () => {
  withLockFixture((lockPath) => {
    const result = runLockFromEnvironment(lockPath, "task-from-environment");

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^ACQUIRED task-from-environment CLAIM [0-9a-f]{32}\n$/);
  });
});

test("an explicit task ID cannot override the current Codex caller", () => {
  withLockFixture((lockPath) => {
    const result = spawnSync(
      "python3",
      [lockScript, "--path", lockPath, "acquire", "--task-id", "impersonated-task"],
      {
        encoding: "utf8",
        env: { ...process.env, CODEX_THREAD_ID: "actual-task" },
      },
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /CALLER_TASK_MISMATCH/);
  });
});

test("checkout ownership is available only to the current active writer and pauses fence assertion", () => {
  withLockFixture((lockPath) => {
    setActiveWriter(lockPath, "writer-1");
    const unrelated = spawnSync(
      "python3",
      [
        lockScript,
        "--path",
        lockPath,
        "--state-path",
        statePath(lockPath),
        "--repository",
        dirname(lockPath),
        "acquire",
        "--task-id",
        "orchestrator-1",
      ],
      {
        encoding: "utf8",
        env: { ...process.env, CODEX_THREAD_ID: "orchestrator-1" },
      },
    );
    assert.equal(unrelated.status, 2);
    assert.match(unrelated.stderr, /TASK_NOT_ACTIVE_WRITER/);

    const acquired = runLock(lockPath, "acquire", "--task-id", "writer-1");
    assert.equal(acquired.status, 0, acquired.stderr);
    const claim = claimId(lockPath);
    setActiveWriter(lockPath, "writer-1", "paused", "paused");
    const fenced = runLock(
      lockPath,
      "assert-owner",
      "--task-id",
      "writer-1",
      "--claim-id",
      claim,
    );
    assert.equal(fenced.status, 2);
    assert.match(fenced.stderr, /TASK_NOT_ACTIVE_WRITER/);
    assert.equal(
      runLock(lockPath, "release", "--task-id", "writer-1", "--claim-id", claim).status,
      0,
    );
  });
});

test("checkout ownership rejects malformed lifecycle state and a different repository root", () => {
  withLockFixture((lockPath) => {
    setActiveWriter(lockPath, "writer-1");
    const valid = JSON.parse(readFileSync(statePath(lockPath), "utf8")) as Record<string, unknown>;
    const malformed = structuredClone(valid);
    delete malformed.schema_version;
    writeFileSync(statePath(lockPath), `${JSON.stringify(malformed)}\n`, "utf8");
    let result = spawnSync(
      "python3",
      [
        lockScript,
        "--path",
        lockPath,
        "--state-path",
        statePath(lockPath),
        "--repository",
        dirname(lockPath),
        "acquire",
        "--task-id",
        "writer-1",
      ],
      { encoding: "utf8", env: { ...process.env, CODEX_THREAD_ID: "writer-1" } },
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /UNSUPPORTED_STATE_VERSION/);

    const wrongRoot = structuredClone(valid);
    wrongRoot.repository_root = resolve(dirname(lockPath), "different-checkout");
    writeFileSync(statePath(lockPath), `${JSON.stringify(wrongRoot)}\n`, "utf8");
    result = spawnSync(
      "python3",
      [
        lockScript,
        "--path",
        lockPath,
        "--state-path",
        statePath(lockPath),
        "--repository",
        dirname(lockPath),
        "acquire",
        "--task-id",
        "writer-1",
      ],
      { encoding: "utf8", env: { ...process.env, CODEX_THREAD_ID: "writer-1" } },
    );
    assert.equal(result.status, 2);
    assert.match(result.stderr, /LIFECYCLE_REPOSITORY_ROOT_MISMATCH/);
  });
});

test("simultaneous recovery starts produce exactly one checkout owner", async () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "contour-loop-lock-race-"));
  const lockPath = resolve(fixtureRoot, "owner.json");
  try {
    setActiveWriter(lockPath, "task-a");
    const results = await Promise.all(
      Array.from({ length: 12 }, () => acquireConcurrently(lockPath, "task-a")),
    );
    const winners = results.filter((result) => result.status === 0);
    const conflicts = results.filter((result) => result.status === 1);

    assert.equal(winners.length, 1);
    assert.equal(conflicts.length, 11);
    assert.match(winners[0]?.stdout ?? "", /^ACQUIRED task-a CLAIM [0-9a-f]{32}\n$/);
    assert.ok(conflicts.every((result) => result.stderr === "HELD_BY task-a\n"));
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("a second task cannot replace the active checkout owner", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);

    const conflict = runLock(lockPath, "acquire", "--task-id", "task-b");
    assert.equal(conflict.status, 1);
    assert.equal(conflict.stdout, "");
    assert.equal(conflict.stderr, "HELD_BY task-a\n");

    const owner = runLock(
      lockPath,
      "assert-owner",
      "--task-id",
      "task-a",
      "--claim-id",
      claimId(lockPath),
    );
    assert.equal(owner.status, 0, owner.stderr);
    assert.equal(owner.stdout, "OWNERSHIP_CONFIRMED task-a\n");
  });
});

test("a verified terminal owner can be atomically replaced by exact claim", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);
    const record = JSON.parse(readFileSync(lockPath, "utf8")) as {
      claim_id: string;
    };

    const unverified = runLock(
      lockPath,
      "recover-stale",
      "--task-id",
      "task-b",
      "--expected-task-id",
      "task-a",
      "--expected-claim-id",
      record.claim_id,
    );
    assert.equal(unverified.status, 2);
    assert.match(unverified.stderr, /--verified-terminal/);
    assert.equal(
      runLock(lockPath, "assert-owner", "--task-id", "task-a", "--claim-id", record.claim_id)
        .status,
      0,
    );

    const selfRecovery = runLock(
      lockPath,
      "recover-stale",
      "--task-id",
      "task-a",
      "--expected-task-id",
      "task-a",
      "--expected-claim-id",
      record.claim_id,
      "--verified-terminal",
    );
    assert.equal(selfRecovery.status, 1);
    assert.equal(selfRecovery.stderr, "SELF_RECOVERY_FORBIDDEN\n");
    assert.equal(
      runLock(lockPath, "assert-owner", "--task-id", "task-a", "--claim-id", record.claim_id)
        .status,
      0,
    );

    setActiveWriter(lockPath, "task-b");
    const recovery = runLock(
      lockPath,
      "recover-stale",
      "--task-id",
      "task-b",
      "--expected-task-id",
      "task-a",
      "--expected-claim-id",
      record.claim_id,
      "--verified-terminal",
    );
    assert.equal(recovery.status, 0, recovery.stderr);
    assert.match(recovery.stdout, /^RECOVERED task-a TO task-b CLAIM [0-9a-f]{32}\n$/);
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-a").status, 1);
    assert.equal(
      runLock(
        lockPath,
        "assert-owner",
        "--task-id",
        "task-b",
        "--claim-id",
        claimId(lockPath),
      ).status,
      0,
    );
  });
});

test("stale recovery rejects an outdated owner snapshot without changing it", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);
    const before = readFileSync(lockPath, "utf8");
    const record = JSON.parse(before) as { claim_id: string };

    const wrongOwner = runLock(
      lockPath,
      "recover-stale",
      "--task-id",
      "task-b",
      "--expected-task-id",
      "task-z",
      "--expected-claim-id",
      record.claim_id,
      "--verified-terminal",
    );
    assert.equal(wrongOwner.status, 1);
    assert.equal(wrongOwner.stderr, "OWNER_MISMATCH task-a\n");
    assert.equal(readFileSync(lockPath, "utf8"), before);

    const wrongClaim = runLock(
      lockPath,
      "recover-stale",
      "--task-id",
      "task-b",
      "--expected-task-id",
      "task-a",
      "--expected-claim-id",
      "outdated-claim",
      "--verified-terminal",
    );
    assert.equal(wrongClaim.status, 1);
    assert.equal(wrongClaim.stderr, "CLAIM_MISMATCH\n");
    assert.equal(readFileSync(lockPath, "utf8"), before);
  });
});

test("only one concurrent recovery can replace the verified stale claim", async () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "contour-loop-recovery-race-"));
  const lockPath = resolve(fixtureRoot, "owner.json");
  try {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);
    const record = JSON.parse(readFileSync(lockPath, "utf8")) as {
      claim_id: string;
    };
    setActiveWriter(lockPath, "task-b");
    const results = await Promise.all(
      ["task-b", "task-c"].map(
        (taskId) =>
          new Promise<LockResult>((resolveResult, reject) => {
            const child = spawn(
              "python3",
              [
                lockScript,
                "--path",
                lockPath,
                "--state-path",
                statePath(lockPath),
                "--repository",
                dirname(lockPath),
                "recover-stale",
                "--task-id",
                taskId,
                "--expected-task-id",
                "task-a",
                "--expected-claim-id",
                record.claim_id,
                "--verified-terminal",
              ],
              {
                stdio: ["ignore", "pipe", "pipe"],
                env: { ...process.env, CODEX_THREAD_ID: taskId },
              },
            );
            let stdout = "";
            let stderr = "";
            child.stdout.setEncoding("utf8");
            child.stderr.setEncoding("utf8");
            child.stdout.on("data", (chunk: string) => {
              stdout += chunk;
            });
            child.stderr.on("data", (chunk: string) => {
              stderr += chunk;
            });
            child.on("error", reject);
            child.on("close", (status) => {
              resolveResult({ status, stdout, stderr });
            });
          }),
      ),
    );
    assert.equal(results.filter((result) => result.status === 0).length, 1);
    assert.equal(results.filter((result) => result.status !== 0).length, 1);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("an unversioned owner can release but cannot be recovered with a claim ID", () => {
  withLockFixture((lockPath) => {
    writeFileSync(
      lockPath,
      '{"task_id":"task-a","claim_id":"unversioned","claimed_at":1}\n',
      "utf8",
    );

    const recovery = runLock(
      lockPath,
      "recover-stale",
      "--task-id",
      "task-b",
      "--expected-task-id",
      "task-a",
      "--expected-claim-id",
      "missing",
      "--verified-terminal",
    );
    assert.equal(recovery.status, 1);
    assert.equal(recovery.stderr, "LEGACY_LOCK_NOT_RECOVERABLE\n");
    const assertion = runLock(lockPath, "assert-owner", "--task-id", "task-a");
    assert.equal(assertion.status, 1);
    assert.equal(assertion.stderr, "LEGACY_LOCK_RELEASE_ONLY\n");
    assert.equal(runLock(lockPath, "release", "--task-id", "task-a").status, 0);
  });
});

test("version 1 and 2 owners are release-only during lifecycle migration", () => {
  withLockFixture((lockPath) => {
    for (const version of [1, 2]) {
      writeFileSync(
        lockPath,
        `${JSON.stringify({ version, task_id: "task-a", claim_id: "legacy-claim", claimed_at: 1 })}\n`,
        "utf8",
      );
      const claimArguments = version === 2 ? ["--claim-id", "legacy-claim"] : [];
      const assertion = runLock(
        lockPath,
        "assert-owner",
        "--task-id",
        "task-a",
        ...claimArguments,
      );
      assert.equal(assertion.status, 1);
      assert.equal(assertion.stderr, "LEGACY_LOCK_RELEASE_ONLY\n");
      const recovery = runLock(
        lockPath,
        "recover-stale",
        "--task-id",
        "task-b",
        "--expected-task-id",
        "task-a",
        "--expected-claim-id",
        "legacy-claim",
        "--verified-terminal",
      );
      assert.equal(recovery.status, 1);
      assert.equal(recovery.stderr, "LEGACY_LOCK_NOT_RECOVERABLE\n");
      assert.equal(
        runLock(lockPath, "release", "--task-id", "task-a", ...claimArguments).status,
        0,
      );
    }
  });
});

test("only the recorded owner can release the checkout", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);

    const wrongOwner = runLock(lockPath, "release", "--task-id", "task-b");
    assert.equal(wrongOwner.status, 1);
    assert.equal(wrongOwner.stderr, "OWNER_MISMATCH task-a\n");

    const missingClaim = runLock(lockPath, "release", "--task-id", "task-a");
    assert.equal(missingClaim.status, 1);
    assert.equal(missingClaim.stderr, "CLAIM_MISMATCH\n");

    const release = runLock(
      lockPath,
      "release",
      "--task-id",
      "task-a",
      "--claim-id",
      claimId(lockPath),
    );
    assert.equal(release.status, 0, release.stderr);
    assert.equal(release.stdout, "RELEASED task-a\n");
    assert.equal(runLock(lockPath, "status").stdout, "UNLOCKED\n");
  });
});

test("a stale claim from the same task cannot assert or release a replacement claim", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);
    const staleClaim = claimId(lockPath);
    const record = JSON.parse(readFileSync(lockPath, "utf8")) as Record<string, unknown>;
    record.claim_id = "b".repeat(32);
    writeFileSync(lockPath, `${JSON.stringify(record)}\n`, "utf8");

    for (const command of ["assert-owner", "release"] as const) {
      const result = runLock(
        lockPath,
        command,
        "--task-id",
        "task-a",
        "--claim-id",
        staleClaim,
      );
      assert.equal(result.status, 1);
      assert.equal(result.stderr, "CLAIM_MISMATCH\n");
    }
    assert.equal(claimId(lockPath), "b".repeat(32));
  });
});

test("an unreadable ownership record fails closed", () => {
  withLockFixture((lockPath) => {
    writeFileSync(lockPath, "not-json\n", "utf8");

    const result = runLock(lockPath, "acquire", "--task-id", "task-a");
    assert.equal(result.status, 2);
    assert.match(result.stderr, /UNREADABLE_LOCK/);
  });
});
