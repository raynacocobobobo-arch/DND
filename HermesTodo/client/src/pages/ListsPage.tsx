import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { FleurDeLis } from "../components/HeraldicArt";
import { HeraldicIcon } from "../components/HeraldicIcon";
import { ListCard } from "../components/ListCard";
import { ListForm } from "../components/ListForm";
import { useCreateList, useLists, useReorderLists, useUpdateList, type ListRecord } from "../hooks/useLists";

export function ListsPage() {
  const lists=useLists();
  const create=useCreateList();
  const update=useUpdateList();
  const reorder=useReorderLists();
  const [ordered,setOrdered]=useState<ListRecord[]>([]);
  const [formOpen,setFormOpen]=useState(false);
  const [editing,setEditing]=useState<ListRecord>();
  const [quickName,setQuickName]=useState("");
  const [error,setError]=useState("");
  const [draggingId,setDraggingId]=useState<string>();

  useEffect(()=>{ if(lists.data) setOrdered(lists.data); },[lists.data]);

  async function quickCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name=quickName.trim();
    if(!name){setEditing(undefined);setFormOpen(true);return;}
    setError("");
    try{
      await create.mutateAsync({name,icon:"compass",color:"#8CAABA"});
      setQuickName("");
    }catch(e){setError(e instanceof Error?e.message:"清单创建失败，请重试");}
  }

  function moveDragged(targetId:string){
    if(!draggingId || draggingId===targetId) return;
    setOrdered(current=>{
      const from=current.findIndex(x=>x.id===draggingId);
      const to=current.findIndex(x=>x.id===targetId);
      if(from<0||to<0) return current;
      const next=[...current];
      const [item]=next.splice(from,1);
      next.splice(to,0,item!);
      return next;
    });
  }
  async function finishDrag(){
    const ids=ordered.map(x=>x.id);
    setDraggingId(undefined);
    if(ids.length>1) await reorder.mutateAsync(ids).catch(()=>void lists.refetch());
  }

  const sceneCount=ordered.reduce((n,x)=>n+x.sceneCount,0);
  const pendingCount=ordered.reduce((n,x)=>n+x.incompleteCount,0);

  return <section className="page-stack contexts-page scene-home lists-page">
    <header className="scene-home-hero">
      <img className="scene-home-art" src={`${import.meta.env.BASE_URL}art/joan-dragon-scene-hq.avif`} alt="" aria-hidden="true" loading="eager" decoding="async"/>
      <div className="scene-home-hero-copy">
        <span className="scene-home-eyebrow"><FleurDeLis size={16} aria-hidden="true"/> HERMES · THE BOOK OF LISTS</span>
        <h1>我的清单<span aria-hidden="true">。</span></h1>
        <p>先建立清单，再把不同场景归进去。<br/>名称、纹章与顺序，都由你自己决定。</p>
        <div className="scene-home-stats">
          <span><strong>{lists.isLoading?"—":ordered.length}</strong> 份清单</span>
          <span><strong>{lists.isLoading?"—":sceneCount}</strong> 个场景</span>
          <span><strong>{lists.isLoading?"—":pendingCount}</strong> 件待办</span>
        </div>
      </div>
      <Link to="/inbox" className="scene-home-inbox"><HeraldicIcon name="inbox" size={23}/><span>进入收集箱</span><HeraldicIcon name="arrow" size={20}/></Link>
    </header>

    <section className="scene-home-index" aria-label="清单目录">
      <div className="scene-home-index-heading">
        <div><span>CHAPTER I · LISTS</span><h2>清单目录</h2></div>
        <span className="scene-home-index-count">{ordered.length} LISTS</span>
      </div>
      <form className="quick-add scene-home-quickadd" onSubmit={(e)=>void quickCreate(e)}>
        {error?<p className="quick-add-error" role="alert">{error}</p>:null}
        <label className="sr-only" htmlFor="quick-add-list">快速新建清单</label>
        <input id="quick-add-list" value={quickName} onChange={(e)=>{setQuickName(e.target.value);setError("");}} placeholder="新建清单，例如：国内旅行、工作项目…"/>
        <button type="submit" aria-label="添加清单" disabled={create.isPending}><HeraldicIcon name="add" size={26}/></button>
      </form>
      {lists.isError?<p role="alert" className="dashboard-empty">清单读取失败。<button type="button" onClick={()=>void lists.refetch()}>重试</button></p>
      :lists.isLoading?<p className="dashboard-empty">正在读取清单…</p>
      :ordered.length?<ul className="context-grid scene-home-grid" aria-label="清单列表">
        {ordered.map(list=><ListCard key={list.id} list={list} dragging={draggingId===list.id}
          onEdit={()=>{setEditing(list);setFormOpen(true);}}
          onDragStart={()=>setDraggingId(list.id)}
          onDragOver={()=>moveDragged(list.id)}
          onDrop={()=>void finishDrag()}
          onDragEnd={()=>setDraggingId(undefined)}/>)}
      </ul>:<p className="empty-state dashboard-empty">还没有清单。先创建第一份清单。</p>}
      <p className="list-order-help">按住卡片底部的 ⋮⋮ 可拖动调整清单顺序。</p>
    </section>

    {formOpen?<ListForm list={editing} pending={create.isPending||update.isPending}
      onCancel={()=>setFormOpen(false)}
      onSubmit={(input)=>{
        const action=editing?update.mutateAsync({id:editing.id,...input}):create.mutateAsync(input);
        void action.then(()=>setFormOpen(false));
      }}/>:null}
  </section>;
}
