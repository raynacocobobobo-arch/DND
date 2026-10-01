# DND5E_MASTER_RESEARCH_AND_15_SCENES_V1.md

版本：V1  
项目：D&D / 5E Hidden-Object 15张大型群像插画  
用途：**5E规则资产底库 + 15个已锁定官方子场景的完整美术研究底稿**。  
目标：后续任何一关进入“60人白底资产板 → 人物布局 → 完整场景”时，不再从泛奇幻印象出发，而是从本文件中已有的5E规则、官方地点生态、组织与场景行为出发。

---

# A. 资料边界：什么是“官方开放”，什么不是

## A1. 官方开放 SRD

Wizards of the Coast 官方发布：

- **SRD 5.1**：对应2014版5E核心规则内容。
- **SRD 5.2.1**：对应2024修订版核心规则内容。
- 两者均可在 **CC BY 4.0** 下使用。
- Wizards官方允许同时使用SRD 5.1和5.2.x内容，但两版规则存在机械差异，兼容需要自行处理。

官方入口：
- https://www.dndbeyond.com/srd

## A2. GitHub上的“SRD开源版”到底是什么

目前没有找到 Wizards 自己维护的官方 GitHub SRD 仓库。  
本项目使用的是 **官方SRD内容的社区Markdown / JSON转换**，用于全文检索和结构化研究。

主要仓库：

### 1. 2014 SRD 5.1 Markdown
`oldmanumby/dnd.srd.5.1`
https://github.com/oldmanumby/dnd.srd.5.1

核心目录：
- `01_Races`
- `02_Classes`
- `03_Characterization`
- `04_Equipment`
- `05_Feats`
- `06_Gameplay`
- `07_Spells`
- `08_Gamemastering`
- `09_Magic_Items`
- `10_Monsters`

### 2. 2024 SRD 5.2.1 Markdown
`oldmanumby/dnd.srd.5.2.1`
https://github.com/oldmanumby/dnd.srd.5.2.1

核心目录：
- `01_Playing_The_Game`
- `02_Creating_A_Character`
- `03_Character_Classes`
- `04_Character_Origins`
- `05_Feats`
- `06_Equipment`
- `07_Spells`
- `08_Rules_Glossary`
- `09_Gameplay_Toolbox`
- `10_Magic_Items`
- `11_Monsters`
- `12_Animals`

### 3. 其他可检索版本
- `downfallx/dnd-5e-srd-markdown`
- `5e-bits/5e-database`
- `5e-bits/5e-srd-api`

其中：
- SRD正文内容来自Wizards官方开放材料；
- GitHub仓库本身是社区转换，不等于Wizards官方仓库。

## A3. SRD不包含什么

SRD是规则底座，不是完整世界设定数据库。  
**以下地点、组织、人物和战役属于官方D&D设定/冒险内容，但不是因为SRD而开放：**

- Baldur’s Gate
- Candlekeep
- Calimshan / Calimport
- Myth Drannor
- Icewind Dale
- Port Nyanzaru
- Barovia / Vallaki
- Saltmarsh
- Gracklstugh
- Maelstrom
- Avernus具体战役内容
- Witchlight Carnival
- Rock of Bral
- Radiant Citadel
- Well of Dragons
- Flaming Fist、Cult of the Dragon、Merchant Princes 等

这些信息必须来自：
- 官方D&D Beyond Source页面
- Wizards / D&D Beyond官方文章
- 正版冒险书正文与地图

**因此本项目始终采用双层资料：**

> SRD = 规则、种族、职业、装备、工具、法术、NPC原型、环境机制  
> 官方冒险/设定 = 地点、势力、文化、居民、战役、建筑、特有种族与怪物

---

# B. 版本使用原则

## B1. 2014 SRD 5.1主要负责
- 经典5E九个基础可用种族
- 12职业
- 传统NPC附录
- 旅行 / 环境 / 休息 / downtime
- Planes、Traps、Poisons等GM层内容
- 传统5E视觉语法

## B2. 2024 SRD 5.2.1主要负责
- 更新后的Species标准与身高范围
- Goliath、Orc
- Drow / High Elf / Wood Elf作为Elf lineage
- 更完整的工具Use/Craft行为
- 新版装备
- Weapon Mastery
- 环境效果
- 新怪物
- 更清晰的“角色起始装备视觉词典”

