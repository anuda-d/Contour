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
      claimed_at: unknown;
      task_id: unknown;
    };
    assert.equal(record.task_id, "task-a");
    assert.equal(typeof record.claimed_at, "number");
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

test("a recovery task cannot steal ownership from an idle recorded task", () => {
  withLockFixture((lockPath) => {
    assert.equal(runLock(lockPath, "acquire", "--task-id", "task-a").status, 0);

    const attemptedTakeover = runLock(
      lockPath,
      "takeover",
      "--task-id",
      "task-b",
      "--expected-task-id",
      "task-a",
      "--verified-inactive",
    );
    assert.equal(attemptedTakeover.status, 2);
    assert.match(attemptedTakeover.stderr, /invalid choice: 'takeover'/);
    assert.equal(runLock(lockPath, "assert-owner", "--task-id", "task-a").status, 0);
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
