# 圣杯 PAGE / QUEEN / KING 已批准并上线（2026-10-27）

## 批次与来源

用户已批准三张独立作品，并要求沿用此前 GitHub 发布流程上网站：

| 牌 | 已批准的源 PNG | GitHub Pages 高清图 | RGB 原始像素 SHA256 |
|---|---|---|---|
| PAGE OF CUPS | 雾港圣杯侍者.png | minor-arcana/cups/final/page-of-cups-v4.webp | 3acea1ffc604eb6ffecadfa758eeae608310d7a0557baf2f7b7d24e694d6b8d0 |
| QUEEN OF CUPS | 深海圣杯女王.png | minor-arcana/cups/final/queen-of-cups-v4.webp | cd6de83c4405ecc36206271ae94ac18781475d8602fe2bf3dc5e42fe029ebe3e |
| KING OF CUPS | 深海王者_圣杯国王.png | minor-arcana/cups/final/king-of-cups-v4.webp | 82aac6d467772b049e2b1bdf5785a6522d6353807b0de27c1fd1fb898761001d |

每张原画 941×1672 RGB，转换为无损 WebP 并逐像素验证原图SHA256，缩略图见 `minor-arcana/cups/thumbs/<slug>-of-cups-v4.webp`。

## 网站更新

- `gh-pages/assets/cups-approved-v1.js` 仅更新 PAGE / QUEEN / KING 的图片引用、V3人物原著关联、图像解释和正逆位说明。
- `gh-pages/index.html` 使用缓存键 `cups-courts-20261027`。
- PAGE：1927年年轻旅行者、搪瓷杯、杯中异化倒影，原创视觉转换。
- QUEEN：Pth’thya-l’yi 为古老非人深潜者，“王后”仅是塔罗象征，不是原著正式头衔。
- KING：海洋神性达贡之父意象，“国王”身份、金属器物和具体造型为原创塔罗解释。
- **圣杯 VII 新版尚未获批准，本次未修改其资源；22张大阿卡纳未修改；其余11张圣杯图像未修改。**
- 已完成暂存 Google Docs → GitHub Actions → gh-pages 的可核验无损图片传输，清理一次性中转流程和临时文档。

## 线上验证

- 工作流：`main/.github/workflows/cups-courts-20261027-live-qa.yml`
- 成功记录：`gh-pages/qa/cups-page-queen-king-20261027.json`，`result: PASS`
- 实测：公共 HTML 缓存键、三张高清图 HTTP 与尺寸、逐像素 SHA256、缩略图、独立详情与故事、圣杯七未替换、圣杯14和大阿卡纳22分页、抽牌、390px手机布局。

## 卡牌地址
- [PAGE](https://raynacocobobobo-arch.github.io/DND/#/card/cups/page)
- [QUEEN](https://raynacocobobobo-arch.github.io/DND/#/card/cups/queen)
- [KING](https://raynacocobobobo-arch.github.io/DND/#/card/cups/king)
- [Cups library](https://raynacocobobobo-arch.github.io/DND/#/library/cups)

## 当前完成度

14 张圣杯已有 13 张采用本轮重制新图并正式发布；**圣杯七是唯一尚未通过这一轮重制的新图**。网页还保留其旧版图，不表示新图获批。
