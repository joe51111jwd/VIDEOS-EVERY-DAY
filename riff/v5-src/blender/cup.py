# Halfmoon coffee: speckled stoneware cup on a saucer, travertine table, morning window light.
# usage: bvenv/bin/python cup.py <view> <out.png> <w> <h> <samples> [art]
import sys, math, random
sys.path.insert(0, '/home/claude/riff-video/blender')
from common import *
import bpy, bmesh
from mathutils import Vector

import json, os
CFG = json.loads(os.environ.get('CUPCFG', '{}'))
VIEW = sys.argv[1] if len(sys.argv) > 1 else 'hero'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/claude-0/cup.png'
W = int(sys.argv[3]) if len(sys.argv) > 3 else 800
H = int(sys.argv[4]) if len(sys.argv) > 4 else 1000
SAMPLES = int(sys.argv[5]) if len(sys.argv) > 5 else 64
ART = sys.argv[6] if len(sys.argv) > 6 else 'tulip'
TEX = '/home/claude/riff-video/blender/tex/'
mm = 0.001
PAL = CFG.get('palette', 'warm')
if PAL == 'warm':
    TABLE_A, TABLE_B, TABLE_PIT, WALL = '#B9805C', '#CB9572', '#9A6444', '#D7A47F'
    SUN_COL, SUN_STR, WORLD_COL, WORLD_STR, BOUNCE = '#FFC98E', 11.0, '#9CB0CF', 0.26, '#FFE9D2'
else:
    TABLE_A, TABLE_B, TABLE_PIT, WALL = '#DAD7D2', '#ECEAE6', '#C2BDB5', '#E9E8E5'
    SUN_COL, SUN_STR, WORLD_COL, WORLD_STR, BOUNCE = '#FFF3E4', 8.0, '#B4C6E2', 0.42, '#F2F5FF'
GLAZE = CFG.get('glaze', '#EDE4D3')

sc = reset()


# ------------------------------------------------------------------ materials
def speckled(name, base, speck='#5A4636', RIM_Z=1.0):
    mat = principled(name, base, rough=0.28, coat=0.7, coat_rough=0.035, spec=0.5)
    nt, ln = nodes(mat)
    b = nt['Principled BSDF']
    tc = nt.new('ShaderNodeTexCoord')
    mix_prev = None
    col_in = b.inputs['Base Color']
    base_rgb = nt.new('ShaderNodeRGB')
    base_rgb.outputs[0].default_value = hexcol(base)
    cur = base_rgb.outputs[0]
    for scale, thr, keep in ((520, 0.17, 0.8), (1900, 0.22, 0.62)):
        vor = nt.new('ShaderNodeTexVoronoi')
        vor.inputs['Scale'].default_value = scale
        ln.new(tc.outputs['Object'], vor.inputs['Vector'])
        lt = nt.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = thr
        ln.new(vor.outputs['Distance'], lt.inputs[0])
        sep = nt.new('ShaderNodeSeparateColor')
        ln.new(vor.outputs['Color'], sep.inputs[0])
        gt = nt.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = keep
        ln.new(sep.outputs[0], gt.inputs[0])
        mul = nt.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
        ln.new(lt.outputs[0], mul.inputs[0]); ln.new(gt.outputs[0], mul.inputs[1])
        mix = nt.new('ShaderNodeMix'); mix.data_type = 'RGBA'
        ln.new(mul.outputs[0], mix.inputs['Factor'])
        ln.new(cur, mix.inputs[6])
        mix.inputs[7].default_value = hexcol(speck)
        cur = mix.outputs[2]
    # very soft glaze pooling variation
    nz = nt.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 40; nz.inputs['Detail'].default_value = 4
    ln.new(tc.outputs['Object'], nz.inputs['Vector'])
    mixv = nt.new('ShaderNodeMix'); mixv.data_type = 'RGBA'; mixv.inputs['Factor'].default_value = 0.08
    ln.new(cur, mixv.inputs[6]); ln.new(nz.outputs['Color'], mixv.inputs[7])
    sepz = nt.new('ShaderNodeSeparateXYZ'); ln.new(tc.outputs['Object'], sepz.inputs[0])
    rim = nt.new('ShaderNodeMapRange')
    rim.inputs['From Min'].default_value = RIM_Z - 0.0022; rim.inputs['From Max'].default_value = RIM_Z
    ln.new(sepz.outputs['Z'], rim.inputs['Value'])
    mixr = nt.new('ShaderNodeMix'); mixr.data_type = 'RGBA'
    ln.new(rim.outputs['Result'], mixr.inputs['Factor']); ln.new(mixv.outputs[2], mixr.inputs[6])
    mixr.inputs[7].default_value = hexcol('#8A6446')
    ln.new(mixr.outputs[2], col_in)
    return mat


