import { useState } from "react";
import { apiRequest } from "../api/client";

type TransferContext = { id:string; name:string };
type TransferTask = {
  id:string; title:string; notes:string; priority:string; dueAt:string|null;
  isCompleted:boolean; contextId:string|null; parentTaskId:string|null;
};
type TransferPayload = {
  format:"hermestodo-transfer-v1";
  exportedAt:string;
  contexts:TransferContext[];
  tasks:TransferTask[];
};

function toMarkdown(payload: TransferPayload): string {
  const contextById = new Map(payload.contexts.map((item) => [item.id, item.name]));
  const grouped = new Map<string, TransferTask[]>();
  for (const task of payload.tasks.filter((item) => !item.parentTaskId)) {
    const name = task.contextId ? contextById.get(task.contextId) ?? "未分类" : "收集箱";
    const list = grouped.get(name) ?? [];
    list.push(task); grouped.set(name, list);
  }
  const lines = ["# HermesTodo 清单", "", "> 可直接粘贴给 ChatGPT / DeepSeek 继续整理。", ""];
  for (const [name, tasks] of grouped) {
    lines.push("## " + name);
    for (const task of tasks) {
      lines.push(`- [${task.isCompleted ? "x" : " "}] ${task.title}`);
      if (task.priority && task.priority !== "medium") lines.push(`  - 优先级：${task.priority}`);
      if (task.dueAt) lines.push(`  - 截止：${task.dueAt}`);
      if (task.notes) lines.push(`  - 备注：${task.notes.replace(/\n/g," ")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function DataExchangeDialog({ onClose, onImported }: { onClose():void; onImported():void }) {
  const [raw,setRaw]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  async function getExport() {
    return apiRequest<TransferPayload>("/api/data/export");
  }
  async function copyMarkdown() {
    setBusy(true); setMessage("");
    try {
      const payload=await getExport();
      await navigator.clipboard.writeText(toMarkdown(payload));
      setMessage("已复制 Markdown，可直接粘贴给 ChatGPT。");
    } catch(e) { setMessage(e instanceof Error ? e.message : "导出失败"); }
    finally { setBusy(false); }
  }
  async function downloadJson() {
    setBusy(true); setMessage("");
    try {
      const payload=await getExport();
      const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url; a.download=`HermesTodo-${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      setMessage("JSON 已导出。");
    } catch(e) { setMessage(e instanceof Error ? e.message : "导出失败"); }
    finally { setBusy(false); }
  }
  async function importJson() {
    setBusy(true); setMessage("");
    try {
      const payload=JSON.parse(raw);
      const result=await apiRequest<{createdContexts:number;createdTasks:number;skippedTasks:number}>("/api/data/import",{
        method:"POST",body:JSON.stringify({payload})
      });
      setMessage(`已导入 ${result.createdTasks} 个任务，新增 ${result.createdContexts} 个清单，跳过重复 ${result.skippedTasks} 项。`);
      onImported();
    } catch(e) { setMessage(e instanceof Error ? e.message : "JSON 导入失败"); }
    finally { setBusy(false); }
  }

  return <div className="dialog-backdrop" role="presentation">
    <section className="form-dialog exchange-dialog" role="dialog" aria-modal="true" aria-labelledby="exchange-title">
      <div className="dialog-heading"><h2 id="exchange-title">ChatGPT / AI 清单交换</h2><button type="button" aria-label="关闭" onClick={onClose}>×</button></div>
      <p>导出 Markdown 可直接粘贴给 ChatGPT；JSON 用于完整备份、迁移和未来的 ChatGPT 连接器。</p>
      <div className="exchange-actions">
        <button type="button" className="secondary-button" disabled={busy} onClick={() => void copyMarkdown()}>复制 Markdown</button>
        <button type="button" className="secondary-button" disabled={busy} onClick={() => void downloadJson()}>下载 JSON</button>
      </div>
      <label className="exchange-import-label">导入 HermesTodo JSON
        <textarea rows={9} value={raw} onChange={(e)=>setRaw(e.target.value)} placeholder='粘贴 format 为 "hermestodo-transfer-v1" 的 JSON'/>
      </label>
      <div className="dialog-actions">
        <button type="button" className="secondary-button" onClick={onClose}>关闭</button>
        <button type="button" className="primary-button compact-button" disabled={busy||!raw.trim()} onClick={() => void importJson()}>
          {busy ? "处理中…" : "导入 JSON"}
        </button>
      </div>
      {message ? <p className="success-message" role="status">{message}</p> : null}
    </section>
  </div>;
}
