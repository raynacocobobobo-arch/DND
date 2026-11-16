from __future__ import annotations
import csv
import hashlib
import html
import os
from pathlib import Path
from urllib.parse import quote, unquote
from zipfile import ZipFile, ZIP_DEFLATED

root = Path('site/severed-ember')
out = Path('output')
out.mkdir(parents=True, exist_ok=True)
asset_ext = {'.png','.jpg','.jpeg','.webp','.avif','.gif','.svg','.ico','.mp4','.webm','.mov','.wav','.mp3','.ogg','.flac','.glb','.gltf','.fbx','.blend','.obj','.zip','.7z','.rar','.pdf'}
source_ext = {'.html','.css','.js','.cjs'}
files = [p for p in root.rglob('*') if p.is_file()]
sources = sorted(p for p in files if p.suffix.lower() in source_ext)
if len(sources)<12:
    raise RuntimeError(f'Only found {len(sources)} website source files')
text = '\n'.join(html.unescape(unquote(p.read_text(encoding='utf-8', errors='replace'))) for p in sources)
assets = sorted(p for p in files if p.suffix.lower() in asset_ext)
records=[]
for p in assets:
    rel=p.relative_to(root).as_posix()
    tokens=[rel, quote(rel, safe='/'), p.name, quote(p.name)]
    referenced=any(token in text for token in tokens)
    records.append({'path':rel, 'bytes':p.stat().st_size,'extension':p.suffix.lower(),'referenced':referenced})
unused = [r for r in records if not r['referenced']]
used = [r for r in records if r['referenced']]
if len(assets)<250 or len(unused)<50:
    raise RuntimeError(f'Unexpected inventory: assets={len(assets)} unused={len(unused)}')
site_commit=os.popen('git -C site rev-parse HEAD').read().strip()
size_bytes=sum(r['bytes'] for r in unused)
intro=f'''# Severed Ember: Website-Unreferenced Asset Archive (2026-11-16)

Source: raynacocobobobo-arch/DND at gh-pages commit {site_commit}.

Checked {len(sources)} HTML, CSS, JS/CJS files under severed-ember/.

- Total candidate material files: {len(assets)}
- Referenced by these sources (conservatively): {len(used)}
- No reference found: {len(unused)}
- Combined unused file size: {size_bytes:,} bytes ({size_bytes/1e6:.2f} MB)

Included material types: images, graphics, audio/video, 3D files, and existing ZIP/archive/PDF assets.
The ZIP preserves paths beneath severed-ember/ and is a backup only. No production site assets were deleted or changed.

Classification conservatively searches for the complete repository-relative path, URL-encoded path, raw filename, or URL-encoded filename in every HTML/CSS/JS/CJS source. Therefore files referenced indirectly, from other projects, or only in editorial docs may be classified as unreferenced, and name collisions may yield referenced false positives. Review the list before deletion; no deletion is authorized.

manifest-unused.csv lists unreferenced items and SHA-256 digests; audit-all-assets.csv includes referenced status for every material item.
'''
(out/'README.md').write_text(intro,encoding='utf-8')
with (out/'audit-all-assets.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['path','bytes','extension','referenced']);w.writeheader();w.writerows(records)
with (out/'manifest-unused.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['path','bytes','extension','sha256']);w.writeheader()
    for r in unused:
        p=root/r['path'];w.writerow({**{k:r[k] for k in ['path','bytes','extension']},'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
archive=out/'severed-ember-unused-assets-20261116.zip'
with ZipFile(archive,'w',compression=ZIP_DEFLATED,compresslevel=6,allowZip64=True) as z:
    for r in unused:
        p=root/r['path']
        z.write(p,arcname='severed-ember/'+r['path'])
    for name in ['README.md','audit-all-assets.csv','manifest-unused.csv']:
        z.write(out/name,arcname='inventory/'+name)
archive_hash=hashlib.sha256(archive.read_bytes()).hexdigest()
(out/'SHA256SUMS.txt').write_text(f'{archive_hash}  {archive.name}\n',encoding='utf-8')
print(f'INPUT_COMMIT={site_commit}\nSOURCES={len(sources)} TOTAL={len(assets)} USED={len(used)} UNUSED={len(unused)} UNREFERENCED_BYTES={size_bytes}\nZIP={archive.name} ARCHIVE_BYTES={archive.stat().st_size} SHA256={archive_hash}')
