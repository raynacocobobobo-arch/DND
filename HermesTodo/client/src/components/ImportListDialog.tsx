import { useState, type FormEvent } from "react";

export function ImportListDialog({ loading, onImport, onCancel }: { loading: boolean; onImport(raw: string, contextHint: string): void; onCancel(): void }) {
  const [raw, setRaw] = useState("");
  const [contextHint, setContextHint] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (raw.trim()) onImport(raw.trim(), contextHint.trim());
  }
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="form-dialog import-dialog" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <div className="dialog-heading"><h2 id="import-title">DeepSeek 导入清单</h2><button type="button" aria-label="关闭" onClick={onCancel}>×</button></div>
        <p>粘贴攻略、会议纪要、项目计划或多行清单。DeepSeek 会整理成候选待办，确认后再写入 HermesTodo。</p>
        <form className="stacked-form" onSubmit={submit}>
          <label>情境名称（可选）<input value={contextHint} onChange={(event) => setContextHint(event.target.value)} maxLength={40} placeholder="例如：欧洲旅行（可留空让 DeepSeek 判断）" /></label>
          <label>粘贴清单<textarea value={raw} onChange={(event) => setRaw(event.target.value)} rows={12} /></label>
          <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>取消</button><button type="submit" className="primary-button compact-button" disabled={loading || !raw.trim()}>{loading ? "DeepSeek 解析中…" : "交给 DeepSeek 解析"}</button></div>
        </form>
      </section>
    </div>
  );
}
