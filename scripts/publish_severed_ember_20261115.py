#!/usr/bin/env python3
"""Publish the three approved 2026-11-15 unit plates and archive displaced art."""
import base64
import io
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from PIL import Image

root = Path("severed-ember")
assets = root / "assets/organization"
stage = assets / "_staging-20261115"
out = assets / "approved-20261115"
out.mkdir(parents=True, exist_ok=True)

parts = [stage / f"banished-ash-knights-heavy.png.base64.part{i}" for i in range(1, 5)]
assert all(p.is_file() for p in parts), "Missing approved bonewhite PNG staging parts"
heavy_bytes = base64.b64decode("".join(p.read_text(encoding="ascii").strip() for p in parts), validate=True)
images = {
    "ember-guard-ten-20261115.webp": stage / "ember-guard-ten.png",
    "banished-ash-knights-heavy-20261115.webp": io.BytesIO(heavy_bytes),
    "crucible-knights-four-phase-20261115.webp": stage / "crucible-knights-four-phase.png",
}
for name, source in images.items():
    with Image.open(source) as im:
        im.load()
        assert im.size == (2172, 724), f"{name}: expected 3:1 2172x724, got {im.size}"
        im.convert("RGB").save(out / name, "WEBP", quality=88, method=6)
        print("APPROVED", name, (out / name).stat().st_size, "bytes")

# Preserve the precise pre-replacement images as user-downloadable originals.
old = {
    "旧图/01-余火守卫-四人小组.webp": assets / "approved-20261115/ember-guard-four-person-3x1.webp",
    "旧图/02-灰烬失乡骑士-狭阵决斗.webp": assets / "panoramas-20261114/03-banished-knights.webp",
}
assert all(p.is_file() for p in old.values()), "A displaced original is missing"
backup = root / "backups/20261115-replaced-originals.zip"
backup.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(backup, "w", ZIP_DEFLATED, compresslevel=6) as z:
    for label, path in old.items():
        z.write(path, label)
    z.writestr("说明.txt", "破碎余烬隐修会：2026-11-15 替换前原图归档。\n"
               "01 余火守卫原四人小组图；02 灰烬失乡骑士原狭阵决斗图。\n"
               "巡礼骑士原无独立配图，本轮为新增，不存在被替换旧图。\n")

new_guard = "assets/organization/approved-20261115/ember-guard-ten-20261115.webp"
new_banished = "assets/organization/approved-20261115/banished-ash-knights-heavy-20261115.webp"
new_crucible = "assets/organization/approved-20261115/crucible-knights-four-phase-20261115.webp"
anchor = "有人在任务后再没回到原来的编制。</p>"

for page in [root / "index.html", root / "chapters/03-organization.html"]:
    s = page.read_text(encoding="utf-8")
    def change(old, new, count):
        global s
        found = s.count(old)
        assert found == count, f"{page} expected {count} occurrences of {old!r}, found {found}"
        s = s.replace(old, new)
    change("assets/organization/approved-20261115/ember-guard-four-person-3x1.webp", new_guard, 2)
    change('data-approved-art="20261115-ember-guard-four-person"', 'data-approved-art="20261115-ember-guard-ten"', 1)
    change("四名余烬绿动力甲的余火守卫穿骨白兜帽和罩袍，分别持双枪、鹤嘴锄与盾、钉锤与盾及爆弹枪",
           "十名余烬绿动力甲余火守卫持红色爆弹枪列阵，全部佩戴制式封闭头盔", 1)
    if "四人守线小队：双枪、鹤嘴锄与盾、钉锤与盾、爆弹枪；均佩戴兜帽罩袍" in s:
        change("四人守线小队：双枪、鹤嘴锄与盾、钉锤与盾、爆弹枪；均佩戴兜帽罩袍",
               "十人完整战斗小组 · 余烬绿制式动力甲与爆弹枪 · 3:1 正式图版", 1)
    change("assets/organization/panoramas-20261114/03-banished-knights.webp", new_banished, 2)
    change('data-editorial-art="03-banished-knights"', 'data-approved-art="20261115-banished-ash-heavy"', 1)
    change("红披风失乡骑士持动力剑，在破败要塞与混沌重甲敌人进行近距离决斗",
           "骨白重甲灰烬失乡骑士在哥特废墟列阵，全员使用星际战士重型火器", 1)
    change("灰烬失乡骑士 · 狭阵决斗", "灰烬失乡骑士 · 骨白重火力小队", 2)
    if "3:1 横向场景插画 · 依据 V3.7 章节内容绘制" in s:
        change("<strong>战团构成图版｜灰烬失乡骑士 · 骨白重火力小队</strong><span>3:1 横向场景插画 · 依据 V3.7 章节内容绘制</span>",
               "<strong>战团构成图版｜灰烬失乡骑士 · 骨白重火力小队</strong><span>3:1 正式图版 · 骨白装甲 · 全员重武器</span>", 1)
    prefix = "../" if "chapters/" in str(page) else ""
    figure = (
        '<figure class="archive-plate org-panoramic-plate" data-approved-art="20261115-crucible-four">'
        '<a href="' + prefix + new_crucible + '" target="_blank" rel="noopener noreferrer" '
        'aria-label="查看巡礼骑士四人小队3:1正式图版">'
        '<img src="' + prefix + new_crucible + '" '
        'alt="四名暗黑天使风格深绿动力甲巡礼骑士，戴制式封闭头盔；一名持灰骑士式灵能长戟，另三名持剑与相位剑盾，背部有圣典与圣物装饰" '
        'width="2172" height="724" loading="lazy" decoding="async"></a>'
        '<figcaption><strong>战团构成图版｜巡礼骑士 · 四人剑盾与长戟</strong>'
        '<span>3:1 正式图版 · 一柄灰骑士式长戟 · 三名剑盾骑士 · 圣典背饰</span>'
        '</figcaption></figure>'
    )
    change(anchor, anchor + figure, 1)
    page.write_text(s, encoding="utf-8")
    print("UPDATED", page)

for p in stage.glob("*"):
    if p.is_file():
        p.unlink()
print("BACKUP", backup, backup.stat().st_size, "bytes")
