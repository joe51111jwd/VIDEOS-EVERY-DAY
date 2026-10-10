"""Blender donut, built the way the famous beginner tutorial builds it, rendered as
viewport frames (Workbench solid shading + overlays drawn in PIL) and Cycles frames.

usage: python donut.py -- <mode> <stage> <i0> <i1> [step]
  mode  vp | cy | beauty
  stage cube | torus | smooth | icing | color | sprinkles   (vp)
Frames are orbit positions along AZ0..AZ1 (N steps); written to out/<mode>_<stage>/NNN.png
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Matrix, noise
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:]
MODE, STAGE = ARGS[0], ARGS[1]
I0, I1 = int(ARGS[2]), int(ARGS[3])
STEP = int(ARGS[4]) if len(ARGS) > 4 else 1
N = 120
AZ0, AZ1 = -38.0, 14.0
ELEV = 31.0
DIST = 4.1
TARGET = Vector((0, 0, 0.18))
VW, VH = 1460, 840  # viewport region in the UI
OUT = os.path.join(os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')), f'{MODE}_{STAGE}')
os.makedirs(OUT, exist_ok=True)

ORDER = ['cube', 'torus', 'smooth', 'icing', 'color', 'sprinkles', 'final']
lvl = ORDER.index(STAGE) if STAGE in ORDER else len(ORDER) - 1

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
random.seed(7)


def mat(name, rgb, rough=0.5, sss=0.0, spec=0.5, clear=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*rgb, 1)
    b.inputs['Roughness'].default_value = rough
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (0.9, 0.5, 0.3)
        b.inputs['Subsurface Scale'].default_value = 0.08
    if clear:
        b.inputs['Coat Weight'].default_value = clear
    m.diffuse_color = (*rgb, 1)
    return m


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


M_DOUGH = mat('dough', srgb('#c98a4b'), rough=0.62, sss=0.25)
M_ICING = mat('icing', srgb('#f39ab8'), rough=0.18, sss=0.15, clear=0.3)
M_PLATE = mat('plate', srgb('#f4f1ea'), rough=0.12)
M_TABLE = mat('table', srgb('#5a3b2a'), rough=0.55)
SPR_COLS = ['#ffffff', '#ffd23f', '#3fa7ff', '#7ed957', '#ff6b6b', '#b07cff']
M_SPR = [mat('spr%d' % i, srgb(c), rough=0.3) for i, c in enumerate(SPR_COLS)]


def link(ob):
    scn.collection.objects.link(ob)
    return ob


def torus_mesh(name, R=1.0, r=0.45, seg=48, ring=16):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_circle  # noqa
    verts = []
    for i in range(seg):
        u = 2 * math.pi * i / seg
        row = []
        for j in range(ring):
            v = 2 * math.pi * j / ring
            x = (R + r * math.cos(v)) * math.cos(u)
            y = (R + r * math.cos(v)) * math.sin(u)
            z = r * math.sin(v)
            row.append(bm.verts.new((x, y, z)))
        verts.append(row)
    for i in range(seg):
        for j in range(ring):
            a = verts[i][j]; b = verts[(i + 1) % seg][j]
            c = verts[(i + 1) % seg][(j + 1) % ring]; d = verts[i][(j + 1) % ring]
            bm.faces.new((a, b, c, d))
    bm.to_mesh(me)
    bm.free()
    return me


objs = {}
sel = None
if STAGE == 'empty':
    pass
elif lvl == 0:
    me = bpy.data.meshes.new('Cube')
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.6)
    bmesh.ops.translate(bm, vec=(0, 0, 0.8), verts=bm.verts)
    bm.to_mesh(me); bm.free()
    objs['cube'] = link(bpy.data.objects.new('Cube', me))
    sel = 'cube'
else:
    # donut body
    if lvl == 1:
        me = torus_mesh('Torus', 1.0, 0.25, 48, 12)
        don = link(bpy.data.objects.new('Donut', me))
        don.location.z = 0.25
    else:
        me = torus_mesh('Donut', 1.0, 0.5, 48, 16)
        don = link(bpy.data.objects.new('Donut', me))
        don.scale = (1, 1, 0.72)
        don.location.z = 0.36
        # lumpy, hand-made look
        for v in me.vertices:
            p = v.co * 1.7
            v.co += v.normal * 0.035 * noise.noise(p)
        sub = don.modifiers.new('Subdivision', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
        for p in me.polygons: p.use_smooth = True
    don.data.materials.append(M_DOUGH)
    objs['donut'] = don
    sel = 'donut'
    if lvl >= 3:
        # icing: the top half of the donut, wavy drip edge, thickened.
        # Built as a band in the torus' (u, v) space so its edge follows the drip contour exactly (no stair steps).
        R, r = 1.0, 0.5
        SEG, K = 240, 44

        def wob(u):
            return 0.035 * math.sin(u * 7 + 1.3) + 0.06 * noise.noise(Vector((math.cos(u) * 2, math.sin(u) * 2, 0.5)))

        def drip(u):
            return max(0.0, math.sin(u * 9 + 0.7)) ** 8 * 0.30 + max(0.0, math.sin(u * 5 + 2.1)) ** 10 * 0.18

        cl = lambda x: max(-0.97, min(0.97, x))
        VO, VI = math.asin(0.12 / r), math.pi - math.asin(0.20 / r)
        ime = bpy.data.meshes.new('Icing')
        bm = bmesh.new()
        cols = []
        for i in range(SEG):
            u = 2 * math.pi * i / SEG
            vo = math.asin(cl((0.12 + wob(u) - drip(u)) / r))  # outer edge, drips hang lower
            vi = math.pi - math.asin(cl((0.20 + wob(u)) / r))  # inner edge
            col = []
            for j in range(K):
                # rows sit on a fixed grid; only the rows near each edge bend to follow it (no shading streaks)
                sj = j / (K - 1)
                v = VO + (VI - VO) * sj + (vo - VO) * (1 - sj) ** 4 + (vi - VI) * sj ** 4
                col.append(bm.verts.new(((R + r * math.cos(v)) * math.cos(u), (R + r * math.cos(v)) * math.sin(u), r * math.sin(v))))
            cols.append(col)
        for i in range(SEG):
            for j in range(K - 1):
                a, b2 = cols[i][j], cols[(i + 1) % SEG][j]
                c, d = cols[(i + 1) % SEG][j + 1], cols[i][j + 1]
                bm.faces.new((a, b2, c, d))
        bm.to_mesh(ime); bm.free()
        for v in ime.vertices:
            v.co += v.normal * 0.012 + v.normal * 0.03 * noise.noise(v.co * 1.7)
        ice = link(bpy.data.objects.new('Icing', ime))
        ice.scale = don.scale; ice.location = don.location
        so = ice.modifiers.new('Solidify', 'SOLIDIFY'); so.thickness = 0.06; so.offset = 1
        sb = ice.modifiers.new('Subdivision', 'SUBSURF'); sb.levels = 2; sb.render_levels = 2
        for p in ime.polygons: p.use_smooth = True
        ice.data.materials.append(M_ICING)
        objs['icing'] = ice
        sel = 'icing'
    if lvl >= 5:
        # sprinkles on the upper icing
        cap = bpy.data.meshes.new('spr')
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.019, radius2=0.019, depth=0.085)
        bm.to_mesh(cap); bm.free()
        for p in cap.polygons: p.use_smooth = True
        cnt = 0
        tries = 0
        placed = []
        while cnt < 170 and tries < 20000:
            tries += 1
            u = random.uniform(0, 2 * math.pi)
            v = random.uniform(0.15, math.pi - 0.15)  # top half of tube
            R, r = 1.0, 0.5
            pos = Vector(((R + r * math.cos(v)) * math.cos(u), (R + r * math.cos(v)) * math.sin(u), r * math.sin(v)))
            nrm = Vector((math.cos(v) * math.cos(u), math.cos(v) * math.sin(u), math.sin(v)))
            if pos.z < 0.30: continue
            wp = Vector((pos.x, pos.y, pos.z * 0.72 + 0.36)) + nrm * 0.09
            if any((wp - q).length < 0.075 for q in placed): continue
            placed.append(wp)
            ob = link(bpy.data.objects.new('Sprinkle', cap.copy()))
            ob.data.materials.append(random.choice(M_SPR))
            t = nrm.orthogonal().normalized()
            t.rotate(Matrix.Rotation(random.uniform(0, math.pi), 3, nrm))
            q = t.to_track_quat('Z', 'Y')
            ob.rotation_mode = 'QUATERNION'; ob.rotation_quaternion = q
            ob.location = wp
            cnt += 1
        sel = 'icing'

# ---- camera
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
link(cam)
cam.data.lens = 50
cam.data.sensor_width = 72  # viewport default
scn.camera = cam
scn.render.resolution_x, scn.render.resolution_y = VW, VH
if MODE == 'beauty':
    scn.render.resolution_x, scn.render.resolution_y = 1920, 1080


def place_cam(i):
    az = math.radians(AZ0 + (AZ1 - AZ0) * i / (N - 1))
    el = math.radians(ELEV)
    d = DIST
    if MODE == 'beauty':
        az = math.radians(-20 + 24 * i / (N - 1)); el = math.radians(38); d = 3.3
    p = TARGET + Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el))) * d
    cam.location = p
    cam.rotation_euler = (TARGET - p).to_track_quat('-Z', 'Y').to_euler()


if MODE == 'vp':
    scn.render.engine = 'BLENDER_WORKBENCH'
    sh = scn.display.shading
    sh.light = 'STUDIO'
    sh.color_type = 'MATERIAL' if lvl >= 4 else 'SINGLE'
    sh.single_color = (0.8, 0.8, 0.8)
    sh.show_cavity = False
    sh.show_specular_highlight = True
    sh.show_shadows = False
    scn.display.render_aa = '16'
    scn.render.film_transparent = True
    scn.view_settings.view_transform = 'Standard'
else:
    scn.render.engine = 'CYCLES'
    scn.cycles.samples = 48 if MODE == 'cy' else 128
    scn.cycles.use_denoising = True
    scn.view_settings.view_transform = 'AgX'
    scn.view_settings.look = 'AgX - Medium High Contrast'
    # plate + table
    pm = bpy.data.meshes.new('plate'); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=96, radius1=1.75, radius2=1.95, depth=0.08)
    bm.to_mesh(pm); bm.free()
    plate = link(bpy.data.objects.new('Plate', pm)); plate.location.z = -0.04
    bv = plate.modifiers.new('b', 'BEVEL'); bv.width = 0.03; bv.segments = 4
    for p in pm.polygons: p.use_smooth = True
    plate.data.materials.append(M_PLATE)
    tm = bpy.data.meshes.new('table'); bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=30)
    bm.to_mesh(tm); bm.free()
    table = link(bpy.data.objects.new('Table', tm)); table.location.z = -0.08
    table.data.materials.append(M_TABLE)
    for o in objs.values():
        o.location.z += 0.0
    # lights
    def area(name, loc, size, energy, col=(1, 1, 1)):
        l = bpy.data.lights.new(name, 'AREA'); l.size = size; l.energy = energy; l.color = col
        ob = link(bpy.data.objects.new(name, l)); ob.location = loc
        ob.rotation_euler = (TARGET - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    area('key', (-3.5, -2.5, 4.5), 3.0, 900, (1, 0.93, 0.85))
    area('rim', (3.5, 3.0, 3.0), 2.0, 500, (0.85, 0.9, 1))
    area('fill', (3.0, -4.0, 1.5), 4.0, 180)
    w = bpy.data.worlds.new('w'); scn.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (0.05, 0.045, 0.04, 1)
    w.node_tree.nodes['Background'].inputs[1].default_value = 1.0


# ---- overlays (grid + selection outline) composited in PIL
from PIL import Image, ImageDraw, ImageFilter, ImageChops


def grid_layer(scale=2):
    w, h = VW * scale, VH * scale
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    def proj(p):
        c = world_to_camera_view(scn, cam, Vector(p))
        return (c.x * w, (1 - c.y) * h, c.z)
    ext = 14
    for k in range(-ext, ext + 1):
        for a, b, axis in (((k, -ext, 0), (k, ext, 0), 'y'), ((-ext, k, 0), (ext, k, 0), 'x')):
            # split into segments so lines behind the camera are skipped and fade with distance
            segs = 40
            for s in range(segs):
                p0 = [a[i] + (b[i] - a[i]) * s / segs for i in range(3)]
                p1 = [a[i] + (b[i] - a[i]) * (s + 1) / segs for i in range(3)]
                q0, q1 = proj(p0), proj(p1)
                if q0[2] <= 0.1 or q1[2] <= 0.1: continue
                dist = (Vector(p0) - cam.location).length
                fade = max(0.0, min(1.0, 1.6 - dist / 9.0))
                if k == 0:
                    col = (255, 51, 82) if axis == 'x' else (139, 220, 0)
                    al = int(200 * fade)
                    width = 2 * scale // 2 + 1
                else:
                    col = (84, 84, 84); al = int(255 * fade); width = scale
                dr.line([q0[:2], q1[:2]], fill=(*col, al), width=width)
    return im.resize((VW, VH), Image.LANCZOS)


def render_to(path):
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)


for i in range(I0, I1 + 1, STEP):
    place_cam(i)
    out = f'{OUT}/{i:03d}.png'
    if MODE == 'vp':
        tmp = f'{OUT}/_rgba.png'
        for o in scn.objects: o.hide_render = False
        render_to(tmp)
        rgba = Image.open(tmp).convert('RGBA')
        # selection mask: only the selected object, flat
        keep = objs.get(sel) if sel else None
        sh = scn.display.shading
        prev = (sh.light, sh.color_type, tuple(sh.single_color))
        sh.light = 'FLAT'; sh.color_type = 'SINGLE'; sh.single_color = (1, 1, 1)
        hidden = []
        for o in scn.objects:
            if o.type == 'MESH' and o != keep:
                o.hide_render = True; hidden.append(o)
        if keep is not None:
            render_to(tmp)
            mask = Image.open(tmp).getchannel('A')
        else:
            mask = Image.new('L', (VW, VH), 0)
        for o in hidden: o.hide_render = False
        sh.light, sh.color_type = prev[0], prev[1]; sh.single_color = prev[2]
        dil = mask.filter(ImageFilter.MaxFilter(5))
        ring = ImageChops.subtract(dil, mask)
        bg = Image.new('RGBA', (VW, VH), (61, 61, 61, 255))
        bg.alpha_composite(grid_layer())
        bg.alpha_composite(rgba)
        outline = Image.new('RGBA', (VW, VH), (255, 160, 40, 0))
        outline.putalpha(ring)
        bg.alpha_composite(outline)
        bg.convert('RGB').save(out.replace('.png', '.jpg'), quality=92)
    else:
        render_to(out)
        Image.open(out).convert('RGB').save(out.replace('.png', '.jpg'), quality=93)
        os.remove(out)
    print('frame', i, flush=True)
