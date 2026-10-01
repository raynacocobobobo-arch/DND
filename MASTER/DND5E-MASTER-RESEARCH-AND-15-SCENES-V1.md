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
- fabricate- mending

## 事件岛
1. genie使团被让出一条路
2. merchant用Prestidigitation清洁昂贵织物
3. inventor修clockwork trolley
4. apprentice用Mage Hand递瓶子
5. Dao相关商人评估矿物
6. caravaners给骆驼卸货
7. noble retainer和摊主谈价
8. glassblower检查药瓶
9. treasure seeker展开地图
10. city official维持人流

## 60人板
- 20 ordinary urban residents
- 8 merchants/guild
- 6 inventors/magic artisans
- 6 caravan/nomad
- 4 magnate/noble
- 8 genie-affiliated entourage
- 5 adventurers
- 3 officials/guards

大型Genie本体另做资产。

## 禁止
- 全员异域长袍
- 全是Genie
- 视觉变成现实历史城市复刻
- 必须看得出**D&D高魔法商业社会**

---

# R. S04｜Myth Drannor — 外层遗迹研究营

## 官方依据
当前Forgotten Realms官方资料：
- Dalelands
- Cormanthor / Myth Drannor
- 官方艺术文章 `Art of the Forgotten Realms: The Dalelands`

官方定位：
- classic heroic fantasy frontier
- pastoral Dales与巨大精灵遗迹形成反差
- Myth Drannor是fallen elven splendor的传奇megadungeon
- ancient elven ruins + fading mythal magic

## 子场景空间
选择**外层遗迹研究营**而不是核心废墟：
- 可以同时看到巨型精灵建筑
- 可以聚集60人
- 可以展示补给、研究、探险动作
- Forest和ruins同时成立

## 人群
- Dalefolk
- Cormanthor Elves
- rangers
- scholars
- wizards
- porters
- crafters
- adventurers
- opportunists / Zhentarim / Sembian interests
- hostile scouts

## 环境
- enormous ancient Elvish arches
- broken towers
- roots penetrating stone
- moss
- mist
- dark forest edge
- faded magical zones
- collapsed paths
- rope-marked danger area
- study tents / crates

## SRD映射
- Ranger / Druid / Wizard / Rogue
- Scout
- Cartographer’s Tools
- Mason’s Tools
- Rope
- Grappling Hook
- Climber’s Kit
- Map
- Magnifying Glass
- Detect Magic
- Comprehend Languages
- Mage Hand
- Mending
- Stone Shape
- traps

## 事件岛
1. Elf guide辨认古代建筑纹样
2. Wizard测量残余魔法
3. Cartographer在画遗迹平面
4. Rogue检查塌陷入口
5. porter搬研究箱
6. Druid发现树木被魔法影响
7. two scholars争论铭文
8. opportunist偷看地图
9. Ranger发现Goblin踪迹
10. Dryad远处观察营地

## 60人板
- 14 Dalefolk/logistics
- 12 Elves
- 10 adventurers
- 8 scholars/mages
- 6 crafters/surveyors
- 6 opportunists
- 4 hostile scouts

## 相关生物
官方地区生态可出现：
- Goblin
- Hobgoblin
- Bugbear
- Giant Spider
- Green Hag
- Grimlock
- Green Dragon Wyrmling
- Dryad

不要全部放前景。

## 禁止
- 完整华丽精灵城
- 纯“露营图”
- Elf全员高贵长袍
- 魔法遗迹做成霓虹科技

---

# S. S05｜Icewind Dale — Bryn Shander城门集市

## 官方依据
- *Icewind Dale: Rime of the Frostmaiden*
  - Ten-Towns Overview
  - Bryn Shander
  - poster maps
- 当前Forgotten Realms官方Icewind资料

## 地点身份
Bryn Shander：
- Ten-Towns最大聚落之一/重要中心
- 高地、风吹、贸易与进入冰原的门户性质强
- Ten-Towns经济与生存感必须比“漂亮雪景”重要

## 居民生态
- Ten-Townsfolk
- fishers
- trappers
- traders
- guards
- Dwarves of Kelvin’s Cairn
- Reghed people
- Goliaths
- guides / adventurers

## 风俗/生活
- fishing economy
- trade
- sled traffic
- fuel / food / fur
- 在天气变坏前赶路
- 旅行装备高度实用
- 保暖优先于装饰

## SRD环境映射
2024：
- Extreme Cold
- Strong Wind
- Slippery Ice
- Frigid Water
2014：
- food/water
- travel pace
- difficult terrain

## 装备
- sled
- rope
- rations
- hooded lantern
- oil
- bedroll
- tent
- climber’s kit
- leatherworker gear
- hunting trap
- longbow
- snow / ice travel gear（地方化视觉，非SRD特定商品）

## 合理法术
- Druidcraft：判断天气
- Mending：修雪橇带
- Goodberry：生存
- Create Food and Water：高价值但不应普及
- Light：暴雪/夜间
- Guidance：复杂生存操作

