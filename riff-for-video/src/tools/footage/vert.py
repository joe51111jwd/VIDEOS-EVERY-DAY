# builds 1080x1920 final-grade (moody .4 + teal .6) frame sequences for the vertical montage
import subprocess, sys, os
sys.path.insert(0, '/tmp/claude-0/foot')
G = {}
for line in open('/tmp/claude-0/grade/grades.sh'):
    k, v = line.strip().split('=', 1)
    G[k] = v.strip('"')
OUT = sys.argv[1]
ONLY = sys.argv[2:]  # optional shot names to rebuild
CW = 1215
SHOTS = [
    # name, src id, src start, dur, keys [(src t, cx)]
    ('v1', '1076', 3.1, 4.0, [(3.0, 0.29), (3.5, 0.30), (4.0, 0.31), (4.5, 0.35), (5.0, 0.385), (5.5, 0.43), (6.0, 0.49), (6.4, 0.53), (6.8, 0.575), (7.2, 0.585)]),
    ('v2', '1032', 6.5, 2.3, [(6.5, 0.63), (7.6, 0.70), (8.1, 0.74), (8.8, 0.78)]),
    ('v3', '1213', 2.9, 2.3, None),
    ('v4', '1128', 3.0, 2.3, [(3.0, 0.45), (3.5, 0.54), (4.0, 0.57), (4.5, 0.56), (5.0, 0.52), (5.5, 0.55)]),
    ('v5', '1114', 24.0, 1.2, [(24.0, 0.28), (25.5, 0.28)]),
    ('v6', '1116', 3.5, 4.6, [(3.5, 0.55), (4.0, 0.50), (4.5, 0.53), (5.0, 0.54), (6.0, 0.56), (7.0, 0.57), (8.0, 0.59), (8.5, 0.59)]),
]
def xexpr(keys, s0):
    # piecewise-linear crop x (px) over output-relative t
    pts = [(k - s0, min(3840 - CW, max(0, c * 3840 - CW / 2))) for k, c in keys]
    e = '%.1f' % pts[-1][1]
    for (t0, x0), (t1, x1) in reversed(list(zip(pts, pts[1:]))):
        e = 'if(lt(t,%.3f),%.1f+(%.1f)*(t-(%.3f))/%.3f,%s)' % (t1, x0, x1 - x0, t0, t1 - t0, e)
    return 'if(lt(t,%.3f),%.1f,%s)' % (pts[0][0], pts[0][1], e)
procs = []
for name, sid, s0, dur, keys in SHOTS:
    if ONLY and name not in ONLY:
        continue
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
    if keys:
        src = '/tmp/claude-0/foot/raw4k/%s.mp4' % sid
        geo = "crop=%d:2160:x='%s':y=0,scale=1080:1920:flags=lanczos," % (CW, xexpr(keys, s0))
    else:
        src = '/tmp/claude-0/foot/raw/%s.mp4' % sid
        geo = ''
    fc = "[0:v]%sfps=30,format=yuv444p,split[a][b];[a]%s[m];[b]%s[t];[m][t]blend=all_expr='A*0.4+B*0.6',format=yuvj420p[o]" % (geo, G['MOODY'], G['TEAL'])
    cmd = ['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s0), '-t', str(dur), '-i', src, '-filter_complex', fc, '-map', '[o]', '-q:v', '3', os.path.join(d, '%04d.jpg')]
    procs.append((name, subprocess.Popen(cmd)))
for name, p in procs:
    p.wait(); print(name, p.returncode, len(os.listdir(os.path.join(OUT, name))), flush=True)
