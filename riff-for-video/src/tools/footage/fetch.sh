#!/bin/bash
# downloads the Mixkit source clips (free license) into /tmp/claude-0/foot/raw (1080p) and raw4k (2160p)
set -e
mkdir -p /tmp/claude-0/foot/raw /tmp/claude-0/foot/raw4k
for id in 1002 1032 1045 1076 1114 1116 1127 1128 1213; do
  curl -sSfL -o /tmp/claude-0/foot/raw/$id.mp4 https://assets.mixkit.co/videos/$id/$id-1080.mp4
done
for id in 1032 1076 1114 1116 1128; do
  curl -sSfL -o /tmp/claude-0/foot/raw4k/$id.mp4 https://assets.mixkit.co/videos/$id/$id-2160.mp4
done
