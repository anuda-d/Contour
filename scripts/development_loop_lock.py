#!/usr/bin/env python3
"""Durable single-writer ownership for the Contour development checkout."""

import argparse
import contextlib
import fcntl
import hashlib
import json
import os
import secrets
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Iterator

sys.dont_write_bytecode = True
from development_loop_state import validate_state


def default_lock_path() -> Path:
    repository = Path(__file__).resolve().parents[1]
    digest = hashlib.sha256(str(repository).encode("utf-8")).hexdigest()[:16]
    return Path(tempfile.gettempdir()) / f"contour-development-loop-{digest}.json"


def default_state_path() -> Path:
    repository = Path(__file__).resolve().parents[1]
    result = subprocess.run(
        ["git", "-C", str(repository), "rev-parse", "--path-format=absolute", "--git-common-dir"],
        check=True,
        capture_output=True,
        text=True,
    )
    return Path(result.stdout.strip()) / "codex" / "contour-development-loop-state.json"


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
        record.get("version") not in (1, 2, 3)
        or not isinstance(record.get("claim_id"), str)
        or not record["claim_id"].strip()
        or not isinstance(record.get("claimed_at"), int)
    ):
        raise ValueError(f"UNREADABLE_LOCK {path}: invalid versioned record")
    if record.get("version") == 3 and (
        not isinstance(record.get("generation_id"), str)
        or not record["generation_id"].strip()
        or not isinstance(record.get("writer_claim_id"), str)
        or not record["writer_claim_id"].strip()
    ):
        raise ValueError(f"UNREADABLE_LOCK {path}: invalid lifecycle binding")
    return record


def read_lifecycle_binding(path: Path, repository: Path, task_id: str) -> dict[str, str]:
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"UNREADABLE_LIFECYCLE_STATE {path}: {error}") from error
    try:
        validate_state(state)
    except ValueError as error:
        raise ValueError(f"UNREADABLE_LIFECYCLE_STATE {path}: {error}") from error
    if Path(state["repository_root"]).resolve() != repository.resolve():
        raise ValueError("LIFECYCLE_REPOSITORY_ROOT_MISMATCH")
    generation = state.get("generation")
    active_slice = state.get("active_slice")
    history = state.get("task_history")
    if (
        state.get("authorization") != "standing"
        or state.get("phase") != "slice_active"
        or not isinstance(generation, dict)
        or not isinstance(active_slice, dict)
        or active_slice.get("writer_task_id") != task_id
        or active_slice.get("phase") not in {
            "implementing",
            "validating",
            "reviewing",
            "repairing",
            "commit_pending",
        }
        or not isinstance(history, dict)
        or task_id not in history.get("writers", [])
        or task_id in history.get("orchestrators", [])
        or task_id in history.get("reviewers", [])
    ):
        raise ValueError("TASK_NOT_ACTIVE_WRITER")
    generation_id = generation.get("id")
    writer_claim_id = active_slice.get("writer_claim_id")
    if not isinstance(generation_id, str) or not generation_id.strip():
        raise ValueError("TASK_NOT_ACTIVE_WRITER")
    if not isinstance(writer_claim_id, str) or not writer_claim_id.strip():
        raise ValueError("TASK_NOT_ACTIVE_WRITER")
    return {"generation_id": generation_id, "writer_claim_id": writer_claim_id}


def write_owner(path: Path, task_id: str, binding: dict[str, str]) -> dict[str, object]:
    record = {
        "version": 3,
        "task_id": task_id,
        "claim_id": secrets.token_hex(16),
        "generation_id": binding["generation_id"],
        "writer_claim_id": binding["writer_claim_id"],
        "claimed_at": int(time.time()),
    }
    temporary = path.with_suffix(path.suffix + f".{secrets.token_hex(8)}.tmp")
    try:
        with temporary.open("w", encoding="utf-8") as destination:
            destination.write(json.dumps(record, sort_keys=True) + "\n")
            destination.flush()
            os.fsync(destination.fileno())
        os.replace(temporary, path)
        sync_directory(path.parent)
    finally:
        temporary.unlink(missing_ok=True)
    return record


def sync_directory(directory: Path) -> None:
    directory_fd = os.open(directory, os.O_RDONLY)
    try:
        os.fsync(directory_fd)
    finally:
        os.close(directory_fd)


def recorded_task_id(record: dict[str, object]) -> str:
    return str(record["task_id"])


