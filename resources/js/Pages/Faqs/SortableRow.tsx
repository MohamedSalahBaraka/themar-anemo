// resources/js/Pages/Faqs/SortableRow.tsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Table } from "antd";
import { useDndContext } from "@dnd-kit/core";

interface SortableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    "data-row-key": string;
}

export const SortableRow: React.FC<SortableRowProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
        over,
    } = useSortable({
        id: props["data-row-key"],
    });

    const { active } = useDndContext();
    const isActiveDrag = active?.id === props["data-row-key"];

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? "none" : transition,
        cursor: isActiveDrag ? "grabbing" : "grab",
        ...(isDragging
            ? {
                  position: "relative",
                  zIndex: 9999,
                  background: "#fafafa",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  opacity: 0.9,
              }
            : {}),
        ...(isOver
            ? {
                  borderBottom:
                      over?.id !== props["data-row-key"]
                          ? "2px dashed #1890ff"
                          : undefined,
              }
            : {}),
    };

    return (
        <tr
            {...props}
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            {props.children}
            {isDragging && (
                <td
                    colSpan={React.Children.count(props.children)}
                    style={{
                        padding: 0,
                        backgroundColor: "rgba(24, 144, 255, 0.1)",
                    }}
                />
            )}
        </tr>
    );
};
