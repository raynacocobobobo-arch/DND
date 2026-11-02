// Asset manager and verified quick backups for the live editor.
export function mountEditorManagement(ctx){
 const {catalog,glbLibrary,editorStorage,hiddenAssets,getWorld,
  refreshLibrary,afterDelete,loadWorld,downloadJSON,toast}=ctx;
 const $=id=>document.getElementById(id);
 async function refreshAssets(preferred){
  const list=$('manage-asset-list'),current=preferred??list.value;
  const q=$('manage-asset-search').value.trim().toLowerCase();
  const options=catalog.types.filter(id=>{
   const m=catalog.all[id]||{};
   return !q||[m.label,id,m.category].some(v=>String(v||'').toLowerCase().includes(q));
  });
  list.replaceChildren();
  for(const id of options){
   const meta=catalog.all[id]||{},uses=getWorld()?.objects?.filter(x=>x.asset===id).length||0;
   const suffix=hiddenAssets.has(id)?' [已移除]':uses?' [使用'+uses+']':'';
   list.add(new Option((meta.label||id)+suffix,id));
  }
  if(options.includes(current))list.value=current;
  else if(options.length)list.selectedIndex=0;
  assetStatus();
 }
 function assetStatus(){
  const id=$('manage-asset-list').value,m=catalog.all[id],uses=getWorld()?.objects?.filter(o=>o.asset===id).length||0;
  $('manage-asset-status').textContent=!m?'没有匹配的素材':
   (m.label||id)+' · '+(uses?'已放置 '+uses+' 次，不可删除':'当前地图未使用')+
   (hiddenAssets.has(id)?' · 已移除':'')+
   (id.startsWith('ext_glb_')?' · 删除本地 GLB':' · 仅隐藏本机素材库');
  $('manage-asset-delete').disabled=!m||hiddenAssets.has(id);
  $('manage-asset-restore').disabled=!m||!hiddenAssets.has(id);
 }
 $('manage-asset-search').addEventListener('input',()=>refreshAssets());
 $('manage-asset-list').addEventListener('change',assetStatus);
 $('manage-asset-delete').onclick=async()=>{
  const id=$('manage-asset-list').value,m=catalog.all[id],world=getWorld();if(!m||!world)return;
  const count=world.objects.filter(o=>o.asset===id).length;
  if(count){alert('不可删除：当前地图使用了此素材 '+count+' 次。请先删除对应场景对象。');return;}
  if(editorStorage){
   try{
    const backups=await editorStorage.listBackups();
    const used=backups.filter(b=>(b.world.objects||[]).some(o=>o.asset===id));
    if(used.length){alert('不可删除：'+used.length+' 份地图备份仍引用此素材。请先处理这些备份。');return;}
   }catch(e){alert('无法核对备份依赖，停止删除：'+e.message);return;}
  }else{alert('本机存储不可用，无法安全删除素材。');return;}
  const local=id.startsWith('ext_glb_');
  const label=m.label||id;
  if(!confirm(local?'永久删除本机 GLB「'+label+'」？需要原文件才能重新导入。':
   '从当前浏览器素材库移除「'+label+'」？GitHub 和原版模型不删除，可以恢复。'))return;
  try{
   if(local)await glbLibrary.removeAsset(id);
   else{
    await editorStorage.writeHidden([...hiddenAssets,id]);
    hiddenAssets.add(id);
   }
   afterDelete(id);refreshLibrary();await refreshAssets(id);
   toast(local?'本机 GLB 已删除':'素材已从本机素材库移除');
  }catch(e){alert('素材删除失败：'+e.message);}
 };
 $('manage-asset-restore').onclick=async()=>{
  const id=$('manage-asset-list').value;if(!hiddenAssets.has(id))return;
  try{
   const next=[...hiddenAssets].filter(x=>x!==id);
   await editorStorage.writeHidden(next);hiddenAssets.delete(id);
   refreshLibrary();await refreshAssets(id);toast('素材已恢复');
  }catch(e){alert('恢复素材失败：'+e.message);}
 };
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
 return {refreshAssets,refreshBackups};
}
