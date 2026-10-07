# Photoreal sleek drinks can (Blender 5.2 bpy, Cycles CPU) with a wrapped label, rendered on a
# transparent background with a shadow catcher, so the ad can composite it on any colour.
# usage: bvenv/bin/python blender/can.py <label.png> <out.png> [w=1000] [h=1600] [samples=192] [rot=0] [tilt=4] [lens=100] [shadow=1]
import math, sys
import bpy, bmesh
from mathutils import Vector

LABEL, OUT = sys.argv[1], sys.argv[2]
args = dict(a.split('=', 1) for a in sys.argv[3:] if '=' in a)
W, H = int(args.get('w', 1000)), int(args.get('h', 1600))
SAMPLES = int(args.get('samples', 192))
ROT = float(args.get('rot', 0))
TILT = float(args.get('tilt', 4))
LENS = float(args.get('lens', 100))
SHADOW = args.get('shadow', '1') == '1'
BGLIGHT = args.get('bglight', '#ffffff')


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
sc.cycles.adaptive_threshold = 0.01
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 10
sc.cycles.glossy_bounces = 6
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.render.image_settings.color_depth = '16'
sc.view_settings.view_transform = 'Standard'
sc.view_settings.look = 'None'


def link(name, data):
	ob = bpy.data.objects.new(name, data)
	sc.collection.objects.link(ob)
	return ob


# ---- can profile (metres): sleek 355 ml-ish, radius 29 mm, height 146 mm
R = 0.029
prof = [
	(0.0, 0.006), (0.010, 0.0062), (0.017, 0.0050), (0.0205, 0.0020),          # domed base
	(0.0222, 0.0000), (0.0245, 0.0004), (0.0272, 0.0030), (0.0286, 0.0070),    # base rim
	(R, 0.0120), (R, 0.1290),                                                   # body (label)
	(0.0283, 0.1340), (0.0262, 0.1388), (0.0248, 0.1418),                       # neck
	(0.0250, 0.1440), (0.0256, 0.1452), (0.0254, 0.1462), (0.0244, 0.1464),     # rolled lip
	(0.0236, 0.1452), (0.0232, 0.1430),                                         # inner wall of the lip
	(0.0225, 0.1418), (0.0, 0.1418),                                            # lid (recessed)
]
BODY0, BODY1 = 1, None  # material split: segments fully inside the label band get the label


def revolve(name, profile, segs=192):
	bm = bmesh.new()
	rings = []
	for (r, z) in profile:
		if r <= 1e-7:
			rings.append([bm.verts.new((0, 0, z))])
		else:
			rings.append([bm.verts.new((r * math.cos(2 * math.pi * k / segs), r * math.sin(2 * math.pi * k / segs), z)) for k in range(segs)])
	uv_faces = []
	for j in range(len(rings) - 1):
		a, b = rings[j], rings[j + 1]
		on_label = profile[j][0] == R and profile[j + 1][0] == R
		for k in range(segs):
			k2 = (k + 1) % segs
			if len(a) == 1 and len(b) == 1:
				continue
			if len(a) == 1:
				f = bm.faces.new((a[0], b[k], b[k2]))
			elif len(b) == 1:
				f = bm.faces.new((a[k], b[0], a[k2]))
			else:
				f = bm.faces.new((a[k], b[k], b[k2], a[k2]))
			f.material_index = 1 if on_label else 0
			if on_label:
				uv_faces.append((f, k, j))
	bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
	uvl = bm.loops.layers.uv.new()
	z0, z1 = 0.0120, 0.1290
	for f, k, j in uv_faces:
		for loop in f.loops:
			x, y, z = loop.vert.co
			ang = math.atan2(y, x)
			u = (ang / (2 * math.pi)) % 1.0
			# seam fix: faces that straddle the seam
			if k == segs - 1 and u < 0.5:
				u += 1.0
			loop[uvl].uv = (u, (z - z0) / (z1 - z0))
	me = bpy.data.meshes.new(name)
	bm.to_mesh(me)
	bm.free()
	for p in me.polygons:
		p.use_smooth = True
	return link(name, me)


can = revolve('can', prof)

