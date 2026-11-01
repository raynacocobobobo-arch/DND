# 灯塔岛：交互式 3D 网页预览

- 网页入口：`docs/lighthouse/index.html`
- 模型生成与交互代码：`docs/lighthouse/scene.js`
- 公开地址（在 GitHub Pages 从 `main` / `docs` 发布后）：https://raynacocobobobo-arch.github.io/DND/lighthouse/
- 仓库内预览首页：`docs/index.html`（新增独立入口，未触碰塔罗页面）

## 操作
鼠标左键拖动旋转、滚轮缩放、右键平移；页面内提供重置、自动旋转、阴影开关、截图、全屏。

## 资源和限制
- 这是浏览器实时生成的 Three.js 几何场景，不是此前 V6-B1 GLB 的直接上传，也不是方案 B 概念效果图的高精度复刻。
- 几何体和材质纹理由 `scene.js` 生成，不依赖外部模型文件。
- Three.js 0.160.1 从 jsDelivr ES module CDN 加载，首次打开需要联网。
- 开启 WebGL 的 Chrome、Edge、Safari 可尝试浏览；旧设备与关闭 GPU 加速的浏览器可能无法运行。
- 为了避免先前的颜色错位问题，小屋墙体使用独立灰泥材质，不再使用跨区域 UV 材质图集。
- 为了避免侧面闪烁，切块侧壁不使用与底面共面的随机白色线条及彩色贴片。

## 发布与检查
如果公开 URL 返回 404，请检查仓库 `Settings > Pages` 的发布源是否选中 `Deploy from a branch` / `main` / `/docs`，并检查 `pages build and deployment` 的构建结果。页面资源可从 GitHub 的 `docs/lighthouse` 路径检查。
