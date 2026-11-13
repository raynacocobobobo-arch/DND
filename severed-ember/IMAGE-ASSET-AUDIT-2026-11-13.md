# 破碎余烬隐修会 · 图片库全面核查与复用记录

核查日期：2026-11-13  
发布分支：`gh-pages`  
基准提交：`b501d00fb6451fda8a495fb545309061bf701610`  
范围：`severed-ember/`（主页、10 卷、公共 CSS/JS、素材目录）。**不是整个 DND 仓库的资产清点**。

## 一、数量与检测方法

- 站点目录项目：174；图片资产：**129**（WebP、PNG、SVG）。
- 检查主页及十卷 HTML、CSS、JS 共 15 个文件中的静态图片路径。
- 页面正在引用的图片：**83**；没有上述代码引用的图片：**46**，共约 **6,982 KiB**。
- 已逐项核对可识别的静态资源路径，未发现缺失引用。运行时动态拼接、外部服务以及真实浏览器渲染不在本次校验覆盖范围内。
- 人工目视比较了旧 H-03 至 H-07、D-01/D-02、line-guard、storm-knights、vilos-evacuation、旧武库、第五卷战史馆及新版战役档案馆等代表性画作；其余依据来源、实际用途、已有 V3.4–V4.1 审计和文件版本关系分类。未声称 129 张全部完成逐像素视觉验收。

| 目录 | 总数 | 当前引用 | 未引用 |
|---|---:|---:|---:|
| branding | 3 | 2 | 1 |
| campaigns | 32 | 22 | 10 |
| chapter-art | 10 | 6 | 4 |
| chapter-titles | 10 | 10 | 0 |
| deeds | 8 | 4 | 4 |
| emblem.svg | 1 | 0 | 1 |
| organization | 6 | 6 | 0 |
| p0 | 22 | 10 | 12 |
| p1 | 9 | 4 | 5 |
| portraits | 18 | 18 | 0 |
| thumbs | 10 | 1 | 9 |
| **合计** | **129** | **83** | **46** |

## 二、本次已执行的复用

1. 首页五类入口中的“**武装与遗物**”卡片，改用旧资料库 `assets/p0/H-06-thumb.webp`；这是清楚呈现爆弹枪、动力剑与圣物的独立静物画，不使用错误头盔。保留武库栏目原环境大图。
2. **第四卷《特殊武装》**在“第一军团原初造物”小节插入 `assets/p0/H-06.webp`（资料库旧武器陈列原画）；将原有 `assets/chapter-art/04-arsenal.webp` 移到“通用远征遗物”结束后，避免两张图片连续堆叠。严格保留 V3.7 原文段落与顺序，图注明示为概念插画，不冒充某件指定武器实物。
3. 首页“**战役档案**”卡片改用旧资料库 `assets/thumbs/05-campaigns.webp`：不同历史战役的旗帜与战史馆画面，区别于栏目页头既有的全息星图。卡片只加载约 63 KiB 的缩略图，替代约 513 KiB 的完整场景图；原栏目页头仍使用新画。

这三项合计重新启用 **3 张此前无代码引用的素材**。没有重做、覆盖或删改用户认可的 10 张 `assets/chapter-titles/*.webp`。

## 三、剩余 46 张未引用图片：分类清单

### 1）应保持停用：错位、旧版及重复构图

