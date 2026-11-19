/* 健身记录 V2.9 · 首页顶部始终显示数据迁移入口。 */
(function(){
'use strict';
const API="https://arnrlepjuqdmvbipswci.supabase.co", KEY="sb_publishable_KIqNFyXWtQe8umuikfP6lQ_3MQrQzdt", SESSION_KEY='fitness_cloud_session_v1', LINK_KEY='fitness_cloud_link_v1';
function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function write(key,value){try{value===null?localStorage.removeItem(key):localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
let session=read(SESSION_KEY),link=read(LINK_KEY),remote=null,busy=false,conflict=false,dirty=false,importing=false,uploading=false,timer=null;
let status=session?'账号会话已保存，重新进入无需再次登录':'未登录：当前记录仍安全保存在本机';
let entryStage='none',lastLoginEmail='',refreshingToken=null,refreshingAccount=null;
function signedIn(){return !!session?.access_token&&!!session?.refresh_token&&!!session?.user?.id}
function auto(){return false} // Safety: sync is opt-in/manual, including previously linked sessions.
function say(msg){status=msg;
 const settings=document.getElementById('fitnessCloudStatus');if(settings)settings.textContent=msg;
 const entry=document.getElementById('fitnessEntryStatus');if(entry)entry.textContent=msg;
}
function renderIfSettings(){
 // Refresh counts on the home sync banner, but don't interrupt a workout editor.
 if(view==='settings'||(view==='overview'&&!wbOpenKey&&!wbCalorieDetailOpen))render();
}
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
 if(Number(session.expires_at||0)>Date.now()/1000+120)return session.access_token;
 if(refreshingToken)return refreshingToken;
 refreshingToken=(async()=>{
  try{
   const before=session;
   const fresh=await fetchAPI('/auth/v1/token?grant_type=refresh_token',
    {method:'POST',body:JSON.stringify({refresh_token:before.refresh_token})},false);
   if(!fresh?.access_token||!fresh?.refresh_token){
    say('登录暂时无法续期；保留账号，不影响本机打卡，联网后重试');
    return null;
   }
   const next={...before,...fresh,user:fresh.user?.id?fresh.user:before.user,
    expires_at:Math.floor(Date.now()/1000)+Number(fresh.expires_in||3600)};
   if(!next.user?.id||next.user.id!==before.user.id)return null;
   if(!write(SESSION_KEY,next)){say('无法保存登录状态，请检查本机网站存储');return null}
   session=next;
   return next.access_token;
  }catch(e){
   // Offline or transient token errors never erase the remembered login.
   say('网络暂时无法刷新登录，恢复网络后自动重试；本机记录仍可使用');
   return null;
  }finally{refreshingToken=null}
 })();
 return refreshingToken;
}
async function resumeAccount(){
 if(!signedIn()||refreshingAccount)return;
 refreshingAccount=(async()=>{
  if(Number(session.expires_at||0)<Date.now()/1000+300)await getToken();
  if(signedIn())await refresh();
 })();
 try{await refreshingAccount}finally{refreshingAccount=null}
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
    remote.records===0?'云端目前 0 条训练记录，勿上传空数据；请先找回原有本机记录':'云端有 '+remote.records+' 条训练记录，可下载或继续同步');
  renderIfSettings();return true;
 }catch(e){say('云端读取失败：'+e.message);return false}
}
/* Supabase passwordless email authentication: no Hermes server passwords. */
function hasAuthCallback(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 const query=new URLSearchParams(location.search);
 return !!(hash.get('access_token')||hash.get('error')||query.get('token_hash'));
}
function discardAuthUrl(){
 const url=new URL(location.href);
 url.hash='';
 url.searchParams.delete('token_hash');
 url.searchParams.delete('type');
 url.searchParams.delete('error');
 url.searchParams.delete('error_description');
 url.searchParams.delete('error_code');
 try{history.replaceState(history.state,'',url.pathname+url.search)}catch(e){}
}
async function acceptAuthSession(result){
 if(!result?.access_token||!result?.refresh_token)throw Error('登录链接没有返回完整的会话');
 const user=await fetchAPI('/auth/v1/user',
  {method:'GET',headers:{Authorization:'Bearer '+result.access_token}},false);
 if(!user?.id)throw Error('无法验证登录账号');
 const priorId=link?.userId;
 session={...result,user,expires_at:Math.floor(Date.now()/1000)+Number(result.expires_in||3600)};
 if(priorId!==user.id){link=null;write(LINK_KEY,null)}
 if(!write(SESSION_KEY,session))throw Error('登录会话无法保存到本机');
 await refresh();
 say('邮箱验证成功。当前以本机记录为准；如需同步，可在设置里手动操作。');
 closeEntry();renderIfSettings();
}
async function consumeEmailCallback(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 const query=new URLSearchParams(location.search);
 try{
  if(hash.get('error')||query.get('error')){
   throw Error(hash.get('error_description')||query.get('error_description')||
    '邮件登录链接无效或已过期');
  }
  if(hash.get('access_token')&&hash.get('refresh_token')){
   await acceptAuthSession({
    access_token:hash.get('access_token'),
    refresh_token:hash.get('refresh_token'),
    expires_in:Number(hash.get('expires_in'))||3600,
    token_type:hash.get('token_type')||'bearer'
   });
  }else if(query.get('token_hash')){
   const response=await fetchAPI('/auth/v1/verify',{method:'POST',
    body:JSON.stringify({token_hash:query.get('token_hash'),type:query.get('type')||'email'})},false);
   await acceptAuthSession(response);
  }else throw Error('缺少邮件验证信息');
 }catch(e){
  closeEntry();
  say('邮件验证失败：'+(e.message||'需要时可在设置中重新发送登录邮件'));
  renderIfSettings();
 }finally{discardAuthUrl()}
}
async function verifyEmailCode(form){
 if(busy)return;
 const email=String(form.querySelector('[name="cloudEmail"]')?.value||lastLoginEmail).trim();
 const token=String(form.querySelector('[name="cloudOtp"]')?.value||'').trim();
 if(!email.includes('@')||!/^[0-9]{6}$/.test(token)){say('请填写邮箱和邮件中的 6 位验证码');return}
 busy=true;say('正在验证邮箱');
 try{
  const result=await fetchAPI('/auth/v1/verify',
   {method:'POST',body:JSON.stringify({email,token,type:'email'})},false);
  await acceptAuthSession(result);
 }catch(e){say('验证码验证失败：'+(e.message||'请使用邮件中的登录链接'))}
 finally{busy=false;renderIfSettings()}
}

async function login(form){
 if(busy)return;
 const email=String(form.querySelector('[name="cloudEmail"]')?.value||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){say('请输入完整的 Hermes 登录邮箱');return}
 busy=true;
 say('正在发送登录邮件');
 try{
  // A recognized existing account is required; do not create accounts implicitly.
  const redirect=location.origin+location.pathname;
  await fetchAPI('/auth/v1/otp?redirect_to='+encodeURIComponent(redirect),
   {method:'POST',body:JSON.stringify({email,create_user:false})},false);
  lastLoginEmail=email;
  closeEntry();
  say('登录邮件已请求发送，请到邮箱打开登录链接；本机记录不受影响。');
  renderIfSettings();
 }catch(e){
  say('邮件发送失败：'+(e.message||'请稍后重试'));
 }finally{busy=false;renderIfSettings()}
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
 if(!state.records.length){
  say('已阻止空数据上传：当前浏览器没有训练记录。请在原来的浏览器或桌面图标中导出 JSON，再导入此处。');
  renderIfSettings();return false;
 }
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
  if(!v.records.length){say('已阻止空云端下载：云端目前没有训练记录，不能覆盖本机。');return false;}
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
 root.className='fitness-entry-overlay';
 const entering=entryStage==='login',waiting=entryStage==='waiting';
 root.innerHTML='<section class="fitness-entry-card" role="dialog" aria-modal="true" aria-label="'+
  (entering?'登录健身记录':waiting?'等待邮件验证':'选择云端同步方式')+'">'+
  '<div class="fitness-entry-brand"><img src="./icon-180.png?v=2.2" width="46" height="46" alt="" />'+
  '<div><strong>健身记录</strong><small>HERMES FITNESS JOURNAL</small></div></div>'+
  (entering?
   '<div class="fitness-entry-heading"><h2>使用邮箱登录</h2>'+
   '<p>与 Hermes To Do 同一 Supabase 账号，无需密码。</p></div>'+
   '<form id="fitnessEntryLogin" class="fitness-entry-form">'+
   '<label>Hermes 邮箱<input type="email" name="cloudEmail" autocomplete="username" autocapitalize="off" inputmode="email" required placeholder="请输入完整邮箱"></label>'+
   '<button type="submit" class="fitness-entry-primary">发送邮箱登录链接</button></form>'+
   '<button type="button" class="fitness-entry-textbutton" data-fitness-entry="skip">暂不登录，使用本机记录</button>':
  waiting?
   '<div class="fitness-entry-heading"><h2>检查登录邮件</h2>'+
   '<p>登录链接已请求发送至 '+safe(lastLoginEmail)+'。在邮件中点击链接，即可返回健身记录。</p></div>'+
   '<form id="fitnessEntryOtp" class="fitness-entry-form">'+
   '<label>若邮件包含 6 位验证码，也可在这里输入'+
   '<input type="text" name="cloudOtp" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code" placeholder="6 位验证码"></label>'+
   '<button type="submit" class="fitness-entry-secondary">验证邮箱验证码</button></form>'+
   '<button type="button" class="fitness-entry-textbutton" data-fitness-entry="retry">重新填写邮箱</button>'+
   '<button type="button" class="fitness-entry-textbutton" data-fitness-entry="skip">暂不登录，使用本机记录</button>':
   '<div class="fitness-entry-heading"><h2>已登录 Hermes 账号</h2>'+
   '<p>'+safe(session?.user?.email||'账号已验证')+'</p></div>'+
   '<div class="fitness-entry-sync">'+
   '<p class="fitness-entry-data-warning">当前浏览器本机 '+state.records.length+' 条训练 · 云端 '+(remote?.records??'未读取')+' 条训练。'+(state.records.length===0?'本机为 0 时，请先在原来的 iPhone 桌面图标、Safari 或原应用内浏览器找到记录，从「设置」导出 JSON。切勿清理原应用数据。':'')+'</p>'+
   '<button type="button" class="fitness-entry-primary" data-fitness-entry="upload"'+(state.records.length===0?' disabled':'')+'>上传本机记录</button>'+
   '<button type="button" class="fitness-entry-secondary" data-fitness-entry="download"'+(remote?.records===0?' disabled':'')+'>下载云端记录</button>'+
   '<button type="button" class="fitness-entry-textbutton" data-fitness-entry="skip">暂不同步，进入打卡</button></div>')+
  '<p class="fitness-entry-status" id="fitnessEntryStatus" role="status" aria-live="polite">'+safe(status)+'</p>'+
  '<p class="fitness-entry-footnote">登录不会删除本机训练记录，上传或下载云端数据需要另行确认。</p>'+
  '</section>';
}
/* A Magic Link opened in Safari does not sign an independently stored iOS Home Screen
   web app in. Claiming the email link from the original installed app binds it once.
   Never persist the raw link or print it to browser logs. */
async function claimEmailLink(form){
 if(busy)return;
 const raw=String(form.querySelector('[name="cloudLoginLink"]')?.value||'').trim();
 if(!raw){say('请粘贴 Gmail 邮件里的完整登录链接');return}
 let linkUrl;
 try{linkUrl=new URL(raw)}catch(e){say('登录链接不是有效的网址');return}
 const fromSupabase=linkUrl.origin===API&&linkUrl.pathname==='/auth/v1/verify';
 const fromApp=linkUrl.origin===location.origin&&
  (linkUrl.pathname===location.pathname||linkUrl.pathname===location.pathname.replace(/index\\.html$/,''));
 if(!fromSupabase&&!fromApp){say('仅接受当前 Supabase 项目或健身记录本身的登录链接');return}
 const fragment=new URLSearchParams(linkUrl.hash.replace(/^#/,''));
 const query=linkUrl.searchParams;
 busy=true;say('正在验证此设备的登录链接');
 try{
  let verified;
  if(fromApp&&fragment.get('access_token')&&fragment.get('refresh_token')){
   verified={access_token:fragment.get('access_token'),refresh_token:fragment.get('refresh_token'),
    expires_in:Number(fragment.get('expires_in'))||3600,token_type:'bearer'};
  }else{
   const tokenHash=query.get('token_hash')||query.get('token');
   const kind=query.get('type')||'magiclink';
   if(!tokenHash||!['email','magiclink','signup'].includes(kind))
    throw Error('邮件链接缺少可验证的令牌，请复制新邮件中的完整登录链接');
   verified=await fetchAPI('/auth/v1/verify',
    {method:'POST',body:JSON.stringify({token_hash:tokenHash,type:kind})},false);
  }
  await acceptAuthSession(verified);
  form.reset();
  say('本设备已登录，之后打开将自动保持在线；训练数据未改变');
 }catch(e){say('验证失败：'+(e.message||'此链接可能已使用或过期，请重新发送邮件'))}
 finally{busy=false;renderIfSettings()}
}

function panel(){
 const logged=signedIn(),account=logged?String(session.user.email||'已登录'):'';
 return '<section class="card fitness-cloud-panel"><div class="section-title"><div>'+
 '<h2>云端同步 · Hermes 同一账号</h2><p>当前浏览器本机 '+state.records.length+' 条训练 · 云端 '+(remote?.records??'未读取')+' 条训练</p></div></div>'+
 (!logged?'<div class="fitness-account-login"><form id="fitnessCloudLogin" class="fitness-cloud-login">'+
  '<label>Hermes 邮箱<input type="email" name="cloudEmail" autocomplete="username" required></label>'+
  '<button class="primary-btn" type="submit">发送登录链接</button></form>'+
  '<form id="fitnessClaimEmailLink" class="fitness-claim-login">'+
  '<label>iPhone 桌面应用：从 Gmail 复制登录链接，在这里粘贴验证一次'+
  '<input type="text" name="cloudLoginLink" placeholder="粘贴邮件登录链接" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false" required></label>'+
  '<button class="secondary-btn" type="submit">在当前应用保持登录</button></form></div>':
  '<div class="fitness-cloud-account"><strong>'+safe(account)+' · 已登录（自动续期）</strong>'+
  '<button type="button" class="link-btn" data-cloud-action="logout">退出</button></div>'+
  '<div class="fitness-cloud-actions">'+
  '<button type="button" class="primary-btn" data-cloud-action="upload"'+(state.records.length===0?' disabled':'')+'>上传本机记录</button>'+
  '<button type="button" class="secondary-btn" data-cloud-action="download"'+(remote?.records===0?' disabled':'')+'>下载云端记录</button>'+
  '<button type="button" class="secondary-btn" data-cloud-action="refresh">刷新状态</button></div>'+
  '<p class="micro-note">在有训练记录的浏览器点击「同步到 iPhone 桌面版」，随后在桌面版点击「从云端恢复记录」。两个浏览器数据彼此独立；上传和下载均需确认，且不会传输空数据。</p>')+
 '<p class="fitness-cloud-status" id="fitnessCloudStatus" role="status">'+safe(status)+'</p>'+
 '<p class="micro-note">本机记录保留；邮箱仅用于发送登录链接，无需填写密码。</p></section>';
}
/* Both iOS Home Screen apps and in-app browsers own separate localStorage databases.
   Copy the source journal to the authenticated cloud once; the destination receives it
   only after the user chooses to restore. No empty automatic cloud writes. */
function fitnessSyncBanner(){
 const local=state.records.length,cloud=remote?.records;
 const account=signedIn()?'已登录':'此页面未登录';
 const cloudText=cloud===undefined?'正在获取':cloud+' 条';
 return '<section class="fitness-transfer-card" aria-label="数据迁移">'+
  '<div class="fitness-transfer-heading"><strong>数据迁移</strong>'+
  '<span>本机 '+local+' 条 · 云端 '+cloudText+' · '+account+'</span></div>'+
  '<p>两边记录不会自动共享：先在有数据的页面上传，再到 iPhone 桌面版恢复。</p>'+
  '<div class="fitness-transfer-buttons">'+
   '<button type="button" data-fitness-sync-action="upload"'+(local===0?' disabled':'')+'>① 上传本机记录</button>'+
   '<button type="button" data-fitness-sync-action="download"'+(cloud===0?' disabled':'')+'>② 从云端恢复记录</button></div>'+
  (!signedIn()?'<p class="fitness-transfer-note">这个页面尚未登录：点击上传或恢复会进入设置，登录一次即可。本机记录不会删除。</p>':'')+
  (local===0?'<p class="fitness-transfer-note">本机 0 条：请先找回显示过训练记录的原入口，不要在此上传。</p>':'')+
  '<button type="button" class="fitness-transfer-export" data-fitness-sync-action="export">导出本机 JSON 备份</button>'+
  '</section>';
}
const beforeFitnessSyncQuickHome=renderQuickHome;
renderQuickHome=function(){
 const html=beforeFitnessSyncQuickHome();
 return html.replace('<div class="wb-week">',fitnessSyncBanner()+'<div class="wb-week">');
};

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
 }else if(event.target.id==='fitnessEntryOtp'){
  event.preventDefault();verifyEmailCode(event.target)
 }else if(event.target.id==='fitnessClaimEmailLink'){
  event.preventDefault();claimEmailLink(event.target)
 }
});
document.addEventListener('click',event=>{
 const entry=event.target.closest('[data-fitness-entry]');
 if(entry){
  const action=entry.dataset.fitnessEntry;
  if(action==='skip'){closeEntry();return}
  if(action==='retry'){entryStage='login';renderEntry();return}
  if(action==='upload'||action==='download'){
   (async()=>{
    const done=action==='upload'?await upload(true):await download();
    if(done)closeEntry();
   })();
   return;
  }
 }
 const syncBtn=event.target.closest('[data-fitness-sync-action]');
 if(syncBtn){
  const action=syncBtn.dataset.fitnessSyncAction;
  if(action==='export'){exportJSON();return}
  if(!signedIn()&&(action==='upload'||action==='download')){
   switchView('settings');
   toast('此页面需要登录一次才能迁移；本机运动记录不会删除');
   return;
  }
  if(action==='upload')upload(true);
  else if(action==='download')download();
  else if(action==='refresh')refresh();
  return;
 }
 const btn=event.target.closest('[data-cloud-action]');if(!btn)return;
 if(btn.dataset.cloudAction==='logout')logout();
 else if(btn.dataset.cloudAction==='refresh')refresh();
 else if(btn.dataset.cloudAction==='upload')upload(true);
 else if(btn.dataset.cloudAction==='download')download();
});
window.addEventListener('online',()=>resumeAccount());
window.addEventListener('pageshow',()=>resumeAccount());
window.addEventListener('focus',()=>resumeAccount());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resumeAccount()});
render();
closeEntry();
if(hasAuthCallback())consumeEmailCallback();
else if(signedIn())resumeAccount();
// No sign-in wall. The local journal opens directly, irrespective of account state.
})();
