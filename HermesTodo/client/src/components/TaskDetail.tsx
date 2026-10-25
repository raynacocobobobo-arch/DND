import { useState, type FormEvent } from "react";

import type { ContextRecord } from "../hooks/useContexts";
import { useCreateTask, useDeleteTask, useUpdateTask, type TaskInput, type TaskRecord } from "../hooks/useTasks";
import { ConfirmDialog } from "./ConfirmDialog";
import { TaskForm } from "./TaskForm";

export function TaskDetail({ task, contexts, onClose }: { task: TaskRecord; contexts: ContextRecord[]; onClose(): void }) {
  const update = useUpdateTask();
  const create = useCreateTask();
  const remove = useDeleteTask();
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function addSubtask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = subtaskTitle.trim();
    if (!title) return;
    void create.mutateAsync({ title, parentTaskId: task.id }).then(() => setSubtaskTitle(""));
  }

  function save(input: TaskInput) {
    void update.mutateAsync({ id: task.id, ...input }).then(onClose);
  }

  return (
    <div className="dialog-backdrop task-detail-backdrop" role="presentation">
      <section className="form-dialog task-detail" role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
        <div className="dialog-heading"><h2 id="task-detail-title">任务详情</h2><button type="button" aria-label="关闭" onClick={onClose}>×</button></div>
        <TaskForm task={task} contexts={contexts} pending={update.isPending} onSave={save} />
        <section className="subtasks-section" aria-labelledby="subtasks-title">
          <h3 id="subtasks-title">子任务</h3>
          {task.subtasks.length ? <ul>{task.subtasks.map((subtask) => <li key={subtask.id}>{subtask.title}</li>)}</ul> : <p>还没有子任务</p>}
          <form className="subtask-add" onSubmit={addSubtask}>
            <label className="sr-only" htmlFor="new-subtask">新增子任务</label>
            <input id="new-subtask" value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} placeholder="拆成更小的一步…" />
            <button type="submit" disabled={!subtaskTitle.trim() || create.isPending}>添加子任务</button>
          </form>
        </section>
        <button type="button" className="text-danger-button" onClick={() => setConfirmDelete(true)}>删除任务</button>
      </section>
      {confirmDelete ? <ConfirmDialog title="删除任务？" message={task.subtasks.length ? "这个任务和它的子任务也会一并删除。" : "这个任务删除后无法恢复。"} pending={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={() => void remove.mutateAsync(task.id).then(onClose)} /> : null}
    </div>
  );
}
