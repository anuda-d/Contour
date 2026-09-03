#!/usr/bin/env sh
set -eu

current_file=docs/plans/CURRENT.md
goal_file=docs/plans/architecture-foundation/GOAL.md
state_file=docs/plans/architecture-foundation/IMPLEMENTATION_PLAN.md

for required_file in \
  AGENTS.md \
  README.md \
  package.json \
  scripts/development_loop_lock.py \
  tests/development-loop-lock.test.ts \
  docs/main/DEVELOPMENT_LOOP.md \
  docs/architecture/ARCHITECTURE_CONTRACT.md \
  docs/architecture/COMPATIBILITY_INVENTORY.md \
  "$current_file" \
  "$goal_file" \
  "$state_file" \
  docs/plans/identity-map-prototype/GOAL.md \
  docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md
do
  test -s "$required_file"
done

grep -q '^- Shared implementation state: \[Implementation Plan\](architecture-foundation/IMPLEMENTATION_PLAN.md)$' \
  "$current_file"
read_field() {
  field_name=$1
  source_file=$2
  field_count=$(sed -n "/^- ${field_name}: /p" "$source_file" | wc -l | tr -d ' ')
  test "$field_count" -eq 1
  sed -n "s/^- ${field_name}: //p" "$source_file" | head -n 1
}

assert_same_field() {
  field_name=$1
  current_value=$(read_field "$field_name" "$current_file")
  state_value=$(read_field "$field_name" "$state_file")
  test -n "$current_value"
  test "$current_value" = "$state_value"
}

for shared_field in \
  'Active goal id' \
  'Owner authorization' \
  'Authorization scope' \
  'Authorization source' \
  'Loop cadence' \
  'Frozen behavior baseline' \
  'Architecture entry gate' \
  'Current run' \
  'Incomplete run' \
  'Run status' \
  'Pending owner decision' \
  'Scheduled window' \
  'Fresh-task relay' \
  'Alignment due' \
  'Visual checkpoint' \
  'UI units since visual checkpoint' \
  'Standing implementation authority'
do
  assert_same_field "$shared_field"
done

active_goal_id=$(read_field 'Active goal id' "$state_file")
owner_authorization=$(read_field 'Owner authorization' "$state_file")
authorization_scope=$(read_field 'Authorization scope' "$state_file")
authorization_source=$(read_field 'Authorization source' "$state_file")
loop_cadence=$(read_field 'Loop cadence' "$state_file")
frozen_baseline=$(read_field 'Frozen behavior baseline' "$state_file")
architecture_gate=$(read_field 'Architecture entry gate' "$state_file")
current_run=$(read_field 'Current run' "$state_file")
incomplete_run=$(read_field 'Incomplete run' "$state_file")
run_status=$(read_field 'Run status' "$state_file")
pending_decision=$(read_field 'Pending owner decision' "$state_file")
scheduled_window=$(read_field 'Scheduled window' "$state_file")
fresh_task_relay=$(read_field 'Fresh-task relay' "$state_file")
alignment_due=$(read_field 'Alignment due' "$state_file")
visual_checkpoint=$(read_field 'Visual checkpoint' "$state_file")
ui_units=$(read_field 'UI units since visual checkpoint' "$state_file")
standing_authority=$(read_field 'Standing implementation authority' "$state_file")

test "$frozen_baseline" = approved
test "$architecture_gate" = open -o "$architecture_gate" = approved
test "$scheduled_window" = 'daily 18:00-23:00 America/Toronto'
test "$alignment_due" = yes -o "$alignment_due" = no
case "$ui_units" in
  0|1|2|3|4|5) ;;
  *) echo "Invalid UI checkpoint count: $ui_units" >&2; exit 1 ;;
esac

test "$(grep -c '^Status:' "$current_file")" -eq 1
test "$(grep -c '^Status:' "$goal_file")" -eq 1
test "$(grep -c '^Status:' "$state_file")" -eq 1
test "$(grep -c '^Status:' README.md)" -eq 1
test "$(grep -c '^- Active work:' "$current_file")" -eq 1

active_goal_count=$(find docs/plans -mindepth 2 -maxdepth 2 -name GOAL.md -exec \
  grep -l '^Status: active;' {} + | wc -l | tr -d ' ')

grep -q 'One implementation task owns at most one work unit\.' \
  docs/main/DEVELOPMENT_LOOP.md
