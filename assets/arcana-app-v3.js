/* Forbidden Arcana V3 — true hash-routed screens, no single-page content wall.
   #/ home | #/draw | #/library/1 | #/card/0…21.
   Hash routes work with GitHub Pages direct refresh without 404. */
(()=>{
  'use strict';
  const C=window.ARCANA_CATALOG,D=window.ARCANA_DEPTH,CU=window.CUPS_APPROVED,W=window.WANDS_APPROVED,S=window.SWORDS_APPROVED,P=window.PENTACLES_APPROVED,ED=window.ARCANA_EDITORIAL||{},J=window.TAROT_JOURNAL,R=window.ARCANA_READING_V2,G=window.ARCANA_JOURNEYS||{};
  const root=document.querySelector('#app');
  // The approved Minor Arcana artwork is a separate suit entry; do not silently
  // mix a single minor card into the original 22-card Major Arcana draw.
  if(!J||!R||!R.applied||Object.keys(G).length!==4||!Array.isArray(C)||!Array.isArray(D)||!Array.isArray(CU)||C.length!==22||D.length!==22||CU.length!==14||!Array.isArray(W)||(W.length<1||W.length>14)||!Array.isArray(S)||(S.length<1||S.length>14)||!Array.isArray(P)||(P.length<1||P.length>14)||!root) {
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
    if(parts[0]==='history'&&parts[1])return {screen:'history-detail',id:parts.slice(1).join('/')};
    if(parts[0]==='history')return {screen:'history'};
    if(parts[0]==='explore')return {screen:'explore'};
    if(parts[0]==='story'&&G[parts[1]])return {screen:'story',suit:parts[1]};
    if(parts[0]==='library'&&parts[1]==='cups')return {screen:'cups',page:Math.max(1,Math.min(3,Number(parts[2]||1)||1))};
    if(parts[0]==='cups')return {screen:'cups'};
    if(parts[0]==='library'&&parts[1]==='wands')return {screen:'wands'};
    if(parts[0]==='wands')return {screen:'wands'};
    if(parts[0]==='library'&&parts[1]==='pentacles')return {screen:'pentacles'};
    if(parts[0]==='pentacles')return {screen:'pentacles'};
    if(parts[0]==='card'&&parts[1]==='pentacles'&&P.some(c=>c.slug===parts[2]))return {screen:'pentacles-card',slug:parts[2]};
    if(parts[0]==='library'&&parts[1]==='swords')return {screen:'swords'};
    if(parts[0]==='swords')return {screen:'swords'};
    if(parts[0]==='card'&&parts[1]==='swords'&&S.some(c=>c.slug===parts[2]))return {screen:'swords-card',slug:parts[2]};
    if(parts[0]==='card'&&parts[1]==='wands'&&W.some(c=>c.slug===parts[2]))return {screen:'wands-card',slug:parts[2]};
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
      const key=a.dataset.routeNav;
      const active=key==='library' && ['library','cups','wands','swords','pentacles','cups-card','wands-card','swords-card','pentacles-card','card','explore','story'].includes(screen)
        ||key==='history'&&['history','history-detail'].includes(screen)
        ||key===screen;
      a.classList.toggle('active',active);
      if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
    });
  }
  function cover(){
    const c=C[0];
    return `<section class="page home">
      <div class="home-copy"><div class="eyebrow">THE FORBIDDEN ARCANA / COMPLETE 78-CARD DECK</div>
        <h1 class="title">禁忌之书<br>深渊塔罗</h1>
        <p class="sub">七十八张原画，五组牌面，贯穿洛夫克拉夫特世界的禁忌故事。你可以在完整图鉴中探索它们，也可以从一次抽牌开始，把自己的思考留在命运档案。</p>
        <div class="actions"><a class="btn" href="#/draw">开始抽牌 <span aria-hidden="true">↗</span></a><a class="btn outline" href="#/explore">探索78张全牌图鉴 →</a></div>
        <p class="kicker" style="margin-top:34px">78张完整牌组 · 原著故事 · 正逆位 · 命运档案 · 个人收藏</p><p class="home-recent">你的命运档案已保存 ${J.count()} 次抽牌。<a href="#/history">打开记录 →</a></p>
      </div>
      <div class="home-visual">
        <a href="${urlCard(c.id)}" aria-label="阅读愚者牌的完整故事"><img src="${c.img}" fetchpriority="high" alt="愚者 · 高清克苏鲁塔罗牌"></a>
        <span class="art-caption">THE FOOL / 00 — 点击进入这张牌</span>
      </div>
    </section><div class="home-bottom"><a href="#/library/1">翻阅大阿卡纳档案 →</a><a href="#/draw">以单张、三张或每日牌阵抽取启示 →</a><a href="#/library/cups">圣杯十四张牌 →</a><a href="#/library/wands">权杖组：已收录${W.length}张 →</a><a href="#/library/swords">宝剑组：已收录${S.length}张 →</a><a href="#/library/pentacles">星币组：已收录${P.length}张 →</a><span>22 张大阿卡纳 · 14 张圣杯 · ${W.length} 张权杖 · ${S.length} 张宝剑 · ${P.length} 张星币</span></div>
    <section class="home-novellas"><h2>四部禁忌故事 · 从原著进入牌面</h2>
    <div class="home-novella-links">${Object.entries(G).map(([suit,j])=>'<a href="#/story/'+suit+'">'+clean(j.name)+' · '+clean(j.work)+'<span>'+clean(j.tagline)+' →</span></a>').join('')}</div></section>`;
  }
  function library(page){
    const start=0,end=C.length;
    const items=C.slice(start,end).map(c=>{
      const d=D[c.id];
      return `<a href="${urlCard(c.id)}" class="library-card" aria-label="打开${clean(c.zh)}的专属故事页面">
        <img loading="lazy" src="${c.thumb||c.img}" decoding="async" alt="${clean(c.zh)} 高清原画缩略图">
        <div class="roman">${clean(c.roman)} / ${String(c.id).padStart(2,'0')}</div>
        <h2 class="card-title">${clean(c.zh)}</h2>
        <div class="caption">${clean(d.title)}</div>
      </a>`;
    }).join('');
    return `<section class="page library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span> 二十二道门</div>
      <div class="lib-heading"><div>${banner('THE GRIMOIRE / THE MAJOR ARCANA','二十二道禁忌之门','每张牌有独立高清原画与完整故事。22张连续排在同一页，点击牌面进入更深入的独立解读。')}</div>
      <div class="library-count">全部 22 张 · 一页浏览</div></div>
      <div class="library-panel"><div class="library-grid">${items}</div></div>
      <div style="margin-top:34px;border-top:1px solid var(--line);padding-top:25px">
        <a class="btn outline mini" href="#/library/cups">继续探索：十四张圣杯 · 《印斯茅斯之影》 →</a>
      </div>
    </section>`;
  }
  function quickView(id){
    const q=R.quick(id);
    return '<section class="quick-read" aria-label="30秒速读"><div class="eyebrow">AT A GLANCE / 30秒读懂</div>'+
      '<h2>这张牌在说什么？</h2><p><strong>故事：</strong>'+clean(q.story)+'</p>'+
      '<p><strong>正位：</strong>'+clean(q.focus)+'</p><p><strong>逆位：</strong>'+clean(q.shadow)+'</p>'+
      '<button type="button" class="quick-jump" data-read-detail>进入完整故事 ↓</button></section>';
  }
  function novella(suit){
    const j=G[suit],group=({cups:CU,wands:W,swords:S,pentacles:P})[suit];
    if(!j||!group)return '<section class="page notfound"><h1>未找到这部作品</h1></section>';
    return '<section class="page novella"><div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/explore">78张图鉴</a><span>/</span>'+clean(j.name)+'的故事</div>'+
      '<div class="eyebrow">NOVELLA READING / '+clean(j.english)+'</div><h1 class="title">'+clean(j.tagline)+'</h1>'+
      '<p class="novella-work">'+clean(j.name)+' · '+clean(j.work)+' · 14张牌的艺术改编阅读路径</p>'+
      '<div class="novella-intro">'+j.intro.map(x=>'<p>'+clean(x)+'</p>').join('')+'</div>'+
      '<div class="novella-chapters">'+j.chapters.map((ch,i)=>'<section class="novella-chapter"><div class="eyebrow">CHAPTER '+String(i+1).padStart(2,'0')+' / 05</div>'+
        '<h2>'+clean(ch.title)+'</h2><h3>'+clean(ch.subtitle)+'</h3><p>'+clean(ch.text)+'</p>'+
        '<div class="novella-strip">'+ch.slugs.map(slug=>{const c=group.find(x=>x.slug===slug);return c?'<a href="'+urlCard(c.id)+'"><img loading="lazy" src="'+clean(c.thumb||c.img)+'" alt="'+clean(c.zh)+'"><span>'+clean(c.zh)+'</span></a>':'';}).join('')+'</div></section>').join('')+'</div>'+
      '<p class="novella-caveat">章节是本套塔罗设计的阅读顺序，不是小说原有章节或事件的完整时间表。卡面中的器物与部分场面属于原创视觉转译。</p>'+
      '<a class="btn outline" href="#/library/'+clean(suit)+'">返回'+clean(j.name)+'完整牌库 →</a></section>';
  }
  function section(index,title,body,cl='') {
    return `<section class="chapter ${cl}"><div class="index">${index}</div><h2>${clean(title)}</h2>${String(body||'').split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+clean(p)+'</p>').join('')}</section>`;
  }
  function extraSections(key){
    const x=ED[String(key)];
    if(!x||!x.insight||!x.practice)return '';
    return section('06 / CLOSE READING','深读 · 故事的暗线',x.insight)+section('07 / PRACTICAL READING','回到现实 · 如何理解这张牌',x.practice);
  }
  function detail(id){
    const c=C[id],d=D[id];
    const p=C[(id+21)%22],n=C[(id+1)%22];
    return `<section class="page detail">
       <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/1">牌库</a><span>/</span>${clean(c.zh)}</div>
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
           ${quickView(c.id)}
           ${section('01 / ORIGINAL STORY','牌面的故事',d.scene,'story')}
           ${section('02 / VISUAL STORYTELLING','画面在讲什么',d.visual)}
           <section class="chapter"><div class="index">03 / UPRIGHT</div><h2>正位 · 启示</h2><div class="keys">${c.up.map(clean).join(' · ')}</div><p class="focus">${clean(d.up)}</p></section>
           <section class="chapter"><div class="index">04 / REVERSED</div><h2>逆位 · 阴影</h2><div class="keys">${c.rev.map(clean).join(' · ')}</div><p class="focus rev">${clean(d.rev)}</p></section>
           ${section('05 / THE MYTHOS','原著神话与文学线索',d.canon)}
           ${extraSections(String(c.id))}
           <section class="chapter"><div class="index">08 / YOUR INTERPRETATION</div><h2>留给你的问题</h2><p class="question">${clean(d.q)}</p></section>
           <section class="chapter"><div class="index">LITERARY REFERENCE</div><h2>出处与创作界限</h2>
             <details class="source-disclosure"><summary>展开出处与创作界限</summary><p class="foot">相关作品：${c.works.map(clean).join(' / ')}。上述「牌面的故事」为基于神话意象的原创艺术叙事，不能等同洛夫克拉夫特作品的原著情节。占卜解读仅供文化欣赏与个人反思。</p></details></section>
           <div class="detail-arrows"><a class="btn outline mini" href="${urlCard(p.id)}">← ${clean(p.zh)}</a><a class="btn outline mini" href="${urlCard(n.id)}">${clean(n.zh)} →</a></div>
         </article>
       </div>
     </section>`;
  }
  function cupsLibrary(page=1){
    const start=0, end=CU.length, items=CU;
    return `<section class="page library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span>圣杯组</div>
      <div class="lib-heading">
        <div>${banner('THE GRIMOIRE / SUIT OF CUPS','圣杯 · 十四张牌','十四幅独立原画。选择一张进入它的故事，阅读画面解析、原著线索与正逆位解读。')}</div>
        <div class="library-count">全部 14 张 · 一页浏览</div>
      </div>
      <div class="novella-entry"><div><span class="eyebrow">READ THE STORY</span><p>沿着五个章节阅读这一组14张牌的完整叙事脉络。</p></div><a class="btn outline mini" href="#/story/cups">阅读《印斯茅斯的阴影》 →</a></div>
      <div class="library-panel"><div class="library-grid">
       ${items.map(c=>`<a href="${urlCard(c.id)}" class="library-card" aria-label="打开${clean(c.zh)}的完整故事">
           <img src="${c.thumb||c.img}" loading="lazy" decoding="async" alt="${clean(c.zh)}高清原画">
           <div class="roman">${clean(c.en)}</div>
           <h2 class="card-title">${clean(c.zh)}</h2>
           <div class="caption">${clean(c.title)}</div>
         </a>`).join('')}
      </div></div>
    </section>`;
  }
  function cupsDetail(slug){
    const index=CU.findIndex(c=>c.slug===slug);
    if(index<0) return '<section class="page notfound"><h1>未找到该牌</h1></section>';
    const d=CU[index],prev=CU[(index+CU.length-1)%CU.length],next=CU[(index+1)%CU.length];
    return `<section class="page detail">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/cups">圣杯正式牌库</a><span>/</span>${clean(d.zh)}</div>
      <div class="detail-layout">
        <div class="detail-art">
          <img src="${d.img}" fetchpriority="high" alt="${clean(d.zh)} 高清原画">
          <a class="zoom" target="_blank" rel="noopener" href="${d.img}">单独查看高清原画 ↗</a>
        </div>
        <article class="detail-copy">
          <div class="eyebrow">MINOR ARCANA / SUIT OF CUPS · ${clean(d.en)}</div>
          <h1>${clean(d.zh)}</h1><div class="subtitle">${clean(d.title)} · ${clean(d.en)}</div>
          <div class="character">象征主题 / ${clean(d.suitMeaning)}</div>
          ${quickView(d.id)}
          <a class="novella-bridge" href="#/story/cups">在《印斯茅斯的阴影》故事线中阅读本牌 →</a>
          ${section('01 / ORIGINAL NARRATIVE','牌面的故事',d.story,'story')}
          ${section('02 / VISUAL LANGUAGE','画面在讲什么',d.visual)}
          ${section('03 / UPRIGHT','正位 · 启示',d.up)}
          ${section('04 / REVERSED','逆位 · 阴影',d.rev)}
          ${section('05 / LITERARY ROOTS','原著背景与艺术改编',d.canon)}
          ${extraSections(d.id)}
          <section class="chapter"><div class="index">08 / REFLECTION</div><h2>留给你的问题</h2><p class="question">${clean(d.question)}</p></section>
          <section class="chapter"><div class="index">EDITORIAL NOTE</div><h2>来源说明</h2><details class="source-disclosure"><summary>展开创作界限说明</summary><p class="foot">卡面故事属于艺术化创作，不等同于洛夫克拉夫特原著情节。塔罗解读提供思考角度，不作为确定性预测。</p></details></section>
          <div class="detail-arrows"><a class="btn outline mini" href="${urlCard(prev.id)}">← ${clean(prev.zh)}</a><a class="btn outline mini" href="${urlCard(next.id)}">${clean(next.zh)} →</a></div>
        </article>
      </div>
    </section>`;
  }
  function wandsLibrary(){
    return `<section class="page library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span>权杖组</div>
      <div class="lib-heading">
        <div>${banner('THE GRIMOIRE / SUIT OF WANDS','权杖 · 火与意志','权杖组以火焰、行动和面对未知的决心为主题。选择牌面进入独立故事，查看高清原画与正逆位解读。')}</div>
        <div class="library-count">显示 ${W.length} 张 / 共 14 张</div>
      </div>
      <div class="novella-entry"><div><span class="eyebrow">READ THE STORY</span><p>沿着五个章节阅读这一组14张牌的完整叙事脉络。</p></div><a class="btn outline mini" href="#/story/wands">阅读《敦威治恐怖事件》 →</a></div>
      <div class="library-panel"><div class="library-grid">
        ${W.map(c=>`<a href="${urlCard(c.id)}" class="library-card" aria-label="阅读${clean(c.zh)}的完整故事">
          <img loading="lazy" decoding="async" src="${c.thumb||c.img}" alt="${clean(c.zh)}高清塔罗原画">
          <div class="roman">${clean(c.en)}</div>
          <h2 class="card-title">${clean(c.zh)}</h2>
          <div class="caption">${clean(c.title)}</div>
        </a>`).join('')}
      </div></div>
    </section>`;
  }
  function wandsDetail(slug){
    const c=W.find(x=>x.slug===slug);
    if(!c)return '<section class="page notfound"><h1>没有找到这张牌</h1></section>';
    return `<section class="page detail">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/wands">权杖组</a><span>/</span>${clean(c.zh)}</div>
      <div class="detail-layout">
        <div class="detail-art">
          <img src="${c.img}" fetchpriority="high" alt="${clean(c.zh)}高清原画">
          <a class="zoom" target="_blank" rel="noopener" href="${c.img}">单独查看高清原画 ↗</a>
        </div>
        <article class="detail-copy">
          <div class="eyebrow">MINOR ARCANA / SUIT OF WANDS · ${clean(c.en)}</div>
          <h1>${clean(c.zh)}</h1><div class="subtitle">${clean(c.title)} · ${clean(c.en)}</div>
          <div class="character">象征主题 / ${clean(c.suitMeaning)}</div>
          ${quickView(c.id)}
          <a class="novella-bridge" href="#/story/wands">在《敦威治恐怖事件》故事线中阅读本牌 →</a>
          ${section('01 / ORIGINAL NARRATIVE','牌面的故事',c.story,'story')}
          ${section('02 / VISUAL LANGUAGE','画面在讲什么',c.visual)}
          ${section('03 / UPRIGHT','正位 · 启示',c.up)}
          ${section('04 / REVERSED','逆位 · 阴影',c.rev)}
          ${section('05 / LITERARY ROOTS','原著背景与艺术改编',c.canon)}
          ${extraSections(c.id)}
          <section class="chapter"><div class="index">08 / REFLECTION</div><h2>留给你的问题</h2><p class="question">${clean(c.question)}</p></section>
          <section class="chapter"><div class="index">EDITORIAL NOTE</div><h2>来源说明</h2><details class="source-disclosure"><summary>展开创作界限说明</summary><p class="foot">洛夫克拉夫特神话与传统塔罗牌义的原创融合。画面不是小说原文情节，解读仅用于文化欣赏与个人反思。</p></details></section>
          <div class="detail-arrows"><a class="btn outline mini" href="#/library/wands">← 返回权杖组</a><a class="btn outline mini" href="#/library/1">大阿卡纳 →</a></div>
        </article>
      </div>
    </section>`;
  }
  function swordsLibrary(){
    return `<section class="page library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span>宝剑组</div>
      <div class="lib-heading">
        <div>${banner('THE GRIMOIRE / SUIT OF SWORDS','宝剑 · 风与理性','宝剑组以《疯狂山脉》中理性的探索、极地考察与认知边界为主题。选择牌面进入独立故事，查看高清原画与正逆位解读。')}</div>
        <div class="library-count">显示 ${S.length} 张 / 共 14 张</div>
      </div>
      <div class="novella-entry"><div><span class="eyebrow">READ THE STORY</span><p>沿着五个章节阅读这一组14张牌的完整叙事脉络。</p></div><a class="btn outline mini" href="#/story/swords">阅读《疯狂山脉》 →</a></div>
      <div class="library-panel"><div class="library-grid">
        ${S.map(c=>`<a href="${urlCard(c.id)}" class="library-card" aria-label="阅读${clean(c.zh)}的完整故事">
          <img loading="lazy" decoding="async" src="${c.thumb||c.img}" alt="${clean(c.zh)}高清塔罗原画">
          <div class="roman">${clean(c.en)}</div>
          <h2 class="card-title">${clean(c.zh)}</h2>
          <div class="caption">${clean(c.title)}</div>
        </a>`).join('')}
      </div></div>
    </section>`;
  }
  function swordsDetail(slug){
    const c=S.find(x=>x.slug===slug);
    if(!c)return '<section class="page notfound"><h1>没有找到这张牌</h1></section>';
    return `<section class="page detail">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/swords">宝剑组</a><span>/</span>${clean(c.zh)}</div>
      <div class="detail-layout">
        <div class="detail-art">
          <img src="${c.img}" fetchpriority="high" alt="${clean(c.zh)}高清原画">
          <a class="zoom" target="_blank" rel="noopener" href="${c.img}">单独查看高清原画 ↗</a>
        </div>
        <article class="detail-copy">
          <div class="eyebrow">MINOR ARCANA / SUIT OF SWORDS · ${clean(c.en)}</div>
          <h1>${clean(c.zh)}</h1><div class="subtitle">${clean(c.title)} · ${clean(c.en)}</div>
          <div class="character">象征主题 / ${clean(c.suitMeaning)}</div>
          ${quickView(c.id)}
          <a class="novella-bridge" href="#/story/swords">在《疯狂山脉》故事线中阅读本牌 →</a>
          ${section('01 / ORIGINAL NARRATIVE','牌面的故事',c.story,'story')}
          ${section('02 / VISUAL LANGUAGE','画面在讲什么',c.visual)}
          ${section('03 / UPRIGHT','正位 · 启示',c.up)}
          ${section('04 / REVERSED','逆位 · 阴影',c.rev)}
          ${section('05 / LITERARY ROOTS','原著背景与艺术改编',c.canon)}
          ${extraSections(c.id)}
          <section class="chapter"><div class="index">08 / REFLECTION</div><h2>留给你的问题</h2><p class="question">${clean(c.question)}</p></section>
          <section class="chapter"><div class="index">EDITORIAL NOTE</div><h2>来源说明</h2><details class="source-disclosure"><summary>展开创作界限说明</summary><p class="foot">洛夫克拉夫特神话与传统塔罗牌义的原创融合。画面不是小说原文情节，解读仅用于文化欣赏与个人反思。</p></details></section>
          <div class="detail-arrows"><a class="btn outline mini" href="#/library/swords">← 返回宝剑组</a><a class="btn outline mini" href="#/library/1">大阿卡纳 →</a></div>
        </article>
      </div>
    </section>`;
  }
  function pentaclesLibrary(){
    return `<section class="page library">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span>星币组</div>
      <div class="lib-heading">
        <div>${banner('THE GRIMOIRE / SUIT OF PENTACLES','星币 · 土与生命','星币组以《星之彩》中的加德纳农场为舞台，记录日常生活被未知色彩逐渐侵蚀的过程。选择牌面进入独立故事，查看高清原画与正逆位解读。')}</div>
        <div class="library-count">显示 ${P.length} 张 / 共 14 张</div>
      </div>
      <div class="novella-entry"><div><span class="eyebrow">READ THE STORY</span><p>沿着五个章节阅读这一组14张牌的完整叙事脉络。</p></div><a class="btn outline mini" href="#/story/pentacles">阅读《星之彩》 →</a></div>
      <div class="library-panel"><div class="library-grid">
        ${P.map(c=>`<a href="${urlCard(c.id)}" class="library-card" aria-label="阅读${clean(c.zh)}的完整故事">
          <img loading="lazy" decoding="async" src="${c.thumb||c.img}" alt="${clean(c.zh)}高清塔罗原画">
          <div class="roman">${clean(c.en)}</div>
          <h2 class="card-title">${clean(c.zh)}</h2>
          <div class="caption">${clean(c.title)}</div>
        </a>`).join('')}
      </div></div>
    </section>`;
  }
  function pentaclesDetail(slug){
    const c=P.find(x=>x.slug===slug);
    if(!c)return '<section class="page notfound"><h1>没有找到这张牌</h1></section>';
    return `<section class="page detail">
      <div class="crumbs"><a href="#/home">首页</a><span>/</span><a href="#/library/pentacles">星币组</a><span>/</span>${clean(c.zh)}</div>
      <div class="detail-layout">
        <div class="detail-art">
          <img src="${c.img}" fetchpriority="high" alt="${clean(c.zh)}高清原画">
          <a class="zoom" target="_blank" rel="noopener" href="${c.img}">单独查看高清原画 ↗</a>
        </div>
        <article class="detail-copy">
          <div class="eyebrow">MINOR ARCANA / SUIT OF PENTACLES · ${clean(c.en)}</div>
          <h1>${clean(c.zh)}</h1><div class="subtitle">${clean(c.title)} · ${clean(c.en)}</div>
          <div class="character">象征主题 / ${clean(c.suitMeaning)}</div>
          ${quickView(c.id)}
          <a class="novella-bridge" href="#/story/pentacles">在《星之彩》故事线中阅读本牌 →</a>
          ${section('01 / ORIGINAL NARRATIVE','牌面的故事',c.story,'story')}
          ${section('02 / VISUAL LANGUAGE','画面在讲什么',c.visual)}
          ${section('03 / UPRIGHT','正位 · 启示',c.up)}
          ${section('04 / REVERSED','逆位 · 阴影',c.rev)}
          ${section('05 / LITERARY ROOTS','原著背景与艺术改编',c.canon)}
          ${extraSections(c.id)}
          <section class="chapter"><div class="index">08 / REFLECTION</div><h2>留给你的问题</h2><p class="question">${clean(c.question)}</p></section>
          <section class="chapter"><div class="index">EDITORIAL NOTE</div><h2>来源说明</h2><details class="source-disclosure"><summary>展开创作界限说明</summary><p class="foot">洛夫克拉夫特神话与传统塔罗牌义的原创融合。画面不是小说原文情节，解读仅用于文化欣赏与个人反思。</p></details></section>
          <div class="detail-arrows"><a class="btn outline mini" href="#/library/pentacles">← 返回星币组</a><a class="btn outline mini" href="#/library/1">大阿卡纳 →</a></div>
        </article>
      </div>
    </section>`;
  }
  function seed32(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0;}
  function pickCards(n,daily){
    let random=Math.random;
    if(daily){let s=seed32(new Date().toLocaleDateString('en-CA'));random=()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
    const pool=(drawPool==='major'?C:C.concat(CU.filter(c=>c.status==='approved'),W.filter(c=>c.status==='approved'),S.filter(c=>c.status==='approved'),P.filter(c=>c.status==='approved'))).slice(),out=[];
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
           <button type="button" data-pool="all" class="${drawPool==='all'?'active':''}">全部已收录 · ${C.length+CU.filter(c=>c.status==='approved').length+W.filter(c=>c.status==='approved').length+S.filter(c=>c.status==='approved').length+P.filter(c=>c.status==='approved').length}张<small style="display:block;margin-top:5px;opacity:.7">22张大阿卡纳 + 14张圣杯 + ${W.filter(c=>c.status==='approved').length}张权杖 + ${S.filter(c=>c.status==='approved').length}张宝剑 + ${P.filter(c=>c.status==='approved').length}张星币</small></button>
           <button type="button" data-pool="major" class="${drawPool==='major'?'active':''}">仅大阿卡纳 · 22张</button>
         </div>
         <label for="question">此刻的问题（可选）</label>
         <input id="question" placeholder="写下你想要思考的问题" maxlength="200" value="${clean(currentQuestion)}">
         <button type="button" class="btn" id="go-draw">揭示命运 ↗</button>
         <p class="note">正逆位将分别展开。每日之牌使用本地日期的固定结果。解读用于思考，不构成确定性的预测。</p>
         <p class="archive-hint"><a href="#/history">查看历史记录（${J.count()}条） →</a> · 本地私密保存，可导出备份。</p>
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
      </div>${n===3?'<section class="reading-synthesis"><div class="eyebrow">THREE CARD RELATIONSHIP / NOT AI</div><h2>三张牌的关系 · 整体解读</h2>'+clean(drawResult.synthesis||R.synthesis(cards)).split(/\\n\\n|\n\n/).map(p=>'<p>'+p+'</p>').join('')+'<p class="synthesis-disclaimer">这段解读仅依据抽到的牌、正逆位和位置，按固定规则组织；不会理解或分析你输入的问题，也不是未来预测。</p></section>':''}<div class="draw-save-actions"><button type="button" id="draw-copy">复制牌阵摘要</button><button type="button" id="draw-image">导出牌阵图片</button><a href="#/history/${drawResult.historyId}">查看本次档案 →</a></div><p class="reading-save-status" role="status">${drawResult.saved?'已记录到此浏览器的命运档案':'本地保存失败，请检查浏览器存储设置。'}</p><p class="reading-disclaimer">塔罗是一种承载图像、文学与心理联想的自我反思媒介。请依据真实情况、可核实的信息与自己的判断作决定。</p>`;
  }
  function installDrawResultActions(){
    if(!drawResult || !drawResult.historyId)return;
    const r=J.getRecord(drawResult.historyId);if(!r)return;
    document.querySelector('#draw-copy')?.addEventListener('click',()=>J.copySummary(r));
    document.querySelector('#draw-image')?.addEventListener('click',()=>J.exportCardImage(r));
  }
  function installDraw(){
    document.querySelectorAll('.spread-select:not(.pool-select) button').forEach(button=>{
      button.onclick=()=>{
        currentSpread=Number(button.dataset.n);
        isDaily=button.dataset.daily==='1';
        document.querySelectorAll('.spread-select:not(.pool-select) button').forEach(x=>x.classList.toggle('active',x===button));
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
      drawResult={cards:pickCards(currentSpread,isDaily),question:currentQuestion,n:currentSpread,daily:isDaily,pool:drawPool};
      drawResult.synthesis=drawResult.n===3?R.synthesis(drawResult.cards):'';
      const saved=J.addReading(drawResult);
      drawResult.historyId=saved.record.id;drawResult.saved=saved.saved;
      const holder=document.querySelector('#reading-result');
      holder.classList.remove('empty');
      holder.innerHTML=renderDrawResult();
      installDrawResultActions();
      if(matchMedia('(max-width:800px)').matches)holder.scrollIntoView({behavior:'smooth',block:'start'});
    };
    installDrawResultActions();
  }
  function render(){
    const route=routeParts(), key=route.screen;
    updateNav(key);
    if(key==='home'){root.innerHTML=cover();document.title=docTitle;}
    else if(key==='library'){root.innerHTML=library(route.page);document.title='二十二张牌库 · '+docTitle;}
    else if(key==='card'){root.innerHTML=detail(route.id);document.title=C[route.id].zh+' · '+docTitle;}
    else if(key==='draw'){root.innerHTML=drawScreen();installDraw();document.title='命运占卜 · '+docTitle;}
    else if(key==='history'){root.innerHTML=J.renderHistory();J.installHistory();document.title='命运档案 · '+docTitle;}
    else if(key==='history-detail'){root.innerHTML=J.renderRecord(route.id);J.installRecord(route.id);document.title='历史记录 · '+docTitle;}
    else if(key==='explore'){root.innerHTML=J.renderExplore();J.installExplore();document.title='78张全牌图鉴 · '+docTitle;}
    else if(key==='story'){root.innerHTML=novella(route.suit);document.title=G[route.suit].name+' · 原著故事导读 · '+docTitle;}
    else if(key==='cups'){root.innerHTML=cupsLibrary(route.page);document.title='圣杯组 · 小阿卡纳 · '+docTitle;}
    else if(key==='cups-card'){root.innerHTML=cupsDetail(route.slug);document.title=CU.find(c=>c.slug===route.slug)?.zh+' · '+docTitle;}
    else if(key==='wands'){root.innerHTML=wandsLibrary();document.title='权杖组 · 小阿卡纳 · '+docTitle;}
    else if(key==='wands-card'){root.innerHTML=wandsDetail(route.slug);document.title=(W.find(c=>c.slug===route.slug)?.zh||'权杖组')+' · '+docTitle;}
    else if(key==='swords'){root.innerHTML=swordsLibrary();document.title='宝剑组 · 小阿卡纳 · '+docTitle;}
    else if(key==='swords-card'){root.innerHTML=swordsDetail(route.slug);document.title=(S.find(c=>c.slug===route.slug)?.zh||'宝剑组')+' · '+docTitle;}
    else if(key==='pentacles'){root.innerHTML=pentaclesLibrary();document.title='星币组 · 小阿卡纳 · '+docTitle;}
    else if(key==='pentacles-card'){root.innerHTML=pentaclesDetail(route.slug);document.title=(P.find(c=>c.slug===route.slug)?.zh||'星币组')+' · '+docTitle;}
    else{root.innerHTML='<section class="page notfound"><h1>没有找到这道门</h1><p>地址可能已过期，请返回首页。</p><a class="btn" href="#/home">返回首页 →</a></section>';document.title='页面不存在 · '+docTitle;}
    if(['card','cups-card','wands-card','swords-card','pentacles-card'].includes(key))J.installDetailFavorite();
    root.querySelectorAll('[data-read-detail]').forEach(b=>b.addEventListener('click',()=>root.querySelector('.chapter.story')?.scrollIntoView({behavior:'smooth',block:'start'})));
    lastView=key;
    window.scrollTo({top:0,left:0,behavior:'instant'});
    root.focus({preventScroll:true});
  }
  window.addEventListener('hashchange',render);
  render();
  console.info('Forbidden Arcana: Major Arcana 22 + Cups 14 + Wands '+W.length+' + Swords '+S.length+' + Pentacles '+P.length+', unified collection and interpretation');
})();