## B3. 本项目不是规则模拟器
我们不会为了画面强行判定：
- 角色具体等级
- AC
- DC
- 每日法术位
- 数值Build

只提取对画面真正有意义的：
- 体型
- 装备
- 职业动作
- 工具
- 法术行为
- 种族特征
- NPC社会身份
- 环境与生存行为

---

# C. Species / Race 视觉底库

> 原则：**种族特征稳定优先，个体差异适度。**  
> 同一种族的人不应该为了“防重复”被画成完全不同物种。

| Species / Race | 官方尺寸信息 | 核心视觉稳定项 | 适合的自然差异 |
|---|---|---|---|
| Human | 5.1约5英尺到6英尺以上；5.2.1范围更宽 | 人类基准骨架，体型变化最大 | 年龄、职业、地区服饰、肤色、体格 |
| Dwarf | 约4–5英尺 | 矮、厚、低重心、躯干宽 | 胡须、发型、工匠/战士/学者身份 |
| Elf | 约5–6英尺，整体修长 | 长线条、尖耳、轻体量 | Drow/High/Wood lineage、发色、职业 |
| Halfling | 5.2.1约2–3英尺 | 很矮、小体型，但不能像儿童 | 体型胖瘦、旅行者/商人/冒险者 |
| Gnome | 约3–4英尺 | 小型、头部略大、灵巧聪慧感 | Forest/Rock，工具、发明、学者身份 |
| Dragonborn | 5.2.1约5–7英尺；5.1强调比人类更高更重 | 龙形头骨、鳞片、宽厚但人形 | 10种draconic ancestry影响外观 |
| Tiefling | 人类尺寸范围 | 角、尾、infernal/fiendish轮廓 | 角型、皮肤色、Fiendish Legacy |
| Half-Elf（2014） | 约5–6英尺 | 人类与Elf的中间骨架 | 耳、面部、职业/地区 |
| Half-Orc（2014） | 5英尺到6英尺以上，偏大偏厚 | 宽肩、强壮、Orc面部特征 | 不要全部做野蛮人 |
| Orc（2024） | 约6–7英尺 | 高大、强壮、明显Orc轮廓 | 战士、商人、守卫、冒险者等 |
| Goliath（2024） | 约7–8英尺 | 显著高于Human、巨人血统感 | Cloud/Fire/Frost/Hill/Stone/Storm ancestry |

## C1. Dragonborn
SRD 5.1和5.2.1都提供10类龙祖：
- Black — Acid
- Blue — Lightning
- Brass — Fire
- Bronze — Lightning
- Copper — Acid
- Gold — Fire
- Green — Poison
- Red — Fire
- Silver — Cold
- White — Cold

**美术应用：**
- 不要“人类身体+蜥蜴头”。
- 头骨、颈部、胸廓、鳞片组织要统一。
- 祖系区别可以体现在鳞色、角、头部轮廓，但同场景不要10个人10种完全不相关设计。
- 5.2.1的Draconic Flight是**短时光谱能量翼**，不是所有Dragonborn永久长实体翅膀。

## C2. Dwarf
SRD明确锚点：
- 4–5英尺
- 地下适应 / Darkvision
- Stonecunning
- 传统训练与 smith / brewer / mason 关系紧密

**美术应用：**
- 短腿但不是儿童比例
- 手臂和手掌偏厚
- 重装备和工具承载自然
- Gracklstugh的Duergar另按官方地点种族设计，不直接等同普通Dwarf

## C3. Elf
2024 SRD明确三种lineage：
- **Drow**：更强Darkvision；Dancing Lights / Faerie Fire / Darkness
- **High Elf**：Prestidigitation / Detect Magic / Misty Step
- **Wood Elf**：更快移动；Druidcraft / Longstrider / Pass without Trace

**美术应用：**
- Drow仍保持Elf骨架，不画成另一物种。
- High Elf可以通过学术/魔法行为表达，而不是人人华丽长袍。
- Wood Elf优先通过户外装备、行动和环境关系表达。

