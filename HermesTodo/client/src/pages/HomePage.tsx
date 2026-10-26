import { zhCN } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { HeraldicIcon } from "../components/HeraldicIcon";
import { Link } from "react-router-dom";

import { ContextIcon } from "../components/ContextIcon";
import { FleurDeLis } from "../components/HeraldicArt";
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
  // Home is an inbox; tasks assigned to a context belong only to that context.
  const tasks = useTasks({ scope: "inbox", sort: "createdAt" });
  const allTasks = tasks.data ?? [];
  const selectedTask = allTasks.find((task) => task.id === selectedTaskId);
  const pendingTasks = allTasks.filter((task) => !task.isCompleted);
  const doneTasks = allTasks.filter((task) => task.isCompleted);
  const hour = Number(formatInTimeZone(new Date(), "Asia/Shanghai", "H"));
  const greeting = hour < 11 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  const showActive = activeFilter !== "done";
  const showDone = activeFilter !== "active";

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
      <div className="editorial-main v7-manuscript">
        <header className="v7-masthead">
          <div className="v7-masthead-label"><FleurDeLis size={16} aria-hidden="true"/> HERMES · THE DAILY CHRONICLE</div>
          <span className="v7-masthead-date">{formatInTimeZone(new Date(), "Asia/Shanghai", "yyyy · MM · dd")}</span>
        </header>
        <section className="v7-intro" aria-label="今日序言">
          <div className="v7-intro-copy">
            <span className="v7-kicker">CHAPTER I · THE PRESENT</span>
            <h1>{greeting}<span className="v7-intro-punctuation">。</span></h1>
            <p>把想做的事，写下来。<br/>剩下的，一件件完成。</p>
          </div>
          <div className="v7-intro-mark" aria-hidden="true"><HeraldicIcon name="quill" size={41}/><span>AD ASTRA</span></div>
        </section>
        <section className="v7-capture" aria-label="记录待办">
          <div className="v7-capture-caption"><span>01</span> 写下下一件事 <small>THE NEXT THING</small></div>
          <div className="v7-capture-row">
            <QuickAdd onEmpty={() => setCreateTaskOpen(true)}/>
            <button type="button" className="v7-details-button" onClick={() => setCreateTaskOpen(true)}><HeraldicIcon name="add" size={22}/> 更多选项</button>
          </div>
        </section>
        <div className="dashboard-layout v7-desk">
          <section className="parchment-panel dashboard-task-board v7-ledger">
            <header className="board-heading">
              <div className="board-title">
                <FleurDeLis size={21} aria-hidden="true"/>
                <div><span className="board-eyebrow">CHAPTER II · THE LIST</span><h2>我的待办</h2></div>
                <span className="board-total">{pendingTasks.length}</span>
              </div>
              <div className="task-filters" role="group" aria-label="任务状态筛选">
                {([
                  ["all","全部"],
                  ["active","未完成"],
                  ["done","已完成"]
                ] as const).map(([value,label]) => (
                  <button type="button" key={value} className={activeFilter === value ? "filter-active" : ""}
                    aria-pressed={activeFilter === value} onClick={() => setActiveFilter(value)}>{label}</button>
                ))}
              </div>
            </header>
            <p className="inbox-help">这里收集尚未分类的待办；已归入清单的任务可以在「清单」中查看。</p>
            {showActive ? (
              <section className="dashboard-section dashboard-focus" aria-label="未完成任务">
                <div className="dashboard-section-heading"><h2>未完成</h2><span className="section-count">{pendingTasks.length} 项</span></div>
                {tasks.isError ? (
                  <div className="dashboard-empty" role="alert">任务加载失败。<button type="button" className="text-retry-button" onClick={() => void tasks.refetch()}>重试</button></div>
                ) : tasks.isLoading || contexts.isLoading ? <p>正在读取待办…</p> : pendingTasks.length ? (
                  <TaskList tasks={pendingTasks} contexts={contexts.data ?? []} onOpen={(task) => setSelectedTaskId(task.id)}/>
                ) : <p className="dashboard-empty">收集箱是空的。直接记下一件事，或者进入清单查看分类任务。</p>}
              </section>
            ) : null}
            {showDone ? (
              <section className="dashboard-section dashboard-done">
                <div className="dashboard-section-heading"><h2>已完成</h2><span className="section-count">{doneTasks.length} 项</span></div>
                {doneTasks.length ? <TaskList tasks={doneTasks} contexts={contexts.data ?? []} expandCompleted onOpen={(task) => setSelectedTaskId(task.id)}/> :
                  <p className="dashboard-empty">完成任务后，它们会记录在这里。</p>}
              </section>
            ) : null}
            <button type="button" className="board-add-link" onClick={() => setCreateTaskOpen(true)}><HeraldicIcon name="add" size={22}/> 添加详细任务</button>
          </section>
          <aside className="dashboard-side-column">
            <section className="contexts-mini v7-index">
              <div className="side-card-heading"><h2>清单目录</h2><Link to="/">全部 <HeraldicIcon name="arrow" size={17}/></Link></div>
              <div className="context-strip">
                {(contexts.data ?? []).slice(0, 4).map((context) => (
                  <Link key={context.id} className="context-entry" to={`/contexts/${context.id}`}>
                    <span className="context-entry-icon" style={{ color: context.color }}><ContextIcon name={context.icon} size={17}/></span>
                    <strong>{context.name}</strong><small>{context.incompleteCount} 项</small>
                    <HeraldicIcon name="arrow" size={18}/>
                  </Link>
                ))}
                {!contexts.isLoading && !contexts.data?.length ? <Link className="context-entry context-entry-empty" to="/">创建第一个清单</Link> : null}
              </div>
            </section>
            <Link className="ai-teaser v7-ai-note" to="/ai"><HeraldicIcon name="star" size={22}/><div><strong>智识顾问</strong><span>把目标拆解成行动</span></div><HeraldicIcon name="arrow" size={20}/></Link>
          </aside>
        </div>
        <footer className="editorial-footer">FINIS CORONAT OPUS <FleurDeLis size={13}/> HERMES TODO</footer>
      </div>
      {selectedTask ? <TaskDetail task={selectedTask} contexts={contexts.data ?? []} onClose={() => setSelectedTaskId(undefined)}/> : null}
      {createTaskOpen ? <TaskCreateDialog contexts={contexts.data ?? []} allowContextSelection={false} onClose={() => setCreateTaskOpen(false)}/> : null}
    </section>
  );
}
