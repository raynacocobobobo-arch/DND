import { ArrowUpRight, CirclePlus, Inbox } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import type { Task } from "../../../shared/contracts";
import { apiRequest } from "../api/client";
import { FleurDeLis } from "../components/HeraldicArt";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ContextCard } from "../components/ContextCard";
import { ContextForm } from "../components/ContextForm";
import { useContexts, useCreateContext, useDeleteContext, useUpdateContext, type ContextRecord } from "../hooks/useContexts";

/** The primary page is the user's collection of scenes/lists, not the old task dashboard. */
export function ContextsPage() {
  const contexts = useContexts();
  const create = useCreateContext();
  const update = useUpdateContext();
  const remove = useDeleteContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContextRecord | undefined>();
  const [deleting, setDeleting] = useState<ContextRecord | undefined>();
  const [copiedId, setCopiedId] = useState<string>();
  const [quickName, setQuickName] = useState("");
  const [createError, setCreateError] = useState("");

  function openNewContextForm() {
    setEditing(undefined);
    setFormOpen(true);
  }

  async function submitQuickContext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = quickName.trim();
    if (!name) {
      openNewContextForm();
      return;
    }
    setCreateError("");
    try {
      await create.mutateAsync({ name, icon: "folder", color: "#8CAABA" });
      setQuickName("");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "清单创建失败，请重试");
    }
  }

  async function copyContext(context: ContextRecord) {
    const tasks = await apiRequest<Task[]>(`/api/tasks?contextId=${context.id}&sort=createdAt`);
    const lines = [`【${context.name}】`, ...tasks.map((task) => `${task.isCompleted ? "●" : "○"} ${task.title}`)];
    if (tasks.length === 0) lines.push("（暂无待办）");
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedId(context.id);
  }

  const listCount = contexts.data?.length ?? 0;
  const pendingCount = contexts.data?.reduce((total, item) => total + item.incompleteCount, 0) ?? 0;

  return (
    <section className="page-stack contexts-page scene-home">
      <header className="scene-home-hero">
        <img className="scene-home-art" src={`${import.meta.env.BASE_URL}art/joan-dragon-scene-hq.avif`}
          alt="" aria-hidden="true" loading="eager" decoding="async"/>
        <div className="scene-home-hero-copy">
          <span className="scene-home-eyebrow"><FleurDeLis size={16} aria-hidden="true"/> HERMES · THE BOOK OF LISTS</span>
          <h1>我的清单<span aria-hidden="true">。</span></h1>
          <p>将生活与计划，归入各自的篇章。<br/>打开一个场景，继续完成里面的事。</p>
          <div className="scene-home-stats" aria-label="清单概览">
            <span><strong>{contexts.isLoading ? "—" : listCount}</strong> 份清单</span>
            <span><strong>{contexts.isLoading ? "—" : pendingCount}</strong> 件待办</span>
          </div>
        </div>
        <Link to="/inbox" className="scene-home-inbox">
          <Inbox size={18} aria-hidden="true"/>
          <span>进入收集箱</span>
          <ArrowUpRight size={16} aria-hidden="true"/>
        </Link>
      </header>

      <section className="scene-home-index" aria-label="清单目录">
        <div className="scene-home-index-heading">
          <div><span>CHAPTER I · COLLECTIONS</span><h2>场景目录</h2></div>
          <span className="scene-home-index-count">{listCount} LISTS</span>
        </div>
        <form className="quick-add scene-home-quickadd" onSubmit={(event) => void submitQuickContext(event)}>
          {createError ? <p className="quick-add-error" role="alert">{createError}</p> : null}
          <label className="sr-only" htmlFor="quick-add-context">快速新建清单</label>
          <input id="quick-add-context" value={quickName}
            onChange={(event) => { setQuickName(event.target.value); setCreateError(""); }}
            placeholder="新建清单，写下一个场景名称…" />
          <button type="submit" aria-label="添加清单" disabled={create.isPending}><CirclePlus aria-hidden="true" size={25}/></button>
        </form>
        {copiedId ? <p className="copy-toast" role="status">已复制待办</p> : null}
        {contexts.isError ? (
          <p role="alert" className="dashboard-empty">清单读取失败。<button type="button" onClick={() => void contexts.refetch()}>重试</button></p>
        ) : contexts.isLoading ? (
          <p className="dashboard-empty">正在读取清单…</p>
        ) : contexts.data?.length ? (
          <ul className="context-grid scene-home-grid" aria-label="清单列表">
            {contexts.data.map((context) => <ContextCard key={context.id} context={context}
              onEdit={() => { setEditing(context); setFormOpen(true); }}
              onCopy={() => void copyContext(context)}
              onDelete={() => setDeleting(context)} />)}
          </ul>
        ) : (
          <p className="empty-state dashboard-empty">还没有清单。在上方写下一个场景名称，创建第一份清单。</p>
        )}
      </section>
      {formOpen ? <ContextForm context={editing} pending={create.isPending || update.isPending}
        onCancel={() => setFormOpen(false)}
        onSubmit={(input) => {
          const action = editing ? update.mutateAsync({ id: editing.id, ...input }) : create.mutateAsync(input);
          void action.then(() => setFormOpen(false));
        }} /> : null}
      {deleting ? <ConfirmDialog title="删除清单？" message="清单内的任务不会被删除，将返回收集箱。"
        pending={remove.isPending} onCancel={() => setDeleting(undefined)}
        onConfirm={() => void remove.mutateAsync(deleting.id).then(() => setDeleting(undefined))} /> : null}
    </section>
  );
}