## C4. Gnome
- Forest Gnome：Minor Illusion、Speak with Animals
- Rock Gnome：Mending、Prestidigitation、小型clockwork device

**美术应用：**
Rock Gnome是非常好的“行为型视觉资产”：
- 修小装置
- 制作火种
- 小音乐盒
- 小机械玩具
而不是自动等同“Artificer”。

## C5. Goliath
2024 SRD：
- 7–8英尺
- Giant ancestry
- 35 ft speed
- Powerful Build

**美术应用：**
适合Icewind Dale等有巨人文化联系的场景做少量强尺度锚点。  
不能把Goliath做成Human只放大10%。

---

# D. 12职业：官方起始装备 → 视觉行为词典

| Class | SRD 5.2.1核心起始装备 | 出图最有效的识别方式 |
|---|---|---|
| Barbarian | Greataxe、4 Handaxes、Explorer’s Pack | 大型近战装备、轻/中甲、强行动性；不必赤膊 |
| Bard | Leather、2 Daggers、Musical Instrument、Entertainer’s Pack | 乐器+交流/鼓舞/表演；不是只会弹琴 |
| Cleric | Chain Shirt、Shield、Mace、Holy Symbol、Priest’s Pack | 圣徽、治疗、祝福、仪式、护卫 |
| Druid | Leather、Shield、Sickle、Druidic Focus、Explorer’s Pack、Herbalism Kit | 草药、动物、自然判断、focus |
| Fighter | Chain Mail+Greatsword/Flail/Javelins 或轻甲+双刀+Longbow | 武器训练、维修、站位、实用装备 |
| Monk | Spear、5 Daggers、artisan tool/乐器、Explorer’s Pack，无甲 | 轻装、身体控制、工具/旅行 |
| Paladin | Chain Mail、Shield、Longsword、Javelins、Holy Symbol、Priest’s Pack | 重甲、圣徽、护卫、誓言/祝福 |
| Ranger | Studded Leather、Scimitar、Shortsword、Longbow、Druidic Focus、Explorer’s Pack | 追踪、观察、弓具、野外工具 |
| Rogue | Leather、Daggers、Shortsword、Shortbow、Thieves’ Tools、Burglar’s Pack | 开锁、检查、隐藏工具、攀爬 |
| Sorcerer | Spear、Daggers、Arcane Focus(crystal)、Dungeoneer’s Pack | 更本能/直接施法，少学术道具 |
| Warlock | Leather、Sickle、Daggers、Arcane Focus(orb)、Occult Book、Scholar’s Pack | Pact物、奇异书籍、occult研究 |
| Wizard | Daggers、Quarterstaff focus、Robe、Spellbook、Scholar’s Pack | Spellbook、抄录、研究、ritual |

## D1. 职业不等于制服
同一职业人物必须允许：
- 武器不同
- 装甲不同
- 社会身份不同
- 年龄不同
- 文化服装不同

真正稳定的是**行为与装备逻辑**。

## D2. 典型可视行为
- Barbarian：搬重物、强行撬开、粗暴但有效地固定装备
- Bard：谈判、鼓舞、记录、演出、打听消息
- Cleric：Bless、Cure Wounds、检查伤员、主持祷告
- Druid：识别植物、与动物沟通、判断天气、处理自然异常
- Fighter：整备武器、检查盾牌、训练/护卫
- Monk：轻装训练、控制动作、观察
- Paladin：护卫、祝圣、组织前线、保护弱者
- Ranger：看踪迹、地图、远望、检查箭矢
- Rogue：Thieves’ Tools、检查机关、摸包、隐藏观察
- Sorcerer：少道具的直接施法
- Warlock：Pact book / focus / familiar /隐秘仪式
- Wizard：Spellbook、Detect Magic、Identify、抄写卷轴、Mage Hand

---

# E. Backgrounds：直接可转成白底角色资产

## Acolyte
官方视觉物：
- Calligrapher’s Supplies
- prayer book
- Holy Symbol
- parchment
- robe

适合：
- Candlekeep
- Vallaki church
- Well of Dragons后勤神职
- 城市神殿角色

