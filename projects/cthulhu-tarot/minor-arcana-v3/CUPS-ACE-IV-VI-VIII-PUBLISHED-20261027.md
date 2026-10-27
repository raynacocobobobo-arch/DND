# 圣杯 ACE / IV / VI / VIII 网页更新记录（2026-10-27）

## 用户确认
- 2026-10-27 明确要求从最近五张图中剔除 **VII / SEVEN OF CUPS**，仅发布 ACE、IV、VI、VIII。
- 同一对话明确要求以普通杯子、搪瓷杯、金属茶杯、玻璃杯、玻璃瓶等日常器物表示“圣杯”花色，减少华丽仪式圣杯感，减少过强颗粒、污渍和反光。
- 不允许因批量替换而动到已定版 II/V/X，22张大阿卡纳不动。

## 实际上传的原图（固定像素 941 × 1672）
|序号|原文件|新网站资源|RGB原图 pixel_sha256|
|---|---|---|---|
|ACE|月下港湾圣杯王牌.png|minor-arcana/cups/final/ace-of-cups-v4.webp|42bba747105913bf9eb2497c5bb8a0ca7926ac350930a85f656975c2d42892dc|
|IV|雨港沉思_圣杯四.png|minor-arcana/cups/final/four-of-cups-v4.webp|cdfc2907a04d7f7fb1672054165bdd9ae2929b69db3bd8291525d7574d7a66a9|
|VI|暮光港湾的圣杯六牌.png|minor-arcana/cups/final/six-of-cups-v4.webp|ec207c7ae815458a8ae11552315f7d432bcb1e136ebf45da39754af3246da26f|
|VIII|月下港湾_圣杯八寓言.png|minor-arcana/cups/final/eight-of-cups-v4.webp|6180974a2475bf35217a7cddb29198e62a1833e7a884b8d1111ac1a037fbe040|

- 各自有 `minor-arcana/cups/thumbs/<slug>-of-cups-v4.webp` 缩略图。
- `gh-pages/assets/cups-approved-v1.js` 已更新对应四张卡的 `img`、`thumb`、对应V3原著事件核准的标题、正逆位和与新画面一致的明确艺术改编说明。
- `gh-pages/index.html` 已引入新缓存版本 `cups-everyday-20261027`。
- VII 仍引用旧画，**本轮未生成/上传/替换 VII 的新资源**。

## 已确认的线上结果
- GitHub Actions QA: `main/.github/workflows/cups-everyday-live-qa-20261027.yml`。
- `gh-pages/qa/cups-everyday-20261027.json` 报告 `result: PASS`。
- 通过真实GitHub Pages HTTP公网页面与图片请求，4张原图无损WEBP逐像素SHA256、4张缩略图、4张详情图片和故事、VII保持不变、14圣杯/22大阿卡纳页面数量、抽牌和390px手机响应式均通过。
- 完成后清理临时图片传输 GitHub Actions 和 Google Docs relay；永久QA流程和正式数据保留。

## 后续圣杯重制统一规范（覆盖旧文案“必须是华丽圣杯”约束）
1. “Cups”是花色名称，不强迫每张用礼仪高脚金杯；可按故事环境使用瓷杯、茶杯、搪瓷杯、金属杯、玻璃杯、药瓶、海水瓶、玻璃罐等现实生活器物。
2. 数字牌花色器物数量必须清晰、精确、可数，计入手持、背景和倒影；避免因器物品类混用造成数目混乱。
3. 人物、地点与《印斯茅斯的阴影》的事件关系优先于摆杯，生活器皿自然融入画面。
4. 控制过强颗粒感、过度污渍、雨面反射、繁复小道具和建筑纹理；不要因为削减细节就删除原本确定的关键人物或事件。
5. 既有黑金边框与英文题字统一，不更动22张大阿卡纳。
6. 新构图与小说真实事件有距离的场面，在页面“原著背景与艺术改编”明确写为象征性艺术处理，不伪称原著发生。
