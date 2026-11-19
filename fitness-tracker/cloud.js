/* 健身记录 V2.3 · Hermes 同一账号，启动时展示登录入口。 */
(function(){
'use strict';
const API="https://arnrlepjuqdmvbipswci.supabase.co", KEY="sb_publishable_KIqNFyXWtQe8umuikfP6lQ_3MQrQzdt", SESSION_KEY='fitness_cloud_session_v1', LINK_KEY='fitness_cloud_link_v1';
function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function write(key,value){try{value===null?localStorage.removeItem(key):localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
let session=read(SESSION_KEY),link=read(LINK_KEY),remote=null,busy=false,conflict=false,dirty=false,importing=false,uploading=false,timer=null;
let status=session?'正在检查云端数据':'未登录：当前记录仍安全保存在本机';
let entryStage='none';
function signedIn(){return !!session?.access_token&&!!session?.refresh_token&&!!session?.user?.id}
function auto(){return signedIn()&&link?.enabled&&link.userId===session.user.id&&!conflict}
function say(msg){status=msg;
 const settings=document.getElementById('fitnessCloudStatus');if(settings)settings.textContent=msg;
 const entry=document.getElementById('fitnessEntryStatus');if(entry)entry.textContent=msg;
}
function renderIfSettings(){if(view==='settings')render()}
async function fetchAPI(path,opts={},auth=true){
 const headers={'apikey':KEY,'Content-Type':'application/json'};
 if(auth){const token=await getToken();if(!token)throw Error('登录已失效，请重新登录');headers.Authorization='Bearer '+token}
 const response=await fetch(API+path,{...opts,headers:{...headers,...(opts.headers||{})},cache:'no-store'});
 const text=await response.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){}
 if(!response.ok)throw Error(data?.error_description||data?.message||data?.msg||('HTTP '+response.status));
 return data;
}
async function getToken(){
 if(!signedIn())return null;
 if(Number(session.expires_at||0)>Date.now()/1000+90)return session.access_token;
 try{
  const s=await fetchAPI('/auth/v1/token?grant_type=refresh_token',
   {method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})},false);
  if(!s?.access_token||!s?.user?.id)return null;
  session={...s,expires_at:Math.floor(Date.now()/1000)+Number(s.expires_in||3600)};
  write(SESSION_KEY,session);return session.access_token;
 }catch(e){say('账号会话已过期，请退出并重新登录');return null}
}
async function getRow(){
 const id=encodeURIComponent(session.user.id);
 const rows=await fetchAPI('/rest/v1/fitness_journals?select=payload,version,updated_at&user_id=eq.'+id+'&limit=1',{method:'GET'});
 if(!Array.isArray(rows))throw Error('云端响应格式异常');
 return rows[0]||null;
}
function snapshot(){
 return {version:1,records:state.records,settings:state.settings,stepDiary:state.stepDiary||{},
  restDays:[...restDays].sort(),savedAt:new Date().toISOString()};
}
async function refresh(){
 if(!signedIn())return false;
 try{
  const row=await getRow();
  remote=row?{version:Number(row.version),records:Array.isArray(row.payload?.records)?row.payload.records.length:0,updatedAt:row.updated_at}: {version:0,records:0,updatedAt:null};
  conflict=!!(auto()&&Number(link.version)!==remote.version);
  if(link?.enabled&&link.userId===session.user.id&&Number(link.version)!==remote.version)conflict=true;
  say(conflict?'云端有新版本，请先下载核对，自动上传已暂停':
    remote.version?'云端有 '+remote.records+' 条记录，可下载或继续同步':'云端暂无健身记录');
  renderIfSettings();return true;
 }catch(e){say('云端读取失败：'+e.message);return false}
}
async function login(form){
 if(busy)return;
 const email=String(form.querySelector('[name="cloudEmail"]')?.value||'').trim();
 const password=String(form.querySelector('[name="cloudPassword"]')?.value||'');
 if(!email.includes('@')||!password){toast('请输入 Hermes To Do 使用的邮箱和密码');return}
 busy=true;say('正在登录');
 try{
  const s=await fetchAPI('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})},false);
  if(!s?.user?.id||!s.access_token||!s.refresh_token)throw Error('账号认证未成功');
  const previousUser=link?.userId;
  session={...s,expires_at:Math.floor(Date.now()/1000)+Number(s.expires_in||3600)};
  if(previousUser!==s.user.id){link=null;write(LINK_KEY,null)}
  write(SESSION_KEY,session);
  await refresh();say('登录成功。首次使用请选择「上传本机」或「下载云端」');
   if(entryStage==='login'){
    if(auto())closeEntry();
    else{entryStage='sync';renderEntry()}
   }
 }catch(e){say('登录失败：'+e.message);toast(status)}
 finally{busy=false;renderIfSettings()}
}
async function logout(){
 if(!signedIn()||!confirm('退出云端账号？本机训练记录不会删除。'))return;
 const token=session.access_token;
 session=null;link=null;remote=null;conflict=false;dirty=false;
 write(SESSION_KEY,null);write(LINK_KEY,null);say('已退出云端，本机记录仍保留');
 renderIfSettings();
 try{await fetch(API+'/auth/v1/logout',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+token}})}catch(e){}
}
async function upload(force=false){
 if(!signedIn()||uploading||importing||storageReadIssue)return false;
 if(!force&&!auto())return false;
 if(!remote&&!await refresh())return false;
 if(!force&&conflict){say('云端存在新版本，已暂停上传');return false}
 if(force&&!confirm(remote.version
  ?'云端已有 '+remote.records+' 条记录。确定用本机 '+state.records.length+' 条覆盖云端吗？'
  :'确认将本机 '+state.records.length+' 条训练记录、日历和步数上传到云端吗？'))return false;
 uploading=true;say('正在上传');
 const payload=snapshot(),expected=remote.version;
 try{
  const result=await fetchAPI('/rest/v1/rpc/fitness_save_journal',
   {method:'POST',body:JSON.stringify({p_payload:payload,p_expected_version:expected})});
  const row=Array.isArray(result)?result[0]:null;
  if(!row?.saved){
   conflict=true;remote.version=Number(row?.current_version??expected);
   say('上传被阻止：云端已由另一台设备更新，请先下载云端记录');return false;
  }
  remote={version:Number(row.current_version),records:payload.records.length,updatedAt:new Date().toISOString()};
  link={userId:session.user.id,version:remote.version,enabled:true};
  write(LINK_KEY,link);conflict=false;say('同步成功 · '+payload.records.length+' 条训练记录');
  dirty=JSON.stringify(snapshot().records)!==JSON.stringify(payload.records)||
    JSON.stringify(snapshot().stepDiary)!==JSON.stringify(payload.stepDiary)||
    JSON.stringify([...restDays].sort())!==JSON.stringify(payload.restDays)||
    JSON.stringify(state.settings)!==JSON.stringify(payload.settings);
  return true;
 }catch(e){say('未同步到云端：'+e.message);return false}
 finally{uploading=false;renderIfSettings();if(dirty&&auto())schedule()}
}
async function download(){
 if(!signedIn()||busy||uploading)return false;
 busy=true;say('读取云端数据中');
 try{
  const row=await getRow(),v=row?.payload;
  if(!row||!v||!Array.isArray(v.records)||typeof v.settings!=='object'||!v.settings)
   throw Error('云端不存在有效的健身记录');
  if(!confirm('云端有 '+v.records.length+' 条记录，将替换本机 '+state.records.length+' 条。系统先保存本机副本。确认继续？'))return false;
  const previous={state,restDays:[...restDays]},oldState=state,oldRest=restDays,oldIssue=storageReadIssue;
  if(!write('fitness_before_cloud_restore_v1',previous))throw Error('本机备份失败，取消替换');
  importing=true;
  try{
   state={version:1,records:v.records,settings:{...DEFAULT_SETTINGS,...v.settings},stepDiary:cleanStepDiary(v.stepDiary)};
   restDays=new Set(Array.isArray(v.restDays)?v.restDays.filter(validRestDate):[...oldRest]);
   storageReadIssue='';
   if(!persist()||!persistRestDays(restDays))throw Error('本机保存失败');
  }catch(e){
   state=oldState;restDays=oldRest;storageReadIssue=oldIssue;
   try{localStorage.setItem(STORAGE_KEY,JSON.stringify(oldState));
     localStorage.setItem(REST_DAYS_KEY,JSON.stringify([...oldRest].sort()))}catch(restoreError){}
   throw e;
  }finally{importing=false}
  remote={version:Number(row.version),records:v.records.length,updatedAt:row.updated_at};
  link={userId:session.user.id,version:remote.version,enabled:true};
  write(LINK_KEY,link);conflict=false;dirty=false;
  say('已恢复云端 '+v.records.length+' 条记录，本机旧记录另存为备份');
  render();return true;
 }catch(e){say('云端下载失败：'+e.message);toast(status);return false}
 finally{busy=false;renderIfSettings()}
}
function schedule(){
 if(!auto()||importing||storageReadIssue)return;
 dirty=true;
 if(timer)clearTimeout(timer);
 timer=setTimeout(()=>{timer=null;upload(false)},1000);
}
/* Sign-in does not automatically replace local training records or enable sync. */
function closeEntry(){
 entryStage='none';
 document.getElementById('fitnessEntryGate')?.remove();
 document.body.classList.remove('fitness-entry-open');
}
function renderEntry(){
 if(entryStage==='none'){closeEntry();return}
 let root=document.getElementById('fitnessEntryGate');
 if(!root){root=document.createElement('div');root.id='fitnessEntryGate';document.body.appendChild(root)}
 document.body.classList.add('fitness-entry-open');
 const entering=entryStage==='login';
 root.className='fitness-entry-overlay';
 root.innerHTML='<section class="fitness-entry-card" role="dialog" aria-modal="true" aria-label="'+
  (entering?'登录健身记录':'选择云端同步方式')+'">'+
  '<div class="fitness-entry-brand"><img src="./icon-180.png?v=2.2" width="46" height="46" alt="" />'+
  '<div><strong>健身记录</strong><small>HERMES FITNESS JOURNAL</small></div></div>'+
  (entering?
   '<div class="fitness-entry-heading"><h2>登录并开始记录</h2>'+
   '<p>使用 Hermes To Do 的同一账号登录健身记录。</p></div>'+
   '<form id="fitnessEntryLogin" class="fitness-entry-form">'+
   '<label>邮箱<input type="email" name="cloudEmail" autocomplete="username" autocapitalize="off" inputmode="email" required placeholder="Hermes 邮箱"></label>'+
   '<label>密码<input type="password" name="cloudPassword" autocomplete="current-password" required placeholder="Hermes 密码"></label>'+
   '<button type="submit" class="fitness-entry-primary">登录并继续</button></form>'+
   '<button type="button" class="fitness-entry-textbutton" data-fitness-entry="skip">暂不登录，使用本机记录</button>':
   '<div class="fitness-entry-heading"><h2>已登录 Hermes 账号</h2>'+
   '<p>'+safe(session?.user?.email||'账号已验证')+'</p></div>'+
   '<div class="fitness-entry-sync">'+
   '<button type="button" class="fitness-entry-primary" data-fitness-entry="upload">上传本机记录</button>'+
   '<button type="button" class="fitness-entry-secondary" data-fitness-entry="download">下载云端记录</button>'+
   '<button type="button" class="fitness-entry-textbutton" data-fitness-entry="skip">暂不同步，进入打卡</button></div>')+
  '<p class="fitness-entry-status" id="fitnessEntryStatus" role="status" aria-live="polite">'+safe(status)+'</p>'+
  '<p class="fitness-entry-footnote">登录不会删除本机训练记录。首次上传或下载需要另行确认，避免覆盖数据。</p>'+
  '</section>';
}

