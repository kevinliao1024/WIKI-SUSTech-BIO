#!/usr/bin/env bash
# Preview the wiki locally in a browser.
#
#   ./scripts/preview.sh              # home page
#   ./scripts/preview.sh dry-lab      # any route: dry-lab, model, software, ...
#
# Starts the Flask dev server on 127.0.0.1:8080 if one is not already running
# (reuses the running one otherwise), then opens the page in your browser.
# Server log: /tmp/igem-wiki-preview.log
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT=8080
PAGE="${1:-}"

cd "$ROOT"

PY="$ROOT/.venv/bin/python"
[ -x "$PY" ] || PY="$(command -v python3)"

if lsof -iTCP:"$PORT" -sTCP:LISTEN -P >/dev/null 2>&1; then
  echo "dev server already running on http://127.0.0.1:$PORT"
else
  echo "starting dev server on http://127.0.0.1:$PORT ..."
  FLASK_APP=app.py nohup "$PY" -m flask run --host 127.0.0.1 --port "$PORT" \
    >/tmp/igem-wiki-preview.log 2>&1 &
  for _ in $(seq 1 60); do
    sleep 0.25
    curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break
  done
  if ! curl -sf -o /dev/null "http://127.0.0.1:$PORT/"; then
    echo "server failed to start; see /tmp/igem-wiki-preview.log" >&2
    exit 1
  fi
fi

URL="http://127.0.0.1:$PORT/${PAGE}"
echo "opening $URL"
open "$URL"
