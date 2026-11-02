# Cliffy Coast｜《灯塔》模型分批导入状态

> 2026-11-02 检查点。任何续作先读取此文件及 `cliffy-coast-prefabs.js`，核对上一批已提交 GLB。不要重新生成已通过检查的资产，也不要改动原版 V35 岛屿模型。

## 批次范围（FBX 原始文件）
- 总计 172 个 FBX；`1_FBX/Terrain/` 17 个地形独立处理；`Collision/` 12 个碰撞代理不进入普通素材库；剩余 **143 个场景模型候选**。
- **Batch 01 Plants：14/14 已转换并提交，尚待真人浏览器视觉验收。** `Assets/Lowpoly Style/Cliffy Coast/1_FBX/Plants/`。
- **Batch 02 Tools/Furniture：20/20 已转换并提交，尚待真人浏览器视觉验收。** `1_FBX/Tools/`14个及`1_FBX/Furniture/`6个。**Batch 03 Items/Weapons/Decoration：18/18 已提交，待浏览器视觉验收。**；**Batch 04 Misc：18/18 已提交，待浏览器视觉验收**；Batch 05 Bridges/Paths/Walls：0/13；Batch 06 Structures：0/12；Batch 07 House bodies：0/12；Batch 08 Roofs：0/13；Batch 09 Cemetery A：0/11；Batch 10 Cemetery B：0/12。
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

**下一步**：优先验收前四批的灯具、摊位、营火及武器贴图；然后处理 Batch 05 桥梁、道路与围墙13件。**第三方资源许可：** 用户提供源包不自动等于允许公开再分发，正式公开持续部署应核实相应授权。

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


## Batch 04（场景杂件18）——已提交，待视觉验收

**模型文件提交**：`b8c63447113f61a14922db7b8137421567572d7d`。18个独立GLB文件位于 `lighthouse-editor/assets/cliffy-coast/`，新素材注册模块为 `cliffy-coast-batch04.js`。累计已提交 **70/143个非地形模型，剩余73个**。

| FBX | 三角面 tris | 默认缩放 |
|---|---:|---:|
| Lantern_Metal | 764 | 20.389% |
| Lantern_MetalDouble | 1644 | 23.931% |
| Lantern_Wall | 737 | 51.772% |
| Lantern_Wood | 694 | 20.389% |
| MarketStand_Blue | 2138 | 91.144% |
| MarketStand_Green | 2138 | 91.144% |
| MarketStand_Red | 2138 | 91.144% |
| MarketStand_White | 2138 | 91.144% |
| CartBig1 | 3260 | 47.182% |
| MuddPlane | 71 | 11.747% |
| RockBlock1 | 212 | 108.400% |
| RockBlock3 | 240 | 140.658% |
| RockBlock_Torch1 | 774 | 95.617% |
| RockBlock_Torch2 | 822 | 107.385% |
| StonePath_Curve | 324 | 21.171% |
| StonePath_Straight | 303 | 20.557% |
| WoodenPloorPatch1 | 202 | 24.450% |
| Campfire | 490 | 43.610% |
| **合计** | **19,089** | — |

**本批范围**：灯具4、摊位4、推车1、泥地1、岩块4、石路2、木地板片1、营火1。全部源FBX几何未烘焙缩放，保留各自UV和原始面数，导入时以灯塔整体约7.43世界单位为基准设定 `defaultScale`（以长轴控制部分横向模型尺寸）。

**贴图风险**：其中11件 FBX 引用 Asia/Desert 等未随包提供的纹理贴图。当前GLB用资源包内 Cliffy Coast `Main.png` 图集作为临时贴图，几何和UV保留，但**灯具、四色摊位、营火的原版颜色不能保证复原**，营火不附带点火与粒子动画；需要网页视觉验收，不可将临时材质标记为最终定版。

**校验通过**：18个FBX三角化与GLB回读面数一致，总19,089 tris；已通过GitHub Git blob/tree/commit方式提交18个文件；注册模块及编辑器、试玩场景均已接线；Batch01–04 共70个唯一素材ID、编辑器/试玩/批次模块JavaScript静态语法检查均通过，18个本批模型的Git blob SHA与本地GLB一致。**浏览器内的模型贴图、光照、默认尺寸、着地、删除和试玩仍未完成验收。**

**版本**：灯塔编辑器 V4.6.0，编辑器与独立试玩场景均引用 `cliffy-coast-batch04.js`；正式V35游戏未修改。**下一批**：Batch 05 桥梁、道路、围墙13个（开工前重新核对原FBX的归属及是否与Batch04已有道路构件重复）。
