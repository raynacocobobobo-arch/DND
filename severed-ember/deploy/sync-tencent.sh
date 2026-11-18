#!/usr/bin/env bash
# Sync the GitHub Pages edition of Severed Ember to the existing Tencent Cloud server.
# Run as the regular SSH user who owns the repository (sudo is used for publishing).
set -Eeuo pipefail

REPOSITORY="${REPOSITORY:-/opt/severed-ember-source}"
SITE_ROOT="${SITE_ROOT:-/srv/www/severed-ember}"
BRANCH="gh-pages"

if ! command -v git >/dev/null || ! command -v rsync >/dev/null; then
  echo "git and rsync are required." >&2
  exit 1
fi
if ! git -C "$REPOSITORY" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Missing Git checkout at $REPOSITORY" >&2
  exit 1
fi
if [[ "$(git -C "$REPOSITORY" branch --show-current)" != "$BRANCH" ]]; then
  echo "Expected checkout on gh-pages; refusing to switch branches or overwrite local work." >&2
  exit 1
fi
if ! git -C "$REPOSITORY" diff --quiet || ! git -C "$REPOSITORY" diff --cached --quiet; then
  echo "Checkout has local tracked changes; commit or stash them first." >&2
  exit 1
fi

git -C "$REPOSITORY" pull --ff-only origin "$BRANCH"
SOURCE="$REPOSITORY/severed-ember"
test -f "$SOURCE/index.html"
test -f "$SOURCE/chapters/tarot.html"
grep -q '场景推测' "$SOURCE/chapters/tarot.html"
for card in 05-pontifex 07-currus 11-iustitia 17-stellae-fallaces 19-sol 20-iudicium; do
  test -s "$SOURCE/assets/tarot/$card.jpg" || { echo "Missing $card.jpg" >&2; exit 1; }
done

# Deploy the existing static site as a whole, not just the appendix.
# This matches the established Git + rsync --delete deployment approach.
sudo mkdir -p "$SITE_ROOT"
sudo rsync -a --delete "$SOURCE/" "$SITE_ROOT/"

# The current Caddy/Nginx cache configuration and site routing are not modified.
if systemctl is-active --quiet severed-ember.service 2>/dev/null; then
  sudo systemctl restart severed-ember.service
fi

grep -q '场景推测' "$SITE_ROOT/chapters/tarot.html"
for card in 05-pontifex 07-currus 11-iustitia 17-stellae-fallaces 19-sol 20-iudicium; do
  test -s "$SITE_ROOT/assets/tarot/$card.jpg"
done
echo "Tencent Cloud site files synchronized successfully."
echo "Git commit: $(git -C "$REPOSITORY" rev-parse --short HEAD)"
echo "Published to: $SITE_ROOT"
