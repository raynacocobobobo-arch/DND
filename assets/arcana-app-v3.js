/* Forbidden Arcana V3 — true hash-routed screens, no single-page content wall.
   #/ home | #/draw | #/library/1 | #/card/0…21.
   Hash routes work with GitHub Pages direct refresh without 404. */
(()=>{
  'use strict';
  const C=window.ARCANA_CATALOG,D=window.ARCANA_DEPTH,CU=window.CUPS_APPROVED;
  const root=document.querySelector('#app');
  // The approved Minor Arcana artwork is a separate suit entry; do not silently
  // mix a single minor card into the original 22-card Major Arcana draw.
  if(!Array.isArray(C)||!Array.isArray(D)||!Array.isArray(CU)||C.length!==22||D.length!==22||CU.length!==14||!root) {
    if(root) root.innerHTML='<div class="page notfound"><h1>牌库加载失败</h1><p>请刷新页面后重试。</p></div>';
    return;
  }
  const escapeText=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const clean=s=>escapeText(s);
  const urlCard=id=>`#/card/${id}`;
  let drawResult=null, currentSpread=1, isDaily=false, currentQuestion='', drawPool='all';
  let lastView='';
  const docTitle='禁忌之书 · 克苏鲁塔罗';
  const navs=[...document.querySelectorAll('[data-route-nav]')];
  function banner(eyebrow,title,subtitle) {return '<div class="eyebrow">'+eyebrow+'</div><h1 class="title">'+title+'</h1><p class="sub">'+subtitle+'</p>';}
  function routeParts(){
    const text=decodeURIComponent(location.hash.replace(/^#\/?/,''));
    const parts=text.split('/').filter(Boolean);
    if(parts[0]==='cards')parts[0]='library';
    if(!parts.length) return {screen:'home'};
    if(parts[0]==='home')return {screen:'home'};
    if(parts[0]==='draw')return {screen:'draw'};
    if(parts[0]==='library'&&parts[1]==='cups')return {screen:'cups',page:Math.max(1,Math.min(3,Number(parts[2]||1)||1))};
    if(parts[0]==='cups')return {screen:'cups'};
    if(parts[0]==='card'&&parts[1]==='cups'&&CU.some(c=>c.slug===parts[2]))return {screen:'cups-card',slug:parts[2]};
    if(parts[0]==='library') {
      const p=Number(parts[1]||1);
      return {screen:'library',page:Number.isInteger(p)?Math.max(1,Math.min(4,p)):1};
    }
    if(parts[0]==='card') {
      const id=Number(parts[1]);
      if(Number.isInteger(id)&&id>=0&&id<22)return {screen:'card',id};
    }
    return {screen:'notfound'};
  }
  function updateNav(screen){
    navs.forEach(a=>{
      const active=a.dataset.routeNav === (screen==='card'?'library':screen==='cups-card'?'cups':screen);
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }
  function cover(){
    const c=C[0];
    return `<section class="page home">
      <div class="home-copy"><div class="eyebrow">THE FORBIDDEN ARCANA / 22 MAJOR ARCANA</div>
        <h1 class="title">禁忌之书<br>深渊塔罗</h1>
        <p class="sub">每一幅画都是通向古老故事的门。二十二张大阿卡纳，将洛夫克拉夫特神话、黑暗象征与塔罗解读联结在一起。一次只进入一个章节，不必将所有秘密同时摊开。</p>
        <div class="actions"><a class="btn" href="#/draw">开始抽牌 <span aria-hidden="true">↗</span></a><a class="btn outline" href="#/library/1">进入二十二张牌库 →</a></div>
        <p class="kicker" style="margin-top:34px">抽牌 · 原画 · 牌面故事 · 原著神话 · 正逆位解析</p>
      </div>
      <div class="home-visual">
        <a href="${urlCard(c.id)}" aria-label="阅读愚者牌的完整故事"><img src="${c.img}" fetchpriority="high" alt="愚者 · 高清克苏鲁塔罗牌"></a>
        <span class="art-caption">THE FOOL / 00 — 点击进入这张牌</span>
      </div>
    </section><div class="home-bottom"><a href="#/library/1">翻阅大阿卡纳档案 →</a><a href="#/draw">以单张、三张或每日牌阵抽取启示 →</a><a href="#/library/cups">小阿卡纳：圣杯14张已定稿 →</a><span>22 张大阿卡纳 · 圣杯组14张原画已收录</span></div>`;
  }
  function library(page){
    const start=(page-1)*6,end=Math.min(22,start+6);
    const items=C.slice(start,end).map(c=>{
      const d=D[c.id];
      return `<a href="${urlCard(c.id)}" class="library-card" aria-label="打开${clean(c.zh)}的专属故事页面">
        <img loading="lazy" src="${c.img}" alt="${clean(c.zh)} 高清原画">
        <div class="roman">${clean(c.roman)} / ${String(c.id).padStart(2,'0')}</div>
        <h2 class="card-title">${clean(c.zh)}</h2>
        <div class="caption">${clean(d.title)}</div>
      </a>`;
    }).join('');
    return `<section class="page library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span> 二十二道门</div>
      <div class="lib-heading"><div>${banner('THE GRIMOIRE / THE MAJOR ARCANA','二十二道禁忌之门','每张牌有独立的高清原画与完整故事。选择一张牌，进入它自己的篇章；也可以逐页阅读整套图鉴。')}</div>
      <div class="library-count">第 ${page} / 4 页 · 显示 ${start+1}—${end} / 共 22 张</div></div>
      <div class="library-panel"><div class="library-grid">${items}</div></div>
      <div class="paginator">
         ${page>1?`<a class="btn outline mini" href="#/library/${page-1}">← 上一页</a>`:'<button class="btn outline mini" disabled>← 上一页</button>'}
         <span class="page-number">${page} / 4</span>
         ${page<4?`<a class="btn outline mini" href="#/library/${page+1}">下一页 →</a>`:'<button class="btn outline mini" disabled>下一页 →</button>'}
      </div>
      <div style="margin-top:34px;border-top:1px solid var(--line);padding-top:25px">
        <a class="btn outline mini" href="#/library/cups">小阿卡纳专区：查看已定稿的圣杯国王 →</a>
      </div>
    </section>`;
  }
  function section(index,title,body,cl='') {
    return `<section class="chapter ${cl}"><div class="index">${index}</div><h2>${clean(title)}</h2><p>${clean(body)}</p></section>`;
  }
  function detail(id){
    const c=C[id],d=D[id];
    const p=C[(id+21)%22],n=C[(id+1)%22];
    return `<section class="page detail">
       <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/${Math.floor(id/6)+1}">牌库</a><span>/</span>${clean(c.zh)}</div>
       <div class="detail-layout">
         <div class="detail-art">
           <img src="${c.img}" fetchpriority="high" alt="${clean(c.zh)} 864 × 1536 高清塔罗原画">
           <a class="zoom" href="${c.img}" target="_blank" rel="noopener">查看完整高清原画 ↗</a>
         </div>
         <article class="detail-copy">
           <div class="eyebrow">MAJOR ARCANA / ${String(c.id).padStart(2,'0')} OF 21</div>
           <h1>${clean(c.zh)}</h1>
           <div class="subtitle">${clean(d.title)} · ${clean(c.en)}</div>
           <div class="character">神话意象 / ${clean(c.entity)}</div>
           ${section('01 / ORIGINAL STORY','牌面的故事',d.scene,'story')}
           ${section('02 / VISUAL STORYTELLING','画面在讲什么',d.visual)}
           <section class="chapter"><div class="index">03 / UPRIGHT</div><h2>正位 · 启示</h2><div class="keys">${c.up.map(clean).join(' · ')}</div><p class="focus">${clean(d.up)}</p></section>
           <section class="chapter"><div class="index">04 / REVERSED</div><h2>逆位 · 阴影</h2><div class="keys">${c.rev.map(clean).join(' · ')}</div><p class="focus rev">${clean(d.rev)}</p></section>
           ${section('05 / THE MYTHOS','原著神话与文学线索',d.canon)}
           <section class="chapter"><div class="index">06 / YOUR INTERPRETATION</div><h2>留给你的问题</h2><p class="question">${clean(d.q)}</p></section>
           <section class="chapter"><div class="index">LITERARY REFERENCE</div><h2>出处与创作界限</h2>
             <p class="foot">相关作品：${c.works.map(clean).join(' / ')}。上述「牌面的故事」为基于神话意象的原创艺术叙事，不能等同洛夫克拉夫特作品的原著情节。占卜解读仅供文化欣赏与个人反思。</p></section>
           <div class="detail-arrows"><a class="btn outline mini" href="${urlCard(p.id)}">← ${clean(p.zh)}</a><a class="btn outline mini" href="${urlCard(n.id)}">${clean(n.zh)} →</a></div>
         </article>
       </div>
     </section>`;
  }
  function cupsLibrary(page=1){
    const start=(page-1)*6, items=CU.slice(start,start+6);
    return `<section class="page library cups-library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/1">大阿卡纳牌库</a><span>/</span> 小阿卡纳 · 圣杯组</div>
      <div class="lib-heading"><div>
      ${banner('MINOR ARCANA / SUIT OF CUPS','圣杯组 · 高清正式牌库','圣杯14张原画均已收录，并提供独立故事与正逆位解读。圣杯五、圣杯六已按牌义修正杯数，14张均已正式入库。')}
      </div><div class="library-count">圣杯组14张已收录 · 14张通过 · 第 ${page} / 3 页</div></div>
      <div class="library-panel"><div class="library-grid cups-approved-grid">
        ${items.map(c=>`<a href="${urlCard(c.id)}" class="library-card cups-approved-card" aria-label="打开${clean(c.zh)}原画和完整解读">
          <img src="${c.thumb}" loading="lazy" alt="${clean(c.zh)}高清塔罗原画">
          <div class="roman">CUPS / ${clean(c.en)} · ${c.status==="approved"?"已定稿":"待修正"}</div>
          <h2 class="card-title">${clean(c.zh)}</h2><div class="caption">${clean(c.title)}</div>
        </a>`).join('')}
      </div></div>
      <div class="paginator">
       ${page>1?'<a class="btn outline mini" href="#/library/cups/1">← 上一页</a>':'<button class="btn outline mini" disabled>← 上一页</button>'}
       <span class="page-number">${page} / 3</span>
       ${page<3?`<a class="btn outline mini" href="#/library/cups/${page+1}">下一页 →</a>`:'<button class="btn outline mini" disabled>下一页 →</button>'}
      </div>
      <p class="lead">圣杯组14张正式入库。圣杯五已修正为三只倾倒、两只直立；圣杯六已补足第六只。抽牌现支持22张大阿卡纳或包含所有14张圣杯的36张。</p>
      <div class="actions"><a class="btn outline mini" href="#/draw">用已入库牌面抽牌 →</a><a class="btn outline mini" href="./minor-arcana/cups/" target="_blank" rel="noopener">查看圣杯制作台账 →</a></div>
    </section>`;
  }
  function cupsDetail(slug){
    const index=CU.findIndex(c=>c.slug===slug);
    if(index<0) return '<section class="page notfound"><h1>未找到该牌</h1></section>';
    const d=CU[index],prev=CU[(index+CU.length-1)%CU.length],next=CU[(index+1)%CU.length];
    return `<section class="page detail">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/cups/${Math.floor(index/6)+1}">圣杯正式牌库</a><span>/</span>${clean(d.zh)}</div>
      <div class="detail-layout">
        <div class="detail-art">
          <img src="${d.img}" fetchpriority="high" alt="${clean(d.zh)}941 × 1672已确认高清原画">
          <a class="zoom" target="_blank" rel="noopener" href="${d.img}">打开 941 × 1672 高清原画 ↗</a>
        </div>
        <article class="detail-copy">
          <div class="eyebrow">MINOR ARCANA / SUIT OF CUPS · ${d.status==="approved"?"正式定稿":"杯数待修正 · 暂不参与抽牌"}</div>
          <h1>${clean(d.zh)}</h1><div class="subtitle">${clean(d.title)} · ${clean(d.en)}</div>
          <div class="character">传统牌义 / ${clean(d.suitMeaning)}</div>
          ${section('01 / ORIGINAL NARRATIVE','牌面的故事',d.story,'story')}
          ${section('02 / VISUAL LANGUAGE','画面在讲什么',d.visual)}
          ${section('03 / UPRIGHT','正位 · 启示',d.up)}
          ${section('04 / REVERSED','逆位 · 阴影',d.rev)}
          ${section('05 / LITERARY ROOTS','原著背景与艺术改编',d.canon)}
          <section class="chapter"><div class="index">06 / REFLECTION</div><h2>留给你的问题</h2><p class="question">${clean(d.question)}</p></section>
          <section class="chapter"><div class="index">EDITORIAL NOTE</div><h2>来源说明</h2><p class="foot">卡面故事属于艺术化创作，不等同于洛夫克拉夫特原著情节。塔罗解读提供思考角度，不作为确定性预测。</p></section>
          <div class="detail-arrows"><a class="btn outline mini" href="${urlCard(prev.id)}">← ${clean(prev.zh)}</a><a class="btn outline mini" href="${urlCard(next.id)}">${clean(next.zh)} →</a></div>
        </article>
      </div>
    </section>`;
  }
  function seed32(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0;}
  function pickCards(n,daily){
    let random=Math.random;
    if(daily){let s=seed32(new Date().toLocaleDateString('en-CA'));random=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
    const pool=(drawPool==='major'?C:C.concat(CU.filter(c=>c.status==='approved'))).slice(),out=[];
    for(let i=0;i<n;i++){const j=Math.floor(random()*pool.length);out.push({c:pool.splice(j,1)[0],rev:random()<.3});}
    return out;
  }
  function drawScreen(){
    const modeOptions=[{n:1,d:false,title:'单张启示',desc:'一个问题，一个隐喻'},{n:3,d:false,title:'三张牌阵',desc:'过去 · 现在 · 未来'},{n:1,d:true,title:'每日之牌',desc:'当天固定的一次指引'}];
    return `<section class="page">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span> 命运占卜</div>
      <div class="draw-head">${banner('DIVINATION / THE CARDS SPEAK','命运的回响','选择一个牌阵，在心中默念问题。抽出的牌面将独立展示，并附上叙事、象征以及针对当前位置的详细解读。')}</div>
      <div class="draw-layout"><aside class="draw-controls">
         <div class="eyebrow">CHOOSE YOUR SPREAD</div><h2>选择仪式</h2>
         <div class="spread-select">${modeOptions.map(o=>`<button type="button" data-n="${o.n}" data-daily="${o.d?1:0}" class="${currentSpread===o.n&&isDaily===o.d?'active':''}">${o.title}<small style="display:block;margin-top:5px;opacity:.7">${o.desc}</small></button>`).join('')}</div>
         <label>抽取范围</label>
         <div class="spread-select pool-select" role="group" aria-label="抽牌范围">
           <button type="button" data-pool="all" class="${drawPool==='all'?'active':''}">全部已审核 · 36张<small style="display:block;margin-top:5px;opacity:.7">22张大阿卡纳 + 已定稿14张圣杯</small></button>
           <button type="button" data-pool="major" class="${drawPool==='major'?'active':''}">仅大阿卡纳 · 22张</button>
         </div>
         <label for="question">此刻的问题（可选）</label>
         <input id="question" placeholder="写下你想要思考的问题" maxlength="200" value="${clean(currentQuestion)}">
         <button type="button" class="btn" id="go-draw">揭示命运 ↗</button>
         <p class="note">正逆位将分别展开。每日之牌使用本地日期的固定结果。解读用于思考，不构成确定性的预测。</p>
       </aside><div class="reading-result ${drawResult?'':'empty'}" id="reading-result">
        ${drawResult?renderDrawResult():'<div class="sigil" aria-hidden="true">✧</div><div class="eyebrow">THE VEIL IS CLOSED</div><h2>故事尚未开始</h2><p>从左侧选择仪式，抽取第一张牌。</p>'}
       </div></div></section>`;
  }
  function renderDrawResult(){
    if(!drawResult)return '';
    const {cards,question,n,daily}=drawResult;
    const positions=n===3?['过去 · 来路','现在 · 当下','未来 · 趋势']:['此刻的启示'];
    return `<div class="eyebrow">${daily?'DAILY CARD':n===3?'THREE-CARD READING':'SINGLE-CARD READING'} / 命运已揭晓</div>
      <div class="draw-result-list ${n===1?'single':''}">
      ${cards.map(({c,rev},i)=>`<article class="drawn-card">
        <a href="${urlCard(c.id)}" aria-label="进入${clean(c.zh)}完整档案">
          <img loading="eager" src="${c.img}" alt="${clean(c.zh)}" style="${rev?'transform:rotate(180deg)':''}">
        </a><h3>${clean(c.zh)}</h3><p>${positions[i]} · ${rev?'逆位':'正位'}</p>
        <a class="detail-link" href="${urlCard(c.id)}">打开这张牌的完整故事 ↗</a></article>`).join('')}</div>
      <div class="reading-sections">
        ${question?'<p class="reading-section query">'+clean(question)+'</p>':''}
        ${cards.map(({c,rev},i)=>`<section class="reading-section">
          <div class="label">POSITION ${i+1} / ${rev?'REVERSED':'UPRIGHT'}</div>
          <h2>${clean(c.zh)} · ${clean((c.minor?c.title:D[c.id].title))}</h2>
          <p>${n===3?[
          '回看过去：这张牌提示你理解已经形成的经历与模式。',
          '观察现在：这张牌将注意力放在你此刻可以作出的选择。',
          '展望未来：这张牌提示一种值得注意的可能趋势，而非必然预言。'][i]:'请把这幅画看作一面象征性的镜子，重新理解你眼前的问题。'}</p>
          <p><strong>牌面故事：</strong>${clean((c.minor?c.story:D[c.id].scene))}</p>
          <p><strong>${rev?'逆位':'正位'}解读：</strong>${clean(rev?(c.minor?c.rev:D[c.id].rev):(c.minor?c.up:D[c.id].up))}</p>
          <p class="query"><strong>可进一步思考：</strong>${clean((c.minor?c.question:D[c.id].q))}</p>
          <a class="btn outline mini" href="${urlCard(c.id)}">阅读「${clean(c.zh)}」完整档案 →</a>
        </section>`).join('')}
      </div><p class="reading-disclaimer">塔罗是一种承载图像、文学与心理联想的自我反思媒介。请依据真实情况、可核实的信息与自己的判断作决定。</p>`;
  }
  function installDraw(){
    document.querySelectorAll('.spread-select button').forEach(button=>{
      button.onclick=()=>{
        currentSpread=Number(button.dataset.n);
        isDaily=button.dataset.daily==='1';
        document.querySelectorAll('.spread-select button').forEach(x=>x.classList.toggle('active',x===button));
      };
    });
    document.querySelectorAll('.pool-select button').forEach(button=>{
      button.onclick=()=>{
        drawPool=button.dataset.pool;
        document.querySelectorAll('.pool-select button').forEach(x=>x.classList.toggle('active',x===button));
      };
    });
    const input=document.getElementById('question');
    input.oninput=()=>currentQuestion=input.value;
    document.getElementById('go-draw').onclick=()=>{
      currentQuestion=input.value.trim();
      drawResult={cards:pickCards(currentSpread,isDaily),question:currentQuestion,n:currentSpread,daily:isDaily};
      const holder=document.querySelector('#reading-result');
      holder.classList.remove('empty');
      holder.innerHTML=renderDrawResult();
      if(matchMedia('(max-width:800px)').matches)holder.scrollIntoView({behavior:'smooth',block:'start'});
    };
  }
  function render(){
    const route=routeParts(), key=route.screen;
    updateNav(key);
    if(key==='home'){root.innerHTML=cover();document.title=docTitle;}
    else if(key==='library'){root.innerHTML=library(route.page);document.title='二十二张牌库 · '+docTitle;}
    else if(key==='card'){root.innerHTML=detail(route.id);document.title=C[route.id].zh+' · '+docTitle;}
    else if(key==='draw'){root.innerHTML=drawScreen();installDraw();document.title='命运占卜 · '+docTitle;}
    else if(key==='cups'){root.innerHTML=cupsLibrary(route.page);document.title='圣杯组 · 小阿卡纳 · '+docTitle;}
    else if(key==='cups-card'){root.innerHTML=cupsDetail(route.slug);document.title=CU.find(c=>c.slug===route.slug)?.zh+' · '+docTitle;}
    else{root.innerHTML='<section class="page notfound"><h1>没有找到这道门</h1><p>地址可能已过期，请返回首页。</p><a class="btn" href="#/home">返回首页 →</a></section>';document.title='页面不存在 · '+docTitle;}
    lastView=key;
    window.scrollTo({top:0,left:0,behavior:'instant'});
    root.focus({preventScroll:true});
  }
  window.addEventListener('hashchange',render);
  render();
  console.info('Forbidden Arcana V3: 22 major cards, 14 visible Cups images, 13 approved for random draws');
})();