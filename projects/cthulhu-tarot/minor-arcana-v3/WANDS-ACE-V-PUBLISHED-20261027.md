# 权杖组 ACE–V 五张已正式上线（2026-10-27）

用户在当前会话中明确确认 **ACE、II、III、IV、V 五张独立图全部通过、全部上传网站**；这五张采用日常棍状物版 V4 画面，不继续使用之前仅有的旧 ACE 图。

## 已上传原图与像素验证

| 牌 | 原始批准 PNG | gh-pages 高清 WebP | 原始 RGB 像素 SHA256 |
|---|---|---|---|
| ACE | 余烬照亮的权杖王牌.png | minor-arcana/wands/final/ace-of-wands-v2.webp | 1788c4f9730918038f5fa4e59f67b72db482fc7f6947ac0bed91e63a31c96e95 |
| II | 双杖牌_风暴下的远眺.png | minor-arcana/wands/final/two-of-wands-v2.webp | 4b038374d66b447989d0ac1becc60e09ba56410ed8f283dc05864da005154c3a |
| III | 暮色农场的三根权杖.png | minor-arcana/wands/final/three-of-wands-v2.webp | aee8bb7336f4c5ea152a92c1712bf0fa1497752b46a8a870775a9601cdeacb8f |
| IV | 暮色农舍与四根栅栏柱屑.png | minor-arcana/wands/final/four-of-wands-v2.webp | 6950b8c49f0d69466c266b20869414f36ab0bafa619a28139de0244a2c4a05b3 |
| V | 暮雾中的五根权杖.png | minor-arcana/wands/final/five-of-wands-v2.webp | 95a857d52d72d095d4a93a55773688d946e75859abfad5a3765c4a9fa264e8ec |

5张原画都是 941 × 1672 像素，已借助固定技能 `.agents/skills/github-pages-art-publish/SKILL.md` 的 Google Docs → GitHub Actions → 无损 WebP → gh-pages 流程完成真实二进制发布。每张独立缩略图保存为 `minor-arcana/wands/thumbs/<slug>-of-wands-v2.webp`，新版本没有覆盖旧文件。

## 页面功能

- `gh-pages/assets/wands-approved-v1.js` 更新为五张 Wands 数据，包括画面、故事、正位、逆位、原著关联。
- `gh-pages/assets/arcana-app-v3.js` 从仅接受ACE路由改为所有已发布 Wands 卡牌深链，并以动态 Wands 牌数展示画廊与抽牌数。
- `gh-pages/index.html` 更新 JS 缓存版本、网站简介和可见牌数。
- 当前抽牌池 41 张：22大阿卡纳 + 14圣杯 + 5权杖。
- **已确认：22张大阿卡纳与14张圣杯的数据和原图均未修改。**
- 具体画面属于《敦威治恐怖事件》的艺术改编；棍状日用品的数量与摆放不宣称出自原著。

## 线上自动验收

工作流 `main/.github/workflows/wands-five-20261027-live-qa.yml` 已执行 PASS，结果 `gh-pages/qa/wands-ace-v-20261027.json`：
- 公共站点5张 WebP 图片 941×1672、与原始 PNG RGB 数据 SHA256 完全一致；
- 五张缩略图、五张独立页面、高清图加载、故事段落；
- 22张大阿卡纳、14张圣杯牌库保留；
- 抽牌总数41张且抽牌功能有效；
- 手机宽度390px画廊与详情无横向溢出。

上传完成后清理了一次性GitHub工作流和临时Google Doc，中转文件不留在公开站点。

## 网站
- [权杖牌库](https://raynacocobobobo-arch.github.io/DND/#/library/wands)
- [ACE](https://raynacocobobobo-arch.github.io/DND/#/card/wands/ace)
- [II](https://raynacocobobobo-arch.github.io/DND/#/card/wands/two)
- [III](https://raynacocobobobo-arch.github.io/DND/#/card/wands/three)
- [IV](https://raynacocobobobo-arch.github.io/DND/#/card/wands/four)
- [V](https://raynacocobobobo-arch.github.io/DND/#/card/wands/five)

**权杖进度：5/14，新版画面完成并发布。下一批可从 VI 起创作。**
