#!/bin/bash
# master.sh <mix.wav> <out.wav>: two-pass loudnorm to -13 LUFS, -1 dBTP (X plays loud)
set -e
J=$(ffmpeg -v info -y -i "$1" -af "loudnorm=I=-13:TP=-1.0:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
MI=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
read I TP LRA TH OFF <<< "$MI"
echo "measured I=$I TP=$TP LRA=$LRA"
ffmpeg -v error -y -i "$1" -af "loudnorm=I=-13:TP=-1.0:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true" -ar 48000 -c:a pcm_s24le "$2"
ffmpeg -v info -y -i "$2" -af "loudnorm=I=-13:TP=-1.0:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p' | python3 -c "import json,sys;d=json.load(sys.stdin);print('result I',d['input_i'],'TP',d['input_tp'])"
