#!/usr/bin/env bash
# Severed Ember 2026-11-24: pinned incremental archive + optional deployment.
set -Eeuo pipefail
TARGET='487e2c958246609d223c5d55defff400f3c7541a'
BASE='8fdb4280633238fdadacc320201d43568f077036'
REPO='/opt/severed-ember-source'
SITE='/srv/www/severed-ember'
PROXY='http://127.0.0.1:7890'
MODE=pack
case "$#" in 0) ;; 1) [[ "$1" == '--deploy' ]] || { echo 'Usage: bash 20261124-sync.sh [--deploy]' >&2; exit 2; }; MODE=deploy;; *) exit 2;; esac
die(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }
for cmd in git python3 tar gzip; do command -v "$cmd" >/dev/null || die "Missing $cmd"; done
git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Missing checkout: $REPO"
[[ "$(git -C "$REPO" branch --show-current)" == gh-pages ]] || die 'Expected gh-pages checkout.'
remote=$(git -C "$REPO" remote get-url origin)
case "$remote" in https://github.com/raynacocobobobo-arch/DND.git|https://github.com/raynacocobobobo-arch/DND|git@github.com:raynacocobobobo-arch/DND.git) ;; *) die 'Unexpected origin.';; esac
[[ -z "$(git -C "$REPO" status --porcelain --untracked-files=no)" ]] || die 'Tracked local changes exist. Inspect and preserve them before syncing; do not reset or force checkout.'
if [[ "$MODE" == deploy ]]; then for cmd in rsync sudo; do command -v "$cmd" >/dev/null || die "Missing $cmd"; done; sudo -v; fi
export HTTP_PROXY="$PROXY" HTTPS_PROXY="$PROXY" ALL_PROXY="$PROXY" http_proxy="$PROXY" https_proxy="$PROXY" all_proxy="$PROXY"
git -C "$REPO" -c http.proxy="$PROXY" fetch --no-tags --filter=blob:none origin "$TARGET"
git -C "$REPO" cat-file -e "$TARGET^{commit}" || die 'Pinned commit unavailable.'
WORK=$(mktemp -d "$HOME/severed-ember-20261124.XXXXXX")
cat > "$WORK/MANIFEST.git-sha1" <<'EMBER_MANIFEST'
949668ec1a416d4d7ce4fd31fad30bf9a0f5c032  severed-ember/assets/index-app.js
186c2c3c3809eaf1493f571b9a6b00c5aab809e0  severed-ember/assets/index-overrides.css
1d8acbf8ea367971fb359e85c65e34bfdcdc56d1  severed-ember/assets/rules-fragment.html
a31d98d868a1c9cb42ead35f0873dd5f897f7c7b  severed-ember/assets/rules/models/30k-01-standard.webp
8d0d7889bff1e4a53737e4a67b872cee433d5037  severed-ember/assets/rules/models/30k-01.webp
a24d6178ba4be38d84285866afdcefb756ab498e  severed-ember/assets/rules/models/30k-02-standard.webp
bad713ce1240441d18117bd477d31cb44ba01db2  severed-ember/assets/rules/models/30k-02.webp
73f97c0f9c3e1353c747911d3e790b068fd82c4f  severed-ember/assets/rules/models/30k-03-standard.webp
d81b2cdc296da25123341e1569c542c3fc863570  severed-ember/assets/rules/models/30k-03.webp
01dfb40bf5b3e9a9dd302ed365db7c867c14c7f4  severed-ember/assets/rules/models/30k-04-standard.webp
6589fa0207bb19498df2b995b10c6d216cdf2431  severed-ember/assets/rules/models/30k-04.webp
920e899fb6eb1daa5929df663ba52c953380fecf  severed-ember/assets/rules/models/30k-05-standard.webp
1f1472dc288ee7c2dd6053de42e0e4a48d8bd98f  severed-ember/assets/rules/models/30k-05.webp
1adcd1c6fe2dce93f2a9a45f817efee71edf0afe  severed-ember/assets/rules/models/30k-06-standard.webp
6f585c79a708e3b2d32a8e030624e972a4334861  severed-ember/assets/rules/models/30k-06.webp
24e23e122f54917a2930eacfc08861e2a0cd51b4  severed-ember/assets/rules/models/30k-07-standard.webp
3575995c8dd863d71a2b5055c6b7546cdd23a52b  severed-ember/assets/rules/models/30k-07.webp
ef879b5341e5632d4b6d5c072173491c40a4418d  severed-ember/assets/rules/models/30k-08-standard.webp
c44d10b4eeded3d5dec7b968b51eec7901a470d0  severed-ember/assets/rules/models/30k-08.webp
1aba083ebcce6922455fcb3adfed0446c6730118  severed-ember/assets/rules/models/30k-09-standard.webp
3300c561aa2c1582fb289b9721df744ba95e49a1  severed-ember/assets/rules/models/30k-09.webp
a70f10e56547a904e03c2a1c71f1f60cc484930d  severed-ember/assets/rules/models/30k-10-standard.webp
d139d458944aa969ec0de592e6a05072a9cfb250  severed-ember/assets/rules/models/30k-10.webp
fe3f522e932ff476025b4e58c960cf2c1046e00c  severed-ember/assets/rules/models/40k-01-standard.webp
1f7c4af67ae34bf5acecd99acb3fad9868484e24  severed-ember/assets/rules/models/40k-01.webp
2926d79e482e67a3ecea8e0637a23feaed43dd8a  severed-ember/assets/rules/models/40k-02-standard.webp
8db1b323c7b41ee4321174d067a43584f40ac52a  severed-ember/assets/rules/models/40k-02.webp
7519a13553e3193d1d5b1aaf86c83c7bb4ec3352  severed-ember/assets/rules/models/40k-03-standard.webp
f29a793dd4c93fb4c1982429cbc24c9342f9357b  severed-ember/assets/rules/models/40k-03.webp
5663547de9646939230a49cbd315faf867a6bac2  severed-ember/assets/rules/models/40k-04-standard.webp
5db623f5768430e6a3f0ca4bf7955516acb42034  severed-ember/assets/rules/models/40k-04.webp
153b3c7b4c056e27495bb383bb46574e4e2a1741  severed-ember/assets/rules/models/40k-05-standard.webp
f0948aafbf9c12f3f961c8be8216045be6f655d0  severed-ember/assets/rules/models/40k-05.webp
76dfec4abc0ec47fcccc93dafe95b2738bf765db  severed-ember/assets/rules/models/40k-06-standard.webp
fc6097c3663b6623393b9063209b8cd8e318d178  severed-ember/assets/rules/models/40k-06.webp
58413c0c47a67bfdf4364a38036eaf5431d57f88  severed-ember/assets/rules/models/40k-07-standard.webp
89056d5ac93e5bf970f5a7d8520b4bcdd2d6c5aa  severed-ember/assets/rules/models/40k-07.webp
681b2a2a4829b526b141ff1b2bbfc708ca8a9381  severed-ember/assets/rules/models/40k-08-standard.webp
63b4db4cd170b6e74b9cd5e93fa9359cc85dacec  severed-ember/assets/rules/models/40k-08.webp
39b06627d2eee9329003e233e8a6e0228553b014  severed-ember/assets/rules/models/40k-09-standard.webp
35438f2598e42972d583cbf5ba20b7dfd491d1d4  severed-ember/assets/rules/models/40k-09.webp
b620e4b24f5f0371ef05e4774f50f10c9b355be1  severed-ember/assets/rules/models/40k-10-standard.webp
a84e75dec8c39a656d5b826f59c553eedd33a01c  severed-ember/assets/rules/models/40k-10.webp
f9194edf80c6de8a4288905dd38753cd11abe053  severed-ember/assets/rules/models/40k-11-standard.webp
0b0dda10cb6eb78548b8290106165ab3a0547c63  severed-ember/assets/rules/models/40k-11.webp
800e00ebeaad9a57b633e3bc89ae214f9a07070d  severed-ember/assets/rules/models/40k-12-standard.webp
272ea2d16c9ec278b99d9e3b8da13ee3232b9bab  severed-ember/assets/rules/models/40k-12.webp
f44b5da5930100684ab33684cfb7e22930f48b43  severed-ember/assets/rules/models/40k-13-standard.webp
327dfa45c3a3569d7acd06a730113af71bd9c5cd  severed-ember/assets/rules/models/40k-13.webp
102cde024ef7e18e1cdd3138776139eef8488961  severed-ember/assets/rules/models/40k-14-standard.webp
fd4018c306acda2821ccf1b47321c3d4e009bea7  severed-ember/assets/rules/models/40k-14.webp
85c84cc4ded4168396b6c0fae553488b55849cb3  severed-ember/assets/rules/models/40k-15-standard.webp
2af70e1ea2a5a6402a1ad6ae14a4a52a212fcc0b  severed-ember/assets/rules/models/40k-15.webp
48f13af0b91307caf8d9baeb8e1f32ece40e4661  severed-ember/assets/rules/models/40k-16-standard.webp
b93cbe1184e5cc6007e3dcaee39437f965be0453  severed-ember/assets/rules/models/40k-16.webp
558736e744f9db9bf1ea1e306889fbef686978fb  severed-ember/chapters/05-campaigns.html
b95a2aa2725b64406c82c8447830551236cbdc7c  severed-ember/chapters/07-other-histories.html
c089088557b9ce0d1a75ca845debc635a27f8867  severed-ember/full-text.html
89bf82fd55872f2ffc78cead7492e93ca6b8c1bf  severed-ember/index.html
45146de0f6cd4250aa05dae60e18e9e3102d2e6a  severed-ember/source/破碎余烬隐修会_V3.7_原稿.md
30daea62ad5ccb6a4232d9fc4e4e508542b8b1cb  severed-ember/tabletop-rules.html
EMBER_MANIFEST
mapfile -t FILES < <(cut -c 43- "$WORK/MANIFEST.git-sha1")
[[ "${#FILES[@]}" == 61 ]] || die 'Manifest file count changed.'
ARCHIVE="$WORK/severed-ember-20261124-delta.tar.gz"
git -C "$REPO" -c http.proxy="$PROXY" archive --format=tar.gz --output="$ARCHIVE" "$TARGET" -- "${FILES[@]}"
python3 - "$ARCHIVE" "$WORK/MANIFEST.git-sha1" <<'PY'
import hashlib, pathlib, sys, tarfile
archive, manifest = sys.argv[1:]
expected = dict((p,h) for h,p in (line.split('  ',1) for line in pathlib.Path(manifest).read_text().splitlines()))
with tarfile.open(archive,'r:gz') as t:
    actual = {m.name:m for m in t if m.isfile()}
    if set(actual) != set(expected): raise SystemExit('Archive file set mismatch')
    for name, digest in expected.items():
        data=t.extractfile(actual[name]).read()
        if hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()!=digest: raise SystemExit('Hash mismatch: '+name)
