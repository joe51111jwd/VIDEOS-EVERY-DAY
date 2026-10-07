#!/bin/bash
# mux.sh <silent.mp4> <master.wav> <out.mp4> [crf]  -> X-ready H.264 (BT.709 limited range) + AAC 256k
set -e
CRF=${4:-20}
ffmpeg -v error -y -i "$1" -i "$2" -map 0:v -map 1:a -c:v libx264 -preset slow -crf "$CRF" \
  -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 256k -shortest -movflags +faststart "$3"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate,pix_fmt,color_range -of compact "$3"
