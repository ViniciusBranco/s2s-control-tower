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

export function Column({ id, tasks, onDeleteTask, onEditTask }: ColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col h-full w-80 min-w-80 bg-gray-50/50 rounded-xl border border-gray-200/60">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/50 rounded-t-xl backdrop-blur-sm">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                    {COLUMN_LABELS[id]}
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </h2>
            </div>

            <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
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
