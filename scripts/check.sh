#!/usr/bin/env sh
set -eu

current_file=docs/plans/CURRENT.md
goal_file=docs/plans/human-discovery-prototype/GOAL.md
state_file=docs/plans/human-discovery-prototype/IMPLEMENTATION_PLAN.md

for required_file in \
  AGENTS.md \
  docs/main/DEVELOPMENT_LOOP.md \
  "$current_file" \
  "$goal_file" \
  "$state_file" \
  docs/plans/identity-map-prototype/GOAL.md \
  docs/plans/identity-map-prototype/IMPLEMENTATION_PLAN.md
do
  test -s "$required_file"
done

grep -q '^- Shared implementation state: \[Implementation Plan\](human-discovery-prototype/IMPLEMENTATION_PLAN.md)$' \
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
  'Graph foundation' \
  'Discovery entry gate' \
  'Current run' \
  'Incomplete run' \
  'Run status' \
  'Pending owner decision' \
  'Attributed evidence source' \
  'Attributed evidence provenance' \
  'Alignment due' \
  'Visual checkpoint' \
  'UI units since visual checkpoint'
do
  assert_same_field "$shared_field"
done

active_goal_id=$(read_field 'Active goal id' "$state_file")
owner_authorization=$(read_field 'Owner authorization' "$state_file")
authorization_scope=$(read_field 'Authorization scope' "$state_file")
authorization_source=$(read_field 'Authorization source' "$state_file")
loop_cadence=$(read_field 'Loop cadence' "$state_file")
graph_foundation=$(read_field 'Graph foundation' "$state_file")
discovery_entry_gate=$(read_field 'Discovery entry gate' "$state_file")
current_run=$(read_field 'Current run' "$state_file")
incomplete_run=$(read_field 'Incomplete run' "$state_file")
run_status=$(read_field 'Run status' "$state_file")
pending_decision=$(read_field 'Pending owner decision' "$state_file")
attributed_evidence_source=$(read_field 'Attributed evidence source' "$state_file")
attributed_evidence_provenance=$(read_field 'Attributed evidence provenance' "$state_file")
alignment_due=$(read_field 'Alignment due' "$state_file")
visual_checkpoint=$(read_field 'Visual checkpoint' "$state_file")
ui_units_since_visual_checkpoint=$(read_field 'UI units since visual checkpoint' "$state_file")

test "$graph_foundation" = approved
test "$discovery_entry_gate" = open -o "$discovery_entry_gate" = approved
test "$alignment_due" = yes -o "$alignment_due" = no

test "$(grep -c '^Status:' "$current_file")" -eq 1
test "$(grep -c '^Status:' "$goal_file")" -eq 1
test "$(grep -c '^Status:' "$state_file")" -eq 1
test "$(grep -c '^Status:' README.md)" -eq 1
test "$(grep -c '^- Active work:' "$current_file")" -eq 1

grep -q 'One implementation chat owns at most one work unit\.' \
  docs/main/DEVELOPMENT_LOOP.md
grep -q 'No next unit selected' docs/main/DEVELOPMENT_LOOP.md
grep -q 'newly created fresh chat' AGENTS.md
grep -q 'contour-human-discovery-prototype-handoff.md' \
  "$current_file" "$state_file"

for criterion_number in 1 2 3 4 5 6 7 8 9 10
do
  awk -F '|' -v criterion="HD-${criterion_number}" '
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

check_attributed_evidence_decision() {
  record_source=$(read_field 'Attributed evidence source decision' "$state_file")
  record_provenance=$(read_field 'Permission and provenance basis' "$state_file")
  attribution_treatment=$(read_field 'Attribution treatment' "$state_file")
  decision_date=$(read_field 'Decision date' "$state_file")

  test "$record_source" = "$attributed_evidence_source"
  test "$record_provenance" = "$attributed_evidence_provenance"
  case "$record_source:$attribution_treatment" in
    'owner-authored:credited owner'|\
    'contributor-supplied:credited contributor'|\
    'other-owner-approved:credited approved source') ;;
    *) exit 1 ;;
  esac
  normalized_provenance=$(printf '%s' "$record_provenance" | tr '[:upper:]' '[:lower:]')
  test "${#record_provenance}" -ge 20
  case "$normalized_provenance" in
    none|none\ *|*\ none|*\ none\ *|*pending*|*tbd*|*todo*|*unknown*|*n/a*|*placeholder*) exit 1 ;;
  esac
  node -e 'const value = process.argv[1]; const parsed = new Date(`${value}T00:00:00Z`); if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) process.exit(1);' \
    "$decision_date"
}

