#!/usr/bin/env python3
"""Durable single-writer ownership for the Contour development checkout."""

import argparse
import contextlib
import fcntl
import hashlib
import json
import os
import secrets
import sys
import tempfile
import time
from pathlib import Path
from typing import Iterator


def default_lock_path() -> Path:
    repository = Path(__file__).resolve().parents[1]
    digest = hashlib.sha256(str(repository).encode("utf-8")).hexdigest()[:16]
    return Path(tempfile.gettempdir()) / f"contour-development-loop-{digest}.json"


@contextlib.contextmanager
def guarded(path: Path) -> Iterator[None]:
    path.parent.mkdir(parents=True, exist_ok=True)
    guard_path = path.with_suffix(path.suffix + ".guard")
    with guard_path.open("a+", encoding="utf-8") as guard:
        fcntl.flock(guard.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(guard.fileno(), fcntl.LOCK_UN)


def read_owner(path: Path) -> dict[str, object] | None:
    if not path.exists():
        return None
    try:
        record = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"UNREADABLE_LOCK {path}: {error}") from error
    if (
        not isinstance(record, dict)
        or not isinstance(record.get("task_id"), str)
        or not record["task_id"].strip()
    ):
        raise ValueError(f"UNREADABLE_LOCK {path}: missing task_id")
    if "version" in record and (
        record.get("version") != 1
        or not isinstance(record.get("claim_id"), str)
        or not record["claim_id"].strip()
        or not isinstance(record.get("claimed_at"), int)
    ):
        raise ValueError(f"UNREADABLE_LOCK {path}: invalid versioned record")
    return record


def write_owner(path: Path, task_id: str) -> None:
    record = {
        "version": 1,
        "task_id": task_id,
        "claim_id": secrets.token_hex(16),
        "claimed_at": int(time.time()),
    }
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(record, sort_keys=True) + "\n", encoding="utf-8")
    os.replace(temporary, path)


def recorded_task_id(record: dict[str, object]) -> str:
    return str(record["task_id"])


def current_task_id(explicit_task_id: str | None) -> str:
    task_id = explicit_task_id or os.environ.get("CODEX_THREAD_ID", "")
    if not task_id.strip():
        raise ValueError("MISSING_TASK_ID pass --task-id or set CODEX_THREAD_ID")
    return task_id.strip()


def acquire(path: Path, task_id: str) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is not None:
            print(f"HELD_BY {recorded_task_id(owner)}", file=sys.stderr)
            return 1
        write_owner(path, task_id)
    print(f"ACQUIRED {task_id}")
    return 0


def status(path: Path, json_output: bool) -> int:
    with guarded(path):
        owner = read_owner(path)
    if json_output:
        print(json.dumps(owner, sort_keys=True))
        return 0
    if owner is None:
        print("UNLOCKED")
    else:
        print(f"HELD {recorded_task_id(owner)}")
    return 0


def assert_owner(path: Path, task_id: str) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is None:
            print("NO_OWNER", file=sys.stderr)
            return 1
        if recorded_task_id(owner) != task_id:
            print(f"OWNER_MISMATCH {recorded_task_id(owner)}", file=sys.stderr)
            return 1
    print(f"OWNERSHIP_CONFIRMED {task_id}")
    return 0


def release(path: Path, task_id: str) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is None:
            print("NO_OWNER", file=sys.stderr)
            return 1
        if recorded_task_id(owner) != task_id:
            print(f"OWNER_MISMATCH {recorded_task_id(owner)}", file=sys.stderr)
            return 1
        path.unlink()
    print(f"RELEASED {task_id}")
    return 0


def recover_stale(
    path: Path,
    task_id: str,
    expected_task_id: str,
    expected_claim_id: str,
) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is None:
            print("NO_OWNER", file=sys.stderr)
            return 1
        recorded_id = recorded_task_id(owner)
        if task_id == expected_task_id:
            print("SELF_RECOVERY_FORBIDDEN", file=sys.stderr)
            return 1
        if recorded_id != expected_task_id:
            print(f"OWNER_MISMATCH {recorded_id}", file=sys.stderr)
            return 1
        if owner.get("version") != 1:
            print("LEGACY_LOCK_NOT_RECOVERABLE", file=sys.stderr)
            return 1
        claim_id = owner.get("claim_id")
        if not isinstance(claim_id, str) or not claim_id:
            raise ValueError(f"UNREADABLE_LOCK {path}: missing claim_id")
        if claim_id != expected_claim_id:
            print("CLAIM_MISMATCH", file=sys.stderr)
            return 1
        write_owner(path, task_id)
    print(f"RECOVERED {expected_task_id} TO {task_id}")
    return 0


def add_current_task_argument(command: argparse.ArgumentParser) -> None:
    command.add_argument(
        "--task-id",
        help="Codex task ID; defaults to CODEX_THREAD_ID",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--path", type=Path, default=default_lock_path())
    commands = parser.add_subparsers(dest="command", required=True)

    for name in ("acquire", "assert-owner", "release"):
        add_current_task_argument(commands.add_parser(name))

    status_command = commands.add_parser("status")
    status_command.add_argument("--json", action="store_true")

    recover_command = commands.add_parser("recover-stale")
    add_current_task_argument(recover_command)
    recover_command.add_argument("--expected-task-id", required=True)
    recover_command.add_argument("--expected-claim-id", required=True)
    recover_command.add_argument("--verified-terminal", action="store_true", required=True)

    return parser


def main(arguments: list[str] | None = None) -> int:
    args = build_parser().parse_args(arguments)
    try:
        if args.command == "status":
            return status(args.path, args.json)
        task_id = current_task_id(args.task_id)
        if args.command == "acquire":
            return acquire(args.path, task_id)
        if args.command == "assert-owner":
            return assert_owner(args.path, task_id)
        if args.command == "release":
            return release(args.path, task_id)
        return recover_stale(
            args.path,
            task_id,
            args.expected_task_id,
            args.expected_claim_id,
        )
    except (OSError, ValueError) as error:
        print(f"LOCK_ERROR {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
