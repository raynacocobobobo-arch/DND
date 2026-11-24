
const campaignData=[["沉默远征","156.M35","M35","机械教探测舰的装置已激活；突击队熔毁装置后未归，死者呼号被井底脉动频率回送十一秒。","06-secrets"],["第一次三伪星之战","892.M35","M35","变途者夺取三处引力平衡点；亚希米恩失踪，第九年敌军撤走后九颗伪星变为盲点。","02-siofra"],["第二次三伪星之战","799.M38","M38","卡利基努斯污染九十九颗伪星，两支满编小队全灭；塞巴斯蒂安守抑制台九小时后失声，九组数据外泄。","03-organization"],["钢铁风暴","622.M41","M41","黑剑与死亡守望在兽人堡垒中相遇，毁掉燃料总管；余火守卫掩护四百六十七名守军撤离，旧记录板未移交。","05-campaigns"],["无名血泊","745.M41","M41","暗夜骑兵取走第一军团旧静滞舱遗物；暗黑天使在格伦霍姆搜查六个月，外围伤员转运被迫中断。","10-restricted"],["熔炉止语","753.M41","M41","熔炉祭司干扰布道舰队的星语频道；卢修斯把沉默理解为帝皇显圣，带领无人伤亡的舰队返航。","07-other-histories"],["沉默互证","757.M41","M41","隐修会与灰骑士共同进入阿格里斯灵能迷宫；失乡骑士被疑似狮王之声迷惑并出现伤亡，瓦拉克最终遭放逐。","06-secrets"],["黑铁条约","800.M41","M41","伊瑟林率队突入铁喉巢穴，卡拉恩逃脱；伤员由拆解重武器制成的担架送离，后封存于Σ-7。","05-campaigns"],["灰炉防线","850.M41","M41","破碎圣言试图将地质稳定器改造为信标；费尔萨姆-9反转控制矩阵，克里格工兵打开撤离支路，东侧骑兵伤亡未清。","05-campaigns"],["熵火熔铸","51.M42","M42","萨拉米斯去向不明；雷金纳德为撤伤者挡住坍塌设施而陷入半相态，七名战斗修女仅一人生还且未加入战团。","04-arsenal"],["深渊之井","75.M42","M42","休伦势力支援克拉能突袭井口，伊瑟林与阿历克斯阻止其突破；守军七十七人阵亡，第一环区毁，克拉能身份比对未结。","02-siofra"]];
const persons=[['伊瑟林·灰烬行者','隐修院长','黑铁条约、第二次护航令'],['阿历克斯·镜影','首席深渊观星者','截断克拉能传送、三份相同读数'],['奥瑞克·寂静之言','沉渊告解者','被涂去的壁画之手'],['加勒隆·虚空行者','战团牺牲者','567.M34 · 十三秒'],['塞巴斯蒂安·寂静之刃','生还者','799.M38 · 九小时'],['雷金纳德·负井者','生还者','51.M42 · 左半相态'],['塞维林·断索','战团骑士','75.M42 · 伤员桥'],['加弗里尔·井底之目','井底见证者','停在第七分钟的计时器'],['科尔·烬誓','阵亡者','567.M34 · 回响走廊']];
const chronology=[["021.M31","迟到的命令：署名狮王的令状抵达","#codex-v06-h-4-2"],["444.M32","塞缪尔的两份证词","#codex-v06-h-4-3"],["567.M34","加勒隆的十三秒与大裂变","#codex-v06-h-4-4"],["156.M35","沉默远征：探测舰装置与十一秒回声","#codex-v05-h-4-2"],["892.M35","第一次三伪星之战：九颗盲星","#codex-v05-h-4-3"],["M37","灵族未译短讯：不足一秒的井下回波","#codex-v07-h-4-11"],["799.M38","第二次三伪星之战：三处抑制节点","#codex-v05-h-4-4"],["811.M39","《无影之手》：未签收的俘虏移交令","#codex-v07-h-4-4"],["M39末—M41初","加弗里尔入井：第七分钟停止的计时器","#codex-v09-h-4-9"],["622.M41","钢铁风暴：维洛斯撤离","#codex-v05-h-4-5"],["745.M41","无名血泊：被带走的遗物","#codex-v05-h-4-6"],["753.M41","熔炉止语：布道舰队的返航","#codex-v05-h-4-7"],["757.M41","沉默互证：阿格里斯灵能迷宫","#codex-v05-h-4-8"],["800.M41","黑铁条约：铁喉巢穴的第二副担架","#codex-v05-h-4-9"],["850.M41","灰炉防线：地质稳定器与排水支路","#codex-v05-h-4-10"],["941.M41","特拉提翁监视站：身份未明的通讯记录","#codex-v07-h-4-8"],["999.M41","银河大裂隙：失联航路与断供","#codex-v06-h-4-5"],["051.M42","熵火熔铸：雷金纳德的半相态","#codex-v05-h-4-11"],["075.M42","深渊之井：破毁的第一环区","#codex-v05-h-4-12"],["075.M42 数周后","深渊之数恢复计数：第二周期开始","#codex-v10-h-5-9"]];
const pageTitles={home:'总览',reader:'卷宗阅读',campaigns:'战役档案',enemies:'仇敌录',people:'人物志',organization:'战团构成',armory:'武装与遗物',places:'基地与舰船',chronicle:'编年史',restricted:'禁阅卷宗',rules:'桌面战团规则',overview:'战团概览',rites:'战团原则与仪礼'};
function renderCampaigns(filter='all'){
 const el=document.getElementById('campaign-grid');
 const pics={1:'assets/campaigns/01-silent-expedition-thumb.webp',2:'assets/campaigns/02-first-false-stars-thumb.webp',3:'assets/editorial-20261114-v2/07-three-nodes-nine-hours-thumb.webp',4:'assets/campaigns/04-steel-storm-v4-thumb.webp',5:'assets/campaigns/05-nameless-blood-thumb.webp',6:'assets/campaigns/06-forge-silence-thumb.webp',7:'assets/campaigns/07-silent-corroboration-thumb.webp',8:'assets/campaigns/08-black-iron-accord-approved-thumb-20261114.webp',9:'assets/campaigns/09-ash-furnace-line-thumb.webp',10:'assets/campaigns/10-entropy-forge-v4-thumb.webp',11:'assets/editorial-20261114/08-abyssal-well-decisive-duel-thumb.webp'};
 el.replaceChildren();
 campaignData.forEach((c,i)=>{
  if(filter!=='all'&&c[2]!==filter)return;
  const number=i+1, link=document.createElement('a');link.className='archive-tile dossier-tile';link.href='#codex-v05-h-4-'+(number+1);
  if(pics[number]){
   const img=document.createElement('img');img.src=pics[number];img.alt=c[0]+'：'+c[3]+'（事件对应档案画面）';img.loading='lazy';img.decoding='async';img.className='campaign-art';link.append(img);
  } else {
   const face=document.createElement('div');face.className='dossier-face';face.innerHTML='<span>CAMPAIGN FILE / '+String(number).padStart(2,'0')+'</span><b>'+c[1]+'</b>';link.append(face);
  }
  const body=document.createElement('div');body.className='tilebody';
  const small=document.createElement('small');small.textContent='第 '+String(number).padStart(2,'0')+' 场 · '+c[1];
  const strong=document.createElement('strong');strong.textContent=c[0];
  const p=document.createElement('p');p.textContent=c[3]+'。';
  const tag=document.createElement('span');tag.className='source-tag';tag.textContent='远征档案';
  body.append(small,strong,p,tag);link.append(body);el.append(link);
 });
}
const personDetails=[["伊瑟林·灰烬行者","隐修院长","率队参与黑铁条约；曾因隐匿航线拒绝借舰护航，后来签发新的谷物护航令并补录货船姓名。","h-4-11","院长"],["阿历克斯·镜影","首席深渊观星者","可在井口附近不佩通常抑制器；截断克拉能传送，战后提交连误差栏都完全一致的三份校准表。","h-4-12","观测"],["奥瑞克·寂静之言","沉渊告解者","原属赦免天使，声带受损后以金属片记录供词；准许补回石廊壁画被涂掉的手，以粮票补偿石匠被扣工钱。","h-4-13","告解"],["加勒隆·虚空行者","第七任院长","567.M34 将自身接入力场回路；十三秒后井口扩张停止，遗体未归，M42 监听簿仍记录相应引力脉冲。","h-4-5","十三秒"],["塞巴斯蒂安·寂静之刃","抑制台守卫","799.M38 独守三个应急抑制节点九小时，两支满编小队全灭；战后不能完整读出阵亡战士的姓名。","h-4-6","九小时"],["雷金纳德·负井者","半相态生还者","051.M42 以战甲和盾支撑坍塌支架，左半身与装甲无法稳定恢复；不再近距突入，刻真名时只许刻右侧。","h-4-7","半相态"],["塞维林·断索","断索骑士","曾押送堕天使俘虏；075.M42 架起临时伤员桥而错过反击，以撒亚斥责其选择担架而不是追击，他签名却未答辩。","h-4-8","伤员桥"],["加弗里尔·井底之目","井底见证者","M39 末至 M41 初独自入井，归来计时器停在第七分钟，留下“钟的两面都在看”；此后未再下井。","h-4-9","第七分钟"],["科尔·烬誓","回响走廊殿后者","567.M34 自愿殿后，第十九分钟闸门关闭，遗体未回；胸甲真名板至今与卡利班灵能碎片同频共鸣。","h-4-10","第十九分钟"]];
function renderPeople(){
 const grid=document.getElementById('people-grid');grid.replaceChildren();
 const slugs=["01-iserin","02-alex","03-aurek","04-galeron","05-sebastian","06-reginald","07-severin","08-gavriel","09-cole"];
 personDetails.forEach((p,i)=>{
  const assetBase=slugs[i]==='08-gavriel'?'assets/portraits/':'assets/portraits/revised-20261114/';
  const fullAsset=slugs[i]==='03-aurek'?'assets/portraits/approved-20261115/aurek-silent-word-20261115.webp':slugs[i]==='06-reginald'?'assets/editorial-20261114-v2/16-reginald-half-phase.webp':assetBase+slugs[i]+'-full.webp';
  const thumbAsset=slugs[i]==='03-aurek'?'assets/portraits/approved-20261115/aurek-silent-word-20261115.webp':slugs[i]==='06-reginald'?'assets/editorial-20261114-v2/16-reginald-half-phase-thumb.webp':assetBase+slugs[i]+'-thumb.webp';
  const card=document.createElement('article');card.className='person person-dossier';
  const cover=document.createElement('a');cover.className='persona-cover';cover.href=fullAsset;cover.target='_blank';cover.rel='noopener noreferrer';cover.setAttribute('aria-label','查看'+p[0]+'高清原画');
  const img=document.createElement('img');img.src=thumbAsset;img.alt=p[0]+'独立场景原画';img.loading='lazy';img.decoding='async';img.width=520;img.height=650;
  cover.append(img);
  const copy=document.createElement('a');copy.className='personname';copy.href='#codex-v09-'+p[3];
  const title=document.createElement('strong');title.textContent=p[0];
  const role=document.createElement('b');role.textContent=p[1];
  const desc=document.createElement('small');desc.textContent=p[2];
  const link=document.createElement('em');link.textContent='阅读人物原文 →';
  copy.append(role,title,desc,link);card.append(cover,copy);grid.append(card);
 });
}
function renderTimeline(){
 const box=document.getElementById('timeline-items');box.replaceChildren();
 chronology.forEach(c=>{const a=document.createElement('a');a.href=c[2];a.className='chronicle-entry';const t=document.createElement('span');t.textContent=c[0];const d=document.createElement('span');d.textContent=c[1];a.append(t,d);box.append(a)});
}

