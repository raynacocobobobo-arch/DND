/* Fitness V3.0 — GitHub-only read, no account/password/token.
   GitHub Pages cannot commit to GitHub anonymously. Export JSON locally,
   then publish that file via a trusted GitHub connection. */
(function(){
'use strict';
const RAW='https://raw.githubusercontent.com/raynacocobobobo-arch/DND/gh-pages/fitness-tracker/records.json';
let lastStatus='尚未从 GitHub 读取',busy=false;
function banner(){
 const n=state.records.length;
 return '<section class="fitness-transfer-card" aria-label="GitHub 数据">'+
 '<div class="fitness-transfer-heading"><strong>GitHub 数据</strong><span>本机 '+n+' 条 · 无需登录</span></div>'+
 '<p>从 GitHub 公开记录文件读取；不会自动覆盖本机。上传需要先导出 JSON，再由 GitHub 连接提交文件。</p>'+
 '<div class="fitness-transfer-buttons">'+
 '<button type="button" data-github-sync="pull">从 GitHub 读取</button>'+
 '<button type="button" data-github-sync="export">导出 JSON 上传 GitHub</button></div>'+
 '<p class="fitness-transfer-note" id="fitnessGitHubStatus">'+safe(lastStatus)+'</p>'+
 '</section>';
}
const oldHome=renderQuickHome;
renderQuickHome=function(){
 const html=oldHome();
 return html.replace('<div class="wb-week">',banner()+'<div class="wb-week">');
};
const oldSettings=renderSettings;
renderSettings=function(){
 return oldSettings()+'<section class="card settings-card">'+banner()+
 '<p class="micro-note">GitHub 文件地址：fitness-tracker/records.json（gh-pages 分支）。此页面不需要用户名或密码，也不会请求 Supabase。</p></section>';
};
async function pull(){
 if(busy)return;
 busy=true;lastStatus='正在读取 GitHub';render();
 try{
  const response=await fetch(RAW+'?t='+Date.now(),{cache:'no-store'});
  if(response.status===404)throw new Error('GitHub 尚未上传 records.json；请先从有数据的页面导出 JSON，交给我提交到仓库');
  if(!response.ok)throw new Error('GitHub 读取失败：HTTP '+response.status);
  const txt=await response.text();
  if(txt.length>8*1024*1024)throw new Error('文件过大，已取消导入');
  const data=JSON.parse(txt);
  if(!Array.isArray(data.records)||data.records.length===0)throw new Error('GitHub 文件没有训练记录，已停止导入');
  if(!data.records.every(r=>r&&typeof r.date==='string'&&typeof r.type==='string'&&Number.isFinite(Number(r.calories))))throw new Error('GitHub 数据格式不正确');
  lastStatus='GitHub 找到 '+data.records.length+' 条记录；请确认是否导入';
  // Reuse the existing import validator, backup and explicit overwrite confirmation.
  importJSONFile(new File([txt],'github-records.json',{type:'application/json'}));
 }catch(e){lastStatus=String(e.message||e);toast(lastStatus);render()}
 finally{busy=false}
}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-github-sync]');if(!btn)return;
 if(btn.dataset.githubSync==='export'){exportJSON();return}
 if(btn.dataset.githubSync==='pull')pull();
});
})();