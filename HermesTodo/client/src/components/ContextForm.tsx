import { useState, type FormEvent } from "react";
import { HeraldicIcon } from "./HeraldicIcon";

import type { ContextRecord } from "../hooks/useContexts";

const icons = [
  {value:"folder",label:"卷轴"}, {value:"briefcase",label:"双剑"}, {value:"suitcase",label:"罗盘"},
  {value:"house",label:"城堡"}, {value:"shopping-cart",label:"钱袋"}, {value:"book-open",label:"典籍"},
  {value:"dumbbell",label:"战斧"}, {value:"film",label:"竖琴"}, {value:"heart",label:"誓约"},
  {value:"sparkles",label:"星辉"}
];
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
  const [icon, setIcon] = useState(context?.icon ?? icons[0]!.value);
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
          <div className="context-crest-field"><div className="context-crest-label" id="crest-picker-label">选择清单纹章</div>
  <div className="heraldic-icon-picker" role="group" aria-labelledby="crest-picker-label">
    {icons.map(({value,label}) => <button type="button" className="heraldic-icon-choice"
      key={value} aria-label={label} aria-pressed={icon===value} onClick={() => setIcon(value)}>
      <HeraldicIcon name={value} size={35}/><span>{label}</span>
    </button>)}
  </div>
</div>
          <fieldset><legend>颜色</legend><div className="color-options">{colors.map((value) => <label key={value} style={{ backgroundColor: value }}><input type="radio" name="context-color" value={value} checked={color === value} onChange={() => setColor(value)} /><span className="sr-only">{value}</span></label>)}</div></fieldset>
          <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>取消</button><button type="submit" className="primary-button" disabled={pending || !name.trim()}>{context ? "保存" : "创建清单"}</button></div>
        </form>
      </section>
    </div>
  );
}
