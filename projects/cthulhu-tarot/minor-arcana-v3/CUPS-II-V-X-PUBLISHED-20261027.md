# 圣杯 II / V / X · 2026-10-27 获批图像发布记录

## 已发布
用户在聊天中确认重制的以下3张，已经通过已验证的临时 Google Docs 图片接力 → GitHub Actions → 无损 WebP → gh-pages 流程发布。

|牌|GitHub Pages 941×1672高清图|缩略图|原始RGB像素SHA256|
|---|---|---|---|
|II TWO OF CUPS|minor-arcana/cups/final/two-of-cups-v4.webp|minor-arcana/cups/thumbs/two-of-cups-v4.webp|f32605ba025745ef60d17289c9213307caec88878382a76ba08752f6559881f4|
|V FIVE OF CUPS|minor-arcana/cups/final/five-of-cups-v4.webp|minor-arcana/cups/thumbs/five-of-cups-v4.webp|bfddab57fa409b7a89b83b12ef53f021104f33baf7be378ef08ed9f366cd21c9|
|X TEN OF CUPS|minor-arcana/cups/final/ten-of-cups-v4.webp|minor-arcana/cups/thumbs/ten-of-cups-v4.webp|96a98640e126f22745a116f9b9ebfaa5c3d859506d415250ff266b5c1883d142|

## 网站集成
- gh-pages 的 `assets/cups-approved-v1.js` 仅替换 cards `cups/two`, `cups/five`, `cups/ten` 的高清/缩略图路径与原著V3对应描述、牌义文本。
- `index.html` 已更新 Cups JS 缓存版本 `cups-innsmouth-20261027`。
- 14张圣杯总数量、旧版其他11张及权杖王牌未变。
- 22张大阿卡纳高清图片与 `assets/arcana-catalog-v3.js` 未更改。

## 线上验收
- QA Workflow: `.github/workflows/cups-ii-v-x-live-qa-20261027.yml`
- 自动化通过后写入标记：`gh-pages/qa/cups-ii-v-x-20261027.json`
- 完成：公共页面HTML新版本、三张公共无损WebP逐像素SHA256、缩略图访问、三张独立详情页图片解码与文案、原有大阿卡纳/圣杯数量、抽牌、390px手机界面横向溢出。
- QA 标记内容为 `"result":"PASS"`。浏览网址：`https://raynacocobobobo-arch.github.io/DND/#/library/cups`。
- 上传完成后已删除一次性图像传输工作流及临时 Google Doc。永久核验工作流与卡牌资源保留。

## 继续制作的边界
- 仅以上II/V/X三张获此轮批准；其余11张新版圣杯及另三花色尚未依V3重绘。
- 不擅自覆盖22张大阿卡纳。
- 原著 V3 下，圣杯十的海底亲缘/城市画面为梦境与未来预示，不宣称实体入海已发生。
- 本次三张为用户明确批准的整张图片；未来若要求 **从22张大阿卡纳精确提取透明牌框/蒙版**，应另做像素蒙版母版，不要把这次直接上传三张图误作已完成牌框资产工作。
