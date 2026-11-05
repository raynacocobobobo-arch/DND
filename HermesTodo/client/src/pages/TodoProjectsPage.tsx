import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { zhCN } from "date-fns/locale";
import { Link } from "react-router-dom";

import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { ProjectRepeatDialog } from "../components/ProjectRepeatDialog";
import { useTasks, useToggleTask, type TaskRecord } from "../hooks/useTasks";

type StatusFilter = "active" | "all";
const zone = "Asia/Shanghai";

function eventDate(task: TaskRecord) {
  return task.isCompleted ? task.completedAt ?? task.updatedAt : task.dueAt ?? task.createdAt;
}
function dayKey(value: string) {
  return formatInTimeZone(value, zone, "yyyy-MM-dd");
}
function repeatLabel(task: TaskRecord) {
  if (task.repeatInterval === "custom") return task.repeatRule || "自定义循环";
  return ({ daily: "每天", weekly: "每周", monthly: "每月", yearly: "每年" } as Record<string,string>)[task.repeatInterval] ?? "";
}

export function TodoProjectsPage() {
  const query = useTasks({ scope: "inbox", sort: "createdAt" });
  const toggle = useToggleTask();
  const [filter,setFilter] = useState<StatusFilter>("active");
  const [creating,setCreating] = useState(false);
  const [repeatTask,setRepeatTask] = useState<TaskRecord | null>(null);
  const [collapsedIds,setCollapsedIds] = useState<Set<string>>(new Set());
  const [error,setError] = useState("");
  const all = query.data ?? [];
  const pending = all.filter(task => !task.isCompleted);
  const grouped = useMemo(() => {
    const days = new Map<string, TaskRecord[]>();
    for (const task of all) {
      if (filter === "active" && task.isCompleted) continue;
      const key = dayKey(eventDate(task));
      days.set(key, [...(days.get(key) ?? []), task]);
    }
    return [...days.entries()].sort(([a],[b]) => b.localeCompare(a)).map(([day, records]) => ({
      day,
      title: formatInTimeZone(day + "T12:00:00+08:00", zone, "M月d日 EEEE", {locale: zhCN}),
      records: records.sort((a,b) => eventDate(b).localeCompare(eventDate(a)))
    }));
  }, [all,filter]);

  async function completeTask(task: TaskRecord) {
    setError("");
    try { await toggle.mutateAsync(task.id); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "更新项目失败"); }
  }

  function toggleFold(id:string) {
    setCollapsedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function completeChild(child: TaskRecord) {
    setError("");
    try { await toggle.mutateAsync(child.id); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "更新子待办失败"); }
  }

  return (
    <section className="tp-page">
      <header className="tp-header">
        <div className="tp-header-top">
          <h1>待办清单</h1>
          <button type="button" className="tp-primary-action" onClick={() => setCreating(true)}>＋ 新建大项目</button>
        </div>
        <p className="tp-header-caption">{pending.length} 个未完成项目 · 共 {all.length} 个项目</p>
      </header>
      <div className="tp-toolbar">
        <div className="tp-switch" role="group" aria-label="待办显示范围">
          <button type="button" aria-pressed={filter === "active"}
            className={filter === "active" ? "tp-switch-active" : ""}
            onClick={() => setFilter("active")}>未完成的</button>
          <button type="button" aria-pressed={filter === "all"}
            className={filter === "all" ? "tp-switch-active" : ""}
            onClick={() => setFilter("all")}>全部</button>
        </div>
        <span className="tp-toolbar-count">当前显示 {grouped.reduce((total, group) => total + group.records.length,0)} 项</span>
      </div>
      {error ? <p className="tp-error" role="alert">{error}</p> : null}
      {query.isError ? <p className="tp-error" role="alert">无法读取待办清单。<button type="button" onClick={() => void query.refetch()}>重试</button></p> : null}
      {query.isLoading ? <p className="tp-empty">正在读取待办清单…</p> : null}
      {!query.isLoading && grouped.length === 0 ? <div className="tp-empty">这里还没有{filter === "active" ? "未完成的" : ""}大项目。点击「新建大项目」开始。</div> : null}
      <div className="tp-timeline">
        {grouped.map(group => (
          <section key={group.day} className="tp-date-group">
            <header className="tp-date-head">
              <span className="tp-date-glyph" aria-hidden="true">▦</span>
              <h2><time dateTime={group.day}>{group.title}</time></h2>
            </header>
            <ul className="tp-project-list">
              {group.records.map(task => {
                const finished = task.subtasks.filter(child => child.isCompleted).length;
                const total = task.subtasks.length;
                const repeat = repeatLabel(task);
                return (
                  <li key={task.id} className={"tp-project" + (task.isCompleted ? " tp-project-done" : "")}>
                    <time className="tp-project-time" dateTime={eventDate(task)}>{formatInTimeZone(eventDate(task), zone, "HH:mm")}</time>
                    <span className="tp-project-dot" aria-hidden="true"/>
                    <div className="tp-project-shell">
                      <div className="tp-project-card">
                        <button type="button" className="tp-check" disabled={toggle.isPending}
                          aria-pressed={task.isCompleted} aria-label={(task.isCompleted ? "重新打开 " : "完成 ") + task.title}
                          onClick={() => void completeTask(task)}>{task.isCompleted ? "✓" : ""}</button>
                        <Link className="tp-project-link" to={"/inbox/" + encodeURIComponent(task.id)}>
                          <strong>{task.title}</strong>
                          <span className="tp-project-meta">
                            {total > 0 ? <span>{finished}/{total} 项子待办</span> : <span>点击添加子待办</span>}
                            {repeat ? <span className="tp-repeat">↻ {repeat} · 完成 {task.checkinCount ?? 0} / {task.scheduledCount ?? 0} 次</span> : null}
                            {task.isCompleted ? <span>已完成</span> : null}
                          </span>
                          {total > 0 ? <span className="tp-progress-track" aria-label={"子待办完成 " + finished + "/" + total}><span style={{width: Math.round(finished / total * 100) + "%"}}/></span> : null}
                        </Link>
                        <div className="tp-project-tools">
                          <button type="button" className={"tp-repeat-trigger" + (repeat ? " tp-repeat-enabled" : "")}
                            aria-label={"设置循环 " + task.title} title="设置循环周期"
                            onClick={()=>setRepeatTask(task)}>↻</button>
                          {total > 0 ? <button type="button" className="tp-collapse-trigger"
                            aria-label={(collapsedIds.has(task.id) ? "展开" : "折叠") + "子待办 " + task.title}
                            aria-expanded={!collapsedIds.has(task.id)} aria-controls={"tp-children-" + task.id}
                            onClick={()=>toggleFold(task.id)}>
                            <span aria-hidden="true">{collapsedIds.has(task.id) ? "⌄" : "⌃"}</span>
                          </button> : null}
                        </div>
                      </div>
                      {total > 0 ? <div className="tp-inline-children" id={"tp-children-" + task.id} hidden={collapsedIds.has(task.id)}>
                        <ul aria-label={task.title + " 子待办"}>
                          {task.subtasks.filter(child => filter === "all" || !child.isCompleted).map(child => (
                            <li key={child.id} className={"tp-inline-child" + (child.isCompleted ? " tp-inline-child-done" : "")}>
                              <button type="button" className="tp-check" disabled={toggle.isPending}
                                aria-label={(child.isCompleted ? "重新打开 " : "完成 ") + child.title}
                                aria-pressed={child.isCompleted} onClick={() => void completeChild(child)}>
                                {child.isCompleted ? "✓" : ""}
                              </button>
                              <span className="tp-inline-child-detail">
                                <span>{child.title}</span>
                                {child.notes ? <small>{child.notes}</small> : null}
                                {(child.repeatInterval !== "none" || (child.scheduledCount??0)>0) ?
                                  <small className="tp-repeat">已打卡 {child.checkinCount ?? 0} / {child.scheduledCount ?? 0} 次</small> : null}
                              </span>
                              <button type="button"
                                className={"tp-inline-repeat" + (child.repeatInterval !== "none" ? " tp-inline-repeat-active" : "")}
                                title="按时间循环" aria-label={"设置循环 " + child.title}
                                onClick={() => setRepeatTask(child)}>↻</button>
                            </li>
                          ))}
                        </ul>
                        {filter === "active" && finished === total ? <p>子待办已全部完成，可切换「全部」查看记录。</p> : null}
                        <Link className="tp-inline-edit" to={"/inbox/" + encodeURIComponent(task.id)}>进入项目详情</Link>
                      </div> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {repeatTask ? <ProjectRepeatDialog task={repeatTask} onClose={() => setRepeatTask(null)} /> : null}
      {creating ? <TaskCreateDialog contexts={[]} allowContextSelection={false} onClose={() => setCreating(false)} /> : null}
    </section>
  );
}