# aluminium for ends
alu = bpy.data.materials.new('alu')
alu.use_nodes = True
b = alu.node_tree.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = hexcol('#D6D7DA')
b.inputs['Metallic'].default_value = 1.0
b.inputs['Roughness'].default_value = 0.2
b.inputs['Anisotropic'].default_value = 0.6

# printed label over brushed aluminium
lab = bpy.data.materials.new('label')
lab.use_nodes = True
nt = lab.node_tree
b = nt.nodes['Principled BSDF']
img = nt.nodes.new('ShaderNodeTexImage')
img.image = bpy.data.images.load(LABEL)
img.interpolation = 'Cubic'
img.extension = 'REPEAT'
nt.links.new(img.outputs['Color'], b.inputs['Base Color'])
b.inputs['Metallic'].default_value = 0.55
b.inputs['Roughness'].default_value = 0.26
b.inputs['Coat Weight'].default_value = 0.55
b.inputs['Coat Roughness'].default_value = 0.06
b.inputs['Specular IOR Level'].default_value = 0.55
can.data.materials.append(alu)
can.data.materials.append(lab)

# pull tab (simple rounded plate + rivet), slightly lifted from the lid
bm = bmesh.new()
pts = []
for i in range(64):
	t = 2 * math.pi * i / 64
	pts.append((0.0105 * math.cos(t), 0.0068 * math.sin(t)))
v = [bm.verts.new((x + 0.006, y, 0.1423)) for x, y in pts]
bm.faces.new(v)
ret = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
for e in ret['geom']:
	if isinstance(e, bmesh.types.BMVert):
		e.co.z += 0.0007
me = bpy.data.meshes.new('tab')
bm.to_mesh(me)
bm.free()
tab = link('tab', me)
tab.data.materials.append(alu)
bev = tab.modifiers.new('bev', 'BEVEL')
bev.width = 0.0003
bev.segments = 3

can.rotation_euler = (0, 0, math.radians(ROT + 90))   # label front (u=0.5) faces the camera at rot=0
tab.rotation_euler = can.rotation_euler

# ---- floor (shadow catcher)
bpy.ops.mesh.primitive_plane_add(size=3, location=(0, 0, 0))
floor = bpy.context.active_object
floor.is_shadow_catcher = True
floor.hide_render = not SHADOW

# ---- light: studio strips (the vertical highlights that make a can read as metal)
world = bpy.data.worlds.new('w')
sc.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = hexcol('#f2f0ec')
world.node_tree.nodes['Background'].inputs['Strength'].default_value = float(args.get('world', 0.3))


def area(name, loc, look_at, sx, sy, power, color='#ffffff'):
	ld = bpy.data.lights.new(name, 'AREA')
	ld.shape = 'RECTANGLE'
	ld.size, ld.size_y = sx, sy
	ld.energy = power
	ld.color = hexcol(color)[:3]
	ob = link(name, ld)
	ob.location = loc
	ob.rotation_euler = (Vector(look_at) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
	return ob


area('stripL', (-0.22, -0.16, 0.08), (0, 0, 0.07), 0.05, 0.42, float(args.get('pl', 1.6)), '#FFFFFF')
area('stripR', (0.24, -0.10, 0.08), (0, 0, 0.07), 0.04, 0.42, float(args.get('pr', 1.1)), '#FFF3EA')
area('key', (-0.35, -0.55, 0.45), (0, 0, 0.06), 0.5, 0.5, float(args.get('pk', 4.0)), '#FFF8F0')
area('top', (0.0, 0.05, 0.55), (0, 0, 0.1), 0.4, 0.4, float(args.get('pt', 1.5)))
area('back', (0.0, 0.40, 0.20), (0, 0, 0.07), 0.6, 0.3, float(args.get('pb', 1.5)), BGLIGHT)

# ---- camera: low, slightly up at the can (hero angle)
cd = bpy.data.cameras.new('cam')
cd.lens = LENS
cam = link('cam', cd)
sc.camera = cam
target = Vector((0, 0, 0.073))
dist = 0.62 * (LENS / 100)
el = math.radians(TILT)
cam.location = (0, -dist * math.cos(el), 0.073 + dist * math.sin(el))
cam.rotation_euler = (target - Vector(cam.location)).to_track_quat('-Z', 'Y').to_euler()

sc.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print('wrote', OUT)
