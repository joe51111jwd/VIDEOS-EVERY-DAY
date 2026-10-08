"""Builds the footage for the talk cut (N.Y. State of Mind): vertical 1080x1920 crops at each clip's own frame rate,
in the final grade (neon) and, for the opening shot, the raw look (flat) plus its full 16:9 frames for the reframe.
usage: python3 tools/footage/talk.py [shot ...]   (Mixkit clips in /tmp/claude-0/foot/nyc, 4K ones in nyc4k)
writes public/n/<shot>/<look>/0001.jpg... (not committed: the clips' license) and src/talk/shots.json"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'n')
FOOT = '/tmp/claude-0/foot'
LOOK = {
    'flat': "eq=contrast=0.72:saturation=0.55:brightness=0.05:gamma=1.08,curves=all='0/0.10 1/0.90'",
    'neon': "eq=gamma=1.1,curves=all='0/0.0 0.08/0.05 0.5/0.54 0.85/0.9 1/1',colorbalance=rs=-0.09:gs=0.0:bs=0.11:rm=-0.02:gm=-0.02:bm=0.03:rh=0.06:gh=0.01:bh=-0.04,eq=saturation=1.18:contrast=1.05,vignette=angle=0.45",
}
# name: (clip, start s, dur s, crop centre keys [(clip s, x 0..1)], looks, also the 16:9 frames?)
SHOTS = {
    'hk': ('51314', 9.0, 4.7, [(9.0, 0.47), (10.0, 0.47), (11.0, 0.45), (12.0, 0.47), (13.0, 0.49), (13.7, 0.5)], ['flat', 'neon'], True),
    'ts': ('4332', 0.8, 2.4, [(0.8, 0.64), (3.2, 0.64)], ['neon'], False),
    'cab': ('4331', 5.6, 2.2, [(5.6, 0.78), (6.1, 0.6), (6.6, 0.45), (7.1, 0.33), (7.8, 0.2)], ['neon'], False),
    'grid': ('4338', 2.0, 2.2, [(2.0, 0.5)], ['neon'], False),
    'sub': ('4431', 0.1, 2.2, [(0.1, 0.42)], ['neon'], False),
    'kick': ('51317', 8.2, 2.4, [(8.2, 0.45), (10.6, 0.42)], ['neon'], False),
    'face': ('51321', 1.6, 2.6, [(1.6, 0.52), (4.2, 0.5)], ['neon'], False),
    'sky': ('4330', 3.0, 6.0, [(3.0, 0.56)], ['neon'], False),
    'low': ('51313', 0.8, 2.6, [(0.8, 0.43), (3.4, 0.47)], ['neon'], False),
    'umb': ('4332', 16.8, 2.4, [(16.8, 0.58), (19.2, 0.6)], ['neon'], False),
    'grp': ('51300', 9.0, 2.6, [(9.0, 0.46)], ['neon'], False),
    'air': ('42041', 2.0, 2.2, [(2.0, 0.5)], ['neon'], False),
    'wide': ('51314', 4.2, 2.6, [(4.2, 0.45), (6.8, 0.5)], ['neon'], False),
}

def probe(p):
    j = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', p]))['streams'][0]
    n, d = j['r_frame_rate'].split('/')
    return j['width'], j['height'], float(n) / float(d)

def xexpr(keys, s0, cw, W):
    pts = [(k - s0, min(W - cw, max(0, c * W - cw / 2))) for k, c in keys]
    e = '%.1f' % pts[-1][1]
    for (t0, x0), (t1, x1) in reversed(list(zip(pts, pts[1:]))):
        e = 'if(lt(t,%.3f),%.1f+(%.1f)*(t-(%.3f))/%.3f,%s)' % (t1, x0, x1 - x0, t0, t1 - t0, e)
    return 'if(lt(t,%.3f),%.1f,%s)' % (pts[0][0], pts[0][1], e)

def job(name):
    clip, s0, dur, keys, looks, wide = SHOTS[name]
    src = os.path.join(FOOT, 'nyc4k', clip + '.mp4')
    if not os.path.exists(src):
        src = os.path.join(FOOT, 'nyc', clip + '.mp4')
    W, H, fps = probe(src)
    cw = round(H * 9 / 16 / 2) * 2
    geo = "crop=%d:%d:x='%s':y=0,scale=1080:1920:flags=lanczos,unsharp=5:5:%s" % (cw, H, xexpr(keys, s0, cw, W), '0.35' if H < 2000 else '0.15')
    cmds = []
    for lk in looks:
        d = os.path.join(OUT, name, lk); os.makedirs(d, exist_ok=True)
        cmds.append(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s0), '-t', str(dur), '-i', src, '-vf', geo + ',' + LOOK[lk], '-q:v', '3', os.path.join(d, '%04d.jpg')])
    if wide:
        d = os.path.join(OUT, name, 'wide'); os.makedirs(d, exist_ok=True)
        cmds.append(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(s0), '-t', '1.6', '-i', src, '-vf', 'scale=1920:1080:flags=lanczos,' + LOOK['flat'], '-q:v', '3', os.path.join(d, '%04d.jpg')])
    for c in cmds:
        subprocess.run(c, check=True)
    n = len(os.listdir(os.path.join(OUT, name, looks[0])))
    nw = len(os.listdir(os.path.join(OUT, name, 'wide'))) if wide else 0
    print(name, clip, '%.3f fps' % fps, n, 'frames', ('+ %d wide' % nw) if wide else '', flush=True)
    return name, {'clip': clip, 'src0': s0, 'fps': fps, 'n': n, 'looks': looks, 'wide': nw, 'keys': keys, 'W': W, 'H': H}

names = sys.argv[1:] or list(SHOTS)
mp = os.path.join(ROOT, 'src', 'talk', 'shots.json')
man = json.load(open(mp)) if os.path.exists(mp) else {}
with ThreadPoolExecutor(4) as ex:
    for name, info in ex.map(job, names):
        man[name] = info
json.dump(man, open(mp, 'w'), indent=1)
print('wrote', mp)