grep -q 'No next unit selected' docs/main/DEVELOPMENT_LOOP.md
grep -q 'newly created fresh task' docs/main/DEVELOPMENT_LOOP.md
grep -q '18:00 until' docs/main/DEVELOPMENT_LOOP.md
grep -q 'create one fresh successor task' docs/main/DEVELOPMENT_LOOP.md
grep -q 'development_loop_lock.py acquire' AGENTS.md docs/main/DEVELOPMENT_LOOP.md
grep -q 'unscoped Codex task listing is not an ownership precondition' \
  docs/main/DEVELOPMENT_LOOP.md
grep -q 'Do not call `list_threads` as part of the no-overlap gate' \
  docs/main/DEVELOPMENT_LOOP.md
grep -q 'Ownership is never taken over or force-released by a different task' \
  docs/main/DEVELOPMENT_LOOP.md
grep -q 'idle owner that asked for input still owns the checkout' \
  docs/main/DEVELOPMENT_LOOP.md
grep -q 'No human approval is required between clean' \
  docs/plans/architecture-foundation/IMPLEMENTATION_PLAN.md
grep -q 'contour-architecture-foundation-handoff.md' \
  "$current_file" "$state_file"

for criterion_number in 1 2 3 4 5 6 7 8 9 10
do
  awk -F '|' -v criterion="AF-${criterion_number}" '
    {
      key = $2
      status = $3
      evidence = $4
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", evidence)
      if (key ~ ("^" criterion " ")) {
        count += 1
        if (status == "open") open += 1
        normalized = tolower(evidence)
        placeholder = normalized ~ /(^|[^a-z])(none( yet)?|pending|tbd|todo|unknown|n\/a|placeholder)([^a-z]|$)/
        if (status == "accepted" && length(evidence) >= 20 && !placeholder) accepted += 1
      }
    }
    END { exit !(count == 1 && open + accepted == 1) }
  ' "$state_file"
done

case "$owner_authorization" in
  standing)
    test "$active_goal_count" -eq 1
    test "$active_goal_id" = architecture-foundation
    test "$authorization_scope" = 'active goal'
    test "$authorization_source" = owner
    test "$loop_cadence" = 'scheduled autonomous relay'
    test "$fresh_task_relay" = active
    test "$standing_authority" = active
    grep -q '^Status: Architecture Foundation is active under standing scheduled authorization\.$' \
      "$current_file" README.md
    grep -q '^- Goal: \[Architecture Foundation\](architecture-foundation/GOAL.md)$' \
      "$current_file"
    test "$(grep -c '^- Goal:' "$current_file")" -eq 1
    test "$(grep -c '^- Last completed goal:' "$current_file")" -eq 0
    grep -q '^Status: active; owner-approved goal under standing scheduled authorization\.$' \
      "$goal_file"
    grep -q '^Status: active shared state; standing scheduled owner authorization\.$' \
      "$state_file"
    if test "$current_run" = none; then
      test "$incomplete_run" = none
      test "$run_status" = 'awaiting scheduled fresh task' -o \
        "$run_status" = selecting -o \
        "$run_status" = 'needs owner decision'
    else
      test "$incomplete_run" = "$current_run"
      test "$run_status" = exploration -o \
        "$run_status" = implementation -o \
        "$run_status" = validation -o \
        "$run_status" = 'visual checkpoint' -o \
        "$run_status" = 'independent review' -o \
        "$run_status" = blocked -o \
        "$run_status" = 'needs owner decision'
    fi
    if test "$pending_decision" = none; then
      test "$run_status" != 'needs owner decision'
    else
      test "$run_status" = 'needs owner decision'
      test "$fresh_task_relay" = active
    fi
    ;;
  paused)
    test "$active_goal_count" -eq 1
    test "$active_goal_id" = architecture-foundation
    test "$authorization_scope" = 'active goal'
    test "$authorization_source" = owner
    test "$loop_cadence" = paused
    test "$fresh_task_relay" = paused
    test "$standing_authority" = paused
    test "$run_status" = paused
    ;;
  pending)
    test "$active_goal_count" -eq 0
    test "$active_goal_id" = none
    test "$authorization_scope" = none
    test "$authorization_source" = none
    test "$loop_cadence" = stopped
    test "$fresh_task_relay" = stopped
    test "$standing_authority" = none
    test "$current_run" = none
    test "$incomplete_run" = none
    test "$run_status" = none
    test "$pending_decision" = none
    test "$architecture_gate" = approved
    test "$visual_checkpoint" = 'goal completion'
    test "$ui_units" = 0
    test "$(grep -c '^- Goal:' "$current_file")" -eq 0
    test "$(grep -c '^- Last completed goal:' "$current_file")" -eq 1
    grep -q '^- Last completed goal: \[Architecture Foundation\](architecture-foundation/GOAL.md)$' \
      "$current_file"
    grep -q '^Status: no active goal; Architecture Foundation is complete\.$' \
      "$current_file"
    grep -q '^- Active work: none; Architecture Foundation is complete and the loop is stopped$' \
      "$current_file"
    grep -q '^Status: complete; owner-approved goal completed under standing authorization\.$' \
      "$goal_file"
    grep -q '^Status: complete shared state; no work is active and scheduled relay is stopped\.$' \
      "$state_file"
    grep -q '^Status: Architecture Foundation is complete\.$' README.md
    for criterion_number in 1 2 3 4 5 6 7 8 9 10
    do
      awk -F '|' -v criterion="AF-${criterion_number}" '
        {
          key = $2
          status = $3
          evidence = $4
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", evidence)
          if (key ~ ("^" criterion " ") && status == "accepted" && length(evidence) >= 20) accepted += 1
        }
        END { exit !(accepted == 1) }
      ' "$state_file"
    done
    test "$(sed -n '/^## Current run$/,/^## Owner authorization$/p' "$state_file" | wc -l | tr -d ' ')" -eq 5
    sed -n '/^## Current run$/,/^## Owner authorization$/p' "$state_file" | \
      grep -q '^- State: none; goal complete\.$'
    test "$(sed -n '/^## Current unit evidence$/,/^## Goal-readiness evidence$/p' "$state_file" | wc -l | tr -d ' ')" -eq 5
    sed -n '/^## Current unit evidence$/,/^## Goal-readiness evidence$/p' "$state_file" | \
      grep -q '^- State: complete; no current unit\.$'
    ;;
  *)
    echo "Invalid owner authorization: $owner_authorization" >&2
    exit 1
    ;;
