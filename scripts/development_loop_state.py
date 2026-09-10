#!/usr/bin/env python3
"""Crash-safe lifecycle state for Contour's autonomous development loop."""

from __future__ import annotations

import argparse
import contextlib
import fcntl
import fnmatch
import hashlib
import json
import os
import secrets
import subprocess
import sys
import tempfile
import time
import tomllib
from pathlib import Path
from typing import Any, Callable, Iterator


SCHEMA_VERSION = 1
TERMINAL_EVIDENCE_SCHEMA_VERSION = 1
AUTOMATION_ID = "bproject-autonomous-graph-loop"
MAX_SLICES = 3
MAX_REPAIRS = 3
MAX_RECOVERIES = 3
ARCHITECTURE_CRITERIA = {f"AF-{number}" for number in range(1, 11)}
GENERATION_PHASES = {
    "idle",
    "generation_pending",
    "selecting",
    "slice_active",
    "alignment_due",
    "alignment",
    "handoff_ready",
    "paused",
    "blocked",
    "complete",
}
SLICE_PHASES = {
    "selected",
    "implementing",
    "validating",
    "reviewing",
    "repairing",
    "commit_pending",
    "incomplete",
}


class StateError(ValueError):
    """A safe, user-facing state transition failure."""


def repository_root(explicit: Path | None = None) -> Path:
    if explicit is not None:
        return explicit.resolve()
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        check=True,
        capture_output=True,
        text=True,
    )
    return Path(result.stdout.strip()).resolve()


def default_state_path(repository: Path) -> Path:
    result = subprocess.run(
        ["git", "-C", str(repository), "rev-parse", "--path-format=absolute", "--git-common-dir"],
        check=True,
        capture_output=True,
        text=True,
    )
    return Path(result.stdout.strip()) / "codex" / "contour-development-loop-state.json"


def default_checkout_lock_path(repository: Path) -> Path:
    repository_digest = hashlib.sha256(str(repository).encode("utf-8")).hexdigest()[:16]
    return Path(tempfile.gettempdir()) / f"contour-development-loop-{repository_digest}.json"


def path_is_included(changed_path: str, allowed_path: str) -> bool:
    normalized = allowed_path.rstrip("/")
    return (
        changed_path == normalized
        or changed_path.startswith(f"{normalized}/")
        or fnmatch.fnmatch(changed_path, allowed_path)
    )


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


