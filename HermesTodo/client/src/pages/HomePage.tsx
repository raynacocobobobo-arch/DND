import { zhCN } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { ChevronRight, Sparkles, ArrowUpRight, Plus, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

import { ContextIcon } from "../components/ContextIcon";
import { FleurDeLis, HeraldicDivider } from "../components/HeraldicArt";
import { QuickAdd } from "../components/QuickAdd";
import { TaskList } from "../components/TaskList";
import { TaskDetail } from "../components/TaskDetail";
import { TaskCreateDialog } from "../components/TaskCreateDialog";
import { useState } from "react";
import { useContexts } from "../hooks/useContexts";
import { useTasks } from "../hooks/useTasks";

export function HomePage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "done">("all");
  const contexts = useContexts();
  const tasks = useTasks({ sort: "priority" });
  const allTasks = tasks.data ?? [];
  const selectedTask = allTasks.find((task) => task.id === selectedTaskId);
  const today = formatInTimeZone(new Date(), "Asia/Shanghai", "yyyy-MM-dd");
  const dueDate = (value: string | null) => value ? formatInTimeZone(value, "Asia/Shanghai", "yyyy-MM-dd") : null;
  const todayTasks = allTasks.filter((task) => !task.isCompleted && dueDate(task.dueAt) === today);
  const overdueTasks = allTasks
    .filter((task) => !task.isCompleted && task.dueAt && dueDate(task.dueAt)! < today)
    .sort((a, b) => (a.dueAt ?? "").localeCompare(b.dueAt ?? ""));
  const doneTasks = allTasks.filter((task) => task.isCompleted);
  const counts = {
    today: todayTasks.length,
    overdue: overdueTasks.length
  };
  const hour = Number(formatInTimeZone(new Date(), "Asia/Shanghai", "H"));
  const greeting = hour < 11 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const upcomingTasks = allTasks.filter((task) => !task.isCompleted && (!task.dueAt || dueDate(task.dueAt)! > today));
  const showActive = activeFilter !== "done";
  const showDone = activeFilter !== "active";
  const todayDueAt = fromZonedTime(`${today}T09:00:00`, "Asia/Shanghai").toISOString();

  return (
    <section className="page-stack ios-dashboard editorial-dashboard" style={{
      "--art-desktop": `url("${import.meta.env.BASE_URL}art/hero-desktop.avif")`,
      "--art-skyline": `url("${import.meta.env.BASE_URL}art/gothic-architecture.avif")`
    } as React.CSSProperties}>
      <section className="editorial-backdrop" aria-label="中世纪旗手主题美术背景">
        <picture className="editorial-art-picture">
          <source media="(max-width: 760px)" srcSet={`${import.meta.env.BASE_URL}art/hero-mobile.avif`} type="image/avif"/>
          <img className="editorial-character" src={`${import.meta.env.BASE_URL}art/hero-mobile.avif`}
            alt="" loading="eager" decoding="async" fetchPriority="high" />
        </picture>
        <span className="editorial-art-credit" aria-hidden="true">FORTITUDE · FOCUS · FORWARD</span>
      </section>
      <div className="editorial-main">
        <header className="editorial-heading">
          <div className="editorial-brandline">
            <span className="hero-overline"><FleurDeLis size={17}/> HERMES / DAILY JOURNAL</span>
            <h1>首页</h1>
          </div>
          <div className="editorial-quote">
            <h2 className="editorial-salutation">{greeting}</h2><span>专注是对理想的忠诚。</span>
            <p>Discipline today, a greater tomorrow.</p>
            <HeraldicDivider/>
          </div>
          <div className="editorial-date">
            <strong>{formatInTimeZone(new Date(), "Asia/Shanghai", "dd")}</strong>
            <div><span>{formatInTimeZone(new Date(), "Asia/Shanghai", "yyyy.MM")}</span>
            <span className="page-date">{formatInTimeZone(new Date(), "Asia/Shanghai", "M月d日 EEEE", { locale: zhCN })}</span></div>
          </div>
        </header>
        <section className="editorial-toolbar" aria-label="快速操作">
          <QuickAdd dueToday onEmpty={() => setCreateTaskOpen(true)}/>
          <div className="editorial-toolbar-actions">
            <button type="button" className="toolbar-create" onClick={() => setCreateTaskOpen(true)}><Plus size={17} aria-hidden="true"/>详细添加</button>
            <Link to="/contexts"><CalendarDays size={16} aria-hidden="true"/>情境</Link>
            <Link to="/ai"><Sparkles size={16} aria-hidden="true"/>AI 规划</Link>
          </div>
        </section>
        <div className="dashboard-layout">
          <section className="parchment-panel dashboard-task-board">
            <header className="board-heading">
              <div className="board-title">
                <FleurDeLis size={21} aria-hidden="true"/>
                <div><span className="board-eyebrow">TODAY'S ORDERS</span><h2>今日待办</h2></div>
                <span className="board-total">{counts.today + counts.overdue}</span>
              </div>
              <div className="task-filters" role="group" aria-label="任务状态筛选">
                {([
                  ["all","全部"],
                  ["active","进行中"],
                  ["done","已完成"]
                ] as const).map(([value,label]) => (
                  <button type="button" key={value} className={activeFilter === value ? "filter-active" : ""}
                    aria-pressed={activeFilter === value} onClick={() => setActiveFilter(value)}>{label}</button>
                ))}
              </div>
            </header>
            {showActive && overdueTasks.length > 0 ? (
              <section className="dashboard-section dashboard-overdue" aria-label="逾期待处理">
                <div className="dashboard-section-heading"><h2>逾期待处理</h2><span>{counts.overdue} 件</span></div>
                <TaskList tasks={overdueTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
              </section>
            ) : null}
            {showActive ? (
              <section className="dashboard-section dashboard-focus">
                <div className="dashboard-section-heading"><h2>今日重点</h2><span className="section-count">{todayTasks.length} 项</span></div>
                {tasks.isError ? (
                  <div className="dashboard-empty" role="alert">任务加载失败。<button type="button" className="text-retry-button" onClick={() => void tasks.refetch()}>重试</button></div>
                ) : tasks.isLoading || contexts.isLoading ? <p>正在读取待办…</p> : todayTasks.length ? (
                  <TaskList tasks={todayTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
                ) : <p className="dashboard-empty">今天尚未安排任务。点击上方输入框添加第一件事。</p>}
              </section>
            ) : null}
            {showActive && upcomingTasks.length ? (
              <section className="dashboard-section dashboard-upcoming">
                <div className="dashboard-section-heading"><h2>接下来</h2><span className="section-count">{upcomingTasks.length} 项</span></div>
                <TaskList tasks={upcomingTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
              </section>
            ) : null}
            {showDone ? (
              <section className="dashboard-section dashboard-done">
                <div className="dashboard-section-heading"><h2>已完成</h2><span className="section-count">{doneTasks.length} 项</span></div>
                {doneTasks.length ? <TaskList tasks={doneTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/> :
                  <p className="dashboard-empty">完成任务后，它们会记录在这里。</p>}
              </section>
            ) : null}
            <button type="button" className="board-add-link" onClick={() => setCreateTaskOpen(true)}><Plus size={19}/> 添加详细任务</button>
          </section>
          <aside className="dashboard-side-column">
            <section className="contexts-mini">
              <div className="side-card-heading"><h2>情境入口</h2><Link to="/contexts">全部 <ChevronRight size={13}/></Link></div>
              <div className="context-strip">
                {(contexts.data ?? []).slice(0, 4).map((context) => (
                  <Link key={context.id} className="context-entry" to={`/contexts/${context.id}`}>
                    <span className="context-entry-icon" style={{ color: context.color }}><ContextIcon name={context.icon} size={17}/></span>
                    <strong>{context.name}</strong><small>{context.incompleteCount} 项</small>
                    <ChevronRight aria-hidden="true" size={14}/>
                  </Link>
                ))}
                {!contexts.isLoading && !contexts.data?.length ? <Link className="context-entry context-entry-empty" to="/contexts">创建第一个情境</Link> : null}
              </div>
            </section>
            <Link className="ai-teaser" to="/ai"><Sparkles size={18}/><div><strong>AI 任务规划</strong><span>把目标拆解成行动</span></div><ArrowUpRight size={17}/></Link>
          </aside>
        </div>
        <footer className="editorial-footer">DISCIPLINE CREATES FREEDOM <FleurDeLis size={13}/> HERMES TODO</footer>
      </div>
      {selectedTask ? <TaskDetail task={selectedTask} contexts={contexts.data ?? []} onClose={() => setSelectedTaskId(undefined)}/> : null}
      {createTaskOpen ? <TaskCreateDialog contexts={contexts.data ?? []} initialDueAt={todayDueAt} onClose={() => setCreateTaskOpen(false)}/> : null}
    </section>
  );
}