## 事件岛
1. guards催赶车辆入城
2. sled cargo卸货
3. fish seller清点货
4. dwarf miner交接矿物
5. Reghed trader展示皮毛
6. guide检查storm direction
7. leatherworker修靴
8. adventurers买oil/rations
9. dog team tangled in harness
10. 商贩开始收棚准备暴雪

## 60人板
- 22 Ten-Townsfolk
- 7 fishers/trappers
- 7 caravan/trade
- 6 guards
- 6 dwarves
- 4 Reghed
- 3 goliaths
- 5 adventurers/guides

## 相关怪物
可作为远景/线索：
- Yeti
- Winter Wolf
- Frost Giant
- White Dragon
- Ice Mephit
- Polar Bear
- Remorhaz

## 禁止
- 圣诞村
- 过多纯白
- 所有人穿同一款毛皮
- 人物被暴雪遮掉

---

# T. S06｜Port Nyanzaru — 恐龙赛道周边

## 官方依据
*Tomb of Annihilation*：
- Ch.1 Port Nyanzaru
  - Locations in the City
  - City Denizens
  - Merchant Prince’s Villa
  - Factions and Their Representatives
  - Things to Do
- Appendix B: Port Nyanzaru Encounters
- Appendix C: Flora and Fauna
- Appendix D: Monsters and NPCs
- Chult poster map

## 地点身份
Port Nyanzaru是Chult的重要城市和远征集结点。  
它不是“丛林村庄”。

## 子场景选择
恐龙赛道周边最有典型性，因为能同时把：
- mature urban society
- commercial crowd
- dinosaur domestication/entertainment
- foreign explorers
- guides
放进一张图。

## 城市人群
- Chultan locals
- merchants
- guides
- porters
- dinosaur riders/handlers
- gamblers/spectators
- city guards
- sailors
- faction representatives
- foreign adventurers

## 种族
核心是本地城市居民，不应做“全世界奇异种族动物园”。
可合理出现：
- Humans为本地城市基底
- Tabaxi（官方书有相关NPC/stat blocks）
- Dwarves及其他常规冒险种族
- 外来者混合

## 官方生物库
ToA公开stat block列表可用视觉资产：
- Brontosaurus
- Deinonychus
- Hadrosaurus
- Stegosaurus
- Velociraptor
- Quetzalcoatlus
- Flying Monkey
- Chwinga
- Tabaxi Hunter
- Tabaxi Minstrel
等。

不是所有生物都应该在城市出现。

## SRD映射
- Animal Handling
- hirelings / porters
- Herbalism Kit
- Cartographer’s Tools
- rope
- waterskin
- rations
- Explorer’s Pack
- mounts/cargo逻辑
- Heavy Precipitation

## 合理法术
- Speak with Animals：少量训练者/德鲁伊
- Druidcraft：天气
- Mending：赛具
- Mage Hand：摊位后勤
- Guidance：骑手/handler
- Minor Illusion：娱乐摊位

## 事件岛
1. riders绑护具
2. handler检查恐龙口具
3. spectators下注
4. vendor利用人流卖货
5. guide招募探险者
6. outsider被恐龙吓到
7. guard清赛道
8. 小型恐龙/动物偷食
9. porter急着穿过赛道
10. wealthy sponsor与代理下注

## 60人板
- 20 locals/vendors
- 8 riders/handlers
- 6 merchant representatives
- 8 guides/sellswords
- 6 guards
- 8 foreign adventurers
- 4 performers/port workers

另做6–8个恐龙资产。

## 官方视觉参考
- Port Nyanzaru map
- ToA Chult poster map
- official dinosaur stat art
- official product gallery
- Ch.1场景图

## 禁止
- 不要所有恐龙攻击人
- 不要全员野外装备
- 赛道周围首先还是城市生活
- 具体Merchant Prince垄断与人物细节需以正版Ch.1正文为最终标准

---

# U. S07｜Vallaki — 强制节庆广场

## 官方依据
*Curse of Strahd*：
- Ch.2 Barovians / Vistani / Areas
- Ch.5 Town of Vallaki
  - Approaching the Town
  - Areas of Vallaki
  - Special Events
- 官方Barovia介绍文章

## 地点/社会身份
Vallaki不是吸血鬼宫廷，而是：
> **普通人在Strahd长期阴影下试图维持秩序的城镇。**

Barovians官方描述强调：
- superstition
- distrust
- isolation
- Morninglord宗教痕迹
- wine的日常重要性

## 强制节庆
官方文章明确提到：
- Baron持续办festival
- 试图靠“欢乐”抵抗Strahd
- 因而形成“装饰热闹、人却紧张”的独特社会视觉

## 人口
- Barovian commoners
- guards
- local authority
- clergy
- merchants
- inn staff
- Vistani
- outsiders/adventurers