function setupUnitAtlas(){
 const target=document.getElementById('rules-atlas'),grid=document.getElementById('atlas-grid');if(!target||!grid)return;
 const groups={'friendly-g01':'薪传议会','friendly-g05':'余火守卫','friendly-g02':'内环精锐','friendly-g03':'突击老兵','friendly-g04':'卡利班代行者','reinforcements':'剧情援军','enemy-units-g01':'混沌恶魔','enemy-units-g02':'混沌星际战士','enemy-units-g03':'混沌机械','enemy-units-g04':'混沌叛军','enemy-units-g05':'兽人','enemy-units-g06':'暗黑天使','enemy-units-g07':'黑暗机械教','enemy-units-g08':'审判庭与舰船武装'};
 const roles={
 'friendly-g01':'指挥 灵能 技术 支援 支援','friendly-g05':'步兵','friendly-g02':'精锐 精锐 精锐','friendly-g03':'机动 近战 机动 重火力 灵能 技术 阵地','friendly-g04':'支援 支援 支援',
 'reinforcements':'精锐 灵能 步兵 机动 步兵 技术 精锐 步兵 精锐 精锐 载具 NPC','enemy-units-g01':'怪物 指挥 指挥 指挥 步兵 步兵 步兵',
 'enemy-units-g02':'灵能 指挥 步兵 机动 精锐 精锐 精锐 技术 指挥 怪物 载具 载具 精锐',
 'enemy-units-g03':'怪物 载具 载具 载具 重火力 阵地 载具 载具',
 'enemy-units-g04':'步兵 重火力 步兵 支援 指挥 步兵 重火力 精锐 步兵 灵能 怪物 近战',
 'enemy-units-g05':'指挥 步兵 载具 技术 载具','enemy-units-g06':'步兵','enemy-units-g07':'指挥 机动 重火力 近战 步兵','enemy-units-g08':'指挥 步兵 支援 指挥 步兵 灵能'};
 const all=[...document.querySelectorAll('#rules-start h6[id^="rules-friendly-g"],#rules-start h6[id^="rules-enemy-units-g"],#rules-start h5[id^="rules-reinforcements-g"]')].map((h,i)=>{
  const side=h.id.startsWith('rules-friendly-')?'friendly':h.id.startsWith('rules-reinforcements-')?'reinforcements':/^rules-enemy-units-g0[68]-/.test(h.id)?'opposition':'enemy';
  const groupKey=side==='reinforcements'?'reinforcements':h.id.slice(6).replace(/-u\d+$/,'');
  const sequence=+(h.id.match(/-u(\d+)$/)?.[1]||h.id.match(/-g(\d+)$/)?.[1]||1)-1;
  const role=(roles[groupKey]||'').split(' ')[sequence]||'其他';
  let n=h.nextElementSibling,img='',points=null,phrases=[];
  while(n&&!/^H[3456]$/.test(n.tagName)){
   if(!img&&n.matches?.('figure.rules-unit-portrait'))img=n.querySelector('img')?.getAttribute('src')||'';
   if(n.tagName==='P'){const p=n.textContent.trim();if(phrases.length<4)phrases.push(p.slice(0,260));if(points===null){const x=p.match(/(\d{1,4})\s*分/);if(x)points=+x[1];}}
   n=n.nextElementSibling;
  }
  return {id:h.id,name:h.textContent.trim(),group:side==='reinforcements'?({"1":"死亡守望","2":"灰骑士","3":"克里格死亡军团","4":"克里格死亡军团","5":"机械教","6":"机械教","7":"钢铁之手","8":"钢铁之手","9":"钢铁之手","10":"暗黑天使","11":"机械教","12":"无主之地"}[sequence+1]||'剧情援军'):(groups[groupKey]||'未归类'),side,role,points,img,terms:phrases.join(' '),order:i};
 });
 const ctl=id=>document.getElementById(id),q=ctl('atlas-q'),side=ctl('atlas-side'),g=ctl('atlas-group'),role=ctl('atlas-role'),min=ctl('atlas-min'),max=ctl('atlas-max'),sort=ctl('atlas-sort');
 // The faction is authoritative: only groups within that faction are selectable.
 // Rebuild dependent facets on each change to prevent mixed friend/enemy filters.
 const groupOrder=['薪传议会','余火守卫','内环精锐','突击老兵','卡利班代行者','死亡守望','灰骑士','暗黑天使','钢铁之手','克里格死亡军团','机械教','无主之地','混沌恶魔','混沌星际战士','混沌机械','混沌叛军','兽人','黑暗机械教','审判庭与舰船武装'];
 const sideNames={all:'全部阵营与任务关系',friendly:'隐修会',reinforcements:'剧情援军',enemy:'敌对势力',opposition:'战役对立方'};
 const createOption=(value,label)=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;};
 function setFacetOptions(select,placeholder,items){
  const selected=select.value;
  select.replaceChildren(createOption('all',placeholder),...items.map(x=>createOption(x.name,x.label)));
  select.value=items.some(x=>x.name===selected)?selected:'all';
 }
 function updateGroups(){
  const valid=all.filter(x=>side.value==='all'||x.side===side.value);
  const names=new Set(valid.map(x=>x.group));
  const items=groupOrder.filter(name=>names.has(name)).map(name=>{
   const count=valid.filter(x=>x.group===name).length;
   return {name,label:count?name+'（'+count+'）':name+'（暂无数据卡）'};
  });
  setFacetOptions(g,'全部组织 / 势力',items);
 }
 function updateRoles(){
  const valid=all.filter(x=>(side.value==='all'||x.side===side.value)&&(g.value==='all'||x.group===g.value));
  const counts=new Map();
  valid.forEach(x=>counts.set(x.role,(counts.get(x.role)||0)+1));
  const items=[...counts].sort((a,b)=>a[0].localeCompare(b[0],'zh-CN')).map(([name,n])=>({name,label:name+'（'+n+'）'}));
  setFacetOptions(role,'全部职能',items);
 }
 updateGroups();updateRoles();
 const counter=ctl('atlas-count'),empty=ctl('atlas-empty');
 function render(){
  const keywords=q.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean),low=min.value===''?null:+min.value,high=max.value===''?null:+max.value;
  const list=all.filter(x=>(side.value==='all'||x.side===side.value)&&(g.value==='all'||x.group===g.value)&&(role.value==='all'||x.role===role.value)&&(low===null||(x.points!==null&&x.points>=low))&&(high===null||(x.points!==null&&x.points<=high))&&keywords.every(word=>(x.name+' '+x.group+' '+x.role+' '+x.terms).toLocaleLowerCase().includes(word)));
  if(sort.value==='up')list.sort((a,b)=>(a.points??Infinity)-(b.points??Infinity)||a.order-b.order);
  else if(sort.value==='down')list.sort((a,b)=>(b.points??-Infinity)-(a.points??-Infinity)||a.order-b.order);
  else if(sort.value==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
  const frag=document.createDocumentFragment();
  for(const x of list){
   const a=document.createElement('a');a.className='rules-atlas-card';a.href='#'+x.id;a.setAttribute('aria-label','打开'+x.name+'数据卡');
   if(x.img){const im=document.createElement('img');im.src=x.img;im.alt=x.name+'模型';im.loading='lazy';im.decoding='async';a.append(im);}
   const body=document.createElement('div');body.className='rules-atlas-info';
   const title=document.createElement('strong');title.textContent=x.name;
   const desc=document.createElement('small');desc.textContent=x.group+' · '+x.role;
   const cost=document.createElement('em');cost.textContent=x.role==='NPC'?'不计分':x.points===null?'分值以原文为准':x.points+' 分';
   body.append(title,desc,cost);a.append(body);frag.append(a);
  }
  grid.replaceChildren(frag);empty.hidden=!!list.length;
  empty.textContent=low!==null&&high!==null&&low>high?'分值下限不能高于上限，请调整分值范围。':'当前阵营、势力、职能或关键词下没有匹配的数据卡，可重置筛选。';
  const factionTotal=all.filter(x=>side.value==='all'||x.side===side.value).length;
  const selection=[sideNames[side.value],g.value==='all'?null:g.value,role.value==='all'?null:role.value].filter(Boolean).join(' / ');
  counter.textContent='当前：'+selection+' · 显示 '+list.length+' / '+factionTotal+' 张数据卡'+(side.value==='all'?'（隐修会 '+all.filter(x=>x.side==='friendly').length+' · 援军 '+all.filter(x=>x.side==='reinforcements').length+' · 敌对势力 '+all.filter(x=>x.side==='enemy').length+' · 战役对立方 '+all.filter(x=>x.side==='opposition').length+'）':'');
 }
 side.addEventListener('change',()=>{updateGroups();updateRoles();render()});
 g.addEventListener('change',()=>{updateRoles();render()});
 for(const e of [q,role,min,max,sort])e.addEventListener(e.tagName==='SELECT'?'change':'input',render);
 ctl('atlas-reset').addEventListener('click',()=>{q.value='';side.value='all';g.value='all';role.value='all';min.value='';max.value='';sort.value='original';updateGroups();updateRoles();render()});render();
}
// Load the 120KB rules codex only if it is opened. Reuse one request and
// initialize the interactive unit atlas only after its markup becomes available.
let rulesRequest=null;
async function ensureRules(){
  const view=document.getElementById('view-rules');
  if(document.getElementById('rules-start'))return true;
  if(!rulesRequest){
    rulesRequest=fetch('assets/rules-fragment.html?v=20261124-atlasfix1')
      .then(response=>{
        if(!response.ok)throw new Error('HTTP '+response.status);
        return response.text();
      })
      .then(markup=>{
        view.innerHTML=markup;
        view.removeAttribute('aria-busy');
        setupUnitAtlas();
        return true;
      })
      .catch(error=>{
        rulesRequest=null;
        view.removeAttribute('aria-busy');
        view.innerHTML='<div class="panel" style="padding:24px"><h2>规则卷宗加载失败</h2><p>网络连接中断，请重新打开目录重试。</p><p><a class="btn" href="tabletop-rules.html">阅读完整桌面规则</a></p></div>';
        console.warn('Rules fragment unavailable',error);
        return false;
      });
  }
  return rulesRequest;
}

