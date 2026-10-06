#!/bin/bash
# Clean poster cutout (no window-blind shadows), after batch1 finishes
cd /home/claude/riff-video/blender
PY=/home/claude/bvenv/bin/python
until grep -q ALLDONE out/batch1.log; do sleep 20; done
echo "[$(date +%T)] start cutout2"
CUPCFG='{"palette":"warm","spoon":false,"cutout":true,"rot":-20,"gobo":false,"sun_angle":3.0}' $PY cup.py hero out/cutout2.png 1200 1500 96 tulip > out/cutout2.log 2>&1
$PY grade.py out/cutout2.png out/cutout2_g.png 0.6 >/dev/null
echo "[$(date +%T)] done cutout2"
echo ALLDONE