CUP_SCALE = CFG.get('scale', 1.0)
glaze = speckled('glaze', GLAZE, RIM_Z=0.0642 * CUP_SCALE)
sglaze = speckled('sglaze', GLAZE, RIM_Z=0.0178 * CUP_SCALE)
clay = principled('clay', '#BFA88C', rough=0.85)
steel = principled('steel', '#D8D8DA', rough=0.12, metal=1.0)


def coffee_mat(art):
    mat = principled('coffee', '#6B4226', rough=0.3)
    nt, ln = nodes(mat)
    b = nt['Principled BSDF']
    img = nt.new('ShaderNodeTexImage')
    img.image = bpy.data.images.load(TEX + f'latte_{art}.png')
    ln.new(img.outputs['Color'], b.inputs['Base Color'])
    # foam is satin, crema is glossier
    sep = nt.new('ShaderNodeRGBToBW'); ln.new(img.outputs['Color'], sep.inputs[0])
    mr = nt.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = 0.1; mr.inputs['From Max'].default_value = 0.8
    mr.inputs['To Min'].default_value = 0.18; mr.inputs['To Max'].default_value = 0.5
    ln.new(sep.outputs[0], mr.inputs['Value']); ln.new(mr.outputs['Result'], b.inputs['Roughness'])
    bump = nt.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.25; bump.inputs['Distance'].default_value = 0.0004
    ln.new(sep.outputs[0], bump.inputs['Height']); ln.new(bump.outputs['Normal'], b.inputs['Normal'])
    b.inputs['Subsurface Weight'].default_value = 0.15
    return mat


def travertine():
    mat = principled('travertine', '#D6C8B4', rough=0.55)
    nt, ln = nodes(mat)
    b = nt['Principled BSDF']
    tc = nt.new('ShaderNodeTexCoord')
    mapn = nt.new('ShaderNodeMapping'); mapn.inputs['Scale'].default_value = (1.0, 4.0, 1.0)
    ln.new(tc.outputs['Object'], mapn.inputs['Vector'])
    nz = nt.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3.0; nz.inputs['Detail'].default_value = 12
    nz.inputs['Roughness'].default_value = 0.62
    ln.new(mapn.outputs['Vector'], nz.inputs['Vector'])
    ramp = nt.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = hexcol(TABLE_A)
    ramp.color_ramp.elements[1].position = 0.7; ramp.color_ramp.elements[1].color = hexcol(TABLE_B)
    ln.new(nz.outputs['Fac'], ramp.inputs['Fac'])
    # pits
    vor = nt.new('ShaderNodeTexVoronoi'); vor.inputs['Scale'].default_value = 160
    ln.new(mapn.outputs['Vector'], vor.inputs['Vector'])
    lt = nt.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'; lt.inputs[1].default_value = 0.09
    ln.new(vor.outputs['Distance'], lt.inputs[0])
    sep = nt.new('ShaderNodeSeparateColor'); ln.new(vor.outputs['Color'], sep.inputs[0])
    gt = nt.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = 0.8
    ln.new(sep.outputs[0], gt.inputs[0])
    pit = nt.new('ShaderNodeMath'); pit.operation = 'MULTIPLY'
    ln.new(lt.outputs[0], pit.inputs[0]); ln.new(gt.outputs[0], pit.inputs[1])
    mix = nt.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    ln.new(pit.outputs[0], mix.inputs['Factor']); ln.new(ramp.outputs['Color'], mix.inputs[6])
    mix.inputs[7].default_value = hexcol(TABLE_PIT)
    ln.new(mix.outputs[2], b.inputs['Base Color'])
    inv = nt.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
    ln.new(pit.outputs[0], inv.inputs[1])
    bump = nt.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.35; bump.inputs['Distance'].default_value = 0.001
    hgt = nt.new('ShaderNodeMath'); hgt.operation = 'ADD'
    ln.new(inv.outputs[0], hgt.inputs[0]); ln.new(nz.outputs['Fac'], hgt.inputs[1])
    ln.new(hgt.outputs[0], bump.inputs['Height']); ln.new(bump.outputs['Normal'], b.inputs['Normal'])
    return mat


