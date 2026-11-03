# 灯塔世界 Mac 本地素材管理器：RAR / Unitypackage 导入

## 作用

在全屏素材管理器中选择 RAR、ZIP、7Z、TAR、GZ 或 Unitypackage。Mac 本机执行：

1. 解包压缩文件并提取 Unitypackage。
2. 从 Unitypackage 中提取 FBX、纹理和 MAT。
3. 使用 Assimp 将 FBX 转换为 GLB。
4. 将能匹配的 PNG/JPEG 贴图嵌入 GLB。
5. 把生成的 GLB 逐个导入现有本地 IndexedDB 素材库。

压缩包和生成的 GLB 都留在本机临时任务目录；导入完成后，管理器会请求清理任务目录。不会上传到 GitHub。

## 首次启动

在 Mac 终端进入本目录，执行：

    brew install assimp
    chmod +x start-local-mac.sh
    ./start-local-mac.sh

脚本会打开：

    http://127.0.0.1:8765/assets.html

以后固定使用这个地址，避免浏览器把本地 IndexedDB 识别成不同站点。按终端里的 Ctrl+C 可关闭服务。

## 使用

打开全屏素材管理器后，点击“导入 RAR / Unitypackage”，选择压缩包。转换完成后，GLB 会逐个写入素材库；地图编辑器通过原有共享 IndexedDB 读取这些模型。

## 当前限制

- 单个 GLB 仍遵循素材库现有的 25 MB、50 万 tris、最多 220 个模型限制。
- 不支持的贴图格式或找不到的贴图会在转换结果中列为缺失，不会伪装成已嵌入。
- 3D 预览仍使用页面现有的 Three.js 模块依赖。
- 本地转换服务只监听 127.0.0.1，不对局域网开放。
