# 权杖 VI–X：用户批准原画已发布（2026-10-27）

## 批次与批准来源

用户按顺序批准 VI、VII、VIII 的**第三版**、IX、X，并要求一并更新 GitHub Pages。本次未生成新图、未改动任何其他已上线卡牌。

|牌|已批准的本地原图|尺寸|gh-pages 高清文件|RGB 像素 SHA256|
|---|---|---|---|---|
|VI|秘典书房中的六根法杖.png|941×1672|minor-arcana/wands/final/six-of-wands-v2.webp|c762ac0e553c4e496c0615a4c3e728bd34caf959da11b45dc254135139420156|
|VII|a_vertical_ornate_tarot_card_style_illustration_w.png|941×1672|minor-arcana/wands/final/seven-of-wands-v2.webp|ee9f6832c94b2ca7f144df42f7f1f2e95451d0c9362eaaf9f21d8af5e9c88402|
|VIII（第三版）|a_vertical_tarot_card_style_illustration_a_moody.png|941×1671|minor-arcana/wands/final/eight-of-wands-v2.webp|5d2271d15a7146334d46859ae27da122809d16f1af2be0b8c0942a232e899da0|
|IX|a_vertical_tarot_card_style_illustration_with_orna.png|941×1672|minor-arcana/wands/final/nine-of-wands-v2.webp|750fe3c506a1fc47499fa050c8bcda6cd8e5d10097c398c46e690bfdb77e4be5|
|X|a_moody_atmospheric_cinematic_tarot_card_style_i.png|941×1671|minor-arcana/wands/final/ten-of-wands-v2.webp|9a7b2e203a1a3f0a78291757b583a8f1edad7ec2276071f06f7a842447fb9079|

各自缩略图路径：`minor-arcana/wands/thumbs/<slug>-of-wands-v2.webp`。

## 发布操作

- 已按仓库 `.agents/skills/github-pages-art-publish/SKILL.md` 的固定图片接力：原PNG→临时Google Docs→短期公开图片URI→临时GitHub Actions→无损WebP + 缩略图→gh-pages。
- `gh-pages/assets/wands-approved-v1.js` 只新增 VI–X 五个条目，其余 ACE–V 与 PAGE 六个对象逐项校验完全一致。
- `gh-pages/index.html` 更新资源缓存键为 `wands-vi-x-20261027`，站点牌库权杖11张，总抽牌池47张。
- 记录了原著《敦威治恐怖事件》与图像艺术改编的边界。VIII采用用户明确通过的第三张图；它的火光与城镇是象征而非原著真实场景。X的背负道具发生在书房，也非书中真实搬运行为。
- 已删除一次性图片上传工作流与临时Google Docs文档，未改动原有图片。

## 已完成线上验收：PASS

- 工作流 `main/.github/workflows/wands-vi-x-20261027-live-qa.yml`
- `gh-pages/qa/wands-vi-x-20261027.json` 返回 `result: PASS`
- 实际测试公开站点的5张原图WebP均与原始PNG RGB像素SHA256一致；5张缩略图、5个详细页及内容；之前六张权杖保留；22张大阿卡纳及14张圣杯保留；抽牌池47张和移动端390px布局。

## 链接

- [权杖 VI](https://raynacocobobobo-arch.github.io/DND/#/card/wands/six)
- [权杖 VII](https://raynacocobobobo-arch.github.io/DND/#/card/wands/seven)
- [权杖 VIII](https://raynacocobobobo-arch.github.io/DND/#/card/wands/eight)
- [权杖 IX](https://raynacocobobobo-arch.github.io/DND/#/card/wands/nine)
- [权杖 X](https://raynacocobobobo-arch.github.io/DND/#/card/wands/ten)
- [完整权杖牌库](https://raynacocobobobo-arch.github.io/DND/#/library/wands)

**权杖新版进度 11/14；剩余宫廷牌 KNIGHT、QUEEN、KING 尚未发布。**
