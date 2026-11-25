"use strict";
function buildRelease(data, groups, index) {
  const cards=data.cards, ids=new Set(cards.map(c=>c.id)), rows=Object.values(groups).flat(), keys=new Set(), hashes=new Set(), paths=new Set(), published=[];
  if(ids.size!==cards.length)throw Error("动作卡编号重复");
  for(const r of rows){
    if(keys.has(r.source_key)||hashes.has(r.sha256))throw Error("图片编号或 SHA-256 重复："+r.source_key);
    keys.add(r.source_key);hashes.add(r.sha256);
    if(!/^[WR]\d{1,4}$|^U[a-f0-9]{24}$/.test(r.source_key)||!/^[a-f0-9]{64}$/.test(r.sha256))throw Error("原图编号或哈希无效");
    if(!["approved","excluded","pending"].includes(r.review_status)||!r.visual_description||!r.match_reason)throw Error("缺少审核依据："+r.source_key);
    if(r.review_status==="excluded"&&r.assigned_card_id!==null)throw Error("排除图仍有归属："+r.source_key);
    if(r.review_status!=="approved")continue;
    if(!ids.has(r.assigned_card_id)||!new RegExp("^assets/references/reviewed/"+r.source_key+"\\.(jpeg|png|webp|gif)$").test(r.path)||!/^[a-f0-9]{40}$/.test(r.git_blob||"")||paths.has(r.path))throw Error("已发布图片记录无效："+r.source_key);
    paths.add(r.path);
    published.push({source_key:r.source_key,sha256:r.sha256,file_size:r.file_size,assigned_card_id:r.assigned_card_id,visual_description:r.visual_description,match_reason:r.match_reason,match_type:r.match_type,path:r.path,git_blob:r.git_blob});
  }
  published.sort((a,b)=>a.source_key.localeCompare(b.source_key,undefined,{numeric:true}));
  for(const c of cards){const order=new Map((c.images||[]).map((p,i)=>[p,i]));const m=published.filter(r=>r.assigned_card_id===c.id).sort((a,b)=>(order.get(a.path)??Infinity)-(order.get(b.path)??Infinity));c.images=m.map(r=>r.path);c.image_notes=m.map(r=>({source:r.source_key,reason:r.match_reason}));c.reference_note=m.length?"已逐图审核的动作参考；影视或广告画面仅作为调度示范。":"";}
  const original=rows.filter(r=>/^[WR]\d+$/.test(r.source_key)), approved=original.filter(r=>r.review_status==="approved").length, excluded=original.filter(r=>r.review_status==="excluded").length,pending=original.filter(r=>r.review_status==="pending").length;
  index.files=Object.keys(groups).sort();index.counts={reviewed:original.length,approved,excluded,pending,unreviewed:1482-original.length,user_uploads:rows.length-original.length};data.reviewed_release={images:published.length,core_cards:cards.filter(c=>c.is_core).length,additional_cards:cards.filter(c=>!c.is_core).length};
  return published;
}
(function admin(){
  "use strict";
  const ROOT="wedding/shotlist/", API="https://api.github.com/repos/raynacocobobobo-arch/DND",BRANCH="gh-pages",CATS=["环境与场布","晨间准备","单人肖像","新人双人互动","家庭与亲友","接亲与转场","婚礼仪式","宴会与庆祝"], LEVELS=["纪实优先","轻引导","条件选拍"];
  const $=id=>document.getElementById(id), node=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n}, button=(txt,fn)=>{const b=node("button",txt);b.type="button";b.onclick=fn;return b}, opt=(v,t)=>{const o=node("option",t);o.value=v;return o};
  let token="",head="",baseTree="",data=null,index=null,groups={},published=[],dirty=false,staged=new Map(),busy=false,selectedCard="",page=0,selectedImage="",draftNew=false,requestedCard=/^#card-(A\d+)$/.exec(location.hash)?.[1]||"";
  const rows=()=>Object.values(groups).flat();
  const status=t=>{$("status").textContent=t};
  const b64=bytes=>{let s="";for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s)};
  const decode=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,"")),c=>c.charCodeAt(0)));
  async function api(path,method="GET",body){
    if(!token)throw Error("请先授权 GitHub");
    const r=await fetch(API+path,{method,headers:{"Authorization":"Bearer "+token,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined,cache:"no-store",credentials:"omit",redirect:"error"});
    if(!r.ok){let e;try{e=await r.json()}catch{}throw Error("GitHub "+r.status+"："+(e?.message||r.statusText))}
    return r.json();
  }
  async function readFile(path,ref){const a=await api("/contents/"+ROOT+path+"?ref="+encodeURIComponent(ref));if(a.encoding!=="base64"||!a.content)throw Error("无法读取 "+path);return decode(a.content)}
  async function currentHead(){return (await api("/git/ref/heads/"+BRANCH)).object.sha}
  async function load(){
    const h=await currentHead(), c=await api("/git/commits/"+h);
    const raw=await readFile("data.js",h), next=JSON.parse(raw.trim().replace(/^window.ENWAN_DATA\s*=\s*/,"").replace(/;$/,"")), idx=JSON.parse(await readFile("reviews/index.json",h)), nextGroups={};
    for(const p of idx.files){if(!/^reviews\/(?:[WR]\d{4}-\d{4}|uploads)\.json$/.test(p))throw Error("审查分片路径异常");nextGroups[p]=JSON.parse(await readFile(p,h))}
    const manifest=JSON.parse(await readFile("reviewed-release.json",h)), lookup=new Map(manifest.map(r=>[r.source_key,r]));for(const r of Object.values(nextGroups).flat()){if(r.review_status!=="approved")continue;const m=lookup.get(r.source_key);if(!m||m.sha256!==r.sha256||m.assigned_card_id!==r.assigned_card_id||(m.file_size!=null&&m.file_size!==r.file_size)||(r.path&&r.path!==m.path)||(r.git_blob&&r.git_blob!==m.git_blob))throw Error("历史发布记录不一致："+r.source_key);r.path=m.path;r.git_blob=m.git_blob;}const before=JSON.stringify(next.cards.map(c=>[c.id,[...c.images].sort()]));const rel=buildRelease(next,nextGroups,idx);if(before!==JSON.stringify(next.cards.map(c=>[c.id,[...c.images].sort()])))throw Error("仓库中动作卡与审查账本不一致，禁止覆盖");
    head=h;baseTree=c.tree.sha;data=next;index=idx;groups=nextGroups;published=rel;for(const s of staged.values())URL.revokeObjectURL(s.url);staged.clear();dirty=false;page=0;selectedCard=data.cards[0]?.id||"";selectedImage="";$("editor").hidden=false;$("writebar").hidden=false;$("auth").hidden=true;render();status("已连接 GitHub。直接在下方动作卡照片上操作，完成后点击提交并发布。");focusRequested();
  }
  function locked(on){busy=on;$("publish").disabled=on||!dirty;$("reload").disabled=on;$("logout").disabled=on;$("login").disabled=on;$("editor").inert=on;$("visual").inert=on;$("task-admin").inert=on}
  async function run(fn){if(busy)return;locked(true);try{await fn()}catch(e){status(e.message||"操作失败")}finally{locked(false)}}
  function cardOptions(select, includeBlank=false){let prev=select.value;select.replaceChildren();if(includeBlank)select.append(opt("","请选择动作卡"));for(const c of data.cards)select.append(opt(c.id,c.category+" · "+c.title+" ("+c.id+")"));if([...select.options].some(o=>o.value===prev))select.value=prev;}
  function mark(){dirty=true;published=buildRelease(data,groups,index);render();status("有未发布的修改。点击“提交并发布”统一保存。")}
  function render(){
    const c=index.counts;$("counts").textContent=`原稿已审 ${c.reviewed}/1482 · 已发布 ${c.approved} · 排除 ${c.excluded} · 待发布 ${c.pending} · 后台新增 ${c.user_uploads||0} · 动作卡 ${data.cards.length}`;
    $("publish").disabled=busy||!dirty;$("dirty").textContent=dirty?"有未提交的修改":"已与 GitHub 同步";cardOptions($("upload-card"),true);cardOptions($("card-select"));
    $("card-select").value=selectedCard;renderCard();renderImages();renderVisual();renderTasks();
  }
  function imageUrl(r){if(staged.has(r.source_key))return staged.get(r.source_key).url;if(r.path&&new RegExp("^assets/references/reviewed/"+r.source_key+"\\.(jpeg|png|webp|gif)$").test(r.path))return new URL(r.path,location.href).href;return null}
  function renderImages(){
    const q=$("search").value.trim().toLowerCase(), filter=$("filter").value;const list=rows().filter(r=>(filter==="all"||r.review_status===filter)&&(!q||[r.source_key,r.source_group,r.visual_description,r.match_reason,r.assigned_card_id,data.cards.find(c=>c.id===r.assigned_card_id)?.title].join(" ").toLowerCase().includes(q))).sort((a,b)=>a.source_key.localeCompare(b.source_key,undefined,{numeric:true}));
    const limit=20;page=Math.max(0,Math.min(page,Math.ceil(list.length/limit)-1));$("page").textContent=`${list.length} 条 · 第 ${page+1}/${Math.max(1,Math.ceil(list.length/limit))} 页`;$("prev").disabled=page===0;$("next").disabled=(page+1)*limit>=list.length;
    const g=$("images");g.replaceChildren();
    for(const r of list.slice(page*limit,(page+1)*limit)){
      const a=node("article",undefined,"item");const url=imageUrl(r);if(url){const link=node("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";const im=node("img");im.src=url;im.loading="lazy";im.alt=r.source_key+" "+r.visual_description;link.append(im);a.append(link)}else a.append(node("div","未发布原图","noimage"));
      a.append(node("strong",r.source_key+" · "+({approved:"已采用",pending:"待发布",excluded:"排除"}[r.review_status])),node("p",r.visual_description),node("small",r.match_reason));
      const sel=node("select");cardOptions(sel,true);sel.value=r.assigned_card_id||r.last_card_id||"";
      if(r.review_status==="approved"){a.append(sel,button("移动到所选动作卡",()=>{if(!sel.value)return status("请选择归属动作卡");if(sel.value===r.assigned_card_id)return;const why=prompt("请填写改归属的依据",r.match_reason);if(!why?.trim())return;r.assigned_card_id=sel.value;r.match_reason=why.trim();r.review_notes=(r.review_notes||"")+"；后台调整归属 "+new Date().toISOString();mark()}),button("从网站移除",()=>{const why=prompt("请填写移除理由","人工移除：不再采用");if(!why?.trim())return;r.last_card_id=r.assigned_card_id;r.assigned_card_id=null;r.review_status="excluded";r.match_reason=why.trim();r.review_notes=(r.review_notes||"")+"；后台移除 "+new Date().toISOString();mark()}))}
      else if(r.path&&r.git_blob){a.append(sel,button("恢复到所选动作卡",()=>{if(!sel.value)return status("请选择归属动作卡");const why=prompt("请填写恢复采用依据");if(!why?.trim())return;r.assigned_card_id=sel.value;r.review_status="approved";r.match_reason=why.trim();mark()}))}
      g.append(a);
    }
  }
  function renderCard(){if(draftNew)return;
    const c=data.cards.find(x=>x.id===selectedCard);$("card-form").hidden=!c;if(!c)return;
    $("card-id").textContent=c.id+(c.is_core?" · 核心动作卡":" · 补充动作卡");
    $("ctitle").value=c.title;$("ccat").value=c.category;$("clevel").value=c.action_level||LEVELS[1];$("cwhen").value=c.applicable_when||"";$("cprompt").value=c.prompt||"";$("ccamera").value=c.camera||"";$("ccheck").value=c.delivery_check||"";
    $("card-images").textContent="已采用 "+c.images.length+" 张图片";
  }
  $("login").onclick=()=>run(async()=>{token=$("token").value.trim();$("token").value="";if(!token.startsWith("github_pat_")){token="";throw Error("请使用限定 DND 仓库的 Fine-grained personal access token")}try{await load()}catch(e){token="";throw e}});
  $("reload").onclick=()=>{if(dirty&&!confirm("放弃未提交修改并重新读取 GitHub？"))return;run(load)};
  $("logout").onclick=()=>{if(dirty&&!confirm("放弃未提交修改并退出？"))return;token="";location.reload()};
  $("search").oninput=()=>{page=0;renderImages()};$("filter").onchange=()=>{page=0;renderImages()};$("prev").onclick=()=>{page--;renderImages()};$("next").onclick=()=>{page++;renderImages()};
  for(const x of CATS)$("ccat").append(opt(x,x));for(const x of LEVELS)$("clevel").append(opt(x,x));
  $("card-select").onchange=()=>{selectedCard=$("card-select").value;renderCard()};
  function openCard(id){
    if(!canEdit(id))return;draftNew=false;selectedCard=id;renderCard();$("delete-card").hidden=false;$("card-dialog").showModal();
  }
  function openNew(){
    if(!canEdit())return;draftNew=true;const chosen=$("visual-cat").value;
    $("card-form").hidden=false;$("card-id").textContent="新建动作卡";$("card-images").textContent="保存后可直接添加照片";$("ctitle").value="";$("ccat").value=chosen||CATS[0];$("clevel").value=LEVELS[2];for(const id of ["cwhen","cprompt","ccamera","ccheck"])$(id).value="";$("delete-card").hidden=true;$("card-dialog").showModal();$("ctitle").focus();
  }
  $("close-card").onclick=()=>{$("card-dialog").close();draftNew=false};
  $("card-dialog").addEventListener("close",()=>{draftNew=false});
  $("save-card").onclick=()=>{
    const title=$("ctitle").value.trim(),promptText=$("cprompt").value.trim(),camera=$("ccamera").value.trim();
    if(!title||!promptText||!camera){alert("名称、现场口令、摄影机位必填");return}
    let c=data.cards.find(x=>x.id===selectedCard);
    if(draftNew){const used=new Set([...data.cards.map(x=>x.id),...rows().map(r=>r.last_card_id)]);let i=34;while(used.has("A"+String(i).padStart(2,"0")))i++;c={id:"A"+String(i).padStart(2,"0"),is_core:false,images:[],image_notes:[]};data.cards.push(c);selectedCard=c.id}
    if(!c)return;Object.assign(c,{title,category:$("ccat").value,action_level:$("clevel").value,applicable_when:$("cwhen").value.trim(),prompt:promptText,camera,delivery_check:$("ccheck").value.trim()});draftNew=false;$("card-dialog").close();mark();requestedCard=c.id;focusRequested();
  };
  $("new-card").onclick=openNew;
  $("delete-card").onclick=()=>{const c=data.cards.find(x=>x.id===selectedCard);if(!c)return;if(data.stages.some(s=>s.items.some(t=>(t.reference_ids||[]).includes(c.id)))){alert("请先取消拍摄任务对该动作卡的关联");return}if(rows().some(r=>r.assigned_card_id===c.id)){alert("请先移动或移除该卡的所有图片");return}if(!confirm("删除 "+c.title+"？可从 Git 历史恢复。"))return;data.cards=data.cards.filter(x=>x.id!==c.id);selectedCard=data.cards[0]?.id||"";$("card-dialog").close();mark()};
  async function stageImage(f,card,desc,reason){
    const exts={"image/jpeg":"jpeg","image/png":"png","image/webp":"webp","image/gif":"gif"};
    if(!exts[f.type]||f.size>15*1024*1024||!f.size)throw Error("仅支持不超过15MB的 JPG、PNG、WebP、GIF");
    if(!data.cards.some(c=>c.id===card))throw Error("动作卡不存在");
    const bitmap=await createImageBitmap(f),width=bitmap.width,height=bitmap.height;bitmap.close();
    const bytes=new Uint8Array(await f.arrayBuffer()),hex=buffer=>Array.from(new Uint8Array(buffer),x=>x.toString(16).padStart(2,"0")).join(""),hash=hex(await crypto.subtle.digest("SHA-256",bytes));
    if(rows().some(r=>r.sha256===hash))throw Error("相同原图已存在，请移动或恢复已有图片");
    const prefix=new TextEncoder().encode("blob "+bytes.length+"\0"),gitBytes=new Uint8Array(prefix.length+bytes.length);gitBytes.set(prefix);gitBytes.set(bytes,prefix.length);const expected=hex(await crypto.subtle.digest("SHA-1",gitBytes));
    const id="U"+hash.slice(0,24),path="assets/references/reviewed/"+id+"."+exts[f.type];
    const b=await api("/git/blobs","POST",{content:b64(bytes),encoding:"base64"});if(b.sha!==expected)throw Error("GitHub 原图哈希校验失败");
    const r={source_key:id,source_refs:[],source_document:"后台新增",source_group:"人工选择",source_order:0,sha256:hash,mime_type:f.type,file_size:f.size,width,height,path,git_blob:b.sha,storage_path:new URL(path,location.href).href,visual_description:desc||("用户手动选择："+f.name),match_reason:reason||("用户手动添加至 "+data.cards.find(c=>c.id===card).title),match_type:"reference",assigned_card_id:card,review_status:"approved",review_notes:"后台人工审核 "+new Date().toISOString(),sort_order:0};
    (groups["reviews/uploads.json"]??=[]).push(r);staged.set(id,{path,sha:b.sha,url:URL.createObjectURL(f)});return r;
  }
  function canEdit(card){
    if(token&&data)return true;requestedCard=card||requestedCard;$("auth").open=true;$("auth").scrollIntoView({behavior:"smooth",block:"start"});$("token").focus();status("照片已显示。连接 GitHub 后即可编辑和发布到所有设备。");return false;
  }
  function focusRequested(){if(!requestedCard)return;const id=requestedCard;requestedCard="";const c=document.getElementById("card-"+id);if(c)c.scrollIntoView({behavior:"smooth",block:"start"})}
  function exclude(r,why){r.last_card_id=r.assigned_card_id;r.assigned_card_id=null;r.review_status="excluded";r.review_notes=(r.review_notes||"")+"；原采用依据："+r.match_reason+"；用户移除 "+new Date().toISOString();r.match_reason=why;}
  function pickFiles(card,old){
    if(!canEdit(card))return;const inp=node("input");inp.type="file";inp.accept="image/jpeg,image/png,image/webp,image/gif";inp.multiple=!old;inp.onchange=()=>run(async()=>{
      const files=[...inp.files];if(!files.length)return;
      if(old){if(!confirm("用所选照片替换 "+old.source_key+"？旧图将移入可恢复档案。"))return;const added=await stageImage(files[0],card,"用户手动替换："+files[0].name,"用户手动替换 "+old.source_key);exclude(old,"用户手动替换为 "+added.source_key);mark();return}
      let n=0;const errors=[];for(const f of files){try{await stageImage(f,card);n++}catch(e){errors.push(f.name+"："+e.message)}}if(n)mark();status("已暂存 "+n+" 张新照片"+(errors.length?"；未添加："+errors.join("；"):"。点击提交并发布生效。"));
    });inp.click();
  }
  function renderVisual(){
    const view=data||window.ENWAN_DATA;if(!view){$("visual-summary").textContent="未能读取网站数据，请刷新。";return}
    const editable=!!(token&&data),cat=$("visual-cat").value,q=$("visual-search").value.trim().toLowerCase(),only=$("visual-filled").checked;
    const visible=view.cards.filter(c=>(!cat||c.category===cat)&&(!only||c.images.length)&&(!q||[c.id,c.title,c.category,...(c.image_notes||[]).map(n=>n.source)].join(" ").toLowerCase().includes(q)));
    $("visual-summary").textContent=(editable?"编辑模式 · 修改后统一发布":"预览模式 · 照片可直接浏览，修改需授权")+" · "+view.cards.length+" 张动作卡 / "+view.cards.reduce((n,c)=>n+c.images.length,0)+" 张照片";
    const g=$("visual-cards");g.replaceChildren();let last="";
    for(const c of visible){
      if(c.category!==last){g.append(node("h3",c.category,"category-heading"));last=c.category}
      const card=node("article",undefined,"visual-card");card.id="card-"+c.id;
      const h=node("div",undefined,"visual-head"),label=node("div");label.append(node("small",c.id+" · "+(c.action_level||"选拍")),node("h3",c.title));const controls=node("div",undefined,"row");controls.append(button("编辑卡片",()=>openCard(c.id)),button("＋ 添加照片",()=>pickFiles(c.id)));h.append(label,controls);card.append(h);
      if(c.prompt)card.append(node("p",c.prompt,"card-prompt"));
      const photos=node("div",undefined,"photo-grid");
      for(const [i,path] of c.images.entries()){
        const record=editable?rows().find(r=>r.path===path&&r.assigned_card_id===c.id&&r.review_status==="approved"):null;
        const source=record?.source_key||c.image_notes?.[i]?.source||path.split("/").pop(),tile=node("figure",undefined,"photo-tile"),url=record?imageUrl(record):new URL(path,location.href).href;
        if(url){const a=node("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";const img=node("img");img.src=url;img.alt=c.title+" · "+source;img.loading="lazy";img.onerror=()=>{img.alt="照片加载失败："+source};a.append(img);tile.append(a)}
        const cap=node("figcaption",source);tile.append(cap);
        const actions=node("div",undefined,"photo-actions");
        actions.append(button("替换",()=>{if(canEdit(c.id)&&record)pickFiles(c.id,record)}),button("删除",()=>{if(!canEdit(c.id)||!record)return;if(!confirm("从网站移除这张照片？可从审查档案恢复。"))return;exclude(record,"用户手动从 "+c.title+" 移除");mark()}));
        const move=node("select");move.setAttribute("aria-label","移动照片至动作卡");move.append(opt("","移动至…"));for(const target of view.cards.filter(x=>x.id!==c.id))move.append(opt(target.id,target.category+" · "+target.title));
        move.onchange=()=>{if(!move.value)return;if(!canEdit(c.id)||!record){move.value="";return}const target=data.cards.find(x=>x.id===move.value);if(!target||!confirm("移动至「"+target.title+"」？")){move.value="";return}record.review_notes=(record.review_notes||"")+"；原归属 "+record.assigned_card_id+"；用户手动调整 "+new Date().toISOString();record.assigned_card_id=target.id;record.match_reason="用户手动调整至 "+target.title;mark()};actions.append(move);tile.append(actions);photos.append(tile);
      }
      const add=button("＋ 添加照片",()=>pickFiles(c.id));add.className="photo-add";photos.append(add);card.append(photos);g.append(card);
    }
    if(!visible.length)g.append(node("p","没有匹配的动作卡"));
  }
  for(const cat of CATS)$("visual-cat").append(opt(cat,cat));
  $("visual-cat").onchange=renderVisual;$("visual-search").oninput=renderVisual;$("visual-filled").onchange=renderVisual;$("visual-new").onclick=openNew;
  $("add-image").onclick=()=>run(async()=>{const f=$("upload").files[0],card=$("upload-card").value;if(!f||!card)throw Error("请选择图片和动作卡");await stageImage(f,card,$("description").value.trim(),$("reason").value.trim());$("upload").value="";mark()});
  $("publish").onclick=()=>run(async()=>{
    if(!dirty)return;validateTasks(data);if(data.cards.some(c=>!c.title?.trim()||!c.prompt?.trim()||!c.camera?.trim()||!CATS.includes(c.category)))throw Error("有未填写完整的动作卡，先保存卡片内容");
    if(!confirm("提交全部暂存修改到 DND 正式分支？提交后将触发 GitHub Pages 发布。"))return;
    if(await currentHead()!==head)throw Error("仓库已被其他任务更新。本次修改仍暂存，请先处理冲突，不会覆盖最新版本。");
    const manifest=buildRelease(data,groups,index), tree=await api("/git/trees/"+baseTree+"?recursive=1");if(tree.truncated)throw Error("仓库树不完整，无法安全发布");
    const byPath=new Map(tree.tree.map(x=>[x.path,x]));for(const r of manifest){const item=staged.get(r.source_key)||byPath.get(ROOT+r.path);if(!item||item.sha!==r.git_blob)throw Error("原图文件或 Git 哈希不匹配："+r.source_key)}
    const contents={"data.js":"window.ENWAN_DATA = "+JSON.stringify(data,null,2)+";\n","reviewed-release.json":JSON.stringify(manifest,null,2)+"\n","reviews/index.json":JSON.stringify(index,null,2)+"\n"};
    for(const [p,rs] of Object.entries(groups))contents[p]="[\n"+rs.map(r=>JSON.stringify(r)).join(",\n")+"\n]\n";
    const entries=Object.entries(contents).map(([p,content])=>({path:ROOT+p,mode:"100644",type:"blob",content}));for(const x of staged.values())entries.push({path:ROOT+x.path,mode:"100644",type:"blob",sha:x.sha});
    const t=await api("/git/trees","POST",{base_tree:baseTree,tree:entries});const c=await api("/git/commits","POST",{message:"Update wedding action cards and verified reference ledger",tree:t.sha,parents:[head]});if(await currentHead()!==head)throw Error("检测到并发修改，未覆盖正式分支");await api("/git/refs/heads/"+BRANCH,"PATCH",{sha:c.sha,force:false});
    head=c.sha;baseTree=t.sha;for(const x of staged.values())URL.revokeObjectURL(x.url);staged.clear();dirty=false;render();status("已提交 "+head.slice(0,8)+"，GitHub Pages 部署由 GitHub 执行；请在 Actions 查看成功后刷新网站。");$("actions").hidden=false;
  });

  let taskDraft=false,taskSelected="";
  const phases=v=>v.stages.filter(s=>/^S\d+$/.test(s.id)), flatTasks=v=>v.stages.flatMap(s=>s.items.map(t=>({t,s}))), viewData=()=>data||window.ENWAN_DATA;
  function validateTasks(v){const all=flatTasks(v),ids=new Set(all.map(x=>x.t.id)),cardIds=new Set(v.cards.map(c=>c.id));if(ids.size!==all.length)throw Error("拍摄任务编号重复");for(const {t,s} of all){if(!t.title?.trim()||!["必拍","选拍"].includes(t.priority)||!["all","bride","groom"].includes(t.side)||!Array.isArray(t.reference_ids)||new Set(t.reference_ids).size!==t.reference_ids.length||t.reference_ids.some(id=>!cardIds.has(id)))throw Error("无效拍摄任务："+t.id);if(!/^S\d+$/.test(s.id)){if(!phases(v).some(p=>p.id===t.phase_id)||t.parent_id&&!phases(v).some(p=>p.id===t.phase_id&&p.items.some(x=>x.id===t.parent_id)))throw Error("详细拍摄点归属无效："+t.id)}}}
  function parentOptions(v,phase,current){const sel=$("tparent");sel.replaceChildren(opt("","不指定主任务（阶段内独立详细点）"));for(const t of phases(v).find(s=>s.id===phase)?.items||[])sel.append(opt(t.id,t.title+" · "+t.id));sel.value=current||"";}
  function renderTasks(){const v=viewData();if(!v)return;const all=flatTasks(v),q=$("task-search").value.trim().toLowerCase(),sel=$("task-select");sel.replaceChildren();for(const {t,s} of all.filter(({t,s})=>!q||(t.id+" "+t.title+" "+s.title).toLowerCase().includes(q)))sel.append(opt(t.id,t.title+" · "+t.id));if(!taskDraft){if(![...sel.options].some(o=>o.value===taskSelected))taskSelected=sel.options[0]?.value||"";sel.value=taskSelected;}const item=all.find(x=>x.t.id===taskSelected),t=taskDraft?null:item?.t;$("task-form").hidden=!taskDraft&&!t;if(!taskDraft&&!t)return;const isDetail=!!item&&!taskDraft&&!/^S\d+$/.test(item.s.id);$("tphase").replaceChildren(...phases(v).map(s=>opt(s.id,s.title)));$("tphase").value=t?(isDetail?t.phase_id:item.s.id):phases(v)[0]?.id;$("ttitle").value=t?.title||"";$("tpriority").value=t?.priority||"选拍";$("tside").value=t?.side||"all";parentOptions(v,$("tphase").value,t?.parent_id);$("tparent").disabled=!isDetail;$("trefs").replaceChildren();for(const c of v.cards){const l=node("label",undefined,"check"),inp=node("input");inp.type="checkbox";inp.value=c.id;inp.checked=(t?.reference_ids||[]).includes(c.id);l.append(inp,document.createTextNode(c.title+" · "+c.id));$("trefs").append(l)}$("task-info").textContent=taskDraft?"新主任务（将生成新 ID）":t.id+" · "+(isDetail?"原版详细拍摄点":"主任务");for(const id of ["task-up","task-down","task-delete"])$(id).disabled=taskDraft}
  $("task-search").oninput=()=>{taskDraft=false;renderTasks()};$("task-select").onchange=()=>{taskDraft=false;taskSelected=$("task-select").value;renderTasks()};$("tphase").onchange=()=>parentOptions(viewData(),$("tphase").value,"");
  $("task-new").onclick=()=>{if(!canEdit())return;taskDraft=true;taskSelected="";renderTasks();$("ttitle").focus()};
  $("task-save").onclick=()=>{if(!canEdit())return;const title=$("ttitle").value.trim(),phase=$("tphase").value,stage=phases(data).find(s=>s.id===phase);if(!title||!stage)return alert("请填写任务名称和阶段");let item=flatTasks(data).find(x=>x.t.id===taskSelected),t=item?.t;if(taskDraft){t={id:"T-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),title,priority:"选拍",side:"all",reference_ids:[]};stage.items.push(t)}else if(!t)return;const isDetail=!taskDraft&&!/^S\d+$/.test(item.s.id);if(isDetail){t.phase_id=phase;t.parent_id=$("tparent").value||null}else if(!taskDraft&&item.s.id!==phase){item.s.items=item.s.items.filter(x=>x!==t);stage.items.push(t);for(const {t:x} of flatTasks(data))if(x.parent_id===t.id)x.phase_id=phase}Object.assign(t,{title,priority:$("tpriority").value,side:$("tside").value,reference_ids:[...$("trefs").querySelectorAll("input:checked")].map(x=>x.value)});taskDraft=false;taskSelected=t.id;$("task-search").value="";validateTasks(data);mark()};
  function moveTask(delta){if(!canEdit()||taskDraft)return;const item=flatTasks(data).find(x=>x.t.id===taskSelected);if(!item)return;const arr=item.s.items,i=arr.indexOf(item.t),n=i+delta;if(n<0||n>=arr.length)return;[arr[i],arr[n]]=[arr[n],arr[i]];mark()}
  $("task-up").onclick=()=>moveTask(-1);$("task-down").onclick=()=>moveTask(1);
  $("task-delete").onclick=()=>{if(!canEdit()||taskDraft)return;const item=flatTasks(data).find(x=>x.t.id===taskSelected);if(!item)return;if(flatTasks(data).some(x=>x.t.parent_id===item.t.id))return alert("先移动此任务的详细拍摄点");if(!confirm("删除任务："+item.t.title+"？本机项目中此任务的历史完成状态会失效。"))return;item.s.items=item.s.items.filter(x=>x!==item.t);taskSelected="";mark()};
  renderTasks();renderVisual();if(window.ENWAN_DATA)status("已加载正式网站照片。可直接浏览，编辑时连接 GitHub。");focusRequested();
  window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
})();
