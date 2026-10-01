# DND5E_HIDDEN_OBJECT_PRODUCTION_STANDARD_V1.md

版本：V1  
项目：D&D / 5E Hidden-Object 15个完整游戏关卡  
用途：把“官方资料研究 → 子场景选择 → 场景专属人物资产 → 群像构图 → 最终大图 → Hidden-Object → Level数据/UI”标准化为一条固定生产线。  

> **当前批准口径（2026-10-01）：最终交付是15个可用于游戏实现的完整Hidden-Object关卡，不是15张独立插画。本文所有“60人”均视为默认约60人的制作规格，通常允许55–70名可读角色；场景生态与可读性优先于机械凑数。Gate体系以 `MASTER/GATE-SYSTEM-V1.md` 的 G0–G7 为准。**

---

# 0. 核心原则

这套流程只解决一个问题：

> **如何稳定地把一个官方5E地点，转化成一个有明确世界观依据、约55–70名角色可读、风格统一、可直接进入Hidden-Object游戏实现的完整关卡。**

整个项目以后不再按“灵感驱动”推进，而按固定流程推进。

## 0.1 三个最高优先级

### 1. 官方依据优先
任何地点、势力、种族、NPC、装备、法术、怪物、文化习惯，优先从：
- SRD 5.1
- SRD 5.2.1
- Wizards / D&D Beyond官方设定书、冒险书、地图、官方文章
提取。

### 2. 子场景优先
不以“整个地区”为生成单位，而以**一个明确子场景 + 一个明确时间切片**为生成单位。

例如：
- Candlekeep ≠ 整个Candlekeep
- 正确：`Court of Air / Seekers献书入堡`

### 3. 人物优先
最终画面必须是：
> **“一个有场景的角色漫画”**
而不是：
> **“一个宏大场景里塞很多小人”**

---

# 1. 资料可信度体系

以后所有研究文件统一使用以下标签。

## 【SRD-5.1】
来源：Wizards SRD 5.1开放内容。

## 【SRD-5.2.1】
来源：Wizards SRD 5.2.1开放内容。

## 【OFFICIAL-SETTING】
来源：
- D&D Beyond正式Source
- 官方冒险书
- 官方设定书
- Wizards / D&D Beyond官方文章
- 官方地图 / 官方美术

## 【OFFICIAL-INDEX】
官方目录确认该章节存在，但公开网页没有完整正文。

## 【PROJECT】
项目设计推导：
- 60人数量
- 人物站位
- 事件岛
- 具体时间点
- Hidden-object目标
- 为构图做的简化

## 禁止
- 把【PROJECT】写成“官方设定”
- 把社区Wiki当官方来源
- 把BG3人口比例直接当5E地区人口统计
- 没有证据时凭泛奇幻经验补设定

---

# 2. 项目资料层级

项目永远分成四层。

## LEVEL A｜MASTER RULE DATABASE
全项目共用。

文件：
`DND5E_MASTER_RESEARCH_AND_15_SCENES_V1.md`

包含：
- Species / Race
- Classes
- Backgrounds
- NPC archetypes
- Equipment
- Tools
- Spells
- Vehicles
- Hirelings
- Environment
- Travel / Rest / Downtime
- Traps
- Monsters基础规则

这层一旦建立，不随单关反复重写。

---

## LEVEL B｜LOCATION BIBLE
每个官方地点一份。

解决：
- 地点在哪里
- 历史
- 建筑
- 地貌
- 势力
- 居民
- 文化
- 风俗
- 官方地图
- 官方美术
- 战役背景

这一层回答：

> **“这个地方本来是什么？”**

---

## LEVEL C｜SUBSCENE BIBLE
每一关只选一个子场景。

解决：
- 具体位置
- 具体时间
- 具体事件
- 此刻谁会在场
- 这个画面能看到什么
- 哪些东西不能出现

这一层回答：

> **“我们这一张具体画哪一刻？”**

---

## LEVEL D｜PRODUCTION PACK
直接用于出图。

包含：
- 60人逐人表
- Species scale
- Faction clothing sheet
- Props sheet
- Creature sheet
- Event islands
- Actor blocking
- Final prompt
- Hidden-object目标
- QC checklist

这一层回答：

> **“这一张具体怎么做出来？”**

---

# 3. 单关标准生产流程

整个项目固定为 12 个阶段。

---

## STAGE 01｜官方资料采集

### 输入
- 已锁定地点名
- MASTER RULE DATABASE

### 工作
搜索并整理：
- 官方Source
- 对应章节
- 官方地图
- 官方插图
- 地点描述
- 战役时点
- 势力
- 种族/居民
- NPC
- 怪物
- 文化/风俗
- 环境
- 特产/工具/交通

