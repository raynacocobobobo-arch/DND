# 禁忌之书 · 独立网页部署分支

这是《禁忌之书》已定稿的网页版源代码，不是压缩包。**可直接使用 Git 克隆并由 Nginx 作为静态站点运行**。

该分支只包含网页运行所需的文件：大阿卡纳 22 张、小阿卡纳 56 张，各自的缩略图；HTML、CSS、JS、SVG、图标及按需缓存脚本。不包括灯塔、Hermes To Do、未采用的历史牌面或版本草稿。

## 腾讯云 / Hermes Agent 部署

```bash
# 将路径按腾讯云现有站点目录调整；确保有对应目录写权限
git clone --depth 1 --single-branch --branch tarot-deploy \
  https://github.com/raynacocobobobo-arch/DND.git \
  /var/www/forbidden-arcana
```

Nginx 可设置：
```nginx
server {
    listen 80;
    server_name tarot.example.com;  # 换成实际域名
    root /var/www/forbidden-arcana;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \\.(?:webp|png|jpg|jpeg|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    location = /sw.js { add_header Cache-Control "no-cache"; }
}
```

应用支持前端 hash 路由，无需后端 Node.js、数据库或构建器。 HTTPS 应使用腾讯云现有证书和配置。**不要覆盖其他站点的 Nginx 配置**，请先执行 `nginx -t`。

后续同步更新：
```bash
cd /var/www/forbidden-arcana
git pull --ff-only origin tarot-deploy
```

GitHub Pages 主站仍在 DND 的 `gh-pages` 分支；此分支为独立部署版，不会自动同步主站的新增修改。大图已经压缩为 WebP，原画及历史版本仍保留在原仓库的其他分支/历史记录中。

本分支构建自 gh-pages 的 2026-11-05 版。网页主体素材共 180 个文件，其中 156 个牌面/缩略图，文件总大小约 23.76 MiB。
