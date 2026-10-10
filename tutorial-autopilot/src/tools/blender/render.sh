#!/bin/bash
# Renders the donut tutorial frames the film reads from public/bl (symlink to the output folder).
# Needs Blender as a Python module (pip install bpy; Python 3.13) and EGL for the Workbench viewport frames.
# Usage: OUT=/path/to/out bash render.sh    (then: ln -s /path/to/out ../../public/bl)
set -e
cd "$(dirname "$0")"
PY=${PY:-python}
for st in cube empty torus smooth; do $PY donut.py -- vp $st 0 119; done
for st in icing color sprinkles; do $PY donut.py -- vp $st 0 118 2; done   # heavy stages: even frames only
$PY donut.py -- cy final 96 118 2                                         # Cycles render for "press it"
