# Paste Real app icon in 3D (Blender 5.2 bpy, Cycles CPU).
# usage: bvenv/bin/python blender/icon3d.py <out.png> [view=hero|front|top] [size=1600] [samples=256] [rotz=-18] [tilt=34]
import math, sys
import bpy, bmesh
from mathutils import Vector

args = dict(a.split('=', 1) for a in sys.argv[2:] if '=' in a)
OUT = sys.argv[1]
VIEW = args.get('view', 'hero')
SIZE = int(args.get('size', 1600))
SAMPLES = int(args.get('samples', 256))
ROTZ = float(args.get('rotz', -14))
TILT = float(args.get('tilt', 56))
THICK = float(args.get('thick', 0.17))
BODY = args.get('body', '#121215')
ORANGE = args.get('orange', '#FF5A1F')
LOOK = args.get('look', 'standard')


def hexcol(h, a=1.0):
	h = h.lstrip('#')
	srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
	return (*[c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb], a)


bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_adaptive_sampling = True
sc.cycles.adaptive_threshold = 0.008
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 10
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.render.film_transparent = True
sc.render.resolution_x = SIZE
sc.render.resolution_y = SIZE
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.image_settings.color_depth = '16'
if LOOK == 'agx':
	sc.view_settings.view_transform = 'AgX'
	try:
		sc.view_settings.look = 'AgX - Medium High Contrast'
	except Exception:
		pass
else:
	sc.view_settings.view_transform = 'Standard'
	sc.view_settings.look = 'None'


def link(name, me):
	ob = bpy.data.objects.new(name, me)
	sc.collection.objects.link(ob)
	return ob


def mat(name, color, rough, coat=0.0, coat_rough=0.05, spec=0.5, metal=0.0, emit=None, emit_strength=0.0):
	m = bpy.data.materials.new(name)
	m.use_nodes = True
	b = m.node_tree.nodes['Principled BSDF']
	b.inputs['Base Color'].default_value = hexcol(color)
	b.inputs['Roughness'].default_value = rough
	b.inputs['Metallic'].default_value = metal
	b.inputs['Coat Weight'].default_value = coat
	b.inputs['Coat Roughness'].default_value = coat_rough
	b.inputs['Specular IOR Level'].default_value = spec
	if emit:
		b.inputs['Emission Color'].default_value = hexcol(emit)
		b.inputs['Emission Strength'].default_value = emit_strength
	return m


def prism(name, outline, z0, z1, bevel, segs, material, smooth=True):
	"""Extrude a closed 2D outline (list of (x, y)) from z0 to z1, bevel its edges."""
	bm = bmesh.new()
	bot = [bm.verts.new((x, y, z0)) for x, y in outline]
	top = [bm.verts.new((x, y, z1)) for x, y in outline]
	bm.faces.new(list(reversed(bot)))
	bm.faces.new(top)
	n = len(outline)
	for i in range(n):
		j = (i + 1) % n
		bm.faces.new((bot[i], bot[j], top[j], top[i]))
	bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
	me = bpy.data.meshes.new(name)
	bm.to_mesh(me)
	bm.free()
	ob = link(name, me)
	if bevel > 0:
		m = ob.modifiers.new('bev', 'BEVEL')
		m.width = bevel
		m.segments = segs
		m.limit_method = 'ANGLE'
		m.angle_limit = math.radians(30)
		m.profile = 0.5
		m.harden_normals = True
	if smooth:
		for p in me.polygons:
			p.use_smooth = True
	me.materials.append(material)
	return ob


def squircle(rad, n=5, pts=256):
	out = []
	for i in range(pts):
		t = 2 * math.pi * i / pts
		c, s = math.cos(t), math.sin(t)
		out.append((rad * math.copysign(abs(c) ** (2 / n), c), rad * math.copysign(abs(s) ** (2 / n), s)))
	return out


def arc(cx, cy, r, a0, a1, n):
	return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


# ---- mark geometry (same numbers as brand/mark.js, SVG units, y down)
K, R, SW, INSET, NDASH, GAPR = 0.5, 24.0, 6.0, 12.0, 5, 0.9
A, B = INSET, 120 - INSET
S = B - A
CX = CY = A + S * K
H = SW / 2


def solid_outline():
	p = [(CX, A)]
	p += arc(B - R, A + R, R, -math.pi / 2, 0, 20)          # top-right corner
	p += arc(B - R, B - R, R, 0, math.pi / 2, 20)            # bottom-right
	p += arc(A + R, B - R, R, math.pi / 2, math.pi, 20)      # bottom-left
	p += [(A, CY)]
	return p


def dash_centerline():
	trim = SW * 0.9
	y0, x1, rr = CY - trim, CX - trim, R - H
	seg1 = [(A + H, y0), (A + H, A + R)]
	arcp = arc(A + R, A + R, rr, math.pi, 1.5 * math.pi, 40)
	seg3 = [(A + R, A + H), (x1, A + H)]
	pts = [seg1[0]]
	# densify straight parts
	for (p0, p1) in [(seg1[0], seg1[1])]:
		for i in range(1, 21):
			pts.append((p0[0] + (p1[0] - p0[0]) * i / 20, p0[1] + (p1[1] - p0[1]) * i / 20))
	pts += arcp[1:]
	for i in range(1, 21):
		pts.append((seg3[0][0] + (seg3[1][0] - seg3[0][0]) * i / 20, seg3[0][1]))
	return pts


