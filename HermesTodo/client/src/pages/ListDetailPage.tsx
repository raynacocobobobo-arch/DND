import { useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import type { Task } from "../../../shared/contracts";
import { apiRequest } from "../api/client";
import { ContextCard } from "../components/ContextCard";
import { ContextForm } from "../components/ContextForm";
import { FleurDeLis } from "../components/HeraldicArt";
import { HeraldicIcon } from "../components/HeraldicIcon";
import { useContexts, useCreateContext, useDeleteContext, useUpdateContext, type ContextRecord } from "../hooks/useContexts";
import { useLists } from "../hooks/useLists";

export function ListDetailPage() {
  const { id = "" } = useParams();
  const lists = useLists();
  const contexts = useContexts({ listId: id });
  const create = useCreateContext();
  const update = useUpdateContext();
  const remove = useDeleteContext();
  const [formOpen,setFormOpen]=useState(false);
  const [editing,setEditing]=useState<ContextRecord>();
  const [quickName,setQuickName]=useState("");
  const [error,setError]=useState("");
  const [copiedId,setCopiedId]=useState<string>();
  const list=lists.data?.find(item=>item.id===id);

  if(!lists.isLoading && !list) return <Navigate to="/" replace/>;
  if(!list) return <p>正在读取清单…</p>;

  async function quickCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name=quickName.trim();
    if(!name){setEditing(undefined);setFormOpen(true);return;}
    setError("");
    try{
      await create.mutateAsync({name,icon:"folder",color:"#8CAABA",listId:id});
      setQuickName("");
    }catch(e){setError(e instanceof Error?e.message:"场景创建失败，请重试");}
  }

  async function copyContext(context: ContextRecord) {
    const tasks=await apiRequest<Task[]>(`/api/tasks?contextId=${context.id}&sort=createdAt`);
    const lines=[`【${context.name}】`,...tasks.map(task=>`${task.isCompleted?"●":"○"} ${task.title}`)];
    if(!tasks.length) lines.push("（暂无待办）");
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedId(context.id);
  }

  const sceneCount=contexts.data?.length ?? 0;
  const pendingCount=contexts.data?.reduce((n,item)=>n+item.incompleteCount,0) ?? 0;

  return <section className="page-stack contexts-page scene-home list-detail-page">
    <header className="scene-home-hero list-detail-hero">
      <img className="scene-home-art" src={`${import.meta.env.BASE_URL}art/joan-dragon-scene-hq.avif`} alt="" aria-hidden="true" loading="eager" decoding="async"/>
      <div className="scene-home-hero-copy">
        <span className="scene-home-eyebrow"><FleurDeLis size={16} aria-hidden="true"/> HERMES · SCENES</span>
        <h1>{list.name}<span aria-hidden="true">。</span></h1>
        <p>这份清单里的场景与任务独立保存。<br/>新增场景不会影响其它清单。</p>
        <div className="scene-home-stats">
          <span><strong>{contexts.isLoading?"—":sceneCount}</strong> 个场景</span>
          <span><strong>{contexts.isLoading?"—":pendingCount}</strong> 件待办</span>
        </div>
      </div>
      <Link to="/" className="scene-home-inbox"><HeraldicIcon name="scroll" size={23}/><span>返回清单</span><HeraldicIcon name="arrow" size={20}/></Link>
    </header>

    <section className="scene-home-index" aria-label="场景目录">
      <div className="scene-home-index-heading">
        <div><span>CHAPTER II · SCENES</span><h2>场景目录</h2></div>
        <span className="scene-home-index-count">{sceneCount} SCENES</span>
      </div>
      <form className="quick-add scene-home-quickadd" onSubmit={(e)=>void quickCreate(e)}>
        {error?<p className="quick-add-error" role="alert">{error}</p>:null}
        <label className="sr-only" htmlFor="quick-add-scene">快速新建场景</label>
        <input id="quick-add-scene" value={quickName} onChange={(e)=>{setQuickName(e.target.value);setError("");}}
          placeholder="新建场景，例如：证件、药品、服装…"/>
        <button type="submit" aria-label="添加场景" disabled={create.isPending}><HeraldicIcon name="add" size={26}/></button>
      </form>
      {copiedId?<p className="copy-toast" role="status">已复制场景待办</p>:null}
      {contexts.isError?<p role="alert" className="dashboard-empty">场景读取失败。<button type="button" onClick={()=>void contexts.refetch()}>重试</button></p>
      :contexts.isLoading?<p className="dashboard-empty">正在读取场景…</p>
      :contexts.data?.length?<ul className="context-grid scene-home-grid" aria-label="场景列表">
        {contexts.data.map(context=><ContextCard key={context.id} context={context}
          onEdit={()=>{setEditing(context);setFormOpen(true);}}
          onCopy={()=>void copyContext(context)}
          onDelete={()=>void remove.mutateAsync(context.id)}/>)}
      </ul>:<p className="empty-state dashboard-empty">这份清单还没有场景。创建第一个场景后，再往里面添加任务。</p>}
    </section>

    {formOpen?<ContextForm context={editing} entityLabel="场景" pending={create.isPending||update.isPending}
      onCancel={()=>setFormOpen(false)}
      onSubmit={(input)=>{
        const action=editing
          ? update.mutateAsync({id:editing.id,...input})
          : create.mutateAsync({...input,listId:id});
        void action.then(()=>setFormOpen(false));
      }}/>:null}
  </section>;
}