def canonical(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def digest(value: Any) -> str:
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def durable_write(path: Path, state: dict[str, Any]) -> None:
    temporary = path.with_suffix(path.suffix + f".{secrets.token_hex(8)}.tmp")
    try:
        with temporary.open("w", encoding="utf-8") as destination:
            destination.write(json.dumps(state, indent=2, sort_keys=True) + "\n")
            destination.flush()
            os.fsync(destination.fileno())
        os.replace(temporary, path)
        directory_fd = os.open(path.parent, os.O_RDONLY)
        try:
            os.fsync(directory_fd)
        finally:
            os.close(directory_fd)
    finally:
        temporary.unlink(missing_ok=True)


def read_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise StateError("STATE_MISSING run migrate before starting a generation")
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise StateError(f"UNREADABLE_STATE {path}: {error}") from error
    validate_state(state)
    return state


def require_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise StateError(f"INVALID_STATE missing {label}")
    return value


def require_nonnegative_int(value: Any, label: str) -> int:
    if type(value) is not int or value < 0:
        raise StateError(f"INVALID_STATE {label}")
    return value


def validate_evidence_record(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise StateError(f"INVALID_STATE {label}")
    for key in ("content_id", "contract_hash"):
        require_string(value.get(key), f"{label}.{key}")
    return value


def repository_relative_file(repository: Path, path: Path, label: str) -> tuple[Path, str]:
    resolved = path.resolve()
    try:
        relative = resolved.relative_to(repository)
    except ValueError as error:
        raise StateError(f"{label}_OUTSIDE_REPOSITORY") from error
    relative_name = relative.as_posix()
    git_output(repository, "ls-files", "--error-unmatch", relative_name)
    return resolved, relative_name


def load_terminal_evidence(
    repository: Path,
    path: Path,
    state: dict[str, Any],
) -> tuple[dict[str, Any], str, str]:
    resolved, relative_name = repository_relative_file(repository, path, "TERMINAL_EVIDENCE")
    try:
        raw = resolved.read_text(encoding="utf-8")
        evidence = json.loads(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise StateError(f"INVALID_TERMINAL_EVIDENCE {error}") from error
    if git_output(repository, "show", f"HEAD:{relative_name}") != raw:
        raise StateError("TERMINAL_EVIDENCE_NOT_COMMITTED")
    if (
        not isinstance(evidence, dict)
        or evidence.get("schema_version") != TERMINAL_EVIDENCE_SCHEMA_VERSION
        or evidence.get("goal_id") != state["goal_id"]
    ):
        raise StateError("INVALID_TERMINAL_EVIDENCE goal")
    criteria = evidence.get("criteria")
    if not isinstance(criteria, dict) or not criteria or set(criteria.values()) != {"accepted"}:
        raise StateError("INVALID_TERMINAL_EVIDENCE criteria")
    if state["goal_id"] == "architecture-foundation" and set(criteria) != ARCHITECTURE_CRITERIA:
        raise StateError("INVALID_TERMINAL_EVIDENCE architecture criteria")
    for gate in ("full_validation", "rendered_walkthrough", "legacy_compatibility"):
        record = evidence.get(gate)
        if not isinstance(record, dict) or record.get("status") != "pass":
            raise StateError(f"INVALID_TERMINAL_EVIDENCE {gate}")
        require_string(record.get("evidence"), f"terminal_evidence.{gate}.evidence")
    documents = evidence.get("terminal_documents")
    if not isinstance(documents, list) or not documents or not all(
        isinstance(value, str) and value.strip() for value in documents
    ):
        raise StateError("INVALID_TERMINAL_EVIDENCE terminal_documents")
    required_documents = {
        "docs/plans/CURRENT.md",
        "docs/plans/architecture-foundation/GOAL.md",
        "docs/plans/architecture-foundation/IMPLEMENTATION_PLAN.md",
    }
    if state["goal_id"] == "architecture-foundation" and not required_documents.issubset(set(documents)):
        raise StateError("INVALID_TERMINAL_EVIDENCE terminal documents incomplete")
    for document in documents:
        repository_relative_file(repository, repository / document, "TERMINAL_DOCUMENT")
    return evidence, hashlib.sha256(raw.encode("utf-8")).hexdigest(), relative_name


def canonical_automation_path() -> Path:
    codex_home = Path(os.environ.get("CODEX_HOME", Path.home() / ".codex")).expanduser().resolve()
    return codex_home / "automations" / AUTOMATION_ID / "automation.toml"


def require_paused_automation() -> None:
    path = canonical_automation_path()
    try:
        automation = tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError) as error:
        raise StateError(f"GOAL_COMPLETION_AUTOMATION_UNREADABLE {error}") from error
    if automation.get("id") != AUTOMATION_ID:
        raise StateError("GOAL_COMPLETION_AUTOMATION_ID_MISMATCH")
    if automation.get("status") != "PAUSED":
        raise StateError("GOAL_COMPLETION_AUTOMATION_NOT_PAUSED")


def commit_trailers(repository: Path, commit: str) -> dict[str, list[str]]:
    message = git_output(repository, "show", "-s", "--format=%B", commit)
    result = subprocess.run(
        ["git", "-C", str(repository), "interpret-trailers", "--parse"],
        input=message,
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise StateError("COMMIT_TRAILER_PARSE_FAILED")
    trailers: dict[str, list[str]] = {}
    for line in result.stdout.splitlines():
        key, separator, value = line.partition(":")
        if not separator:
            raise StateError("COMMIT_TRAILER_PARSE_FAILED")
        trailers.setdefault(key.strip().lower(), []).append(value.strip())
    return trailers


def validate_contract(contract: Any) -> dict[str, Any]:
    if not isinstance(contract, dict):
        raise StateError("INVALID_CONTRACT expected an object")
    for key in (
        "slice_id",
        "criterion",
        "responsibility",
        "acceptance_gap",
        "completion_condition",
    ):
        require_string(contract.get(key), f"contract.{key}")
    for key in ("included_paths", "preservation_boundaries", "validation_commands"):
        values = contract.get(key)
        if not isinstance(values, list) or not values or not all(
            isinstance(value, str) and value.strip() for value in values
        ):
            raise StateError(f"INVALID_CONTRACT {key} must be a non-empty string list")
    if not isinstance(contract.get("ui_change"), bool):
        raise StateError("INVALID_CONTRACT ui_change must be boolean")
    return contract


def validate_state(state: Any) -> None:
    if not isinstance(state, dict) or state.get("schema_version") != SCHEMA_VERSION:
        raise StateError("UNSUPPORTED_STATE_VERSION")
    require_nonnegative_int(state.get("revision"), "revision")
    require_string(state.get("goal_id"), "goal_id")
    require_string(state.get("repository_root"), "repository_root")
    if state.get("authorization") not in {"standing", "paused", "pending"}:
        raise StateError("INVALID_STATE authorization")
    for key in ("completion_audit_count", "ui_checkpoint_count"):
        require_nonnegative_int(state.get(key), key)
    if state["completion_audit_count"] > 3 or state["ui_checkpoint_count"] > 5:
        raise StateError("INVALID_STATE persisted counter")
    history = state.get("task_history")
    if not isinstance(history, dict) or any(
        not isinstance(history.get(role), list)
        for role in ("orchestrators", "writers", "reviewers")
    ):
        raise StateError("INVALID_STATE task_history")
    history_values: list[str] = []
    for role in ("orchestrators", "writers", "reviewers"):
        values = history[role]
        if not all(isinstance(value, str) and value.strip() for value in values):
            raise StateError("INVALID_STATE task_history identity")
        history_values.extend(values)
    if len(history_values) != len(set(history_values)):
        raise StateError("INVALID_STATE task role reused")
    if state.get("phase") not in GENERATION_PHASES:
        raise StateError("INVALID_STATE phase")
    if state["phase"] == "paused" and state["authorization"] != "paused":
        raise StateError("INVALID_STATE pause authorization")
    if state["authorization"] == "paused" and state["phase"] not in {"idle", "paused"}:
        raise StateError("INVALID_STATE pause authorization")
    if (state["phase"] == "complete") != (state["authorization"] == "pending"):
        raise StateError("INVALID_STATE terminal authorization")
    operations = state.get("operations")
    if not isinstance(operations, list):
        raise StateError("INVALID_STATE operations")
    operation_ids: list[str] = []
    for operation in operations:
        if not isinstance(operation, dict):
            raise StateError("INVALID_STATE operation")
        for key in ("id", "fingerprint", "result"):
            require_string(operation.get(key), f"operation.{key}")
        operation_ids.append(operation["id"])
    if len(operation_ids) != len(set(operation_ids)):
        raise StateError("INVALID_STATE duplicate operation")
    migrated_from = state.get("migrated_from")
    if not isinstance(migrated_from, dict):
        raise StateError("INVALID_STATE migrated_from")
    for key in ("current_run", "incomplete_run", "repository_commit"):
        require_string(migrated_from.get(key), f"migrated_from.{key}")
    if (migrated_from["current_run"] == "none") != (
        migrated_from["incomplete_run"] == "none"
    ) or (
        migrated_from["current_run"] != "none"
        and migrated_from["current_run"] != migrated_from["incomplete_run"]
    ):
        raise StateError("INVALID_STATE migrated run conflict")
    for key in ("last_completion_audit", "last_ui_checkpoint"):
        record = state.get(key)
        if record is not None:
            if not isinstance(record, dict):
                raise StateError(f"INVALID_STATE {key}")
            require_string(record.get("repository_commit"), f"{key}.repository_commit")
            require_string(record.get("evidence"), f"{key}.evidence")
    completion_evidence = state.get("completion_evidence")
    if completion_evidence is not None:
        if not isinstance(completion_evidence, dict):
            raise StateError("INVALID_STATE completion_evidence")
        for key in ("repository_commit", "evidence_hash", "evidence_path", "reviewer_task_id"):
            require_string(completion_evidence.get(key), f"completion_evidence.{key}")
        if completion_evidence.get("evidence_schema_version") != TERMINAL_EVIDENCE_SCHEMA_VERSION:
            raise StateError("INVALID_STATE completion evidence schema")
    goal_completion_review = state.get("goal_completion_review")
    if goal_completion_review is not None:
        if not isinstance(goal_completion_review, dict):
            raise StateError("INVALID_STATE goal_completion_review")
        for key in ("repository_commit", "reviewer_task_id", "result", "evidence"):
            require_string(goal_completion_review.get(key), f"goal_completion_review.{key}")
        if goal_completion_review["result"] not in {"pass", "block"}:
            raise StateError("INVALID_STATE goal review result")
        if goal_completion_review["reviewer_task_id"] not in history["reviewers"]:
            raise StateError("INVALID_STATE untracked goal reviewer")
    generation = state.get("generation")
    active_slice = state.get("active_slice")
    if state["phase"] == "idle":
        if generation is not None or active_slice is not None:
            raise StateError("INVALID_STATE idle ownership")
        if state.get("last_handoff") is not None:
            raise StateError("INVALID_STATE idle handoff")
        if completion_evidence is not None:
            raise StateError("INVALID_STATE idle completion evidence")
        if goal_completion_review is not None:
            raise StateError("INVALID_STATE idle goal review")
        return
    if not isinstance(generation, dict):
        raise StateError("INVALID_STATE missing generation")
    for key in ("id", "baseline_commit", "dispatch_ticket"):
        require_string(generation.get(key), f"generation.{key}")
    if state["phase"] == "generation_pending":
        if generation.get("orchestrator_task_id") is not None or generation.get("orchestrator_claim_id") is not None:
            raise StateError("INVALID_STATE pending generation owner")
    else:
        for key in ("orchestrator_task_id", "orchestrator_claim_id"):
            require_string(generation.get(key), f"generation.{key}")
    for key in ("used_writer_task_ids",):
        values = generation.get(key)
        if not isinstance(values, list) or not all(
            isinstance(value, str) and value.strip() for value in values
        ):
            raise StateError(f"INVALID_STATE generation.{key}")
    for key in ("orchestrator_recoveries",):
        require_nonnegative_int(generation.get(key), f"generation.{key}")
    if generation["orchestrator_recoveries"] > MAX_RECOVERIES:
        raise StateError("INVALID_STATE orchestrator recovery limit")
    recovery_dispatch = generation.get("recovery_dispatch")
    if recovery_dispatch is not None:
        if not isinstance(recovery_dispatch, dict) or recovery_dispatch.get("role") not in {
            "orchestrator",
            "writer",
        }:
            raise StateError("INVALID_STATE recovery_dispatch")
        for key in ("ticket", "expected_task_id", "expected_claim_id"):
            require_string(recovery_dispatch.get(key), f"recovery_dispatch.{key}")
        if recovery_dispatch["role"] == "writer" and active_slice is None:
            raise StateError("INVALID_STATE writer recovery without slice")
    accepted = generation.get("accepted_slices")
    if not isinstance(accepted, list) or len(accepted) > MAX_SLICES:
        raise StateError("INVALID_STATE accepted_slices")
    accepted_ids: list[str] = []
    for entry in accepted:
        if not isinstance(entry, dict):
            raise StateError("INVALID_STATE accepted slice")
        for key in ("slice_id", "commit", "contract_hash", "content_id"):
            require_string(entry.get(key), f"accepted_slice.{key}")
        accepted_ids.append(entry["slice_id"])
    if len(set(accepted_ids)) != len(accepted_ids):
        raise StateError("INVALID_STATE duplicate accepted slice")
    if active_slice is not None:
        if not isinstance(active_slice, dict) or active_slice.get("phase") not in SLICE_PHASES:
            raise StateError("INVALID_STATE active slice")
        validate_contract(active_slice.get("contract"))
        if digest(active_slice["contract"]) != active_slice.get("contract_hash"):
            raise StateError("INVALID_STATE contract hash")
        for key in ("slice_id", "base_commit", "dispatch_ticket", "dispatch_status"):
            require_string(active_slice.get(key), f"active_slice.{key}")
        if active_slice["slice_id"] != active_slice["contract"]["slice_id"]:
            raise StateError("INVALID_STATE slice contract mismatch")
        for key in ("writer_recoveries", "repair_attempts"):
            require_nonnegative_int(active_slice.get(key), f"active_slice.{key}")
        if active_slice["writer_recoveries"] > MAX_RECOVERIES:
            raise StateError("INVALID_STATE writer recovery limit")
        if active_slice["repair_attempts"] > MAX_REPAIRS:
            raise StateError("INVALID_STATE repair limit")
        if active_slice["dispatch_status"] not in {"pending", "claimed"}:
            raise StateError("INVALID_STATE dispatch status")
        if not isinstance(active_slice.get("reviewer_task_ids"), list):
            raise StateError("INVALID_STATE active_slice.reviewer_task_ids")
        if not all(
            isinstance(value, str) and value.strip()
            for value in active_slice["reviewer_task_ids"]
        ):
            raise StateError("INVALID_STATE active slice reviewer identity")
        writer_task = active_slice.get("writer_task_id")
        writer_claim = active_slice.get("writer_claim_id")
        if (writer_task is None) != (writer_claim is None):
            raise StateError("INVALID_STATE partial writer ownership")
        if writer_task is not None:
            require_string(writer_task, "active_slice.writer_task_id")
            require_string(writer_claim, "active_slice.writer_claim_id")
            if writer_task not in history["writers"] or writer_task not in generation["used_writer_task_ids"]:
                raise StateError("INVALID_STATE untracked writer")
        if active_slice["phase"] == "selected" and writer_task is not None:
            raise StateError("INVALID_STATE selected writer")
        if active_slice["phase"] not in {"selected", "incomplete"} and writer_task is None:
            raise StateError("INVALID_STATE missing active writer")
        reviewers = active_slice["reviewer_task_ids"]
        if len(reviewers) != len(set(reviewers)) or any(
            reviewer not in history["reviewers"] for reviewer in reviewers
        ):
            raise StateError("INVALID_STATE untracked reviewer")
        validation = active_slice.get("validation")
        if validation is not None:
            validate_evidence_record(validation, "active_slice.validation")
            for key in ("focused_evidence", "full_evidence"):
                require_string(validation.get(key), f"active_slice.validation.{key}")
            if validation["contract_hash"] != active_slice["contract_hash"]:
                raise StateError("INVALID_STATE validation contract mismatch")
        review = active_slice.get("review")
        if review is not None:
            validate_evidence_record(review, "active_slice.review")
            for key in ("reviewer_task_id", "evidence"):
                require_string(review.get(key), f"active_slice.review.{key}")
            if review.get("result") not in {"pass", "block"}:
                raise StateError("INVALID_STATE active_slice.review.result")
            if review["reviewer_task_id"] not in reviewers:
                raise StateError("INVALID_STATE active slice review identity")
            if review["contract_hash"] != active_slice["contract_hash"]:
                raise StateError("INVALID_STATE review contract mismatch")
            if validation is None or review["content_id"] != validation["content_id"]:
                raise StateError("INVALID_STATE review content mismatch")
        commit_intent = active_slice.get("commit_intent")
        if commit_intent is not None:
            if not isinstance(commit_intent, dict):
                raise StateError("INVALID_STATE active_slice.commit_intent")
            for key in ("content_id", "trailer"):
                require_string(commit_intent.get(key), f"active_slice.commit_intent.{key}")
            expected_trailer = (
                f"Contour-Slice: {active_slice['slice_id']}\n"
                f"Contour-Contract: {active_slice['contract_hash']}"
            )
            if (
                review is None
                or commit_intent["content_id"] != review["content_id"]
                or commit_intent["trailer"] != expected_trailer
            ):
                raise StateError("INVALID_STATE commit intent mismatch")
        if active_slice["phase"] in {"reviewing", "commit_pending"} and validation is None:
            raise StateError("INVALID_STATE missing validation evidence")
        if active_slice["phase"] in {"repairing", "commit_pending"} and review is None:
            raise StateError("INVALID_STATE missing review evidence")
        if active_slice["phase"] == "commit_pending" and (
            review.get("result") != "pass" or commit_intent is None
        ):
            raise StateError("INVALID_STATE missing commit intent")
        if not isinstance(active_slice.get("recoverable"), bool):
            raise StateError("INVALID_STATE active slice recoverability")
        if active_slice["phase"] == "incomplete":
            if not isinstance(active_slice.get("recoverable"), bool):
                raise StateError("INVALID_STATE incomplete recoverability")
            if active_slice["recoverable"]:
                if active_slice.get("resume_phase") not in {
                    "implementing",
                    "validating",
                    "reviewing",
                    "repairing",
                    "commit_pending",
                }:
                    raise StateError("INVALID_STATE incomplete resume phase")
    elif state["phase"] == "slice_active":
        raise StateError("INVALID_STATE missing active slice")
    if active_slice is not None and state["phase"] not in {"slice_active", "paused", "blocked"}:
        raise StateError("INVALID_STATE active slice phase")
    if state["phase"] in {"selecting", "alignment_due", "alignment", "handoff_ready", "complete"} and active_slice is not None:
        raise StateError("INVALID_STATE unexpected active slice")
    handoff = state.get("last_handoff")
    if handoff is not None:
        if not isinstance(handoff, dict):
            raise StateError("INVALID_STATE handoff")
        require_string(handoff.get("generation_id"), "last_handoff.generation_id")
        require_string(handoff.get("repository_commit"), "last_handoff.repository_commit")
        require_string(handoff.get("handoff_hash"), "last_handoff.handoff_hash")
        handoff_accepted = handoff.get("accepted_slices")
        if not isinstance(handoff_accepted, list):
            raise StateError("INVALID_STATE handoff accepted_slices")
        for entry in handoff_accepted:
            if not isinstance(entry, dict):
                raise StateError("INVALID_STATE handoff accepted slice")
            for key in ("slice_id", "commit", "contract_hash", "content_id"):
                require_string(entry.get(key), f"last_handoff.accepted_slice.{key}")
    if state["phase"] in {"handoff_ready", "complete"}:
        if not isinstance(handoff, dict):
            raise StateError("INVALID_STATE missing handoff")
        if handoff.get("generation_id") != generation["id"]:
            raise StateError("INVALID_STATE stale handoff")
        if handoff.get("accepted_slices") != accepted:
            raise StateError("INVALID_STATE handoff acceptance mismatch")
    if state["phase"] == "complete" and completion_evidence is None:
        raise StateError("INVALID_STATE missing completion evidence")
    if state["phase"] != "complete" and completion_evidence is not None:
        raise StateError("INVALID_STATE premature completion evidence")
    if state["phase"] == "complete" and goal_completion_review is None:
        raise StateError("INVALID_STATE missing goal review")
    if state["phase"] not in {"handoff_ready", "complete"} and goal_completion_review is not None:
        raise StateError("INVALID_STATE stale goal review")
    if state["phase"] == "complete":
        terminal_commits = {
            handoff["repository_commit"],
            state["last_completion_audit"]["repository_commit"]
            if isinstance(state.get("last_completion_audit"), dict)
            else None,
            state["last_ui_checkpoint"]["repository_commit"]
            if isinstance(state.get("last_ui_checkpoint"), dict)
            else None,
            goal_completion_review["repository_commit"],
            completion_evidence["repository_commit"],
        }
        if terminal_commits != {handoff["repository_commit"]}:
            raise StateError("INVALID_STATE terminal commit mismatch")
        if goal_completion_review["result"] != "pass":
            raise StateError("INVALID_STATE blocking goal review")
        if completion_evidence["reviewer_task_id"] != goal_completion_review["reviewer_task_id"]:
            raise StateError("INVALID_STATE completion reviewer mismatch")
    orchestrator_task = generation.get("orchestrator_task_id")
    if orchestrator_task is not None and orchestrator_task not in history["orchestrators"]:
        raise StateError("INVALID_STATE untracked orchestrator")
    if len(generation["used_writer_task_ids"]) != len(set(generation["used_writer_task_ids"])):
        raise StateError("INVALID_STATE duplicate generation writer")
    if any(writer not in history["writers"] for writer in generation["used_writer_task_ids"]):
        raise StateError("INVALID_STATE untracked generation writer")


def load_contract(path: Path) -> dict[str, Any]:
    try:
        return validate_contract(json.loads(path.read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError) as error:
        raise StateError(f"INVALID_CONTRACT {error}") from error


def task_id(explicit: str | None, enforce_current: bool = True) -> str:
    environment_value = os.environ.get("CODEX_THREAD_ID", "").strip()
    value = require_string(explicit or environment_value, "task_id").strip()
    if enforce_current and environment_value and explicit and environment_value != value:
        raise StateError("CALLER_TASK_MISMATCH")
    return value


def task_was_used(state: dict[str, Any], candidate: str) -> bool:
    return any(candidate in state["task_history"][role] for role in ("orchestrators", "writers", "reviewers"))


def verify_clean_head(repository: Path, asserted_commit: str, label: str) -> str:
    head = git_output(repository, "rev-parse", "HEAD").strip()
    if asserted_commit != head:
        raise StateError(f"{label}_NOT_AUTHORITATIVE_HEAD")
    if git_output(repository, "status", "--porcelain=v1").strip():
        raise StateError(f"{label}_CHECKOUT_NOT_CLEAN")
    if default_checkout_lock_path(repository).exists():
        raise StateError(f"{label}_CHECKOUT_OWNED")
    return head


def require_revision(state: dict[str, Any], expected: int) -> None:
    if state["revision"] != expected:
        raise StateError(f"STALE_REVISION expected={expected} actual={state['revision']}")


def require_orchestrator(state: dict[str, Any], generation_id: str, claim_id: str) -> dict[str, Any]:
    generation = state.get("generation")
    if not isinstance(generation, dict) or generation.get("id") != generation_id:
        raise StateError("GENERATION_MISMATCH")
    if generation.get("orchestrator_claim_id") != claim_id:
        raise StateError("ORCHESTRATOR_CLAIM_MISMATCH")
    if generation.get("orchestrator_task_id") != task_id(None):
        raise StateError("ORCHESTRATOR_TASK_MISMATCH")
    return generation


def require_writer(state: dict[str, Any], generation_id: str, claim_id: str) -> dict[str, Any]:
    if state.get("authorization") != "standing" or state.get("phase") != "slice_active":
        raise StateError("WRITER_NOT_ACTIVE")
    require_orchestrator_generation(state, generation_id)
    active_slice = state.get("active_slice")
    if not isinstance(active_slice, dict) or active_slice.get("writer_claim_id") != claim_id:
        raise StateError("WRITER_CLAIM_MISMATCH")
    if active_slice.get("writer_task_id") != task_id(None):
        raise StateError("WRITER_TASK_MISMATCH")
    return active_slice


def require_orchestrator_generation(state: dict[str, Any], generation_id: str) -> dict[str, Any]:
    generation = state.get("generation")
    if not isinstance(generation, dict) or generation.get("id") != generation_id:
        raise StateError("GENERATION_MISMATCH")
    return generation


def operation_fingerprint(command: str, payload: dict[str, Any]) -> str:
    return digest({"command": command, "payload": payload})


def mutate(
    path: Path,
    command: str,
    operation_id: str,
    expected_revision: int,
    payload: dict[str, Any],
    transition: Callable[[dict[str, Any]], str],
) -> int:
    require_string(operation_id, "operation_id")
    fingerprint = operation_fingerprint(command, payload)
    with guarded(path):
        state = read_state(path)
        previous = next(
            (entry for entry in state["operations"] if entry.get("id") == operation_id),
            None,
        )
        if previous is not None:
            if previous.get("fingerprint") != fingerprint:
                raise StateError("OPERATION_ID_REUSED")
            print(previous["result"])
            return 0
        require_revision(state, expected_revision)
        result = transition(state)
        state["revision"] += 1
        state["updated_at"] = int(time.time())
        state["operations"].append(
            {"id": operation_id, "fingerprint": fingerprint, "result": result}
        )
        validate_state(state)
        durable_write(path, state)
    print(result)
    return 0


def migrate(path: Path, repository: Path, args: argparse.Namespace) -> int:
    current = args.legacy_current_run
    incomplete = args.legacy_incomplete_run
    if (current == "none") != (incomplete == "none") or (
        current != "none" and current != incomplete
    ):
        raise StateError("LEGACY_RUN_CONFLICT")
    with guarded(path):
        if path.exists():
            state = read_state(path)
            if state["repository_root"] != str(repository):
                raise StateError("REPOSITORY_ROOT_MISMATCH")
            print(f"STATE_EXISTS revision={state['revision']}")
            return 0
        verify_clean_head(repository, args.repository_commit, "MIGRATION")
        state: dict[str, Any] = {
            "schema_version": SCHEMA_VERSION,
            "revision": 0,
            "goal_id": args.goal_id,
            "repository_root": str(repository),
            "authorization": args.authorization,
            "completion_audit_count": args.completion_audit_count,
            "ui_checkpoint_count": args.ui_checkpoint_count,
            "phase": "idle",
            "generation": None,
            "active_slice": None,
            "last_handoff": None,
            "last_completion_audit": None,
            "last_ui_checkpoint": None,
            "completion_evidence": None,
            "goal_completion_review": None,
            "operations": [],
            "task_history": {"orchestrators": [], "writers": [], "reviewers": []},
            "migrated_from": {
                "current_run": current,
                "incomplete_run": incomplete,
                "repository_commit": args.repository_commit,
            },
            "updated_at": int(time.time()),
        }
        if current != "none":
            if args.contract_file is None or args.orchestrator_task_id is None:
                raise StateError("LEGACY_INCOMPLETE_REQUIRES_CONTRACT_AND_ORCHESTRATOR")
            contract = load_contract(args.contract_file)
            if contract["slice_id"] != current:
                raise StateError("LEGACY_CONTRACT_SLICE_MISMATCH")
            state["phase"] = "slice_active"
            state["generation"] = new_generation(
                task_id(args.orchestrator_task_id, enforce_current=False), args.repository_commit
            )
            state["task_history"]["orchestrators"].append(
                task_id(args.orchestrator_task_id, enforce_current=False)
            )
            state["active_slice"] = new_slice(contract, args.repository_commit)
            state["active_slice"]["phase"] = "incomplete"
            state["active_slice"]["resume_phase"] = "implementing"
            state["active_slice"]["recoverable"] = True
            state["active_slice"]["failure_reason"] = "imported legacy incomplete run"
        validate_state(state)
        durable_write(path, state)
    print("MIGRATED")
    return 0


def new_generation(orchestrator_task_id: str, baseline_commit: str) -> dict[str, Any]:
    return {
        "id": secrets.token_hex(12),
        "orchestrator_task_id": orchestrator_task_id,
        "orchestrator_claim_id": secrets.token_hex(16),
        "dispatch_ticket": secrets.token_hex(16),
        "baseline_commit": baseline_commit,
        "accepted_slices": [],
        "used_writer_task_ids": [],
        "orchestrator_recoveries": 0,
        "recovery_dispatch": None,
        "started_at": int(time.time()),
    }


def pending_generation(baseline_commit: str) -> dict[str, Any]:
    generation = new_generation("pending", baseline_commit)
    generation["orchestrator_task_id"] = None
    generation["orchestrator_claim_id"] = None
    return generation


def new_slice(contract: dict[str, Any], base_commit: str) -> dict[str, Any]:
    return {
        "slice_id": contract["slice_id"],
        "contract": contract,
        "contract_hash": digest(contract),
        "base_commit": base_commit,
        "phase": "selected",
        "dispatch_ticket": secrets.token_hex(16),
        "dispatch_status": "pending",
        "writer_task_id": None,
        "writer_claim_id": None,
        "writer_recoveries": 0,
        "repair_attempts": 0,
        "reviewer_task_ids": [],
        "validation": None,
        "review": None,
        "commit_intent": None,
        "recoverable": True,
    }


def reserve_generation(path: Path, repository: Path, args: argparse.Namespace) -> int:
    payload = {"baseline_commit": args.repository_commit}

    def transition(state: dict[str, Any]) -> str:
        if state["authorization"] != "standing":
            raise StateError("AUTHORIZATION_NOT_STANDING")
        if state["phase"] not in {"idle", "handoff_ready"}:
            raise StateError(f"INVALID_TRANSITION {state['phase']} -> generation_pending")
        verify_clean_head(repository, args.repository_commit, "GENERATION_BASELINE")
        if state["phase"] == "handoff_ready":
            handoff = state.get("last_handoff")
            if not isinstance(handoff, dict) or handoff.get("repository_commit") != args.repository_commit:
                raise StateError("GENERATION_BASELINE_DISCONTINUITY")
        elif state.get("migrated_from", {}).get("repository_commit") != args.repository_commit:
            raise StateError("GENERATION_BASELINE_DISCONTINUITY")
        generation = pending_generation(args.repository_commit)
        state.update(
            phase="generation_pending",
            generation=generation,
            active_slice=None,
            completion_evidence=None,
            goal_completion_review=None,
        )
        return f"GENERATION_RESERVED id={generation['id']} ticket={generation['dispatch_ticket']}"

    return mutate(path, "reserve-generation", args.operation_id, args.expected_revision, payload, transition)


def claim_generation(path: Path, args: argparse.Namespace) -> int:
    owner = task_id(args.orchestrator_task_id)
    payload = {"ticket": args.dispatch_ticket, "owner": owner}

    def transition(state: dict[str, Any]) -> str:
        generation = state.get("generation")
        if state["authorization"] != "standing":
            raise StateError("AUTHORIZATION_NOT_STANDING")
        if state["phase"] != "generation_pending" or not isinstance(generation, dict):
            raise StateError("NO_PENDING_GENERATION")
        if generation["dispatch_ticket"] != args.dispatch_ticket:
            raise StateError("DISPATCH_TICKET_MISMATCH")
        if task_was_used(state, owner):
            raise StateError("ORCHESTRATOR_NOT_FRESH")
        generation["orchestrator_task_id"] = owner
        generation["orchestrator_claim_id"] = secrets.token_hex(16)
        state["task_history"]["orchestrators"].append(owner)
        state["phase"] = "selecting"
        return f"GENERATION_CLAIMED id={generation['id']} claim={generation['orchestrator_claim_id']}"

    return mutate(path, "claim-generation", args.operation_id, args.expected_revision, payload, transition)


def begin_slice(path: Path, repository: Path, args: argparse.Namespace) -> int:
    contract = load_contract(args.contract_file)
    payload = {"generation_id": args.generation_id, "contract": contract, "base": args.base_commit}

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        if state["authorization"] != "standing":
            raise StateError("AUTHORIZATION_NOT_STANDING")
        if state["phase"] != "selecting":
            raise StateError(f"INVALID_TRANSITION {state['phase']} -> slice_active")
        if len(generation["accepted_slices"]) >= MAX_SLICES:
            raise StateError("GENERATION_SLICE_LIMIT")
        if state["completion_audit_count"] >= 3:
            raise StateError("COMPLETION_AUDIT_DUE")
        if contract["ui_change"] and state["ui_checkpoint_count"] >= 5:
            raise StateError("UI_CHECKPOINT_DUE")
        verify_clean_head(repository, args.base_commit, "SLICE_BASE")
        expected_base = (
            generation["accepted_slices"][-1]["commit"]
            if generation["accepted_slices"]
            else generation["baseline_commit"]
        )
        if args.base_commit != expected_base:
            raise StateError("SLICE_BASE_DISCONTINUITY")
        accepted_ids = {entry["slice_id"] for entry in generation["accepted_slices"]}
        if contract["slice_id"] in accepted_ids:
            raise StateError("DUPLICATE_SLICE_ID")
        active_slice = new_slice(contract, args.base_commit)
        state.update(phase="slice_active", active_slice=active_slice)
        return (
            f"SLICE_SELECTED id={contract['slice_id']} ticket={active_slice['dispatch_ticket']} "
            f"contract={active_slice['contract_hash']}"
        )

    return mutate(path, "begin-slice", args.operation_id, args.expected_revision, payload, transition)


def claim_writer(path: Path, args: argparse.Namespace) -> int:
    writer = task_id(args.writer_task_id)
    payload = {"generation_id": args.generation_id, "ticket": args.dispatch_ticket, "writer": writer}

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator_generation(state, args.generation_id)
        if state["authorization"] != "standing":
            raise StateError("AUTHORIZATION_NOT_STANDING")
        active_slice = state.get("active_slice")
        if state["phase"] != "slice_active" or not isinstance(active_slice, dict):
            raise StateError("NO_ACTIVE_SLICE")
        claimable_phase = active_slice["phase"] == "selected" or (
            active_slice["phase"] == "incomplete"
            and active_slice.get("recoverable") is True
            and active_slice.get("writer_task_id") is None
            and active_slice.get("resume_phase") == "implementing"
        )
        if not claimable_phase or active_slice["dispatch_ticket"] != args.dispatch_ticket:
            raise StateError("DISPATCH_TICKET_MISMATCH")
        if task_was_used(state, writer):
            raise StateError("WRITER_NOT_FRESH")
        claim = secrets.token_hex(16)
        active_slice.update(
            phase="implementing",
            writer_task_id=writer,
            writer_claim_id=claim,
            dispatch_status="claimed",
        )
        active_slice.pop("resume_phase", None)
        active_slice.pop("failure_reason", None)
        generation["used_writer_task_ids"].append(writer)
        state["task_history"]["writers"].append(writer)
        return f"WRITER_CLAIMED task={writer} claim={claim}"

    return mutate(path, "claim-writer", args.operation_id, args.expected_revision, payload, transition)


def advance_slice(path: Path, args: argparse.Namespace) -> int:
    payload = {"generation_id": args.generation_id, "to": args.to}

    def transition(state: dict[str, Any]) -> str:
        active_slice = require_writer(state, args.generation_id, args.writer_claim_id)
        allowed = {
            "implementing": "validating",
            "repairing": "validating",
        }
        if allowed.get(active_slice["phase"]) != args.to:
            raise StateError(f"INVALID_SLICE_TRANSITION {active_slice['phase']} -> {args.to}")
        active_slice["phase"] = args.to
        if args.to == "validating":
            active_slice["validation"] = None
            active_slice["review"] = None
            active_slice["commit_intent"] = None
        return f"SLICE_PHASE {args.to}"

    return mutate(path, "advance-slice", args.operation_id, args.expected_revision, payload, transition)


def record_validation(path: Path, repository: Path, args: argparse.Namespace) -> int:
    payload = {
        "generation_id": args.generation_id,
        "content_id": args.content_id,
        "focused": args.focused_evidence,
        "full": args.full_evidence,
    }

    def transition(state: dict[str, Any]) -> str:
        active_slice = require_writer(state, args.generation_id, args.writer_claim_id)
        if active_slice["phase"] != "validating":
            raise StateError("VALIDATION_NOT_EXPECTED")
        tree = git_output(repository, "write-tree").strip()
        if args.content_id != tree:
            raise StateError(f"CONTENT_ID_MISMATCH expected={tree}")
        status_lines = git_output(repository, "status", "--porcelain=v1").splitlines()
        if any(line.startswith("??") or len(line) < 2 or line[1] != " " for line in status_lines):
            raise StateError("UNSTAGED_OR_UNTRACKED_CONTENT")
        active_slice["validation"] = {
            "content_id": args.content_id,
            "contract_hash": active_slice["contract_hash"],
            "focused_evidence": args.focused_evidence,
            "full_evidence": args.full_evidence,
        }
        active_slice["phase"] = "reviewing"
        return "VALIDATION_RECORDED"

    return mutate(path, "record-validation", args.operation_id, args.expected_revision, payload, transition)


def record_review(path: Path, args: argparse.Namespace) -> int:
    reviewer = task_id(args.reviewer_task_id)
    payload = {
        "generation_id": args.generation_id,
        "content_id": args.content_id,
        "reviewer": reviewer,
        "result": args.result,
        "evidence": args.evidence,
    }

    def transition(state: dict[str, Any]) -> str:
        if state.get("authorization") != "standing" or state.get("phase") != "slice_active":
            raise StateError("REVIEWER_NOT_ACTIVE")
        generation = require_orchestrator_generation(state, args.generation_id)
        active_slice = state.get("active_slice")
        if not isinstance(active_slice, dict) or active_slice.get("writer_claim_id") != args.writer_claim_id:
            raise StateError("WRITER_CLAIM_MISMATCH")
        if active_slice["phase"] != "reviewing" or active_slice["validation"] is None:
            raise StateError("REVIEW_NOT_EXPECTED")
        if active_slice["validation"]["content_id"] != args.content_id:
            raise StateError("STALE_REVIEW_CONTENT")
        if reviewer in active_slice["reviewer_task_ids"]:
            raise StateError("REVIEWER_NOT_FRESH")
        if task_was_used(state, reviewer):
            raise StateError("REVIEWER_NOT_INDEPENDENT")
        active_slice["reviewer_task_ids"].append(reviewer)
        state["task_history"]["reviewers"].append(reviewer)
        active_slice["review"] = {
            "content_id": args.content_id,
            "contract_hash": active_slice["contract_hash"],
            "reviewer_task_id": reviewer,
            "result": args.result,
            "evidence": args.evidence,
        }
        if args.result == "pass":
            active_slice["phase"] = "commit_pending"
            trailer = (
                f"Contour-Slice: {active_slice['slice_id']}\n"
                f"Contour-Contract: {active_slice['contract_hash']}"
            )
            active_slice["commit_intent"] = {"content_id": args.content_id, "trailer": trailer}
            return f"REVIEW_PASSED trailer={json.dumps(trailer)}"
        if active_slice["repair_attempts"] >= MAX_REPAIRS:
            active_slice["phase"] = "incomplete"
            active_slice["recoverable"] = False
            active_slice.pop("resume_phase", None)
            active_slice["failure_reason"] = "repair retry limit exhausted"
            return "SLICE_INCOMPLETE repair-limit-exhausted"
        active_slice["repair_attempts"] += 1
        active_slice["phase"] = "repairing"
        return f"REPAIR_REQUIRED attempt={active_slice['repair_attempts']}"

    return mutate(path, "record-review", args.operation_id, args.expected_revision, payload, transition)


def git_output(repository: Path, *arguments: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repository), *arguments],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise StateError(f"GIT_VERIFICATION_FAILED {' '.join(arguments)}")
    return result.stdout


def finalize_slice(path: Path, repository: Path, args: argparse.Namespace) -> int:
    payload = {"generation_id": args.generation_id, "commit": args.commit, "content_id": args.content_id}

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator_generation(state, args.generation_id)
        active_slice = require_writer(state, args.generation_id, args.writer_claim_id)
        if active_slice["phase"] != "commit_pending":
            raise StateError("COMMIT_NOT_EXPECTED")
        validation = active_slice.get("validation")
        review = active_slice.get("review")
        if not validation or not review or review.get("result") != "pass":
            raise StateError("MISSING_ACCEPTANCE_EVIDENCE")
        if validation["content_id"] != args.content_id or review["content_id"] != args.content_id:
            raise StateError("STALE_ACCEPTANCE_CONTENT")
        git_output(repository, "cat-file", "-e", f"{args.commit}^{{commit}}")
        if git_output(repository, "rev-parse", "HEAD").strip() != args.commit:
            raise StateError("COMMIT_NOT_AUTHORITATIVE_HEAD")
        if git_output(repository, "status", "--porcelain=v1").strip():
            raise StateError("CHECKOUT_NOT_CLEAN")
        if default_checkout_lock_path(repository).exists():
            raise StateError("CHECKOUT_OWNERSHIP_NOT_RELEASED")
        ancestor = subprocess.run(
            ["git", "-C", str(repository), "merge-base", "--is-ancestor", active_slice["base_commit"], args.commit],
            check=False,
        )
        if ancestor.returncode != 0:
            raise StateError("COMMIT_NOT_DESCENDED_FROM_SLICE_BASE")
        trailers = commit_trailers(repository, args.commit)
        expected_trailers = {
            "contour-slice": active_slice["slice_id"],
            "contour-contract": active_slice["contract_hash"],
        }
        if any(trailers.get(key) != [value] for key, value in expected_trailers.items()):
            raise StateError("COMMIT_TRAILER_MISMATCH")
        if git_output(repository, "show", "-s", "--format=%T", args.commit).strip() != args.content_id:
            raise StateError("COMMIT_CONTENT_MISMATCH")
        changed_paths = git_output(
            repository, "diff", "--name-only", active_slice["base_commit"], args.commit
        ).splitlines()
        if any(
            not any(path_is_included(changed_path, allowed) for allowed in active_slice["contract"]["included_paths"])
            for changed_path in changed_paths
        ):
            raise StateError("COMMIT_PATH_OUTSIDE_CONTRACT")
        if any(entry["slice_id"] == active_slice["slice_id"] for entry in generation["accepted_slices"]):
            raise StateError("DUPLICATE_SLICE_ACCEPTANCE")
        generation["accepted_slices"].append(
            {
                "slice_id": active_slice["slice_id"],
                "commit": args.commit,
                "contract_hash": active_slice["contract_hash"],
                "content_id": args.content_id,
            }
        )
        count = len(generation["accepted_slices"])
        state["completion_audit_count"] = min(3, state["completion_audit_count"] + 1)
        if active_slice["contract"]["ui_change"]:
            if active_slice.get("ui_checkpoint_content_id") == args.content_id:
                state["ui_checkpoint_count"] = 0
            else:
                if state["ui_checkpoint_count"] >= 4:
                    raise StateError("UI_CHECKPOINT_DUE")
                state["ui_checkpoint_count"] += 1
        state["active_slice"] = None
        state["phase"] = "alignment_due" if count == MAX_SLICES else "selecting"
        return f"SLICE_ACCEPTED count={count} next={state['phase']}"

    return mutate(path, "finalize-slice", args.operation_id, args.expected_revision, payload, transition)


def request_alignment(path: Path, args: argparse.Namespace) -> int:
    payload = {"generation_id": args.generation_id, "reason": args.reason}

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        if state["phase"] != "selecting" or not generation["accepted_slices"]:
            raise StateError("ALIGNMENT_NOT_AVAILABLE")
        state["phase"] = "alignment_due"
        generation["alignment_reason"] = args.reason
        return "ALIGNMENT_DUE"

    return mutate(path, "request-alignment", args.operation_id, args.expected_revision, payload, transition)


def begin_alignment(path: Path, args: argparse.Namespace) -> int:
    payload = {"generation_id": args.generation_id}

    def transition(state: dict[str, Any]) -> str:
        require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        if state["phase"] != "alignment_due":
            raise StateError("ALIGNMENT_NOT_DUE")
        state["phase"] = "alignment"
        return "ALIGNMENT_STARTED"

    return mutate(path, "begin-alignment", args.operation_id, args.expected_revision, payload, transition)


def complete_alignment(path: Path, repository: Path, args: argparse.Namespace) -> int:
    handoff = args.handoff_file.read_text(encoding="utf-8")
    if "No next slice selected" not in handoff:
        raise StateError("HANDOFF_SELECTS_OR_OMITS_SUCCESSOR")
    payload = {
        "generation_id": args.generation_id,
        "repository_commit": args.repository_commit,
        "handoff_hash": hashlib.sha256(handoff.encode("utf-8")).hexdigest(),
    }

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        if state["phase"] != "alignment":
            raise StateError("ALIGNMENT_NOT_ACTIVE")
        accepted = generation["accepted_slices"]
        if not accepted or accepted[-1]["commit"] != args.repository_commit:
            raise StateError("ALIGNMENT_COMMIT_MISMATCH")
        verify_clean_head(repository, args.repository_commit, "ALIGNMENT")
        state["last_handoff"] = {
            "generation_id": generation["id"],
            "accepted_slices": generation["accepted_slices"],
            "repository_commit": args.repository_commit,
            "handoff_hash": payload["handoff_hash"],
        }
        state["phase"] = "handoff_ready"
        return "HANDOFF_READY"

    return mutate(path, "complete-alignment", args.operation_id, args.expected_revision, payload, transition)


def record_checkpoint(
    path: Path,
    repository: Path,
    args: argparse.Namespace,
    ui: bool,
) -> int:
    command = "record-ui-checkpoint" if ui else "record-completion-audit"
    payload = {
        "generation_id": args.generation_id,
        "repository_commit": args.repository_commit,
        "evidence": args.evidence,
        "content_id": getattr(args, "content_id", None),
    }

    def transition(state: dict[str, Any]) -> str:
        require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        allowed_phases = {"selecting", "alignment_due", "alignment", "handoff_ready"}
        if ui:
            allowed_phases.add("slice_active")
        if state["authorization"] != "standing" or state["phase"] not in allowed_phases:
            raise StateError("CHECKPOINT_NOT_AVAILABLE")
        record = {
            "repository_commit": args.repository_commit,
            "evidence": args.evidence,
        }
        if ui:
            active_slice = state.get("active_slice")
            if state["phase"] == "slice_active":
                if (
                    not isinstance(active_slice, dict)
                    or not active_slice["contract"]["ui_change"]
                    or active_slice.get("phase") != "commit_pending"
                    or active_slice.get("validation") is None
                    or args.content_id != active_slice["validation"].get("content_id")
                    or git_output(repository, "write-tree").strip() != args.content_id
                    or git_output(repository, "rev-parse", "HEAD").strip() != args.repository_commit
                ):
                    raise StateError("UI_CHECKPOINT_CONTENT_MISMATCH")
                status_lines = git_output(repository, "status", "--porcelain=v1").splitlines()
                if any(line.startswith("??") or len(line) < 2 or line[1] != " " for line in status_lines):
                    raise StateError("UNSTAGED_OR_UNTRACKED_CONTENT")
                active_slice["ui_checkpoint_content_id"] = args.content_id
                record["content_id"] = args.content_id
                record["slice_id"] = active_slice["slice_id"]
            else:
                verify_clean_head(repository, args.repository_commit, "CHECKPOINT")
            state["ui_checkpoint_count"] = 0
            state["last_ui_checkpoint"] = record
            return "UI_CHECKPOINT_RECORDED"
        verify_clean_head(repository, args.repository_commit, "CHECKPOINT")
        state["completion_audit_count"] = 0
        state["last_completion_audit"] = record
        return "COMPLETION_AUDIT_RECORDED"

    return mutate(path, command, args.operation_id, args.expected_revision, payload, transition)


def record_goal_review(path: Path, repository: Path, args: argparse.Namespace) -> int:
    reviewer = task_id(args.reviewer_task_id)
    payload = {
        "generation_id": args.generation_id,
        "repository_commit": args.repository_commit,
        "reviewer_task_id": reviewer,
        "result": args.result,
        "evidence": args.evidence,
    }

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator_generation(state, args.generation_id)
        if state["authorization"] != "standing" or state["phase"] != "handoff_ready":
            raise StateError("GOAL_REVIEW_NOT_AVAILABLE")
        if task_was_used(state, reviewer):
            raise StateError("REVIEWER_NOT_INDEPENDENT")
        handoff = state.get("last_handoff")
        if not isinstance(handoff, dict) or handoff.get("repository_commit") != args.repository_commit:
            raise StateError("GOAL_REVIEW_COMMIT_MISMATCH")
        verify_clean_head(repository, args.repository_commit, "GOAL_REVIEW")
        state["task_history"]["reviewers"].append(reviewer)
        state["goal_completion_review"] = {
            "repository_commit": args.repository_commit,
            "reviewer_task_id": reviewer,
            "result": args.result,
            "evidence": args.evidence,
        }
        generation["goal_review_recorded"] = True
        return f"GOAL_REVIEW_RECORDED result={args.result}"

    return mutate(path, "record-goal-review", args.operation_id, args.expected_revision, payload, transition)


def mark_writer_incomplete(path: Path, args: argparse.Namespace) -> int:
    payload = {
        "generation_id": args.generation_id,
        "writer_task_id": args.writer_task_id,
        "writer_claim_id": args.writer_claim_id,
        "reason": args.reason,
    }

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        active_slice = state.get("active_slice")
        if state["phase"] != "slice_active" or not isinstance(active_slice, dict):
            raise StateError("NO_ACTIVE_SLICE")
        if active_slice.get("writer_task_id") != args.writer_task_id:
            raise StateError("RECOVERY_TASK_MISMATCH")
        if active_slice.get("writer_claim_id") != args.writer_claim_id:
            raise StateError("RECOVERY_CLAIM_MISMATCH")
        if active_slice["phase"] == "commit_pending":
            resume_phase = "commit_pending"
        elif active_slice["phase"] in {"implementing", "validating", "reviewing", "repairing"}:
            resume_phase = active_slice["phase"]
        else:
            raise StateError("SLICE_ALREADY_INCOMPLETE")
        active_slice["resume_phase"] = resume_phase
        active_slice["recoverable"] = True
        active_slice["phase"] = "incomplete"
        active_slice["failure_reason"] = args.reason
        generation["incomplete_recorded_at"] = int(time.time())
        return f"SLICE_INCOMPLETE resume={resume_phase}"

    return mutate(path, "mark-writer-incomplete", args.operation_id, args.expected_revision, payload, transition)


def set_generation_state(path: Path, repository: Path, args: argparse.Namespace) -> int:
    payload = {
        "generation_id": args.generation_id,
        "to": args.to,
        "reason": args.reason,
        "repository_commit": args.repository_commit,
        "terminal_evidence_file": str(args.terminal_evidence_file) if args.terminal_evidence_file else None,
    }

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        if args.to in {"paused", "blocked"} and state["phase"] in {
            "generation_pending",
            "paused",
            "blocked",
            "complete",
        }:
            raise StateError(f"INVALID_TRANSITION {state['phase']} -> {args.to}")
        if args.to == "complete":
            handoff = state.get("last_handoff")
            if (
                state.get("active_slice") is not None
                or state["phase"] != "handoff_ready"
                or not isinstance(handoff, dict)
                or handoff.get("generation_id") != generation["id"]
                or handoff.get("accepted_slices") != generation["accepted_slices"]
                or state["completion_audit_count"] != 0
                or state["ui_checkpoint_count"] != 0
            ):
                raise StateError("GOAL_COMPLETION_NOT_READY")
            if not args.repository_commit or not args.terminal_evidence_file:
                raise StateError("GOAL_COMPLETION_EVIDENCE_REQUIRED")
            verify_clean_head(repository, args.repository_commit, "GOAL_COMPLETION")
            if handoff["repository_commit"] != args.repository_commit:
                raise StateError("GOAL_COMPLETION_COMMIT_MISMATCH")
            for checkpoint_key in ("last_completion_audit", "last_ui_checkpoint"):
                checkpoint = state.get(checkpoint_key)
                if not isinstance(checkpoint, dict) or checkpoint.get("repository_commit") != args.repository_commit:
                    raise StateError(f"GOAL_COMPLETION_MISSING_{checkpoint_key.upper()}")
            goal_review = state.get("goal_completion_review")
            if (
                not isinstance(goal_review, dict)
                or goal_review.get("repository_commit") != args.repository_commit
                or goal_review.get("result") != "pass"
            ):
                raise StateError("GOAL_COMPLETION_MISSING_FINAL_REVIEW")
            require_paused_automation()
            evidence, evidence_hash, evidence_path = load_terminal_evidence(
                repository,
                args.terminal_evidence_file,
                state,
            )
            state["completion_evidence"] = {
                "repository_commit": args.repository_commit,
                "evidence_hash": evidence_hash,
                "evidence_path": evidence_path,
                "evidence_schema_version": evidence["schema_version"],
                "reviewer_task_id": goal_review["reviewer_task_id"],
            }
            state["authorization"] = "pending"
        elif args.to == "paused":
            generation["resume_phase"] = state["phase"]
            state["authorization"] = "paused"
        state["phase"] = args.to
        generation["terminal_reason"] = args.reason
        return f"GENERATION_{args.to.upper()}"

    return mutate(path, "set-generation-state", args.operation_id, args.expected_revision, payload, transition)


def resume_generation(path: Path, args: argparse.Namespace) -> int:
    payload = {"generation_id": args.generation_id}

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator(state, args.generation_id, args.orchestrator_claim_id)
        if state["phase"] != "paused" or "resume_phase" not in generation:
            raise StateError("GENERATION_NOT_PAUSED")
        state["phase"] = generation.pop("resume_phase")
        state["authorization"] = "standing"
        generation.pop("terminal_reason", None)
        return f"GENERATION_RESUMED phase={state['phase']}"

    return mutate(path, "resume-generation", args.operation_id, args.expected_revision, payload, transition)


def reserve_recovery(path: Path, args: argparse.Namespace) -> int:
    payload = {
        "generation_id": args.generation_id,
        "role": args.role,
        "expected_task_id": args.expected_task_id,
        "expected_claim_id": args.expected_claim_id,
    }

    def transition(state: dict[str, Any]) -> str:
        if state["authorization"] != "standing" or state["phase"] in {
            "paused",
            "blocked",
            "complete",
        }:
            raise StateError("RECOVERY_NOT_AUTHORIZED")
        generation = require_orchestrator_generation(state, args.generation_id)
        if generation.get("recovery_dispatch") is not None:
            raise StateError("RECOVERY_ALREADY_RESERVED")
        writer = args.role == "writer"
        target = state.get("active_slice") if writer else generation
        if not isinstance(target, dict):
            raise StateError("NO_RECOVERABLE_OWNER")
        task_key = "writer_task_id" if writer else "orchestrator_task_id"
        claim_key = "writer_claim_id" if writer else "orchestrator_claim_id"
        if target.get(task_key) != args.expected_task_id:
            raise StateError("RECOVERY_TASK_MISMATCH")
        if target.get(claim_key) != args.expected_claim_id:
            raise StateError("RECOVERY_CLAIM_MISMATCH")
        if writer and (
            state["phase"] != "slice_active"
            or target.get("phase") != "incomplete"
            or target.get("recoverable") is not True
        ):
            raise StateError("SLICE_NOT_RECOVERABLE")
        ticket = secrets.token_hex(16)
        generation["recovery_dispatch"] = {
            "role": args.role,
            "ticket": ticket,
            "expected_task_id": args.expected_task_id,
            "expected_claim_id": args.expected_claim_id,
        }
        return f"RECOVERY_RESERVED role={args.role} ticket={ticket}"

    return mutate(path, "reserve-recovery", args.operation_id, args.expected_revision, payload, transition)


def recover_owner(path: Path, args: argparse.Namespace, writer: bool) -> int:
    new_owner = task_id(args.new_task_id)
    command = "recover-writer" if writer else "recover-orchestrator"
    payload = {
        "generation_id": args.generation_id,
        "expected_task_id": args.expected_task_id,
        "expected_claim_id": args.expected_claim_id,
        "new_task_id": new_owner,
        "dispatch_ticket": args.dispatch_ticket,
    }

    def transition(state: dict[str, Any]) -> str:
        generation = require_orchestrator_generation(state, args.generation_id)
        if state["authorization"] != "standing" or state["phase"] in {
            "paused",
            "blocked",
            "complete",
        }:
            raise StateError("RECOVERY_NOT_AUTHORIZED")
        dispatch = generation.get("recovery_dispatch")
        expected_role = "writer" if writer else "orchestrator"
        if (
            not isinstance(dispatch, dict)
            or dispatch.get("role") != expected_role
            or dispatch.get("ticket") != args.dispatch_ticket
            or dispatch.get("expected_task_id") != args.expected_task_id
            or dispatch.get("expected_claim_id") != args.expected_claim_id
        ):
            raise StateError("RECOVERY_DISPATCH_MISMATCH")
        target = state.get("active_slice") if writer else generation
        if not isinstance(target, dict):
            raise StateError("NO_RECOVERABLE_OWNER")
        task_key = "writer_task_id" if writer else "orchestrator_task_id"
        claim_key = "writer_claim_id" if writer else "orchestrator_claim_id"
        recoveries_key = "writer_recoveries" if writer else "orchestrator_recoveries"
        if target.get(task_key) != args.expected_task_id:
            raise StateError("RECOVERY_TASK_MISMATCH")
        if target.get(claim_key) != args.expected_claim_id:
            raise StateError("RECOVERY_CLAIM_MISMATCH")
        if new_owner == args.expected_task_id:
            raise StateError("SELF_RECOVERY_FORBIDDEN")
        if writer and task_was_used(state, new_owner):
            raise StateError("WRITER_NOT_FRESH")
        if not writer and task_was_used(state, new_owner):
            raise StateError("ORCHESTRATOR_NOT_FRESH")
        if target.get(recoveries_key, 0) >= MAX_RECOVERIES:
            if writer and state.get("active_slice") is not None:
                state["active_slice"]["phase"] = "incomplete"
                state["active_slice"]["recoverable"] = False
                state["active_slice"].pop("resume_phase", None)
                state["active_slice"]["failure_reason"] = "writer recovery limit exhausted"
            state["phase"] = "blocked"
            generation["recovery_dispatch"] = None
            return "RECOVERY_LIMIT_EXHAUSTED"
        target[recoveries_key] = target.get(recoveries_key, 0) + 1
        target[task_key] = new_owner
        target[claim_key] = secrets.token_hex(16)
        if writer:
            generation["used_writer_task_ids"].append(new_owner)
            state["task_history"]["writers"].append(new_owner)
            if target.get("phase") == "incomplete":
                if target.get("recoverable") is not True or "resume_phase" not in target:
                    raise StateError("SLICE_NOT_RECOVERABLE")
                target["phase"] = target.pop("resume_phase")
                target.pop("failure_reason", None)
        else:
            state["task_history"]["orchestrators"].append(new_owner)
        generation["recovery_dispatch"] = None
        return f"OWNER_RECOVERED task={new_owner} claim={target[claim_key]}"

    return mutate(path, command, args.operation_id, args.expected_revision, payload, transition)


def status(path: Path, json_output: bool) -> int:
    with guarded(path):
        state = read_state(path)
    if json_output:
        print(json.dumps(state, sort_keys=True))
    else:
        generation = state.get("generation") or {}
        active_slice = state.get("active_slice") or {}
        print(
            f"phase={state['phase']} revision={state['revision']} "
            f"generation={generation.get('id', 'none')} "
            f"accepted={len(generation.get('accepted_slices', []))} "
            f"slice={active_slice.get('slice_id', 'none')}"
        )
    return 0


def add_mutation_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--operation-id", required=True)
    parser.add_argument("--expected-revision", required=True, type=int)


def add_generation_claim(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--generation-id", required=True)
    parser.add_argument("--orchestrator-claim-id", required=True)


def add_writer_claim(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--generation-id", required=True)
    parser.add_argument("--writer-claim-id", required=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--path", type=Path)
    parser.add_argument("--repository", type=Path)
    commands = parser.add_subparsers(dest="command", required=True)

    status_parser = commands.add_parser("status")
    status_parser.add_argument("--json", action="store_true")

    migrate_parser = commands.add_parser("migrate")
    migrate_parser.add_argument("--goal-id", required=True)
    migrate_parser.add_argument("--authorization", choices=("standing", "paused"), required=True)
    migrate_parser.add_argument("--repository-commit", required=True)
    migrate_parser.add_argument("--completion-audit-count", required=True, type=int)
    migrate_parser.add_argument("--ui-checkpoint-count", required=True, type=int)
    migrate_parser.add_argument("--legacy-current-run", required=True)
    migrate_parser.add_argument("--legacy-incomplete-run", required=True)
    migrate_parser.add_argument("--contract-file", type=Path)
    migrate_parser.add_argument("--orchestrator-task-id")

    reserve = commands.add_parser("reserve-generation")
    add_mutation_arguments(reserve)
    reserve.add_argument("--repository-commit", required=True)

    claim_generation_parser = commands.add_parser("claim-generation")
    add_mutation_arguments(claim_generation_parser)
    claim_generation_parser.add_argument("--dispatch-ticket", required=True)
    claim_generation_parser.add_argument("--orchestrator-task-id")

    begin = commands.add_parser("begin-slice")
    add_mutation_arguments(begin)
    add_generation_claim(begin)
    begin.add_argument("--contract-file", type=Path, required=True)
    begin.add_argument("--base-commit", required=True)

    claim = commands.add_parser("claim-writer")
    add_mutation_arguments(claim)
    claim.add_argument("--generation-id", required=True)
    claim.add_argument("--dispatch-ticket", required=True)
    claim.add_argument("--writer-task-id")

    advance = commands.add_parser("advance-slice")
    add_mutation_arguments(advance)
    add_writer_claim(advance)
    advance.add_argument("--to", choices=("validating",), required=True)

    validation = commands.add_parser("record-validation")
    add_mutation_arguments(validation)
    add_writer_claim(validation)
    validation.add_argument("--content-id", required=True)
    validation.add_argument("--focused-evidence", required=True)
    validation.add_argument("--full-evidence", required=True)

    review = commands.add_parser("record-review")
    add_mutation_arguments(review)
    add_writer_claim(review)
    review.add_argument("--content-id", required=True)
    review.add_argument("--reviewer-task-id", required=True)
    review.add_argument("--result", choices=("pass", "block"), required=True)
    review.add_argument("--evidence", required=True)

    finalize = commands.add_parser("finalize-slice")
    add_mutation_arguments(finalize)
    add_writer_claim(finalize)
    finalize.add_argument("--commit", required=True)
    finalize.add_argument("--content-id", required=True)

    request = commands.add_parser("request-alignment")
    add_mutation_arguments(request)
    add_generation_claim(request)
    request.add_argument("--reason", required=True)

    align = commands.add_parser("begin-alignment")
    add_mutation_arguments(align)
    add_generation_claim(align)

    complete = commands.add_parser("complete-alignment")
    add_mutation_arguments(complete)
    add_generation_claim(complete)
    complete.add_argument("--repository-commit", required=True)
    complete.add_argument("--handoff-file", type=Path, required=True)

    for name in ("record-completion-audit", "record-ui-checkpoint"):
        checkpoint = commands.add_parser(name)
        add_mutation_arguments(checkpoint)
        add_generation_claim(checkpoint)
        checkpoint.add_argument("--repository-commit", required=True)
        checkpoint.add_argument("--evidence", required=True)
        if name == "record-ui-checkpoint":
            checkpoint.add_argument("--content-id")

    goal_review = commands.add_parser("record-goal-review")
    add_mutation_arguments(goal_review)
    goal_review.add_argument("--generation-id", required=True)
    goal_review.add_argument("--repository-commit", required=True)
    goal_review.add_argument("--reviewer-task-id", required=True)
    goal_review.add_argument("--result", choices=("pass", "block"), required=True)
    goal_review.add_argument("--evidence", required=True)

    incomplete = commands.add_parser("mark-writer-incomplete")
    add_mutation_arguments(incomplete)
    add_generation_claim(incomplete)
    incomplete.add_argument("--writer-task-id", required=True)
    incomplete.add_argument("--writer-claim-id", required=True)
    incomplete.add_argument("--reason", required=True)
    incomplete.add_argument("--verified-terminal", action="store_true", required=True)

    terminal = commands.add_parser("set-generation-state")
    add_mutation_arguments(terminal)
    add_generation_claim(terminal)
    terminal.add_argument("--to", choices=("paused", "blocked", "complete"), required=True)
    terminal.add_argument("--reason", required=True)
    terminal.add_argument("--repository-commit")
    terminal.add_argument("--terminal-evidence-file", type=Path)

    resume = commands.add_parser("resume-generation")
    add_mutation_arguments(resume)
    add_generation_claim(resume)
    resume.add_argument("--owner-authorized", action="store_true", required=True)

    reserve_recovery_parser = commands.add_parser("reserve-recovery")
    add_mutation_arguments(reserve_recovery_parser)
    reserve_recovery_parser.add_argument("--generation-id", required=True)
    reserve_recovery_parser.add_argument("--role", choices=("orchestrator", "writer"), required=True)
    reserve_recovery_parser.add_argument("--expected-task-id", required=True)
    reserve_recovery_parser.add_argument("--expected-claim-id", required=True)
    reserve_recovery_parser.add_argument("--verified-terminal", action="store_true", required=True)

    for name in ("recover-orchestrator", "recover-writer"):
        recover = commands.add_parser(name)
        add_mutation_arguments(recover)
        recover.add_argument("--generation-id", required=True)
        recover.add_argument("--expected-task-id", required=True)
        recover.add_argument("--expected-claim-id", required=True)
        recover.add_argument("--dispatch-ticket", required=True)
        recover.add_argument("--new-task-id")
        recover.add_argument("--verified-terminal", action="store_true", required=True)

    return parser


def main(arguments: list[str] | None = None) -> int:
    args = build_parser().parse_args(arguments)
    try:
        repository = repository_root(args.repository)
        path = args.path or default_state_path(repository)
        if args.command != "migrate" and path.exists():
            with guarded(path):
                existing = read_state(path)
            if existing["repository_root"] != str(repository):
                raise StateError("REPOSITORY_ROOT_MISMATCH")
        if args.command == "status":
            return status(path, args.json)
        if args.command == "migrate":
            return migrate(path, repository, args)
        if args.command == "reserve-generation":
            return reserve_generation(path, repository, args)
        if args.command == "claim-generation":
            return claim_generation(path, args)
        if args.command == "begin-slice":
            return begin_slice(path, repository, args)
        if args.command == "claim-writer":
            return claim_writer(path, args)
        if args.command == "advance-slice":
            return advance_slice(path, args)
        if args.command == "record-validation":
            return record_validation(path, repository, args)
        if args.command == "record-review":
            return record_review(path, args)
        if args.command == "finalize-slice":
            return finalize_slice(path, repository, args)
        if args.command == "request-alignment":
            return request_alignment(path, args)
        if args.command == "begin-alignment":
            return begin_alignment(path, args)
        if args.command == "complete-alignment":
            return complete_alignment(path, repository, args)
        if args.command == "record-completion-audit":
            return record_checkpoint(path, repository, args, ui=False)
        if args.command == "record-ui-checkpoint":
            return record_checkpoint(path, repository, args, ui=True)
        if args.command == "record-goal-review":
            return record_goal_review(path, repository, args)
        if args.command == "mark-writer-incomplete":
            return mark_writer_incomplete(path, args)
        if args.command == "set-generation-state":
            return set_generation_state(path, repository, args)
        if args.command == "resume-generation":
            return resume_generation(path, args)
        if args.command == "reserve-recovery":
            return reserve_recovery(path, args)
        if args.command == "recover-orchestrator":
            return recover_owner(path, args, writer=False)
        if args.command == "recover-writer":
            return recover_owner(path, args, writer=True)
        raise StateError("UNKNOWN_COMMAND")
    except (OSError, StateError, subprocess.SubprocessError) as error:
        print(f"STATE_ERROR {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
