#!/bin/bash
# usage: extract.sh <outdir>  — frames at 30 fps, 1280x720, in three looks
set -e
OUT=$1
. /tmp/claude-0/grade/grades.sh
python3 -c "
import json
for k,v in json.load(open('/tmp/claude-0/foot/clips.json')).items(): print(k,v['src'],v['a'],v['b'])
" | while read id src a b; do
  d=$(python3 -c "print($b-$a)")
  if [ "$src" = "1213" ]; then SC="crop=1080:608:0:110,scale=1280:720"; else SC="scale=1280:720"; fi
  for g in FLAT MOODY TEAL; do
    eval f=\$$g
    mkdir -p $OUT/$id/${g,,}
    [ -f $OUT/$id/${g,,}/0001.jpg ] && continue
    ffmpeg -nostdin -v error -y -ss $a -t $d -i /tmp/claude-0/foot/raw/$src.mp4 -vf "fps=30,$SC,$f" -q:v 3 $OUT/$id/${g,,}/%04d.jpg &
  done
  wait
  echo "$id done $(ls $OUT/$id/flat | wc -l)"
done
