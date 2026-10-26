#!/usr/bin/env bash
# HermesTodo same-origin production update, intended for Tencent Cloud web console.
# This updates ONLY /home/ubuntu/hermestodo-web and its "app" compose service.
# Never edits .env, SQLite data, backups, Caddy, xray (443), or mihomo (7890).
set -Eeuo pipefail

readonly REPO_URL="https://github.com/raynacocobobobo-arch/DND.git"
readonly SOURCE_BRANCH="feature/hermestodo-dashboard-subtasks-20261025"
readonly TARGET="/home/ubuntu/hermestodo-web"
readonly ORIGIN="https://82.156.85.52:8443"

die() { printf 'HermesTodo deploy stopped: %s\n' "$*" >&2; exit 1; }
for command in git docker rsync curl; do
  command -v "$command" >/dev/null 2>&1 || die "Required command not found: $command"
done
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required."
test -d "$TARGET" || die "Existing app directory $TARGET does not exist."
test -f "$TARGET/.env" || die "Server .env is missing; not replacing or generating secrets."
test -f "$TARGET/compose.yaml" || die "Existing compose.yaml is missing."
grep -q "^PUBLIC_ORIGIN=$ORIGIN$" "$TARGET/.env" || die "PUBLIC_ORIGIN must be $ORIGIN in the existing server .env."
test -d "$TARGET/data" || die "Existing SQLite data directory missing. Stop to avoid creating a fresh database."
test -f "$TARGET/data/hermestodo.sqlite" || die "Existing SQLite database missing. Stop to avoid overwriting production state."
test -d "$TARGET/backups" || die "Existing backups directory missing. Stop to avoid an unsafe update."

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Downloading the approved HermesTodo source..."
git clone --quiet --depth 1 --filter=blob:none --sparse --branch "$SOURCE_BRANCH" "$REPO_URL" "$tmp/repo"
git -C "$tmp/repo" sparse-checkout set HermesTodo
if [[ -n "${HERMESTODO_COMMIT:-}" ]]; then
  git -C "$tmp/repo" fetch --quiet --depth 1 origin "$HERMESTODO_COMMIT"
  git -C "$tmp/repo" checkout --quiet --detach FETCH_HEAD
fi
source_dir="$tmp/repo/HermesTodo"
test -f "$source_dir/compose.yaml" || die "Missing application source after checkout."
test -f "$source_dir/Dockerfile" || die "Missing application Dockerfile."

echo "Preparing an online SQLite backup (before changing application files)..."
(
  cd "$TARGET"
  docker compose ps --status running --services | grep -qx app || die "Existing app container is not running. Manual recovery is required before upgrade."
  docker compose exec -T app node scripts/backup.mjs
)
echo "Backup completed. Preserving .env, data, backups and existing TLS configuration."

echo "Synchronizing application files only..."
rsync -az --delete \
  --exclude='.env' --exclude='.env.*' \
  --exclude='data/' --exclude='backups/' \
  --exclude='.git/' --exclude='node_modules/' --exclude='dist/' \
  --exclude='*.sqlite*' \
  "$source_dir/" "$TARGET/"

echo "Rebuilding only the HermesTodo application container..."
(
  cd "$TARGET"
  docker compose config --quiet
  docker compose build app
  docker compose up -d --no-deps app
  ready=0
  for attempt in $(seq 1 24); do
    if node scripts/smoke.mjs http://127.0.0.1:3020/api/health >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 5
  done
  if [[ "$ready" != "1" ]]; then
    docker compose logs --tail=50 app
    die "Application health check failed; SQLite backup is preserved."
  fi
)

curl --insecure --fail --silent --show-error --max-time 15 "$ORIGIN/api/health" |
  grep -q '"status":"ok"' || die "The public API health check failed."

echo "HermesTodo updated successfully."
echo "Real backend, login and SQLite: $ORIGIN/"
echo "No change was made to other services or the public GitHub Pages demo."
