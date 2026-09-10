"""Deterministically crop team artwork; flood-fill only exterior white pixels.

Usage: python scripts/prepare_intro_assets.py /path/to/team-reference-directory
Requires Pillow (asset preparation only, not site runtime).
"""
from collections import deque
from pathlib import Path
import argparse
import hashlib
import json
from shutil import copyfile
from PIL import Image


def cutout(image):
    image = image.convert('RGBA')
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue = deque()
    def enqueue(x, y):
        index = y * width + x
        if not visited[index] and min(pixels[x, y][:3]) > 235:
            visited[index] = 1
            queue.append((x, y))
    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)
    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)
    box = image.getchannel('A').getbbox()
    return image.crop(box), box


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    output = Path(__file__).resolve().parents[1] / 'static/assets/intro'
    output.mkdir(parents=True, exist_ok=True)
    manifest = []
    for source in sorted(args.source.glob('fish-*.jpg')):
        image, box = cutout(Image.open(source))
        image.save(output / (source.stem + '.png'), optimize=True)
        manifest.append(dict(source=source.name, sha256=hashlib.sha256(source.read_bytes()).hexdigest(), crop=box, size=image.size))
    source = args.source / 'visual-system-reference.jpg'
    # The homepage now consumes the untouched reference, cropped only by its
    # web viewport. Keep the older derivatives below for historical drafts.
    copyfile(source, output / source.name)
    manifest.append(dict(source=source.name, output=source.name, sha256=hashlib.sha256(source.read_bytes()).hexdigest(), usage='Original bytes; website viewport shows left 712 of 1241 pixels'))
    image = Image.open(source)
    # Only the illustrated left field, never the design annotations on the right.
    box = (0, 0, round(image.width * .574), image.height)
    image.crop(box).save(output / 'neural-reference.jpg', quality=95)
    manifest.append(dict(source=source.name, sha256=hashlib.sha256(source.read_bytes()).hexdigest(), crop=box))
    detail = (round(image.width*420/1241), 0, round(image.width*710/1241), round(image.height*390/1080))
    image.crop(detail).save(output / 'brain-folds.png', optimize=True)
    manifest.append(dict(source=source.name, output='brain-folds.png', crop=detail))
    (output / 'provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Prepared {len(manifest)} team-art derivatives in {output}')


if __name__ == '__main__':
    main()
