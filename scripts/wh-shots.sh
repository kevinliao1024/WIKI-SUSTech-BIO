#!/usr/bin/env bash
# Capture white-hole transition frames with headless Chrome.
#
# The transition is normally driven by a real click. Here we load the preview
# page, build a controller by hand and expose window.__whSample(t, dir), then
# hold one frame long enough for Chrome to screenshot it. Real WebGL runs
# (swiftshader), so the shader is actually compiled and executed.
#
#   ./scripts/wh-shots.sh                     # default sweep, 1440x900
#   SIZE=390,844 ./scripts/wh-shots.sh        # mobile
#   OUTDIR=/tmp/x ./scripts/wh-shots.sh 300 650 1100
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="${BASE:-http://127.0.0.1:8081/static/transition/preview.html}"
OUTDIR="${OUTDIR:-/tmp/orca-wh}"
SIZE="${SIZE:-1440,900}"
DIR="${DIR:-to-light}"
STAMP="${STAMP:-$(date +%s)-$DIR}"

# Frame times in ms — the four story beats of the dark -> light crossing.
FRAMES=("$@")
if [ ${#FRAMES[@]} -eq 0 ]; then
  FRAMES=(0 260 560 820 1080 1300 1560 1900)
fi

mkdir -p "$OUTDIR"

for ms in "${FRAMES[@]}"; do
  out="$OUTDIR/${STAMP}-t${ms}.png"
  "$CHROME" --headless=new --disable-gpu --no-sandbox \
    --enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader \
    --hide-scrollbars --window-size="$SIZE" \
    --virtual-time-budget=20000 \
    --screenshot="$out" \
    "$BASE?whsample=$ms&whdir=$DIR" >/dev/null 2>&1
  echo "  ${ms}ms -> $out"
done
