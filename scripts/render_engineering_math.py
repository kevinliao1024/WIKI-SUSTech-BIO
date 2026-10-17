"""Compile supplied TeX to native MathML for the Engineering Markdown import.

This is an import-time helper; the website requires no math JavaScript runtime.
Uses an existing Pandoc executable (validated with Pandoc 3.10.2).
"""

import argparse
import json
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET


MATH = re.compile(r"\$\$(.*?)\$\$|(?<!\\)\$([^\n$]+?)(?<!\\)\$", re.S)
NAMESPACE = "http://www.w3.org/1998/Math/MathML"
ET.register_namespace("", NAMESPACE)


def convert(source: str, pandoc: str) -> list[dict[str, str]]:
    matches = list(MATH.finditer(source))
    snippets = "\n\n".join(match.group() for match in matches)
    result = subprocess.run(
        [pandoc, "--from=markdown", "--to=html", "--mathml"],
        input=snippets, text=True, capture_output=True, check=True,
    )
    if result.stderr.strip():
        raise ValueError(f"Pandoc reported a conversion warning: {result.stderr}")
    rendered = re.findall(r"<math\b.*?</math>", result.stdout, re.S)
    if len(rendered) != len(matches):
        raise ValueError("Formula count changed during conversion")
    records = []
    for match, fragment in zip(matches, rendered):
        tex = match.group(1) if match.group(1) is not None else match.group(2)
        display = match.group(1) is not None
        element = ET.fromstring(fragment)
        annotation = element.find(f".//{{{NAMESPACE}}}annotation")
        if annotation is None or annotation.get("encoding") != "application/x-tex":
            raise ValueError("Missing original TeX annotation")
        if re.sub(r"\s+", "", annotation.text or "") != re.sub(r"\s+", "", tex):
            raise ValueError("Pandoc annotation does not match source TeX")
        annotation.text = tex
        fragment = ET.tostring(element, encoding="unicode")
        # Python-Markdown must not interpret underscores, backslashes or stars
        # in an inline annotation. Character references retain the exact text.
        fragment = re.sub(
            r'(<annotation\b[^>]*>).*?(</annotation>)',
            lambda m: m[1] + "".join(f"&#{ord(c)};" for c in tex) + m[2],
            fragment, flags=re.S,
        )
        tag, css = ("div", "engineering-equation") if display else ("span", "engineering-math")
        output = f'<{tag} class="{css}">{fragment}</{tag}>'
        # The stored, entity-encoded annotation decodes to the supplied TeX.
        assert ET.fromstring(fragment).find(f".//{{{NAMESPACE}}}annotation").text == tex
        records.append({"source": match.group(), "tex": tex, "mode": "display" if display else "inline", "html": output})
    return records


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--pandoc", default="pandoc")
    args = parser.parse_args()
    records = convert(args.source.read_text(), args.pandoc)
    with args.output.open("x") as handle:
        json.dump(records, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    print(json.dumps({"display": sum(r["mode"] == "display" for r in records), "inline": sum(r["mode"] == "inline" for r in records)}))