### 种族
应保持封闭地区感：
- Human绝对主体
- 外来冒险者才提供有限其他种族
- 不做国际大都市式混排

## 势力
- Strahd统治阴影
- Vallaki local authority
- local church
- Vistani
- Keepers of the Feather等隐藏力量

## SRD映射
- Commoner
- Guard
- Priest / Acolyte
- Spy
- Brewer’s Supplies
- wine / food / lodging
- religious symbols
- costume / banners
- social interaction
- fear / mental stress作为氛围参考

## 法术
尽量少：
- Thaumaturgy：宗教仪式
- Light：教会
- Cure Wounds：神职角色
怪物魔法不应在白天广场泛滥。

## 事件岛
1. residents挂festival装饰
2. guard盯着人群要求“配合”
3. 商人勉强继续营业
4. child不安地看装饰
5. priest观察
6. outsiders交换眼神
7. Vistani在边缘出现
8. raven在屋顶
9. 一个人被要求举起节庆标语
10. inn worker搬wine

## 60人板
- 31 Barovians
- 8 guards/authority
- 5 clergy
- 5 merchants/artisans
- 5 Vistani
- 6 adventurers/outsiders

## 禁止
- 吸血鬼舞会
- 全员疯笑
- 过度华丽哥特服装
- 应是“普通社会被恐怖统治扭曲”

---

# V. S08｜Saltmarsh — 主码头货箱拦检

## 官方依据
*Ghosts of Saltmarsh*：
- Ch.1 Politics and Factions
- Saltmarsh Overview
- Downtime Activities
- Saltmarsh Region
- Saltmarsh Backgrounds
- Ch.2 The Sea Ghost
- Ch.3 Roleplaying Lizardfolk
- Ch.6 Council of War / Sahuagin Stronghold
- Appendix A Of Ships and the Sea
  - Ship Stat Blocks
  - Officers and Crew
  - Travel at Sea
  - Ocean Environs

## 地点身份
Saltmarsh是小尺度海岸镇，不是Baldur’s Gate式繁华港区。

重点：
- fishing economy
- local families
- boat repair
- small warehouses
- smuggling
- political tension
- crown influence / outside development

## 派系
官方Ch.1明确存在`Politics and Factions`。
传统已知结构包括：
- Traditionalists
- Loyalists
- Scarlet Brotherhood
- Town Council
- dwarven mining interests
- smugglers

具体人物、人数与派系文本在最终出图前应以正版Ch.1正文复核。

## 人口
- fishers
- sailors
- dock workers
- merchants
- shipwrights
- guards
- smugglers
- dwarf newcomers / mining-related workers
- adventurers
- Lizardfolk使者（剧情性来客）

## 外部威胁
- Sahuagin
- pirates / bandits
- sea creatures

不应把Sahuagin作为普通镇民。

## SRD映射
- Pirate / Pirate Captain（5.2新增相关Monster角色）
- Bandit / Bandit Captain
- Guard
- Commoner
- Navigator’s Tools
- Carpenter’s Tools
- Weaver’s Tools
- rope
- net
- barrel
- lantern
- ship crew
- ship repair
- sailing ship / rowboat / keelboat

## 法术
- Mending：修网/船具
- Water Breathing：特殊冒险者
- Water Walk：特殊施法
- Light：码头夜间
- Guidance：航海/工作

## 事件岛
1. guards打开可疑crate
2. smuggler装作不认识货
3. fisher继续卸鱼
4. shipwright修船舷
5. dwarf workers等矿业货物
6. sailors系绳
7. clerk核shipping record
8. lizardfolk visitors被围观
9. rogue观察inspection
10. seagull抢鱼（环境幽默）

## 60人板
- 20 fishers/sailors
- 8 dock/shipwright
- 8 merchants
- 7 authority/guards
- 5 smugglers
- 5 dwarven newcomers
- 4 adventurers
- 3 lizardfolk envoys

## 禁止
- 大型商业港
- 海盗主题公园
- Saltmarsh必须有地方社区和政治摩擦

---

# W. S09｜Gracklstugh — Darklake District

## 官方依据
*Out of the Abyss* Ch.4：
- Going to Gracklstugh
- Gracklstugh
- Darklake District
- Laduguer’s Furrow
- West & East Cleft Districts
- Halls of Sacred Spells
- Cairngorm Cavern
- Themberchaud’s Lair
- Whorlstone Tunnels
- Hold of the Deepking

此外OotA提供：
- Underdark Travel
- Equipment
- Madness
- Fungi of the Underdark

## 地点身份
这是一座完整的**Duergar地下城市**。
不是“洞穴+矮人铁匠”。

选择Darklake District是因为：
- water transport
- trade
- labor
- guards
- outsiders
- industrial logistics
可以同时成立。

## 人口
- Duergar绝对主体
- Derro为重要地下人口
- outsider traders少量
- adventurers少量
- 其他Underdark居民根据官方章节具体需要加入

