// Map backup controls only. Asset import, rename and deletion live exclusively
// in the full-screen local asset manager.
export function mountEditorManagement(ctx){
 const {editorStorage,getWorld,loadWorld,downloadJSON,toast}=ctx;
 const $=id=>document.getElementById(id);
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
   $('backup-status').textContent='本地数据库已保存 '+backups.length+' 份备份';
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
   await refreshBackups(b.id);toast('备份已恢复并保存：'+b.name);
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
 return {refreshBackups};
}
