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
  $('asset-manage-toggle').textContent=managing?'退出移除':'移除素材';
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
 async function removeAssets(requested){
  if(deleting||!managing)return {removed:[],blocked:[]};
  const ids=[...new Set(requested)].filter(id=>catalog.all[id]&&!hiddenAssets.has(id));
  if(!ids.length)return {removed:[],blocked:[]};
  if(!editorStorage){alert('持久存储不可用，无法安全移除素材。');return {removed:[],blocked:ids};}
  deleting=true;updateAssetControls('正在检查素材使用情况与地图备份…');
  try{
   // A referenced asset cannot disappear from the scene or any saved backup.
   const world=getWorld();
   const backups=await editorStorage.listBackups();
   const references=new Map();
   for(const obj of world?.objects||[])references.set(obj.asset,(references.get(obj.asset)||0)+1);
   const protectedBackup=new Map();
   for(const backup of backups){
    const used=new Set((backup.world?.objects||[]).map(obj=>obj.asset));
    for(const id of used)protectedBackup.set(id,(protectedBackup.get(id)||0)+1);
   }
   const blocked=ids.filter(id=>references.has(id)||protectedBackup.has(id));
   const eligible=ids.filter(id=>!blocked.includes(id));
   if(!eligible.length){
    const detail=blocked.slice(0,3).map(id=>(catalog.all[id]?.label||id)+
     (references.has(id)?'：地图使用 '+references.get(id)+' 次':'：'+protectedBackup.get(id)+' 份备份引用')).join('；');
    alert('无法删除：所选素材都在使用中。'+detail+(blocked.length>3?'；另有 '+(blocked.length-3)+' 个':''));
    updateAssetControls('已阻止删除 '+blocked.length+' 个正在使用的素材');return {removed:[],blocked};
   }
   const permanently=eligible.filter(id=>id.startsWith('ext_glb_'));
   const locally=eligible.filter(id=>!id.startsWith('ext_glb_'));
   const preview=eligible.slice(0,3).map(id=>catalog.all[id]?.label||id).join('、');
   const ask=(eligible.length===1?'移除「'+preview+'」？':'移除 '+eligible.length+' 个素材（'+preview+(eligible.length>3?'等':'')+'）？')+
    (permanently.length?'\n其中 '+permanently.length+' 个本机导入 GLB 将从当前浏览器数据库永久删除。':'')+
    (locally.length?'\n其中 '+locally.length+' 个内置 / GitHub 素材只在本浏览器资源库隐藏，可恢复。':'')+
    (blocked.length?'\n另有 '+blocked.length+' 个正在使用的素材将跳过，不删除。':'');
   if(!confirm(ask)){updateAssetControls('已取消素材移除');return {removed:[],blocked};}
   const removed=[],errors=[];
   // Persist the non-destructive portion in one checked IndexedDB write.
   if(locally.length){
    try{
     await editorStorage.writeHidden([...hiddenAssets,...locally]);
     for(const id of locally){hiddenAssets.add(id);removed.push(id);afterDelete(id);}
    }catch(e){errors.push('素材库移除失败：'+e.message);}
   }
   // GLB deletes are individually committed; a failure never clears scene data.
   for(const id of permanently){
    try{await glbLibrary.removeAsset(id);removed.push(id);afterDelete(id);}
    catch(e){errors.push((catalog.all[id]?.label||id)+'：'+e.message);}
   }
   for(const id of removed)chosen.delete(id);
   refreshLibrary();updateAssetControls(
    '已移除 '+removed.length+' 个'+(blocked.length?'；保护 '+blocked.length+' 个使用中的素材':'')+
    (errors.length?'；失败 '+errors.length+' 个':''));
   if(errors.length)alert('部分素材未删除：'+errors.join('；'));
   else toast('已移除 '+removed.length+' 个素材'+(blocked.length?'，跳过 '+blocked.length+' 个使用中的素材':''));
   if(blocked.length)alert('有 '+blocked.length+' 个素材未删除，因为当前地图或备份仍在使用。');
   return {removed,blocked,errors};
  }catch(e){alert('删除前检查失败，未继续：'+e.message);return {removed:[],blocked:ids};}
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