**不要自动塞大量Drow。**

## 城市权力/文化
- Deepking王权
- Laduguer宗教
- Halls of Sacred Spells
- Themberchaud与城市权力/工业形成独特关系

## 环境
- enormous cavern
- dark water
- stone dock
- basalt
- black iron
- chain / crane
- mine cart
- ore
- furnace glow
- smoke / steam
- dim red-orange against black
- heavy low architecture

## SRD映射
- Dwarf体型参考，但Duergar外观以OotA官方图为准
- Darkvision
- Smith’s Tools
- Mason’s Tools
- Carpenter’s Tools
- chain
- block and tackle
- cart
- heavy armor
- Guard / Veteran / Commoner
- Heat / darkness

## 法术
- Mending：工具维修
- Light：外来人照明
- Detect Magic：货物/城市异常
- Stone Shape：少数施法角色
不要全员魔法。

## Themberchaud
官方明确有独立`Themberchaud’s Lair`。
作为本场景：
- 远处炉火
- 红龙纹章/警戒
- heat
- 影子
比把龙直接摆在前景更好。

## 事件岛
1. barge靠岸
2. ore被block-and-tackle吊起
3. guards检查外商
4. smith crew换班
5. Derro搬运
6. overseer清点
7. cart jam造成短暂争吵
8. outsider举灯适应黑暗
9. priest/official经过
10. 远处炉火骤亮，众人短暂停顿

## 60人板
- 34 Duergar
- 8 Derro
- 5 elite guards
- 4 priest/official
- 5 Underdark traders
- 4 outsiders/adventurers

## 禁止
- 蓝紫霓虹Underdark
- Duergar个个不同怪物脸
- 大量Drow抢戏
- 视觉核心：**纪律、工业、沉重、地下热量**

---

# X. S10｜Maelstrom — Storm Giant王庭

## 官方依据
*Storm King’s Thunder*：
- Introduction
  - The Ordning
  - King Hekaton and His Daughters
  - Iymrith
  - Giant Lords
- Ch.10 Hold of the Storm Giants
  - Storm Giants
  - Maelstrom
  - General Features

## 场景身份
Maelstrom是Storm Giant王庭/要塞。
战役背景：
- Ordning发生危机
- King Hekaton相关权力危机
- royal family与Iymrith阴谋构成核心压力

## 尺度
这一关的第一原则不是“海底蓝色”，而是：
> **Storm Giant文明的巨型尺度。**

SRD/官方Monster信息：
- Storm Giant是Huge Giant
- 可游泳
- 海岸/水下生态强

## 空间
- giant-scale hall
- massive arches
- reef / underwater architecture
- pools / submerged passages
- sea visible beyond openings
- giant throne / table / weapon
- coral / shell / marine ornament
- smallfolk极小

## 人口
- Storm Giant royal/court
- guards
- attendants
- messengers
- giant envoys（若剧情需要）
- smallfolk visitors
- aquatic attendants（具体种族必须以Ch.10正文为准）

## SRD映射
- Storm Giant official monster size
- Deep Water
- Underwater Combat
- Detect Magic / Control Weather（巨人能力语境）
- giant-scale objects
- guards / nobles / messengers类社会角色映射

## 事件岛
1. smallfolk party等待接见
2. giant guard拦住入口
3. messenger带来紧急消息
4. two giant courtiers争论
5. attendants搬巨型礼器
6. giant weapon被放在架上
7. aquatic servant/visitor穿过水道
8. royal figure与使者谈话
9. smallfolk仰头看巨大座椅
10. 海外窗口有大型海洋生物掠过

## 资产板
不要单一60人同尺度。
建议：
- Giant sheet：20
- Smallfolk sheet：30
- aquatic/support：10

## 禁止
- Storm Giant画成2米多的人
- Human尺寸家具
- 全员战斗姿态
- 场景应是“文明与宫廷”，不是Boss竞技场

---

# Y. S11｜Avernus — Wandering Emporium

## 官方依据
*Baldur’s Gate: Descent into Avernus*：
- What Is Avernus?
- Features of Avernus
- Warlords of the Avernian Wastelands
- Bel’s Forge
- Stygian Dock
- Styx Watchtowers
- The Wandering Emporium
- Zariel’s Flying Fortress
- Appendix B Infernal War Machines
- Story Concept Art

官方Avernus文章强调：
- blasted battlefield
- River Styx
- citadels / watchtowers
- infernal war machines
- crimson dust
- Blood War
- Zariel / Bel

## 为什么选Wandering Emporium
因为Avernus大量空间很空旷，难以自然放60人。
Emporium则能合理容纳：
- traders
- fiends
- mortals
- mercenaries
- mechanics
- scavengers
- war-machine crews

## 社会习惯
Avernus不仅有战争，还有：
- contracts
- barter
- repair
- fuel / vehicle logistics
- mercenary negotiation
- scavenging
- information exchange

