#!/bin/bash
# usage: tools/encode.sh <silent.mp4> <mix.wav> <out-basename>  → <out>.mp4 (full quality) + <out>-phone.mp4
set -e
V=$1; A=$2; O=$3
# Remotion writes full-range BT.601 (yuvj420p): convert to limited-range BT.709 once
CONV="scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p"
TAGS="-pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
ffmpeg -nostdin -v error -y -i "$V" -i "$A" -map 0:v -map 1:a -vf "$CONV" -c:v libx264 -preset slow -crf 17 $TAGS -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart "$O.mp4"
ffmpeg -nostdin -v error -y -i "$O.mp4" -c:v libx264 -preset slow -crf 23 -maxrate 3500k -bufsize 7000k -vf fps=30 $TAGS -c:a aac -b:a 160k -movflags +faststart "$O-phone.mp4"
ls -la "$O.mp4" "$O-phone.mp4"
