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
        <div className="dialog-heading"><h2 id="import-title">导入长清单</h2><button type="button" aria-label="关闭" onClick={onCancel}>×</button></div>
        <p>可以粘贴攻略、物品表或多行文本，分类、数量和备注会尽量保留。</p>
        <form className="stacked-form" onSubmit={submit}>
          <label>情境名称（可选）<input value={contextHint} onChange={(event) => setContextHint(event.target.value)} maxLength={40} placeholder="例如：欧洲旅行" /></label>
          <label>粘贴清单<textarea value={raw} onChange={(event) => setRaw(event.target.value)} rows={12} /></label>
          <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>取消</button><button type="submit" className="primary-button compact-button" disabled={loading || !raw.trim()}>{loading ? "解析中…" : "解析清单"}</button></div>
        </form>
      </section>
    </div>
  );
}
