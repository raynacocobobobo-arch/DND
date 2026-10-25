import { CirclePlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { Task } from "../../../shared/contracts";
import { apiRequest } from "../api/client";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ContextCard } from "../components/ContextCard";
import { ContextForm } from "../components/ContextForm";
import { useContexts, useCreateContext, useDeleteContext, useUpdateContext, type ContextRecord } from "../hooks/useContexts";

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
    await create.mutateAsync({ name, icon: "folder", color: "#8CAABA" });
    setQuickName("");
  }

  async function copyContext(context: ContextRecord) {
    const tasks = await apiRequest<Task[]>(`/api/tasks?contextId=${context.id}&sort=priority`);
    const lines = [`【${context.name}】`, ...tasks.map((task) => `${task.isCompleted ? "●" : "○"} ${task.title}`)];
    if (tasks.length === 0) lines.push("（暂无待办）");
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedId(context.id);
  }

  return (
    <section className="page-stack contexts-page">
      <header className="ios-page-header">
        <span aria-hidden="true" />
        <h1>情境</h1>
        <span aria-hidden="true" />
      </header>
      {copiedId ? <p className="copy-toast" role="status">已复制待办</p> : null}
      {contexts.isLoading ? <p>正在读取情境…</p> : contexts.data?.length ? (
        <ul className="context-grid" aria-label="情境列表">
          {contexts.data.map((context) => <ContextCard key={context.id} context={context} onEdit={() => { setEditing(context); setFormOpen(true); }} onCopy={() => void copyContext(context)} onDelete={() => setDeleting(context)} />)}
        </ul>
      ) : <p className="empty-state dashboard-empty">还没有情境，点下方 + 创建第一个情境。</p>}
      {formOpen ? <ContextForm context={editing} pending={create.isPending || update.isPending} onCancel={() => setFormOpen(false)} onSubmit={(input) => {
        const action = editing ? update.mutateAsync({ id: editing.id, ...input }) : create.mutateAsync(input);
        void action.then(() => setFormOpen(false));
      }} /> : null}
      {deleting ? <ConfirmDialog title="删除情境？" message="任务不会被删除，但会变为无情境。" pending={remove.isPending} onCancel={() => setDeleting(undefined)} onConfirm={() => void remove.mutateAsync(deleting.id).then(() => setDeleting(undefined))} /> : null}
      <form className="quick-add" onSubmit={(event) => void submitQuickContext(event)}>
        <label className="sr-only" htmlFor="quick-add-context">快速新建情境</label>
        <input id="quick-add-context" value={quickName} onChange={(event) => setQuickName(event.target.value)} placeholder="新建情境..." />
        <button type="submit" aria-label="添加情境" disabled={create.isPending}><CirclePlus aria-hidden="true" size={25} /></button>
      </form>
    </section>
  );
}
