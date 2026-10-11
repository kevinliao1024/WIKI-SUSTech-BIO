#!/usr/bin/env bash
# Screenshot /next-crayon at a set of pinned take values with headless Chrome.
#
# Arguments are take:name pairs. The take value is the one chapters, figures
# and the television are keyed on (--ot-p, -0.19 … 1); it is converted here to
# the raw scroll progress the page's ?p= flag expects (take = 1.19·p − 0.19).
# Runs the real WebGL pipeline, which is the only way to see how the
# television lines up with the picture.
#
#   ./scripts/shot.sh -0.19:open -0.13:push 0.11:brain
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="${BASE:-http://127.0.0.1:8081/next-crayon}"
OUTDIR="${OUTDIR:-/tmp/orca-shots}"
SIZE="${SIZE:-1440,900}"

mkdir -p "$OUTDIR"

shoot() {
  local take="$1" name="$2" raw
  raw=$(awk -v t="$take" 'BEGIN { printf "%.5f", (t + 0.19) / 1.19 }')
  "$CHROME" --headless=new --disable-gpu --no-sandbox \
    --enable-unsafe-swiftshader \
    --use-gl=angle --use-angle=swiftshader \
    --hide-scrollbars --window-size="$SIZE" \
    --virtual-time-budget=9000 \
    --screenshot="$OUTDIR/$name" \
    "$BASE?p=$raw" >/dev/null 2>&1
  echo "  take=$take (p=$raw) -> $OUTDIR/$name"
}

for spec in "$@"; do
  shoot "${spec%%:*}" "${spec##*:}.png"
done
