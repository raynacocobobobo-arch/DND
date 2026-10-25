import { useState } from "react";
import { ChevronLeft, Copy } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { QuickAdd } from "../components/QuickAdd";
import { TaskList } from "../components/TaskList";
import { TaskDetail } from "../components/TaskDetail";
import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { useContexts } from "../hooks/useContexts";
import { useTasks, type TaskSort } from "../hooks/useTasks";

export function ContextDetailPage() {
  const { id = "" } = useParams();
  const contexts = useContexts();
  const [sort, setSort] = useState<TaskSort>("createdAt");
  const [search, setSearch] = useState("");
  const tasks = useTasks({ contextId: id, sort, search: search || undefined });
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const context = contexts.data?.find((item) => item.id === id);
  const selectedTask = tasks.data?.find((task) => task.id === selectedTaskId);

  if (!contexts.isLoading && !context) return <Navigate to="/contexts" replace />;
  if (!context) return <p>正在读取情境…</p>;

  async function copyList() {
    const items = tasks.data ?? [];
    const lines = [`【${context!.name}】`];
    if (items.length === 0) lines.push("（暂无待办）");
    else for (const task of items) lines.push(`${task.isCompleted ? "●" : "○"} ${task.title}`);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
  }

  return (
    <section className="page-stack context-detail-page">
      <header className="ios-page-header context-detail-header">
        <Link className="back-link" to="/contexts"><ChevronLeft aria-hidden="true" size={18} />情境</Link>
        <div><h1>{context.name}</h1><p>{context.incompleteCount} 件未完成</p></div>
        <button type="button" className="icon-button" aria-label="复制待办" onClick={() => void copyList()}><Copy aria-hidden="true" size={18} /></button>
      </header>
      {copied ? <p className="copy-toast" role="status">已复制待办</p> : null}
      <label className="search-control"><span className="sr-only">搜索任务</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索任务…" /></label>
      <section className="task-section">
        <div className="section-heading"><h2>待办 {tasks.data?.filter((task) => !task.isCompleted).length ?? 0}</h2><label className="inline-control"><span className="sr-only">排序方式</span><select aria-label="任务排序" value={sort} onChange={(event) => setSort(event.target.value as TaskSort)}><option value="createdAt">最近添加</option><option value="dueDate">截止日期</option></select></label></div>
        {tasks.isLoading ? <p>正在读取待办…</p> : <TaskList tasks={tasks.data ?? []} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)} />}
      </section>
      <QuickAdd contextId={context.id} onEmpty={() => setCreateTaskOpen(true)} />
      {selectedTask ? <TaskDetail task={selectedTask} contexts={contexts.data ?? []} onClose={() => setSelectedTaskId(undefined)} /> : null}
      {createTaskOpen ? <TaskCreateDialog contexts={contexts.data ?? []} initialContextId={context.id} onClose={() => setCreateTaskOpen(false)} /> : null}
    </section>
  );
}