## Criminal
官方视觉物：
- 2 Daggers
- Thieves’ Tools
- Crowbar
- Pouches
- Traveler’s Clothes

适合：
- Baldur’s Gate Guild
- Saltmarsh smuggler
- Rock of Bral Low City
- Avernus scavenger的“规则动作参考”

## Sage
官方视觉物：
- Quarterstaff
- Calligrapher’s Supplies
- history book
- parchment
- robe

适合：
- Candlekeep
- Myth Drannor
- Radiant Citadel
- Calimport inventor/scholar

## Soldier
官方视觉物：
- Spear
- Shortbow
- Arrows
- Gaming Set
- Healer’s Kit
- Traveler’s Clothes

适合：
- Baldur’s Gate Flaming Fist
- Bryn Shander guard
- Well of Dragons联军
- Saltmarsh guard

---

# F. NPC社会角色底库（SRD 5.1）

> 这是大型群像最重要的一层。  
> **一个可信的5E人群，不是60个PC职业。**

| NPC | SRD社会含义 | 视觉用途 |
|---|---|---|
| Acolyte | 低阶神职，通常服从Priest，承担神殿功能 | 祷告、搬圣物、照顾伤员 |
| Archmage | 顶级施法者 | 远距魔法、研究、权威 |
| Assassin | 潜伏杀手 | 隐藏武器、观察目标 |
| Bandit | 流动作案群体，也可因贫困/灾害进入匪业 | 盐沼走私、道路威胁 |
| Bandit Captain | 领导匪徒/海盗 | 指挥、谈判、奖惩 |
| Berserker | 粗野战斗群体 | 战争/边境角色 |
| Commoner | peasants、servants、pilgrims、merchants、artisans、hermits等 | **群像主体来源** |
| Cultist | 隐藏信仰黑暗力量 | Baldur / Well of Dragons暗线 |
| Cult Fanatic | cult领导层 | 组织、仪式、煽动 |
| Druid | 森林/荒野保护者或tribal shaman | Myth Drannor / wilderness |
| Gladiator | 表演型战士 | 节庆/竞技类 |
| Guard | 城市watch、城堡哨兵、商人/贵族护卫 | 所有秩序场景 |
| Knight | 服务统治者/宗教/贵族目标，常带squire/hireling | 联军、贵族、外交 |
| Mage | 魔法研究者，可做顾问或隐居研究者 | Candlekeep / Calimport |
| Noble | 上层社会，有guards和servants | Baldur / Calimport /外交 |
| Priest | 神殿/圣所精神领袖，通常有acolytes | Vallaki / 联军 |
| Scout | 猎手/追踪者，可做guide、bounty hunter、recon | Icewind / Myth Drannor |
| Spy | rulers、nobles、merchants、guildmasters雇佣的信息角色 | Baldur / Bral / Saltmarsh |
| Thug | paid enforcer | Guild、走私、黑帮 |
| Tribal Warrior | fishing/hunting subsistence group | Reghed等需结合官方文化，而非直接套皮 |
| Veteran | 职业战士、退伍军、佣兵 | 军事/护卫/远征 |

---

# G. 装备：Hidden-Object最有用的SRD物件库

## G1. 高频可读小道具
- Backpack
- Bedroll
- Blanket
- Bell
- Book
- Bottle
- Bucket
- Candle
- Chain
- Chest
- Crowbar
- Flask
- Grappling Hook
- Healer’s Kit
- Holy Symbol
- Ink / Ink Pen
- Lamp
- Lantern
- Lock
- Magnifying Glass
- Manacles
- Map
- Mirror
- Net
- Oil
- Paper / Parchment
- Potion of Healing
- Pouch
- Quiver
- Rations
- Rope
- Sack
- Shovel
- Signal Whistle
- Spell Scroll
- Spikes
- Spyglass
- Tent
- Tinderbox
- Torch
- Vial
- Waterskin

## G2. 冒险包是“组合逻辑”
不要把Explorer’s Pack、Scholar’s Pack当成一个神秘大包。
画面应该拆成里面最可读的实际物件：
- rope
- rations
- bedroll
- lantern
- parchment
- ink
- books
- tools

