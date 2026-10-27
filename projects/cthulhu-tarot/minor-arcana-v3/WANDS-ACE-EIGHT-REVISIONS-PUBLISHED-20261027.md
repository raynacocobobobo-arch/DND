# 权杖王牌与权杖八替换上线（2026-10-27）

用户已确认两张新版原画：**ACE OF WANDS** 换为保留燃烧火把、背景更改为深蓝星空与雾谷的版本；**EIGHT OF WANDS** 改为《敦威治恐怖事件》第六章中黑色看门狗袭击威尔伯的图书馆画面。

## 已批准原图与像素一致性

| 卡牌 | 用户批准的源图 | gh-pages 无损正式文件 | RGB 像素 SHA256 |
|---|---|---|---|
| 权杖王牌 ACE | `/mnt/data/神秘星火权杖塔罗牌.png` | `minor-arcana/wands/final/ace-of-wands-v3.webp` | `58369e15f98a8b895973cbf3bf0a1b4c50e19da47dd84dff4dd436a9f08be353` |
| 权杖八 VIII | `/mnt/data/a_dark_moody_highly_detailed_gothic_tarot_card_i.png` | `minor-arcana/wands/final/eight-of-wands-v3.webp` | `0ffe0f360f7d4cba9ab08387c43030aa9929419c0f61e4a51d2427becc54476e` |

两张均为 **941×1672**，使用经过验证的 Google Docs → GitHub Actions → lossless WebP → gh-pages 二进制流程；同版缩略图位于 `minor-arcana/wands/thumbs/{ace,eight}-of-wands-v3.webp`。

## 修改范围

- `gh-pages/assets/wands-approved-v1.js` 仅改动 ACE、VIII 的图片路径和相关叙事解释（不改正位逆位）；**其余12张权杖卡对象逐一比对，完全未修改**。
- `gh-pages/index.html` 脚本缓存键改为 `wands-ace-eight-revised-20261027`。
- 原 `v2` 图片保留以备回滚；没有触碰大阿卡纳22张、圣杯14张和其余权杖12张图片。
- 权杖八以**1928年8月**图书馆里的狗袭击威尔伯致死为依据；卷轴与背景道具属于艺术改编。并非原版的飞天火杖寓言。
- 网站持续收录权杖14张，总抽牌池50张。

## 真实线上 QA

- Workflow：`main/.github/workflows/wands-ace-eight-revisions-20261027-live-qa.yml`
- **QA PASS**：`gh-pages/qa/wands-ace-eight-revisions-20261027.json`
- 从公众网站获取两张高清图和缩略图、校验两图 RGB 原始像素 SHA256、两张独立详情页面文案、其余12张权杖不变、圣杯14张与大阿卡纳22张、50张抽牌池、390px手机端均通过。
- 临时图片中转 Google Doc 和一次性上传工作流已经删除。

## 在线地址

- [权杖 ACE](https://raynacocobobobo-arch.github.io/DND/#/card/wands/ace)
- [权杖 VIII](https://raynacocobobobo-arch.github.io/DND/#/card/wands/eight)
- [权杖牌库](https://raynacocobobobo-arch.github.io/DND/#/library/wands)
