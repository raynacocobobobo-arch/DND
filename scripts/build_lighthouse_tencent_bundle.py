#!/usr/bin/env python3
"""Build a standalone, self-contained Lighthouse Camp V35a Tencent Cloud ZIP.

Keep the approved procedural scene untouched. Only include modules reachable
from lighthouse/index.html and required music and new logo. Vendor Three.js
locally in the ZIP to avoid China/CDN availability problems.
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "lighthouse"
THREE = Path(os.environ.get("LIGHTHOUSE_THREE_PACKAGE_PATH", "/tmp/lighthouse-web-deps/node_modules/three"))
OUT = ROOT / "dist" / "lighthouse-camp-tencent-lean-20261105.zip"

IMPORT_RE = re.compile(r"\bfrom\s*['\"]([^'\"]+)['\"]|\bimport\s*['\"]([^'\"]+)['\"]|\bimport\s*\(\s*['\"]([^'\"]+)['\"]\s*\)")
CSS_URL_RE = re.compile(r"url\(\s*['\"]?([^'\"\)\s]+)")


class HtmlAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.paths = set()
        self.modules = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        for key in ("src", "href"):
            ref = attributes.get(key, "")
            if ref.startswith("./"):
                path = ref[2:].split("?", 1)[0].split("#", 1)[0]
                if not path or path.endswith("/"):
                    continue
                self.paths.add(path)
                if tag == "script" and path.endswith(".js"):
                    self.modules.add(path)


def dependencies(seed):
    pending = list(seed)
    completed = set()
    while pending:
        module = pending.pop()
        if module in completed:
            continue
        file = SITE / module
        if not file.is_file():
            raise FileNotFoundError(f"Missing referenced JS module: {module}")
        completed.add(module)
        body = file.read_text(encoding="utf-8")
        for match in IMPORT_RE.finditer(body):
            target = next((x for x in match.groups() if x), "")
            if target in ("three",) or target.startswith("three/addons/"):
                continue
            if not target.startswith("."):
                raise AssertionError(f"Unexpected external JS import {module}: {target}")
            name = target.split("?", 1)[0]
            resolved = (file.parent / name).resolve()
            if SITE.resolve() not in resolved.parents:
                raise AssertionError(f"Import escapes site directory: {target}")
            pending.append(str(resolved.relative_to(SITE)))
    return completed


def readme(zipbytes, audio, modules):
    return f"""# 灯塔营地 · 腾讯云精简静态部署包（V35a）
该 ZIP **可以直接解压为独立网站**。仅包含现行正式版本运行所需的文件：

- V35a 灯塔营地场景，不改模型、交互、动画或光照
- 白天／夜晚、海盗船、触手、相机操作、截图与原背景音乐
- 你提供的白底 Low Poly 灯塔 Logo（iPhone 主屏图标＋浏览器图标）
- Three.js r160 + OrbitControls，本地部署，不依赖 jsDelivr CDN
- 不含地图编辑器、旧版游戏、历史预览页、其他 DND 项目

本包包含 {modules} 个项目 JavaScript 模块。
背景音乐原文件大小：{audio/1048576:.2f} MiB。
部署资源总大小：{zipbytes/1048576:.2f} MiB（未计说明文件）。

## 部署到腾讯云 / Hermes Agent
1. 把 zip 上传到云服务器，不要克隆整个 DND 仓库。
2. 新建隔离的站点目录，如 /var/www/lighthouse-camp。
3. 解压 ZIP 至该目录，保证 index.html 位于站点根路径。
4. 用现有 Nginx 建立一个独立站点，配好域名与 HTTPS；不要覆盖其他网站。
5. Nginx 检查和重载：sudo nginx -t && sudo systemctl reload nginx。
6. 检查首页、白天/夜晚、旋转、触手、海盗船、保存截图、音乐和 iPhone 添加到主屏。

示例：
    sudo mkdir -p /var/www/lighthouse-camp
    sudo unzip -o lighthouse-camp-tencent-lean-20261105.zip -d /var/www/lighthouse-camp