## 人口/生物
- Devils / fiends主体之一
- mortals / cultists / travelers
- yugoloth/mercenary型角色可依据官方具体场景
- warlords
- scavengers

官方BGDiA附录可参考：
- Amnizu
- Bulezau
- Hellwasp
- Merregon
- Narzugon
- Nupperibo
- White Abishai
等。

## SRD映射
- Extreme Heat
- vehicles（规则行为参考）
- Smith’s / Tinker’s Tools
- chain
- repair tools
- merchant/commoner/hireling逻辑
- infernal种族/怪物则以BGDiA为主

## 法术
- Mending：设备
- Detect Magic：交易物
- Identify：魔法货物
- Thaumaturgy：fiend/cult
- Mage Hand：后勤

## 事件岛
1. mechanic钻在war machine下
2. devil merchant谈价
3. traveler买水/补给
4. warlord crew排队
5. scavenger卖scrap
6. mercenary recruiter招人
7. occult clerk写contract
8. prisoner/servant搬货（谨慎处理，不做猎奇）
9. adventurers检查路线
10. 远景River Styx / flying fortress

## 60人板
- 18 fiend roles
- 10 market staff
- 8 mechanics/vehicle crew
- 8 planar travelers
- 6 mercenaries
- 6 adventurers
- 4 special infernal figures

## 禁止
- 全红
- 全是战斗
- 每个devil都独立怪物设计导致画风碎裂
- 战争社会也需要后勤和交易

---

# Z. S12｜Witchlight Carnival — Giant Snail Race

## 官方依据
*The Wild Beyond the Witchlight*：
- Witchlight Hand background
- Fairy
- Harengon
- Ch.1 Carnival Owners
- Witchlight Hands
- Carnival Overview
- Carnival Locations
- Carnival Events
- poster map

官方文章明确：
- Carnival会跨世界/位面旅行
- Witchlight Hands从事大量幕后工作
- Mister Witch / Mister Light经营Carnival
- Giant Snail Racing是正式活动
- Almiraj Ring Toss、Hall of Illusions等也是官方活动

## 场景身份
不是“普通游乐园换奇幻皮肤”，而是：
> **跨位面移动的Fey-linked魔法嘉年华。**

## 人口
- Witchlight Hands
- performers
- vendors
- game operators
- visitors
- Fairy
- Harengon
- wondrous beings

## 环境
- kaleidoscopic tents/wagons
- twilight/night
- lanterns
- bunting
- grass/mud path
- hand-painted signs
- magical but handmade feel
- temporary wood structures
- colorful without neon-tech

## SRD映射
- Bard
- Entertainer’s Pack
- Musical Instruments
- Costume
- Gaming Set
- Painter’s Supplies
- Animal Handling
- Minor Illusion
- Prestidigitation
- Dancing Lights
- Mending

## 事件岛
1. giant snails起跑
2. crowd摇铃/旗
3. handler追一只偏离方向的snail
4. Harengon下注
5. Fairy飞过计时区
6. Witchlight Hand修装饰
7. Almiraj game nearby
8. musician准备下一场
9. vendor忙卖食物
10. visitor找丢失物品

## 60人板
- 18 Witchlight Hands
- 10 performers
- 8 vendors/game operators
- 14 visitors
- 5 Fairy
- 5 Harengon

## 禁止
- 低幼Disney感
- 全员笑脸
- 现代主题公园设施
- 仍然维持项目统一5–5.5头身

---

# AA. S13｜Rock of Bral — Low City Docks

## 官方依据
*Spelljammer: Astral Adventurer’s Guide*：
- Ch.3 Rock of Bral
- Life on the Rock
- Keeping Order
- Who’s Who
- Prince Andru and His Court
- Underbarons
- High / Middle / Low City
- Underside

官方文章 `Welcome to Bral...` 提供非常具体社会结构。

## 城市分层
### High City
- noble estates
- fine inns
- magical library
- temples
- Starhaven
- Lake Bral
### Middle City
- economic heart
- Great Market
- star charts / trade
- artifact recovery business
- private security

### Low City
- working class
- taverns
- boarding houses
- peddlers / thieves
- docks
- people + cargo arrival/departure

### Underside
- agriculture
- military
- gravity-plane相关空间

## 城市风俗
官方文章概括出的社会规则：
- 少管别人闲事
- 钱很重要

秩序：
- serious crimes → magistrates / Magistrate’s Watch
- criminal groups提供保护/“保险”

## 种族
这是15关里**最适合高种族多样性**的地方。
官方Spelljammer基础species：
- Astral Elf
- Autognome
- Giff
- Hadozee
- Plasmoid
- Thri-kreen

Bral官方文章特别点名：
- Giff
- Thri-kreen
- Hadozee
- 以及众多其他intelligent species

## SRD映射
基础规则层：
- sailor / hireling
- navigator’s tools
- rope / cargo / block and tackle
- ship repair逻辑
- maps
- spyglass
- merchant / thief / guard

