# POLYGON Pirates · permanent editor asset library

This directory is a **GitHub Pages asset directory**, not the browser "Import GLB" storage.

- `*.glb`: published binary files, e.g. `SM_Prop_Parrot_01.glb`.
- `manifest.json`: required asset index. Models not listed here do not appear in the editor.
- `../../pirates-prefabs.js`: permanent model loader, used by `../../editor.js` and `../../../lighthouse/v35-preview-scene.js`.

Browser uploads via "选择 GLB 文件" are stored separately in IndexedDB
(`lighthouse-external-glb-v1`), not automatically written to this directory.

The Windows publisher must push **both** the GLB and updated `manifest.json`
to `gh-pages`, then verify Git Blob SHA of the published binary.
Registration is not equivalent to browser rendering acceptance.

The initial manifest has zero assets until a real GLB is uploaded and indexed.