- `assets/chapter-art/01-overview.webp`：旧战团概览图，头盔不符合用户确认的造型；不得重新启用。
- `assets/chapter-art/03-organization.webp`：旧版构成图，早前因视觉风格与实际军阵不符被替换；也是 `assets/p1/organization-full.webp` 的同 SHA 副本。
- `assets/chapter-art/09-characters.webp`：与 `assets/p1/people-full.webp` 完全相同。主页已有后者，九名人物有各自独立原画；不再多占图位。
- `assets/p1/armory-full.webp`：画面中有疑似乱码/伪标签，已在 V4.1 替换，不重新启用。
- `assets/p1/line-guard.webp`、`assets/p1/storm-knights.webp`：旧兵种绘画的甲色/角色语义不如新版准确，不替换 `assets/organization/` 五张专题卡。
- `assets/p1/vilos-evacuation.webp`：旧撤离题材；不得伪作《钢铁风暴》舰内战斗或其他具体战役。
- `assets/p0/H-03.webp`、`H-04.webp`、`H-05.webp`、`H-07.webp` 及各自的 `-thumb.webp`：旧入口替换图/旧构图组。某些头盔或阵营色与当前设定不一致；H-07 舰船与堡垒组合虽有表现力，但不能据此认定是“余烬号”标准外形。维持存档，不强行安插。
- `assets/p0/D-01.webp`、`D-01-thumb.webp`、`D-02.webp`、`D-02-thumb.webp`：早期典型事迹备选图。D-01 的全图内容与仍用于第六卷的 `chapter-art/06-secrets.webp` 为同 SHA；典型事迹首页已有专门的 D-01/D-02 图版，避免重复。

### 2）已被更准确战役插画替代的历史档案

- `assets/campaigns/03-second-false-stars-full.webp`、`03-second-false-stars-thumb.webp`、`03-second-false-stars.svg`
- `assets/campaigns/04-steel-storm.svg`
- `assets/campaigns/10-entropy-forge-full.webp`、`10-entropy-forge-thumb.webp`、`10-entropy-forge.svg`
- `assets/campaigns/11-abyssal-well-full.webp`、`11-abyssal-well-thumb.webp`、`11-abyssal-well.svg`

共 **10** 个历史版本。第五卷当前 11 场远征各自的插图（包括新 V4 版本）已启用。历史版本不应冒充新图或替换有具体剧情锚点的正式画。

### 3）可保留为备份，但不建议增加重复展示

- `assets/chapter-art/05-campaigns.webp`：战史馆群旗壁画，画面本身可用。**对应旧缩略图已放到首页战役档案入口**，不必再给第五卷正文（已有 11 张独立战役画）重复加一张总览。
- `assets/thumbs/01-overview.webp`、`02-siofra.webp`、`03-organization.webp`、`04-arsenal.webp`、`06-secrets.webp`、`07-other-histories.webp`、`08-rites.webp`、`09-characters.webp`、`10-restricted.webp`：**9 张**早期缩略图。当前十卷标题统一使用独立新画；如未来需要图片式书架，可审核每张再启用，不应直接批量恢复。
- `assets/branding/severed-ember-winged-sword-v4.webp`：高分辨率徽记；当前浏览位使用小图，以减轻下载量。保留作后续独立大幅/分享资产。
- `assets/deeds/D-01.svg`、`D-02.svg`、`D-03.svg`、`D-04.svg`：四张早期 SVG 版画，均有现行写实版或对应卡片。
- `assets/emblem.svg`：早期简化徽记，已被正式 V4 翼剑图替代。

## 四、重复 SHA（不能计成新图）

- `assets/chapter-art/03-organization.webp` = `assets/p1/organization-full.webp`
- `assets/chapter-art/06-secrets.webp` = `assets/p0/D-01.webp`
- `assets/chapter-art/09-characters.webp` = `assets/p1/people-full.webp`

## 五、保留与后续原则

- **已批准的 10 张章节标题图全部保留**，不要用旧紫色样机或旧头盔画替换。
- **9 位人物独立画像（18 张主图/缩略图）与 11 场战役图均保留**；禁止将一张群像裁成多个不同人物，禁止将通用图标记成某个战役的历史纪实。
- 本轮对未引用资产 **不作删除**：其中有历史回退价值，删除可能令旧页面、历史分支或打包备份失效。若以后要精简仓库，应另做“可删文件 + 依赖影响 + 大小”清单再执行。
- 老素材包 `ember-v24-pack-*.txt` 等属先前版本的历史打包数据，不能直接视为比当前 `gh-pages` 正式画更新或更准确。
- GitHub 静态路径已验证，不等同桌面浏览器及 Safari 真机视觉验收；应重点复查首页缩略图裁切和第四卷两张插图的实际排版。

