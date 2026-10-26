import { HeraldicIcon } from "./HeraldicIcon";
import { Link } from "react-router-dom";

import type { ContextRecord } from "../hooks/useContexts";
import { ContextIcon } from "./ContextIcon";

export function ContextCard({ context, onEdit, onCopy, onDelete }: { context: ContextRecord; onEdit(): void; onCopy(): void; onDelete(): void }) {
  return (
    <li className="context-card" style={{ "--context-color": context.color } as React.CSSProperties}>
      <Link className="context-card-link" to={`/contexts/${context.id}`}>
        <span className="context-card-top">
          <span className="context-icon"><ContextIcon name={context.icon} size={48} /></span>
          <strong>{context.incompleteCount}</strong>
        </span>
        <span className="context-name">{context.name}</span>
        <span className="context-count">未完成任务</span>
      </Link>
      <div className="context-card-actions">
        <button type="button" aria-label={`编辑 ${context.name}`} onClick={onEdit}><HeraldicIcon name="edit" size={23}/></button>
        <button type="button" aria-label={`复制 ${context.name}`} onClick={onCopy}><HeraldicIcon name="copy" size={23}/></button>
        <button type="button" aria-label={`删除 ${context.name}`} onClick={onDelete}><HeraldicIcon name="trash" size={23}/></button>
        <span className="context-chevron" aria-hidden="true"><HeraldicIcon name="arrow" size={19}/></span>
      </div>
    </li>
  );
}
