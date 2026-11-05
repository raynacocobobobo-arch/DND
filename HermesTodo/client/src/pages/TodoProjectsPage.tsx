import { useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { zhCN } from "date-fns/locale";
import { Link } from "react-router-dom";

import { TaskCreateDialog } from "../components/TaskCreateDialog";
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

  return (
    <section className="tp-page">
      <header className="tp-header">
        <span className="tp-kicker">HERMES · THE BOOK OF DEEDS</span>
        <h1>待办清单<span className="tp-heading-punctuation">。</span></h1>
        <p>每一个大项目都有自己的子待办。按时间记录，逐项完成。</p>
        <div className="tp-header-actions">
          <span>未完成 <strong>{pending.length}</strong></span>
          <span>全部项目 <strong>{all.length}</strong></span>
          <button type="button" className="tp-primary-action" onClick={() => setCreating(true)}>＋ 新建大项目</button>
        </div>
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
              <span className="tp-date-glyph" aria-hidden="true">✥</span>
              <h2>{group.title}</h2>
              <time dateTime={group.day}>{group.day}</time>
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
                    <div className="tp-project-card">
                      <button type="button" className="tp-check" disabled={toggle.isPending}
                        aria-pressed={task.isCompleted} aria-label={(task.isCompleted ? "重新打开 " : "完成 ") + task.title}
                        onClick={() => void completeTask(task)}>{task.isCompleted ? "✓" : ""}</button>
                      <Link className="tp-project-link" to={"/inbox/" + encodeURIComponent(task.id)}>
                        <strong>{task.title}</strong>
                        <span className="tp-project-meta">
                          {total > 0 ? <span>{finished}/{total} 项子待办</span> : <span>点击添加子待办</span>}
                          {repeat ? <span className="tp-repeat">↻ {repeat}</span> : null}
                          {task.isCompleted ? <span>已完成</span> : null}
                        </span>
                        {total > 0 ? <span className="tp-progress-track" aria-label={"子待办完成 " + finished + "/" + total}><span style={{width: Math.round(finished / total * 100) + "%"}}/></span> : null}
                      </Link>
                      <span className="tp-project-arrow" aria-hidden="true">›</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      {creating ? <TaskCreateDialog contexts={[]} allowContextSelection={false} onClose={() => setCreating(false)} /> : null}
    </section>
  );
}
