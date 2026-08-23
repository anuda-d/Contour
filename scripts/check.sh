#!/usr/bin/env sh
set -eu

for required_file in \
  AGENTS.md \
  docs/main/DEVELOPMENT_LOOP.md \
  docs/plans/CURRENT.md \
  docs/plans/identity-map-prototype/GOAL.md \
  docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md
do
  test -s "$required_file"
done

grep -q '^- Shared implementation state: \[Implementation Plan\](identity-map-prototype/IMPLEMENTATION_PLAN.md)$' \
  docs/plans/CURRENT.md

current_file=docs/plans/CURRENT.md
state_file=docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md

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
  'Graph foundation' \
  'Current run' \
  'Incomplete run' \
  'Run status' \
  'Pending owner decision' \
  'Alignment due'
do
  assert_same_field "$shared_field"
done

owner_authorization=$(read_field 'Owner authorization' "$state_file")
authorization_scope=$(read_field 'Authorization scope' "$state_file")
authorization_source=$(read_field 'Authorization source' "$state_file")
loop_cadence=$(read_field 'Loop cadence' "$state_file")
graph_foundation=$(read_field 'Graph foundation' "$state_file")
active_goal_id=$(read_field 'Active goal id' "$state_file")
current_run=$(read_field 'Current run' "$state_file")
incomplete_run=$(read_field 'Incomplete run' "$state_file")
run_status=$(read_field 'Run status' "$state_file")
pending_decision=$(read_field 'Pending owner decision' "$state_file")
alignment_due=$(read_field 'Alignment due' "$state_file")

test "$graph_foundation" = open -o "$graph_foundation" = approved

case "$owner_authorization" in
  pending)
    test "$active_goal_id" = none
    test "$(grep -c '^Status:' "$current_file")" -eq 1
    test "$(grep -c '^Status:' "$state_file")" -eq 1
    test "$(grep -c '^Status:' docs/plans/identity-map-prototype/GOAL.md)" -eq 1
    grep -q '^Status: no active goal; Identity Map Prototype is complete\.$' \
      "$current_file"
    grep -q '^Status: complete shared state; no work is active and the loop is stopped\.$' \
      "$state_file"
    grep -q '^Status: complete; owner-approved goal completed under standing authorization\.$' \
      docs/plans/identity-map-prototype/GOAL.md
    test "$(grep -c '^- Active work:' "$current_file")" -eq 1
    grep -q '^- Active work: none; Identity Map Prototype is complete and the loop is stopped$' \
      "$current_file"
    ! grep -q -E 'correction is (now )?the active|active autonomous correction|now an active autonomous correction' \
      "$current_file" "$state_file"
    test "$(sed -n '/^## Current Run$/,/^## Standing Goal Authorization$/p' "$state_file" | wc -l | tr -d ' ')" -eq 5
    sed -n '/^## Current Run$/,/^## Standing Goal Authorization$/p' "$state_file" | \
      grep -q '^- State: none; goal complete\.$'
    test "$(sed -n '/^## Current Unit Evidence$/,/^## Acceptance Rules$/p' "$state_file" | wc -l | tr -d ' ')" -eq 5
    sed -n '/^## Current Unit Evidence$/,/^## Acceptance Rules$/p' "$state_file" | \
      grep -q '^- State: complete; no current unit\.$'
    test "$(grep -c '^- Goal:' "$current_file")" -eq 0
    grep -q '^- Last completed goal: \[Identity Map Prototype\](identity-map-prototype/GOAL.md)$' \
      "$current_file"
    for criterion_number in 1 2 3 4 5 6 7 8 9 10
    do
      awk -F '|' -v criterion="IM-${criterion_number}" '
        {
          key = $2
          status = $3
          evidence = $4
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", evidence)
          if (key ~ ("^" criterion " ")) {
            count += 1
            if (status == "accepted" && evidence != "" && evidence != "None yet.") accepted += 1
          }
        }
        END { exit !(count == 1 && accepted == 1) }
      ' "$state_file"
    done
    test "$authorization_scope" = none
    test "$authorization_source" = none
    test "$loop_cadence" = stopped
    test "$current_run" = none
    test "$incomplete_run" = none
    test "$run_status" = none
    test "$pending_decision" = none
    test "$graph_foundation" = approved
    test "$alignment_due" = no
    ;;
  standing)
    test "$active_goal_id" = identity-map-prototype
    test "$(grep -c '^- Goal:' "$current_file")" -eq 1
    grep -q '^- Goal: \[Identity Map Prototype\](identity-map-prototype/GOAL.md)$' \
      "$current_file"
    grep -q '^Status: active; owner-approved' \
      docs/plans/identity-map-prototype/GOAL.md
    test "$authorization_scope" = 'active goal'
    test "$authorization_source" = owner
    test "$loop_cadence" = continuous
    if test "$current_run" = none; then
      test "$incomplete_run" = none
      test "$run_status" = selecting -o \
        "$run_status" = none -o \
        "$run_status" = 'needs owner decision'
    else
      test "$incomplete_run" = "$current_run"
      test "$run_status" = implementation -o \
        "$run_status" = validation -o \
        "$run_status" = 'independent review' -o \
        "$run_status" = blocked -o \
        "$run_status" = 'needs owner decision'
    fi
    if test "$pending_decision" = none; then
      test "$run_status" != 'needs owner decision'
    else
      test "$run_status" = 'needs owner decision'
    fi
    ;;
  paused)
    test "$active_goal_id" = identity-map-prototype
    test "$(grep -c '^- Goal:' "$current_file")" -eq 1
    grep -q '^- Goal: \[Identity Map Prototype\](identity-map-prototype/GOAL.md)$' \
      "$current_file"
    grep -q '^Status: active; owner-approved' \
      docs/plans/identity-map-prototype/GOAL.md
    test "$authorization_scope" = 'active goal'
    test "$authorization_source" = owner
    test "$loop_cadence" = paused
    test "$run_status" = paused
    if test "$current_run" = none; then
      test "$incomplete_run" = none
    else
      test "$incomplete_run" = "$current_run"
    fi
    ;;
  *)
    echo "Invalid owner authorization: $owner_authorization" >&2
    exit 1
    ;;
esac

test "$alignment_due" = yes -o "$alignment_due" = no

if find . \
  -path './.git' -prune -o \
  -type f \( -name '*.md' -o -name '*.sh' \) \
  -exec grep -nH -E '[[:blank:]]+$' {} +
then
  echo 'Trailing whitespace found.' >&2
  exit 1
fi

git diff --check -- .

node --check src/app.js
node --check src/catalog.js
node --check src/graph-projection.js
node --check src/layout.js
node --check src/map.js
node --check src/selection-state.js
node --check src/seed.js
node --check src/work-chooser.js
node --test tests/*.test.mjs