## G3. Hidden-object价值最高
推荐以后从官方物品里做隐藏目标：
- Bell
- Ball Bearings
- Caltrops
- Magnifying Glass
- Manacles
- Map Case
- Signal Whistle
- Holy Symbol
- Component Pouch
- Spyglass
- Grappling Hook
- Potion
- Tiny clockwork device
这些既符合5E，又可以自然藏入场景。

---

# H. Tools：不要只让角色“拿着工具”，要做实际行为

| Tool | SRD 5.2.1明确用途/制作方向 | 场景应用 |
|---|---|---|
| Alchemist’s Supplies | 识别物质、起火；制作acid等 | Calimport / Avernus |
| Brewer’s Supplies | 识别酒、检查毒酒 | Vallaki / tavern情境 |
| Calligrapher’s Supplies | 防伪书写；Ink / Spell Scroll | Candlekeep / Radiant |
| Carpenter’s Tools | 开/封门箱；木制物 | Saltmarsh / camp |
| Cartographer’s Tools | 绘制地图 | Myth Drannor / Icewind / Well |
| Cobbler’s Tools | 改鞋、climber kit | Icewind / expedition |
| Cook’s Utensils | 处理食物、rations | camps / carnival |
| Glassblower’s Tools | 瓶、vial、spyglass | Calimport / Bral |
| Jeweler’s Tools | 鉴定宝石；focus/holy symbol | Radiant Citadel |
| Leatherworker’s Tools | leather gear、quiver、waterskin | Icewind / expedition |
| Mason’s Tools | 石工 | Gracklstugh / Myth Drannor |
| Painter’s Supplies | 图像、symbol | Witchlight / religious |
| Potter’s Tools | jug/lamp | market |
| Smith’s Tools | 武器、重甲、链、钩、铁钉等 | Gracklstugh / Well |
| Tinker’s Tools | 小机械、锁、manacles、lantern | Calimport / Gnome |
| Weaver’s Tools | clothes、rope、net、tent | Saltmarsh / camps |
| Woodcarver’s Tools | 木武器、箭、foci | Icewind / wilderness |
| Disguise Kit | 化妆/伪装 | Baldur / spies |
| Forgery Kit | 仿字、仿wax seal | Baldur / Bral |
| Gaming Set | dice / dragonchess / cards / three-dragon ante | tavern / soldiers |
| Herbalism Kit | plant、healer kit、potion | Port Nyanzaru / wilderness |
| Musical Instrument | 演奏/即兴 | Witchlight / Bard |
| Navigator’s Tools | 航海 | Saltmarsh / Bral |
| Poisoner’s Kit | 毒物 | Guild/cult暗线 |
| Thieves’ Tools | 开锁与机械小装置 | Baldur / Bral / ruins |

---

# I. 交通、劳工与后勤

## I1. SRD坐骑
- Camel
- Elephant
- Draft Horse
- Riding Horse
- Mastiff
- Mule
- Pony
- Warhorse

## I2. 地面车辆
- Carriage
- Cart
- Chariot
- Sled
- Wagon

## I3. 水/空交通
- Airship
- Galley
- Keelboat
- Longship
- Rowboat
- Sailing Ship
- Warship

## I4. Hirelings
SRD明确把：
- mercenary
- artisan
- scribe
归为skilled hireling；
把：
- laborer
- porter
归为untrained hireling。

**这是60人群像构成的直接依据。**

---

# J. 法术：只使用“有目的的可视行为”

## J1. 优先级最高
- **Mage Hand**：搬、取、递、操纵
- **Mending**：修装备/工具/布料
- **Minor Illusion**：展示路线、诱导、娱乐
- **Prestidigitation**：小型生活魔法
- **Detect Magic**：检查物品/遗迹
- **Identify**：鉴定物品
- **Find Familiar**：侦察/送信/观察
- **Bless**：战前准备
- **Guidance**：协助技能行为
- **Cure Wounds / Healing Word**：明确治疗
- **Light / Dancing Lights**：照明而非“发光装饰”
- **Druidcraft**：自然征兆、小型自然行为
- **Thaumaturgy**：宗教/威慑/仪式
- **Comprehend Languages**：碑文/文书
- **Locate Object**：搜寻
- **Stone Shape**：石工/遗迹/地下
- **Fabricate**：高魔法工艺
- **Unseen Servant / Floating Disk**：搬运与后勤
- **Water Walk / Water Breathing**：海洋场景
- **Speak with Animals**：动物/恐龙/荒野场景