print('Verified all '+str(len(expected))+' Git blob hashes in compressed archive.')
PY
ls -lh "$ARCHIVE"
sha256sum "$ARCHIVE" | tee "$ARCHIVE.sha256"
[[ "$MODE" == deploy ]] || { printf 'Archive ready: %s\nRun this script with --deploy to sync the site.\n' "$ARCHIVE"; exit 0; }
BEFORE=$(git -C "$REPO" rev-parse HEAD)
if git -C "$REPO" merge-base --is-ancestor "$BEFORE" "$TARGET"; then
  git -C "$REPO" -c http.proxy="$PROXY" merge --ff-only "$TARGET"
elif git -C "$REPO" merge-base --is-ancestor "$TARGET" "$BEFORE"; then
  git -C "$REPO" diff --quiet "$TARGET" "$BEFORE" -- severed-ember || die 'Newer site changes exist; refuse to overwrite them with this release.'
else
  die 'Checkout history diverged or is too shallow; inspect/deepen it without resetting.'
fi
SOURCE="$REPO/severed-ember"
[[ -s "$SOURCE/index.html" && -s "$SOURCE/assets/rules-fragment.html" && -s "$SOURCE/assets/tarot/07-currus.jpg" ]] || die 'Incomplete site checkout.'
grep -q 'assets/tarot/07-currus.jpg' "$SOURCE/index.html" || die 'Tarot homepage is not the approved Chariot version.'
while IFS= read -r line; do
  hash="${line:0:40}"; p="${line:42}"
  [[ "$(git -C "$REPO" hash-object "$REPO/$p")" == "$hash" ]] || die "Checkout hash mismatch: $p"
done < "$WORK/MANIFEST.git-sha1"
sudo test -d "$SITE" || die 'Existing dedicated site root not found.'
BACKUP="$WORK/previous-files"
sudo mkdir -p "$BACKUP"
# Sync only the dedicated site. No --delete: retain unrelated existing files.
sudo rsync -a --checksum --backup --backup-dir="$BACKUP" --itemize-changes "$SOURCE/" "$SITE/" | tee "$WORK/rsync.log"
while IFS= read -r line; do
  hash="${line:0:40}"; p="${line:42}"; rel="${p#severed-ember/}"
  [[ "$(sudo git hash-object "$SITE/$rel")" == "$hash" ]] || die "Published hash mismatch: $rel"
done < "$WORK/MANIFEST.git-sha1"
printf 'Deployment verified: 61 changed files.\nPrevious HEAD: %s\nCurrent HEAD: %s\nBackup: %s\nArchive: %s\n' "$BEFORE" "$(git -C "$REPO" rev-parse HEAD)" "$BACKUP" "$ARCHIVE"
echo 'Caddy, services, other sites, and ports were not modified.'
echo 'Check https://deepgpt2077.duckdns.org:8443/severed-ember/ in the browser.'