## 说明
Three.js 已随包提供，不再需要 jsDelivr 连接。
浏览器 autoplay 受用户手势策略限制，第一次进入可能需要点一下才播放音乐（沿用原版逻辑）。
如果使用 iPhone 旧桌面快捷图标，系统可能缓存旧 Logo；删除旧快捷方式再添加可刷新。
本包只是静态网页，不需要部署 Node、Python、数据库或 3D 编辑器。
"""


def build():
    html = (SITE / "index.html").read_text(encoding="utf-8")
    scanner = HtmlAssets()
    scanner.feed(html)
    static = set(scanner.paths) | dependencies(scanner.modules)
    if "lighthouse-camp-icon-20261105.png" not in static:
        raise AssertionError("New campsite icon missing from HTML references")
    if "audio/lighthouse_background_music.mp3" not in static:
        raise AssertionError("Game music missing")
    if "v35-scene.js" not in static:
        raise AssertionError("Game entry missing")
    if not all((SITE / p).is_file() for p in static):
        raise AssertionError("Referenced file not present")
    if any(p.startswith("v10-") or p.startswith("v20-") for p in static):
        raise AssertionError("Historic game version inadvertently included")

    vendor = {
        "vendor/three.module.js": THREE / "build" / "three.module.js",
        "vendor/addons/controls/OrbitControls.js": THREE / "examples/jsm/controls/OrbitControls.js",
    }
    for path in vendor.values():
        if not path.is_file():
            raise FileNotFoundError(path)
    if "0.160.1" not in (THREE / "package.json").read_text(encoding="utf-8"):
        raise AssertionError("Wrong Three.js version; expected 0.160.1")
    # Only the importmap is rewritten in the deploy ZIP. Game JS is untouched.
    original_jsdelivr = "https://cdn.jsdelivr.net/npm/three@0.160.1/"
    if original_jsdelivr not in html:
        raise AssertionError("Unknown importmap; safe replacement aborted")
    html = html.replace(
        original_jsdelivr + "build/three.module.js", "./vendor/three.module.js"
    ).replace(
        original_jsdelivr + "examples/jsm/", "./vendor/addons/"
    )
    assert original_jsdelivr not in html
    data = {"index.html": html.encode("utf-8")}
    for p in static:
        if p == "index.html":
            continue
        data[p] = (SITE / p).read_bytes()
    for p, source in vendor.items():
        data[p] = source.read_bytes()
    # Compatibility for tools requesting the legacy Apple icon name.
    data["apple-touch-icon.png"] = (SITE / "apple-touch-icon.png").read_bytes()
    if data["apple-touch-icon.png"] != data["lighthouse-camp-icon-20261105.png"]:
        raise AssertionError("Legacy icon alias not updated")

    rows = [{"path": name, "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()}
            for name, content in sorted(data.items())]
    raw_bytes = sum(len(content) for content in data.values())
    audio_bytes = len(data["audio/lighthouse_background_music.mp3"])
    summary = {
        "project": "灯塔营地 / Lighthouse Camp",
        "version": "V35a",
        "release": "2026-11-05",
        "source_branch": "gh-pages",
        "music_bytes": audio_bytes,
        "site_bytes": raw_bytes,
        "project_modules": len([p for p in data if p.endswith(".js") and not p.startswith("vendor/")]),
        "self_contained_three_js": True,
        "new_icon": "lighthouse-camp-icon-20261105.png",
        "files": rows,
    }
    extra = {
        "README_DEPLOY.md": readme(raw_bytes,audio_bytes,summary["project_modules"]).encode("utf-8"),
        "nginx-site.conf.example": b"""# Set server_name and HTTPS according to your existing Tencent Cloud setup.
server {
    listen 80;
    server_name lighthouse.example.com;
    root /var/www/lighthouse-camp;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \\.(?:js|png|jpg|webp|mp3|css|svg)$ {
        expires 14d;
        add_header Cache-Control "public";
    }
}
""",
        "bundle-manifest.json": (json.dumps(summary,ensure_ascii=False,indent=2)+"\n").encode("utf-8"),
        "checksums.sha256": "".join(f"{r['sha256']}  {r['path']}\n" for r in rows).encode("utf-8"),
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(OUT,"w",compression=ZIP_DEFLATED,compresslevel=6) as archive:
        for name,content in sorted({**data, **extra}.items()):
            archive.writestr(name,content)
    with ZipFile(OUT) as archive:
        if archive.testzip() is not None:
            raise AssertionError("ZIP CRC test failed")
        for row in rows:
            if hashlib.sha256(archive.read(row["path"])).hexdigest()!=row["sha256"]:
                raise AssertionError("ZIP checksum mismatch: "+row["path"])
    print(json.dumps({
        "archive":str(OUT.relative_to(ROOT)), "file_count":len(data),
        "modules":summary["project_modules"],
        "raw_site_mib":round(raw_bytes/1048576,3),
        "zip_mib":round(OUT.stat().st_size/1048576,3),
        "music_mib":round(audio_bytes/1048576,3),
        "required_modules":sorted(p for p in static if p.endswith(".js")),
    },ensure_ascii=False,indent=2))


if __name__=="__main__":
    build()