def resample(path, s0, s1, n=24):
	# points along the polyline between arc lengths s0 and s1
	cum = [0.0]
	for i in range(1, len(path)):
		cum.append(cum[-1] + math.dist(path[i - 1], path[i]))

	def at(s):
		for i in range(1, len(path)):
			if cum[i] >= s:
				t = (s - cum[i - 1]) / max(1e-9, cum[i] - cum[i - 1])
				return (path[i - 1][0] + (path[i][0] - path[i - 1][0]) * t, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * t)
		return path[-1]
	return [at(s0 + (s1 - s0) * i / n) for i in range(n + 1)], cum[-1]


def stadium(center, h):
	"""closed outline around a centreline polyline, with round caps"""
	left, right = [], []
	for i, (x, y) in enumerate(center):
		x0, y0 = center[max(0, i - 1)]
		x1, y1 = center[min(len(center) - 1, i + 1)]
		dx, dy = x1 - x0, y1 - y0
		L = math.hypot(dx, dy) or 1
		nx, ny = -dy / L, dx / L
		left.append((x + nx * h, y + ny * h))
		right.append((x - nx * h, y - ny * h))
	(xa, ya), (xb, yb) = center[0], center[1]
	(xc, yc), (xd, yd) = center[-2], center[-1]
	ang_end = math.atan2(yd - yc, xd - xc)
	ang_start = math.atan2(yb - ya, xb - xa)
	cap_end = arc(xd, yd, h, ang_end + math.pi / 2, ang_end - math.pi / 2, 12)[1:-1]
	cap_start = arc(xa, ya, h, ang_start - math.pi / 2, ang_start - 1.5 * math.pi, 12)[1:-1]
	return left + cap_end + list(reversed(right)) + cap_start


# ---- scene units: icon is 2.0 wide; mark box (96 svg units) = 62% of the icon
ICON_R = 1.0
MS = (0.62 * 2 * ICON_R) / S


def to3(p):
	return ((p[0] - 60) * MS, -(p[1] - 60) * MS)


body_mat = mat('body', BODY, 0.22, coat=1.0, coat_rough=0.035, spec=0.6)
orange_mat = mat('orange', ORANGE, 0.32, coat=0.5, coat_rough=0.1, spec=0.5)
white_mat = mat('dash', '#F4F2ED', 0.38, coat=0.3, coat_rough=0.12)

prism('icon', squircle(ICON_R), 0, THICK, 0.06, 14, body_mat)
TOP = THICK
prism('tile', [to3(p) for p in solid_outline()], TOP - 0.01, TOP + 0.05, 0.018, 8, orange_mat)
center = dash_centerline()
_, total = resample(center, 0, 1, 2)
d = total / (NDASH + GAPR * (NDASH - 1))
g = GAPR * d
for i in range(NDASH):
	s0 = i * (d + g) + H
	s1 = s0 + d - SW
	pts, _ = resample(center, s0, max(s0 + 0.01, s1), 16)
	prism(f'dash{i}', [to3(p) for p in stadium(pts, H)], TOP - 0.01, TOP + 0.03, 0.01, 5, white_mat)

# ---- shadow catcher floor
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, 0))
floor = bpy.context.active_object
floor.is_shadow_catcher = True

# ---- world + lights
world = bpy.data.worlds.new('w')
sc.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = hexcol('#1a1a1e')
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35


def area(name, loc, look_at, size, power, color='#ffffff', shape='RECTANGLE', size_y=None):
	ld = bpy.data.lights.new(name, 'AREA')
	ld.energy = power
	ld.shape = shape
	ld.size = size
	if size_y is not None:
		ld.size_y = size_y
	ld.color = hexcol(color)[:3]
	ob = link(name, ld)
	ob.location = loc
	ob.rotation_euler = (Vector(look_at) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
	return ob


area('key', (-3.6, -3.4, 5.6), (0, 0, 0), 6.0, float(args.get('pk', 700)), '#FFF6EE', 'RECTANGLE', 4.0)
area('top', (0.4, 1.6, 7.0), (0, 0, 0), 8.0, float(args.get('pt', 380)), '#FFFFFF', 'RECTANGLE', 3.0)
area('rim', (3.0, 4.0, 1.8), (0, 0, 0.2), 4.0, float(args.get('pr', 200)), '#E4EAFF', 'RECTANGLE', 1.2)
area('fill', (4.4, -2.4, 2.2), (0, 0, 0.2), 3.5, float(args.get('pf', 110)), '#FFE7DC')

# ---- camera
cd = bpy.data.cameras.new('cam')
cam = link('cam', cd)
sc.camera = cam
if VIEW == 'front':
	cd.type = 'ORTHO'
	cd.ortho_scale = 2.55
	cam.location = (0, 0, 8)
	cam.rotation_euler = (0, 0, 0)
	floor.hide_render = True
else:
	cd.lens = 85
	cd.sensor_width = 36
	dist = 9.0
	el = math.radians(TILT)
	az = math.radians(ROTZ)
	cam.location = (dist * math.cos(el) * math.sin(az), -dist * math.cos(el) * math.cos(az), dist * math.sin(el) + 0.1)
	target = Vector((0, 0, 0.12))
	cam.rotation_euler = (target - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()
	cd.dof.use_dof = True
	cd.dof.focus_distance = (target - Vector(cam.location)).length
	cd.dof.aperture_fstop = 5.6

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
