#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3。请先安装 Python 3。"
  exit 1
fi
if ! command -v bsdtar >/dev/null 2>&1; then
  echo "未找到 bsdtar。macOS 通常自带；请检查系统命令行工具。"
  exit 1
fi
if ! command -v assimp >/dev/null 2>&1; then
  echo "未找到 assimp。请先在终端执行：brew install assimp"
  read -r -p "安装完成后按回车启动，或按 Ctrl+C 退出。"
fi
if ! command -v assimp >/dev/null 2>&1; then
  echo "仍未找到 assimp，无法转换 FBX。"
  exit 1
fi

python3 LocalAssetPipelineServer.py --host 127.0.0.1 --port 8765 --open
