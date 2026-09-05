#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
default_source_root="$(cd "$repo_root/../.." && pwd)"
source_root="${CARDNEWS_SOURCE_ROOT:-$default_source_root}"
archive_root="${CARDNEWS_ARCHIVE_ROOT:-$repo_root/archive}"
timestamp="${1:-$(TZ=Asia/Seoul date +%Y%m%d-%H%M%S-KST)}"

if [[ $# -gt 1 || ! "$timestamp" =~ ^[0-9A-Za-z._-]+$ ]]; then
  echo "Usage: bash scripts/archive-cardnews-assets.sh [YYYYMMDD-HHMMSS-KST]" >&2
  exit 64
fi

if [[ ! -d "$source_root" ]]; then
  echo "Archive source does not exist: $source_root" >&2
  exit 2
fi

snapshot="$archive_root/$timestamp"
if [[ -e "$snapshot" ]]; then
  echo "Archive snapshot already exists: $snapshot" >&2
  exit 3
fi

mkdir -p "$snapshot/materials"
copied=()

copy_tree() {
  local name="$1"
  local source="$source_root/$name"
  local destination="$snapshot/materials/$name"
  if [[ ! -d "$source" ]]; then
    return
  fi
  mkdir -p "$destination"
  if [[ "$name" == "work" ]]; then
    rsync -a --exclude='.git/' --exclude='node_modules/' --exclude='.DS_Store' --exclude='cardnews-skills/' "$source/" "$destination/"
  else
    rsync -a --exclude='.git/' --exclude='node_modules/' --exclude='.DS_Store' "$source/" "$destination/"
  fi
  copied+=("$name")
}

copy_tree outputs
copy_tree work
copy_tree tmp
copy_tree qa

node "$repo_root/scripts/write-archive-index.mjs" "$snapshot" "$source_root" "$timestamp" "${copied[@]}"
printf 'CARDNEWS_ARCHIVE=%s\n' "$snapshot"
