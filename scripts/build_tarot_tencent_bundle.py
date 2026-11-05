#!/usr/bin/env python3
"""Build the self-contained, lean Forbidden Arcana static-site ZIP.

Source: gh-pages branch root. Only the 78 currently referenced, approved card
images and their 78 thumbnails are included. Unreferenced variants, old
major-arcana duplicates, other DND apps, and .git are not included.
"""
from __future__ import annotations

import hashlib
import io
import json
import re
import sys
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "dist" / "forbidden-arcana-tencent-lean-20261105.zip"

CATALOGS = {
    "assets/arcana-catalog-v3.js": 22,
    "assets/cups-approved-v1.js": 14,
    "assets/wands-approved-v1.js": 14,
    "assets/swords-approved-v1.js": 14,
    "assets/pentacles-approved-v1.js": 14,
}
IMAGE_PATTERN = re.compile(
    r"\./((?:assets/cards-(?:hd|thumb)|"
    r"minor-arcana/(?:cups|wands|swords|pentacles)/(?:final|thumbs))/"
    r"[a-z0-9-]+\.webp)"
)


class LocalRefs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = set()

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        for key in ("src", "href"):
            raw = d.get(key, "")
            if raw.startswith("./") and not raw.startswith("./#"):
                self.urls.add(raw.split("?")[0][2:])


def required_files():
    images = set()
    for catalog, count in CATALOGS.items():
        s = (ROOT / catalog).read_text(encoding="utf-8")
        hits = set(IMAGE_PATTERN.findall(s))
        full = [x for x in hits if "/final/" in x or "/cards-hd/" in x]
        thumb = [x for x in hits if "/thumbs/" in x or "/cards-thumb/" in x]
        if len(full) != count or len(thumb) != count:
            raise AssertionError(
                f"Expected {count} image+thumbnail pairs in {catalog}: "
                f"got {len(full)} images and {len(thumb)} thumbs"
            )
        images.update(hits)

    if len(images) != 156:
        raise AssertionError(f"Expected 156 referenced card pictures, got {len(images)}")
    p = LocalRefs()
    p.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    extras = {
        "index.html", "sw.js", "apple-touch-icon.png",
        "assets/card-back.svg", "assets/cards-hd/manifest.json",
    }
    extras.update(p.urls)
    # Include all tiny, first-party tarot JS/CSS modules for compatibility.
    for glob_rule in ("assets/*.js", "assets/*.css"):
        extras.update(str(path.relative_to(ROOT)) for path in ROOT.glob(glob_rule))
    paths = sorted(images | extras)
    for name in paths:
        if name.startswith("/") or ".." in Path(name).parts:
            raise ValueError("Unsafe path: " + name)
        if not (ROOT / name).is_file():
            raise FileNotFoundError(name)
    for name in images:
        b = (ROOT / name).read_bytes()[:12]
        if not (b.startswith(b"RIFF") and b[8:12] == b"WEBP"):
            raise ValueError("Invalid WebP header: " + name)
    return paths, images


