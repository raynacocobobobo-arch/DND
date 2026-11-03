import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Imported GLBs live in IndexedDB, never in localStorage or the map's autosave.
// A portable project JSON may embed binary assets explicitly on user request.
const DATABASE = 'lighthouse-external-glb-v1';
const STORE = 'models';
const PREFIX = 'ext_glb_';
const LIMIT_BYTES = 25 * 1024 * 1024;
const MAX_IMPORTS = 220;
const inferCategory = name => /cliff|plateau|terrain|coast|beach|creek|ground|地形|悬崖|海岸/i.test(name) ? '外部地形 GLB' : '外部模型 GLB';

function openDatabase() {
 return new Promise(resolve => {
  if (!('indexedDB' in window)) { resolve(null); return; }
  let request;
  try { request = indexedDB.open(DATABASE, 1); } catch { resolve(null); return; }
  request.onupgradeneeded = () => {
   if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, {keyPath: 'id'});
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => resolve(null);
  request.onblocked = () => resolve(null);
 });
}
function readAll(db) {
 if (!db) return Promise.resolve([]);
 return new Promise(resolve => {
  try {
   const tx = db.transaction(STORE, 'readonly'), request = tx.objectStore(STORE).getAll();
   request.onsuccess = () => resolve(request.result || []);
   request.onerror = () => resolve([]);
  } catch { resolve([]); }
 });
}
function put(db, item) {
 if (!db) return Promise.resolve(false);
 return new Promise(resolve => {
  try {
   const tx = db.transaction(STORE, 'readwrite');
   tx.objectStore(STORE).put(item);
   tx.oncomplete = () => resolve(true);
   tx.onerror = () => resolve(false);
   tx.onabort = () => resolve(false);
  } catch { resolve(false); }
 });
}
async function removeFromDb(db,id){
 if(!db)throw Error('IndexedDB 不可用，无法永久删除本地模型');
 return new Promise((resolve,reject)=>{
  try{
   const tx=db.transaction(STORE,'readwrite');
   tx.objectStore(STORE).delete(id);
   tx.oncomplete=()=>resolve();
   tx.onerror=()=>reject(tx.error||Error('模型删除失败'));
   tx.onabort=()=>reject(tx.error||Error('模型删除已中止'));
  }catch(err){reject(err)}
 });
}
async function modelExists(db,id){
 if(!db)return false;
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).getKey(id);
  req.onsuccess=()=>resolve(req.result!==undefined);
  req.onerror=()=>reject(req.error||Error('模型校验失败'));
 });
}