def plaster():
    mat = principled('plaster', WALL, rough=0.92)
    nt, ln = nodes(mat)
    b = nt['Principled BSDF']
    nz = nt.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 18; nz.inputs['Detail'].default_value = 10
    bump = nt.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.12
    ln.new(nz.outputs['Fac'], bump.inputs['Height']); ln.new(bump.outputs['Normal'], b.inputs['Normal'])
    return mat


# ------------------------------------------------------------------ geometry
CUP = [(0, 6), (22, 6), (29, 7.5), (34, 12), (37.5, 22), (40.5, 36), (42.5, 50), (43.4, 58), (43.9, 62),
       (44.5, 63.6), (45.4, 64.2), (46.4, 63.8), (47.0, 62.4), (46.9, 58), (46.2, 48), (44.6, 34), (41.5, 22),
       (36.5, 12.5), (32.5, 8.5), (30.0, 6.4), (29.6, 4.5), (29.4, 1.2), (28.7, 0.0), (26.2, 0.0), (25.6, 1.3),
       (23.5, 2.2), (0, 2.4)]
FOOT_FROM = 19  # profile edges >= this index are unglazed foot

SAUCER = [(0, 5.4), (30, 5.4), (33, 6.2), (36, 7.8), (46, 10.2), (58, 13.0), (68, 16.0), (73.2, 17.6), (75.0, 17.8),
          (76.3, 17.2), (76.6, 16.0), (75.4, 14.6), (66, 10.2), (52, 5.6), (43, 3.4), (41.6, 1.4), (41.0, 0.0),
          (38.6, 0.0), (38.0, 1.4), (35.0, 2.6), (0, 2.8)]
S_FOOT = 14


