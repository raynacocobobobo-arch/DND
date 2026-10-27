# 权杖宫廷牌 KNIGHT / QUEEN / KING 已正式发布（2026-10-27）

## 批准原图和交付文件

本批用户在会话中分别批准的 **KNIGHT、QUEEN、KING** 三张独立原图，已通过固定的 Google Docs → GitHub Actions → 无损 WebP → gh-pages 流程上传。

| 卡牌 | 用户批准的原 PNG | 正式高清 WebP（gh-pages） | RGB 像素 SHA256 |
|---|---|---|---|
| KNIGHT OF WANDS | 风暴中的权杖骑士.png | minor-arcana/wands/final/knight-of-wands-v2.webp | d19c75039698a47cf7bb68636dbea9a0ea6204d8d131f2231245dd507d4ff00e |
| QUEEN OF WANDS | 月下农舍的权杖王后.png | minor-arcana/wands/final/queen-of-wands-v2.webp | 0db8d005ce599d084bc8856b0a37b600b5e6d7fda222160c90f7434691f2cc35 |
| KING OF WANDS | 星空下的王者农舍.png | minor-arcana/wands/final/king-of-wands-v2.webp | 1a020852b85fb73c6d66a6919dc398f75eef2e0f2ae0bfc45565e28da5a7b1b9 |

尺寸均为 **941 × 1672**，每张都有 `minor-arcana/wands/thumbs/<slug>-of-wands-v2.webp` 缩略图。成功逐像素验证，原画未重绘、裁切、拉伸或丢失像素。

## 网站更新

- `gh-pages/assets/wands-approved-v1.js`：仅新增三张宫廷牌的完整数据和 V3 文学设定、视觉叙事、正逆位；之前 **ACE–X、PAGE** 共11个数据对象逐项保持完全一致。
- `gh-pages/assets/arcana-app-v3.js`：只修正旧的控制台日志为动态显示权杖张数（不改应用渲染逻辑）。
- `gh-pages/index.html`：正确显示权杖14张，并为作品数据与应用脚本增加更新的缓存键。
- 网站当前共 **50张**：大阿卡纳22张、圣杯14张、权杖14张；没有改动其他牌的图像或信息。

## 文学与视觉

宫廷牌从《敦威治恐怖事件》提取并经过艺术转换：

- **KNIGHT**：无人骑马，倒下的草与断裂农场木栅栏暗示隐形孪生巨物的冲击；云中暗影为象征性艺术设计。
- **QUEEN**：拉维尼娅独坐农舍，旧书、煤油灯、扫帚；以她的处境而非王冠或宫廷服装表现王后。
- **KING**：沃特雷农舍屋顶避雷针与广袤扭曲的星空，借用犹格·索托斯意象；不是原著里的具象「天空国王」。

创意构图不等于原著中真实发生的具体事件。文字页面已明确表达这一点。

## 自动化线上验收

- Workflow：`main/.github/workflows/wands-courts-20261027-live-qa.yml`
- 验收证据：`gh-pages/qa/wands-courts-20261027.json`，**result: PASS**
- 从公共网站下载三张无损原图，941×1672 RGB 字节经 SHA256 验证与所批准 PNG 完全一致。
- 验证三张独立详情、缩略图、权杖牌库14张、之前11张权杖仍可打开、圣杯14张、大阿卡纳22张、抽牌池50张、390px移动端页面无横向溢出。
- 正式发布后删除了临时图片上传 Workflow 与中转 Google Doc。验收 Workflow 作为长期可重跑的发布 QA 保留。

## 正式链接

- [KNIGHT](https://raynacocobobobo-arch.github.io/DND/#/card/wands/knight)
- [QUEEN](https://raynacocobobobo-arch.github.io/DND/#/card/wands/queen)
- [KING](https://raynacocobobobo-arch.github.io/DND/#/card/wands/king)
- [14张完整权杖牌库](https://raynacocobobobo-arch.github.io/DND/#/library/wands)

**权杖组14张全部上线。**