## J2. 禁止
- 无目的光球
- 人人抬手发光
- 魔法只用于“让画面更奇幻”
- 法术效果大到遮住人物脸

---

# K. 冒险循环：SRD直接告诉我们人物为什么会在场景里做这些事

## K1. 时间尺度
2014 SRD直接把：
- dungeon行动 → 分钟
- city / wilderness → 小时
- long journey → 天
区分开。

官方示例还直接提到：
- 森林深处的孤塔
- Baldur’s Gate → Waterdeep的长途道路与Goblin伏击
- ancient dwarven stronghold
- 深长地下走廊与狭窄石桥

## K2. 旅行
- normal / fast / slow pace
- difficult terrain
- climbing
- swimming
- crawling
- jumping
- mounts
- vehicles

## K3. Rest
Short Rest本身可视化为：
- eating
- drinking
- reading
- tending wounds

Long Rest可视化为：
- sleeping
- eating
- talking
- standing watch

## K4. Downtime
2014 SRD明确：
- Crafting
- Practicing a Profession
- Recuperating
- Researching
- Training

这意味着：
- 酒馆/公会里有人工作并非“背景摆拍”
- 学者读卷轴不是装饰
- 铁匠修甲不是泛奇幻
- 训练、研究、休养都是正统5E冒险循环

---

# L. 环境效果：直接用于15关

2024 Gameplay Toolbox明确提供：
- Deep Water
- Extreme Cold
- Extreme Heat
- Frigid Water
- Heavy Precipitation
- High Altitude
- Slippery Ice
- Strong Wind
- Thin Ice

### 对应本项目
- Icewind Dale → Extreme Cold / Strong Wind / Slippery Ice
- Port Nyanzaru → Heavy Precipitation
- Maelstrom → Deep Water
- Avernus → Extreme Heat
- Myth Drannor → difficult terrain / foliage
- Gracklstugh → darkness / underground vision
- Saltmarsh → sea travel / water
- Rock of Bral → 以Spelljammer官方设定为主，SRD仅提供人员/工具基础

---

# M. Traps：遗迹与地下场景的官方视觉词典

2024 SRD Gameplay Toolbox示例：
- Collapsing Roof
- Falling Net
- Fire-Casting Statue
- Hidden Pit
- Poisoned Darts
- Poisoned Needle
- Rolling Stone
- Spiked Pit

这些不是要全部塞入图里，而是给：
- Myth Drannor
- Candlekeep特殊禁区
- Gracklstugh隧道
等场景提供“5E式危险物”依据。

---

# N. 15关总览：最终单一子场景

| ID | 地点 | 最终子场景 | 最终事件 |
|---|---|---|---|
| S01 | Baldur’s Gate | Basilisk Gate | 午后商队入城高峰 |
| S02 | Candlekeep | Court of Air / 入堡审核区 | Seekers献书入堡 |
| S03 | Calimport | 高魔法市场主街 | Genie使团穿过市场 |
| S04 | Myth Drannor | 外层遗迹研究营 | 新远征队建立研究点 |
| S05 | Icewind Dale | Bryn Shander城门集市 | 暴雪前最后一波贸易 |
| S06 | Port Nyanzaru | 恐龙赛道周边市集 | 赛前10分钟 |
| S07 | Vallaki | 城镇广场 | 强制节庆 |
| S08 | Saltmarsh | 主码头 | 可疑货箱被拦检 |
| S09 | Gracklstugh | Darklake District | 工业换班+矿铁交易 |
| S10 | Maelstrom | Storm Giant王庭 | 危机会见日 |
| S11 | Avernus | Wandering Emporium | 战争机器补给交易 |
| S12 | Witchlight Carnival | Giant Snail Race区 | 巨型蜗牛赛开跑 |
| S13 | Rock of Bral | Low City Docks | 三艘spelljammer同时靠泊 |
| S14 | Radiant Citadel | Concord Jewel抵达广场 | 新使团到港 |
| S15 | Well of Dragons | 联军前沿总集结营 | 总攻前最后一小时 |

