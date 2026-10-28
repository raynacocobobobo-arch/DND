/* Static literary reading engine v2. No AI, no external API and no personal data transmission. */
(function(){
  'use strict';
  const L=window.ARCANA_LITERARY_V2, D=window.ARCANA_DEPTH, C=window.ARCANA_CATALOG;
  const groups=[window.CUPS_APPROVED,window.WANDS_APPROVED,window.SWORDS_APPROVED,window.PENTACLES_APPROVED];
  if(!L||!Array.isArray(D)||!Array.isArray(C)||groups.some(x=>!Array.isArray(x)))return;
  const cards=[...C,...groups.flat()];
  const byId=id=>cards.find(x=>String(x.id)===String(id));
  const suit=id=>String(id).includes('/')?String(id).split('/')[0]:'major';
  const names={major:'命运与身份',cups:'情感与归属',wands:'行动与意志',swords:'理性与判断',pentacles:'劳动与资源'};
  const opening=str=>{const v=String(str||'').trim();const p=v.indexOf('。');return p>=0?v.slice(0,p+1):v.slice(0,70);};
  for(const c of cards){
    const id=String(c.id),patch=L.patches[id],beat=L.beats[id];
    if(patch)Object.assign(c,patch);
    if(!beat)continue;
    if(suit(id)==='major'){
      const d=D[Number(id)];
      if(d&&!d.scene.includes(beat))d.scene+='\n\n'+beat;
    }else{
      if(!c.story.includes(beat))c.story+='\n\n'+beat;
      if(L.reverseExtra[id]&&!c.rev.includes(L.reverseExtra[id]))c.rev+='\n\n'+L.reverseExtra[id];
    }
  }
  function spec(card,rev){
    if(!card)return {title:'未知之牌',positive:'需要更多信息。',negative:'保留判断。',theme:'未知'};
    const id=String(card.id);
    const minor=suit(id)!=='major';
    const d=minor?card:D[Number(id)]||{};
    return {title:card.zh,chapter:d.title||card.zh,theme:minor?card.suitMeaning:(card.up||[]).join('、'),
      story:d.story||d.scene||'',positive:d.up||'',negative:d.rev||'',
      state:rev?'逆位':'正位',focus:opening(rev?d.rev:d.up),type:suit(id)};
  }
  function quick(id){
    const c=byId(id),p=spec(c,false),r=spec(c,true);
    return {chapter:p.chapter,story:opening(p.story),focus:opening(p.positive),shadow:opening(r.negative),theme:p.theme};
  }
  function synthesis(input){
    if(!Array.isArray(input)||input.length!==3)return '';
    const a=input.map(x=>spec(x.c||byId(x.id),!!x.rev));
    const suitNames=a.map(x=>names[x.type]),reverse=a.filter(x=>x.state==='逆位').length;
    const shared=a[0].type===a[1].type&&a[1].type===a[2].type;
    let linking;
    if(shared)linking='三张牌都集中在「'+suitNames[0]+'」。这表示本次阅读的象征线索相对集中：同一个主题在不同阶段显出新的面向，不代表事情只存在一种解决办法。';
    else if(new Set(a.map(x=>x.type)).size===3)linking='三张牌分别指向「'+suitNames.join('、')+'」。从第一张到第三张，观察重点不断改变；与其把它们看作互相矛盾，不如思考这三个领域如何彼此牵动。';
    else linking='本次有两张牌共享「'+suitNames.find((v,i)=>suitNames.indexOf(v)!==i)+'」这一主题，另有一张指向不同领域。重复的主题可能是叙事主轴，而那张不同的牌提示需要补上的视角。';
    const reversal=reverse===0?'三张牌均为正位，更适合阅读成可主动利用的条件，而不是成功的保证。':reverse===3?'三张均为逆位，并不预告坏结果；它们提示某些习惯、判断或资源需要重新检视。':reverse===1?'其中一张逆位可以理解为叙事中的阻力或未被承认的条件，不必直接把它当作失败。':'两张逆位让这段阅读更像调整过程：注意哪些阻力可以改变，哪些需要接受并重新安排行动。';
    const passage='从「'+a[0].title+'」的'+a[0].state+'开始：'+a[0].focus+' 此前的经历可能留下这种惯性；到了「'+a[1].title+'」的'+a[1].state+'，'+a[1].focus+' 这是此刻最值得核对的张力；最后「'+a[2].title+'」的'+a[2].state+'提醒：'+a[2].focus+' 这是一种可能的趋势，而不是确定预言。';
    const question='可以用三个问题回看这组牌：过去的哪种模式仍在影响现在？眼下能够验证或改变什么？如果保持现状，未来的哪种趋势值得提前准备？';
    return passage+'\n\n'+linking+' '+reversal+'\n\n'+question;
  }
  window.ARCANA_READING_V2={quick,spec,synthesis,applied:true};
})();