async function route(){const key=(location.hash||'#home').slice(1).split('?')[0];const matched=key.match(/^codex-v(0[1-9]|10)(?:-|$)/);const codexView={"10":"restricted","01":"overview","02":"places","03":"organization","04":"armory","05":"campaigns","06":"chronicle","07":"enemies","08":"rites","09":"people"};const inEnemyArchive=key==='enemies';const inRulesArchive=/^rules-[a-z0-9-]+$/.test(key);const k=inEnemyArchive?'enemies':(inRulesArchive?'rules':(pageTitles[key]?key:(matched?codexView[matched[1]]:'home')));
if(k==='rules'){
  // Reveal a lightweight loading state while the fragment is fetched.
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-rules'));
  await ensureRules();
  if((location.hash||'#home').slice(1).split('?')[0]!==key)return;
}
document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id==='view-'+k));document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',a.getAttribute('data-nav')===k));document.querySelectorAll('.sideline[href]').forEach(a=>a.classList.toggle('active',a.hash==='#'+k));
const activeVolume=k==='rules'?'rules':(matched?.[1]||Object.keys(codexView).find(v=>codexView[v]===k));
document.querySelectorAll('.rail-group').forEach(group=>{
const active=group.dataset.volume===activeVolume;
group.classList.toggle('active',active);
if(active && group.querySelector(':scope > .rail-mini'))group.open=true;
});
document.querySelectorAll('.rail-subitem').forEach(a=>a.classList.toggle('active',a.hash==='#'+key));const activeRuleLink=document.querySelector('.rules-rail-group a.rail-subitem.active');if(activeRuleLink){const unitGroup=activeRuleLink.closest('details.rules-nav-group');if(unitGroup)unitGroup.open=true;}document.getElementById('drawer').classList.remove('open');document.getElementById('menubutton').setAttribute('aria-expanded','false');document.getElementById('nav-quick').setAttribute('aria-expanded','false');document.getElementById('nav-quick').hidden=k==='home';document.getElementById('nav-shade').hidden=true;document.body.classList.remove('nav-open');document.title='破碎余烬隐修会 · '+pageTitles[k];const isParagraph=!!matched&&key!==`codex-v${matched[1]}`;const deepAnchor=isParagraph||inEnemyArchive||inRulesArchive;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(deepAnchor){const target=document.getElementById(key);if(target)target.scrollIntoView({block:'start',behavior:'instant'});}else if(matched&&!isParagraph){/* First-level chapters always open at their own hero, clear of the sticky top bar. */const current=document.getElementById('view-'+k);const chapterTop=current?.querySelector(':scope > .subhero')||current;const stickyHeader=document.querySelector('.topbar');const offset=(stickyHeader?.getBoundingClientRect().height||0)+8;if(chapterTop){const top=window.scrollY+chapterTop.getBoundingClientRect().top-offset;window.scrollTo({top:Math.max(0,top),behavior:'instant'});}else{window.scrollTo({top:0,behavior:'instant'});}}else{window.scrollTo({top:0,behavior:'instant'});}}));}