---


# O. S01｜Baldur’s Gate — Basilisk Gate

## 官方依据
主要官方资料：
- *Baldur’s Gate: Descent into Avernus*
  - Ch.1 `A Tale of Two Cities`
  - `The Basilisk Gate`
  - `Baldur’s Gate Gazetteer`
  - Government / Citizenry / Economy and Trade / Religion / Dangers
  - Upper City / Lower City / Outer City
- 官方文章：`Baldur’s Gate: A Dark Tour Through Its Dangerous Streets`
- 官方文章：2025 Forgotten Realms地区介绍
- 官方文章：`Road to Baldur’s Gate Wrap-up: Avernus or Bust!`

## 精确位置与空间
Basilisk Gate是Baldur’s Gate外侧交通进入Lower City的重要门口/动脉。  
适合作为：
- Outer City人口
- 商队
- Flaming Fist
- Lower City商业人口
- 外来冒险者
相互交汇的“城市切面”。

### 画面边界
前景：
- 排队车辆、搬运工、旅人
中景：
- 检查点、门洞、Flaming Fist
后景：
- 城墙、Lower City密集建筑

## 城市社会习惯
- 城市阶层分区强烈。
- Flaming Fist代表强力城市秩序。
- Guild形成地下秩序。
- 贸易和通行本身就是城市日常。
- 进入、检查、收费、货物申报、走私与保护都可成为动作。

## 人口逻辑
### 本地常住
- laborer / porter
- merchant
- artisan
- street vendor
- clerk
- city guard / Flaming Fist
- servant
- Guild contact

### 外来
- caravan drivers
- adventurers
- pilgrims
- mercenaries
- nobles / retainers

### 种族
不做“11种族平均”。
建议：
- Human明显主体
- Dwarf / Elf / Half-Elf / Halfling为自然次级
- Tiefling / Half-Orc少量
- Dragonborn 0–2
- Githyanki一般0

## 特有势力
- Flaming Fist
- The Guild
- Dead Three cults
- devil cults
- upper-city political interests

## SRD映射
可直接使用：
- Guard
- Commoner
- Noble
- Spy
- Thug
- Cultist
- Veteran
- Criminal background
- Soldier background
- Forgery Kit
- Thieves’ Tools
- Manacles
- Map / Ledger / parchment
- carts / wagons / hirelings

## 合理法术
- Detect Magic：查可疑货物
- Mage Hand：搬小件/检查
- Mending：修破损包装
- Thaumaturgy：宗教/邪教暗线
- Disguise Self：间谍/罪犯（少量）

## 事件岛
1. Flaming Fist检查货车底部
2. clerk核对通行文书
3. 商人抱怨排队
4. porter扛箱时绳结松开
5. Guild thief盯上旅客腰包
6. 两个guards盘问一个可疑旅人
7. 冒险者看悬赏告示
8. noble retainer催促开路
9. cultist在人群后方交换密封包裹
10. 小型Mending正在修断掉的车带

## 60人板建议
- 14 commoners / workers
- 10 merchants / caravan
- 8 Flaming Fist
- 5 clerks / gate staff
- 6 Guild / criminal
- 5 cult/intelligence暗线
- 8 adventurers / travelers
- 4 nobles / servants

## 官方视觉参考
优先查：
- Baldur’s Gate city map
- Basilisk Gate相关官方图
- Lower City / city walls official art
- D&D Beyond `A Dark Tour...`
- 2025 Baldur’s Gate region art

## 禁止
- 不要像洁净旅游广场
- 不要港口化到撞Saltmarsh
- 不要让Guild都穿统一黑衣
- 不要把所有“坏人”画得一眼坏

---

# P. S02｜Candlekeep — Court of Air / 入堡审核区

## 官方依据
- *Candlekeep Mysteries*
  - Entering Candlekeep
  - Defenses and Decorum
  - Sages and Master Sages
  - The Avowed
  - Candlekeep Locations
  - 官方poster map
- 官方Candlekeep介绍文章

## 场景身份
Candlekeep不是“魔法学校”，首先是：
> **要塞化的大型知识保存机构。**

