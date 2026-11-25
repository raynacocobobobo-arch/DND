# GitHub 单一数据源

正式手册及审图记录统一维护于 DND 仓库 gh-pages 分支的 wedding/shotlist/。wedding/main 仅为历史备份，不再作为发布来源；不得使用旧 sync-request 或旧候选映射覆盖现有数据。Supabase 留存为迁移备份，不再读取或写入。

- reviews/index.json：分片索引及原稿计数。W001–W1027 和 R001–R455 以实际原图编号和 SHA-256 核验。
- reviews/Wxxxx-xxxx.json 等：逐图审查记录。每个原始编号唯一，审核状态 approved / pending / excluded。pending 代表尚未发布的真实视觉通过，excluded 必须有排除理由。未查看不创建完成记录。
- assets/references/reviewed/：实际已采用原图；图片在 data.js 中只能属于一张动作卡。保留历史文件不意味着公开显示。
- data.js：流程与动作卡；图片数组及 image_notes 从审核记录生成。reviewed-release.json：已发布图片清单，与审核记录、文件路径和 data.js 同次提交。
- 后台写入与自动审查均须读取当前 gh-pages HEAD，使用非强制快进原子提交，发生冲突必须重新读取并合并。不得覆盖其他项目。
- 上线以 GitHub Pages 部署成功为准；没有真实图片字节不得标记为已发布。新增用户图片使用 U 前缀，不计入 1482 原稿完成率。

初次迁移：240条（W229–W468），20张已发布、220张排除。后续已补审W469–W788；2026-11-25新增复核W789–W888共100张（93张excluded、7张pending），当前索引累计660条：80张approved、573张excluded、7张pending、822张unreviewed。下一批W889–W898；其他待处理缺口W001–W228、W889–W1027、R001–R455。pending图尚未上传原图，不能计为正式上线。
