import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task, Status } from "../types";
import { COLUMN_LABELS } from "../types";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
    id: Status;
    tasks: Task[];
    onDeleteTask: (id: string) => void;
    onEditTask: (task: Task) => void;
}

const COLUMN_STYLES: Record<Status, {
    bg: string;
    text: string;
    dot: string;
    border: string;
    badge: string;
    scrollbarThumb: string;
}> = {
    backlog: {
        bg: "bg-slate-50",
        text: "text-slate-700",
        dot: "bg-slate-400",
        border: "border-slate-200",
        badge: "bg-slate-200 text-slate-800",
        scrollbarThumb: "[&::-webkit-scrollbar-thumb]:bg-slate-100",
    },
    todo: {
        bg: "bg-slate-50",
        text: "text-blue-900",
        dot: "bg-blue-500",
        border: "border-blue-200",
        badge: "bg-blue-100 text-blue-900",
        scrollbarThumb: "[&::-webkit-scrollbar-thumb]:bg-blue-100",
    },
    "in-progress": {
        bg: "bg-slate-50",
        text: "text-orange-800",
        dot: "bg-orange-500",
        border: "border-orange-200",
        badge: "bg-orange-100 text-orange-900",
        scrollbarThumb: "[&::-webkit-scrollbar-thumb]:bg-orange-100",
    },
    done: {
        bg: "bg-slate-50",
        text: "text-emerald-900",
        dot: "bg-emerald-500",
        border: "border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700",
        scrollbarThumb: "[&::-webkit-scrollbar-thumb]:bg-emerald-100",
    },
};

export function Column({ id, tasks, onDeleteTask, onEditTask }: ColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    const styles = COLUMN_STYLES[id];

    return (
        <div className={`flex flex-col h-full w-80 min-w-80 rounded-2xl border shadow-inner ${styles.bg} ${styles.border}`}>
            {/* Header */}
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                    <h2 className={`uppercase font-bold text-xs tracking-wide ${styles.text}`}>
                        {COLUMN_LABELS[id]}
                    </h2>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm ${styles.badge}`}>
                    {tasks.length}
                </span>
            </div>

            {/* Tasks Container */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-3 pt-0 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${styles.scrollbarThumb}`}
            >
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-3">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onDelete={onDeleteTask}
                                onEdit={onEditTask}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}