建在Sea of Swords岩崖上，以高墙和大量塔楼构成独特轮廓。

## 最重要风俗：准入制度
访客进入时要提供馆藏里没有的、具有价值的书面材料。  
因此“献书 / 验书 / 登记 / 引导”天然就是官方世界行为，不需要虚构节庆。

## Avowed组织
重要层级：
- Keeper of Tomes
- First Reader
- Great Readers
- Master Readers
- Chanter
- Gatewarden
- Avowed Adjutants

### Endless Chant
这是非常重要的视觉习俗：
- Chanter带领Avowed
- 队伍昼夜巡行
- 朗诵Alaundo相关预言

## 人口
### 常住
- Avowed reader
- scribe
- gate staff
- guide / adjutant
- master sage
- librarian-like worker
- book handler

### 来访
- Seekers
- sages
- adventurers
- clerics
- wizards
- couriers

### 种族
不需要Human-only。
但种族多样性必须服从“机构统一性”：
- 服饰、工具、动作比种族差异更重要。

## SRD映射
最适合：
- Sage background
- Acolyte background
- Mage
- Archmage
- Priest / Acolyte
- Calligrapher’s Supplies
- Book
- Parchment
- Ink
- Spell Scroll
- Magnifying Glass
- Scholar’s Pack

## 合理法术
- Detect Magic：验书/异常卷轴
- Identify：鉴定特殊文本/物件
- Comprehend Languages：处理异文
- Mage Hand：取高处书/递卷轴
- Mending：修破纸/书脊
- Light：档案照明

## 事件岛
1. Seeker递交一部装在皮盒里的手稿
2. 两名Avowed比对馆藏记录
3. scribe登记题名
4. 有人提交一本太普通的书被婉拒
5. Endless Chant横穿画面
6. Adjutant给获准者指路
7. Mage用Detect Magic检查异常墨迹
8. Calligrapher修补破页
9. porter搬一箱卷轴
10. 一个小型familiar偷偷停在高处观察

## 60人板
- 20 Avowed readers/scribes
- 6 gate staff
- 8 adjutants/guides
- 14 seekers/scholars
- 6 adventurers
- 4 senior sages
- 2 chanting/religious special roles

## 官方视觉参考
- Candlekeep poster map
- many-spired exterior
- Inner Ward isometric visual
- official Candlekeep Mysteries art
- Miirym可作为世界背景参考，不建议直接在本场景实体登场

## 禁止
- Hogwarts化
- 60个Wizard
- 书架堆满整个画面
- 大量无意义漂浮书
- 应突出“**制度化知识机构**”

---

# Q. S03｜Calimport — 高魔法市场主街

## 官方依据
*Forgotten Realms: Adventures in Faerûn*：
- People of Calimshan
- Genie Factions
- Mechanical Wonders
- Desert Survival
- Calimshan Gazetteer
- Calimport Gazetteer
- Docks and Seawall
- Wards
- Muzad

官方地区文章明确强调：
- deserts + fertile coasts
- oases / trade
- genie courts
- high-magic commerce
- inventors / mechanical wonders

## 子场景核心
不是“阿拉伯风bazaar”，而是：
> **一个普通市民也能接触小魔法、Genie势力公开存在、机械奇观参与商业的5E高魔法都市市场。**

## 主要社会群体
- urban merchants
- guilds
- nobles / magnates
- inventors
- caravaneers
- Kochar nomads
- treasure seekers
- genie court envoys

## Genie势力
- Djinn
- Marid
- Dao
- Efreet

不要把它们当“随机怪物”。
它们是政治/经济势力。

## 环境
- sun-baked stone
- shaded arcade
- fabric awnings
- brass / copper
- glazed surface
- fountain / water channel
- mechanical cart / clockwork
- dense trade stalls
- hot wind / dust
- high balconies

## SRD映射
- camel / wagon
- merchant/commoner/hireling
- Jeweler’s Tools
- Glassblower’s Tools
- Alchemist’s Supplies
- Tinker’s Tools
- Cartographer’s Tools
- perfume / vial / potion / scroll
- prestidigitation
- mage hand
- fabricate