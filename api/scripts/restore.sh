#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: $0 path/to/backup.dump" >&2
  exit 2
fi
echo "This replaces database contents. Use only after stopping writes and taking a safety backup."
read -r -p 'Type RESTORE to continue: ' answer
[[ "$answer" == "RESTORE" ]] || exit 1
docker compose exec -T db sh -c 'pg_restore --clean --if-exists --no-owner --no-privileges -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$1"
