# 灯塔小岛：正式版冻结与新地图开发约定

冻结日期：2026-11-03
正式版地址：https://raynacocobobobo-arch.github.io/DND/lighthouse/
正式版入口：`lighthouse/index.html`
正式版场景：`lighthouse/v35-scene.js`
只读快照分支：`lighthouse-v35a-frozen-2026-11-03`

## 必须保留
- 已认可的 V35a 游戏（`/DND/lighthouse/`）作为正式版，不将地图编辑器的草稿、模型库变动或新地图发布到这个地址。
- 不覆盖、重命名或删除 `lighthouse/index.html`、`lighthouse/v35-scene.js`，也不在未经明确批准的情况下修改正式版直接或间接依赖的 `lighthouse/v27-*`、`lighthouse/v34-*`、`lighthouse/v35-*`、`lighthouse/shared-map.js`、`lighthouse/background-music.js` 等文件。
- 正式版不应读取编辑器 `localStorage` 草稿、`editor-preview-map.json` 或其他正在开发的地图数据。
- `?v=7d` 仅作为浏览器缓存参数；正式版的路径是 `/DND/lighthouse/`。

## 后续新地图
- 每张新地图使用独立目录：`/DND/maps/<map-id>/`（源文件放在仓库 `maps/<map-id>/`），例如 `maps/island-02/`。
- 新地图从冻结快照复制必要的场景代码和资源，尽量使用自己的文件依赖；不要改写正式版已使用的共享模块。
- `lighthouse-editor/` 只用于编辑器。未来发布新地图时，只改它自己的 `maps/<map-id>/` 或对应资源目录。
- 编辑器里的“保存、备份、试玩”不等于将地图发布到正式游戏。
- 若确实需要升级正式版，必须先获得明确的单独确认、准备恢复方案，并核对旧版与新版差异。

此文档是开发约定，不是 GitHub 分支保护规则。真正的恢复依据为只读快照分支；改动保护仍需在今后的提交中遵守。
