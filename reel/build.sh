#!/usr/bin/env bash
# Full build: cue sheet -> soundtrack -> 4 parallel video segments -> final mux.
set -euo pipefail
cd "$(dirname "$0")"
export FFMPEG="${FFMPEG:-$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())')}"
mkdir -p build out
node src/render.js cues
python3 audio/make_audio.py
TOTAL=$((72 * 30)); PARTS=4; STEP=$((TOTAL / PARTS))
rm -f build/seg_*.mp4 build/segs.txt
for i in $(seq 0 $((PARTS - 1))); do
  node src/render.js segment $((i * STEP)) $(((i + 1) * STEP)) build/seg_$i.mp4 &
  echo "file 'seg_$i.mp4'" >> build/segs.txt
done
wait
"$FFMPEG" -y -loglevel error -f concat -safe 0 -i build/segs.txt -i build/soundtrack.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 256k -ar 48000 -shortest out/quenzy_reel.mp4
echo "done: out/quenzy_reel.mp4"
