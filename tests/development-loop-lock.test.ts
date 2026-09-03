import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
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
  const result = spawnSync("python3", [lockScript, "--path", lockPath, ...args], {
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

function runLockFromEnvironment(lockPath: string, taskId: string): LockResult {
  const result = spawnSync("python3", [lockScript, "--path", lockPath, "acquire"], {
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
      [lockScript, "--path", lockPath, "acquire", "--task-id", taskId],
      { stdio: ["ignore", "pipe", "pipe"] },
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
    assert.equal(result.stdout, "ACQUIRED task-a\n");
    const record = JSON.parse(readFileSync(lockPath, "utf8")) as {
      version: unknown;
      claim_id: unknown;
      claimed_at: unknown;
      task_id: unknown;
    };
    assert.equal(record.version, 1);
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
    assert.equal(result.stdout, "ACQUIRED task-from-environment\n");
  });
});

test("simultaneous recovery starts produce exactly one checkout owner", async () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), "contour-loop-lock-race-"));
  const lockPath = resolve(fixtureRoot, "owner.json");
  try {
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, index) =>
        acquireConcurrently(lockPath, `task-${index}`),
      ),
    );
    const winners = results.filter((result) => result.status === 0);
    const conflicts = results.filter((result) => result.status === 1);

    assert.equal(winners.length, 1);
    assert.equal(conflicts.length, 11);
    assert.match(winners[0]?.stdout ?? "", /^ACQUIRED task-\d+\n$/);
    assert.ok(conflicts.every((result) => /^HELD_BY task-\d+\n$/.test(result.stderr)));
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

    const owner = runLock(lockPath, "assert-owner", "--task-id", "task-a");
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
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-a").status, 0);

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
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-a").status, 0);

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
    assert.equal(recovery.stdout, "RECOVERED task-a TO task-b\n");
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-a").status, 1);
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-b").status, 0);
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
                "recover-stale",
                "--task-id",
                taskId,
                "--expected-task-id",
                "task-a",
                "--expected-claim-id",
                record.claim_id,
                "--verified-terminal",
              ],
              { stdio: ["ignore", "pipe", "pipe"] },
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
    assert.equal(results.filter((result) => result.status === 1).length, 1);
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
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-a").status, 0);
    assert.equal(runLock(lockPath, "release", "--task-id", "task-a").status, 0);
  });
});

test("only the recorded owner can release the checkout", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);

    const wrongOwner = runLock(lockPath, "release", "--task-id", "task-b");
    assert.equal(wrongOwner.status, 1);
    assert.equal(wrongOwner.stderr, "OWNER_MISMATCH task-a\n");

    const release = runLock(lockPath, "release", "--task-id", "task-a");
    assert.equal(release.status, 0, release.stderr);
    assert.equal(release.stdout, "RELEASED task-a\n");
    assert.equal(runLock(lockPath, "status").stdout, "UNLOCKED\n");
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
