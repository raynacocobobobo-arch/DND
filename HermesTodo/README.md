# HermesTodo Web

HermesTodo 的个人云端网页版。React 前端、Node.js API 和 SQLite 使用同一个服务，电脑和 iPhone 访问同一份数据。正式入口固定为 `https://82.156.85.52:8443/`。

部署边界很明确：Node 只映射到宿主机 `127.0.0.1:3020`；独立 Caddy 只监听 `8443`。不要改动、停止或重启占用 `443` 的 xray、占用 `7890` 的 mihomo，以及已有 Hermes WebUI/ACLI 配置。

## 本地开发与验证

要求 Node.js 22 或更新版本。

```bash
npm ci
cp .env.example .env
npm run dev
```

本地 `.env` 可把 `COOKIE_SECURE` 改为 `false`、`PUBLIC_ORIGIN` 改为本地地址。生成 Argon2id 密码哈希时，密码从标准输入读取，不写进 shell 历史：

```bash
read -s HERMESTODO_PASSWORD
printf '%s' "$HERMESTODO_PASSWORD" | npm run password:hash
unset HERMESTODO_PASSWORD
```

完整检查：

```bash
npm test
npm run typecheck
npm run build
```

## 正式环境变量

从 `.env.example` 复制为 `.env`，文件权限设为 `600`。必须设置：

- `AUTH_PASSWORD_HASH`：上一步生成的 Argon2id 哈希。
- `SESSION_SECRET`：至少 32 字符，建议运行 `openssl rand -hex 32` 生成。
- `ARK_API_KEY`：火山 Ark Key，仅保存在服务器 `.env` 中。
- `ARK_ENDPOINT`：默认 `https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions`。
- `ARK_MODEL`：默认 `ark-code-latest`。
- `PUBLIC_ORIGIN`：固定 `https://82.156.85.52:8443`。

不要把 `.env` 提交到 Git、放进镜像或发到浏览器。

## 腾讯云首次部署

先在腾讯云轻量应用服务器防火墙中只新增 TCP `8443` 入站规则。不要新增 `3020` 入站规则。

把本仓库同步到服务器已有目录；更新时保留服务器的 `.env`、`data/` 和 `backups/`：

```bash
rsync -az --delete \
  --exclude .env --exclude data --exclude backups --exclude .git --exclude node_modules --exclude dist \
  ./ ubuntu@82.156.85.52:/home/ubuntu/hermestodo-web/
```

登录服务器后：

```bash
cd /home/ubuntu/hermestodo-web
mkdir -p data backups
chmod 700 data backups
node scripts/check-port.mjs 3020 8443
cp .env.example .env
chmod 600 .env
```

填写 `.env` 后构建并启动唯一的应用容器：

```bash
docker compose config
docker compose build
docker compose up -d app
docker compose ps
node scripts/smoke.mjs http://127.0.0.1:3020/api/health
```

安装独立 Caddy systemd 服务前先验证配置。这个服务不读取系统默认 Caddy/ACLI 分片，也不会绑定 443：

```bash
sudo /usr/bin/caddy validate --config /home/ubuntu/hermestodo-web/deploy/Caddyfile --adapter caddyfile
sudo install -m 0644 deploy/hermestodo-caddy.service /etc/systemd/system/hermestodo-caddy.service
sudo systemctl daemon-reload
sudo systemctl enable --now hermestodo-caddy.service
sudo systemctl status hermestodo-caddy.service --no-pager
curl --cacert /var/lib/hermestodo-caddy/caddy/pki/authorities/local/root.crt \
  https://82.156.85.52:8443/api/health
```

## iPhone 信任内部 CA

Caddy 第一次启动后会生成 HermesTodo 专用内部根证书：

```bash
sudo install -m 0644 \
  /var/lib/hermestodo-caddy/caddy/pki/authorities/local/root.crt \
  /home/ubuntu/hermestodo-web/hermestodo-root.crt
sudo chown ubuntu:ubuntu /home/ubuntu/hermestodo-web/hermestodo-root.crt
```

在 Mac 下载证书，再通过 AirDrop 或“文件”传到 iPhone：

```bash
scp ubuntu@82.156.85.52:/home/ubuntu/hermestodo-web/hermestodo-root.crt .
```

在 iPhone 上完成两步：

1. 打开证书并在“设置 → 已下载描述文件”中安装。
2. 进入“设置 → 通用 → 关于本机 → 证书信任设置”，为该根证书开启完全信任。

之后用 Safari 打开 `https://82.156.85.52:8443/`。信任后可用“分享 → 添加到主屏幕”。

## 更新与回滚

每次更新前先做在线备份：

```bash
cd /home/ubuntu/hermestodo-web
docker compose exec -T app node scripts/backup.mjs
```

同步新源码后：

```bash
docker compose build app
docker compose up -d app
node scripts/smoke.mjs http://127.0.0.1:3020/api/health
```

应用镜像回滚使用先前镜像 ID，数据目录不回滚：

```bash
docker image ls --no-trunc
docker compose down
# 把 compose.yaml 的 image 临时指向需要的旧镜像，随后：
docker compose up -d app
```

整个更新和回滚流程都不需要重启 xray、mihomo 或现有 Caddy/ACLI 服务。

## 备份与恢复

在线备份使用 SQLite backup API，兼容 WAL；默认保留最新 14 份：

```bash
docker compose exec -T app node scripts/backup.mjs
ls -lh backups/
```

每日 03:20 自动备份可加到 `ubuntu` 用户 crontab：

```cron
20 3 * * * cd /home/ubuntu/hermestodo-web && /usr/bin/docker compose exec -T app node scripts/backup.mjs >> /home/ubuntu/hermestodo-web/backups/backup.log 2>&1
```

恢复前先停止应用，并保留当前数据库作为可恢复副本。恢复脚本拒绝覆盖已存在的目标文件：

```bash
cd /home/ubuntu/hermestodo-web
docker compose stop app
mv data/hermestodo.sqlite "data/hermestodo.sqlite.before-restore-$(date +%Y%m%d-%H%M%S)"
rm -f data/hermestodo.sqlite-shm data/hermestodo.sqlite-wal
docker compose run --rm app node scripts/restore.mjs \
  /app/backups/hermestodo-YYYY-MM-DDTHH-MM-SS-000Z.sqlite \
  /app/data/hermestodo.sqlite
docker compose up -d app
node scripts/smoke.mjs http://127.0.0.1:3020/api/health
```

## 日志与排障

```bash
docker compose logs --tail=200 -f app
sudo journalctl -u hermestodo-caddy.service -n 200 -f
sudo ss -lntp | grep -E ':(3020|8443)\b'
curl http://127.0.0.1:3020/api/health
```

更换登录密码：生成新哈希，更新 `.env` 中 `AUTH_PASSWORD_HASH`，然后只重建应用容器：

```bash
docker compose up -d --force-recreate app
```

现有会话仍由数据库保存；如需强制全部重新登录，在备份后进入 SQLite 删除 `sessions` 表内容，再重启应用。
