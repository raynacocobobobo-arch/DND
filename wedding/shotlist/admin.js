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
  for(const c of cards){const m=published.filter(r=>r.assigned_card_id===c.id);c.images=m.map(r=>r.path);c.image_notes=m.map(r=>({source:r.source_key,reason:r.match_reason}));c.reference_note=m.length?"已逐图审核的动作参考；影视或广告画面仅作为调度示范。":"";}
  const original=rows.filter(r=>/^[WR]\d+$/.test(r.source_key)), approved=original.filter(r=>r.review_status==="approved").length, excluded=original.filter(r=>r.review_status==="excluded").length,pending=original.filter(r=>r.review_status==="pending").length;
  index.files=Object.keys(groups).sort();index.counts={reviewed:original.length,approved,excluded,pending,unreviewed:1482-original.length,user_uploads:rows.length-original.length};data.reviewed_release={images:published.length,core_cards:cards.filter(c=>c.is_core).length,additional_cards:cards.filter(c=>!c.is_core).length};
  return published;
}
(function admin(){
  "use strict";
  const ROOT="wedding/shotlist/", API="https://api.github.com/repos/raynacocobobobo-arch/DND",BRANCH="gh-pages",CATS=["晨间准备","接亲与转场","新人双人补拍","仪式现场","宴会与收尾"], LEVELS=["纪实优先","轻引导","条件选拍"];
  const $=id=>document.getElementById(id), node=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n}, button=(txt,fn)=>{const b=node("button",txt);b.type="button";b.onclick=fn;return b}, opt=(v,t)=>{const o=node("option",t);o.value=v;return o};
  let token="",head="",baseTree="",data=null,index=null,groups={},published=[],dirty=false,staged=new Map(),busy=false,selectedCard="",page=0,selectedImage="";
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
    const before=JSON.stringify(next.cards.map(c=>[c.id,c.images]));const rel=buildRelease(next,nextGroups,idx);if(before!==JSON.stringify(next.cards.map(c=>[c.id,c.images])))throw Error("仓库中动作卡与审查账本不一致，禁止覆盖");
    head=h;baseTree=c.tree.sha;data=next;index=idx;groups=nextGroups;published=rel;for(const s of staged.values())URL.revokeObjectURL(s.url);staged.clear();dirty=false;page=0;selectedCard=data.cards[0]?.id||"";selectedImage="";$("editor").hidden=false;$("auth").hidden=true;render();status("已读取正式分支 "+head.slice(0,8)+"。修改先暂存，再统一发布。");
  }
  function locked(on){busy=on;$("publish").disabled=on||!dirty;$("reload").disabled=on;$("logout").disabled=on;$("login").disabled=on;$("editor").inert=on}
  async function run(fn){if(busy)return;locked(true);try{await fn()}catch(e){status(e.message||"操作失败")}finally{locked(false)}}
  function cardOptions(select, includeBlank=false){let prev=select.value;select.replaceChildren();if(includeBlank)select.append(opt("","请选择动作卡"));for(const c of data.cards)select.append(opt(c.id,c.category+" · "+c.title+" ("+c.id+")"));if([...select.options].some(o=>o.value===prev))select.value=prev;}
  function mark(){dirty=true;published=buildRelease(data,groups,index);render();status("有未发布的修改。点击“提交并发布”统一保存。")}
  function render(){
    const c=index.counts;$("counts").textContent=`原稿已审 ${c.reviewed}/1482 · 已发布 ${c.approved} · 排除 ${c.excluded} · 待发布 ${c.pending} · 后台新增 ${c.user_uploads||0} · 动作卡 ${data.cards.length}`;
    $("publish").disabled=busy||!dirty;$("dirty").textContent=dirty?"有未提交的修改":"已与 GitHub 同步";cardOptions($("upload-card"),true);cardOptions($("card-select"));
    $("card-select").value=selectedCard;renderCard();renderImages();
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
  function renderCard(){
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
  $("save-card").onclick=()=>{const c=data.cards.find(x=>x.id===selectedCard);if(!c)return;const title=$("ctitle").value.trim(),promptText=$("cprompt").value.trim(),camera=$("ccamera").value.trim();if(!title||!promptText||!camera)return status("名称、现场口令、摄影机位必填");Object.assign(c,{title,category:$("ccat").value,action_level:$("clevel").value,applicable_when:$("cwhen").value.trim(),prompt:promptText,camera,delivery_check:$("ccheck").value.trim()});mark()};
  $("new-card").onclick=()=>{const title=prompt("新动作卡名称（仅原动作确实无法覆盖时新增）");if(!title?.trim())return;const used=new Set(data.cards.map(c=>c.id));let i=34;while(used.has("A"+String(i).padStart(2,"0")))i++;const id="A"+String(i).padStart(2,"0");data.cards.push({id,title:title.trim(),category:CATS[0],action_level:LEVELS[2],applicable_when:"",prompt:"",camera:"",delivery_check:"",is_core:false,images:[],image_notes:[]});selectedCard=id;dirty=true;render();status("请完善新增卡片的口令、机位等字段并暂存。")};
  $("delete-card").onclick=()=>{const c=data.cards.find(x=>x.id===selectedCard);if(!c)return;if(rows().some(r=>r.assigned_card_id===c.id))return status("请先移动或排除该卡的所有图片");if(!confirm("删除 "+c.title+"？原 Git 历史仍可恢复。"))return;data.cards=data.cards.filter(x=>x.id!==c.id);selectedCard=data.cards[0]?.id||"";mark()};
  $("add-image").onclick=()=>run(async()=>{
    const f=$("upload").files[0],card=$("upload-card").value,desc=$("description").value.trim(),reason=$("reason").value.trim();if(!f||!card||!desc||!reason)throw Error("请选择图片、动作卡，并填写视觉描述和采用依据");
    const exts={"image/jpeg":"jpeg","image/png":"png","image/webp":"webp","image/gif":"gif"};if(!exts[f.type]||f.size>15*1024*1024||!f.size)throw Error("仅支持不超过15MB的 JPG、PNG、WebP、GIF");
    const bitmap=await createImageBitmap(f),width=bitmap.width,height=bitmap.height;bitmap.close();const bytes=new Uint8Array(await f.arrayBuffer()),hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
    if(rows().some(r=>r.sha256===hash))throw Error("相同原图已经存在，请移动或恢复已有记录");
    const id="U"+hash.slice(0,24), path="assets/references/reviewed/"+id+"."+exts[f.type];const b=await api("/git/blobs","POST",{content:b64(bytes),encoding:"base64"});
    const r={source_key:id,source_refs:[],source_document:"后台新增",source_group:"人工选择",source_order:0,sha256:hash,mime_type:f.type,file_size:f.size,width,height,path,git_blob:b.sha,storage_path:new URL(path,location.href).href,visual_description:desc,match_reason:reason,match_type:"reference",assigned_card_id:card,review_status:"approved",review_notes:"后台人工审核 "+new Date().toISOString(),sort_order:0};
    (groups["reviews/uploads.json"]??=[]).push(r);staged.set(id,{path,sha:b.sha,url:URL.createObjectURL(f)});$("upload").value="";$("description").value="";$("reason").value="";mark();
  });
  $("publish").onclick=()=>run(async()=>{
    if(!dirty)return;if(data.cards.some(c=>!c.title?.trim()||!c.prompt?.trim()||!c.camera?.trim()||!CATS.includes(c.category)))throw Error("有未填写完整的动作卡，先保存卡片内容");
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
  window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
})();
