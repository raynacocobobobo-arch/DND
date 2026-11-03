import {openGithubAssetDeletion} from './github-delete-request.js?v=1';
// Asset manager and verified quick backups for the live editor.
export function mountEditorManagement(ctx){
 const {catalog,glbLibrary,editorStorage,hiddenAssets,getWorld,
  refreshLibrary,exitPlacementMode,afterDelete,loadWorld,downloadJSON,toast}=ctx;
 const $=id=>document.getElementById(id);
 // One integrated management mode inside the thumbnail palette.
 // Native and repository models are only hidden locally; imported GLBs
 // are removed from this browser's IndexedDB after dependency checking.
 let managing=false,showRemoved=false,deleting=false;
 const chosen=new Set();
 const isManaging=()=>managing;
 const isShowingRemoved=()=>managing&&showRemoved;
 const isSelected=id=>chosen.has(id);
 function updateAssetControls(message=''){
  $('asset-manage-toggle').classList.toggle('active',managing);
  $('asset-manage-toggle').textContent=managing?'退出删除模式':'删除素材';
  $('asset-manage-toggle').setAttribute('aria-pressed',String(managing));
  $('asset-manager-tools').hidden=!managing;
  $('asset-remove-selected').disabled=!managing||deleting||chosen.size===0;
  $('asset-remove-selected').textContent='删除选中 ('+chosen.size+')';
  $('asset-select-visible').disabled=!managing||deleting;
  $('asset-manager-show-removed').checked=showRemoved;
  $('asset-manage-status').textContent=message||
   (chosen.size?'已选中 '+chosen.size+' 个素材；点击「删除选中」批量处理。':
    '点击缩略图多选，点右上角红色 × 单独删除。地图或备份使用中的素材不可删除。');
 }
 function setManaging(value){
  managing=!!value;chosen.clear();showRemoved=false;
  if(managing){
   // Remove mode must never leave a prefab placement brush armed.
   exitPlacementMode?.();
   document.querySelectorAll('.asset-card.active').forEach(el=>el.classList.remove('active'));
  }
  updateAssetControls();refreshLibrary();
 }
 function toggleSelect(id){
  if(!managing||hiddenAssets.has(id)||!catalog.all[id])return;
  if(chosen.has(id))chosen.delete(id);else chosen.add(id);
  updateAssetControls();refreshLibrary();
 }
 async function restoreAsset(id){
  if(!hiddenAssets.has(id)||deleting)return false;
  if(!editorStorage){alert('本地存储不可用，无法恢复素材');return false;}
  deleting=true;updateAssetControls();
  try{
   const next=[...hiddenAssets].filter(x=>x!==id);
   await editorStorage.writeHidden(next);hiddenAssets.delete(id);
   refreshLibrary();updateAssetControls('已恢复「'+(catalog.all[id]?.label||id)+'」');
   toast('素材已恢复到资源库');return true;
  }catch(e){alert('素材恢复失败：'+e.message);return false;}
  finally{deleting=false;updateAssetControls();}
 }
 async function findAssetUsage(ids){
  const refs=[];
  const scan=(data,label)=>{
   for(const object of data?.objects||[]){
    const asset=object.asset;
    const parts=catalog.all[asset]?.assemblyParts||[];
    if(ids.has(asset)||parts.some(part=>ids.has(part))){
     refs.push(label+'：'+(object.name||catalog.all[asset]?.label||asset));
    }
   }
  };
  scan(getWorld?.(),'当前地图');
  if(!editorStorage?.listBackups)throw Error('无法读取本机备份，暂时不能安全删除素材');
  const backups=await editorStorage.listBackups();
  for(const backup of backups||[])scan(backup.world,'备份「'+(backup.name||'未命名')+'」');
  return refs;
 }
 async function removeAssets(requested){
  if(deleting||!managing)return {removed:[],blocked:[]};
  const ids=[...new Set(requested)].filter(id=>catalog.all[id]&&!hiddenAssets.has(id));
  if(!ids.length)return {removed:[],blocked:[]};
  const local=ids.filter(id=>id.startsWith('ext_glb_'));
  const repoIds=new Set();
  const unsupported=[];
  for(const id of ids){
   if(id.startsWith('ext_glb_'))continue;
   const meta=catalog.all[id];
   if(Array.isArray(meta?.assemblyParts)&&meta.assemblyParts.length){
    meta.assemblyParts.forEach(part=>repoIds.add(part));
   }else if(/^(?:pirates|cliffy_coast|coastal_tree)_[a-z0-9_]+$/.test(id)){
    repoIds.add(id);
   }else unsupported.push(id);
  }
  if(unsupported.length){
   alert('以下素材不是独立 GitHub 模型文件，无法直接删除：'+unsupported.slice(0,4).join('、'));
   return {removed:[],blocked:unsupported};
  }
  const deletionIds=new Set([...ids,...repoIds]);
  let references;
  try{references=await findAssetUsage(deletionIds);}
  catch(error){
   alert('无法确认素材是否仍被地图或备份使用，因此暂不删除：'+error.message);
   return {removed:[],blocked:ids};
  }
  if(references.length){
   alert('以下素材仍被当前地图或本机备份使用，不能删除：\\n'+references.slice(0,6).join('\\n')+
    (references.length>6?'\\n另有 '+(references.length-6)+' 处引用':''));
   return {removed:[],blocked:ids};
  }
  const preview=ids.slice(0,3).map(id=>catalog.all[id]?.label||id).join('、');
  const message='确定删除 '+ids.length+' 个选中素材（'+preview+(ids.length>3?'等':'')+'）？'+
    (repoIds.size?'\\nGitHub 模型将在你登录 GitHub 并提交删除请求后，从仓库永久移除。':'')+
    (local.length?'\\n本机导入 GLB 会立即从当前浏览器删除。':'')+
    '\\n已有备份如引用这些模型，之后可能无法还原模型。';
  if(!confirm(message))return {removed:[],blocked:[]};
  deleting=true;updateAssetControls('正在处理删除操作…');
  try{
   let requestedGithub=0;
   if(repoIds.size){
    const result=openGithubAssetDeletion([...repoIds]);
    requestedGithub=result.count;
    updateAssetControls('已打开 GitHub 删除确认页，请在 GitHub 提交请求后再刷新编辑器。'+
      (result.remaining?'还有 '+result.remaining+' 件需下一批提交。':''));
   }
   const removed=[],errors=[];
   for(const id of local){
    try{
     await glbLibrary.removeAsset(id);
     removed.push(id);afterDelete(id);
    }catch(err){errors.push((catalog.all[id]?.label||id)+'：'+err.message);}
   }
   removed.forEach(id=>chosen.delete(id));
   refreshLibrary();
   if(errors.length)alert('部分本机素材未删除：'+errors.join('；'));
   else if(!requestedGithub)toast('已永久删除 '+removed.length+' 个本机 GLB');
   return {removed,githubRequested:requestedGithub,blocked:[],errors};
  }catch(e){alert('删除请求失败：'+e.message);return {removed:[],blocked:ids};}
  finally{deleting=false;updateAssetControls();}
 }
 const removeOne=id=>removeAssets([id]);
 const removeSelected=()=>removeAssets([...chosen]);
 $('asset-manage-toggle').onclick=()=>setManaging(!managing);
 $('asset-manage-exit').onclick=()=>setManaging(false);
 $('asset-manager-show-removed').onchange=e=>{
  showRemoved=!!e.target.checked;chosen.clear();updateAssetControls();refreshLibrary();
 };
 $('asset-remove-selected').onclick=removeSelected;
 $('asset-select-visible').onclick=()=>{
  if(!managing)return;
  for(const wrap of document.querySelectorAll('#assets .asset-card-wrap')){
   const id=wrap.dataset.asset;if(catalog.all[id]&&!hiddenAssets.has(id))chosen.add(id);
  }
  updateAssetControls();refreshLibrary();
 };
 async function refreshAssets(){
  for(const id of [...chosen])if(!catalog.all[id]||hiddenAssets.has(id))chosen.delete(id);
  updateAssetControls();refreshLibrary();
 }
 updateAssetControls();
 const backupControls=['backup-restore','backup-delete','backup-export'];
 async function refreshBackups(prefer){
  const list=$('backup-list'),prior=prefer??list.value;
  try{
   if(!editorStorage)throw Error('IndexedDB 不可用');
   const backups=await editorStorage.listBackups();
   list.replaceChildren();
   if(!backups.length)list.add(new Option('暂无备份',''));
   for(const b of backups){
    const date=new Date(b.createdAt).toLocaleString('zh-CN',{hour12:false});
    list.add(new Option(b.name+' · '+date,b.id));
   }
   if(backups.some(x=>x.id===prior))list.value=prior;
   for(const id of backupControls)$(id).disabled=!backups.length;
   $('backup-status').textContent='IndexedDB 已保存 '+backups.length+' 份备份（当前网址、当前浏览器）';
  }catch(e){
   $('backup-status').textContent='备份不可用：'+e.message+'。请导出 JSON。';
   for(const id of backupControls)$(id).disabled=true;
  }
 }
 function backupName(){
  const d=new Date(),p=n=>String(n).padStart(2,'0');
  return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
 }
 async function backup(){
  const w=getWorld();if(!w)return;
  if(!editorStorage){alert('浏览器持久备份不可用。请使用导出 JSON。');return;}
  const response=prompt('备份名称',backupName());if(response===null)return;
  const title=response.trim().slice(0,80)||backupName();
  for(const id of ['quick-backup','backup-create'])$(id).disabled=true;
  $('backup-status').textContent='正在写入并回读校验…';
  try{
   const b=await editorStorage.createBackup(title,w);
   await refreshBackups(b.id);
   toast('备份已写入并校验：'+title);
  }catch(e){$('backup-status').textContent='备份失败：'+e.message;alert('备份失败：'+e.message);}
  finally{for(const id of ['quick-backup','backup-create'])$(id).disabled=false;}
 }
 $('quick-backup').onclick=backup;$('backup-create').onclick=backup;
 $('backup-restore').onclick=async()=>{
  if(!editorStorage)return;
  try{
   const b=await editorStorage.getBackup($('backup-list').value);if(!b)return;
   if(!confirm('恢复「'+b.name+'」？当前地图未备份的改动会被覆盖。'))return;
   await loadWorld(b.world);
   await refreshBackups(b.id);await refreshAssets();
   toast('备份已恢复并保存：'+b.name);
  }catch(e){alert('恢复失败：'+e.message);}
 };
 $('backup-delete').onclick=async()=>{
  if(!editorStorage)return;
  try{
   const b=await editorStorage.getBackup($('backup-list').value);if(!b)return;
   if(!confirm('删除备份「'+b.name+'」？不可撤销。'))return;
   await editorStorage.removeBackup(b.id);
   await refreshBackups();toast('已删除备份');
  }catch(e){alert('删除备份失败：'+e.message);}
 };
 $('backup-export').onclick=async()=>{
  if(!editorStorage)return;
  try{
   const b=await editorStorage.getBackup($('backup-list').value);if(!b)return;
   downloadJSON(b.world,'lighthouse-backup-'+new Date(b.createdAt).toISOString().replace(/[:.]/g,'-')+'.json');
   toast('已下载备份 JSON');
  }catch(e){alert('备份下载失败：'+e.message);}
 };
 return {refreshAssets,refreshBackups,isManaging,isShowingRemoved,isSelected,toggleSelect,removeOne,removeSelected,restoreAsset};
}
