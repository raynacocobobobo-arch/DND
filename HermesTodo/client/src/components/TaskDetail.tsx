import { useState, type FormEvent } from "react";

import type { ContextRecord } from "../hooks/useContexts";
import { useCreateTask, useDeleteTask, useToggleTask, useUpdateTask, type TaskInput, type TaskRecord } from "../hooks/useTasks";
import { ConfirmDialog } from "./ConfirmDialog";
import { TaskForm } from "./TaskForm";

export function TaskDetail({ task, contexts, onClose }: { task: TaskRecord; contexts: ContextRecord[]; onClose(): void }) {
  const update = useUpdateTask();
  const create = useCreateTask();
  const remove = useDeleteTask();
  const toggleSubtask = useToggleTask();
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  function handleError(reason: unknown) {
    setError(reason instanceof Error ? reason.message : "操作失败，请稍后重试");
  }

  async function addSubtask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = subtaskTitle.trim();
    if (!title) return;
    setError("");
    try {
      await create.mutateAsync({ title, parentTaskId: task.id });
      setSubtaskTitle("");
    } catch (reason) {
      handleError(reason);
    }
  }

  function save(input: TaskInput) {
    setError("");
    void update.mutateAsync({ id: task.id, ...input }).then(onClose).catch(handleError);
  }

  function setSubtaskCompleted(id: string) {
    setError("");
    void toggleSubtask.mutateAsync(id).catch(handleError);
  }

  function deleteTask() {
    setError("");
    void remove.mutateAsync(task.id).then(onClose).catch((reason: unknown) => {
      setConfirmDelete(false);
      handleError(reason);
    });
  }

  return (
    <div className="dialog-backdrop task-detail-backdrop" role="presentation">
      <section className="form-dialog task-detail" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
        <div className="dialog-heading"><h2 id="task-detail-title">任务详情</h2><button type="button" aria-label="关闭" onClick={onClose}>×</button></div>
        <TaskForm task={task} contexts={contexts} pending={update.isPending} onSave={save} />
        {error ? <p className="form-error action-error" role="alert">{error}</p> : null}
        <section className="subtasks-section" aria-labelledby="subtasks-title">
          <h3 id="subtasks-title">子任务</h3>
          {task.subtasks.length ? (
            <ul className="subtask-list" aria-label="子任务清单">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className={`subtask-item${subtask.isCompleted ? " subtask-completed" : ""}`}>
                  <button type="button" className="task-check" disabled={toggleSubtask.isPending}
                    aria-label={`${subtask.isCompleted ? "重新打开" : "完成"}子任务 ${subtask.title}`}
                    aria-pressed={subtask.isCompleted} onClick={() => setSubtaskCompleted(subtask.id)}>
                    <span aria-hidden="true">{subtask.isCompleted ? "✓" : ""}</span>
                  </button>
                  <span>{subtask.title}</span>
                </li>
              ))}
            </ul>
          ) : <p>还没有子任务</p>}
          <form className="subtask-add" onSubmit={addSubtask}>
            <label className="sr-only" htmlFor="new-subtask">新增子任务</label>
            <input id="new-subtask" value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="拆成更小的一步…" />
            <button type="submit" disabled={!subtaskTitle.trim() || create.isPending}>添加子任务</button>
          </form>
        </section>
        <button type="button" className="text-danger-button" onClick={() => setConfirmDelete(true)}>删除任务</button>
      </section>
      {confirmDelete ? <ConfirmDialog title="删除任务？" message={task.subtasks.length ? "这个任务和它的子任务也会一并删除。" : "这个任务删除后无法恢复。"} pending={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={deleteTask} /> : null}
    </div>
  );
}