def current_task_id(explicit_task_id: str | None) -> str:
    environment_task_id = os.environ.get("CODEX_THREAD_ID", "").strip()
    if explicit_task_id and environment_task_id and explicit_task_id.strip() != environment_task_id:
        raise ValueError("CALLER_TASK_MISMATCH")
    task_id = explicit_task_id or environment_task_id
    if not task_id.strip():
        raise ValueError("MISSING_TASK_ID pass --task-id or set CODEX_THREAD_ID")
    return task_id.strip()


def acquire(path: Path, state_path: Path, repository: Path, task_id: str) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is not None:
            print(f"HELD_BY {recorded_task_id(owner)}", file=sys.stderr)
            return 1
        binding = read_lifecycle_binding(state_path, repository, task_id)
        record = write_owner(path, task_id, binding)
    print(f"ACQUIRED {task_id} CLAIM {record['claim_id']}")
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


def claim_matches(owner: dict[str, object], claim_id: str | None) -> bool:
    if owner.get("version") in (2, 3):
        return isinstance(claim_id, str) and bool(claim_id) and owner.get("claim_id") == claim_id
    return claim_id is None or owner.get("claim_id") == claim_id


def assert_owner(
    path: Path,
    state_path: Path,
    repository: Path,
    task_id: str,
    claim_id: str | None,
) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is None:
            print("NO_OWNER", file=sys.stderr)
            return 1
        if recorded_task_id(owner) != task_id:
            print(f"OWNER_MISMATCH {recorded_task_id(owner)}", file=sys.stderr)
            return 1
        if not claim_matches(owner, claim_id):
            print("CLAIM_MISMATCH", file=sys.stderr)
            return 1
        if owner.get("version") != 3:
            print("LEGACY_LOCK_RELEASE_ONLY", file=sys.stderr)
            return 1
        binding = read_lifecycle_binding(state_path, repository, task_id)
        if (
            owner.get("generation_id") != binding["generation_id"]
            or owner.get("writer_claim_id") != binding["writer_claim_id"]
        ):
            print("LIFECYCLE_BINDING_MISMATCH", file=sys.stderr)
            return 1
    print(f"OWNERSHIP_CONFIRMED {task_id}")
    return 0


def release(path: Path, task_id: str, claim_id: str | None) -> int:
    with guarded(path):
        owner = read_owner(path)
        if owner is None:
            print("NO_OWNER", file=sys.stderr)
            return 1
        if recorded_task_id(owner) != task_id:
            print(f"OWNER_MISMATCH {recorded_task_id(owner)}", file=sys.stderr)
            return 1
        if not claim_matches(owner, claim_id):
            print("CLAIM_MISMATCH", file=sys.stderr)
            return 1
        path.unlink()
        sync_directory(path.parent)
    print(f"RELEASED {task_id}")
    return 0


def recover_stale(
    path: Path,
    state_path: Path,
    repository: Path,
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
        if owner.get("version") != 3:
            print("LEGACY_LOCK_NOT_RECOVERABLE", file=sys.stderr)
            return 1
        claim_id = owner.get("claim_id")
        if not isinstance(claim_id, str) or not claim_id:
            raise ValueError(f"UNREADABLE_LOCK {path}: missing claim_id")
        if claim_id != expected_claim_id:
            print("CLAIM_MISMATCH", file=sys.stderr)
            return 1
        binding = read_lifecycle_binding(state_path, repository, task_id)
        record = write_owner(path, task_id, binding)
    print(f"RECOVERED {expected_task_id} TO {task_id} CLAIM {record['claim_id']}")
    return 0


def add_current_task_argument(command: argparse.ArgumentParser) -> None:
    command.add_argument(
        "--task-id",
        help="Codex task ID; defaults to CODEX_THREAD_ID",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--path", type=Path, default=default_lock_path())
    parser.add_argument("--state-path", type=Path, default=default_state_path())
    parser.add_argument("--repository", type=Path, default=Path(__file__).resolve().parents[1])
    commands = parser.add_subparsers(dest="command", required=True)

    for name in ("acquire", "assert-owner", "release"):
        command = commands.add_parser(name)
        add_current_task_argument(command)
        if name != "acquire":
            command.add_argument("--claim-id")

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
            return acquire(args.path, args.state_path, args.repository, task_id)
        if args.command == "assert-owner":
            return assert_owner(args.path, args.state_path, args.repository, task_id, args.claim_id)
        if args.command == "release":
            return release(args.path, task_id, args.claim_id)
        return recover_stale(
            args.path,
            args.state_path,
            args.repository,
            task_id,
            args.expected_task_id,
            args.expected_claim_id,
        )
    except (OSError, ValueError) as error:
        print(f"LOCK_ERROR {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
