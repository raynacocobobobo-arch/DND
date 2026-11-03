import {createExternalGLBLibrary} from './external-glb-library-local.js?v=555-shared-local-db';
import {createEditorStorage} from './editor-storage.js?v=1';

const $=id=>document.getElementById(id);
const catalog={types:[],all:{},create:()=>null};
const library=await createExternalGLBLibrary(catalog);
const frame=$('frame');
let store=null,usage=new Map(),usageReady=false,selected=new Set(),busy=false;
let previewReady=false,previewBusy=false,previewQueue=[],previewObserver=null;
const queued=new Set(),pendingLive=new Map();
const channel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('lighthouse-local-assets-v1'):null;
let requestSerial=0;

const number=n=>new Intl.NumberFormat('zh-CN').format(n||0);
const bytes=n=>n<1024*1024?(n/1024).toFixed(0)+' KB':(n/1024/1024).toFixed(2)+' MB';
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function notifyEditor(){channel?.postMessage({type:'assets-changed',at:Date.now()});}
function addUsage(map,label){
 for(const obj of map?.objects||[]){
  if(typeof obj.asset!=='string')continue;
  const refs=usage.get(obj.asset)||[];
  refs.push(label+(obj.name?' · '+obj.name:''));
  usage.set(obj.asset,refs);
 }
}
async function liveUsage(){
 if(!channel)return new Set();
 const requestId='usage-'+Date.now()+'-'+(++requestSerial);
 const result={ids:new Set(),responders:0};
 pendingLive.set(requestId,result);
 channel.postMessage({type:'usage-request',requestId});
 await new Promise(resolve=>setTimeout(resolve,280));
 pendingLive.delete(requestId);
 return result.ids;
}
channel?.addEventListener('message',event=>{
 const data=event.data||{};
 if(data.type==='usage-response'&&pendingLive.has(data.requestId)){
  const result=pendingLive.get(data.requestId);
  for(const id of data.ids||[])if(typeof id==='string')result.ids.add(id);
  result.responders++;
 }
});
async function readUsage(){
 usage=new Map();usageReady=false;
 try{
  store=await createEditorStorage();
  addUsage(await store.loadCurrent(),'当前地图');
  for(const backup of await store.listBackups())addUsage(backup.world,'备份「'+backup.name+'」');
  for(const key of ['dnd-lighthouse-world-map-v2','dnd-lighthouse-map-editor-v1']){
   const raw=localStorage.getItem(key);
   if(raw)addUsage(JSON.parse(raw),'历史地图');
  }
  for(const id of await liveUsage()){
   const refs=usage.get(id)||[];refs.push('当前打开的地图（实时检查）');usage.set(id,refs);
  }
  usageReady=true;
 }catch(error){console.warn('本地地图依赖检查失败',error);usageReady=false;}
}
function allAssets(){return library.listAssets().sort((a,b)=>a.category.localeCompare(b.category,'zh-CN')||a.name.localeCompare(b.name,'zh-CN'));}
function currentAssets(){
 const query=$('search').value.trim().toLowerCase(),category=$('category').value;
 return allAssets().filter(a=>(category==='all'||a.category===category)&&(!query||
  a.name.toLowerCase().includes(query)||a.id.toLowerCase().includes(query)||a.category.toLowerCase().includes(query)));
}
function refreshCategories(){
 const prior=$('category').value,categories=[...new Set(allAssets().map(a=>a.category))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 $('category').replaceChildren(new Option('全部分类','all'));
 for(const category of categories)$('category').add(new Option(category,category));
 if(categories.includes(prior))$('category').value=prior;
}
function formatDetails(asset){
 const parts=[bytes(asset.size),number(asset.triangles)+' tris'];
 if(asset.dimensions?.length===3)parts.push(asset.dimensions.map(v=>Number(v).toFixed(2)).join(' × '));
 return parts.join(' · ');
}
function render(){
 refreshCategories();
 const assets=currentAssets(),grid=$('grid');
 if(previewObserver)previewObserver.disconnect();
 previewQueue=[];queued.clear();grid.replaceChildren();
 for(const asset of assets){
  const card=document.createElement('article');card.className='asset'+(selected.has(asset.id)?' selected':'');
  const preview=document.createElement('div');preview.className='preview';
  const img=document.createElement('img');img.alt=asset.name+' 预览';img.dataset.id=asset.id;img.loading='lazy';
  const placeholder=document.createElement('span');placeholder.className='placeholder';placeholder.textContent='3D 预览';
  preview.append(img,placeholder);
  const check=document.createElement('input');check.type='checkbox';check.className='select-item';check.checked=selected.has(asset.id);
  check.disabled=!usageReady||usage.has(asset.id);check.title=usage.has(asset.id)?'地图或备份正在使用，不能删除':'选择素材';
  check.onchange=()=>{if(check.checked)selected.add(asset.id);else selected.delete(asset.id);renderSelection();};
  preview.append(check);
  if(usage.has(asset.id)){
   const used=document.createElement('span');used.className='used-tag';used.textContent='使用中';used.title=usage.get(asset.id).join('\n');preview.append(used);
  }
  const meta=document.createElement('div');meta.className='meta';
  const name=document.createElement('div');name.className='name';name.textContent=asset.name;
  const category=document.createElement('div');category.className='category';category.textContent=asset.category;
  const details=document.createElement('div');details.className='details';details.textContent=formatDetails(asset);
  const actions=document.createElement('div');actions.className='actions';
  const edit=document.createElement('button');edit.type='button';edit.textContent='改名 / 分类';edit.onclick=()=>rename(asset.id);
  const download=document.createElement('button');download.type='button';download.textContent='导出 GLB';download.onclick=()=>downloadAsset(asset.id);
  actions.append(edit,download);meta.append(name,category,details,actions);card.append(preview,meta);grid.append(card);
  previewObserver?.observe(img);
 }
 if(!assets.length){
  const empty=document.createElement('div');empty.className='empty';
  empty.innerHTML='<div class="empty-icon">＋</div><strong>本地素材库还是空的</strong><p>导入你自己的 GLB 模型。导入后地图编辑器会自动读取，不需要上传 GitHub。</p>';
  grid.append(empty);
 }
 $('total').textContent=number(library.count())+' 个本地模型';
 $('visible').textContent=number(assets.length)+' 个当前显示';
 $('used').textContent=number([...usage.keys()].length)+' 个被地图或备份引用';
 $('storage').textContent=library.persistent?'本地 IndexedDB 已连接':'浏览器本地数据库不可用';
 $('storage').classList.toggle('error',!library.persistent);
 renderSelection();
 previewObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;previewObserver.unobserve(entry.target);queuePreview(entry.target.dataset.id,entry.target);}
 },{root:null,rootMargin:'160px'});
 for(const img of grid.querySelectorAll('img[data-id]'))previewObserver.observe(img);
}
function renderSelection(){
 const ids=[...selected],blocked=ids.filter(id=>usage.has(id)),safe=ids.length-blocked.length;
 $('selection-info').textContent='已选 '+ids.length+' 项 · 可删除 '+safe+' 项 · 使用中 '+blocked.length+' 项';
 $('delete-selected').disabled=busy||!usageReady||!library.persistent||safe===0;
 $('select-all').disabled=busy||!usageReady;
}
function queuePreview(id,img){
 if(queued.has(id)||img.dataset.requested)return;
 img.dataset.requested='1';queued.add(id);previewQueue.push({id,img});dispatchPreview();
}
function dispatchPreview(){
 if(!previewReady||previewBusy||!previewQueue.length)return;
 const job=previewQueue.shift();queued.delete(job.id);
 if(!job.img.isConnected){dispatchPreview();return;}
 const record=library.getAsset(job.id);
 if(!record){dispatchPreview();return;}
 const buffer=record.bytes.slice(0);
 previewBusy=true;
 frame.contentWindow.postMessage({type:'render-glb',key:job.id,buffer},'*',[buffer]);
}
frame.addEventListener('load',()=>{previewReady=true;dispatchPreview();});
window.addEventListener('message',event=>{
 if(event.source!==frame.contentWindow)return;
 if(event.data?.type==='preview-ready'){previewReady=true;dispatchPreview();return;}
 if(event.data?.type!=='render-result')return;
 previewBusy=false;
 const img=[...document.querySelectorAll('img[data-id]')].find(x=>x.dataset.id===event.data.key);
 if(img?.isConnected&&event.data.dataUrl){img.src=event.data.dataUrl;img.parentElement.querySelector('.placeholder')?.remove();}
 else if(img?.isConnected&&event.data.error){img.alt='预览失败：'+event.data.error;}
 dispatchPreview();
});
async function rename(id){
 const record=library.getAsset(id);if(!record)return;
 const name=prompt('素材名称',record.name);if(name===null)return;
 const category=prompt('素材分类',record.category||'外部模型 GLB');if(category===null)return;
 try{
  await library.renameAsset(id,name,category);
  notifyEditor();render();status('已更新素材名称和分类：'+name.trim());
 }catch(error){status('修改失败：'+error.message,true);}
}
function downloadAsset(id){
 const record=library.getAsset(id);if(!record)return;
 const url=URL.createObjectURL(new Blob([record.bytes],{type:'model/gltf-binary'}));
 const a=document.createElement('a');a.href=url;a.download=(record.name||id)+'.glb';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),3000);
}
async function importFiles(files){
 if(!files.length)return;
 if(!library.persistent){status('本地数据库不可用，无法保存素材。',true);return;}
 busy=true;$('import').disabled=true;status('正在导入 '+files.length+' 个 GLB…');
 try{
  const result=await library.importFiles(files);
  await readUsage();render();notifyEditor();
  const failures=result.errors.slice(0,4).map(x=>x.name+'：'+x.error).join('；');
  status('导入完成：成功 '+result.added.length+' 个，失败 '+result.errors.length+' 个。'+(failures?'失败原因：'+failures:''));
 }catch(error){status('导入失败：'+error.message,true);}
 finally{busy=false;$('import').disabled=false;$('files').value='';renderSelection();}
}
async function deleteSelected(){
 if(busy||!usageReady||!library.persistent)return;
 const ids=[...selected],blocked=ids.filter(id=>usage.has(id)),safe=ids.filter(id=>!usage.has(id));
 if(blocked.length)alert('以下模型仍被当前地图或本地备份使用，不能删除：\n'+blocked.slice(0,12).map(id=>library.getAsset(id)?.name||id).join('\n'));
 if(!safe.length)return;
 if(!confirm('从本机素材库永久删除 '+safe.length+' 个模型？\n\n只影响本机浏览器数据库，不会访问或删除 GitHub 文件，也不会修改正式游戏和存档。'))return;
 busy=true;$('delete-selected').disabled=true;status('正在删除本地模型…');
 try{
  for(const id of safe)await library.removeAsset(id);
  selected.clear();await readUsage();render();notifyEditor();
  status('已从本机素材库删除 '+safe.length+' 个模型。');
 }catch(error){status('删除未完全完成：'+error.message,true);await library.refresh();await readUsage();render();}
 finally{busy=false;renderSelection();}
}
async function reload(){
 if(busy)return;
 busy=true;$('reload').disabled=true;status('正在读取本地素材库…');
 try{await library.refresh();await readUsage();selected.clear();render();status('本地素材库已刷新。');}
 catch(error){status('刷新失败：'+error.message,true);}
 finally{busy=false;$('reload').disabled=false;renderSelection();}
}
$('files').onchange=e=>importFiles([...(e.target.files||[])]);
$('import').onclick=()=>$('files').click();
$('delete-selected').onclick=deleteSelected;
$('select-all').onclick=()=>{for(const a of currentAssets())if(!usage.has(a.id))selected.add(a.id);render();};
$('clear-selection').onclick=()=>{selected.clear();render();};
$('search').addEventListener('input',render);
$('category').addEventListener('change',render);
$('reload').onclick=reload;
await readUsage();
render();
status(library.persistent?'已连接本地素材库。导入、改名和删除都只在本机生效。':'本地数据库不可用，请使用支持 IndexedDB 的浏览器。',!library.persistent);
