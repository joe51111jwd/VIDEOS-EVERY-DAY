#!/bin/bash
# Final product renders for the Halfmoon designs (run sequentially; ~1.5 h on 4 cores)
cd /home/claude/riff-video/blender
PY=/home/claude/bvenv/bin/python
r() { name=$1; shift; echo "[$(date +%T)] start $name"; CUPCFG="$CFG" $PY cup.py "$@" > out/$name.log 2>&1; $PY grade.py out/$name.png out/${name}_g.png 0.8 >/dev/null; echo "[$(date +%T)] done $name"; }
CFG='{"palette":"warm"}'                                  r hero_warm hero out/hero_warm.png 1280 1600 96 tulip
CFG='{"palette":"cool"}'                                  r hero_cool hero out/hero_cool.png 1280 1600 96 tulip
CFG='{"palette":"warm","spoon":false,"cutout":true,"rot":-20}' r cutout hero out/cutout.png 1200 1500 96 tulip
CFG='{"palette":"warm"}'                                  r top_flatwhite top out/top_flatwhite.png 1000 1000 80 tulip
CFG='{"palette":"warm","glaze":"#A3AE95"}'                r top_cappuccino top out/top_cappuccino.png 1000 1000 80 rosetta
CFG='{"palette":"warm","glaze":"#3B3734","scale":0.74,"spoon":false}' r top_espresso top out/top_espresso.png 1000 1000 80 espresso
CFG='{"palette":"warm","glaze":"#B5683F","scale":0.84}'   r top_cortado top out/top_cortado.png 1000 1000 80 tulip
echo ALLDONE