esac

if test "$architecture_gate" = open
then
  accepted_count=$(awk -F '|' '
    {
      status = $3
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
      if (status == "accepted") count += 1
    }
    END { print count + 0 }
  ' "$state_file")
  test "$accepted_count" -eq 0
fi

npm run check:architecture

if find . \
  -path './.git' -prune -o \
  -path './node_modules' -prune -o \
  -path './dist' -prune -o \
  -type f \( -name '*.md' -o -name '*.sh' \) \
  -exec grep -nH -E '[[:blank:]]+$' {} +
then
  echo 'Trailing whitespace found.' >&2
  exit 1
fi

tracked_harness=$(git ls-files -- \
  '.unlazy/**' \
  '.playwright-cli/**' \
  'output/**' \
  'drafts/**' \
  'GATES.md' \
  'contour-*-handoff.md' \
  'dist/**' \
  'coverage/**' \
  '*.tsbuildinfo')
test -z "$tracked_harness"

git diff --check -- .

for javascript_file in src/*.js
do
  if test -f "$javascript_file"
  then
    node --check "$javascript_file"
  fi
done

criterion_status() {
  criterion_name=$1
  awk -F '|' -v criterion="$criterion_name" '
    {
      key = $2
      status = $3
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
      if (key ~ ("^" criterion " ")) print status
    }
  ' "$state_file"
}

check_typescript_substrate() {
  test -f tsconfig.json
  test -x node_modules/.bin/tsc
  grep -Eq '"strict"[[:space:]]*:[[:space:]]*true' tsconfig.json
  grep -Eq '"noUncheckedIndexedAccess"[[:space:]]*:[[:space:]]*true' tsconfig.json
  grep -Eq '"exactOptionalPropertyTypes"[[:space:]]*:[[:space:]]*true' tsconfig.json
  npm run typecheck
  npm run build
}

af2_status=$(criterion_status AF-2)
if test -f tsconfig.json -o "$af2_status" = accepted -o "$owner_authorization" = pending
then
  check_typescript_substrate
fi

if test "$af2_status" = accepted -o "$owner_authorization" = pending
then
  maintained_javascript=$(find src tests -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.jsx' \) -print)
  test -z "$maintained_javascript"
fi

npm test

printf 'Repository check passed.\n'
