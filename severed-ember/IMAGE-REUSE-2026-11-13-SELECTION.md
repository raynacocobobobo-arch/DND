# 破碎余烬隐修会 · 用户指定旧图复用记录（2026-11-13）

## 本次复核和实际修改

用户指定：`campaigns/03-second-false-stars-full.webp`、`campaigns/10-entropy-forge-full.webp`、`campaigns/11-abyssal-well-full.webp` 可作小图；核查 `chapter-art/09-characters.webp` 是否重复；希望使用 `p0/H-05-thumb.webp`、`p0/H-03-thumb.webp`、`p0/H-04-thumb.webp`、`p1/line-guard.webp`、`p1/storm-knights.webp`。

| 素材 | 页面与用法 | 修改结果 |
|---|---|---|
| 03-second-false-stars-full.webp | 第五卷第三场 · 缩略图下点击查看旧原图 | 另外启用 `03-second-false-stars-thumb.webp` 做实际小图；现行 V4 主图不替换 |
| 10-entropy-forge-full.webp | 第五卷第十场 · 缩略图下点击查看旧原图 | 另外启用 `10-entropy-forge-thumb.webp`；现行 V4 主图不替换 |
| 11-abyssal-well-full.webp | 第五卷第十一场 · 缩略图下点击查看旧原图 | 另外启用 `11-abyssal-well-thumb.webp`；现行 V4 主图不替换 |
| p0/H-03-thumb.webp | 首页「战团构成」历史画稿选页 | 小图，标注旧军阵群像；非官方固定人员身份 |
| p0/H-04-thumb.webp | 首页「战团构成」历史画稿选页 | 小图，标注旧重装骑士概念 |
| p0/H-05-thumb.webp | 首页「战团构成」历史画稿选页 | 小图，标注旧战场行军概念 |
| p1/line-guard.webp | 第三卷「余火守卫」小节 | 在守卫相关原文后新增画稿；明确说明旧画甲色不代表 V3.7 正式余烬绿 |
| p1/storm-knights.webp | 第三卷「内环精锐」中风暴骑士段落后 | 在相关原文后新增画稿；不冒称固定人员或具体历史战役 |
| chapter-art/09-characters.webp | 不额外引用 | 与已经引用的 `p1/people-full.webp` 的 Git Blob SHA 完全相同：`d9e410ab81e8ac85eb4cd6a51dd42753bd9ec7b1` |

## 校验

- 网站 `severed-ember/` 共 **129 张图片**；此前 83 张有 HTML/CSS/JS 静态引用，本轮新增 **11 个有引用的图片文件**，现为 **94 张引用、35 张未引用**。
- 其中三场战役新引用了 3 张小图 + 3 张旧全图链接（6）；首页历史补充 3 张；第三卷 2 张；合计 11。
- 原先十卷新的章节标题原图与页面引用均未改动，十卷标题组件仍是图片标题。
- V3.7 原始 Markdown Git blob SHA 保持 `c618837c65683636e3328226c1d97096c24640d4`。
- 静态资源引用未发现缺失路径，第三、第五卷分别更新站点 CSS 缓存版本为 `illustrated-v61`。
- 旧版图片曾因设计史和设定误差被弃用，现以「旧画稿」「早期概念图」标注，**不应当作正史指定人物或特定武装实物的定稿证据**。
- 未在实体设备 / Safari 做过截图视觉验收。

原 46 张归档 ZIP 是更新前的快照，保持不变，方便人工审图；当前真正未引用数已降至 35 张。
