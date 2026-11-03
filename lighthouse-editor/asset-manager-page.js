import {createEditorStorage} from './editor-storage.js?v=1';

const REPO='raynacocobobobo-arch/DND';
const API='https://api.github.com/repos/'+REPO;
const BRANCH='gh-pages';
const PIRATES_MANIFEST='lighthouse-editor/assets/pirates/manifest.json';
const CLIFFY_REMOVED='lighthouse-editor/assets/cliffy-coast/removed.json';
const $=id=>document.getElementById(id);
let token='',connected=false,assets=[],allTree=new Map(),selected=new Set(),usage=new Map();
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
async function gh(method,path,body){
 if(!token)throw Error('请先授权 GitHub 仓库写入');
 const url=API+path;
 const res=await fetch(url,{method,cache:'no-store',headers:{
  'Accept':'application/vnd.github+json',
  'Authorization':'Bearer '+token,
  'X-GitHub-Api-Version':'2022-11-28',
  ...(body===undefined?{}:{'Content-Type':'application/json'})
 },body:body===undefined?undefined:JSON.stringify(body)});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw Error('GitHub '+res.status+'：'+(data.message||res.statusText));
 return data;
}
async function authorize(){
 const input=$('token'),value=input.value.trim();
 if(!value){status('请先在授权栏输入本次会话使用的 GitHub 细粒度令牌。',true);return;}
 $('authorize').disabled=true;status('正在向 GitHub 检查授权…');
 try{
  token=value;
  // The current user's login and repository metadata are the only authentication probes.
  const repository=await gh('GET','');
  if(repository.full_name!==REPO)throw Error('仓库授权范围错误');
  connected=true;input.value='';
  $('logout').disabled=false;
  $('auth-state').textContent='仓库访问已验证'+(repository.permissions?.push?' · 具有推送权限':' · 写入权限将在提交时再次核实');
  await readGuard();render();
  status('授权通过。删除只会提交到 '+BRANCH+'，不会修改正式 V35 游戏源文件。');
 }catch(e){
  token='';connected=false;input.value='';
  $('auth-state').textContent='未授权：'+e.message;
  status('GitHub 授权失败：'+e.message,true);
 }finally{$('authorize').disabled=false;updateButtons();}
}
function disconnect(){
 token='';connected=false;$('token').value='';$('logout').disabled=true;
 $('auth-state').textContent='未授权：可浏览，不能删除 GitHub 文件';
 updateButtons();
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
 guardReady=false;guardError='';usage=new Map();
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
  const published=token?await gh('GET','/contents/lighthouse/editor-preview-map.json?ref='+BRANCH):
   await jsonFetch(API+'/contents/lighthouse/editor-preview-map.json?ref='+BRANCH);
  if(published.encoding!=='base64')throw Error('GitHub 发布地图编码不受支持');
  note(JSON.parse(readBase64Utf8(published.content)),'GitHub 已发布地图');
  guardReady=true;
 }catch(e){guardError=e.message;guardReady=false;}
 render();
}
function reason(a){
 if(a.kind==='packed')return '压缩包资产：需要重新打包，禁止单独删除';
 if(a.missing)return 'GitHub 中找不到对应 GLB';
 if(!guardReady)return '无法完成地图与备份检查';
 const references=usage.get(a.id)||[];
 return references.length?'被 '+references.length+' 处引用：'+[...new Set(references)].join('、'):'';
}
function removable(a){return a.kind==='direct'&&!a.missing&&guardReady&&!usage.has(a.id);}
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
 const img=document.createElement('img');img.alt=a.label+' GLB 预览';img.loading='lazy';
 if(previewMemory.has(a.path)&&a.kind==='direct'){
  img.src=previewMemory.get(a.path);
 }else{
  const placeholder=document.createElement('span');placeholder.className='placeholder';
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
  (a.kind==='packed'?' · 暂不可单件删除':'');
 meta.append(label,details);card.append(box,checkbox,x,meta);
 if(!removable(a)){card.title=reason(a);}
 else if(!img.src&&a.url)previews.push({item:a,img,placeholder,epoch});
 card.onclick=event=>{if(event.target===checkbox||event.target===x)return;if(removable(a))toggle(a.id,!selected.has(a.id));};
 return card;
}
function updateButtons(){
 const n=[...selected].filter(id=>assets.some(a=>a.id===id&&removable(a))).length;
 $('selection-info').textContent='已选中 '+displayNumber(n)+' 件'+
  (guardReady?' · 已核对当前地图、浏览器备份及 GitHub 发布地图':' · 依赖检查未通过');
 $('delete-selected').disabled=!connected||busy||n===0||!guardReady;
 $('delete-selected').textContent=busy?'正在提交…':'永久删除所选 GitHub 素材 ('+n+')';
}
function render(){
 epoch++;previews=[];previewObserver?.disconnect();
 const items=currentList(),grid=$('grid');
 const fragment=document.createDocumentFragment();
 for(const a of items)fragment.append(makeCard(a));
 if(!items.length){const empty=document.createElement('div');empty.className='empty';empty.textContent='没有匹配的素材';fragment.append(empty);}
 grid.replaceChildren(fragment);
 $('total').textContent='仓库素材 '+displayNumber(assets.length)+' 项';
 $('available').textContent='可安全删除 '+displayNumber(assets.filter(removable).length)+' 项';
 $('used').textContent='地图/备份引用 '+displayNumber(assets.filter(x=>usage.has(x.id)).length)+' 项';
 if(guardError)status('依赖检查失败，已禁用真实删除：'+guardError,true);
 else if(!guardReady)status('正在核对当前地图和备份的使用情况…');
 else status('已读取 '+displayNumber(items.length)+' 项。删除操作需要 GitHub 授权，并会同步更新注册索引。压缩包资产暂不支持单件删除。');
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
function readBase64Utf8(b64){
 const raw=atob(b64.replace(/\s/g,'')),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
 return new TextDecoder().decode(bytes);
}
async function readGitFileJson(path){
 const x=await gh('GET','/contents/'+path+'?ref='+BRANCH);
 if(x.encoding!=='base64')throw Error('GitHub 文件编码不受支持：'+path);
 return JSON.parse(readBase64Utf8(x.content));
}
async function runDelete(ids){
 if(busy)return;
 const unique=[...new Set(ids)],items=unique.map(id=>assets.find(a=>a.id===id));
 if(items.some(a=>!a||!removable(a))){alert('操作已取消：包含正在使用、压缩包或仓库缺失的素材。');return;}
 if(!connected||!token){alert('请先在页面上方验证 GitHub 仓库写入授权。');return;}
 if(!guardReady){alert('地图及备份未检查完成，不能删除。');return;}
 const n=items.length,first=items.slice(0,3).map(x=>x.label).join('、');
 const ok=confirm('将从 GitHub '+BRANCH+' 分支永久删除 '+n+' 个 GLB，并同步更新素材注册。\n'+first+(n>3?'等':'')+
  '\n\n操作会影响所有使用该仓库的设备。其他设备上的离线备份和已导出的 JSON 无法自动检查。是否继续？');
 if(!ok)return;
 if(n>1&&prompt('批量永久删除 '+n+' 个模型，请输入“删除”确认：')!=='删除')return;
 busy=true;updateButtons();status('正在重新核对地图引用和 GitHub 分支状态…');
 try{
  await readGuard();
  if(!guardReady)throw Error('依赖检查失败：'+guardError);
  if(items.some(a=>!removable(a)))throw Error('素材使用情况已发生变化，取消删除');
  const [ref,pirate,cliffy]=await Promise.all([
   gh('GET','/git/ref/heads/'+BRANCH),
   readGitFileJson(PIRATES_MANIFEST),
   readGitFileJson(CLIFFY_REMOVED)
  ]);
  const head=ref.object?.sha;
  if(!/^[a-f0-9]{40}$/.test(head||''))throw Error('GitHub 分支 HEAD 异常');
  const commit=await gh('GET','/git/commits/'+head);
  const tree=await gh('GET','/git/trees/'+commit.tree.sha+'?recursive=1');
  if(tree.truncated)throw Error('GitHub 文件清单被截断，拒绝删除');
  const present=new Set(tree.tree.filter(x=>x.type==='blob').map(x=>x.path));
  for(const item of items)if(!present.has(item.path))throw Error('仓库中已经不存在文件：'+item.path);
  const pirateIds=new Set(items.filter(a=>a.source==='pirates').map(a=>a.id));
  const cliffyIds=new Set(items.filter(a=>a.source==='cliffy').map(a=>a.id));
  if(pirateIds.size){
   const indexed=new Set(pirate.assets.map(a=>a.id));
   for(const id of pirateIds)if(!indexed.has(id))throw Error('海盗素材索引已改变：'+id);
  }
  const entries=items.map(a=>({path:a.path,mode:'100644',type:'blob',sha:null}));
  if(pirateIds.size){
   pirate.assets=pirate.assets.filter(a=>!pirateIds.has(a.id));
   entries.push({path:PIRATES_MANIFEST,mode:'100644',type:'blob',content:JSON.stringify(pirate,null,2)+'\n'});
  }
  if(cliffyIds.size){
   cliffy.ids=[...new Set([...(cliffy.ids||[]),...cliffyIds])];
   entries.push({path:CLIFFY_REMOVED,mode:'100644',type:'blob',content:JSON.stringify(cliffy,null,2)+'\n'});
  }
  status('正在提交 '+n+' 个 GitHub 文件删除和注册清单变更…');
  const newTree=await gh('POST','/git/trees',{base_tree:commit.tree.sha,tree:entries});
  const newCommit=await gh('POST','/git/commits',{
   message:'assets(editor): permanently remove '+n+' unused 3D models via asset manager',
   tree:newTree.sha,parents:[head]
  });
  await gh('PATCH','/git/refs/heads/'+BRANCH,{sha:newCommit.sha,force:false});
  const verified=await gh('GET','/git/trees/'+newTree.sha+'?recursive=1');
  if(verified.truncated)throw Error('已提交，但远程校验清单过大');
  const remaining=new Set(verified.tree.map(x=>x.path));
  if(items.some(a=>remaining.has(a.path)))throw Error('提交后仍存在模型文件，必须人工检查：'+newCommit.sha);
  const manifestEntry=verified.tree.find(x=>x.path===PIRATES_MANIFEST);
  const cliffyEntry=verified.tree.find(x=>x.path===CLIFFY_REMOVED);
  if(pirateIds.size){
   const blob=await gh('GET','/git/blobs/'+manifestEntry.sha);
   const remote=JSON.parse(readBase64Utf8(blob.content));
   if(remote.assets.some(x=>pirateIds.has(x.id)))throw Error('海盗清单更新后校验失败');
  }
  if(cliffyIds.size){
   const blob=await gh('GET','/git/blobs/'+cliffyEntry.sha);
   const remote=JSON.parse(readBase64Utf8(blob.content));
   if([...cliffyIds].some(id=>!remote.ids.includes(id)))throw Error('Cliffy Coast 清单校验失败');
  }
  for(const item of items){selected.delete(item.id);previewMemory.delete(item.path);}
  assets=assets.filter(a=>!unique.includes(a.id));render();
  status('删除成功：'+n+' 个文件已从 GitHub gh-pages 提交移除；Commit '+newCommit.sha+
   '。地图编辑器素材刷新取决于 GitHub Pages 部署。');
 }catch(e){
  status('删除未确认完成：'+e.message+'。若已产生 Git 提交，请重新检查分支状态，勿重复操作。',true);
  alert('GitHub 删除出错：'+e.message);
 }finally{busy=false;updateButtons();}
}
function bind(){
 $('authorize').onclick=authorize;$('logout').onclick=disconnect;
 $('token').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();authorize();}});
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
 status('正在读取 GitHub 素材索引、实际文件清单和地图备份…');
 try{
  await loadAssets();
  await readGuard();
  render();
 }catch(e){status('读取素材失败：'+e.message,true);console.error(e);}
}
bind();boot();
