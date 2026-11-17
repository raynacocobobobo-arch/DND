#!/usr/bin/env python3
"""Build iOS/Android home-screen icons from the existing approved chapter crest.

No artwork is redrawn or replaced. Crop transparent padding and center the visible
crest on a dark solid canvas so iOS doesn't apply a white background.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRANDING = ROOT / "severed-ember" / "assets" / "branding"
SOURCE = BRANDING / "cenobium-crest-transparent-20261117.webp"
BACKGROUND = (14, 25, 22, 255)
SIZES = (180, 192, 512)

def main():
    with Image.open(SOURCE) as im:
        rgba = im.convert("RGBA")
    alpha = rgba.getchannel("A")
    visible = alpha.point(lambda value: 255 if value > 8 else 0)
    bbox = visible.getbbox()
    if bbox is None:
        raise RuntimeError("The approved crest appears to be fully transparent")
    emblem = rgba.crop(bbox)
    print("Source:", SOURCE, "dimensions:", rgba.size, "visible bounds:", bbox)
    for size in SIZES:
        canvas = Image.new("RGBA", (size, size), BACKGROUND)
        max_side = round(size * 0.82)
        scale = min(max_side / emblem.width, max_side / emblem.height)
        w = max(1, round(emblem.width * scale))
        h = max(1, round(emblem.height * scale))
        scaled = emblem.resize((w, h), Image.Resampling.LANCZOS)
        canvas.alpha_composite(scaled, ((size-w)//2, (size-h)//2))
        output = BRANDING / f"ember-home-icon-{size}-20261117.png"
        canvas.convert("RGB").save(output, format="PNG", optimize=True)
        with Image.open(output) as check:
            check.verify()
        with Image.open(output) as check:
            assert check.size == (size, size) and check.format == "PNG"
        print(f"Generated {output}: {size}x{size}, centered approved crest, {output.stat().st_size} bytes")

if __name__ == "__main__":
    main()
