#!/usr/bin/env python3
"""Loopback-only local bridge for the Lighthouse full-screen asset manager."""
from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
import uuid
import webbrowser
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from LocalUnityGLBPipeline import convert_package

ROOT = Path(__file__).resolve().parent
JOBS_ROOT = Path.home() / "Library" / "Application Support" / "LighthouseWorld" / "ImportJobs"
ALLOWED_SUFFIXES = {".rar", ".zip", ".7z", ".tar", ".gz", ".unitypackage"}
MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024
JOB_ID_RE = re.compile(r"^[a-f0-9]{32}$")


class Handler(SimpleHTTPRequestHandler):
    server_version = "LighthouseLocal/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        print("[LighthouseLocal] " + (fmt % args), flush=True)

    def _json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _api_host_allowed(self) -> bool:
        host = self.headers.get("Host", "").split(":", 1)[0].strip("[]").lower()
        if host not in {"127.0.0.1", "localhost"}:
            return False
        origin = self.headers.get("Origin")
        if not origin:
            return True
        parsed = urlsplit(origin)
        return parsed.scheme == "http" and parsed.hostname == host

    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path == "/api/status":
            if not self._api_host_allowed():
                self._json(403, {"ok": False, "error": "仅允许本机页面访问转换服务"})
                return
            tools = {"bsdtar": shutil.which("bsdtar"), "assimp": shutil.which("assimp")}
            missing = [name for name, path in tools.items() if not path]
            self._json(200, {
                "ok": True,
                "ready": not missing,
                "tools": tools,
                "missing": missing,
                "message": ("转换工具已就绪" if not missing else "缺少本机工具：" + "、".join(missing)),
            })
            return
        match = re.fullmatch(r"/api/jobs/([a-f0-9]{32})/models/([0-9]+)", parsed.path)
        if match:
            if not self._api_host_allowed():
                self._json(403, {"ok": False, "error": "仅允许本机页面访问转换服务"})
                return
            job_id, index_text = match.groups()
            manifest_path = JOBS_ROOT / job_id / "job-manifest.json"
            try:
                manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
                record = next(item for item in manifest["models"] if item["index"] == int(index_text))
                model_path = (JOBS_ROOT / job_id / record["file"]).resolve()
                if JOBS_ROOT.resolve() not in model_path.parents or not model_path.is_file():
                    raise FileNotFoundError()
                size = model_path.stat().st_size
                self.send_response(200)
                self.send_header("Content-Type", "model/gltf-binary")
                self.send_header("Content-Length", str(size))
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                with model_path.open("rb") as stream:
                    shutil.copyfileobj(stream, self.wfile)
            except (OSError, ValueError, KeyError, StopIteration, json.JSONDecodeError):
                self._json(404, {"ok": False, "error": "找不到转换后的 GLB"})
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlsplit(self.path)
        if parsed.path != "/api/convert":
            self._json(404, {"ok": False, "error": "未知接口"})
            return
        if not self._api_host_allowed():
            self._json(403, {"ok": False, "error": "仅允许本机页面访问转换服务"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_UPLOAD_BYTES:
                raise ValueError("压缩包为空或超过 2GB")
            params = parse_qs(parsed.query)
            filename = Path(params.get("filename", ["asset.rar"])[0]).name
            suffix = Path(filename).suffix.lower()
            if suffix not in ALLOWED_SUFFIXES:
                raise ValueError("支持 RAR、ZIP、7Z、TAR、GZ 和 Unitypackage")
            tools_missing = [name for name in ("bsdtar", "assimp") if shutil.which(name) is None]
            if tools_missing:
                raise RuntimeError("本机缺少 " + "、".join(tools_missing) + "；请先安装 assimp（brew install assimp）")
            job_id = uuid.uuid4().hex
            job_dir = JOBS_ROOT / job_id
            job_dir.mkdir(parents=True, exist_ok=False)
            source = job_dir / ("source" + suffix)
            remaining = length
            with source.open("wb") as output:
                while remaining:
                    chunk = self.rfile.read(min(1024 * 1024, remaining))
                    if not chunk:
                        raise ValueError("压缩包上传不完整")
                    output.write(chunk)
                    remaining -= len(chunk)
            output_dir = job_dir / "output"
            manifest = convert_package(source, output_dir)
            records = []
            for index, model in enumerate(manifest.get("models", [])):
                relative = Path(model["glb"])
                model_path = (output_dir / relative).resolve()
                if output_dir.resolve() not in model_path.parents or not model_path.is_file():
                    continue
                records.append({
                    "index": index,
                    "name": model_path.stem,
                    "relativePath": relative.as_posix(),
                    "file": str(model_path.relative_to(JOBS_ROOT / job_id)),
                    "size": model_path.stat().st_size,
                    "status": model.get("status", "converted"),
                    "missingTextureUris": model.get("missing_texture_uris", []),
                })
            if not records:
                raise ValueError("没有生成可用的 GLB。请确认压缩包内含 Unitypackage 和 FBX 模型。")
            payload = {
                "jobId": job_id,
                "sourceName": filename,
                "createdAt": datetime.now(timezone.utc).isoformat(),
                "extracted": manifest.get("extracted", {}),
                "models": records,
            }
            (job_dir / "job-manifest.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
            self._json(200, {"ok": True, **payload})
        except Exception as exc:
            if "job_id" in locals():
                shutil.rmtree(JOBS_ROOT / job_id, ignore_errors=True)
            self._json(400, {"ok": False, "error": str(exc)})

    def do_DELETE(self):
        parsed = urlsplit(self.path)
        match = re.fullmatch(r"/api/jobs/([a-f0-9]{32})", parsed.path)
        if not match or not self._api_host_allowed():
            self._json(404, {"ok": False, "error": "未知任务"})
            return
        shutil.rmtree(JOBS_ROOT / match.group(1), ignore_errors=True)
        self._json(200, {"ok": True})


def main():
    parser = argparse.ArgumentParser(description="Start the Lighthouse Mac local asset manager")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--open", action="store_true", help="Open the full-screen asset manager in a browser")
    args = parser.parse_args()
    if args.host not in {"127.0.0.1", "localhost"}:
        raise SystemExit("安全限制：本地转换服务只能绑定 127.0.0.1 或 localhost")
    JOBS_ROOT.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    url = f"http://127.0.0.1:{args.port}/assets.html"
    print("灯塔本地素材管理器已启动：" + url, flush=True)
    print("RAR / Unitypackage 转换服务仅监听本机，不会上传压缩包或 GLB。", flush=True)
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n正在关闭本地服务…", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
