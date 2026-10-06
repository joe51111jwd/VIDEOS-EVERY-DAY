# Shared Blender helpers for the Riff v5 product renders (Cycles, CPU).
import math
import bpy
import bmesh
from mathutils import Vector, Euler


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.01
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 8
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.threads_mode = 'AUTO'
    return sc


def hexcol(h, a=1.0):
    h = h.lstrip('#')
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return (*lin, a)


def link_obj(name, mesh):
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def revolve(name, profile, segs=160, mat_of_edge=None):
    """Revolve a list of (r, z) points (metres) around Z. r == 0 points become poles."""
    bm = bmesh.new()
    rings = []
    for (r, z) in profile:
        if r <= 1e-7:
            rings.append([bm.verts.new((0, 0, z))])
        else:
            rings.append([bm.verts.new((r * math.cos(2 * math.pi * k / segs), r * math.sin(2 * math.pi * k / segs), z))
                          for k in range(segs)])
    for j in range(len(rings) - 1):
        a, b = rings[j], rings[j + 1]
        mi = mat_of_edge(j) if mat_of_edge else 0
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
            f.material_index = mi
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = link_obj(name, me)
    return ob


def subsurf(ob, level=2):
    m = ob.modifiers.new('sub', 'SUBSURF')
    m.levels = 1
    m.render_levels = level
    return m


def principled(name, color='#ffffff', rough=0.5, metal=0.0, coat=0.0, coat_rough=0.05, spec=0.5, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    b = mat.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexcol(color)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = coat_rough
    b.inputs['Specular IOR Level'].default_value = spec
    b.inputs['Alpha'].default_value = alpha
    return mat


def nodes(mat):
    return mat.node_tree.nodes, mat.node_tree.links


def box(name, size, loc, bevel=0.0, segments=4, mat=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link_obj(name, me)
    ob.location = loc
    if bevel > 0:
        m = ob.modifiers.new('bev', 'BEVEL')
        m.width = bevel
        m.segments = segments
        m.limit_method = 'NONE'
        for p in me.polygons:
            p.use_smooth = True
        m.harden_normals = False
    if mat:
        me.materials.append(mat)
    return ob


def plane(name, size, loc, rot=(0, 0, 0), mat=None):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    # simple planar UVs
    uv = me.uv_layers.new()
    for loop in me.loops:
        co = me.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (co.x / size[0] + 0.5, co.y / size[1] + 0.5)
    ob = link_obj(name, me)
    ob.location = loc
    ob.rotation_euler = rot
    if mat:
        me.materials.append(mat)
    return ob


def camera(loc, look_at, lens=85, fstop=None, focus_obj=None, focus_dist=None, sensor=36):
    cd = bpy.data.cameras.new('cam')
    cd.lens = lens
    cd.sensor_width = sensor
    cam = bpy.data.objects.new('cam', cd)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    d = Vector(look_at) - Vector(loc)
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    if fstop:
        cd.dof.use_dof = True
        cd.dof.aperture_fstop = fstop
        if focus_obj:
            cd.dof.focus_object = focus_obj
        elif focus_dist:
            cd.dof.focus_distance = focus_dist
        else:
            cd.dof.focus_distance = d.length
    bpy.context.scene.camera = cam
    return cam


def sun(direction_deg_az, elevation_deg, strength=4.0, color='#FFE2BF', angle_deg=1.0):
    ld = bpy.data.lights.new('sun', 'SUN')
    ld.energy = strength
    ld.color = hexcol(color)[:3]
    ld.angle = math.radians(angle_deg)
    ob = bpy.data.objects.new('sun', ld)
    bpy.context.scene.collection.objects.link(ob)
    az, el = math.radians(direction_deg_az), math.radians(elevation_deg)
    # direction the light travels FROM (az measured from +X toward +Y)
    src = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el)))
    ob.rotation_euler = (-src).to_track_quat('-Z', 'Y').to_euler()
    return ob, src


def world(color='#B9C6D6', strength=0.35):
    w = bpy.data.worlds.new('world')
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = hexcol(color)
    bg.inputs['Strength'].default_value = strength
    bpy.context.scene.world = w
    return w


def area(loc, look_at, size=1.0, strength=50, color='#FFFFFF', shape='RECTANGLE', size_y=None):
    ld = bpy.data.lights.new('area', 'AREA')
    ld.energy = strength
    ld.color = hexcol(color)[:3]
    ld.shape = shape
    ld.size = size
    if size_y:
        ld.size_y = size_y
    ob = bpy.data.objects.new('area', ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    d = Vector(look_at) - Vector(loc)
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return ob


def render(path, w, h, samples=256, transparent=False, pct=100):
    sc = bpy.context.scene
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = pct
    sc.cycles.samples = samples
    sc.render.film_transparent = transparent
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
