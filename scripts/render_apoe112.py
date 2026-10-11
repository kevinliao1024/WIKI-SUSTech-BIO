"""Offline, coordinate-derived APOE112 plates; run in Blender's background Python.

Blender --background --python scripts/render_apoe112.py -- --out /tmp/orca-render
The ribbon is a smooth C-alpha trace (not an atomistic surface). Side-chain
heavy atoms and bonds come from the deposited coordinates. No missing loop is
invented. Both entries use one C-alpha alignment, projection and scale.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--out', type=Path, required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
args.out.mkdir(parents=True, exist_ok=True)


def read_entry(pdb):
    atoms = {}
    helices = []
    for line in (ROOT / f'assets/figures/apoe112/source/{pdb}.pdb').read_text().splitlines():
        if line.startswith('HELIX'):
            helices.append((int(line[21:25]), int(line[33:37])))
        if not line.startswith('ATOM') or line[21] != 'A' or line[16] not in ' A':
            continue
        residue = int(line[22:26])
        if not 23 <= residue <= 162:
            continue
        atom = line[12:16].strip()
        atoms.setdefault(residue, {})[atom] = np.array([float(line[i:i+8]) for i in (30, 38, 46)])
    return atoms, helices


e4, helices4 = read_entry('1B68')
e3, helices3 = read_entry('1LPE')
shared = sorted(set(e4) & set(e3))
alignment_residues = [i for i in shared if 42 <= i <= 160]
ref = np.array([e4[i]['CA'] for i in alignment_residues])
mobile = np.array([e3[i]['CA'] for i in alignment_residues])
ref_center, mobile_center = ref.mean(0), mobile.mean(0)
u, s, vt = np.linalg.svd((mobile-mobile_center).T @ (ref-ref_center))
rotation = u @ np.diag([1, 1, np.linalg.det(u @ vt)]) @ vt
for residue in e3.values():
    for atom, xyz in residue.items():
        residue[atom] = (xyz-mobile_center) @ rotation + ref_center
rmsd = float(np.sqrt(np.mean(np.sum(((mobile-mobile_center) @ rotation - (ref-ref_center))**2, axis=1))))

# View the bundle along the outward direction of residue 112. Keep the long
# axis nearly vertical; the same projection is applied to both entries.
_, _, vt = np.linalg.svd(ref-ref_center)
y = vt[0]
if y[2] < 0:
    y = -y
z = e4[112]['CB'] - np.mean([e4[i]['CA'] for i in range(106, 119)], axis=0)
z -= y * np.dot(z, y)
z /= np.linalg.norm(z)
x = np.cross(y, z)
x /= np.linalg.norm(x)
angle = math.radians(32)
x, z = x*math.cos(angle)+z*math.sin(angle), z*math.cos(angle)-x*math.sin(angle)
basis = np.column_stack([x, y, z])
for entry in (e4, e3):
    for residue in entry.values():
        for atom, xyz in residue.items():
            residue[atom] = (xyz-ref_center) @ basis


def linear_color(hex_value):
    v = [int(hex_value[i:i+2], 16)/255 for i in (0, 2, 4)]
    return [x/12.92 if x < .04045 else ((x+.055)/1.055)**2.4 for x in v]


def material(name, color, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*linear_color(color), 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = m.diffuse_color
    p.inputs['Roughness'].default_value = .38
    p.inputs['Metallic'].default_value = .08
    p.inputs['Emission Color'].default_value = m.diffuse_color
    p.inputs['Emission Strength'].default_value = emission
    return m


def tube(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new('POLY')
    spline.points.add(len(points)-1)
    for p, xyz in zip(spline.points, points):
        p.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    return obj


def sphere(name, xyz, radius, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=radius, location=xyz)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    for poly in obj.data.polygons:
        poly.use_smooth = True


def smooth_trace(points, samples=10):
    points = [points[0], *points, points[-1]]
    out = []
    for i in range(1, len(points)-2):
        a, b, c, d = points[i-1:i+3]
        for t in np.linspace(0, 1, samples, endpoint=False):
            out.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    out.append(points[-2])
    return np.array(out)


def ribbon(entry, start, end, mat):
    ids = [i for i in range(start, end+1) if i in entry]
    if len(ids) < 3:
        return
    points = smooth_trace([entry[i]['CA'] for i in ids])
    # Approximate local helix axis by a sliding mean, then orient the ribbon
    # radially. This retains the C-alpha winding without claiming an atomistic
    # surface. Ends taper; a solidify modifier gives readable ribbon edges.
    vertices, faces = [], []
    for i, p in enumerate(points):
        tangent = points[min(i+1, len(points)-1)]-points[max(0, i-1)]
        tangent /= np.linalg.norm(tangent)
        radial = p-points[max(0, i-18):min(len(points), i+19)].mean(0)
        width_dir = np.cross(tangent, radial)
        if np.linalg.norm(width_dir) < 1e-6:
            width_dir = np.cross(tangent, [0, 0, 1])
        width_dir /= np.linalg.norm(width_dir)
        half_width = .9 * min(1, .25+i/12, .25+(len(points)-1-i)/12)
        vertices.extend([p-width_dir*half_width, p+width_dir*half_width])
        if i:
            j = i*2
            faces.append((j-2, j, j+1, j-1))
    mesh = bpy.data.meshes.new('C-alpha helical ribbon')
    mesh.from_pydata(vertices, [], faces)
    obj = bpy.data.objects.new('Reference backbone', mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    modifier = obj.modifiers.new('Ribbon thickness', 'SOLIDIFY')
    modifier.thickness = .18
    for poly in mesh.polygons:
        poly.use_smooth = True


def backbone(entry, helices, mat):
    helix_ids = set()
    for start, end in helices:
        start, end = max(23, start), min(162, end)
        ribbon(entry, start, end, mat)
        helix_ids.update(range(start, end+1))
    group = []
    previous = None
    for i in sorted(entry):
        # Missing residues split the trace instead of inventing a connection.
        if previous is not None and (i-previous != 1 or np.linalg.norm(entry[i]['CA']-entry[previous]['CA']) > 4.5):
            if len(group) > 1:
                tube('Observed loop', smooth_trace(group), .22, mat)
            group = []
        if i not in helix_ids or (previous is not None and previous not in helix_ids):
            if not group and previous is not None and i-previous == 1:
                group.append(entry[previous]['CA'])
            group.append(entry[i]['CA'])
        elif group:
            group.append(entry[i]['CA'])
            if len(group) > 1:
                tube('Observed loop', smooth_trace(group), .22, mat)
            group = []
        previous = i
    if len(group) > 1:
        tube('Observed loop', smooth_trace(group), .22, mat)


def sidechain(entry, pdb, highlight, muted, close=False):
    residue = entry[112]
    bonds = [('CA','CB')]
    if pdb == '1B68':
        bonds += [('CB','CG'),('CG','CD'),('CD','NE'),('NE','CZ'),('CZ','NH1'),('CZ','NH2')]
    else:
        bonds += [('CB','SG')]
    if close:
        bonds += [('N','CA'),('CA','C'),('C','O')]
    for a, b in bonds:
        is_backbone = a in ('N','C') or b in ('N','C','O')
        tube(f'{a}—{b}', [residue[a], residue[b]], .16 if close else .21, muted if is_backbone else highlight)
    for name, p in residue.items():
        if name in ('N','C','O') and not close:
            continue
        mat = muted if name in ('N','C','O') else highlight
        sphere(name, p, (.4 if close else .44) if name != 'SG' else .52, mat)


def light(name, loc, power, size):
    bpy.ops.object.light_add(type='AREA', location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.energy, obj.data.shape, obj.data.size = power, 'DISK', size
    obj.rotation_euler = (Vector((0, 0, 0))-obj.location).to_track_quat('-Z','Y').to_euler()


metadata = {'alignment': {'method': 'Kabsch, observed shared C-alpha atoms, chain A, residues 42–160', 'count': len(alignment_residues), 'rmsd_angstrom': round(rmsd, 4)}, 'representation': 'Smooth C-alpha ribbon; deposited heavy-atom sidechain; missing loops omitted', 'display_residue_range': '23–162 (observed only)', 'images': {}}
for pdb, entry, helices in [('1B68',e4,helices4), ('1LPE',e3,helices3)]:
    for close in (False, True):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        scene = bpy.context.scene
        scene.render.engine = 'CYCLES'
        scene.cycles.samples = 24
        scene.cycles.use_denoising = True
        scene.render.film_transparent = True
        scene.render.resolution_x, scene.render.resolution_y = (1200,1600) if not close else (1200,900)
        scene.render.resolution_percentage = 100
        scene.render.image_settings.file_format = 'PNG'
        scene.render.image_settings.color_mode = 'RGBA'
        scene.view_settings.view_transform = 'Standard'
        world = bpy.data.worlds.new('Soft studio')
        world.use_nodes = True
        world.node_tree.nodes['Background'].inputs[0].default_value = (1,1,1,1)
        world.node_tree.nodes['Background'].inputs[1].default_value = .6
        scene.world = world
        muted = material('Muted blue grey', 'A7B2C4')
        highlight = material('ORCA coral — residue 112 only', 'F58F9C', .14)
        if not close:
            backbone(entry, helices, muted)
        sidechain(entry, pdb, highlight, muted, close)
        bundle = np.array([r['CA'] for r in e4.values()])
        bundle_center = (bundle.min(0)+bundle.max(0))/2
        target = (e4[112]['CA'] + np.array([1,0,0])) if close else bundle_center
        bpy.ops.object.camera_add(location=target+np.array([0,0,160]))
        camera = bpy.context.object
        camera.rotation_euler = (0,0,0)
        camera.data.type = 'ORTHO'
        camera.data.ortho_scale = 17 if close else 59
        scene.camera = camera
        light('Large key', (-30,40,75), 11000, 45)
        light('Edge light', (35,-10,40), 6000, 35)
        name = f'{pdb.lower()}-{ "sidechain" if close else "domain"}'
        scene.render.filepath = str(args.out/f'{name}.png')
        bpy.ops.render.render(write_still=True)
        # Pixel positions are recorded for an HTML annotation, never painted
        # into the coordinate render so labels stay editable and legible.
        xyz = entry[112]['CA']-target
        scale = camera.data.ortho_scale
        metadata['images'][name] = {'residue112_anchor_percent': [round(50+100*xyz[0]/scale,3), round(50-100*xyz[1]/(scale*scene.render.resolution_y/scene.render.resolution_x),3)]}
(args.out/'render-metadata.json').write_text(json.dumps(metadata, indent=2)+'\n')
print(json.dumps(metadata, indent=2))
