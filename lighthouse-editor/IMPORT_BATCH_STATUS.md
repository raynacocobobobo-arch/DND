# Cliffy Coast｜《灯塔》模型分批导入状态

> 2026-11-02 检查点。任何续作先读取此文件及 `cliffy-coast-prefabs.js`，核对上一批已提交 GLB。不要重新生成已通过检查的资产，也不要改动原版 V35 岛屿模型。

## 批次范围（FBX 原始文件）
- 总计 172 个 FBX；`1_FBX/Terrain/` 17 个地形独立处理；`Collision/` 12 个碰撞代理不进入普通素材库；剩余 **143 个场景模型候选**。
- **Batch 01 Plants：14/14 已转换并提交，尚待真人浏览器视觉验收。** `Assets/Lowpoly Style/Cliffy Coast/1_FBX/Plants/`。
- Batch 02 Tools/Furniture：0/20；Batch 03 Items/Weapons：0/18；Batch 04 Other：0/18；Batch 05 Bridges/Paths/Walls：0/13；Batch 06 Structures：0/12；Batch 07 House bodies：0/12；Batch 08 Roofs：0/13；Batch 09 Cemetery A：0/11；Batch 10 Cemetery B：0/12。
- 以上后续类别为**计划分组**，下一批开工前按原 FBX 文件重新核对实际归属；不得把计划数说成已处理数量。

## Batch 01（植物14）
| ID / FBX 名称 | tris | 默认缩放 | 目标高度 (world units) | GitHub 状态 |
|---|---:|---:|---:|---|
| Tree1 | 1203 | 18.455% | 4.50 | 已提交 |
| Tree2 | 770 | 18.944% | 4.60 | 已提交 |
| Tree3 | 639 | 17.400% | 4.00 | 已提交 |
| TreeDamaged1 | 291 | 22.361% | 2.00 | 已提交 |
| TreeDamaged2 | 293 | 23.641% | 1.80 | 已提交 |
| TreeDamaged3 | 289 | 24.061% | 1.65 | 已提交 |
| Plant | 165 | 41.906% | 0.35 | 已提交 |
| Plant2 | 165 | 47.629% | 0.35 | 已提交 |
| Plant3 | 165 | 44.171% | 0.40 | 已提交 |
| Reed | 400 | 34.797% | 0.75 | 已提交 |
| ReedBig | 1200 | 37.486% | 0.95 | 已提交 |
| Ivy1 | 756 | 28.611% | 1.60 | 已提交 |
| Ivy2_HouseWall | 721 | 29.639% | 2.10 | 已提交 |
| Field | 5941 | 45.000% | 1.05（按占地校准） | 已提交 |

**尺度规范**：V35 灯塔整体高度约 7.43 world units。GLB 保留 FBX 原始尺寸；所有模型单独设置 `defaultScale`，绝不把默认缩放重复写入几何顶点。Tree1/Tree3 以前曾以 30% 几何尺寸导出并又设 30% 默认缩放，Batch 01 已改为完整尺寸源网格及合理默认比例。旧地图没有 `assetScaleVersion` 时，其已放置 Tree1/Tree3 的缩放系数自动乘 0.3，保留旧视觉尺寸，不触及原版岛屿。

**已通过静态 QA**：
- 14 个 FBX 到 GLB 转换后能重新解析；三角面数与原始文件统计一致。
- 14 个 GitHub `.glb` 均按 blob SHA 逐个回读验证。
- 编辑器、游戏试玩、地图序列化以及 GLB 注册代码的 JavaScript 语法检查通过。
- 浏览器中颜色、透明、位置、帧率和实际试玩交互 **未验收**；不得称为最终通过。

**代码位置**：
- `lighthouse-editor/assets/cliffy-coast/*.glb`
- `lighthouse-editor/cliffy-coast-prefabs.js`
- `lighthouse/shared-map.js`
- `lighthouse-editor/editor.js`
- `lighthouse/v35-preview-scene.js`

**游戏边界**：当前仅在编辑器和 `lighthouse/preview.html` 试玩环境生效，不修改 `lighthouse/` 正式游戏 V35 固定资产。

**下一步**：先在浏览器确认 Batch 01 的植物缩放、贴图透明和地形着地；通过后再处理 Batch 02。**第三方资源许可：** 用户提供源包不自动等于允许公开再分发，正式公开持续部署应核实相应授权。
