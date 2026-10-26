#!/usr/bin/env python3
"""Extract a reusable pixel-identical border from a locked Major Arcana image.
Input is an approved original webp; never alters it. Requires Pillow.
Usage: python extract_major_border.py --source arcana-05.webp --out ./dist
"""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

def build(src: Path, out: Path):
    out.mkdir(parents=True,exist_ok=True)
    image=Image.open(src).convert("RGBA")
    w,h=image.size
    # Conservative central paintable region. Curved shoulders and title plaques stay
    # uncut. This is a geometric *first-pass extraction*, not an approved perfect mask.
    mask=Image.new("L",(w,h),0)
    draw=ImageDraw.Draw(mask)
    shape=[(int(.105*w),int(.165*h)),(int(.135*w),int(.125*h)),
       (int(.865*w),int(.125*h)),(int(.895*w),int(.165*h)),
       (int(.895*w),int(.790*h)),(int(.85*w),int(.815*h)),
       (int(.15*w),int(.815*h)),(int(.105*w),int(.790*h))]
    draw.polygon(shape,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(max(2,w//450)))
    border=image.copy()
    border.putalpha(Image.frombytes("L",(w,h),bytes(255-v for v in mask.tobytes())))
    border.save(out/"major-border-extracted-preview.png",optimize=True)
    # white = paintable image area, black = original frame preserved
    mask.save(out/"major-artwork-window-preview.png",optimize=True)
    manifest={"source":str(src),"sha256":hashlib.sha256(src.read_bytes()).hexdigest(),
      "size":[w,h],"extraction":"PREVIEW_REQUIRES_MANUAL_QA",
      "warning":"Original title and image pixels remain wherever mask is black. Refine mask against multiple originals before production.",
      "artwork_polygon_normalized":[[round(x/w,5),round(y/h,5)] for x,y in shape]}
    (out/"manifest.json").write_text(json.dumps(manifest,indent=2),encoding="utf8")
if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--source",type=Path,required=True)
    p.add_argument("--out",type=Path,default=Path("dist"))
    a=p.parse_args();build(a.source,a.out)
