import { useEffect, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
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
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = `scene-actions-${list.id}`;

  useEffect(() => {
    if (!moreOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!moreRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  function runAction(action: () => void) {
    setMoreOpen(false);
    action();
  }

  return (
    <li className={`context-card list-card${dragging ? " list-card-dragging" : ""}${moreOpen ? " list-card-menu-open" : ""}`}
      onDragOver={(event)=>{event.preventDefault(); onDragOver();}}
      onDrop={(event)=>{event.preventDefault(); onDrop();}}>
      <Link className="context-card-link" to={`/lists/${list.id}`}>
        <span className="context-card-top">
          <span className="context-icon"><MedievalCrest name={list.icon} size={48}/></span>
          <strong>{list.sceneCount}</strong>
        </span>
        <span className="context-name">{list.name}</span>
        <span className="context-count">{list.sceneCount} 个分类 · {list.incompleteCount} 件待办</span>
      </Link>
      <div className="context-card-actions list-card-actions" aria-label={`${list.name} 场景操作`}>
        <button type="button" className="list-text-action list-drag-handle" draggable
          aria-label={`移动 ${list.name}`} title="按住拖动排序"
          onDragStart={(event)=>{event.stopPropagation(); setMoreOpen(false); onDragStart();}}
          onDragEnd={(event)=>{event.stopPropagation(); onDragEnd();}}>移动</button>
        <button type="button" className="list-text-action" aria-label={`编辑 ${list.name}`} onClick={onEdit}>编辑</button>
        <div className="list-card-more" ref={moreRef}>
          <button type="button" className="list-text-action list-more-trigger"
            ref={triggerRef} aria-label={`更多操作 ${list.name}`} aria-expanded={moreOpen}
            aria-controls={menuId} onClick={() => setMoreOpen(current => !current)}>
            <Ellipsis size={17} strokeWidth={1.8} aria-hidden="true"/>
            <span>更多</span>
          </button>
          {moreOpen ? <div id={menuId} className="list-card-menu" role="group" aria-label={`${list.name} 更多场景操作`}>
            <button type="button" onClick={() => runAction(onCopy)}>复制场景内容</button>
            <button type="button" disabled={list.taskCount === 0}
              onClick={() => runAction(onComplete)}>一键勾选</button>
            <button type="button" className="list-menu-danger" onClick={() => runAction(onDelete)}>删除场景</button>
          </div> : null}
        </div>
      </div>
    </li>
  );
}