// Continue reading from chapter-side tracking, do not fabricate progress.
try{const v=JSON.parse(localStorage.getItem('ember-last-read')||'null');const a=document.getElementById('v32-continue');if(v?.page && /^\d\d-[\w-]+\.html$/.test(v.page)){a.href='chapters/'+v.page+'?resume=1'+(v.anchor?'#'+encodeURIComponent(v.anchor):'');a.textContent='继续上次阅读 · '+(v.chapter||'档案');a.hidden=false}}catch{}
document.querySelectorAll('.rail-group').forEach(group=>{
  group.addEventListener('toggle',()=>{
    if(group.open)document.querySelectorAll('.rail-group[open]').forEach(other=>{if(other!==group)other.open=false;});
  });
  const summary=group.querySelector('summary.rail-summary');
  summary?.addEventListener('click',event=>{
    event.preventDefault();
    const hasSubmenu=!!group.querySelector(':scope > .rail-mini');
    // Clicking an expanded first-level chapter closes its subchapters
    // without navigating away or moving the reading position.
    if(hasSubmenu && group.open){group.open=false;return;}
    if(hasSubmenu)group.open=true;
    // A chapter without subchapters (Volume I) directly opens the volume.
    const target=group.dataset.volume==='rules'?'#rules':'#codex-v'+group.dataset.volume;
    if(location.hash===target)route();
    else location.hash=target;
  });
});
try{history.scrollRestoration='manual'}catch{}route();window.addEventListener('hashchange',route);window.addEventListener('pageshow',route);document.addEventListener('click',e=>{const a=e.target.closest?.('a[href^="#"]');if(a&&a.hash===location.hash)route();});const menuButton=document.getElementById('menubutton'),menuDrawer=document.getElementById('drawer');
function setDrawer(open){menuDrawer.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));document.getElementById('nav-quick').setAttribute('aria-expanded',String(open));document.getElementById('nav-shade').hidden=!open;document.body.classList.toggle('nav-open',open);}
menuButton.addEventListener('click',()=>setDrawer(!menuDrawer.classList.contains('open')));document.getElementById('nav-quick').addEventListener('click',()=>setDrawer(!menuDrawer.classList.contains('open')));document.getElementById('nav-shade').addEventListener('click',()=>setDrawer(false));
menuDrawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setDrawer(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setDrawer(false)});
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});btn.classList.add('on');btn.setAttribute('aria-pressed','true');renderCampaigns(btn.dataset.filter)}));
const searchPanel=document.getElementById('codex-search'), searchInput=document.getElementById('codex-query'), searchOut=document.getElementById('codex-search-results');
const searchVolume=document.getElementById('codex-search-volume'),searchKind=document.getElementById('codex-search-kind'),searchCount=document.getElementById('codex-search-count');
let searchIndexRequest;
function ensureSearchIndex(){
 if(window.EMBER_SEARCH)return Promise.resolve();
 if(!searchIndexRequest)searchIndexRequest=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='assets/search-index.js';script.async=true;
  script.onload=resolve;
  script.onerror=()=>{searchIndexRequest=null;script.remove();reject(new Error('索引加载失败'))};
  document.head.appendChild(script);
 });
 return searchIndexRequest;
}
function openSearch(){
 searchPanel.hidden=false;searchInput.focus();renderSearch();
 ensureSearchIndex().then(()=>{if(!searchPanel.hidden)renderSearch()},()=>{
  if(!searchPanel.hidden)searchOut.innerHTML='<p class="search-dim">检索索引加载失败，请关闭后重试。</p>';
 });
}
function closeSearch(){searchPanel.hidden=true;searchInput.value='';searchVolume.value='all';searchKind.value='all';searchOut.replaceChildren();searchCount.textContent=''}
function renderSearch(){
 const query=searchInput.value.trim().toLocaleLowerCase(),terms=query.split(/\s+/).filter(Boolean);
 const entries=window.EMBER_SEARCH||[],volume=searchVolume.value,kind=searchKind.value;
 if(!window.EMBER_SEARCH&&(terms.length||volume!=='all'||kind!=='all')){searchOut.innerHTML='<p class="search-dim">正在加载全文检索索引…</p>';searchCount.textContent='';return;}
 if(!terms.length&&volume==='all'&&kind==='all'){searchOut.innerHTML='<p class="search-dim">输入人名、地点、战役、年代或多个关键词；也可以先选择来源卷和记录性质。</p>';searchCount.textContent='';return;}
 const vol=d=>(d.chapter.match(/^\d{2}/)||[])[0]||'',full=d=>!d.url.includes('#');
 const section=d=>+(d.url.match(/#h-4-(\d+)/)?.[1]||0);
 const matchingKind=d=>{
  if(kind==='all')return true;
  if(kind==='full')return full(d);
  if(kind==='entry')return !full(d);
  if(full(d))return false;
  const v=vol(d),n=section(d);
  return (kind==='campaign'&&v==='05')||(kind==='other'&&v==='07')||
   (kind==='collaboration'&&v==='07'&&[2,3,8,9,10].includes(n))||
   (kind==='imperial'&&v==='07'&&[4,5,6,7].includes(n))||
   (kind==='uncertain'&&v==='07'&&n===11)||(kind==='watchlist'&&v==='07'&&n===12)||
   (kind==='people'&&v==='09'&&n>=5&&n<=13)||(kind==='restricted'&&v==='10');
 };
 const list=entries.filter(d=>(volume==='all'||vol(d)===volume)&&matchingKind(d)&&terms.every(t=>(d.title+' '+d.chapter+' '+d.body).toLocaleLowerCase().includes(t)));
 const rank=d=>{const title=d.title.toLocaleLowerCase(),chapter=d.chapter.toLocaleLowerCase();return !query?0:title===query?0:title.startsWith(query)?1:terms.every(t=>title.includes(t))?2:chapter.includes(query)?3:4;};
 list.sort((a,b)=>rank(a)-rank(b)||(a.order||0)-(b.order||0));searchOut.replaceChildren();
 searchCount.textContent='匹配 '+list.length+' 条'+(list.length>30?' · 显示前30条':'');
 if(!list.length){const p=document.createElement('p');p.className='search-dim';p.textContent='筛选条件下没有匹配记录，请清除筛选或扩大范围。';searchOut.append(p);return;}
 for(const d of list.slice(0,30)){
  const el=document.createElement('a');el.href=d.url;el.className='search-item';
  const title=document.createElement('b');title.textContent=d.title;
  const sub=document.createElement('small');sub.textContent=d.chapter+' · '+(full(d)?'全章':'卷内条目');
  const p=document.createElement('p'),body=d.body||'',lower=body.toLocaleLowerCase();
  const hits=terms.length?terms.map(t=>lower.indexOf(t)).filter(i=>i>=0).sort((a,b)=>a-b):[0];
  const at=hits.length?hits[0]:0;p.textContent=body.slice(Math.max(0,at-35),Math.min(body.length,at+115));
  el.append(title,sub,p);searchOut.append(el);
 }
}
document.getElementById('searchbutton').addEventListener('click',openSearch);
document.getElementById('search-close-v31').addEventListener('click',closeSearch);
searchInput.addEventListener('input',renderSearch);searchVolume.addEventListener('change',renderSearch);searchKind.addEventListener('change',renderSearch);document.getElementById('codex-search-reset').addEventListener('click',()=>{searchInput.value='';searchVolume.value='all';searchKind.value='all';renderSearch();searchInput.focus();});searchPanel.addEventListener('click',e=>{if(e.target===searchPanel)closeSearch()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}else if(e.key==='Escape')closeSearch()});

// Install the optional, bounded image cache after initial page load.
// No HTML/JS/CSS is precached or served from the image worker.
window.addEventListener('load',()=>{
  if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
  const install=()=>navigator.serviceWorker.register('./sw.js',{scope:'./'})
    .catch(error=>console.warn('Image caching unavailable',error));
  if('requestIdleCallback' in window)window.requestIdleCallback(install,{timeout:3000});
  else window.setTimeout(install,1000);
});
