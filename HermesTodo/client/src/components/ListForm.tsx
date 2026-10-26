import { useState, type FormEvent } from "react";
import { MedievalCrest, canonicalCrestName } from "./MedievalCrest";
import type { ListRecord } from "../hooks/useLists";

const icons = [
  {value:"lion",label:"金狮"}, {value:"fleur",label:"百合花"},
  {value:"compass",label:"罗盘"}, {value:"tree",label:"生命树"},
  {value:"book",label:"典籍"}, {value:"swords",label:"双剑"},
  {value:"crown",label:"王冠"}, {value:"scroll",label:"羽笔卷轴"}
];
const colors = ["#E09890", "#CEB068", "#9AB898", "#8CAABA", "#C0A8C8", "#C89870", "#E8B898", "#90B8A8"];

export function ListForm({
  list, pending, onSubmit, onCancel
}: {
  list?: ListRecord;
  pending?: boolean;
  onSubmit(input: { name: string; icon: string; color: string }): void;
  onCancel(): void;
}) {
  const [name,setName]=useState(list?.name ?? "");
  const [icon,setIcon]=useState(canonicalCrestName(list?.icon ?? "compass"));
  const [color,setColor]=useState(list?.color ?? "#8CAABA");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(name.trim()) onSubmit({name:name.trim(),icon,color});
  }

  return <div className="dialog-backdrop" role="presentation">
    <section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="list-form-title">
      <div className="dialog-heading"><h2 id="list-form-title">{list ? "编辑清单" : "新建清单"}</h2><button type="button" aria-label="关闭" onClick={onCancel}>×</button></div>
      <form className="stacked-form" onSubmit={submit}>
        <label>清单名称<input value={name} onChange={(e)=>setName(e.target.value)} maxLength={40} autoFocus placeholder="例如：出国旅行"/></label>
        <div className="context-crest-field">
          <div className="context-crest-label" id="list-crest-picker-label">选择清单纹章</div>
          <div className="heraldic-icon-picker" role="group" aria-labelledby="list-crest-picker-label">
            {icons.map(({value,label})=><button type="button" className="heraldic-icon-choice" key={value}
              aria-label={label} aria-pressed={icon===value} onClick={()=>setIcon(canonicalCrestName(value))}>
              <MedievalCrest name={value} size={45}/><span>{label}</span>
            </button>)}
          </div>
        </div>
        <fieldset><legend>颜色</legend><div className="color-options">{colors.map((value)=><label key={value} style={{backgroundColor:value}}>
          <input type="radio" name="list-color" value={value} checked={color===value} onChange={()=>setColor(value)}/><span className="sr-only">{value}</span>
        </label>)}</div></fieldset>
        <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onCancel}>取消</button>
          <button type="submit" className="primary-button" disabled={pending||!name.trim()}>{list ? "保存" : "创建清单"}</button></div>
      </form>
    </section>
  </div>;
}
