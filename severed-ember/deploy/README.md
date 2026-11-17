# 破碎余烬隐修会 · 加载与缓存优化（2026-11-17）

## 已在 GitHub Pages 生效的部分
- 桌面规则大卷拆出为 \`assets/rules-fragment.html\`，进入规则视图或规则深链接时才请求，并恢复单位速查图鉴。
- 内联 CSS（原约78KB）拆成 \`assets/index-base.css\`、\`assets/index-overrides.css\`。
- 内联 JavaScript（约24KB）拆到 \`assets/index-app.js\`。
- 图片延迟加载和响应式 \`srcset\` 保留。
- \`sw.js\` 在支持的安全上下文（HTTPS 或 localhost）按需缓存已经访问的图片，最多120个；HTML、CSS、JS 不通过 Service Worker 缓存，避免旧站点内容长期驻留。

## 腾讯云正式缓存
当前对用户腾讯云实例没有远程执行权限，因此文件虽已加入仓库，但没有自动修改服务器配置。

方案A：现有 Caddy（提供 HTTPS 并能直接访问静态目录）
将 \`deploy/tencent-cache.caddy\` 中的 handle_path 块加入 **现有** 站点块。
如果 Caddy 在容器内，必须正确映射 \`/srv/www/severed-ember\` 到容器内再填写 root。
执行 \`caddy validate --config /etc/caddy/Caddyfile\`，验证后才 reload。
不要覆盖当前已有的网站块。

方案B：Nginx 独立代理（已有 Caddy 可以反向代理）
- \`sudo systemctl stop severed-ember\`（停止先前占用18088的 Python 服务）
- 安装 Nginx 并放置 \`deploy/tencent-cache.nginx.conf\` 为站点配置（监听127.0.0.1:18088）
- \`sudo nginx -t && sudo systemctl reload nginx\`。如 Nginx 尚未运行，改用 \`sudo systemctl start nginx\`。
- 检查 \`curl -I http://127.0.0.1:18088/\`、\`curl -I http://127.0.0.1:18088/assets/index-app.js\`、\`curl -I http://127.0.0.1:18088/assets/hero/hero-gothic-20261115.webp\`。
- 检查正文 gzip：\`curl -sI -H 'Accept-Encoding: gzip' http://127.0.0.1:18088/assets/index-app.js\`。

不应同时把上述 Nginx 示例的18088与现有 Python 服务保持监听；更不要公开此 loopback 端口。若已有公网8088/HTTPS 路由请单独配置，不需要为缓存而新增公网端口。

## 缓存语义
- HTML 和 sw.js：\`no-cache, must-revalidate\`，支持经服务器验证后重用。
- CSS/JS/JSON/manifest：1小时并允许重新验证。
- 图片：1天新鲜期，附加 stale-while-revalidate；避免永久immutable缓存导致修改后的同名图片无法更新。
- HTML、CSS、JS 使用 gzip/zstd 传输，减少带宽。缓存响应头和压缩是否生效必须在实际服务器检查。

## 更新
在服务器继续使用原来的 git pull 与 rsync。
只有部署静态资源后，应用正确的 Caddy/Nginx 配置才能获得服务端缓存。
