#!/usr/bin/env python3
"""Compose Figure 1 with the original overview and the Python-drawn delivery SVG.

The existing four-module panel remains an embedded PNG. The delivery panel and
connecting arrow are vector paths/text; neither input file is modified.
The lower panel receives a subtle display blur to match the raster panel's
softer edges; the standalone delivery SVG stays sharp and fully editable.
Run draw_delivery_overview.py first, then this script. Python standard library only.
"""

import base64
from pathlib import Path
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets/images"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)


def compose():
    original = ASSETS / "orca-model-overview-v17.png"
    delivery = ET.parse(ASSETS / "whole-body-delivery-overview.svg").getroot()
    width = 1600
    original_height = width * 993 / 1584
    lower_y = original_height + 44
    lower_scale = 0.82
    lower_x = width * (1 - lower_scale) / 2
    view_box = [float(value) for value in delivery.attrib["viewBox"].split()]
    assert view_box[:3] == [0, 0, width], "Delivery panel must share the 1600-unit width"
    height = lower_y + view_box[3] * lower_scale
    input_x = lower_x + float(delivery.attrib["data-input-x"]) * lower_scale
    input_y = lower_y + float(delivery.attrib["data-input-y"]) * lower_scale
    cycle_y = original_height * 963 / 993
    assert input_y > cycle_y + 60
    delivery.tag = f"{{{NS}}}g"
    delivery.attrib.clear()
    delivery.set("transform", f"translate({lower_x:.3f} {lower_y:.3f}) scale({lower_scale})")
    delivery.set("filter", "url(#delivery-display-softness)")
    lower_markup = ET.tostring(delivery, encoding="unicode")
    encoded = base64.b64encode(original.read_bytes()).decode("ascii")
    arrow = (
        f"M {input_x - 22} {cycle_y:.3f} H {input_x + 22} "
        f"V {input_y - 40:.3f} H {input_x + 46} L {input_x} {input_y:.3f} "
        f"L {input_x - 46} {input_y - 40:.3f} H {input_x - 22} Z"
    )
    result = f'''<svg xmlns="{NS}" width="1600" height="{height:.3f}" viewBox="0 0 1600 {height:.3f}" role="img" aria-labelledby="combined-title combined-desc">
  <title id="combined-title">ORCA model overview</title>
  <desc id="combined-desc">The four-module design and validation cycle is connected by a broad arrow to Modeling data in the whole-body delivery overview. Modeling data connects only to the RNA product composition panel at lower right. The other panels show systemic distribution, barrier and expression, and tissue coverage.</desc>
  <defs>
    <linearGradient id="cycle-data-arrow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#70c5e8"/><stop offset="1" stop-color="#2376b5"/></linearGradient>
    <filter id="delivery-display-softness" x="-1%" y="-1%" width="102%" height="102%" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="0.8"/>
    </filter>
  </defs>
  <rect width="1600" height="{height:.3f}" fill="white"/>
  <image x="0" y="0" width="1600" height="{original_height:.3f}" href="data:image/png;base64,{encoded}"/>
  {lower_markup}
  <path id="cycle-to-modeling-data" d="{arrow}" fill="url(#cycle-data-arrow)" stroke="#216caa" stroke-width="1.5" stroke-linejoin="round"/>
</svg>
'''
    destination = ASSETS / "orca-model-overview-combined.svg"
    destination.write_text(result, encoding="utf-8")
    ET.parse(destination)
    print(f"Wrote {destination.relative_to(ROOT)} ({width} × {height:.3f})")


if __name__ == "__main__":
    compose()