async function hexId(buffer) {
 const hash = await crypto.subtle.digest('SHA-256', buffer);
 return PREFIX + [...new Uint8Array(hash)].slice(0, 12).map(v => v.toString(16).padStart(2, '0')).join('');
}
function encode64(buffer) {
 return new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1]);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(new Blob([buffer], {type: 'model/gltf-binary'}));
 });
}
function decode64(s) {
 if (typeof s !== 'string' || s.length > LIMIT_BYTES * 1.4) throw Error('模型内嵌数据超出上限');
 const binary = atob(s), bytes = new Uint8Array(binary.length);
 for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
 return bytes.buffer;
}
function triangleCount(scene) {
 let tris = 0;
 scene.traverse(node => {
  if (!node.isMesh || !node.geometry) return;
  const geo = node.geometry;
  tris += geo.index ? geo.index.count / 3 : (geo.attributes.position?.count || 0) / 3;
 });
 return Math.round(tris);
}
export async function createExternalGLBLibrary(catalog) {
 const loader = new GLTFLoader();
 const db = await openDatabase();
 const source = new Map(), templates = new Map();
 const createOriginal = catalog.create.bind(catalog);
 catalog.create = function(id) {
  const template = templates.get(id);
  return template ? template.clone(true) : createOriginal(id);
 };
 async function register(record, persist = false) {
  const bytes = record.bytes instanceof ArrayBuffer ? record.bytes : record.bytes?.buffer;
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength < 20 || bytes.byteLength > LIMIT_BYTES) throw Error('仅支持不超过 25MB 的有效 GLB');
  const magic = new DataView(bytes).getUint32(0, true);
  if (magic !== 0x46546c67) throw Error('不是二进制 GLB，请先转换 FBX/GLTF');
  const id = await hexId(bytes);
  if (record.id && id !== record.id) throw Error('模型内容与资源 ID 不匹配');
  if (templates.has(id)) return {id, exists: true, ...catalog.all[id]};
  if (templates.size >= MAX_IMPORTS) throw Error('本地素材上限为 220 个');
  const gltf = await loader.parseAsync(bytes.slice(0), '');
  const bounds = new T.Box3().setFromObject(gltf.scene);
  if (bounds.isEmpty() || !Number.isFinite(bounds.min.y)) throw Error('模型没有有效几何体');
  const tris = triangleCount(gltf.scene);
  if (tris > 500000) throw Error('模型过于复杂（超过 50 万 tris）');
  // Retain the original geometry and scale, with a predictable bottom-centre origin.
  const center = bounds.getCenter(new T.Vector3());
  gltf.scene.position.set(-center.x, -bounds.min.y, -center.z);
  const wrapper = new T.Group();
  wrapper.add(gltf.scene);
  wrapper.name = id;
  wrapper.traverse(node => {
   if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
  });
  const name = String(record.name || 'Imported GLB').replace(/\.glb$/i, '').slice(0, 90);
  const category = String(record.category || inferCategory(name)).slice(0, 64);
  const size = bounds.getSize(new T.Vector3()).toArray().map(n => +n.toFixed(3));
  templates.set(id, wrapper);
  source.set(id, {id, name, category, bytes});
  catalog.types.push(id);
  catalog.all[id] = {label: name, category, kind: 'complete', source: '本地导入 GLB', triangles: tris, size, fileSize: bytes.byteLength};
  if (persist) {
   const committed = await put(db,{id,name,category,bytes});
   if (!committed || !(await modelExists(db,id))) {
    templates.delete(id);source.delete(id);
    const position=catalog.types.indexOf(id);if(position>=0)catalog.types.splice(position,1);
    delete catalog.all[id];
    throw Error('GLB 未能持久保存到浏览器，已撤销本次导入；请检查存储空间或浏览器权限');
   }
  }
  return {id, name, triangles: tris, size, category, persistent: !!db};
 }
 async function importFiles(files) {
  const added = [], errors = [];
  for (const file of Array.from(files || [])) {
   try {
    if (!/\.glb$/i.test(file.name)) throw Error('请选择 .glb 文件');
    const out = await register({name: file.name, bytes: await file.arrayBuffer()}, true);
    added.push(out);
   } catch (err) { errors.push({name: file.name, error: err.message}); }
  }
  return {added, errors};
 }
 async function exportPortable(map) {
  const ids = [...new Set((map.objects || []).map(obj => obj.asset).filter(a => a.startsWith(PREFIX)))];
  const included = [];
  const missing = [];
  for (const id of ids) {
   const r = source.get(id);
   if (!r) { missing.push(id); continue; }
   included.push({id, name: r.name, category:r.category, base64: await encode64(r.bytes)});
  }
  if (missing.length) throw Error('缺少 ' + missing.length + ' 个原始 GLB，无法制作完整工程包');
  return {...map, externalGLBs: included};
 }
 async function importPortable(map) {
  const embedded = map?.externalGLBs;
  if (!Array.isArray(embedded)) return {added: [], errors: []};
  if (embedded.length > MAX_IMPORTS) throw Error('工程内模型数量过多');
  const added = [], errors = [];
  for (const rec of embedded) {
   try { added.push(await register({id: rec.id, name: rec.name, category:rec.category, bytes: decode64(rec.base64)}, true)); }
   catch (err) { errors.push({name: rec.name || rec.id, error: err.message}); }
  }
  return {added, errors};
 }
 async function removeAsset(id) {
  if(!templates.has(id)||!id.startsWith(PREFIX))throw Error('该模型不是可删除的本地导入 GLB');
  await removeFromDb(db,id);
  if(await modelExists(db,id))throw Error('模型未从数据库删除');
  templates.delete(id);source.delete(id);
  const n=catalog.types.indexOf(id);if(n>=0)catalog.types.splice(n,1);
  delete catalog.all[id];
  return true;
 }
 async function renameAsset(id, nextName, nextCategory) {
  const current=source.get(id);
  if(!current)throw Error('找不到本地素材：'+id);
  const name=String(nextName||current.name).trim().replace(/\.glb$/i,'').slice(0,90)||current.name;
  const category=String(nextCategory||current.category||inferCategory(name)).trim().slice(0,64)||inferCategory(name);
  const next={...current,name,category};
  if(!await put(db,next))throw Error('素材属性未能保存到本地数据库');
  source.set(id,next);
  catalog.all[id]={...catalog.all[id],label:name,category};
  return {id,name,category};
 }
 function getAsset(id) {
  const record=source.get(id);
  return record?{...record,meta:{...catalog.all[id]}}:null;
 }
 function listAssets() {
  return [...source.keys()].map(id=>{
   const record=source.get(id),meta=catalog.all[id]||{};
   return {id,name:record.name,category:record.category||meta.category||inferCategory(record.name),
    size:record.bytes.byteLength,triangles:meta.triangles||0,dimensions:meta.size||[]};
  });
 }
 async function refresh() {
  const saved=await readAll(db),records=saved.slice(0,MAX_IMPORTS),keep=new Set(records.map(r=>r.id));
  for(const id of [...templates.keys()])if(!keep.has(id)){
   templates.delete(id);source.delete(id);
   const n=catalog.types.indexOf(id);if(n>=0)catalog.types.splice(n,1);
   delete catalog.all[id];
  }
  for(const record of records){
   if(templates.has(record.id)){
    const current=source.get(record.id);
    const name=String(record.name||current?.name||'Imported GLB').replace(/\.glb$/i,'').slice(0,90);
    const category=String(record.category||inferCategory(name)).slice(0,64);
    const bytes=record.bytes instanceof ArrayBuffer?record.bytes:record.bytes?.buffer;
    source.set(record.id,{...record,name,category,bytes});
    catalog.all[record.id]={...catalog.all[record.id],label:name,category};
   }else{
    try{await register(record);}catch(err){console.warn('忽略无法刷新本地 GLB',record.id,err);}
   }
  }
  return listAssets();
 }
 const saved = await readAll(db);
 for (const record of saved.slice(0, MAX_IMPORTS)) {
  try { await register(record); } catch (err) { console.warn('忽略无法恢复的 GLB', record.id, err); }
 }
 return {importFiles, exportPortable, importPortable, removeAsset, renameAsset, getAsset, listAssets, refresh,
  has: id => templates.has(id), count: () => templates.size, ids: () => [...templates.keys()], persistent: !!db};
}
