# 22张定版大阿卡纳：视觉基准与锁定清单 V1（2026-10-26）

## 验证方法
2026-10-26 通过 GitHub 连接器从 `gh-pages/assets/cards-hd/arcana-00.webp`—`arcana-21.webp` **逐一读取22个实际 WebP 图片字节并打开可视化查看**，不是依赖 HTML、缩略图、搜索或文字想象。22张的原始内容均未改动。

## 锁定规则（后续56张小阿卡纳必须执行）
1. **原始源路径**：`gh-pages/assets/cards-hd/arcana-NN.webp`，NN=00..21；元数据 `gh-pages/assets/arcana-catalog-v3.js`。22张属于冻结资产，严禁再生图、重新压缩或覆盖。
2. **主流边框母版**：优先以 `arcana-00.webp`、`arcana-05.webp`、`arcana-13.webp` 的边框细节互相核准，后续56张锁定一套重复使用的母版；不是提示词里重画“相似黑金边框”。
3. **边框形式**：整体纵向约9:16；浅棕旧羊皮纸满底，边缘做旧；前景边线为雕花古金配近黑底；顶部两侧月相圆章／星形圆章及曲线触须花枝，中间上沿五角/罗盘星徽；顶部中央一块旧羊皮纸编号铭牌，下方倒三角式饰端；画心顶端为大弧顶、两侧圆角曲线，画幅内下沿为弧形并有中央星徽；底部羊皮纸英文全大写衬线标题铭牌、两侧月相及卷须雕纹，中心下沿细金花饰。
4. **文字**：顶部用黑色高对比古典衬线体，数字 `0, I–XXI`；底部全大写英文名称。数字牌改成 `ACE, II..X`，宫廷牌改成 `PAGE/KNIGHT/QUEEN/KING`，保持位置、字色、字重、基线/留白与铭牌比例，不加入中文。
5. **画心质感**：偏写实的精密数字油画/电影美术，建筑、服饰、材质、光学、天气均细致；现实人物与宏大未知尺度并置；明暗层次丰富，铜金/暖琥珀照明与深蓝绿冷光对比，避免糊纹、泛漫画感、干净塑胶CG。风格不要求56张都暗黑，参考 `arcana-17` 与 `arcana-19` 的明亮场景。
6. **故事感**：不是所有图都需要神祇或触手；`arcana-01`、`arcana-09` 属人类知识场景，`arcana-13` 体现血缘异化，`arcana-05` 有宗教和深潜者，`arcana-07` 展现风雪科考，`arcana-19` 展示温暖梦境城景。56张新图应按其原著时代取物；不能套用同一古堡主视觉。
7. **结构差异提示**：检查到 `arcana-10.webp`（WHEEL OF FORTUNE）的**下方标题铭牌明显高于其它卡，底部留出较大羊皮纸空白**，属于现有定版自身的差异。不以它作为56张统一边框的几何母版，也不改动这张已批准牌。
8. **复用前的技术关卡**：须由定版原图裁出/遮罩生成**真正的同一边框底图或覆盖层**，并独立叠加画心和牌名；先完成无损/像素对齐比对，确认遮罩边缘及字牌无硬接缝。不能将定版有画心、有旧标题的整图粗暴覆盖，也不能以视觉相似的AI框冒充母版。
9. **数量审核**：数字牌本花色符号数量严格等于牌序，连背景、手持与反射一并检查。每张独立9:16图，不准三卡拼图。
10. **发布关卡**：先按 G2 验收圣杯二、五、十独立样卡，用户批准后复用既有 Google Docs/Drive → GitHub Actions → 无损 WebP → gh-pages 工作流；未经批准不能覆盖旧已批准圣杯和22张大阿卡纳。

## 22个实际已看高清原图及Git blob SHA
|编号|牌名|Git blob SHA|
|---|---|---|
|00|THE FOOL|321aaf50ec484cb85ed783773e5048a8d00c5950|
|01|THE MAGICIAN|1c85c5bcfc2e5534c655b92ab67d5655a8f59ee1|
|02|THE HIGH PRIESTESS|fb95bc082e06b91ff113c2c2683da4db8a75e7e8|
|03|THE EMPRESS|59b42b067f182d76a3927105d78301dc7ca810f6|
|04|THE EMPEROR|05df08bd4098a221e0d85559a502d69f95aedf6d|
|05|THE HIEROPHANT|8c38b3550eb65c62f7dca9464e3e2f4871762f7a|
|06|THE LOVERS|e01c5dec3599081353a30c327ba09da3ddb66cc3|
|07|THE CHARIOT|c3e6cd9a8de5bd6a201cec5484e9480736bb0126|
|08|STRENGTH|9964c382d52b7fac5ad4c6a720c59b3d793cc4e5|
|09|THE HERMIT|fb2110c55b6363bc1c0199b675c75695a7b94489|
|10|WHEEL OF FORTUNE|d30e5d417e27f57d3a992fa9dd6f5e21f4108c35|
|11|JUSTICE|ec0b9a7160a3d9887ace709f1d90ed7a82405b1b|
|12|THE HANGED MAN|d759b1041a72660fd4a5c49c063fe12a267d11da|
|13|DEATH|b659a02390d3ba593419e927e4e138b433126d78|
|14|TEMPERANCE|c0b15dfa4a42d08007172c3b8ee885e6f1afbb60|
|15|THE DEVIL|1b67ec991f77ba32f5a5fe5f92b6953d2a4fa911|
|16|THE TOWER|dd99c12abc45d45de01f4479618cc5347f393b04|
|17|THE STAR|5c626d309238925aa44ae85c3e0f668a541fad53|
|18|THE MOON|d181303efe0c5e5140c0aac35981604a0753c325|
|19|THE SUN|8abcfb8ab0005a21e4ca5291ac8d6f79f715f5e2|
|20|JUDGEMENT|d5aa3d07da2f2f5193d8cc1f777771e4f004d9d3|
|21|THE WORLD|4a159a5586f3b5975be288e4767bf146d486fd47|

**结论：视觉观察已完成22/22；精确蒙版/透明牌框的资产抽取尚未完成。** 本文件是可执行基准，不等于已生产出可以直接覆盖的透明边框PNG/WEBP。
