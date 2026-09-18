"use client";

import { useState } from "react";

type SortableListProps<T extends { id: string }> = {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Itens travados não podem ser arrastados nem receber outro item no lugar. */
  isLocked?: (item: T) => boolean;
  label: string;
};

function move<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Reordenação por arrastar (desktop) e por botões ↑ ↓ (teclado e toque). */
export function SortableList<T extends { id: string }>({ items, onReorder, renderItem, isLocked, label }: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function shift(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length || isLocked?.(items[target])) return;
    onReorder(move(items, index, target));
  }

  return (
    <ul className="adm-sortable" aria-label={label}>
      {items.map((item, index) => {
        const locked = isLocked?.(item) ?? false;

        return (
          <li
            key={item.id}
            className="adm-sortable-item"
            data-dragging={dragIndex === index}
            data-over={overIndex === index && dragIndex !== index}
            draggable={!locked}
            onDragStart={(event) => {
              setDragIndex(index);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => {
              if (dragIndex === null || locked) return;
              event.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex !== null && dragIndex !== index && !locked) onReorder(move(items, dragIndex, index));
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
          >
            <span className="adm-sortable-handle" aria-hidden="true" title={locked ? "Posição fixa" : "Arraste para reordenar"}>
              {locked ? "•" : "☰"}
            </span>

            <div className="adm-sortable-body">{renderItem(item, index)}</div>

            {!locked && (
              <div className="adm-sortable-arrows">
                <button type="button" aria-label="Mover para cima" disabled={index === 0} onClick={() => shift(index, -1)}>
                  ↑
                </button>
                <button type="button" aria-label="Mover para baixo" disabled={index === items.length - 1} onClick={() => shift(index, 1)}>
                  ↓
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