def readme(image_size, total_size, image_count):
    return f"""# 禁忌之书 · 腾讯云精简部署包

这是可以直接部署的**静态网站**，不需要 Node.js / Python / 数据库。
原版 78 张已定稿塔罗牌、78 张缩略图、完整 HTML/CSS/JS、抽牌、图鉴、解读、命运档案均保留。
不包含灯塔、Hermes To Do、旧版牌面和历史草稿。网址里的 hash 路由（#/draw 等）不依赖服务器重写。

文件：
- index.html：网站入口
- assets/：运行脚本、样式、主要阿卡纳牌面和缩略图
- minor-arcana/：已定稿四个花色的图片和缩略图
- sw.js：可选离线缓存（按需缓存牌面）
- bundle-manifest.json / checksums.sha256：清单和文件校验
- nginx-site.conf.example：Nginx 参考配置

**实测打包统计**
- 牌面和缩略图：{image_count} 文件，{image_size / 1048576:.2f} MiB
- 含运行代码的总文件体积（不含说明文档）：{total_size / 1048576:.2f} MiB

## 推荐 Hermes Agent 部署流程

1. 在腾讯云创建独立站点目录，例如 /var/www/forbidden-arcana。
2. 把 ZIP 上传到腾讯云，直接解压到站点根目录，确认 index.html 位于根目录。
3. 使用 Nginx 将这个目录作为 root；开启 HTTPS、gzip，并给 webp 图片设置浏览器缓存。
4. 通过真实域名依次测试：首页、#/draw、#/explore、#/history、四种花色、单张牌面、移动端。
5. 不要覆盖现有 DND/灯塔/Hermes To Do 站点，不要删除现有 Nginx 站点配置。

示例操作（由 Hermes Agent 按真实服务器环境选择执行）：

    sudo mkdir -p /var/www/forbidden-arcana
    sudo unzip -o forbidden-arcana-tencent-lean-20261105.zip -d /var/www/forbidden-arcana

注意：配置中的 server_name 必须换成实际域名；如果已有反向代理或站点，
应该添加独立虚拟主机，不要直接覆盖原配置。部署完成后执行 nginx -t 再重载。

本包的 og:url / og:image 沿用 GitHub Pages 的公开预览网址。
如果需在微信等平台分享腾讯云的新域名，请把 index.html 里的这两个 meta 地址
更新为新域名对应的绝对 HTTPS 地址；不影响网页正常使用。
访问者数据（例如浏览器内命运档案）若保存在 localStorage，不会自动跨域同步。
"""


NGINX = """# Nginx reference; change server_name and enable HTTPS with your existing setup.
# Use this as a separate server block; do not overwrite an existing site.
server {
    listen 80;
    server_name tarot.example.com;
    root /var/www/forbidden-arcana;
    index index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(?:webp|png|jpg|jpeg|svg|gif|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    location ~* \\.(?:css|js)$ {
        expires 1d;
        try_files $uri =404;
    }

    location = /sw.js {
        add_header Cache-Control "no-cache";
    }
}
"""


def build():
    paths, images = required_files()
    metadata = []
    for name in paths:
        file = ROOT / name
        metadata.append({
            "path": name,
            "size_bytes": file.stat().st_size,
            "sha256": hashlib.sha256(file.read_bytes()).hexdigest(),
        })
    size = sum(item["size_bytes"] for item in metadata)
    image_size = sum((ROOT / name).stat().st_size for name in images)
    manifest = {
        "project": "禁忌之书 / The Forbidden Arcana",
        "source_branch": "gh-pages",
        "release": "2026-11-05",
        "major_arcana": 22,
        "minor_arcana": 56,
        "active_images_including_thumbnails": len(images),
        "active_image_bytes": image_size,
        "site_bytes": size,
        "files": metadata,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUT, "w", compression=ZIP_DEFLATED, compresslevel=6) as zipfile:
        for name in paths:
            zipfile.write(ROOT / name, arcname=name)
        zipfile.writestr("README_DEPLOY.md", readme(image_size, size, len(images)))
        zipfile.writestr("nginx-site.conf.example", NGINX)
        zipfile.writestr("bundle-manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
        checksums = "".join(f"{m['sha256']}  {m['path']}\n" for m in metadata)
        zipfile.writestr("checksums.sha256", checksums)

    with ZipFile(OUT) as zf:
        if zf.testzip() is not None:
            raise AssertionError("ZIP CRC validation failed")
        actual = set(zf.namelist())
        if not set(paths).issubset(actual):
            raise AssertionError("Missing ZIP entries")
        for m in metadata:
            payload = zf.read(m["path"])
            if hashlib.sha256(payload).hexdigest() != m["sha256"]:
                raise AssertionError("ZIP checksum mismatch: " + m["path"])
        if len(set(paths) & actual) != len(paths):
            raise AssertionError("Duplicate or missing assets")
    print(json.dumps({
        "archive": str(OUT.relative_to(ROOT)),
        "asset_files": len(paths),
        "active_images": len(images),
        "site_mib": round(size/1048576, 2),
        "zip_mib": round(OUT.stat().st_size/1048576, 2),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    build()