def make_cup(x=0.0, y=0.0, z=0.0, rot=0.0, art='tulip', scale=1.0, name='cup'):
    prof = [(r * mm * scale, zz * mm * scale) for r, zz in CUP]
    cup = revolve(name, prof, 192, lambda j: 1 if j >= FOOT_FROM else 0)
    cup.data.materials.append(glaze)
    cup.data.materials.append(clay)
    subsurf(cup, 2)
    # handle: bezier "ear" in the XZ plane
    cd = bpy.data.curves.new(name + '_h', 'CURVE')
    cd.dimensions = '3D'
    sp = cd.splines.new('BEZIER')
    pts = [(44.5, 52.5), (60.0, 56.0), (69.0, 42.0), (58.0, 27.5), (43.0, 23.0)]
    sp.bezier_points.add(len(pts) - 1)
    for bp, (px, pz) in zip(sp.bezier_points, pts):
        bp.co = (px * mm * scale, 0, pz * mm * scale)
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    prof_c = bpy.data.curves.new(name + '_hp', 'CURVE')
    ps = prof_c.splines.new('BEZIER')
    ps.bezier_points.add(3)
    for bp, (px, py) in zip(ps.bezier_points, [(0, 5.0), (3.4, 0), (0, -5.0), (-3.4, 0)]):
        bp.co = (px * mm * scale, py * mm * scale, 0)
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ps.use_cyclic_u = True
    po = bpy.data.objects.new(name + '_hprof', prof_c)
    bpy.context.scene.collection.objects.link(po)
    po.hide_render = True
    cd.bevel_mode = 'OBJECT'
    cd.bevel_object = po
    cd.use_fill_caps = True
    cd.resolution_u = 24
    h = bpy.data.objects.new(name + '_handle', cd)
    bpy.context.scene.collection.objects.link(h)
    cd.materials.append(glaze)
    h.parent = cup
    # coffee surface
    rr = 43.0 * mm * scale
    bpy.ops.mesh.primitive_circle_add(vertices=192, radius=rr, fill_type='TRIFAN', location=(0, 0, 57.5 * mm * scale))
    cf = bpy.context.active_object
    cf.name = name + '_coffee'
    me = cf.data
    uv = me.uv_layers.new()
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (co.x / (2 * rr) + 0.5, co.y / (2 * rr) + 0.5)
    me.materials.append(coffee_mat(art))
    cf.rotation_euler = (0, 0, -rot)
    cf.parent = cup
    cup.location = (x, y, z)
    cup.rotation_euler = (0, 0, rot)
    return cup


def make_saucer(x=0.0, y=0.0, scale=1.0):
    prof = [(r * mm * scale, zz * mm * scale) for r, zz in SAUCER]
    s = revolve('saucer', prof, 192, lambda j: 1 if S_FOOT <= j <= S_FOOT + 4 else 0)
    s.data.materials.append(sglaze)
    s.data.materials.append(clay)
    subsurf(s, 2)
    s.location = (x, y, 0)
    return s


def make_spoon(loc, rot):
    root = bpy.data.objects.new('spoon', None)
    bpy.context.scene.collection.objects.link(root)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1.0)
    bowl = bpy.context.active_object
    # keep the lower half: a concave shell, then give it thickness
    bm = bmesh.new(); bm.from_mesh(bowl.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 0.02], context='VERTS')
    bm.to_mesh(bowl.data); bm.free()
    bowl.scale = (8.5 * mm, 14.0 * mm, 3.2 * mm)
    sol = bowl.modifiers.new('sol', 'SOLIDIFY'); sol.thickness = 0.12; sol.offset = 1
    for p in bowl.data.polygons:
        p.use_smooth = True
    bowl.data.materials.append(steel)
    bowl.parent = root
    cd = bpy.data.curves.new('spoon_h', 'CURVE'); cd.dimensions = '3D'
    sp = cd.splines.new('BEZIER'); sp.bezier_points.add(2)
    for bp, (py, pz) in zip(sp.bezier_points, [(12, 3.0), (40, 5.0), (84, 6.4)]):
        bp.co = (0, py * mm, pz * mm); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cd.bevel_depth = 1.5 * mm; cd.bevel_resolution = 6; cd.use_fill_caps = True
    tp = bpy.data.curves.new('taper', 'CURVE'); tsp = tp.splines.new('BEZIER'); tsp.bezier_points.add(2)
    for bp, (px, py) in zip(tsp.bezier_points, [(0, 0.6), (0.45, 0.85), (1.0, 2.0)]):
        bp.co = (px, py, 0); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    to = bpy.data.objects.new('taper', tp); bpy.context.scene.collection.objects.link(to); to.hide_render = True
    cd.taper_object = to
    hob = bpy.data.objects.new('spoon_handle', cd); bpy.context.scene.collection.objects.link(hob)
    cd.materials.append(steel)
    hob.parent = root
    root.location = (loc[0], loc[1], loc[2] + 0.0025)
    root.rotation_euler = rot
    return root


# ------------------------------------------------------------------ scene
tab = plane('table', (3, 3), (0, 0.3, 0), mat=travertine())
wall = plane('wall', (4, 2), (0, 0.42, 1.0), rot=(math.radians(90), 0, 0), mat=plaster())