### 输出
`SXX_LOCATION_RESEARCH.md`

### Gate 01：资料完整性
必须回答：
- 这是哪里？
- 谁控制？
- 谁住这里？
- 人们如何生活？
- 有什么独特规则/习惯？
- 有什么官方视觉参考？
- 哪些信息仍缺失？

未通过，不进入下一步。

---

## STAGE 02｜子场景筛选

从该地点的多个区域里，只选一个。

### 评分维度
每项1–5分：
- 典型性
- 可聚人
- 事件密度
- 视觉识别
- 世界观代表性
- 与其他14关差异度

### 选择规则
优先选：
- 最能代表地点
- 能自然容纳55–70人
- 能同时产生8–12个行为小组
- 有官方地图/视觉支撑
- 不与已有场景重复

### 输出
`SXX_SUBSCENE_DECISION.md`

必须包含：
- 候选A/B/C
- 为什么淘汰
- 为什么最终选当前子场景

### Gate 02：单一性
一关只能锁：
- 一个子场景
- 一个时间段
- 一个主要事件

禁止“大厅+街区+码头+地下室全塞一张”。

---

## STAGE 03｜场景状态锁定

### 必须锁定
- 时间：早/午/傍晚/夜
- 天气
- 战役状态
- 当前事件
- 事件开始前/进行中/结束后
- 人群为什么聚集

### 模板
```text
地点：
时间：
天气：
战役时点：
当前事件：
人群聚集原因：
主要矛盾：
画面情绪：
```

### Gate 03
必须能用一句话说清：

> “这一张图正在发生什么？”

如果一句话说不清，继续收敛。

---

# 4. 人口生态建模

这一步先做“谁应该在这里”，再做“画谁”。

## 4.1 人口五层

### A. 常住居民
这里真正生活的人。

### B. 机构人员
守卫、神职、学者、工匠、工作人员。

### C. 临时访客
商队、冒险者、旅行者、使者。

### D. 特殊剧情人员
间谍、邪教徒、囚犯、特使、Wyrmspeaker等。

### E. 非人形生物
恐龙、龙、Fey、fiend、giant等。

---

## 4.2 种族分配规则

不先做比例表。

顺序：
1. 地点
2. 势力
3. 常住/外来
4. 社会身份
5. 官方特有种族
6. 才决定数量

### 禁止
- “为了丰富”平均分种族
- 11种Species人人都有
- 把BG3 playable race list当人口统计

---

# 5. 60人白底资产系统

## 5.1 一场景一套演员

每关60人是：
> **这张图专属casting sheet**

不是全项目演员库。

---

## 5.2 标准拆分

建议：
- Sheet A：01–20
- Sheet B：21–40
- Sheet C：41–60

统一：
- 白背景
- 同一地面线
- 全身
- 轻微3/4
- 无透视
- 无场景
- 编号清楚
- 身高比例真实可比

---

## 5.3 每人必须有的字段

```text
ID:
Species:
Sex:
Age:
Height:
Body type:
Faction:
Social role:
Class / NPC archetype:
Clothing:
Armor:
Weapon:
Tool:
Carry item:
Current action tendency:
Expression:
Interaction target:
Visual priority:
```

---

## 5.4 人物差异层级

### Level 1｜Species固定
不可随意漂移：
- 身高
- 骨架
- 头身
- 耳/角/尾
- 典型脸型
- 皮肤/鳞片范围

### Level 2｜文化/组织固定
- 制服
-纹样
-颜色体系
-装备语言

### Level 3｜身份变化
-职业
-工具
-道具
-动作

### Level 4｜个体变化
-年龄
-发型
-胡须
-体格
-表情

### 原则
**不要为了“60个都不一样”破坏种族和组织统一性。**

---

# 6. Species Scale 标准

每一关都先做一张身高基准板。

## Human基准
100%

## 示例
具体数值按当前官方种族与场景调整：
- Halfling：明显小型
- Gnome：小型
- Dwarf：矮而宽
- Human：基准
- Elf：略修长
- Dragonborn：高大
- Orc：高大
- Goliath：显著高
- Storm Giant：巨型

## 目的
防止最终图里出现：
- Dwarf忽高忽矮
- Gnome像儿童
- Dragonborn像普通Human
- Giant只有2米多

---

# 7. 服装与Faction语言

先锁“群体设计”，再锁个人。

## 每个Faction先定义
- 主材质
- 颜色范围
- 装甲等级
- 常见徽记
- 常见头饰
- 常见腰带/包具
- 常见工具
- 禁止元素

## 例如
Flaming Fist：
- 先做统一军用语言
- 再在Veteran / Guard / Officer之间变化

Avowed：
- 先统一“知识机构”
- 再区分Reader / Gatewarden / Chanter

