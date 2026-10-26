import { Link } from "react-router-dom";
import { MedievalCrest } from "./MedievalCrest";
import { HeraldicIcon } from "./HeraldicIcon";
import type { ListRecord } from "../hooks/useLists";

export function ListCard({
  list, dragging, onEdit, onDragStart, onDragOver, onDrop, onDragEnd
}: {
  list: ListRecord;
  dragging?: boolean;
  onEdit(): void;
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
      <div className="context-card-actions list-card-actions">
        <button type="button" className="list-drag-handle" draggable
          aria-label={`拖动排序 ${list.name}`}
          title="拖动排序"
          onDragStart={(event)=>{event.stopPropagation(); onDragStart();}}
          onDragEnd={(event)=>{event.stopPropagation(); onDragEnd();}}><HeraldicIcon name="drag" size={21}/></button>
        <button type="button" aria-label={`编辑 ${list.name}`} onClick={onEdit}><HeraldicIcon name="edit" size={23}/></button>
        <span className="context-chevron" aria-hidden="true"><HeraldicIcon name="arrow" size={19}/></span>
      </div>
    </li>
  );
}