saucer = make_saucer(scale=CUP_SCALE)
cup = make_cup(z=5.4 * mm * CUP_SCALE, rot=math.radians(CFG.get('rot', -28)), art=ART, scale=CUP_SCALE)
if CFG.get('spoon', True):
    spoon = make_spoon((0.030 * CUP_SCALE, -0.052 * CUP_SCALE, 0.0146 * CUP_SCALE), (math.radians(-7), math.radians(3), math.radians(-128)))
if CFG.get('cutout'):
    tab.is_shadow_catcher = True
    wall.hide_render = True

world(WORLD_COL, WORLD_STR)
sun_ob, src = sun(214, 26, strength=SUN_STR, color=SUN_COL, angle_deg=CFG.get('sun_angle', 0.4))

if CFG.get('gobo', True):
    # window gobo between the sun and the set: mullions + a few leaves
    gob_c = src * 0.72
    rot = (-src).to_track_quat('-Z', 'Y').to_euler()
    gobo = bpy.data.objects.new('gobo', None)
    bpy.context.scene.collection.objects.link(gobo)
    gobo.location = gob_c
    gobo.rotation_euler = rot
    dark = principled('blocker', '#222222', rough=1)
    for i in range(18):
        ly = -0.50 + i * 0.058
        b = box(f'slat{i}', (1.6, 0.03, 0.004), (0, ly, 0), mat=dark)
        b.rotation_euler = (math.radians(25), 0, 0)
        b.parent = gobo
    b = box('mull', (0.05, 1.3, 0.02), (0.26, 0, 0.02), mat=dark)
    b.parent = gobo
    gobo.rotation_euler.rotate_axis('Z', math.radians(12)) if False else None
    random.seed(3)
    leaf_mesh = None
    for i in range(16):
        bpy.ops.mesh.primitive_circle_add(vertices=24, radius=1.0, fill_type='NGON')
        lf = bpy.context.active_object
        lf.scale = (0.018 + random.random() * 0.012, 0.045 + random.random() * 0.025, 1)
        lf.location = (-0.30 + random.uniform(-0.12, 0.12), 0.18 + random.uniform(-0.15, 0.15), random.uniform(0.02, 0.08))
        lf.rotation_euler = (random.uniform(-0.6, 0.6), random.uniform(-0.6, 0.6), random.uniform(0, math.pi))
        lf.data.materials.append(dark)
        lf.parent = gobo
    for o in [o for o in bpy.data.objects if o.parent == gobo] + [gobo]:
        o.visible_camera = False
        o.visible_glossy = False

# the window itself, for a soft highlight in the glaze
win = area(tuple(src * 0.9), (0, 0, 0.03), size=0.5, size_y=0.8, strength=30, color='#FFE3C4')
win.visible_diffuse = False
# soft warm bounce from camera-right
area((0.6, -0.5, 0.35), (0, 0, 0.03), size=0.8, strength=6, color=BOUNCE)

if VIEW == 'hero':
    P = (0.09, -0.47, 0.31)
    cam = camera(P, (0.006, 0.0, 0.034), lens=80, fstop=2.8)
    cam.data.dof.focus_distance = (Vector(P) - Vector((0.0, -0.02, 0.05))).length
elif VIEW == 'top':
    cam = camera((0.0, -0.001, 0.62), (0.0, 0.0, 0.0), lens=60, fstop=5.6)
    cam.data.dof.focus_distance = 0.56
elif VIEW == 'wide':
    cam = camera((0.18, -0.95, 0.52), (0.02, 0.06, 0.04), lens=55, fstop=2.0)
    cam.data.dof.focus_distance = (Vector((0.18, -0.95, 0.52)) - Vector((0.0, 0.0, 0.05))).length

render(OUT, W, H, SAMPLES, transparent=bool(CFG.get('cutout')))
print('done', OUT)
