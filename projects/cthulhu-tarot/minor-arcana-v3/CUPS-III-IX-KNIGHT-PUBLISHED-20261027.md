# 圣杯 III / IX / KNIGHT 已批准并上线（2026-10-27）

## 发布范围
2026-10-27，用户明确要求将当轮独立生成的 III、IX、KNIGHT 三张正式更新到网站。重制范围仅这三张；不替换用户明确否决的新版 VII；既有 22 张大阿卡纳与其他圣杯牌资源保持原状。

|牌|批准的本地 PNG 原图|正式高清 WebP|原图RGB像素SHA256|
|---|---|---|---|
|THREE OF CUPS|古旧三杯牌_海港举杯之夜.png|minor-arcana/cups/final/three-of-cups-v4.webp|f5c9415fe933b767b2bcd0e929579a8dd635eb98b2c67042d6041fb5917ae26f|
|NINE OF CUPS|九杯之海窟秘境.png|minor-arcana/cups/final/nine-of-cups-v4.webp|c3d51709ddb5f937205f7e71593cb81f584c8d1dc938592b49556e271666c93e|
|KNIGHT OF CUPS|幽海囚窗_圣杯骑士.png|minor-arcana/cups/final/knight-of-cups-v4.webp|44e06b94476c603fde2942af03458ff680af89eaa8d30af214c3e5c5b7350592|

每张高分辨率为 **941×1672**，使用经验证的 Google Docs 图片中转 → GitHub Actions `.agents/skills/github-pages-art-publish/scripts/transfer_art.py` → 无损 WEBP → gh-pages，原图和发布文件的 RGB 解码像素哈希吻合。缩略图路径为 `minor-arcana/cups/thumbs/<slug>-of-cups-v4.webp`。

## 集成与说明
- 已在 `gh-pages/assets/cups-approved-v1.js` 更新三张的 `img`、`thumb`、标题、故事、视觉解释、正位逆位与原著边界说明。
- 网站 `index.html` 的缓存键 `cups-new20261027` 已更新。
- III：照片中的三名印斯茅斯人各持普通杯；照片属于原创象征。
- IX：半变异主人公独处，后方石龛三排三列九个杯瓶；洞穴为原创视觉化。
- KNIGHT：疗养院里劳伦斯手持搪瓷杯、望向海湾，异化程度为艺术推测。
- 仍遵循“普通杯、搪瓷杯、陶瓷杯、玻璃瓶可以替代仪式圣杯”的新版设定，控制颗粒、脏污和复杂纹理。
- VII 新制作图片未进入网站；旧网站记录仍保持，未在本批中改动。
- 本次没有修改22张大阿卡纳图像及相关脚本。

## 线上验收
- GitHub Actions: `.github/workflows/cups-iii-ix-knight-live-qa-20261027.yml`（main）
- 实测 PASS 记录：`gh-pages/qa/cups-iii-ix-knight-20261027.json`
- 已检查：公共HTML新版JS加载、三张无损WebP逐像素哈希一致、缩略图下载、三张详情页图片解码与故事、圣杯VII维持原路径、圣杯14张与大阿卡纳22张画廊分页、抽牌功能、手机390px视口横向溢出。
- 发布后已清理临时 GitHub Actions 上传工作流及临时 Google Docs 文件。

## 线上地址
- [圣杯三](https://raynacocobobobo-arch.github.io/DND/#/card/cups/three)
- [圣杯九](https://raynacocobobobo-arch.github.io/DND/#/card/cups/nine)
- [圣杯骑士](https://raynacocobobobo-arch.github.io/DND/#/card/cups/knight)
- [圣杯牌库](https://raynacocobobobo-arch.github.io/DND/#/library/cups)