Spelljammer船、species、Wildspace环境必须以官方Spelljammer资料为主，不能拿普通SRD船直接替代。

## 事件岛
1. ship A卸货
2. ship B下旅客
3. ship C紧急修理
4. Giff crew搬重货
5. Hadozee在rigging上工作
6. Thri-kreen trader同时处理多件货
7. Watch调查dock accident
8. thief盯上新人
9. star-chart seller招揽客人
10. boarding-house worker拉住旅客

## 60人板
- 8 Giff
- 6 Thri-kreen
- 6 Hadozee
- 14 common humanoid travelers
- 8 other Spelljammer species
- 8 dock/trade workers
- 5 Watch
- 5 criminal associates

## 官方视觉参考
- Rock of Bral map
- official asteroid city art
- Spelljammer ships
- species official art
- Low City / Bral article imagery

## 禁止
- 金属科幻空间站
- 激光武器
- 现代宇航服
- Spelljammer的核心是“奇幻航海+魔法宇宙”

---

# AB. S14｜Radiant Citadel — Concord Jewel抵达广场

## 官方依据
*Journeys Through the Radiant Citadel*：
- Features
- Noteworthy Sites
- Concord Jewels
- Life in the Citadel
- Groups of the Citadel
- Citadel Defenses
- Entering the Citadel
- Legends and Lore

官方文章明确：
- Citadel位于Ethereal Plane
- 围绕Auroral Diamond
- 巨大化石生物骨架环绕其周围
- founding civilizations在化石中构筑城市
- Concord Jewels连接物质位面文明

## 社会核心
不是“多种族”而是：
> **多文明。**

城市功能：
- diplomacy
- trade
- history
- knowledge
- refuge
- inter-civilization travel

## 政治/精神结构
- Speakers for the Ancestors
- founding civilizations
- Dawn Incarnates

官方Dawn Incarnates文章说明：
- spirit集合在Auroral Diamond周围形成gemstone beings
- 强大的Dawn Incarnates代表founding cultures
- 对Speakers具有监督/问责作用
- citizens/adventurers可与其交流

## 视觉
- Ethereal mist
- Auroral Diamond
- fossil ribs / colossal bones
- city carved into fossil
- bridges / terraces
- Concord Jewel transit
- multiple coherent culture groups
- soft luminous environment

## 人口
不要做：
- 10 Human
- 8 Elf
- 6 Dwarf
这种Species配额。

要做：
- Culture A group
- Culture B group
- Culture C group
……
每组内部服饰、纹样、货物和社交动作统一。

## SRD映射
- Diplomat-like pack
- Sage
- Acolyte
- Calligrapher’s
- Jeweler’s
- maps
- scrolls
- holy symbols
- languages
- merchants/hirelings
- Identify / Comprehend Languages / Detect Magic
- Guidance / Mending

## 事件岛
1. Concord Jewel arrival
2. delegation下船/离开传送载具
3. Speaker代表迎接
4. guides分流
5. porters搬礼物
6. trader观察新货
7. scholar登记
8. 不同文化代表交换礼仪
9. healer帮助晕眩旅客
10. Dawn Incarnate相关象征在高处/远处可见

## 60人板
- 5 coherent culture groups × 6 = 30
- 8 diplomats/administration
- 8 traders
- 6 scholars/healers/artisans
- 6 travelers/adventurers
- 2 spiritual/special roles

## 禁止
- 白色科幻乌托邦
- 全球民族服装随机拼贴
- “种族多样性”压倒“文化分组”
- 必须保留Auroral Diamond + fossil structure

---

# AC. S15｜Well of Dragons — 联军前沿总集结营

## 官方依据
*The Rise of Tiamat / Tyranny of Dragons*：
- Council of Waterdeep
- Gathering Allies
- Metallic Dragons, Arise
- Mission to Thay
- Ch.17 Tiamat’s Return
  - The Final Battle
  - Approaching the Well
  - The Well of Dragons
  - Tiamat’s Temple
  - Enemies and Allies
  - Victory or Defeat
- Appendix monsters/NPCs
- Concept Gallery

## 场景身份
Well of Dragons不是普通“屠龙冒险营”。
它是：
- Cult of the Dragon最终计划
- Tiamat召唤
- Red Wizards参与
- 多方联盟最终进攻
- Metallic Dragons等高阶力量参与
的终局战区。

## 为什么选“总攻前最后一小时”
如果直接画Boss战：
- 大量人物会失去个人动作
- hidden-object玩法变差
- 画面会被龙/魔法占满

战前一小时反而最能体现：
- 联盟
- 职业
- 后勤
- 焦虑
- 战术
- 祝福
- 装备
- faction diversity

## 人群
- adventuring strike teams
- allied soldiers
- scouts
- engineers
- clerics
- wizards
- healers
- smiths
- messengers
- faction envoys
- dragon hunters

