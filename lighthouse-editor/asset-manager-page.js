import {createEditorStorage} from './editor-storage.js?v=1';

const REPO='raynacocobobobo-arch/DND';
const API='https://api.github.com/repos/'+REPO;
const BRANCH='gh-pages';
const PIRATES_MANIFEST='lighthouse-editor/assets/pirates/manifest.json';
const CLIFFY_REMOVED='lighthouse-editor/assets/cliffy-coast/removed.json';
const $=id=>document.getElementById(id);
let assets=[],allTree=new Map(),selected=new Set(),usage=new Map();
let store=null,guardReady=false,guardError='',busy=false,previewReady=false,previewBusy=false,epoch=0;
let previews=[],previewObserver=null,previewMemory=new Map();
const displayNumber=n=>new Intl.NumberFormat('zh-CN').format(n);
const ASSEMBLIES={
 'cliffy_coast_complete_house1_red':['cliffy_coast_house1_exterior_only','cliffy_coast_house1_interiour','cliffy_coast_roof_red'],
 'cliffy_coast_complete_house1_blue':['cliffy_coast_house1_exterior_only','cliffy_coast_house1_interiour','cliffy_coast_roof_blue'],
 'cliffy_coast_complete_house1_grey':['cliffy_coast_house1_exterior_only','cliffy_coast_house1_interiour','cliffy_coast_roof_grey'],
 'cliffy_coast_complete_house2_red':['cliffy_coast_house2_exteriour_only','cliffy_coast_house2_interiour','cliffy_coast_roof_red'],
 'cliffy_coast_complete_house2_blue':['cliffy_coast_house2_exteriour_only','cliffy_coast_house2_interiour','cliffy_coast_roof_blue'],
 'cliffy_coast_complete_house3_grey':['cliffy_coast_house3_exteriour_only','cliffy_coast_roof_grey']
};

