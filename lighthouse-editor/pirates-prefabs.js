import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Repository-backed permanent models. Unlike the "Import GLB" button,
// these models are delivered by GitHub Pages and shared by all browsers.
const BASE = new URL('./assets/pirates/', import.meta.url);
const FILENAME = /^[A-Za-z0-9][A-Za-z0-9_.-]*\.glb$/;
const ASSET_ID = /^pirates_[a-z0-9_]+$/;

export async function registerPiratePrefabs(catalog) {
  const response = await fetch(new URL('manifest.json', BASE), {cache:'no-store'});
  if (!response.ok) throw Error('Pirates manifest HTTP '+response.status);
  const manifest = await response.json();
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.assets))
    throw Error('Invalid Pirates manifest');
  const loader = new GLTFLoader(), templates = new Map(), errors = [], seen = new Set();
  const previousCreate = catalog.create.bind(catalog);
  for (const spec of manifest.assets) {
    try {
      if (!ASSET_ID.test(spec.id) || !FILENAME.test(spec.file)) throw Error('Invalid asset ID or filename');
      if (seen.has(spec.id) || catalog.types.includes(spec.id)) throw Error('Duplicate asset ID');
      seen.add(spec.id);
      const scale = Number(spec.defaultScale ?? 1);
      if (!Number.isFinite(scale) || scale <= 0) throw Error('Invalid default scale');
      const url = new URL(spec.file, BASE);
      const file = await fetch(url, {cache:'no-store'});
      if (!file.ok) throw Error('GLB HTTP '+file.status);
      const buffer = await file.arrayBuffer();
      const gltf = await loader.parseAsync(buffer, BASE.href);
      const scene = gltf.scene;
      const bounds = new T.Box3().setFromObject(scene);
      if (bounds.isEmpty() || !Number.isFinite(bounds.min.y)) throw Error('Empty geometry');
      let triangles = 0, meshes = 0;
      scene.traverse(node => {
        if (!node.isMesh) return;
        meshes++;
        const geo = node.geometry;
        triangles += (geo.index ? geo.index.count : geo.attributes.position?.count || 0)/3;
        node.castShadow = true;
        node.receiveShadow = true;
      });
      if (!meshes) throw Error('No meshes');
      const center = bounds.getCenter(new T.Vector3());
      scene.position.set(-center.x, -bounds.min.y, -center.z);
      const group = new T.Group();
      group.name = spec.id;
      group.add(scene);
      const size = bounds.getSize(new T.Vector3());
      templates.set(spec.id, group);
      catalog.types.push(spec.id);
      catalog.all[spec.id] = {
        label: String(spec.label || spec.file.replace(/\.glb$/i,'')),
        category: 'POLYGON Pirates 海盗资产',
        kind: 'complete',
        source: 'GitHub published GLB',
        defaultScale: scale,
        triangles: Math.round(triangles),
        size: size.toArray().map(x=>+x.toFixed(3))
      };
    } catch (err) {
      console.error('Pirate asset rejected:',spec?.file,err);
      errors.push({file:spec?.file,id:spec?.id,error:String(err?.message||err)});
    }
  }
  catalog.create = id => templates.has(id) ? templates.get(id).clone(true) : previousCreate(id);
  return {loaded:templates.size,total:manifest.assets.length,errors,ids:[...templates.keys()]};
}
