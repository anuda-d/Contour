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

test "$(grep -c '^- Goal:' docs/plans/CURRENT.md)" -eq 1
grep -q '^- Goal: \[Identity Map Prototype\](identity-map-prototype/GOAL.md)$' \
  docs/plans/CURRENT.md
grep -q '^- Shared implementation state: \[Implementation Plan\](identity-map-prototype/IMPLEMENTATION_PLAN.md)$' \
  docs/plans/CURRENT.md
grep -q '^Status: active; owner-approved' \
  docs/plans/identity-map-prototype/GOAL.md

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
  'Autonomous window' \
  'Graph foundation' \
  'Current run' \
  'Incomplete run' \
  'Pending owner review' \
  'Alignment due'
do
  assert_same_field "$shared_field"
done

owner_authorization=$(read_field 'Owner authorization' "$state_file")
authorization_scope=$(read_field 'Authorization scope' "$state_file")
authorization_source=$(read_field 'Authorization source' "$state_file")
autonomous_window=$(read_field 'Autonomous window' "$state_file")
graph_foundation=$(read_field 'Graph foundation' "$state_file")
active_goal_id=$(read_field 'Active goal id' "$state_file")
current_run=$(read_field 'Current run' "$state_file")
incomplete_run=$(read_field 'Incomplete run' "$state_file")
pending_review=$(read_field 'Pending owner review' "$state_file")
alignment_due=$(read_field 'Alignment due' "$state_file")

test "$active_goal_id" = identity-map-prototype
test "$graph_foundation" = open -o "$graph_foundation" = approved
test "$autonomous_window" = 'daily 18:00-19:00 America/Toronto'

case "$owner_authorization" in
  pending)
    test "$authorization_scope" = none
    test "$authorization_source" = none
    test "$current_run" = none
    test "$incomplete_run" = none
    test "$pending_review" = none
    ;;
  granted)
    test "$current_run" = none
    test "$incomplete_run" = none
    test "$pending_review" = none
    test "$authorization_source" = owner -o \
      "$authorization_source" = scheduled-autonomous-window
    if test "$authorization_source" = scheduled-autonomous-window; then
      test "$authorization_scope" = implementation
      test "$alignment_due" = no
    elif test "$alignment_due" = yes; then
      test "$authorization_scope" = alignment
    else
      test "$authorization_scope" = implementation
    fi
    ;;
  consumed)
    test "$authorization_source" = owner -o \
      "$authorization_source" = scheduled-autonomous-window
    if test "$alignment_due" = yes; then
      test "$authorization_scope" = alignment
    else
      test "$authorization_scope" = implementation
    fi
    test "$current_run" != none
    test "$incomplete_run" = "$current_run"
    if test "$pending_review" != none; then
      test "$pending_review" = "$current_run"
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