case "$owner_authorization" in
  pending)
    test "$visual_checkpoint" = 'goal completion'
    ;;
  paused|standing)
    case "$visual_checkpoint" in
      'not yet established') ;;
      *)
        printf '%s\n' "$visual_checkpoint" | \
          grep -Eq '^accepted through .+, [0-9]{4}-[0-9]{2}-[0-9]{2}$'
        ;;
    esac
    ;;
esac

case "$ui_units_since_visual_checkpoint" in
  0|1|2|3|4)
    test "$run_status" != 'visual checkpoint'
    ;;
  5)
    test "$current_run" != none
    test "$incomplete_run" = "$current_run"
    if test "$owner_authorization" = standing; then
      test "$run_status" = 'visual checkpoint'
    else
      test "$owner_authorization" = paused
      test "$run_status" = paused
    fi
    ;;
  *) exit 1 ;;
esac

case "$owner_authorization" in
  paused)
    test "$active_goal_id" = human-discovery-prototype
    test "$authorization_scope" = 'active goal'
    test "$authorization_source" = owner
    test "$loop_cadence" = paused
    test "$run_status" = paused
    test "$(grep -c '^- Goal:' "$current_file")" -eq 1
    grep -q '^- Goal: \[Human Discovery Prototype\](human-discovery-prototype/GOAL.md)$' \
      "$current_file"
    grep -q '^Status: Human Discovery Prototype is owner-approved and paused\.$' \
      "$current_file"
    grep -q '^Status: active; owner-approved goal paused\.$' \
      "$goal_file"
    grep -q '^Status: active shared state; owner-approved goal paused\.$' \
      "$state_file"
    grep -q '^Status: Human Discovery Prototype is owner-approved and paused\.$' \
      README.md
    test "$(read_field 'Standing implementation authority' "$current_file")" = paused
    test "$(read_field 'Standing implementation authority' "$state_file")" = paused
    grep -q '^- Active work: none; owner authorization is paused$' \
      "$current_file"
    if test "$current_run" = none; then
      test "$incomplete_run" = none
    else
      test "$incomplete_run" = "$current_run"
    fi
    ;;
  standing)
    test "$active_goal_id" = human-discovery-prototype
    test "$authorization_scope" = 'active goal'
    test "$authorization_source" = owner
    test "$loop_cadence" = continuous
    test "$(grep -c '^- Goal:' "$current_file")" -eq 1
    grep -q '^- Goal: \[Human Discovery Prototype\](human-discovery-prototype/GOAL.md)$' \
      "$current_file"
    grep -q '^Status: Human Discovery Prototype is active under standing authorization\.$' \
      "$current_file"
    grep -q '^Status: active; owner-approved goal under standing authorization\.$' \
      "$goal_file"
    grep -q '^Status: active shared state; standing owner authorization\.$' \
      "$state_file"
    grep -q '^Status: Human Discovery Prototype is active under standing authorization\.$' \
      README.md
    test "$(read_field 'Standing implementation authority' "$current_file")" = active
    test "$(read_field 'Standing implementation authority' "$state_file")" = active
    grep -q '^- Active work: Human Discovery Prototype implementation is active under standing authorization$' \
      "$current_file"
    ! grep -q 'No implementation work unit has been selected or started\.' \
      "$current_file"
    ! grep -q 'Do not select, infer, or begin a discovery implementation unit\.' \
      "$current_file"
    ! grep -q 'paused by explicit owner instruction during goal preparation' \
      "$state_file"
    ! grep -q -E 'The goal is intentionally paused during preparation\.|Owner authorization is paused\.|No standing goal-bounded implementation authorization exists yet\.|The repository is at \*\*GOAL APPROVED - PAUSED\*\*\.' \
      "$current_file"
    ! grep -q -E 'Current state: paused by explicit owner instruction during goal preparation|Current scope: goal documentation, audit, and readiness validation only|Implementation authority: none until|implementation remains paused until|Implementation activity: none\.' \
      "$state_file"
    check_attributed_evidence_decision
    if test "$current_run" = none; then
      test "$incomplete_run" = none
      test "$run_status" = selecting -o \
        "$run_status" = 'awaiting fresh chat' -o \
        "$run_status" = 'needs owner decision'
    else
      test "$incomplete_run" = "$current_run"
      test "$run_status" = implementation -o \
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
    fi
    ;;
  pending)
    test "$active_goal_id" = none
    test "$authorization_scope" = none
    test "$authorization_source" = none
    test "$loop_cadence" = stopped
    test "$current_run" = none
    test "$incomplete_run" = none
    test "$run_status" = none
    test "$pending_decision" = none
    check_attributed_evidence_decision
    test "$discovery_entry_gate" = approved
    test "$visual_checkpoint" = 'goal completion'
    test "$ui_units_since_visual_checkpoint" = 0
    test "$(grep -c '^- Goal:' "$current_file")" -eq 0
    grep -q '^Status: no active goal; Human Discovery Prototype is complete\.$' \
      "$current_file"
    grep -q '^- Last completed goal: \[Human Discovery Prototype\](human-discovery-prototype/GOAL.md)$' \
      "$current_file"
    test "$(grep -c '^- Last completed goal:' "$current_file")" -eq 1
    grep -q '^Status: complete; owner-approved goal completed under standing authorization\.$' \
      "$goal_file"
    grep -q '^Status: complete shared state; no work is active and the loop is stopped\.$' \
      "$state_file"
    grep -q '^Status: Human Discovery Prototype is complete\.$' README.md
    test "$(read_field 'Standing implementation authority' "$current_file")" = none
    test "$(read_field 'Standing implementation authority' "$state_file")" = none
    grep -q '^- Active work: none; Human Discovery Prototype is complete and the loop is stopped$' \
      "$current_file"
    ! grep -q -E 'The goal is intentionally paused during preparation\.|No implementation work unit has been selected or started\.|No standing goal-bounded implementation authorization exists yet\.|Do not select, infer, or begin a discovery implementation unit\.|GOAL APPROVED - PAUSED' \
      "$current_file"
    ! grep -q -E 'Current state: paused by explicit owner instruction during goal preparation|Current scope: goal documentation, audit, and readiness validation only|Implementation authority: none until|implementation remains paused until|Implementation activity: none\.|no implementation has started|paused before its first unit' \
      "$state_file"
    ! grep -q -E 'owner-approved and paused|active under standing authorization' README.md
    ! grep -q 'At goal preparation time' README.md
    ! grep -q 'Public discovery through search, recommendations, people, Media, or Themes' \
      README.md
    ! grep -q -E 'Standing implementation authority: active|Goal-bounded implementation authorization is active|implementation is active under standing authorization' \
      "$current_file" "$state_file"
    for criterion_number in 1 2 3 4 5 6 7 8 9 10
    do
      awk -F '|' -v criterion="HD-${criterion_number}" '
        {
          key = $2
          status = $3
          evidence = $4
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", key)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
          gsub(/^[[:space:]]+|[[:space:]]+$/, "", evidence)
          if (key ~ ("^" criterion " ")) {
            count += 1
            normalized = tolower(evidence)
            placeholder = normalized ~ /(^|[^a-z])(none( yet)?|pending|tbd|todo|unknown|n\/a|placeholder)([^a-z]|$)/
            if (status == "accepted" && length(evidence) >= 20 && !placeholder) accepted += 1
          }
        }
        END { exit !(count == 1 && accepted == 1) }
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
node --check src/draft-state.js
node --check src/featured-state.js
node --check src/graph-projection.js
node --check src/layout.js
node --check src/map.js
node --check src/pinned-state.js
node --check src/selection-state.js
node --check src/seed.js
node --check src/thought-capture.js
node --check src/work-chooser.js

check_typescript_substrate() {
  test -f tsconfig.json
  test -x node_modules/.bin/tsc
  node -e 'const fs = require("node:fs"); const config = JSON.parse(fs.readFileSync("tsconfig.json", "utf8")); if (config.compilerOptions?.strict !== true) process.exit(1);'
  npm run typecheck
  npm run build
}

if test "$discovery_entry_gate" = approved -o "$owner_authorization" = pending
then
  check_typescript_substrate
elif test -f tsconfig.json
then
  check_typescript_substrate
fi

node --test tests/*.test.mjs
