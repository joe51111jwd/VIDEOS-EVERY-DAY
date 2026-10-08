#!/bin/bash
# Contact sheet of a capture with timestamps: tools/sheet.sh <video> <fps> <out.jpg> [start] [dur] [cols]
V=$1; R=$2; O=$3; S=${4:-0}; D=${5:-999}; COLS=${6:-6}
ffmpeg -y -hide_banner -loglevel error -ss "$S" -t "$D" -copyts -i "$V" -vf "fps=$R,scale=400:-1,drawtext=text='%{pts\:flt}':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black,tile=${COLS}x8" -frames:v 1 -q:v 3 "$O"
