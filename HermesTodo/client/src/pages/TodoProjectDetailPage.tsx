import { useState, type FormEvent } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Link, useNavigate, useParams } from "react-router-dom";

import { TaskDetail } from "../components/TaskDetail";
import { ProjectRepeatDialog } from "../components/ProjectRepeatDialog";
import { useCreateTask, useDeleteTask, useTasks, useToggleTask, useUpdateTask } from "../hooks/useTasks";
import type { TaskRecord } from "../hooks/useTasks";

const zone = "Asia/Shanghai";
type StatusFilter = "active" | "all";

function displayTime(value: string) {
  return formatInTimeZone(value, zone, "yyyy年M月d日 HH:mm");
}
function repeatText(task: TaskRecord) {
  if (task.repeatInterval === "custom") return task.repeatRule || "自定义循环";
  return ({none:"不循环",daily:"每天",weekly:"每周",monthly:"每月",yearly:"每年"} as Record<string,string>)[task.repeatInterval] ?? "不循环";
}

export function TodoProjectDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useTasks({ scope:"inbox", sort:"createdAt" });
  const create = useCreateTask();
  const toggle = useToggleTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const [filter,setFilter] = useState<StatusFilter>("active");
  const [newTitle,setNewTitle] = useState("");
  const [editing,setEditing] = useState(false);
  const [repeatTask,setRepeatTask] = useState<TaskRecord|null>(null);
  const [editingChild,setEditingChild] = useState<string|null>(null);
  const [editingTitle,setEditingTitle] = useState("");
  const [deletingChild,setDeletingChild] = useState<string|null>(null);
  const [deletingProject,setDeletingProject] = useState(false);
  const [error,setError] = useState("");

  const project = query.data?.find(item => item.id === id && item.contextId === null);
  const children = project?.subtasks ?? [];
  const remaining = children.filter(child => !child.isCompleted);
  const completeCount = children.length - remaining.length;
  const visible = filter === "active" ? remaining : children;

  async function addChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || !project) return;
    setError("");
    try {
      await create.mutateAsync({title,parentTaskId:project.id});
      setNewTitle("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "添加子待办失败"); }
  }
  async function toggleChild(child: TaskRecord) {
    setError("");
    try { await toggle.mutateAsync(child.id); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "更新子待办失败"); }
  }
  async function toggleProject() {
    if (!project) return;
    setError("");
    try { await toggle.mutateAsync(project.id); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "更新项目失败"); }
  }
  async function saveChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingChild || !editingTitle.trim()) return;
    setError("");
    try {
      await update.mutateAsync({id:editingChild,title:editingTitle.trim()});
      setEditingChild(null);
      setEditingTitle("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "修改子待办失败"); }
  }
  async function deleteChild() {
    if (!deletingChild) return;
    setError("");
    try { await remove.mutateAsync(deletingChild); setDeletingChild(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "删除子待办失败"); }
  }
  async function deleteProject() {
    if (!project) return;
    setError("");
    try { await remove.mutateAsync(project.id); navigate("/inbox"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "删除项目失败"); }
  }

  if (query.isLoading) return <section className="tp-detail"><p className="tp-empty">正在打开项目…</p></section>;
  if (query.isError) return <section className="tp-detail"><p role="alert" className="tp-error">读取项目失败。<button type="button" onClick={() => void query.refetch()}>重试</button></p></section>;
  if (!project) return <section className="tp-detail"><Link to="/inbox" className="tp-back">← 返回待办清单</Link><p className="tp-empty">该项目不存在，或已移动到场景中。</p></section>;

  return (
    <section className="tp-detail">
      <Link className="tp-back" to="/inbox">← 返回待办清单</Link>
      <header className="tp-detail-header">
        <div className="tp-detail-heading-bar">
          <span className="tp-kicker">HERMES · PROJECT RECORD</span>
          <button type="button" className={"tp-repeat-trigger" + (project.repeatInterval !== "none" ? " tp-repeat-enabled" : "")}
            aria-label={"设置循环 " + project.title} title="按时间循环"
            onClick={() => setRepeatTask(project)}>↻</button>
        </div>
        <div className="tp-detail-title-row">
          <button type="button" className="tp-check tp-detail-master-check" disabled={toggle.isPending}
            aria-label={(project.isCompleted ? "重新打开 " : "完成 ") + project.title}
            aria-pressed={project.isCompleted} onClick={() => void toggleProject()}>{project.isCompleted ? "✓" : ""}</button>
          <h1>{project.title}</h1>
        </div>
        <p>{project.notes || "将大项目拆成可以逐项完成的小待办。"}</p>
        <div className="tp-detail-metadata">
          <span>创建于 {displayTime(project.createdAt)}</span>
          <span>{project.dueAt ? "计划 " + displayTime(project.dueAt) : "未设置执行日期"}</span>
          <span className={project.repeatInterval === "none" ? "" : "tp-repeat"}>↻ {repeatText(project)}</span>
          {project.completedAt ? <span>完成于 {displayTime(project.completedAt)}</span> : null}
        </div>
        <div className="tp-detail-actions">
          <button type="button" onClick={() => setEditing(true)}>编辑项目</button>
          <button type="button" onClick={() => setDeletingProject(true)} className="tp-danger-text">删除项目</button>
        </div>
      </header>

      <section className="tp-workspace" aria-label="项目子待办">
        <div className="tp-workspace-title">
          <div><span className="tp-kicker">SUBTASKS · CHECKLIST</span><h2>子待办</h2></div>
          <strong>{completeCount}/{children.length} 已完成</strong>
        </div>
        <div className="tp-meter"><div style={{width:(children.length ? Math.round(completeCount / children.length * 100) : 0) + "%"}}/></div>
        <form className="tp-add-child" onSubmit={(event) => void addChild(event)}>
          <label className="sr-only" htmlFor="tp-new-subtask">添加子待办</label>
          <input id="tp-new-subtask" value={newTitle} placeholder="添加一个小项目，例如：检查公积金5000…"
            onChange={event => setNewTitle(event.target.value)} maxLength={200}/>
          <button type="submit" disabled={!newTitle.trim() || create.isPending}>＋ 添加</button>
        </form>
        <div className="tp-workspace-controls">
          <div className="tp-switch" role="group" aria-label="子待办显示范围">
            <button type="button" aria-pressed={filter === "active"} className={filter === "active" ? "tp-switch-active" : ""}
              onClick={() => setFilter("active")}>未完成的</button>
            <button type="button" aria-pressed={filter === "all"} className={filter === "all" ? "tp-switch-active" : ""}
              onClick={() => setFilter("all")}>全部</button>
          </div>
          <span>{filter === "active" ? remaining.length : children.length} 项</span>
        </div>
        {error ? <p role="alert" className="tp-error">{error}</p> : null}
        <ul className="tp-child-list" aria-label="子待办列表">
          {visible.map(child => (
            <li key={child.id} className={"tp-child" + (child.isCompleted ? " tp-child-done" : "")}>
              <button type="button" className="tp-check" disabled={toggle.isPending}
                aria-label={(child.isCompleted ? "重新打开 " : "完成 ") + child.title}
                aria-pressed={child.isCompleted} onClick={() => void toggleChild(child)}>{child.isCompleted ? "✓" : ""}</button>
              <div className="tp-child-content">
                <span>{child.title}</span>
                <small>{child.isCompleted && child.completedAt ? "完成于 " + displayTime(child.completedAt) : "添加于 " + displayTime(child.createdAt)}</small>
              </div>
              <button type="button" className={"tp-inline-repeat" + (child.repeatInterval !== "none" ? " tp-inline-repeat-active" : "")}
                aria-label={"设置循环 " + child.title} title="按时间循环"
                onClick={() => setRepeatTask(child)}>↻</button>
              <button type="button" className="tp-child-action"
                aria-label={"编辑子待办 " + child.title} onClick={() => {setEditingChild(child.id);setEditingTitle(child.title);}}>编辑</button>
              <button type="button" className="tp-child-action tp-danger-text"
                aria-label={"删除子待办 " + child.title} onClick={() => setDeletingChild(child.id)}>删除</button>
            </li>
          ))}
        </ul>
        {visible.length === 0 ? <p className="tp-empty tp-empty-inline">{children.length && filter === "active" ? "子待办已全部完成。切换到「全部」查看记录。" : "还没有子待办，在上方添加第一项。"}</p> : null}
        {project.repeatInterval !== "none" ? <p className="tp-cycle-hint">每个周期单独打卡，保留同一项目与全部子待办，历史统计持续累计。</p> : null}
      </section>

      {editing ? <TaskDetail task={project} contexts={[]} onClose={() => setEditing(false)}/> : null}
      {repeatTask ? <ProjectRepeatDialog task={repeatTask} onClose={() => setRepeatTask(null)}/> : null}

      {editingChild ? <div className="tp-confirm-overlay" role="presentation">
        <section className="tp-confirm-box" role="dialog" aria-modal="true" aria-label="编辑子待办">
          <h2>编辑子待办</h2>
          <form onSubmit={event => void saveChild(event)}>
            <label>名称<input value={editingTitle} onChange={event => setEditingTitle(event.target.value)} maxLength={200} required /></label>
            <div><button type="button" onClick={() => setEditingChild(null)}>取消</button>
              <button type="submit" disabled={update.isPending || !editingTitle.trim()}>保存</button></div>
          </form>
        </section>
      </div> : null}

      {deletingChild ? <div className="tp-confirm-overlay" role="presentation">
        <section className="tp-confirm-box" role="dialog" aria-modal="true" aria-label="删除子待办">
          <h2>删除这条子待办？</h2><p>删除后不能恢复。</p>
          <div><button type="button" onClick={() => setDeletingChild(null)}>取消</button>
            <button type="button" className="tp-danger-button" disabled={remove.isPending} onClick={() => void deleteChild()}>确认删除</button></div>
        </section>
      </div> : null}

      {deletingProject ? <div className="tp-confirm-overlay" role="presentation">
        <section className="tp-confirm-box" role="dialog" aria-modal="true" aria-label="删除大项目">
          <h2>删除整个项目？</h2><p>这个项目及其所有子待办都会被删除，操作无法撤销。</p>
          <div><button type="button" onClick={() => setDeletingProject(false)}>取消</button>
            <button type="button" className="tp-danger-button" disabled={remove.isPending} onClick={() => void deleteProject()}>确认删除项目</button></div>
        </section>
      </div> : null}
    </section>
  );
}
