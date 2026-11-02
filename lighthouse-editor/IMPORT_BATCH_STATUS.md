# Cliffy Coast｜《灯塔》模型分批导入状态

> 2026-11-02 检查点。任何续作先读取此文件及 `cliffy-coast-prefabs.js`，核对上一批已提交 GLB。不要重新生成已通过检查的资产，也不要改动原版 V35 岛屿模型。

## 批次范围（FBX 原始文件）
- 总计 172 个 FBX；`1_FBX/Terrain/` 17 个地形独立处理；`Collision/` 12 个碰撞代理不进入普通素材库；剩余 **143 个场景模型候选**。
- **Batch 01 Plants：14/14 已转换并提交，尚待真人浏览器视觉验收。** `Assets/Lowpoly Style/Cliffy Coast/1_FBX/Plants/`。
- **Batch 02 Tools/Furniture：20/20 已转换并提交，尚待真人浏览器视觉验收。** `1_FBX/Tools/`14个及`1_FBX/Furniture/`6个。**Batch 03 Items/Weapons/Decoration：18/18 已提交，待浏览器视觉验收。**；Batch 04 Other：0/18；Batch 05 Bridges/Paths/Walls：0/13；Batch 06 Structures：0/12；Batch 07 House bodies：0/12；Batch 08 Roofs：0/13；Batch 09 Cemetery A：0/11；Batch 10 Cemetery B：0/12。
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

**下一步**：先在浏览器验收 Batch 01+02+03，尤其检查武器贴图对应关系；随后从 Batch 04（原计划18件）中核对可用的灯具、摊位、推车等，不擅自扩充范围。**第三方资源许可：** 用户提供源包不自动等于允许公开再分发，正式公开持续部署应核实相应授权。

## Batch 02（工具14 + 家具6）

**GitHub 二进制提交：** `f5c694a467ffffe5334599b3c83026f6d720f44c`。20个 .glb 已在 `gh-pages` 分支逐一按 blob SHA 回读核验，资源路径为 `lighthouse-editor/assets/cliffy-coast/<name>.glb`。

| FBX | tris | 默认缩放 | 场景尺度基准 |
|---|---:|---:|---|
| Anvil | 180 | 68.177% | 0.84 长轴 |
| Bucket1 | 322 | 91.282% | 0.53 高 |
| Bucket2 | 322 | 117.919% | 0.48 高 |
| ChoppingBlock | 150 | 104.006% | 0.58 高 |
| ChoppingBlockWithHatchet | 292 | 81.428% | 1.03 高 |
| FirewoodSingle | 72 | 152.383% | 0.30 长轴 |
| HammerA | 154 | 96.664% | 0.47 长轴 |
| Hatchet | 228 | 90.758% | 0.54 长轴 |
| Pickaxe | 146 | 90.651% | 0.89 长轴 |
| Pitchfork | 186 | 81.525% | 1.78 长轴 |
| Scythe | 252 | 91.291% | 1.57 长轴 |
| Shovel | 202 | 79.975% | 1.73 长轴 |
| WaterBucket1 | 322 | 91.282% | 0.53 高 |
| WaterBucket2 | 322 | 117.919% | 0.48 高 |
| Candle1 | 206 | 49.671% | 0.48 高 |
| Candle2 | 581 | 66.601% | 0.39 高 |
| Stool | 156 | 52.671% | 0.62 高 |
| Stool_Old | 212 | 52.671% | 0.62 高 |
| Trophy | 3006 | **0.658%** | 0.67 高（源文件尺寸异常大，单独校准） |
| WoodenTable2 | 550 | 74.924% | 1.88 长轴 |

**实施标准：** 参照灯塔约7.43世界单位高度，同时核对道具长轴/宽高，保留原FBX顶点尺度和材质贴图。GLB导入后按 `defaultScale` 控制场景比例。旋转数字输入/百分比缩放、Enter确认和Delete删除仍保留。

**部署代码：** `cliffy-coast-batch02.js`、`editor.js`、`v35-preview-scene.js`、`shared-map.js` 与 `index.html`。新版地图对象允许最低 0.1% 缩放，以支持 Trophy 的异常源尺寸。

