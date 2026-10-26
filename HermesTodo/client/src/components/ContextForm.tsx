import { useState, type FormEvent } from "react";

import type { ContextRecord } from "../hooks/useContexts";

const icons = ["folder", "briefcase", "suitcase", "house", "shopping-cart", "book-open", "dumbbell"];
const colors = ["#E09890", "#CEB068", "#9AB898", "#8CAABA", "#C0A8C8", "#C89870", "#E8B898", "#90B8A8"];

export function ContextForm({
  context,
  pending,
  onSubmit,
  onCancel
}: {
  context?: ContextRecord;
  pending?: boolean;
  onSubmit(input: { name: string; icon: string; color: string }): void;
  onCancel(): void;
}) {
  const [name, setName] = useState(context?.name ?? "");
  const [icon, setIcon] = useState(context?.icon ?? icons[0]!);
  const [color, setColor] = useState(context?.color ?? "#8CAABA");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim()) onSubmit({ name: name.trim(), icon, color });
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="context-form-title">
        <div className="dialog-heading"><h2 id="context-form-title">{context ? "编辑清单" : "新建清单"}</h2><button type="button" aria-label="关闭" onClick={onCancel}>×</button></div>
        <form className="stacked-form" onSubmit={submit}>
          <label>清单名称<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} autoFocus /></label>
          <label>图标<select value={icon} onChange={(event) => setIcon(event.target.value)}>{icons.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <fieldset><legend>颜色</legend><div className="color-options">{colors.map((value) => <label key={value} style={{ backgroundColor: value }}><input type="radio" name="context-color" value={value} checked={color === value} onChange={() => setColor(value)} /><span className="sr-only">{value}</span></label>)}</div></fieldset>
          <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>取消</button><button type="submit" className="primary-button" disabled={pending || !name.trim()}>{context ? "保存" : "创建清单"}</button></div>
        </form>
      </section>
    </div>
  );
}