function panel(){
 const logged=signedIn(),account=logged?String(session.user.email||'已登录'):'';
 return '<section class="card fitness-cloud-panel"><div class="section-title"><div>'+
 '<h2>云端同步 · Hermes 同一账号</h2><p>使用相同的邮箱和密码，健身数据单独存储</p></div></div>'+
 (!logged?'<form id="fitnessCloudLogin" class="fitness-cloud-login">'+
  '<label>Hermes 邮箱<input type="email" name="cloudEmail" autocomplete="username" required></label>'+
  '<label>密码<input type="password" name="cloudPassword" autocomplete="current-password" required></label>'+
  '<button class="primary-btn" type="submit">登录</button></form>':
  '<div class="fitness-cloud-account"><strong>'+safe(account)+'</strong>'+
  '<button type="button" class="link-btn" data-cloud-action="logout">退出</button></div>'+
  '<div class="fitness-cloud-actions">'+
  '<button type="button" class="primary-btn" data-cloud-action="upload">上传本机记录</button>'+
  '<button type="button" class="secondary-btn" data-cloud-action="download">下载云端记录</button>'+
  '<button type="button" class="secondary-btn" data-cloud-action="refresh">刷新状态</button></div>'+
  '<p class="micro-note">首次连接先选择上传或下载，避免把空数据写到云端。连接成功后新记录自动同步；版本冲突时停止覆盖。</p>')+
 '<p class="fitness-cloud-status" id="fitnessCloudStatus" role="status">'+safe(status)+'</p>'+
 '<p class="micro-note">本机记录保留；账号密码仅用于登录，不写入公开网站代码。</p></section>';
}
// Add a separate panel without modifying existing record/calendar UI functions.
const previousSettings=renderSettings;
renderSettings=function(){return panel()+previousSettings()};
const priorPersist=persist;
persist=function(){const ok=priorPersist();if(ok)schedule();return ok};
const priorRestPersist=persistRestDays;
persistRestDays=function(next){const ok=priorRestPersist(next);if(ok)schedule();return ok};
document.addEventListener('submit',event=>{
 if(event.target.id==='fitnessCloudLogin'||event.target.id==='fitnessEntryLogin'){
  event.preventDefault();login(event.target)
 }
});
document.addEventListener('click',event=>{
 const entry=event.target.closest('[data-fitness-entry]');
 if(entry){
  const action=entry.dataset.fitnessEntry;
  if(action==='skip'){closeEntry();return}
  if(action==='upload'||action==='download'){
   (async()=>{
    const done=action==='upload'?await upload(true):await download();
    if(done)closeEntry();
   })();
   return;
  }
 }
 const btn=event.target.closest('[data-cloud-action]');if(!btn)return;
 if(btn.dataset.cloudAction==='logout')logout();
 else if(btn.dataset.cloudAction==='refresh')refresh();
 else if(btn.dataset.cloudAction==='upload')upload(true);
 else if(btn.dataset.cloudAction==='download')download();
});
window.addEventListener('online',()=>{if(auto())schedule()});
render();
if(signedIn())refresh();
else{entryStage='login';renderEntry()}
})();
