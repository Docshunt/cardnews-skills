#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fetch_remote=1
if [[ "${1:-}" == "--no-fetch" ]]; then
  fetch_remote=0
elif [[ $# -gt 0 ]]; then
  echo "Usage: bash scripts/cardnews-session-preflight.sh [--no-fetch]" >&2
  exit 64
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "CARDNEWS_PREFLIGHT=NO_GIT_REPOSITORY" >&2
  exit 2
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "CARDNEWS_PREFLIGHT=NO_ORIGIN" >&2
  exit 2
fi

if [[ "$fetch_remote" -eq 1 ]]; then
  if ! git fetch origin main --quiet; then
    echo "CARDNEWS_PREFLIGHT=REMOTE_UNVERIFIED" >&2
    echo "origin/main could not be fetched; no merge, rebase, reset, or output build was performed." >&2
    exit 3
  fi
fi

if ! git rev-parse --verify --quiet origin/main >/dev/null; then
  echo "CARDNEWS_PREFLIGHT=ORIGIN_MAIN_NOT_FOUND" >&2
  exit 2
fi

read -r local_only remote_only < <(git rev-list --left-right --count HEAD...origin/main)

echo "CARDNEWS_PREFLIGHT=OK"
echo "source=$([[ "$fetch_remote" -eq 1 ]] && printf 'fresh origin/main' || printf 'cached origin/main')"
echo "local_only_commits=$local_only"
echo "incoming_origin_main_commits=$remote_only"

if [[ "$remote_only" -gt 0 ]]; then
  echo "incoming_paths:"
  git diff --name-status HEAD..origin/main
else
  echo "incoming_paths=none"
fi

if [[ "$local_only" -gt 0 ]]; then
  echo "local_only_paths:"
  git diff --name-status origin/main..HEAD
else
  echo "local_only_paths=none"
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "working_tree_changes=present"
else
  echo "working_tree_changes=none"
fi