**质量检查（已通过）**：
- 20个 GLB 转换后回读，三角面数核对无误。
- GitHub 20个 GLB Blob SHA 全部回读匹配。
- 34个 Cliffy Coast 模型 ID（Batch01+Batch02）唯一。
- 注册、编辑器、试玩及地图序列化相关 JavaScript 语法静态检查通过。
- **未完成的验收**：浏览器实际3D渲染、材质效果、复杂地形着地、运行帧率、删除/撤销及试玩交互。

**保留边界：** 仅更新编辑器与独立试玩，不改正式 V35 游戏固定场景，也不触碰地形17件。第三方资源公开再分发许可须由素材授权确认。

**截至 Batch 03：52/143 个非地形场景模型已提交，91件待处理；另外17件地形单独处理。**


## Batch 03（物品10 + 武器7 + 土堆装饰1）

**二进制提交：** `9fbff65387848f776c5d13962b51f1efa04648a7`。18 个 GLB 位于 `lighthouse-editor/assets/cliffy-coast/`。每个模型保留 FBX 几何和 UV 原始单位，以 `defaultScale` 控制编辑器默认大小，参照原版灯塔 7.43 世界单位校准物件的高度或长轴。

| 源FBX | 类别 | tris | 默认缩放 | GitHub |
|---|---|---:|---:|---|
| BowlEmpty | 物品 | 218 | 110.769% | 已提交 |
| BowlSmallEmpty | 物品 | 116 | 105.491% | 已提交 |
| ChoppedWood | 物品 | 1380 | 77.409% | 已提交 |
| Crate | 物品 | 284 | 78.000% | 已提交 |
| DumplingBowl | 物品 | 432 | 113.098% | 已提交 |
| FeedingTrough | 物品 | 282 | 57.625% | 已提交 |
| HayBale | 物品 | 801 | 49.107% | 已提交 |
| PlateEmpty | 物品 | 76 | 90.394% | 已提交 |
| PlateMeal | 物品 | 376 | 90.394% | 已提交 |
| PlateSoup | 物品 | 76 | 100.622% | 已提交 |
| Hellebard | 武器 | 382 | 65.901% | 已提交 |
| MorningStar | 武器 | 238 | 85.105% | 已提交 |
| OnehandAxe | 武器 | 492 | 106.408% | 已提交 |
| Sword_A | 武器 | 423 | 73.087% | 已提交 |
| Sword_B | 武器 | 451 | 76.960% | 已提交 |
| Sword_C | 武器 | 269 | 78.385% | 已提交 |
| TwohandAxe | 武器 | 512 | 110.669% | 已提交 |
| EarthPile | 装饰 | 387 | 54.276% | 已提交 |

**范围调整：** 原 FBX 的 `Items` 实有10件、`Weapons` 实有7件；第18件使用同包 `EarthPile.fbx`（原本属于其他装饰）。`Campfire.fbx` 的材质引用缺失 `Desert1.psd`，不在本批强行加入；后续批次清单应再次核对实际归属与总数。

**材质风险：** 武器 FBX 中部分源路径指向另一个资源包 `Tropical Islands/Main.psd`，在此次 Cliffy Coast 压缩包中没有对应原贴图。转换后暂使用 Cliffy Coast `Main.png` 纹理；这保留了 UV 和网格，但**不能保证武器颜色与原版一致**，需要实际场景验收，必要时从授权素材中取得对应贴图后替换。普通物品和 EarthPile 的原始 FBX 指向 Cliffy Coast Main 贴图。

**已完成校验：**
- 18个 FBX 转换后 GLB 可重新读取，面数合计 7,195 tris，与源文件三角化统计一致；默认缩放49.107%–113.098%。
- GitHub 已提交18个独立 GLB，仓库目录读取确认全部存在；累计52个 Cliffy Coast GLB。
- 编辑器与试玩场景均接入 `cliffy-coast-batch03.js`，新增 `Cliffy Coast 物品`、`Cliffy Coast 武器`、`Cliffy Coast 装饰` 素材分类；页面版本 V4.5.0。
- 批次注册、编辑器、试玩、地图标准化脚本静态语法检查通过；18个新ID无重复。
- **未验收：** 真人浏览器材质、透明、着地、缩放比例、性能、删除/撤销与试玩行为。

**边界：** 不改动原版岛屿地形、原版V35正式游戏或前两批素材。第三方资源再分发授权仍须核实。
