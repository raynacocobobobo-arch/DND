// Persistent map, named backups and per-browser catalog preferences.
// IndexedDB commits are verified by reading back their keys.
const DB_NAME='lighthouse-editor-persistent-v1';
const LEGACY_BACKUPS='dnd-lighthouse-editor-snapshots-v1';
let databasePromise;
function dbOpen(){
 if(databasePromise)return databasePromise;
 databasePromise=new Promise((resolve,reject)=>{
  if(!('indexedDB' in window)){reject(Error('浏览器不支持 IndexedDB'));return;}
  let req;
  try{req=indexedDB.open(DB_NAME,1)}catch(e){reject(e);return;}
  req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains('backups'))db.createObjectStore('backups',{keyPath:'id'});
   if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'key'});
   if(!db.objectStoreNames.contains('maps'))db.createObjectStore('maps',{keyPath:'key'});
  };
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||Error('IndexedDB 打开失败'));
  req.onblocked=()=>reject(Error('数据库被其他页面占用，请关闭旧编辑器页面'));
 }).catch(e=>{databasePromise=null;throw e});
 return databasePromise;
}
async function transaction(store,operation,key,value){
 const db=await dbOpen();
 return new Promise((resolve,reject)=>{
  let result;
  try{
   const tx=db.transaction(store,operation==='get'||operation==='all'?'readonly':'readwrite');
   const os=tx.objectStore(store);
   const req=operation==='get'?os.get(key):operation==='all'?os.getAll():
    operation==='delete'?os.delete(key):os.put(value);
   req.onsuccess=()=>{result=req.result};
   req.onerror=()=>reject(req.error||Error('IndexedDB 操作失败'));
   tx.oncomplete=()=>resolve(result);
   tx.onabort=()=>reject(tx.error||Error('IndexedDB 写入中止'));
   tx.onerror=()=>reject(tx.error||Error('IndexedDB 事务失败'));
  }catch(e){reject(e)}
 });
}
export async function createEditorStorage(){
 await dbOpen();
 const listBackups=async()=>((await transaction('backups','all'))||[])
  .filter(x=>x&&typeof x.id==='string'&&x.world)
  .sort((a,b)=>b.createdAt-a.createdAt);
 const getBackup=id=>transaction('backups','get',id);
 const createBackup=async(name,world)=>{
  const current=await listBackups();
  if(current.length>=50)throw Error('最多保留50份备份，请先删除旧备份');
  const entry={id:'backup-'+Date.now()+'-'+Math.random().toString(36).slice(2,11),
   name:String(name).slice(0,80),createdAt:Date.now(),world:structuredClone(world)};
  await transaction('backups','put',null,entry);
  const saved=await getBackup(entry.id);
  if(!saved||JSON.stringify(saved.world)!==JSON.stringify(entry.world))
   throw Error('备份写入后校验失败，不能认为已保存');
  return entry;
 };
 const removeBackup=async(id)=>{
  await transaction('backups','delete',id);
  if(await getBackup(id))throw Error('删除后仍读到该备份');
 };
 const loadCurrent=async()=>{
  const r=await transaction('maps','get','current');
  return r?.world||null;
 };
 const saveCurrent=async(world)=>{
  const entry={key:'current',savedAt:Date.now(),world:structuredClone(world)};
  await transaction('maps','put',null,entry);
 };
 const readHidden=async()=>{
  const row=await transaction('settings','get','hiddenAssets');
  return Array.isArray(row?.ids)?row.ids.filter(id=>typeof id==='string'):[];
 };
 const writeHidden=async(ids)=>{
  const unique=[...new Set(ids)];
  await transaction('settings','put',null,{key:'hiddenAssets',ids:unique});
  const actual=await readHidden();
  if(actual.length!==unique.length||unique.some(id=>!actual.includes(id)))
   throw Error('素材管理设置持久化校验失败');
 };
 // Migrate the original localStorage-only backups, without overwriting the newer records.
 try{
  const legacy=JSON.parse(localStorage.getItem(LEGACY_BACKUPS)||'[]');
  if(Array.isArray(legacy)){
   for(const b of legacy.slice(0,50)){
    if(!b||typeof b.id!=='string'||!b.world||typeof b.world!=='object')continue;
    if(!(await getBackup(b.id)))await transaction('backups','put',null,b);
   }
  }
 }catch(err){console.warn('旧备份读取失败：',err)}
 try{await navigator.storage?.persist?.()}catch{}
 return {listBackups,getBackup,createBackup,removeBackup,loadCurrent,saveCurrent,readHidden,writeHidden};
}