敌方：
- Cult of the Dragon
- Wyrmspeaker体系
- Red Wizards
- dragon-related forces

## 官方怪物/NPC方向
官方附录/章节可参考：
- Dragonclaw
- Dragonfang
- Dragonwing
- Dragonsoul
- Guard Drake
- Severin
- Rath Modar
- Tiamat
等。

## SRD映射
- Soldier background
- Veteran / Guard / Knight
- Cleric / Wizard / Ranger / Fighter / Rogue
- Smith’s Tools
- Cartographer’s Tools
- Healer’s Kit
- rope
- grappling hook
- signal whistle
- maps
- heavy crossbows
- tents
- rations
- potion
- Mending
- Bless
- Guidance
- Cure Wounds
- Detect Magic
- Minor Illusion（战术模拟）
- Find Familiar（侦察）

## 事件岛
1. Cleric给一队人Bless
2. Wizard用Minor Illusion模拟龙航线
3. scout把地图摊在箱子上汇报
4. smith修anti-dragon gear
5. healer处理归来的伤员
6. engineer固定重型弩具
7. faction envoys争论攻击窗口
8. Rogue检查grappling gear
9. Bard安抚紧张队伍
10. familiar偷吃补给形成小幽默
11. dragon silhouette掠过远处
12. cult spy混在后勤中

## 60人板
- 18 adventurers/elite teams
- 10 allied soldiers
- 8 cleric/wizard support
- 8 scouts/engineers/dragon hunters
- 5 faction envoys
- 5 cult/intelligence roles
- 6 logistics/healer/smith/messenger

敌方大军、巨龙、Tiamat’s Temple不计入“白底人物60人”主体。

## 禁止
- 直接Boss战
- 60个英雄排队
- Dragonborn大量出现只因为“龙主题”
- 无意义火山火光
- 必须让Alliance / Cult / Temple / Dragon War身份明确

---


# AD. 15关 × SRD资产映射矩阵

| 场景 | 最有用NPC | 最有用工具/装备 | 最有用规则/环境 | 最有用法术 |
|---|---|---|---|---|
| Baldur’s Gate | Guard, Commoner, Spy, Thug, Cultist, Noble | Forgery, Thieves’, manacles, ledgers, carts | Social / hirelings | Detect Magic, Mending |
| Candlekeep | Mage, Archmage, Acolyte, Priest | Calligraphy, books, parchment, scrolls | Research | Detect Magic, Identify, Comprehend Languages |
| Calimport | Commoner, Noble, Mage | Alchemy, Tinker, Jeweler, Glassblower, camel | Extreme Heat / trade | Prestidigitation, Mage Hand, Fabricate |
| Myth Drannor | Scout, Druid, Mage | Cartography, Mason, rope, climber kit | Difficult terrain / traps | Detect Magic, Comprehend Languages, Stone Shape |
| Icewind Dale | Scout, Guard, Commoner, Veteran | sled, rations, hunting trap, leather | Extreme Cold / wind / ice | Druidcraft, Mending, Goodberry |
| Port Nyanzaru | Commoner, Scout, Guard | Herbalism, rope, cargo, Animal Handling | Heavy Precipitation | Speak with Animals, Guidance, Mending |
| Vallaki | Commoner, Guard, Priest, Spy | Brewer, costume, wine, holy symbol | Social / fear atmosphere | Thaumaturgy, Light |
| Saltmarsh | Commoner, Guard, Bandit/Pirate | Navigator, Carpenter, rope, net, ship tools | Sea travel | Mending, Water Breathing |
| Gracklstugh | Guard, Veteran, Commoner | Smith, Mason, chains, carts | Darkness / industrial | Mending, Light |
| Maelstrom | Noble/Guard analogues | giant objects | Deep Water / underwater | Detect Magic / setting-specific giant magic |
| Avernus | mercenary/social analogues | Smith/Tinker, chains, repair | Extreme Heat | Mending, Identify |
| Witchlight | Commoner/performer analogues | instruments, costume, gaming, painter | Social/event | Minor Illusion, Prestidigitation, Dancing Lights |
| Rock of Bral | Guard, Spy, Commoner | Navigator, rope, block/tackle, spyglass | ship/crew logic | Mending, Mage Hand |
| Radiant Citadel | Noble/Sage/Acolyte analogues | Calligraphy, Jeweler, maps, diplomat kit | Social/languages | Comprehend Languages, Detect Magic |
| Well of Dragons | Veteran, Knight, Scout, Priest | Smith, Cartography, healer kit, rope | rest / warfare / logistics | Bless, Guidance, Cure Wounds, Mending |

---

# AE. Species比例不是“官方百分比”

重要规则：

## 不做
> Human 40%  
> Elf 15%  
> Dwarf 10%  
> Tiefling 8%……

除非官方资料真的提供人口统计，否则这种数字都是假的。

## 正确方式
先判断：
1. 地点
2. 势力
3. 常住 vs 外来
4. 社会身份
5. 特有种族
6. 这一个具体事件谁会在场