Duergar：
- 先统一地下工业文明
- 再区分miner / smith / guard / official

---

# 8. 道具与法术系统

## 8.1 道具来源优先级

1. 官方地点特有物
2. SRD Equipment
3. SRD Tools
4. 合理生活物
5. PROJECT补充

## 8.2 每个角色最多1–3个主识别道具
避免：
- 背包+剑+盾+弓+卷轴+药水+法杖全挂一个人

---

## 8.3 法术必须“有目的”

### 正确
- Mage Hand搬书
- Mending修网
- Detect Magic验古物
- Bless战前准备
- Minor Illusion模拟路线
- Druidcraft判断天气

### 错误
- 法师手里无意义光球
- 10个人同时发光
- 法术只为“奇幻感”

---

# 9. Event Island 系统

最终场景不按“60个人”组织，而按 **8–12组事件岛**组织。

## 每个事件岛
建议3–7人。

### 必须包含
- 主动作
- 次动作
- 视线关系
- 一个小冲突/反应
- 至少一个可读道具

### 事件岛类型
- 工作
- 交易
- 社交
- 检查
- 修理
- 娱乐
- 仪式
-争论
-观察
-隐藏行为
-轻幽默

---

## 9.1 事件岛优先级

### A级
3–4个主事件岛  
第一眼就读到。

### B级
4–5个中事件岛  
第二层阅读。

### C级
2–4个小事件岛  
用于找物和细节奖励。

---

# 10. Actor Blocking 标准

在画背景前，先做人物平面调度图。

## 10.1 构图原则
- 弱透视
- 横向舞台式展开
- 不是深景街道透视
- 人物永远是主体

## 10.2 人物尺度
建议：
- 前层：105–110%
- 主中层：100%
- 后层/平台：85–90%

不要连续缩小到30%。

## 10.3 每个区域最大人数
避免一个点塞20个人。

建议：
- 一个事件岛3–7人
- 视觉主岛最多8人
- 每组之间留负空间/道具隔断

---

# 11. 背景生产标准

背景必须服务人物。

## 背景信息优先级
1. 地点识别锚
2. 人物工作所需结构
3. 路径
4. 功能性道具
5. 装饰

## 禁止
- 先画巨大建筑再把人缩成蚂蚁
- 过深透视
- 高复杂度建筑抢过人物
- 大面积无意义景观

---

# 12. 最终生成顺序

正式生产一关固定：

### Step 1
`LOCATION RESEARCH`

### Step 2
`SUBSCENE DECISION`

### Step 3
`SCENE STATE`

### Step 4
`POPULATION MODEL`

### Step 5
`SPECIES SCALE`

### Step 6
`FACTION / CLOTHING BOARD`

### Step 7
`60 CHARACTER SHEETS`

### Step 8
`PROPS + CREATURES`

### Step 9
`EVENT ISLANDS`

### Step 10
`ACTOR BLOCKING`

### Step 11
`BACKGROUND LAYOUT`

### Step 12
`FINAL FULL SCENE`

### Step 13
`FACE / PROPORTION / EXPRESSION CORRECTION`

### Step 14
`HIDDEN OBJECT TARGETS`

### Step 15
`UI STRIP`

顺序不可倒置。

---

# 13. 为什么UI最后做

Hidden-object目标不能在前期主导人物设计。

先确保：
- 世界可信
- 人物可信
- 场景好看
- 事件成立

然后才选择：
- 哪些道具适合藏
- 哪些人物适合找
- 哪些局部适合截图作为UI clue

否则会为了“藏东西”破坏整个场景。

---

# 14. Style Lock

## 固定风格
- 欧式奇幻冒险群像漫画
- 干净稳定黑色线稿
- 平涂 + 少量赛璐璐阴影
- 5–5.5头身
- 头略大但不Q版
- 脸/手清楚
- 弱透视
- 舞台式横向空间
- 温暖、明快、活跃
- 不写实、不3D、不油画

## 背景
比人物简化一级。

## 角色
要：
-有动作
-有视线
-有关系
-不摆拍

---

# 15. QA / 验收标准

每一阶段结束前必须过Gate。

## QA-A｜Lore
- [ ] 地点与官方来源一致
- [ ] 不混入不属于该地点的势力
- [ ] 种族逻辑合理
- [ ] 怪物出现有依据
- [ ] 文化/风俗不是泛奇幻想象

## QA-B｜Population
- [ ] 60人不是60个PC
- [ ] 本地居民是主体
- [ ] 特殊种族数量合理
- [ ] Faction有统一视觉
- [ ] 同种族骨架一致

## QA-C｜Composition
- [ ] 人物是主体
- [ ] 后排人物仍可读
- [ ] 无夸张近大远小
- [ ] 8–12事件岛清楚
- [ ] 没有大块空白
- [ ] 没有20人挤成一团