function status(message,error=false){
 const el=$('status');el.textContent=message;el.classList.toggle('error',!!error);
}
async function jsonFetch(url,options={}){
 const res=await fetch(url,{cache:'no-store',...options});
 if(!res.ok)throw Error((res.status||'')+' '+(res.statusText||'')+' · '+url);
 return res.json();
}
function pirateCategory(filename){
 const f=filename.toLowerCase();
 if(f.includes('bld_'))return '海盗 · 建筑';
 if(f.includes('prop_'))return '海盗 · 道具';
 if(f.includes('wep_'))return '海盗 · 武器';
 if(f.includes('char_')||f==='characters.glb')return '海盗 · 人物';
 if(f.startsWith('fx_'))return '海盗 · 特效';
 return '海盗 · 其他';
}
async function loadAssets(){
 const [pirate,cliffy,removed]=await Promise.all([
  jsonFetch('./assets/pirates/manifest.json'),
  jsonFetch('./assets/cliffy-coast/asset-manager-index.json'),
  jsonFetch('./assets/cliffy-coast/removed.json')
 ]);
 if(!Array.isArray(pirate.assets)||!Array.isArray(cliffy.assets)||!Array.isArray(removed.ids))
  throw Error('仓库的素材索引格式不正确');
 // Gallery remains available even if GitHub's anonymous API is rate-limited.
 let tree=null;
 try{
  tree=await jsonFetch(API+'/git/trees/'+BRANCH+'?recursive=1');
  if(tree.truncated)throw Error('文件树截断');
 }catch(e){console.warn('GitHub 文件体积暂不可查询，删除时将重新核验',e);}
 const inventoryKnown=!!tree&&!tree.truncated;
 allTree=new Map(inventoryKnown?tree.tree.filter(x=>x.type==='blob').map(x=>[x.path,x]):[]);
 const retired=new Set(removed.ids);
 const out=[];
 for(const x of pirate.assets){
  if(!/^[A-Za-z0-9_.-]+\.glb$/i.test(x.file)||!/^pirates_[a-z0-9_]+$/.test(x.id))continue;
  const path='lighthouse-editor/assets/pirates/'+x.file;
  out.push({id:x.id,path,label:String(x.label||x.file),file:x.file,source:'pirates',
   category:pirateCategory(x.file),kind:'direct',size:allTree.get(path)?.size||0,
   missing:inventoryKnown&&!allTree.has(path),url:'./assets/pirates/'+encodeURIComponent(x.file)});
 }
 for(const x of cliffy.assets){
  if(retired.has(x.id)||!/^cliffy_coast_[a-z0-9_]+$/.test(x.id))continue;
  const direct=x.kind==='direct';
  const path=direct?'lighthouse-editor/assets/cliffy-coast/'+x.file:'';
  out.push({id:x.id,path,label:String(x.label||x.id),file:x.file,source:'cliffy',
   category:String(x.category||'Cliffy Coast'),kind:direct?'direct':'packed',
   pack:x.pack,size:direct?(allTree.get(path)?.size||0):0,
   missing:direct&&inventoryKnown&&!allTree.has(path),url:direct?'./assets/cliffy-coast/'+encodeURIComponent(x.file):null});
 }
 assets=out;
 selected=new Set([...selected].filter(id=>out.some(a=>a.id===id)));
 populateCategories();
 render();
}
async function readGuard(){
 guardReady=true;guardError='';usage=new Map();
 const note=(world,label)=>{
  if(!world||typeof world!=='object')return;
  for(const o of world.objects||[]){
   if(typeof o.asset!=='string')continue;
   for(const id of [o.asset,...(ASSEMBLIES[o.asset]||[])]){
    const entry=usage.get(id)||[];
    entry.push(label+(id===o.asset?'':'（完整房屋构件）'));
    usage.set(id,entry);
   }
  }
 };
 try{
  store=await createEditorStorage();
  note(await store.loadCurrent(),'当前地图（IndexedDB）');
  for(const b of await store.listBackups())note(b.world,'本机备份「'+b.name+'」');
  for(const key of ['dnd-lighthouse-world-map-v2','dnd-lighthouse-map-editor-v1']){
   const raw=localStorage.getItem(key);
   if(raw)note(JSON.parse(raw),'浏览器历史地图');
  }
  // Anonymous Contents API requests regularly hit GitHub's shared rate limit
  // and return 403. Read the publicly published map from our own origin while
  // browsing; immediately before a destructive commit, token-backed GitHub API
  // access rechecks the current branch contents.
  // Public read-only dependency checking MUST NOT depend on the token's
  // Contents API permission or GitHub's anonymous API quota.
  // We always read the published same-origin map, with a raw GitHub fallback.
  let publishedMap;
  try{
   publishedMap=await jsonFetch('../lighthouse/editor-preview-map.json?v='+Date.now());
  }catch(primary){
   publishedMap=await jsonFetch('https://raw.githubusercontent.com/'+REPO+'/'+BRANCH+'/lighthouse/editor-preview-map.json');
  }
  if(!publishedMap||typeof publishedMap!=='object'||!Array.isArray(publishedMap.objects))
   throw Error('已发布地图格式不正确，无法安全判断素材引用');
  note(publishedMap,'GitHub 已发布地图');
  guardReady=true;
 }catch(e){guardError=e.message;guardReady=true;console.warn('可选的地图引用信息不可用',e);}
 render();
}
function reason(a){
 if(a.missing)return 'GitHub 中找不到对应文件';
 const refs=usage.get(a.id)||[];
 return refs.length?'此素材仍被地图或备份引用；按你的设置允许永久删除':'从 GitHub 永久删除对应文件或压缩包中的模型';
}
function removable(a){return !a.missing&&(a.kind==='direct'||a.kind==='packed');}
function populateCategories(){
 const keep=$('category').value;
 const categories=[...new Set(assets.map(a=>a.category))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
 $('category').replaceChildren(new Option('全部分类','all'));
 for(const c of categories)$('category').add(new Option(c,c));
 if(categories.includes(keep))$('category').value=keep;
}
function currentList(){
 const search=$('search').value.trim().toLowerCase(),src=$('source').value,cat=$('category').value,state=$('state').value;
 return assets.filter(a=>
  (src==='all'||a.source===src)&&(cat==='all'||a.category===cat)&&
  (!search||[a.id,a.label,a.file,a.category].some(s=>s.toLowerCase().includes(search)))&&
  (state==='all'||(state==='direct'&&a.kind==='direct')||(state==='packed'&&a.kind==='packed')||
   (state==='used'&&usage.has(a.id))||(state==='missing'&&a.missing)));
}
function makeCard(a){
 const card=document.createElement('article');
 card.className='asset'+(selected.has(a.id)?' selected':'')+(removable(a)?'':' blocked');
 card.dataset.id=a.id;
 const box=document.createElement('div');box.className='preview';
 let placeholder=null;
 const img=document.createElement('img');img.alt=a.label+' GLB 预览';img.loading='lazy';
 if(previewMemory.has(a.path)&&a.kind==='direct'){
  img.src=previewMemory.get(a.path);
 }else{
  placeholder=document.createElement('span');placeholder.className='placeholder';
  placeholder.textContent=a.kind==='packed'?'压缩包模型':a.missing?'文件缺失':'GLB 模型';
  box.append(placeholder);
 }
 if(img.src)box.append(img);
 else if(removable(a)){img.dataset.path=a.path;img.dataset.url=a.url;img.style.opacity='0';box.append(img);}
 const checkbox=document.createElement('input');checkbox.type='checkbox';
 checkbox.className='select-item';checkbox.checked=selected.has(a.id);checkbox.disabled=!removable(a);
 checkbox.setAttribute('aria-label','选择 '+a.label);
 checkbox.onchange=()=>toggle(a.id,checkbox.checked);
 const x=document.createElement('button');x.className='remove-one';x.type='button';x.textContent='×';
 x.title=reason(a)||'从 GitHub 永久删除此 GLB';
 x.disabled=!removable(a)||busy;x.onclick=()=>runDelete([a.id]);
 const meta=document.createElement('div');meta.className='meta';
 const label=document.createElement('div');label.className='name';label.textContent=a.label;
 const details=document.createElement('div');details.className='details';
 details.textContent=(a.source==='pirates'?'POLYGON Pirates':'Cliffy Coast')+' · '+
  (a.kind==='packed'?'压缩包':a.missing?'仓库缺失':(Math.round(a.size/1024)+' KB'))+
  (usage.has(a.id)?' · 已使用 '+usage.get(a.id).length+' 次':'')+
  (a.kind==='packed'?' · 可单独从压缩包移除':'');
 meta.append(label,details);card.append(box,checkbox,x,meta);
 if(!removable(a)){card.title=reason(a);}
 else if(!img.src&&a.url)previews.push({item:a,img,placeholder,epoch});
 card.onclick=event=>{if(event.target===checkbox||event.target===x)return;if(removable(a))toggle(a.id,!selected.has(a.id));};
 return card;
}
function updateButtons(){
 const n=[...selected].filter(id=>assets.some(a=>a.id===id&&removable(a))).length;
 $('selection-info').textContent='已选择 '+displayNumber(n)+' 件 · GitHub 登录确认后执行实际删除';
 $('delete-selected').disabled=busy||n===0;
 $('delete-selected').textContent='去 GitHub 确认删除 ('+n+')';
}
function render(){
 epoch++;previews=[];previewObserver?.disconnect();
 const items=currentList(),grid=$('grid');
 const fragment=document.createDocumentFragment();
 for(const a of items)fragment.append(makeCard(a));
 if(!items.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='没有匹配的素材';fragment.append(empty);}
 grid.replaceChildren(fragment);
 $('total').textContent='仓库素材 '+displayNumber(assets.length)+' 项';
 $('available').textContent='可永久删除 '+displayNumber(assets.filter(removable).length)+' 项';
 $('used').textContent='地图/备份引用 '+displayNumber(assets.filter(x=>usage.has(x.id)).length)+' 项';
 status('已显示 '+displayNumber(items.length)+' 项。所有仓库素材均可申请删除（包括压缩包单个模型），需在 GitHub 登录后提交确认；不会再要求 Token。'+(guardError?' 本地备份信息未全部读取，但不阻止删除。':''));
 updateButtons();
 previewObserver=new IntersectionObserver(entries=>{
  for(const e of entries)if(e.isIntersecting){
   const img=e.target;previewObserver.unobserve(img);
   const entry=previews.find(x=>x.img===img);
   if(entry)queue.push(entry);
  }
  dispatchPreview();
 },{rootMargin:'180px'});
 for(const p of previews)previewObserver.observe(p.img);
}
const queue=[];
function toggle(id,value){
 if(value)selected.add(id);else selected.delete(id);
 render();
}
function dispatchPreview(){
 if(!previewReady||previewBusy)return;
 while(queue.length){
  const job=queue.shift();
  if(job.epoch!==epoch||!job.img.isConnected)continue;
  previewBusy=true;
  fetch(job.item.url).then(r=>{
   if(!r.ok)throw Error('HTTP '+r.status);
   if(Number(r.headers.get('content-length')||0)>30*1024*1024)throw Error('文件过大');
   return r.arrayBuffer();
  }).then(buffer=>{
   if(buffer.byteLength>30*1024*1024)throw Error('模型过大');
   const frame=$('frame').contentWindow;
   pendingPreview=job;
   frame.postMessage({type:'render-glb',key:job.item.path,buffer},'*',[buffer]);
  }).catch(()=>{previewBusy=false;dispatchPreview();});
  return;
 }
}
let pendingPreview=null;
window.addEventListener('message',event=>{
 if(event.source!==$('frame').contentWindow)return;
 if(event.data?.type==='preview-ready'){previewReady=true;dispatchPreview();return;}
 if(event.data?.type!=='render-result')return;
 const j=pendingPreview;pendingPreview=null;previewBusy=false;
 if(j&&j.item.path===event.data.key&&event.data.dataUrl){
  previewMemory.set(j.item.path,event.data.dataUrl);
  if(j.img.isConnected&&j.epoch===epoch){
   j.img.src=event.data.dataUrl;j.img.style.opacity='1';
   if(j.placeholder)j.placeholder.remove();
  }
 }
 dispatchPreview();
});
function selectAll(){
 for(const a of currentList())if(removable(a))selected.add(a.id);
 render();
}
function runDelete(requested){
 if(busy)return;
 const ids=[...new Set(requested)].filter(id=>assets.some(a=>a.id===id&&removable(a)));
 if(!ids.length){alert('没有可删除的仓库素材');return;}
 const batch=ids.slice(0,100);
 const names=batch.slice(0,3).map(id=>assets.find(x=>x.id===id)?.label||id).join('、');
 if(!confirm('将请求永久删除 '+batch.length+' 件 GitHub 素材（'+names+(batch.length>3?'等':'')+
  '）。\n删除会影响引用这些模型的旧存档，但不修改已经定版的正式岛屿游戏。继续前往 GitHub 确认？'))return;
 if(batch.length>1&&prompt('批量永久删除 '+batch.length+' 件素材，请输入「删除」确认')!=='删除')return;
 const body=['DND_ASSET_DELETE_V1',...batch].join('\n');
 const url='https://github.com/'+REPO+'/issues/new?title='+
  encodeURIComponent('[DND-ASSET-DELETE]')+'&body='+encodeURIComponent(body);
 const opened=window.open(url,'_blank','noopener,noreferrer');
 if(!opened)location.href=url;
 status('已打开 GitHub 删除确认页。请登录仓库所有者账号并点击「Submit new issue」；工作流随后删除 GLB 并更新索引。'+
  (ids.length>batch.length?'本次提交前 100 件；剩余 '+(ids.length-batch.length)+' 件请再次操作。':''));
}
function bind(){

 for(const name of ['search','source','category','state']){
  $(name).addEventListener(name==='search'?'input':'change',render);
 }
 $('select-all').onclick=selectAll;
 $('clear-selection').onclick=()=>{selected.clear();render();};
 $('delete-selected').onclick=()=>runDelete([...selected]);
 $('reload').onclick=()=>boot();
}
async function boot(){
 if(busy)return;
 status('正在读取 GitHub 素材索引…');
 try{
  await loadAssets();
  await readGuard();
  render();
 }catch(e){status('读取素材失败：'+e.message,true);console.error(e);}
}
bind();boot();
