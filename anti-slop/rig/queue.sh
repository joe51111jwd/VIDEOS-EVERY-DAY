#!/bin/bash
# usage: queue.sh <concurrency> spec1.json spec2.json ...
C=$1; shift
cd "$(dirname "$0")"
for s in "$@"; do
  while [ "$(jobs -rp | wc -l)" -ge "$C" ]; do sleep 2; done
  n=$(basename "$s" .json)
  node capture.mjs "$s" > "${LOGDIR:-/home/user/work/cap/logs}/$n.log" 2>&1 &
  sleep 3
done
wait
echo ALLDONE
