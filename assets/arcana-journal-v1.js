/* Forbidden Arcana Journal V1. Browser-only, no user data is sent to a server. */
(function(){
'use strict';
const KEY='forbidden-arcana-journal-v1', MAX=500;
const ESC=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ALL=()=>[].concat(window.ARCANA_CATALOG||[],window.CUPS_APPROVED||[],window.WANDS_APPROVED||[],window.SWORDS_APPROVED||[],window.PENTACLES_APPROVED||[]);
const byId=id=>ALL().find(c=>String(c.id)===String(id));
const suit=id=>String(id).includes('/')?String(id).split('/')[0]:'major';
const localDate=t=>{try{return new Date(t).toLocaleString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});}catch{return '时间未知';}};
const state={records:[],favorites:[],error:''};
function load(){
 try{
   const s=localStorage.getItem(KEY);if(!s)return;
   const x=JSON.parse(s);
   if(x&&x.version===1&&Array.isArray(x.records)&&Array.isArray(x.favorites)){
     state.records=x.records.filter(r=>r&&typeof r.id==='string'&&Array.isArray(r.cards)).slice(0,MAX);
     state.favorites=x.favorites.filter(id=>byId(id)).map(String);
   }
 }catch(e){state.error='无法读取本地档案，请检查浏览器存储权限。';}
}
function commit(){
 try{localStorage.setItem(KEY,JSON.stringify({version:1,records:state.records.slice(0,MAX),favorites:state.favorites}));state.error='';return true;}
 catch(e){state.error='保存失败：浏览器存储受限或空间不足。请先导出备份。';return false;}
}
function errorMessage(){return state.error?'<p class="journal-alert" role="alert">'+ESC(state.error)+'</p>':'';}
function recordFromDraw(d){
 const positions=d.n===3?['过去','现在','未来']:['启示'];
 return {id:'r-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),
 time:new Date().toISOString(),mode:d.daily?'daily':d.n===3?'three':'single',
 pool:d.pool||'all',question:String(d.question||'').slice(0,200),note:'',pinned:false,synthesis:String(d.synthesis||'').slice(0,2500),
 cards:d.cards.map((x,i)=>({id:String(x.c.id),rev:!!x.rev,position:positions[i],name:x.c.zh,
 title:x.c.minor?x.c.title:(window.ARCANA_DEPTH[x.c.id]||{}).title,
 story:x.c.minor?x.c.story:(window.ARCANA_DEPTH[x.c.id]||{}).scene,
 expanded:window.ARCANA_INTERPRETATIONS_V3?.prose(x.c.id,x.rev,positions[i])||'',
 meaning:x.rev?(x.c.minor?x.c.rev:(window.ARCANA_DEPTH[x.c.id]||{}).rev):(x.c.minor?x.c.up:(window.ARCANA_DEPTH[x.c.id]||{}).up)}))}
}
function addReading(d){
 // Daily cards are deterministic, but each separately asked question deserves its own dated record.
 const r=recordFromDraw(d);state.records.unshift(r);
 if(state.records.length>MAX)state.records.length=MAX;
 return {record:r,saved:commit(),repeat:false};
}
function getRecord(id){return state.records.find(r=>r.id===id);}
function count(){return state.records.length;}
function isFavorite(id){return state.favorites.includes(String(id));}
function toggleFavorite(id){
 const x=String(id);if(!byId(x))return false;
 state.favorites=isFavorite(x)?state.favorites.filter(v=>v!==x):state.favorites.concat(x);
 return commit();
}
function changeNote(id,note){const r=getRecord(id);if(!r)return false;r.note=String(note).slice(0,2000);return commit();}
function togglePin(id){const r=getRecord(id);if(!r)return false;r.pinned=!r.pinned;return commit();}
function remove(id){state.records=state.records.filter(r=>r.id!==id);return commit();}
function clear(){state.records=[];return commit();}
function download(blob,name){
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),6000);
}
function exportJSON(){download(new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),records:state.records,favorites:state.favorites},null,2)],{type:'application/json'}),'forbidden-arcana-backup-'+new Date().toISOString().slice(0,10)+'.json');}
function importJSON(file){
 if(!file||file.size>4e6)return Promise.reject(new Error('备份文件不得超过4MB'));
 return file.text().then(raw=>{
   let x;try{x=JSON.parse(raw)}catch{throw Error('文件不是有效JSON')}
   if(!x||x.version!==1||!Array.isArray(x.records)||!Array.isArray(x.favorites)||x.records.length>MAX)throw Error('不是兼容的命运档案备份');
   const validCard=c=>c&&byId(c.id)&&typeof c.rev==='boolean'&&typeof c.position==='string';
   const records=x.records.filter(r=>r&&typeof r.id==='string'&&r.id.length<120&&typeof r.time==='string'&&!isNaN(Date.parse(r.time))&&['single','three','daily'].includes(r.mode)&&Array.isArray(r.cards)&&[1,3].includes(r.cards.length)&&r.cards.every(validCard)).map(r=>({
      id:r.id,time:r.time,mode:r.mode,pool:r.pool==='major'?'major':'all',
      question:String(r.question||'').slice(0,200),note:String(r.note||'').slice(0,2000),pinned:!!r.pinned,synthesis:String(r.synthesis||'').slice(0,2500),
      cards:r.cards.map(c=>({id:String(c.id),rev:!!c.rev,position:String(c.position).slice(0,24),name:String(c.name||'').slice(0,60),title:String(c.title||'').slice(0,120),story:String(c.story||'').slice(0,1200),meaning:String(c.meaning||'').slice(0,1200),expanded:String(c.expanded||'').slice(0,2500)}))
   }));
   const ids=new Set(state.records.map(r=>r.id));
   for(const r of records)if(!ids.has(r.id)){state.records.push(r);ids.add(r.id)}
   state.records.sort((a,b)=>new Date(b.time)-new Date(a.time));state.records=state.records.slice(0,MAX);
   state.favorites=[...new Set(state.favorites.concat(x.favorites.filter(id=>byId(id)).map(String)))];
   if(!commit())throw Error(state.error);
   return records.length;
 });
}
function recordLabel(r){return r.mode==='daily'?'每日之牌':r.mode==='three'?'三张牌阵':'单张启示';}
function recordCard(r){
 return '<article class="archive-record">'+
  '<div class="archive-record-top"><span>'+ESC(localDate(r.time))+' · '+recordLabel(r)+'</span><span>'+(r.pinned?'★ 已收藏':'')+'</span></div>'+
  '<a class="archive-record-link" href="#/history/'+encodeURIComponent(r.id)+'"><div class="archive-thumb-row">'+r.cards.map(x=>{
    const c=byId(x.id);return c?'<img loading="lazy" src="'+ESC(c.thumb||c.img)+'" alt="'+ESC(c.zh)+'" style="'+(x.rev?'transform:rotate(180deg)':'')+'">':'';}).join('')+'</div>'+
  '<div class="archive-question">'+ESC(r.question||'无标题 · 一次与命运的对话')+'</div>'+
  '<p class="archive-names">'+r.cards.map(c=>ESC(c.name)+(c.rev?'（逆位）':'（正位）')).join(' · ')+'</p>'+
  (r.note?'<p class="archive-note-preview">笔记：'+ESC(r.note.slice(0,70))+'</p>':'')+'</a>'+
  '<div class="archive-actions"><button type="button" data-pin="'+ESC(r.id)+'">'+(r.pinned?'取消收藏':'收藏记录')+'</button><button type="button" data-remove="'+ESC(r.id)+'">删除</button></div></article>';
}
function renderHistory(){
 return '<section class="page archive-page"><div class="crumbs"><a href="#/home">首页</a><span>/</span>命运档案</div>'+
  '<div class="archive-heading"><div class="eyebrow">THE ARCHIVE OF FATE</div><h1 class="title">命运档案</h1><p class="sub">留下曾问过的问题，也留下后来对答案的理解。档案仅保存在当前浏览器中，不会自动同步到其他设备。</p></div>'+
  errorMessage()+
  '<div class="archive-toolbar"><input id="archive-search" aria-label="搜索档案" placeholder="搜索问题、牌名或笔记…"><select id="archive-filter" aria-label="筛选记录"><option value="all">全部记录</option><option value="pinned">仅收藏</option><option value="daily">每日之牌</option><option value="single">单张启示</option><option value="three">三张牌阵</option></select>'+
  '<button id="archive-export" type="button">导出备份</button><button id="archive-import" type="button">导入备份</button><input hidden type="file" accept=".json,application/json" id="archive-import-file"><button id="archive-clear" type="button" class="danger">清空历史</button></div>'+
  '<p class="archive-hint">共 '+state.records.length+' 条 · 最多保存500条 · 清理浏览器数据可能导致记录丢失。请定期导出备份。</p>'+
  '<div class="archive-grid" id="archive-grid"></div></section>';
}
function filteredRecords(){
 const q=(document.querySelector('#archive-search')?.value||'').trim().toLowerCase();
 const type=document.querySelector('#archive-filter')?.value||'all';
 return state.records.filter(r=>(type==='all'||(type==='pinned'?r.pinned:r.mode===type))&&(!q||[r.question,r.note].concat(r.cards.map(c=>c.name+' '+c.title)).join(' ').toLowerCase().includes(q))).sort((a,b)=>Number(b.pinned)-Number(a.pinned)||new Date(b.time)-new Date(a.time));
}
function updateHistoryList(){
 const grid=document.querySelector('#archive-grid');if(!grid)return;
 const arr=filteredRecords();
 grid.innerHTML=arr.length?arr.map(recordCard).join(''):'<div class="archive-empty"><h2>这里还没有符合条件的记录</h2><p>从一次抽牌开始，命运档案便会自动记录你的旅程。</p><a class="btn" href="#/draw">开始抽牌 →</a></div>';
 grid.querySelectorAll('[data-pin]').forEach(b=>b.onclick=()=>{togglePin(b.dataset.pin);updateHistoryList();});
 grid.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('确认永久删除这条抽牌记录？')){remove(b.dataset.remove);updateHistoryList();}});
}
function installHistory(){
 document.querySelector('#archive-search').oninput=updateHistoryList;
 document.querySelector('#archive-filter').onchange=updateHistoryList;
 document.querySelector('#archive-export').onclick=exportJSON;
 document.querySelector('#archive-import').onclick=()=>document.querySelector('#archive-import-file').click();
 document.querySelector('#archive-import-file').onchange=async e=>{
  const file=e.target.files[0];if(!file)return;
  if(!confirm('将这份备份与当前浏览器的记录合并？已有的相同记录不会重复导入。'))return;
  try{const n=await importJSON(file);alert('备份读取完成，识别到 '+n+' 条有效记录。');location.hash='#/history';window.dispatchEvent(new Event('hashchange'));}
  catch(err){alert('导入失败：'+err.message);}
 };
 document.querySelector('#archive-clear').onclick=()=>{if(confirm('确定清空此浏览器内的全部抽牌历史？此操作不可撤销。建议先导出备份。')&&confirm('再次确认：永久清空全部历史记录？')){clear();updateHistoryList();}};
 updateHistoryList();
}
function renderRecord(id){
 const r=getRecord(id);
 if(!r)return '<section class="page"><h1>找不到这条档案</h1><a href="#/history">返回命运档案</a></section>';
 return '<section class="page archive-page archive-detail"><div class="crumbs"><a href="#/history">命运档案</a><span>/</span>'+ESC(localDate(r.time))+'</div>'+
  '<div class="eyebrow">RECORDED READING</div><h1 class="title">'+recordLabel(r)+'</h1><p class="archive-hint">'+ESC(localDate(r.time))+' · '+(r.pool==='major'?'仅大阿卡纳':'完整牌库')+'</p>'+
  (r.question?'<div class="archive-question-large">当时的问题：'+ESC(r.question)+'</div>':'')+
  '<div class="archive-reading-cards">'+r.cards.map(x=>{const c=byId(x.id);return c?'<article><a href="#/card/'+encodeURIComponent(x.id)+'?from=history&record='+encodeURIComponent(r.id)+'"><img src="'+ESC(c.img)+'" loading="lazy" alt="'+ESC(c.zh)+'" style="'+(x.rev?'transform:rotate(180deg)':'')+'"></a><h2>'+ESC(x.name)+'</h2><p>'+ESC(x.position)+' · '+(x.rev?'逆位':'正位')+'</p><p class="archive-reading-interpretation"><strong>这张牌的解读：</strong>'+ESC(x.expanded||window.ARCANA_INTERPRETATIONS_V3?.prose(x.id,x.rev,x.position)||x.meaning)+'</p><details><summary>展开原著故事</summary><p>'+ESC(x.story||'')+'</p></details><a href="#/card/'+encodeURIComponent(x.id)+'?from=history&record='+encodeURIComponent(r.id)+'">查看完整牌义与故事 →</a></article>':'';}).join('')+'</div>'+
  (r.synthesis?'<section class="archive-synthesis"><div class="eyebrow">SAVED READING</div><h2>当时的三张牌综合解读</h2>'+r.synthesis.split(/\n\n/).filter(Boolean).map(x=>'<p>'+ESC(x)+'</p>').join('')+'<p class="synthesis-disclaimer">按固定规则整理牌义，无 AI，也不会分析你填写的问题。</p></section>':'')+
  '<section class="archive-notes"><h2>我的笔记</h2><textarea id="archive-note" maxlength="2000" rows="5" placeholder="当时有什么感受？后来发生了什么？">'+ESC(r.note)+'</textarea><p class="archive-hint">仅保存在当前浏览器。笔记不会包含在公开分享文本里。</p><button class="btn" id="archive-save-note">保存笔记</button><span id="archive-note-status" role="status"></span></section>'+
  '<div class="archive-actions"><button id="record-pin">'+(r.pinned?'取消收藏':'收藏本次记录')+'</button><button id="record-copy">复制牌阵摘要</button><button id="record-image">导出牌阵图片</button><button class="danger" id="record-delete">删除记录</button></div></section>';
}
function installRecord(id){
 const r=getRecord(id);if(!r)return;
 document.querySelector('#archive-save-note').onclick=()=>{
  const ok=changeNote(id,document.querySelector('#archive-note').value);
  document.querySelector('#archive-note-status').textContent=ok?'已保存':'保存失败，请检查存储权限';
 };
 document.querySelector('#record-pin').onclick=()=>{togglePin(id);document.querySelector('#record-pin').textContent=r.pinned?'取消收藏':'收藏本次记录';};
 document.querySelector('#record-delete').onclick=()=>{if(confirm('确定永久删除这次抽牌记录？')){remove(id);location.hash='#/history';}};
 document.querySelector('#record-copy').onclick=()=>copySummary(r);
 document.querySelector('#record-image').onclick=()=>exportCardImage(r);
}
function textSummary(r){
 return ['禁忌之书 · 克苏鲁塔罗',recordLabel(r),localDate(r.time),...r.cards.map(x=>x.position+'：'+x.name+' · '+(x.rev?'逆位':'正位')),'查看原画与牌库：https://raynacocobobobo-arch.github.io/DND/'].join('\n');
}
async function copySummary(r){
 const text=textSummary(r);
 try{await navigator.clipboard.writeText(text);alert('牌阵摘要已复制（不含你的问题和笔记）。');}
 catch{prompt('复制以下牌阵摘要：',text);}
}
function imageLoader(src){return new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=src;});}
async function exportCardImage(r){
 try{
  const cards=r.cards.map(x=>({item:x,card:byId(x.id)})).filter(x=>x.card);
  if(!cards.length)throw Error('牌面数据缺失');
  const W=1080,H=cards.length===1?1300:1120,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0c141c';ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#c8a36c';ctx.lineWidth=5;ctx.strokeRect(30,30,W-60,H-60);
  ctx.strokeStyle='#806743';ctx.lineWidth=1;ctx.strokeRect(43,43,W-86,H-86);
  ctx.textAlign='center';ctx.fillStyle='#eddbb6';ctx.font='50px serif';ctx.fillText('禁忌之书',W/2,110);
  ctx.fillStyle='#bb9e70';ctx.font='22px serif';ctx.fillText('THE FORBIDDEN ARCANA · '+recordLabel(r),W/2,154);
  const gap=cards.length===1?0:22, cw=cards.length===1?410:300, ch=cw*16/9;
  let startX=(W-(cards.length*cw+(cards.length-1)*gap))/2;
  for(let i=0;i<cards.length;i++){
   const {item,card}=cards[i],img=await imageLoader(card.img),x=startX+i*(cw+gap),y=225;
   ctx.save();if(item.rev){ctx.translate(x+cw,y+ch);ctx.rotate(Math.PI);ctx.drawImage(img,0,0,cw,ch);}else ctx.drawImage(img,x,y,cw,ch);ctx.restore();
   ctx.fillStyle='#f1e4ce';ctx.font='24px serif';ctx.fillText(item.name,x+cw/2,y+ch+38);
   ctx.fillStyle='#c4ab7f';ctx.font='20px serif';ctx.fillText(item.position+' · '+(item.rev?'逆位':'正位'),x+cw/2,y+ch+70);
  }
  ctx.fillStyle='#a8a092';ctx.font='21px serif';ctx.fillText('每一次抽牌，都是一次与未知的对话。',W/2,H-112);
  ctx.font='18px serif';ctx.fillText('raynacocobobobo-arch.github.io/DND',W/2,H-78);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('无法导出图片');
  download(blob,'forbidden-arcana-reading-'+r.id+'.png');
 }catch(e){alert('牌阵图片导出失败。请检查图片加载状态后重试。');}
}
function renderExplore(){
 const full=ALL();
 return '<section class="page explore-page"><div class="crumbs"><a href="#/home">首页</a><span>/</span>78张全牌图鉴</div>'+
 '<div class="eyebrow">THE COMPLETE GRIMOIRE</div><h1 class="title">七十八张禁忌之门</h1><p class="sub">从四部洛夫克拉夫特故事进入五组牌面的世界。搜索牌名、人物、文学主题，或收藏想再次阅读的篇章。</p>'+
 '<div class="explore-tools"><input id="explore-search" placeholder="搜索牌名、故事、人物或关键词" aria-label="搜索78张牌"><select id="explore-suit" aria-label="筛选花色"><option value="all">全部 · 78</option><option value="major">大阿卡纳 · 22</option><option value="cups">圣杯 · 14</option><option value="wands">权杖 · 14</option><option value="swords">宝剑 · 14</option><option value="pentacles">星币 · 14</option></select><label class="explore-fav-toggle"><input type="checkbox" id="explore-faves"> 仅看收藏</label></div>'+
 '<div class="explore-shortcuts"><a href="#/library/1">大阿卡纳</a><a href="#/library/cups">圣杯</a><a href="#/library/wands">权杖</a><a href="#/library/swords">宝剑</a><a href="#/library/pentacles">星币</a></div>'+
 '<p class="archive-hint" id="explore-count">'+full.length+'张</p><div class="explore-grid" id="explore-grid"></div></section>';
}
function updateExplore(){
 const q=(document.querySelector('#explore-search')?.value||'').trim().toLowerCase();
 const suitFilter=document.querySelector('#explore-suit')?.value||'all',favs=document.querySelector('#explore-faves')?.checked||false;
 const records=ALL().filter(c=>(suitFilter==='all'||suit(c.id)===suitFilter)&&(!favs||isFavorite(c.id))&&(!q||[c.zh,c.en,c.title,c.entity,c.suitMeaning,c.story,c.canon].join(' ').toLowerCase().includes(q)));
 document.querySelector('#explore-count').textContent='找到 '+records.length+' / 78 张';
 document.querySelector('#explore-grid').innerHTML=records.length?records.map(c=>
  '<article class="explore-item"><a href="#/card/'+encodeURIComponent(c.id)+'"><img loading="lazy" src="'+ESC(c.thumb||c.img)+'" alt="'+ESC(c.zh)+'"><h2>'+ESC(c.zh)+'</h2><p>'+ESC(c.title||c.entity||c.en)+'</p></a><button type="button" class="favorite-toggle" data-favorite="'+ESC(c.id)+'" aria-pressed="'+isFavorite(c.id)+'">'+(isFavorite(c.id)?'★ 已收藏':'☆ 收藏')+'</button></article>').join(''):'<p class="archive-empty">没有找到符合条件的牌面。</p>';
 document.querySelectorAll('#explore-grid [data-favorite]').forEach(b=>b.onclick=()=>{toggleFavorite(b.dataset.favorite);updateExplore();});
}
function installExplore(){
 document.querySelector('#explore-search').oninput=updateExplore;
 document.querySelector('#explore-suit').onchange=updateExplore;
 document.querySelector('#explore-faves').onchange=updateExplore;
 updateExplore();
}
function installDetailFavorite(){
 const copy=document.querySelector('.detail-copy');if(!copy)return;
 const path=location.hash.replace(/^#\/card\//,'');
 const id=decodeURIComponent(path),card=byId(id);if(!card)return;
 const anchor=copy.querySelector('.character,.subtitle');
 if(!anchor)return;
 const b=document.createElement('button');b.type='button';b.className='favorite-toggle detail-favorite';
 function update(){b.textContent=isFavorite(id)?'★ 已收藏此牌':'☆ 收藏这张牌';b.setAttribute('aria-pressed',String(isFavorite(id)));}
 update();b.onclick=()=>{toggleFavorite(id);update();};
 anchor.insertAdjacentElement('afterend',b);
 const share=document.createElement('button');share.type='button';share.className='favorite-toggle detail-share';share.textContent='分享牌面链接';
 share.onclick=async()=>{
   const url='https://raynacocobobobo-arch.github.io/DND/#/card/'+encodeURI(String(id));
   if(navigator.share){
     try{await navigator.share({title:card.zh+' · 禁忌之书',text:'查看这张克苏鲁塔罗牌的故事与正逆位解读',url});return;}catch(e){if(e.name==='AbortError')return;}
   }
   try{await navigator.clipboard.writeText(url);share.textContent='链接已复制';}
   catch{prompt('复制牌面链接：',url);}
 };
 b.insertAdjacentElement('afterend',share);
}
load();
window.TAROT_JOURNAL={count,addReading,getRecord,renderHistory,installHistory,renderRecord,installRecord,renderExplore,installExplore,installDetailFavorite,copySummary,exportCardImage,isFavorite,exportJSON};
})();