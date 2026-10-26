import { Link } from "react-router-dom";
import { MedievalCrest } from "./MedievalCrest";
import type { ListRecord } from "../hooks/useLists";

export function ListCard({
  list, dragging, onEdit, onDelete, onCopy, onComplete, onDragStart, onDragOver, onDrop, onDragEnd
}: {
  list: ListRecord;
  dragging?: boolean;
  onEdit(): void;
  onDelete(): void;
  onCopy(): void;
  onComplete(): void;
  onDragStart(): void;
  onDragOver(): void;
  onDrop(): void;
  onDragEnd(): void;
}) {
  return (
    <li className={`context-card list-card${dragging ? " list-card-dragging" : ""}`}
      style={{ "--context-color": list.color } as React.CSSProperties}
      onDragOver={(event)=>{event.preventDefault(); onDragOver();}}
      onDrop={(event)=>{event.preventDefault(); onDrop();}}>
      <Link className="context-card-link" to={`/lists/${list.id}`}>
        <span className="context-card-top">
          <span className="context-icon"><MedievalCrest name={list.icon} size={48}/></span>
          <strong>{list.sceneCount}</strong>
        </span>
        <span className="context-name">{list.name}</span>
        <span className="context-count">{list.sceneCount} 个场景 · {list.incompleteCount} 件待办</span>
      </Link>
      <div className="context-card-actions list-card-actions" aria-label={`${list.name} 清单操作`}>
        <button type="button" className="list-text-action list-drag-handle" draggable
          aria-label={`移动 ${list.name}`} title="按住拖动排序"
          onDragStart={(event)=>{event.stopPropagation(); onDragStart();}}
          onDragEnd={(event)=>{event.stopPropagation(); onDragEnd();}}>移动</button>
        <button type="button" className="list-text-action" aria-label={`编辑 ${list.name}`} onClick={onEdit}>编辑</button>
        <button type="button" className="list-text-action list-delete-action" aria-label={`删除 ${list.name}`} onClick={onDelete}>删除</button>
        <button type="button" className="list-text-action" aria-label={`复制 ${list.name}`} onClick={onCopy}>复制</button>
        <button type="button" className="list-text-action list-complete-action" aria-label={`一键勾选 ${list.name}`}
          disabled={list.incompleteCount === 0} onClick={onComplete}>一键勾选</button>
      </div>
    </li>
  );
}