然后才做60人的**项目设计数量**。

例如：
- Gracklstugh → Duergar绝对主体
- Bral → 多元宇宙species高多样性
- Vallaki → Human-heavy封闭社会
- Radiant Citadel → 先按civilization group，不按species
- Well of Dragons → 先按faction / military role，不按居民种族

---

# AF. 60人白底资产板：统一制作规范

## AF1. 一场景一套60人
不再追求15场景共用同一批演员。

## AF2. 20人 × 3张
每张：
- 纯白背景
- 同一地面线
- 全身
- 正面/轻3/4
- 不做透视
- 编号
- 身份标签

## AF3. 每个角色至少定义
- ID
- Species
- culture / faction
- NPC role or class
- height category
- body type
- age range
- face/hair
- clothing language
- core equipment
- tool
- one readable action tendency
- one baseline expression

## AF4. 差异优先级
1. Species核心骨架一致
2. Faction / culture服装语言一致
3. Social role差异
4. Class / equipment差异
5. Age / hair / facial features
6. color micro-variation

## AF5. 过度差异化禁止
同一批Duergar不能出现：
- 一个像儿童
- 一个像普通Human
- 一个像怪兽
- 一个像Warcraft Orc

同理：
- Elf
- Giff
- Harengon
- Tiefling
都必须先锁族群模板。

---

# AG. 正式出图前每关仍要完成的最后一级资料

这份Master已经完成：
- SRD底层
- 15个地点与子场景
- 社会/种族/工具/法术映射
- 事件逻辑
- 60人高层配比

真正开始某一关资产图时，还应再生成一个约10–20页等量的：
`SXX_FINAL_SCENE_BIBLE.md`

其中只做当前一关，并补：

1. **官方地图空间转译**
   - 左 / 中 / 右
   - 前 / 中 / 后
   - 入口
   - 建筑边界
   - 高台
   - 人流方向

2. **官方视觉图索引**
   - 哪张图看建筑
   - 哪张图看服装
   - 哪张图看怪物
   - 哪张图看材质
   - 哪张图看色温

3. **60人逐人清单**
   - 不再只有群体数量

4. **8–12事件岛详细blocking**

5. **生物资产板**

6. **重要道具板**

7. **Species scale board**

8. **最终画面人物layout**

这一步不是重新研究世界，而是把本Master压成“该关可直接生成”的生产文件。

---

# AH. 资料可信度标记规则

后续所有文件统一使用：

### 【SRD-5.1】
来自Wizards SRD 5.1开放内容。

### 【SRD-5.2.1】
来自Wizards SRD 5.2.1开放内容。

### 【OFFICIAL-SETTING】
来自Wizards / D&D Beyond正式冒险书、设定书或官方文章。

### 【OFFICIAL-INDEX】
官方Source目录能确认该章节存在，但公开网页没有完整正文；具体文本正式生产前应以正版书复核。

### 【PROJECT】
我们的美术/关卡设计选择，例如：
- 60人具体数量
- 一个事件发生在某个时间点
- 隐藏目标位置
- 某个NPC站左还是右

---

# AI. 官方/开放资料索引

## SRD
- D&D Beyond System Reference Document  
  https://www.dndbeyond.com/srd
- GitHub 2014 SRD Markdown  
  https://github.com/oldmanumby/dnd.srd.5.1
- GitHub 2024 SRD 5.2.1 Markdown  
  https://github.com/oldmanumby/dnd.srd.5.2.1
- Alternative 5.2.1 Markdown  
  https://github.com/downfallx/dnd-5e-srd-markdown
- Structured database  
  https://github.com/5e-bits/5e-database
- SRD API  
  https://github.com/5e-bits/5e-srd-api

## 场景官方核心书
- Baldur’s Gate: Descent into Avernus
- Candlekeep Mysteries
- Forgotten Realms: Adventures in Faerûn
- Icewind Dale: Rime of the Frostmaiden
- Tomb of Annihilation
- Curse of Strahd
- Ghosts of Saltmarsh
- Out of the Abyss
- Storm King’s Thunder
- The Wild Beyond the Witchlight
- Spelljammer: Astral Adventurer’s Guide
- Journeys Through the Radiant Citadel
- The Rise of Tiamat / Tyranny of Dragons

---

# AJ. 最终锁定原则

从这份文件开始，后续不再用“泛奇幻合理”作为主要判断依据。

每个画面元素按以下顺序判断：

1. **官方地点是否支持**
2. **官方势力/居民是否支持**
3. **SRD规则/装备/职业是否支持**
4. **该元素是否符合当前子场景的事件**
5. **是否有利于hidden-object可读性**

如果：
- 官方地点没有说
- SRD也没有支持
- 只是“看起来很奇幻”

则默认不加入，除非明确标记为【PROJECT】设计。

这就是后续15张大图共同的资料底线。