## QA-D｜Character
- [ ] 人脸清楚
- [ ] 表情不重复
- [ ] 身高比例正确
- [ ] 手脚没有明显错误
- [ ] 装备与身份匹配
- [ ] 没有无意义魔法

## QA-E｜Environment
- [ ] 一眼能认出地点
- [ ] 材质符合官方描述
- [ ] 建筑不抢人物
- [ ] 光线不影响找物
- [ ] 背景细节比人物低一级

## QA-F｜Hidden Object
- [ ] 目标不靠超小像素
- [ ] 目标不是纯颜色差
- [ ] 目标藏得合理
- [ ] clue crop不直接泄底
- [ ] UI不遮主画面重要事件

---

# 16. 返工优先级

出现问题时禁止“重开一套方法论”。

按这个顺序改：

1. **人物比例**
2. **种族特征**
3. **脸与表情**
4. **事件动作**
5. **人物密度**
6. **构图**
7. **背景细节**
8. **颜色**
9. **Hidden-object**
10. **UI**

局部问题优先局部修，不重新开V5/V6体系。

---

# 17. 版本管理

## 文件命名
```text
MASTER/
DND5E_MASTER_RESEARCH_AND_15_SCENES_V1.md

SCENES/
S01_BALDURS_GATE/
S01_LOCATION_RESEARCH_V1.md
S01_SUBSCENE_DECISION_V1.md
S01_SCENE_BIBLE_V1.md
S01_60_CHARACTERS_V1.md
S01_BLOCKING_V1.md
```

## 版本规则
- V1：第一次正式可用
- V1.1：小修改
- V2：结构性改动

不要：
- final_final2
- new_new
- 终版改2

---

# 18. 审批点：GATE 0–7

当前正式Gate以 `MASTER/GATE-SYSTEM-V1.md` 为准：

- **GATE 0 — Lore Lock**：官方地点与证据边界
- **GATE 1 — Scene Lock**：唯一子场景 + 时间切片 + 主事件
- **GATE 2 — Population Lock**：人口生态 + Species Scale + Faction/Culture视觉
- **GATE 3 — Asset Lock**：场景专属人物资产 + 道具 + 生物
- **GATE 4 — Blocking Lock**：8–12事件岛 + 人物Blocking
- **GATE 5 — Scene Lock / Visual QC**：完整场景本身通过视觉QC
- **GATE 6 — Hidden-Object Lock**：目标集合 + 隐藏逻辑 + clue + 难度
- **GATE 7 — Level Lock**：最终场景 + targets + answer map + UI + metadata

**硬规则：前一个Gate未明确通过，不得进入依赖它的下游生产。**

---

# 19. 15关的整体节奏管理

不要连续制作视觉相似场景。

推荐交错顺序：

1. Candlekeep
2. Port Nyanzaru
3. Gracklstugh
4. Well of Dragons
5. Vallaki
6. Rock of Bral
7. Icewind Dale
8. Witchlight Carnival
9. Baldur’s Gate
10. Maelstrom
11. Saltmarsh
12. Radiant Citadel
13. Calimport
14. Myth Drannor
15. Avernus

目的：
- 连续验证不同人口模型
- 防止风格疲劳
- 早期覆盖机构 / 城市 / 单种族 / 战争 / 恐怖 / Spelljammer / 冰雪 / Fey等不同难度

---

# 20. Definition of Done

一关只有通过 **GATE 7 — Level Lock** 才算完成：

- [ ] 官方地点资料经过核验
- [ ] 子场景唯一且明确
- [ ] 当前事件一句话能说明
- [ ] 场景专属人物表完成（默认约60人，通常55–70）
- [ ] Species Scale完成
- [ ] Faction / Culture视觉统一
- [ ] 道具与生物资产完成
- [ ] 8–12事件岛完成
- [ ] Blocking完成
- [ ] 最终图人物可读
- [ ] 表情/比例/Species通过Scene QC
- [ ] Hidden-Object目标集合通过GATE 6
- [ ] 每个必找目标拥有有效答案位置
- [ ] clue / target thumbnail按需完成
- [ ] UI完成且不遮挡关键事件
- [ ] `targets.json` / `answer-map.json` / `level-metadata.json` 一致
- [ ] 最终文件、Prompt和生产资产归档

---

# 21. 最终标准流程一句话版

> **官方资料 → 子场景筛选 → 场景状态 → 人口生态 → Species Scale → Faction视觉 → 场景专属人物资产 → 道具/生物 → 事件岛 → 人物Blocking → 背景 → 完整场景 → Scene QC → Hidden-Object → Level数据/UI → GATE 7 → QA归档**

以后15关全部按这一条执行，不再为单个问题重新发明流程。